/**
 * Lexical content walker with paragraph-level batching.
 *
 * Payload Posts.content is Lexical JSON (`{ root: { children: [...] } }`).
 * For translation, we walk the tree and rewrite the `text` field of every
 * `text` node to its target-language rendering. The original tree shape
 * (formatting bits, links, nested lists, custom blocks) is preserved.
 *
 * ── v2: paragraph-level batching ─────────────────────────────────────────
 *
 * The v1 walker translated each text node IN ISOLATION. That worked for
 * plain paragraphs but produced broken grammar when a sentence was split
 * across multiple text nodes by inline code, links, or formatted spans.
 * Example: `The cleanest defense is to stop reading <code>window.innerWidth</code>
 * for layout decisions.` becomes 3 text nodes. Each fragment translated
 * standalone produced "위해입니다" / mangled word order / occasional
 * hallucination of words from sibling fragments.
 *
 * v2 collects all inline descendants of each paragraph-like container
 * (`paragraph` / `heading` / `quote` / `listitem`) in tree order, builds a
 * single string with placeholder tokens (⟪0⟫, ⟪1⟫, ...) substituted for
 * preserve-verbatim items (inline code, untranslatable symbol runs),
 * translates the whole passage in one API call, then redistributes the
 * translated text back into the original text nodes by splitting the
 * model output on the placeholders.
 *
 * Benefits:
 *   - Full-sentence context → correct grammar, no fragment endings
 *   - Target-language word order can move placeholders within the sentence
 *     (CJK SOV vs English SVO) without breaking the layout
 *   - Cheaper: one Anthropic call per paragraph instead of N per text node
 *
 * Fallback: if the model fails to preserve all placeholders (rare with
 * the placeholder-aware content prompt), translateBatch falls back to
 * per-item translation (v1 behavior) so we never corrupt the tree shape.
 *
 * Nested block-level children (e.g. `list` inside a `listitem`) are
 * deferred during batch collection and recursed into separately after
 * the parent's batch is translated.
 *
 * ── v3: cross-paragraph reference context ────────────────────────────────
 *
 * v2 still translated each paragraph in isolation, so a demonstrative that
 * points at an EARLIER paragraph ("these two layers", "the reverse", "this
 * approach") could not be resolved — the model never saw the referent and
 * left a bare 이것/그것 that reads as a dangling reference in Korean. v3
 * threads the source text of the immediately preceding container into the
 * next container's translation as reference-only context, so the model can
 * name the referent explicitly. This matters far more for Korean / Japanese
 * (which need an explicit subject where English elides it) than for English.
 *
 * Limits unchanged from v1:
 *   - Custom block fields (editorialMedia.caption / editorialTable.cells /
 *     qnaList.items[].text / videoEmbed.caption / rawHtml.label) are not
 *     traversed — they are not part of the Lexical text-node graph.
 */

export interface LexicalRoot {
  root: LexicalNode
  [k: string]: unknown
}

export interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number | string
  fields?: { [k: string]: unknown }
  [k: string]: unknown
}

export type TranslateText = (
  input: string,
  /**
   * Source text of the preceding paragraph-like container, passed as
   * reference-only context so the model can resolve cross-paragraph
   * references (demonstratives, elided subjects). Never translated/emitted.
   */
  context?: string,
  /**
   * Field kind hint. 'content' (default) for body passages; 'label' for
   * standalone block fields (table cells/headers, captions, qna text) so the
   * model uses the short-label prompt and does not refuse a terse cell.
   */
  kind?: 'content' | 'label',
) => Promise<{
  translated: string
  inputTokens: number
  outputTokens: number
}>

export interface WalkerUsage {
  inputTokens: number
  outputTokens: number
  /** Number of translatable text nodes that received a translated value. */
  nodes: number
}

// ── Constants ─────────────────────────────────────────────────────────────

/** Paragraph-like containers. Each becomes the root of a translation batch. */
const BATCH_CONTAINER_TYPES = new Set([
  'paragraph',
  'heading',
  'quote',
  'listitem',
])

/**
 * Block-level types encountered while collecting items inside a batch root.
 * When we see one of these as a descendant, we DON'T flatten its text into
 * the parent batch — we defer it for separate top-level recursion (so e.g.
 * a `list` nested inside a `listitem` gets its own batches per listitem).
 */
const BLOCK_CHILD_TYPES = new Set([
  'paragraph',
  'heading',
  'quote',
  'listitem',
  'list',
])

const PLACEHOLDER_OPEN = '⟪'
const PLACEHOLDER_CLOSE = '⟫'

/** Lexical text-format bitfield: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code. */
const LEXICAL_FORMAT_CODE = 16
const LEXICAL_FORMAT_BOLD = 1

function isBoldFormatted(node: LexicalNode): boolean {
  if (node.type !== 'text') return false
  const fmt = node.format
  if (typeof fmt !== 'number') return false
  return (fmt & LEXICAL_FORMAT_BOLD) === LEXICAL_FORMAT_BOLD
}

/**
 * The evergreen TL;DR convention: the lead paragraph starts with a bold
 * "TL;DR" text node followed by a ":" prefix on the next text node. This is
 * LOCALE-AGNOSTIC by design — the DOM keeps the literal "TL;DR:" in every
 * language so AI crawlers extract it and PostDetail.tsx can visually hide it.
 * When translating we must therefore NEVER translate the "TL;DR" label and
 * MUST preserve the leading colon, otherwise the frontend hide breaks and the
 * label leaks visibly (2026-05-20 ko incident).
 */
function isTldrParagraph(node: LexicalNode): boolean {
  if (node.type !== 'paragraph' || !Array.isArray(node.children)) return false
  const k0 = node.children[0]
  const k1 = node.children[1]
  if (!k0 || k0.type !== 'text' || !isBoldFormatted(k0) || k0.text !== 'TL;DR') {
    return false
  }
  return !!k1 && k1.type === 'text' && typeof k1.text === 'string' && /^\s*:/.test(k1.text)
}

function asNodeArray(v: unknown): LexicalNode[] {
  return Array.isArray(v) ? (v as LexicalNode[]) : []
}

/**
 * Translate one plain string field (block caption / cell / qna text / label).
 * Skips empty / untranslatable values. Updates usage like a text node.
 */
async function translateField(
  value: unknown,
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<unknown> {
  if (typeof value !== 'string' || value.trim().length === 0) return value
  if (isUntranslatable(value)) return value
  // Block fields (table cells/headers, captions, qna text) are standalone
  // labels — use the 'label' prompt so the model translates a terse cell
  // directly instead of refusing it for "lack of context".
  const r = await translate(value, undefined, 'label')
  usage.inputTokens += r.inputTokens
  usage.outputTokens += r.outputTokens
  usage.nodes += 1
  if (!r.translated || r.translated.length === 0) return value
  return preserveBoundaryWhitespace(value, stripStrayMarkers(r.translated))
}

/**
 * Translate the text-bearing fields of a Payload BlocksFeature node
 * (`{ type:'block', fields:{ blockType, ... } }`). Per policy (2026-05-20):
 * translate editorialTable / qnaList / caption / label text, but NEVER
 * codeBlock.code or rawHtml.html. Unknown / structured blocks (pricingCards,
 * featureCards, codeBlock) are left untouched.
 */
async function translateBlockFields(
  node: LexicalNode,
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<void> {
  const f = node.fields as Record<string, unknown> | undefined
  if (!f) return
  const bt = f.blockType

  if (bt === 'editorialTable') {
    f.caption = await translateField(f.caption, translate, usage)
    for (const h of asNodeArray(f.headers)) {
      if (h && typeof h.text === 'string') h.text = (await translateField(h.text, translate, usage)) as string
    }
    for (const row of asNodeArray(f.rows)) {
      for (const cell of asNodeArray((row as Record<string, unknown>)?.cells)) {
        if (cell && typeof cell.text === 'string') {
          cell.text = (await translateField(cell.text, translate, usage)) as string
        }
      }
    }
    return
  }

  if (bt === 'qnaList') {
    for (const it of asNodeArray(f.items)) {
      if (it && typeof it.text === 'string') {
        it.text = (await translateField(it.text, translate, usage)) as string
      }
    }
    return
  }

  if (bt === 'editorialMedia') {
    f.caption = await translateField(f.caption, translate, usage)
    f.alt = await translateField(f.alt, translate, usage)
    return
  }

  if (bt === 'videoEmbed') {
    f.caption = await translateField(f.caption, translate, usage)
    return
  }

  if (bt === 'rawHtml') {
    // Translate the optional label only — NEVER the html source (policy).
    f.label = await translateField(f.label, translate, usage)
    return
  }

  // codeBlock / pricingCards / featureCards / unknown → leave untouched.
}

// ── Public entry point ───────────────────────────────────────────────────

export async function translateLexicalRoot(
  source: LexicalRoot,
  translate: TranslateText,
): Promise<{ translated: LexicalRoot; usage: WalkerUsage }> {
  const cloned = structuredClone(source) as LexicalRoot
  const usage: WalkerUsage = { inputTokens: 0, outputTokens: 0, nodes: 0 }
  const xref: CrossRefContext = { previous: null }
  if (cloned.root) {
    await walkNode(cloned.root, translate, usage, xref)
  }
  return { translated: cloned, usage }
}

/**
 * Blocks-only pass: translate ONLY Payload block fields (table cells/headers/
 * caption, qna text, captions, rawHtml label), leaving every paragraph/text
 * node untouched. Used to remediate already-translated posts whose prose may
 * carry manual edits — we must not re-translate the body, only the blocks the
 * original walker skipped (2026-05-20 origin table fix).
 */
export async function translateLexicalBlocksOnly(
  source: LexicalRoot,
  translate: TranslateText,
): Promise<{ translated: LexicalRoot; usage: WalkerUsage }> {
  const cloned = structuredClone(source) as LexicalRoot
  const usage: WalkerUsage = { inputTokens: 0, outputTokens: 0, nodes: 0 }
  const recurse = async (node: LexicalNode): Promise<void> => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'block') {
      await translateBlockFields(node, translate, usage)
      return
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) await recurse(child)
    }
  }
  if (cloned.root) await recurse(cloned.root)
  return { translated: cloned, usage }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * True when a text node has the `code` format bit set (inline code).
 * Inline code should never be translated — preserve verbatim via placeholder.
 */
function isCodeFormatted(node: LexicalNode): boolean {
  if (node.type !== 'text') return false
  const fmt = node.format
  if (typeof fmt !== 'number') return false
  return (fmt & LEXICAL_FORMAT_CODE) === LEXICAL_FORMAT_CODE
}

/**
 * Returns true when the input text has no natural-language content worth
 * sending to a translation model — markdown table separators, symbol runs,
 * very short non-letter tokens. Such fragments are preserved verbatim and
 * represented as placeholders within their parent batch.
 */
function isUntranslatable(raw: string): boolean {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return true
  if (/^\|[\s\-:|]+\|?\s*$/.test(trimmed)) return true
  if (/^[^\p{L}\p{N}]+$/u.test(trimmed)) return true
  if (trimmed.length <= 3 && !/\p{L}/u.test(trimmed)) return true
  return false
}

interface BatchItem {
  /** The original text node — `text` may be mutated in place after translation. */
  node: LexicalNode
  /** Snapshot of the original text (in case we need to fall back / log). */
  original: string
  /**
   * 'translatable' → text contributes natural language to the batch.
   * 'preserve'     → text is inline code / symbol run; replaced by placeholder.
   */
  role: 'translatable' | 'preserve'
}

/**
 * Cross-paragraph reference context (v3). Threaded through the walk so each
 * paragraph-like container can be translated knowing the SOURCE TEXT of the
 * one immediately before it. The model uses this ONLY to resolve references
 * (demonstratives, elided subjects); it is never translated or emitted.
 */
interface CrossRefContext {
  /** Source text of the most recently translated container, null before the first. */
  previous: string | null
}

/**
 * Upper bound on reference-context length — keeps token cost bounded for
 * unusually long preceding paragraphs. The tail is kept because anaphora
 * usually points at the end of the prior passage.
 */
const MAX_CONTEXT_CHARS = 1000

/**
 * Plain source text of a batch (translatable + preserved items joined in
 * tree order), used as reference context for the NEXT container. Returns
 * null when the container carries no textual content.
 */
function batchSourceText(items: BatchItem[]): string | null {
  const joined = items.map((it) => it.original).join('').trim()
  if (joined.length === 0) return null
  return joined.length > MAX_CONTEXT_CHARS ? joined.slice(-MAX_CONTEXT_CHARS) : joined
}

/**
 * Walk inline descendants of a batch container, collecting text nodes (with
 * their role) and deferring nested block-level children for separate recursion.
 *
 * The walk is depth-first and preserves tree order — the resulting items
 * array reflects how text appears left-to-right in the rendered passage.
 */
function collectBatchItems(
  node: LexicalNode,
  items: BatchItem[],
  deferredBlocks: LexicalNode[],
  isRoot: boolean,
): void {
  if (node.type === 'text' && typeof node.text === 'string') {
    const raw = node.text
    if (raw.length === 0) return
    // Whitespace-only text nodes don't contribute meaningful content but
    // exist in the tree to maintain spacing. Leave them untouched — they
    // are not part of the batch.
    if (raw.trim().length === 0) return

    const role: BatchItem['role'] =
      isCodeFormatted(node) || isUntranslatable(raw) ? 'preserve' : 'translatable'
    items.push({ node, original: raw, role })
    return
  }

  // Nested block-level child — defer for separate recursion. We don't treat
  // the root container itself as deferred (otherwise we'd infinite-loop).
  if (!isRoot && BLOCK_CHILD_TYPES.has(node.type)) {
    deferredBlocks.push(node)
    return
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectBatchItems(child, items, deferredBlocks, false)
    }
  }
}

/**
 * Split a marker-delimited batch translation into per-item slots.
 *
 * Every item i is emitted into the batch with a leading `⟪i⟫` marker; item
 * i's slot is the text from its marker up to the next marker in OUTPUT order
 * (markers may be reordered by SOV target languages — each item still
 * receives one contiguous run). Any text before the first marker is folded
 * into that marker's slot.
 *
 * Returns `null` if any `⟪i⟫` is missing or appears more than once — that
 * signals the model broke the markers and the caller should fall back to
 * per-item translation.
 */
function splitBatchByMarkers(text: string, itemCount: number): string[] | null {
  const found: { index: number; at: number; end: number }[] = []
  for (let i = 0; i < itemCount; i++) {
    const marker = `${PLACEHOLDER_OPEN}${i}${PLACEHOLDER_CLOSE}`
    const at = text.indexOf(marker)
    if (at < 0) return null
    if (text.indexOf(marker, at + marker.length) >= 0) return null
    found.push({ index: i, at, end: at + marker.length })
  }
  found.sort((a, b) => a.at - b.at)
  const slots: string[] = new Array(itemCount).fill('')
  for (let p = 0; p < found.length; p++) {
    const nextAt = p + 1 < found.length ? found[p + 1].at : text.length
    slots[found[p].index] = text.substring(found[p].end, nextAt)
  }
  // Text before the first marker → fold into the slot that marker opens.
  if (found[0].at > 0) {
    slots[found[0].index] = text.substring(0, found[0].at) + slots[found[0].index]
  }
  return slots
}

/**
 * Restore the original leading/trailing whitespace pattern onto a translated
 * fragment. Language models routinely strip boundary whitespace when
 * translating short fragments — harmless for standalone paragraphs but
 * destructive in per-item / single-item modes where the fragment is part of
 * a larger paragraph (bold span + regular text, link + regular text, etc.):
 * stripping the leading space on "Google launched..." after a preceding
 * bold "Ranking." span produces rendered HTML "순위 매기기Google이..." with
 * no space (2026-05-21 AEO ko incident).
 *
 * Strategy: take the original's leading/trailing whitespace verbatim,
 * strip whatever leading/trailing whitespace the model emitted, and
 * sandwich the model's body between the originals. This guarantees the
 * boundary contract regardless of model behavior.
 */
/**
 * Remove stray ⟪N⟫ marker tokens from translated text. Real markers are
 * consumed as delimiters by splitBatchByMarkers; any that survive inside a
 * node's text are model noise (the model sometimes invents markers on
 * marker-free input, primed by the marker-heavy content prompt — 2026-05-23
 * AEO incident). They must never reach the rendered page.
 */
function stripStrayMarkers(text: string): string {
  if (!/⟪\d+⟫/.test(text)) return text
  // Removing a marker that sat between spaces leaves a double space — collapse
  // runs of spaces back to one (only touches text that actually had markers).
  return text.replace(/⟪\d+⟫/g, '').replace(/ {2,}/g, ' ')
}

function preserveBoundaryWhitespace(original: string, translated: string): string {
  if (translated.length === 0) return translated
  const trailingWs = original.match(/\s*$/)?.[0] ?? ''

  // Leading "joiner": a sentence-joining punctuation mark + whitespace at the
  // very start of the fragment. When a fragment sits right after an inline
  // span (bold / link) that ENDS a sentence, the fragment carries the joining
  // ". " — e.g. `<strong>…aggregators</strong>` + `. Cite the W3C spec …`.
  // The model routinely drops that leading ". " when translating the fragment
  // standalone, collapsing the two rendered spans into "…제외W3C" (2026-05-23
  // AEO ko incident). Re-apply the joiner when the model omitted it.
  const joinerMatch = original.match(/^\s*[.,;:!?]\s+/)
  if (joinerMatch) {
    const body = translated.replace(/^\s+|\s+$/g, '')
    const modelKeptJoiner = /^\s*[.,;:!?]\s/.test(translated)
    return (modelKeptJoiner ? '' : joinerMatch[0]) + body + trailingWs
  }

  const leadingWs = original.match(/^\s*/)?.[0] ?? ''
  const body = translated.replace(/^\s+|\s+$/g, '')
  return leadingWs + body + trailingWs
}

/**
 * Translate every translatable item individually (v1 behavior). Used as a
 * fallback when batching fails to preserve placeholders.
 */
async function translatePerItem(
  items: BatchItem[],
  translate: TranslateText,
  usage: WalkerUsage,
  context?: string,
): Promise<void> {
  for (const it of items) {
    if (it.role !== 'translatable') continue
    const result = await translate(it.original, context)
    it.node.text = preserveBoundaryWhitespace(it.original, stripStrayMarkers(result.translated))
    usage.inputTokens += result.inputTokens
    usage.outputTokens += result.outputTokens
    usage.nodes += 1
  }
}

/**
 * Detect a low-quality marker split worth one retry. Three signatures, all
 * seen with code-heavy / text-code-text passages (2026-05-23 p25 / p32):
 *  - an empty slot for a translatable item (a span got merged away);
 *  - one translatable slot's trimmed text wholly inside another's (the model
 *    translated the clause twice);
 *  - an inline-code identifier (10+ chars) leaked verbatim into a text slot.
 */
function hasQualityProblem(items: BatchItem[], slots: string[]): boolean {
  for (let i = 0; i < items.length; i++) {
    if (items[i].role === 'translatable' && slots[i].trim().length === 0) return true
  }
  const tIdx = items
    .map((_, i) => i)
    .filter((i) => items[i].role === 'translatable' && slots[i].trim().length >= 12)
  for (const a of tIdx) {
    for (const b of tIdx) {
      if (a !== b && slots[b].includes(slots[a].trim())) return true
    }
  }
  const codeIds = items
    .filter((it) => it.role === 'preserve')
    .map((it) => it.original.trim())
    .filter((t) => t.length >= 10)
  for (const id of codeIds) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].role === 'translatable' && slots[i].includes(id)) return true
    }
  }
  return false
}

/**
 * Translate a batch of items (all inline content of one paragraph-like
 * container) as a SINGLE coherent passage.
 *
 * Every item — translatable text, bold/linked spans, inline code — is emitted
 * with a leading `⟪i⟫` marker. The whole marked string goes to the model in
 * one call, so the model sees the entire sentence (correct grammar, no
 * hallucinated subjects, no fragments left untranslated) and only has to keep
 * the markers. The translation is then split back onto the original nodes by
 * marker. If the model drops a marker we fall back to per-item translation.
 */
async function translateBatch(
  items: BatchItem[],
  translate: TranslateText,
  usage: WalkerUsage,
  context?: string,
): Promise<void> {
  const translatableCount = items.filter((it) => it.role === 'translatable').length
  if (translatableCount === 0) return

  // Special case — single translatable item and nothing to preserve:
  // skip the placeholder machinery, translate directly. Even for a "single"
  // item, the text may carry leading/trailing whitespace from the source
  // (e.g. a fragment that sits next to a link in the parent paragraph) —
  // preserve that boundary whitespace to prevent inline-element collisions.
  if (items.length === 1 && items[0].role === 'translatable') {
    const result = await translate(items[0].original, context)
    items[0].node.text = preserveBoundaryWhitespace(
      items[0].original,
      stripStrayMarkers(result.translated),
    )
    usage.inputTokens += result.inputTokens
    usage.outputTokens += result.outputTokens
    usage.nodes += 1
    return
  }

  // Build the marked batch string: a leading ⟪i⟫ marker for EVERY item,
  // followed by the item's source text (preserve items — inline code — emit
  // their marker only; their content is reinserted verbatim from the node).
  // Marking every item means adjacent translatable spans (bold + text, link
  // text + text) are translated together as one sentence instead of being
  // split into isolated fragments — the v2 per-item fallback for that case
  // hallucinated subjects and left fragments untranslated (2026-05-23 AEO
  // ko incident).
  const batchParts: string[] = []
  for (let i = 0; i < items.length; i++) {
    batchParts.push(`${PLACEHOLDER_OPEN}${i}${PLACEHOLDER_CLOSE}`)
    if (items[i].role === 'translatable') batchParts.push(items[i].original)
  }
  const batchString = batchParts.join('')
  // Plain source of the whole passage — reference context for the per-item
  // fallback so even the degraded path sees the full sentence.
  const passageSource = items.map((it) => it.original).join('')

  // Up to 2 batch attempts. Translation is non-deterministic, so a retry
  // usually clears a transient marker / duplication / code-leak glitch.
  // Per-item is only a LAST resort (markers unrecoverable on both attempts):
  // per-item translation of sub-sentence fragments is itself low quality and
  // makes the model emit meta-commentary on tiny connective fragments
  // (2026-05-23 p25 incident — a code-heavy paragraph degraded that way).
  let chosen: string[] | null = null
  for (let attempt = 0; attempt < 2 && chosen === null; attempt++) {
    let translated: string
    try {
      const result = await translate(batchString, context)
      usage.inputTokens += result.inputTokens
      usage.outputTokens += result.outputTokens
      translated = result.translated
    } catch {
      continue // network/API error — retry, then per-item
    }
    const s = splitBatchByMarkers(translated, items.length)
    if (s === null) continue // markers broken — retry, then per-item
    const cleaned = s.map(stripStrayMarkers)
    // First attempt: retry once if the split has a quality problem. Last
    // attempt: accept the split regardless — a minor imperfection in a batch
    // result still beats the per-item commentary failure mode.
    if (attempt === 0 && hasQualityProblem(items, cleaned)) continue
    chosen = cleaned
  }

  if (chosen === null) {
    console.warn(
      `[lexicalWalker] batch markers unrecoverable after retry — per-item fallback. batch="${batchString.slice(0, 80)}..."`,
    )
    await translatePerItem(items, translate, usage, passageSource)
    return
  }

  // Redistribute the chosen slots onto the original nodes. The model placed
  // target-language spacing across the whole sentence, so each translatable
  // node takes its slot verbatim. Preserve items keep their original code text.
  for (let i = 0; i < items.length; i++) {
    if (items[i].role !== 'translatable') continue
    items[i].node.text = chosen[i]
    usage.nodes += 1
  }
}

// ── Tree walker ──────────────────────────────────────────────────────────

async function walkNode(
  node: LexicalNode,
  translate: TranslateText,
  usage: WalkerUsage,
  xref: CrossRefContext,
): Promise<void> {
  // Payload BlocksFeature node — translate its text-bearing fields (table
  // cells, qna, captions, label) but never code/html. Block nodes carry data
  // in `fields`, not `children`, so the generic recurse below would skip them.
  if (node.type === 'block') {
    await translateBlockFields(node, translate, usage)
    return
  }

  if (BATCH_CONTAINER_TYPES.has(node.type)) {
    // Lead TL;DR paragraph: keep the bold "TL;DR" label + leading ":" prefix
    // verbatim (locale-agnostic convention), translate only the answer.
    if (isTldrParagraph(node)) {
      const kids = node.children as LexicalNode[]
      const c1 = kids[1]
      const c1Text = typeof c1.text === 'string' ? c1.text : ''
      const prefix = c1Text.match(/^\s*:\s*/)?.[0] ?? ':'
      c1.text = c1Text.slice(prefix.length)

      const items: BatchItem[] = []
      const deferred: LexicalNode[] = []
      for (const child of kids.slice(1)) {
        collectBatchItems(child, items, deferred, false)
      }
      const containerSource = batchSourceText(items)
      await translateBatch(items, translate, usage, xref.previous ?? undefined)
      if (containerSource) xref.previous = containerSource
      for (const block of deferred) await walkNode(block, translate, usage, xref)

      // Re-attach the colon prefix to the (now translated) first answer node.
      c1.text = prefix + (typeof c1.text === 'string' ? c1.text : '')
      // kids[0] ("TL;DR", bold) intentionally left untouched.
      return
    }

    const items: BatchItem[] = []
    const deferredBlocks: LexicalNode[] = []
    collectBatchItems(node, items, deferredBlocks, true)

    const containerSource = batchSourceText(items)
    await translateBatch(items, translate, usage, xref.previous ?? undefined)
    if (containerSource) xref.previous = containerSource

    // Recurse into any block-level children that were deferred during
    // collection (e.g. a `list` nested inside a `listitem`).
    for (const block of deferredBlocks) {
      await walkNode(block, translate, usage, xref)
    }
    return
  }

  // Stray top-level text node (rare — usually root has block children).
  // Translate individually.
  if (node.type === 'text' && typeof node.text === 'string') {
    const raw = node.text
    if (
      raw.trim().length > 0 &&
      !isUntranslatable(raw) &&
      !isCodeFormatted(node)
    ) {
      const result = await translate(raw)
      node.text = preserveBoundaryWhitespace(raw, stripStrayMarkers(result.translated))
      usage.inputTokens += result.inputTokens
      usage.outputTokens += result.outputTokens
      usage.nodes += 1
    }
    return
  }

  // Container above the paragraph level (root, list) — recurse.
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await walkNode(child, translate, usage, xref)
    }
  }
}

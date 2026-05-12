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

export type TranslateText = (input: string) => Promise<{
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

// ── Public entry point ───────────────────────────────────────────────────

export async function translateLexicalRoot(
  source: LexicalRoot,
  translate: TranslateText,
): Promise<{ translated: LexicalRoot; usage: WalkerUsage }> {
  const cloned = structuredClone(source) as LexicalRoot
  const usage: WalkerUsage = { inputTokens: 0, outputTokens: 0, nodes: 0 }
  if (cloned.root) {
    await walkNode(cloned.root, translate, usage)
  }
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
 * Split translated text on `⟪idx⟫` placeholders. Returns N+1 fragments for
 * N placeholders (the text BEFORE, BETWEEN, and AFTER each marker).
 *
 * Returns `null` if any expected placeholder is missing — that signals the
 * model failed to preserve markers and the caller should fall back to
 * per-item translation.
 */
function splitByPlaceholders(
  text: string,
  preserveIndices: number[],
): string[] | null {
  const fragments: string[] = []
  let remaining = text
  for (const idx of preserveIndices) {
    const placeholder = `${PLACEHOLDER_OPEN}${idx}${PLACEHOLDER_CLOSE}`
    const pos = remaining.indexOf(placeholder)
    if (pos < 0) return null
    fragments.push(remaining.substring(0, pos))
    remaining = remaining.substring(pos + placeholder.length)
  }
  fragments.push(remaining)
  return fragments
}

/**
 * Translate every translatable item individually (v1 behavior). Used as a
 * fallback when batching fails to preserve placeholders.
 */
async function translatePerItem(
  items: BatchItem[],
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<void> {
  for (const it of items) {
    if (it.role !== 'translatable') continue
    const result = await translate(it.original)
    it.node.text = result.translated
    usage.inputTokens += result.inputTokens
    usage.outputTokens += result.outputTokens
    usage.nodes += 1
  }
}

/**
 * Translate a batch of items as a single passage. Substitutes placeholders
 * for preserve-role items, sends the merged string to the translator, then
 * redistributes the translated text back into translatable items by
 * splitting on placeholders.
 */
async function translateBatch(
  items: BatchItem[],
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<void> {
  const translatableCount = items.filter((it) => it.role === 'translatable').length
  if (translatableCount === 0) return

  // Special case — single translatable item and nothing to preserve:
  // skip the placeholder machinery, translate directly.
  if (items.length === 1 && items[0].role === 'translatable') {
    const result = await translate(items[0].original)
    items[0].node.text = result.translated
    usage.inputTokens += result.inputTokens
    usage.outputTokens += result.outputTokens
    usage.nodes += 1
    return
  }

  // Guard: when two translatable items sit adjacent (with no preserve
  // between them — happens with inline format runs like bold/italic spans,
  // or with link-wrapped text), there is no anchor to redistribute the
  // translated fragment between them. Fall back to per-item translation
  // for the whole batch in that case. The inline-code case (the primary
  // motivation for batching) is unaffected because code items sit between
  // translatable items.
  for (let i = 0; i < items.length - 1; i++) {
    if (items[i].role === 'translatable' && items[i + 1].role === 'translatable') {
      await translatePerItem(items, translate, usage)
      return
    }
  }

  // Build batch string with placeholders for preserve items, original text
  // for translatable items. Use the item's tree-order index as the
  // placeholder number so we can map fragments back to items.
  const batchParts: string[] = []
  const preserveIndices: number[] = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].role === 'preserve') {
      preserveIndices.push(i)
      batchParts.push(`${PLACEHOLDER_OPEN}${i}${PLACEHOLDER_CLOSE}`)
    } else {
      batchParts.push(items[i].original)
    }
  }
  const batchString = batchParts.join('')

  let result
  try {
    result = await translate(batchString)
  } catch {
    // Network / API failure during batch translate — fall back to per-item.
    await translatePerItem(items, translate, usage)
    return
  }
  usage.inputTokens += result.inputTokens
  usage.outputTokens += result.outputTokens

  const fragments = splitByPlaceholders(result.translated, preserveIndices)
  if (fragments === null) {
    // Model failed to preserve placeholders. Discard the batch usage cost
    // for the broken call (already recorded above) and translate per item.
    console.warn(
      `[lexicalWalker] placeholders missing from batch translation — falling back to per-item. batch="${batchString.slice(0, 80)}..."`,
    )
    await translatePerItem(items, translate, usage)
    return
  }

  // Assign fragments to translatable items in tree order. For each
  // preserve item we step past one fragment boundary; translatable items
  // receive the fragment for the current "slot" (number of placeholders
  // seen so far).
  let placeholdersSeen = 0
  for (const it of items) {
    if (it.role === 'preserve') {
      placeholdersSeen++
      continue
    }
    const fragIdx = placeholdersSeen
    const newText = fragments[fragIdx]
    // Defensive: if the model collapsed a translatable fragment to empty
    // while the source was non-empty, keep the source rather than wiping
    // the node. (Real empties would have been filtered earlier.)
    if (typeof newText === 'string' && newText.length > 0) {
      it.node.text = newText
    }
    usage.nodes += 1
  }
}

// ── Tree walker ──────────────────────────────────────────────────────────

async function walkNode(
  node: LexicalNode,
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<void> {
  if (BATCH_CONTAINER_TYPES.has(node.type)) {
    const items: BatchItem[] = []
    const deferredBlocks: LexicalNode[] = []
    collectBatchItems(node, items, deferredBlocks, true)

    await translateBatch(items, translate, usage)

    // Recurse into any block-level children that were deferred during
    // collection (e.g. a `list` nested inside a `listitem`).
    for (const block of deferredBlocks) {
      await walkNode(block, translate, usage)
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
      node.text = result.translated
      usage.inputTokens += result.inputTokens
      usage.outputTokens += result.outputTokens
      usage.nodes += 1
    }
    return
  }

  // Container above the paragraph level (root, list) — recurse.
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await walkNode(child, translate, usage)
    }
  }
}

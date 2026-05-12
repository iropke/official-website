/**
 * Claude Haiku 번역기
 *
 * 단일 문자열을 source locale → target locale 로 번역합니다.
 * - 모델: claude-haiku-4-5-20251001 (Anthropic Messages API)
 * - 호출 방식: Anthropic REST API 직접 호출 (SDK 의존성 없음)
 * - 환경 변수: ANTHROPIC_API_KEY
 *
 * iropke 지원 locale: src/i18n/locales.ts 의 LOCALES (20개) — EN 원본 기준
 *
 * 이 모듈은 뼈대만 작성된 상태이며, admin UI "Translate" 버튼(Task #5)과
 * 연결되는 시점은 Phase B-1 입니다. 현 단계에서는 title 한 필드만 지원하며
 * excerpt / content(lexical JSON) 는 Phase B 진입 시 fieldType 분기를 확장하며
 * 추가 예정.
 */

import { LOCALE_LABELS_EN, type Locale } from '@/i18n/locales'
import {
  renderExamples,
  renderGlossary,
  renderStyleGuide,
} from './promptContext'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

/**
 * Claude prompt 에 들어가는 언어명. LOCALE_LABELS_EN 와 거의 같지만 zh 만
 * 'Simplified Chinese' 로 명시 (모델이 zh-CN 변형을 정확히 산출하도록).
 */
const LOCALE_NAMES: Record<Locale, string> = {
  ...LOCALE_LABELS_EN,
  zh: 'Simplified Chinese',
}

export type SupportedLocale = Locale

export type FieldType = 'title' | 'excerpt' | 'metaTitle' | 'metaDescription' | 'content'

export interface TranslationRequest {
  /** 번역할 원문 */
  text: string
  /** 원문 언어 (기본 'ko') */
  sourceLocale: SupportedLocale
  /** 번역할 대상 언어 */
  targetLocale: SupportedLocale
  /**
   * 필드 유형 힌트. prompt 톤/길이 조절에 사용.
   * - title: 간결하고 임팩트 있는 제목 (줄바꿈 금지)
   * - excerpt: 2~3문장 요약
   * - metaTitle / metaDescription: SEO 메타
   */
  fieldType?: FieldType
  /** 선택: 문체/브랜드 용어 보존 지침 */
  brandGuideline?: string
}

export interface TranslationResult {
  translated: string
  model: string
  /** Anthropic 이 반환한 input/output 토큰 (요금/로깅용) */
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

const FIELD_HINTS: Record<FieldType, string> = {
  title:
    'This is a BLOG POST TITLE. Keep it concise, punchy, and editorial — do NOT add a period at the end, and never include line breaks or quote marks.',
  excerpt:
    'This is a 2–3 sentence article SUMMARY. Keep the tone calm and clear. Preserve sentence count when natural.',
  metaTitle:
    'This is an SEO meta title (under ~60 characters). Keep the key nouns and brand terms, no quotation marks.',
  metaDescription:
    'This is an SEO meta description (under ~155 characters). Make it informative and neutral.',
  content:
    'This is a body text passage from a Lexical rich-text node — typically a full paragraph, heading, list item, or quote. ' +
    'The passage MAY contain PLACEHOLDER TOKENS of the form ⟪0⟫, ⟪1⟫, ⟪2⟫, etc. ' +
    'Each placeholder represents an inline element (inline code, a symbol-only run, etc.) that exists in the source between text spans and MUST be preserved as-is so the system can re-insert the original element. ' +
    'CRITICAL RULES for placeholders: ' +
    '(a) every ⟪N⟫ in the source MUST appear in your output VERBATIM — exact same digits, exact same opening "⟪" and closing "⟫" characters, exact same count. Do not translate, transliterate, omit, duplicate, or renumber placeholders. ' +
    '(b) You MAY move a placeholder to a different position within the sentence if target-language word order requires it (e.g. Korean / Japanese / Chinese SOV may place an inline-code reference at a different position than English SVO). The system splits your output on the placeholders to redistribute fragments, so word order around them is your choice. ' +
    '(c) Do NOT insert spaces immediately adjacent to a placeholder unless the source had them there. ' +
    'Translate the natural-language text around the placeholders into a fluent, complete passage per the style guide. ' +
    'Preserve leading and trailing whitespace of the WHOLE passage exactly (if the source starts or ends with a space, your output must too). ' +
    'Do NOT add line breaks or quotation marks. ' +
    'If the passage is a markdown table separator (e.g. "|---|---|"), a label-only line, a sequence of symbols only, or otherwise has no translatable natural-language content, RETURN THE SOURCE VERBATIM. ' +
    'Never ask for clarification, never explain, never refuse — output only the translated or unchanged text.',
}

const DEFAULT_BRAND_RULE =
  'Brand rule: keep the brand name "Iropke" / "이롭게" unchanged. Preserve product names (NOVA, SAGE, LUMI, NIX) verbatim.'

const DOMAIN_CONTEXT =
  'Domain context: iropke is a software / product / design studio. Most source text refers to software development, web products, releases, and tools — interpret ambiguous vocabulary in that frame first.'

/**
 * Build the prompt as a (system, user) pair.
 *
 * The `system` block contains all stable per-locale × per-field content:
 * domain context, field hint, style guide, glossary, examples, brand rule,
 * closing instruction. It is identical across every call within a batch
 * operation (same source / target / field), which makes it eligible for
 * Anthropic prompt caching (cache_control: ephemeral). First call writes
 * the cache; subsequent calls within the 5-minute TTL hit the cache and
 * pay a fraction of the input-token cost.
 *
 * The `user` block contains only the variable source text — small, never
 * cached.
 */
function buildPrompts(req: TranslationRequest): { system: string; user: string } {
  const source = LOCALE_NAMES[req.sourceLocale]
  const target = LOCALE_NAMES[req.targetLocale]

  const hint = req.fieldType ? FIELD_HINTS[req.fieldType] : null
  const brand = req.brandGuideline ? `Brand rule: ${req.brandGuideline}` : DEFAULT_BRAND_RULE
  const styleBlock = renderStyleGuide(req.targetLocale)
  const glossaryBlock = renderGlossary(req.targetLocale)
  const examplesBlock = renderExamples(req.targetLocale)

  const systemSections: (string | null)[] = [
    `You are a professional editorial translator. Translate from ${source} into ${target}.`,
    DOMAIN_CONTEXT,
    hint,
    styleBlock,
    glossaryBlock,
    examplesBlock,
    brand,
    'Return ONLY the translated text. Do not include explanations, quotes, or any prefix like "Translation:".',
  ]
  const system = systemSections.filter((s): s is string => Boolean(s)).join('\n\n')

  const user = ['--- SOURCE ---', req.text, '--- END ---'].join('\n')

  return { system, user }
}

// ── Rate limiter ────────────────────────────────────────────────────────
//
// In-process sliding-window token bucket. Each translateWithClaude call
// reserves an estimated number of input tokens against a 60-second window;
// if the reservation would exceed the limit, the call sleeps until the
// oldest reservation in the window expires. After the API call returns,
// the reservation is corrected to actual usage (uncached + cache_read +
// cache_creation, all of which count toward Anthropic's TPM limit).
//
// Threshold: 45,000 tokens/min — 10% safety margin below the documented
// Tier 1 Haiku 4.5 limit of 50,000 input tokens/min.
//
// Caveat: state is per Node.js process. Serverless cold starts reset it.
// For iropke's single-operator admin Translate flow this is fine (one
// long-running request processes all paragraphs in sequence within one
// process). Concurrent requests across processes can still race against
// the Anthropic side limit; if that becomes common, replace with a
// Redis-backed counter or upgrade tier.

const RATE_LIMIT_TPM = 45_000
const RATE_LIMIT_WINDOW_MS = 60_000

interface CallReservation {
  /** Wall-clock at reservation time (ms). */
  at: number
  /** Tokens reserved or actual tokens used (after correction). */
  tokens: number
}

const callHistory: CallReservation[] = []

function pruneExpired(now: number): void {
  while (callHistory.length > 0 && now - callHistory[0].at >= RATE_LIMIT_WINDOW_MS) {
    callHistory.shift()
  }
}

function tokensInWindow(): number {
  return callHistory.reduce((sum, c) => sum + c.tokens, 0)
}

async function reserveTokensAndWait(estimated: number): Promise<CallReservation> {
  // Cap a single reservation to the full window if the prompt is bigger
  // than the window — we still proceed but log a warning (an over-limit
  // single prompt can't be paced away).
  if (estimated > RATE_LIMIT_TPM) {
    console.warn(
      `[translate] single prompt estimated at ${estimated} tokens exceeds window limit ${RATE_LIMIT_TPM} — likely 429`,
    )
  }
  while (true) {
    const now = Date.now()
    pruneExpired(now)
    const used = tokensInWindow()
    if (used + estimated <= RATE_LIMIT_TPM) {
      const reservation: CallReservation = { at: now, tokens: estimated }
      callHistory.push(reservation)
      return reservation
    }
    // Wait until the oldest reservation expires.
    const oldest = callHistory[0]
    const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldest.at) + 100
    if (waitMs <= 0) continue
    console.info(
      `[translate] TPM pacing — window ${used}/${RATE_LIMIT_TPM} tokens, sleeping ${waitMs}ms before next call (estimated ${estimated} tokens)`,
    )
    await new Promise((r) => setTimeout(r, waitMs))
  }
}

/** Rough token estimate from raw character count. ~3 chars/token covers a mix of ASCII and CJK. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3) + 50 // +50 for response overhead / instruction tokens
}

/**
 * 단일 텍스트를 번역합니다. 네트워크/모델 실패 시 Error throw.
 */
export async function translateWithClaude(
  req: TranslationRequest,
): Promise<TranslationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다. .env(.local) 에 등록하고 Vercel 환경변수에도 추가하세요.',
    )
  }

  if (!req.text || req.text.trim().length === 0) {
    // 빈 문자열은 그대로 반환 (API 호출 낭비 방지)
    return {
      translated: '',
      model: MODEL,
      usage: { inputTokens: 0, outputTokens: 0 },
    }
  }

  if (req.sourceLocale === req.targetLocale) {
    return {
      translated: req.text,
      model: MODEL,
      usage: { inputTokens: 0, outputTokens: 0 },
    }
  }

  const { system, user } = buildPrompts(req)

  // Reserve tokens against the in-process rate limit before issuing the
  // call. The estimate is conservative; we correct to actual after.
  const estimated = estimateTokens(system) + estimateTokens(user)
  const reservation = await reserveTokensAndWait(estimated)

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      // System block is marked for ephemeral caching. Anthropic caches the
      // tokens for 5 minutes; within an admin Translate batch all calls to
      // the same locale × field combination hit the cache (~10x cheaper
      // and ~85% faster). Below-threshold prompts are silently uncached.
      system: [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '<no body>')
    throw new Error(
      `Anthropic API ${response.status} ${response.statusText}: ${errText}`,
    )
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }

  // Correct the reservation to actual usage. All three input-token
  // variants count toward Anthropic's TPM rate limit (cache reads at a
  // discounted internal rate, but conservatively we record the full sum).
  const uncachedInput = data.usage?.input_tokens ?? 0
  const cacheCreation = data.usage?.cache_creation_input_tokens ?? 0
  const cacheRead = data.usage?.cache_read_input_tokens ?? 0
  const totalInput = uncachedInput + cacheCreation + cacheRead
  reservation.tokens = totalInput || estimated

  const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
  const translated = text.trim()

  if (!translated) {
    throw new Error('Anthropic API 가 빈 번역 결과를 반환했습니다.')
  }

  // Safety net: when the model refuses to translate (asks for clarification,
  // explains that the input is empty / table-only, etc.) it leaks meta text
  // into the field. Heuristic detection on the response → fall back to the
  // original source verbatim so the post body stays coherent.
  if (isRefusalResponse(translated, req.text)) {
    console.warn(
      `[translate] refusal detected for ${req.fieldType ?? 'unknown'} field — falling back to source verbatim. source="${req.text.slice(0, 60)}…" got="${translated.slice(0, 60)}…"`,
    )
    return {
      translated: req.text,
      model: MODEL,
      usage: {
        inputTokens: totalInput,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    }
  }

  return {
    translated,
    model: MODEL,
    usage: {
      inputTokens: totalInput,
      outputTokens: data.usage?.output_tokens ?? 0,
    },
  }
}

const REFUSAL_PATTERNS: readonly RegExp[] = [
  /I notice/i,
  /Could you (please )?provide/i,
  /please provide the (actual|english|source)/i,
  /I'?m ready to translate/i,
  /appears to be (empty|a table|a markdown)/i,
  /no (translatable|actual) (content|text)/i,
  /I cannot translate/i,
  /there is nothing to translate/i,
]

/**
 * Heuristic: detect when the model's response is a refusal/meta reply rather
 * than a translation. Triggers when (a) any known refusal phrase is present
 * AND (b) the response is meaningfully longer than the source (refusals are
 * typically 5–20× the source length).
 */
function isRefusalResponse(response: string, source: string): boolean {
  const hasMarker = REFUSAL_PATTERNS.some((p) => p.test(response))
  if (!hasMarker) return false
  // Don't false-positive when the source itself contains one of these phrases
  // (e.g. a doc that legitimately discusses refusals).
  return response.length > Math.max(60, source.length * 2)
}

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

function buildPrompt(req: TranslationRequest): string {
  const source = LOCALE_NAMES[req.sourceLocale]
  const target = LOCALE_NAMES[req.targetLocale]

  const fieldHints: Record<FieldType, string> = {
    title:
      'This is a BLOG POST TITLE. Keep it concise, punchy, and editorial — do NOT add a period at the end, and never include line breaks or quote marks.',
    excerpt:
      'This is a 2–3 sentence article SUMMARY. Keep the tone calm and clear. Preserve sentence count when natural.',
    metaTitle:
      'This is an SEO meta title (under ~60 characters). Keep the key nouns and brand terms, no quotation marks.',
    metaDescription:
      'This is an SEO meta description (under ~155 characters). Make it informative and neutral.',
    content:
      'This is a fragment of body text from a Lexical rich-text node. Translate it naturally; preserve any inline markup-like characters verbatim. Do NOT add line breaks or quotes. If the fragment is a markdown table separator (e.g. "|---|---|"), a label or column header with no full-sentence content, a sequence of symbols only, or otherwise has no translatable natural-language content, RETURN THE SOURCE VERBATIM. Never ask for clarification, never explain, never refuse — output only the translated or unchanged text.',
  }

  const hint = req.fieldType ? fieldHints[req.fieldType] : ''
  const brand = req.brandGuideline
    ? `Brand rule: ${req.brandGuideline}`
    : 'Brand rule: keep the brand name "Iropke" / "이롭게" unchanged. Preserve product names (NOVA, SAGE, LUMI, NIX) verbatim.'

  // Locale-scoped enrichment. Each section is omitted entirely when the
  // target locale has no entries — keeps prompts compact for locales we
  // haven't curated yet (currently EN→EN no-op only).
  const domainContext =
    'Domain context: iropke is a software / product / design studio. Most source text refers to software development, web products, releases, and tools — interpret ambiguous vocabulary in that frame first.'
  const styleBlock = renderStyleGuide(req.targetLocale)
  const glossaryBlock = renderGlossary(req.targetLocale)
  const examplesBlock = renderExamples(req.targetLocale)

  const sections: (string | null)[] = [
    `Translate the following ${source} text into ${target}.`,
    domainContext,
    hint || null,
    styleBlock,
    glossaryBlock,
    examplesBlock,
    brand,
    'Return ONLY the translated text. Do not include explanations, quotes, or any prefix like "Translation:".',
    '--- SOURCE ---',
    req.text,
    '--- END ---',
  ]

  return sections.filter((s): s is string => Boolean(s)).join('\n\n')
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

  const prompt = buildPrompt(req)

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
      messages: [{ role: 'user', content: prompt }],
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
    usage?: { input_tokens?: number; output_tokens?: number }
  }

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
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    }
  }

  return {
    translated,
    model: MODEL,
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
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

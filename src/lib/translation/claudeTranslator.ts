/**
 * Claude Haiku 번역기
 *
 * 단일 문자열을 source locale → target locale 로 번역합니다.
 * - 모델: claude-haiku-4-5-20251001 (Anthropic Messages API)
 * - 호출 방식: Anthropic REST API 직접 호출 (SDK 의존성 없음)
 * - 환경 변수: ANTHROPIC_API_KEY
 *
 * iropke 지원 locale: ko, en, es, ru, de, fr, zh, ar
 *
 * 이 모듈은 오늘 세션(2026-04-20)에 뼈대만 작성되었고, admin UI 의
 * "Translate from KO" 버튼(Task #5)과 연결되는 것은 다음 세션입니다.
 * 현 단계에서는 title 한 필드만 지원합니다. excerpt / content(lexical JSON) 는
 * 다음 세션에서 fieldType 분기를 확장하며 추가 예정.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

const LOCALE_NAMES: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  es: 'Spanish',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
  zh: 'Simplified Chinese',
  ar: 'Arabic',
}

export type SupportedLocale = keyof typeof LOCALE_NAMES | string

export type FieldType = 'title' | 'excerpt' | 'metaTitle' | 'metaDescription'

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
  const source = LOCALE_NAMES[req.sourceLocale] ?? req.sourceLocale
  const target = LOCALE_NAMES[req.targetLocale] ?? req.targetLocale

  const fieldHints: Record<FieldType, string> = {
    title:
      'This is a BLOG POST TITLE. Keep it concise, punchy, and editorial — do NOT add a period at the end, and never include line breaks or quote marks.',
    excerpt:
      'This is a 2–3 sentence article SUMMARY. Keep the tone calm and clear. Preserve sentence count when natural.',
    metaTitle:
      'This is an SEO meta title (under ~60 characters). Keep the key nouns and brand terms, no quotation marks.',
    metaDescription:
      'This is an SEO meta description (under ~155 characters). Make it informative and neutral.',
  }

  const hint = req.fieldType ? fieldHints[req.fieldType] : ''
  const brand = req.brandGuideline
    ? `\nBrand rule: ${req.brandGuideline}`
    : '\nBrand rule: keep the brand name "Iropke" / "이롭게" unchanged. Preserve product names (NOVA, SAGE, LUMI, NIX) verbatim.'

  return [
    `Translate the following ${source} text into ${target}.`,
    hint,
    brand,
    '',
    'Return ONLY the translated text. Do not include explanations, quotes, or any prefix like "Translation:".',
    '',
    '--- SOURCE ---',
    req.text,
    '--- END ---',
  ]
    .filter(Boolean)
    .join('\n')
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

  return {
    translated,
    model: MODEL,
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    },
  }
}

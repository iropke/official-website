/**
 * POST /api/translate
 *
 * Posts 컬렉션 콘텐츠를 KO 기준으로 지정 locale 들로 번역하여 저장합니다.
 * admin UI "Translate from KO" 버튼(Task #5) 이 이 endpoint 를 호출합니다.
 *
 * 요청 body:
 * {
 *   postId: string,
 *   targetLocales: string[],            // 예: ['en', 'ar']
 *   fields?: Array<'title'>             // 기본: ['title']
 * }
 *
 * 오늘 세션(2026-04-20)은 title 필드 1종만 지원. 다음 세션에서 excerpt,
 * metaTitle, metaDescription, content(lexical JSON) 순으로 확장.
 *
 * 응답 예시:
 * {
 *   success: true,
 *   results: {
 *     en: { title: "..." },
 *     ar: { title: "..." }
 *   },
 *   usage: { inputTokens: 120, outputTokens: 80 }
 * }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import {
  translateWithClaude,
  type FieldType,
} from '@/lib/translation/claudeTranslator'
import type { Post } from '@/payload-types'

// Payload 가 요구하는 literal locale union. payload-types.ts 의
// `locale: 'ko' | 'en' | ...` 와 동일하게 유지해야 `payload.update` 호출 시
// overload matching 이 성공합니다.
type Locale = 'ko' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'zh' | 'ar'

const SOURCE_LOCALE: Locale = 'ko'
const DEFAULT_FIELDS: FieldType[] = ['title']
const ALLOWED_TARGET_LOCALES = new Set<Locale>([
  'en',
  'es',
  'ru',
  'de',
  'fr',
  'zh',
  'ar',
])

// Set<Locale>.has 는 인자로 Locale 을 요구하지만 사용자 입력은 임의 string.
// 일반 string 을 Locale 로 좁히는 type guard.
function isAllowedLocale(l: string): l is Locale {
  return (ALLOWED_TARGET_LOCALES as Set<string>).has(l)
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // ── 1. 인증 (Payload admin 세션) ─────────────────────────────
    const headersList = await getHeaders()
    const { user } = await payload.auth({ headers: headersList })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증 필요. Payload admin 로그인 상태에서 호출하세요.' },
        { status: 401 },
      )
    }

    // ── 2. 요청 body 파싱 ────────────────────────────────────────
    const body = (await req.json().catch(() => null)) as {
      postId?: string
      targetLocales?: string[]
      fields?: FieldType[]
    } | null

    if (!body?.postId) {
      return NextResponse.json(
        { success: false, error: 'postId 누락.' },
        { status: 400 },
      )
    }

    const targetLocales: Locale[] = (body.targetLocales ?? []).filter(isAllowedLocale)
    if (targetLocales.length === 0) {
      return NextResponse.json(
        { success: false, error: 'targetLocales 가 비어있거나 지원되지 않는 언어만 포함.' },
        { status: 400 },
      )
    }

    const fields = body.fields?.length ? body.fields : DEFAULT_FIELDS

    // ── 3. KO 원본 조회 ──────────────────────────────────────────
    // Payload 가 반환하는 Post 타입은 index signature 가 없어 직접 Record<>
    // cast 가 막힙니다. `unknown` 경유로 two-step cast (`as unknown as ...`)
    // 하여 동적 필드 접근이 가능하도록 합니다 — 기존 프로젝트에서 FormData
    // cast 시도 동일 패턴을 씁니다.
    const sourceDoc = await payload.findByID({
      collection: 'posts',
      id: body.postId,
      locale: SOURCE_LOCALE,
      depth: 0,
    })

    if (!sourceDoc) {
      return NextResponse.json(
        { success: false, error: 'Post not found.' },
        { status: 404 },
      )
    }

    const source = sourceDoc as unknown as Record<string, unknown>

    // ── 4. 각 locale 별 번역 + 저장 ───────────────────────────────
    const results: Record<string, Record<string, string>> = {}
    let totalInput = 0
    let totalOutput = 0

    for (const locale of targetLocales) {
      const translated: Record<string, string> = {}

      for (const field of fields) {
        const raw = source[field]
        if (typeof raw !== 'string' || raw.trim().length === 0) continue

        const { translated: out, usage } = await translateWithClaude({
          text: raw,
          sourceLocale: SOURCE_LOCALE,
          targetLocale: locale,
          fieldType: field,
        })

        translated[field] = out
        totalInput += usage.inputTokens
        totalOutput += usage.outputTokens
      }

      if (Object.keys(translated).length > 0) {
        // `translated` 는 Record<string, string> 이지만 payload.update 는
        // Posts 스키마의 구조적 타입을 기대합니다. two-step cast (`as unknown as ...`)
        // 로 overlap 검사 우회 — 필드 이름은 Posts 스키마 존재 필드만 사용.
        await payload.update({
          collection: 'posts',
          id: body.postId,
          locale,
          data: translated as unknown as Partial<Post>,
        })
        results[locale] = translated
      }
    }

    return NextResponse.json({
      success: true,
      results,
      usage: { inputTokens: totalInput, outputTokens: totalOutput },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // Anthropic/Payload 오류는 서버 로그로 충분히 추적 가능하도록.
    console.error('[api/translate] error:', err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

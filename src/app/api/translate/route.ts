/**
 * POST /api/translate
 *
 * Posts 컬렉션 콘텐츠를 source locale 기준으로 지정 locale 들로 번역하여
 * 저장합니다. admin UI "Translate from EN" 버튼(Phase B-1) 이 이 endpoint 를
 * 호출합니다.
 *
 * v2 변경 (2026-04-26): 원본 locale 이 KO → EN 으로 전환됨 (CLAUDE.md §2).
 * v3 변경 (2026-05-08): 지원 필드 1종 → 5종 확장 + Lexical content 지원.
 * v4 변경 (2026-05-09): 8 locale → 20 locale (PR #18). target/source allowlist
 *                       모두 LOCALES 중앙 상수에서 자동 파생.
 *
 * 요청 body:
 * {
 *   postId: string,
 *   targetLocales: string[],          // 예: ['ko', 'es', 'ar']
 *   fields?: FieldType[],             // 기본: ['title', 'excerpt', 'metaTitle', 'metaDescription']
 *   sourceLocale?: 'en' | 'ko'        // 기본: 'en' (v2 정책 — 단, EN/KO 만 source 허용)
 * }
 *
 * 지원 필드 (`FieldType`):
 *   - title              (Posts.title)            텍스트
 *   - excerpt            (Posts.excerpt)          텍스트
 *   - metaTitle          (Posts.meta.metaTitle)   텍스트, 중첩 객체
 *   - metaDescription    (Posts.meta.metaDescription) 텍스트, 중첩 객체
 *   - content            (Posts.content)          Lexical JSON, walker 로 텍스트 노드 일괄 번역
 *
 * 응답 예시:
 * {
 *   success: true,
 *   results: {
 *     ko: { title: "...", excerpt: "...", meta: { metaTitle: "...", metaDescription: "..." }, content: { ... } },
 *     ...
 *   },
 *   usage: { inputTokens: 1234, outputTokens: 890, contentNodes: 42 }
 * }
 *
 * ⚠ ANTHROPIC_API_KEY 가 미설정이면 명시적 503 으로 응답합니다 (Phase B 직전까지 미등록 — CLAUDE.md §8).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import {
  translateWithClaude,
  type FieldType,
} from '@/lib/translation/claudeTranslator'
import { translateLexicalRoot, type LexicalRoot } from '@/lib/translation/lexicalWalker'
import type { Post } from '@/payload-types'
import { LOCALES, type Locale } from '@/i18n/locales'

const DEFAULT_SOURCE_LOCALE: Locale = 'en'
const DEFAULT_FIELDS: FieldType[] = [
  'title',
  'excerpt',
  'metaTitle',
  'metaDescription',
  'content',
]

// 20 locale 모두 번역 대상. EN/KO 만 source 허용 (한국어 운영자가 ko 원본
// 으로 작성한 글을 EN 외 다른 언어로 번역해야 하는 케이스 보존).
const ALLOWED_TARGET_LOCALES = new Set<Locale>(LOCALES)
const ALLOWED_SOURCE_LOCALES = new Set<Locale>(['en', 'ko'])
const ALLOWED_FIELDS = new Set<FieldType>([
  'title',
  'excerpt',
  'metaTitle',
  'metaDescription',
  'content',
])


function isAllowedLocale(l: string): l is Locale {
  return (ALLOWED_TARGET_LOCALES as Set<string>).has(l)
}

function isAllowedSourceLocale(l: string): l is Locale {
  return (ALLOWED_SOURCE_LOCALES as Set<string>).has(l)
}

function isAllowedField(f: string): f is FieldType {
  return (ALLOWED_FIELDS as Set<string>).has(f)
}

/** Posts 스키마에서 필드 → 원본 값 추출. metaTitle/metaDescription 은 중첩. */
function readFieldFromPost(post: Record<string, unknown>, field: FieldType): unknown {
  if (field === 'metaTitle' || field === 'metaDescription') {
    const meta = post.meta as Record<string, unknown> | undefined
    return meta?.[field]
  }
  return post[field]
}

/**
 * 번역된 필드 묶음을 payload.update 가 받을 수 있는 Partial<Post> 로 조립.
 * meta.* 는 단일 meta 객체로 합쳐서 nested update.
 */
function buildPostUpdate(
  translatedFields: Map<FieldType, string | LexicalRoot>,
): Partial<Post> {
  const update: Record<string, unknown> = {}
  const meta: Record<string, unknown> = {}

  for (const [field, value] of translatedFields) {
    if (field === 'metaTitle' || field === 'metaDescription') {
      meta[field] = value
    } else {
      update[field] = value
    }
  }

  if (Object.keys(meta).length > 0) {
    update.meta = meta
  }
  return update as unknown as Partial<Post>
}

interface TranslateRequestBody {
  postId?: string | number
  targetLocales?: string[]
  fields?: string[]
  sourceLocale?: string
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

    // ── 2. API 키 가드 ───────────────────────────────────────────
    // Phase B 직전까지 ANTHROPIC_API_KEY 미등록 정책 (CLAUDE.md §8).
    // 키가 없을 때 500 대신 명시적 503 으로 구분해 admin UI 가 안내 메시지를
    // 띄울 수 있도록 합니다.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ANTHROPIC_API_KEY 미설정. Phase B-1 직전에 Vercel 환경변수에 등록 후 활성화 예정 (CLAUDE.md §5 번역 정책).',
        },
        { status: 503 },
      )
    }

    // ── 3. 요청 body 파싱 + 검증 ────────────────────────────────
    const body = (await req.json().catch(() => null)) as TranslateRequestBody | null

    if (!body?.postId) {
      return NextResponse.json(
        { success: false, error: 'postId 누락.' },
        { status: 400 },
      )
    }

    // sourceLocale 검증 — 기본 'en'
    const rawSource = body.sourceLocale ?? DEFAULT_SOURCE_LOCALE
    if (!isAllowedSourceLocale(rawSource)) {
      return NextResponse.json(
        { success: false, error: `sourceLocale 은 ${[...ALLOWED_SOURCE_LOCALES].join(' / ')} 중 하나여야 합니다.` },
        { status: 400 },
      )
    }
    const sourceLocale: Locale = rawSource

    // targetLocales 검증
    const rawTargets = Array.isArray(body.targetLocales) ? body.targetLocales : []
    const targetLocales: Locale[] = rawTargets
      .filter((l): l is string => typeof l === 'string')
      .filter(isAllowedLocale)
      .filter((l) => l !== sourceLocale)
    if (targetLocales.length === 0) {
      return NextResponse.json(
        { success: false, error: 'targetLocales 가 비어있거나 source 와 동일하거나 지원되지 않는 언어만 포함.' },
        { status: 400 },
      )
    }

    // fields 검증
    const rawFields = Array.isArray(body.fields) && body.fields.length > 0 ? body.fields : DEFAULT_FIELDS
    const invalid = rawFields.filter((f) => typeof f !== 'string' || !isAllowedField(f))
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `지원되지 않는 필드: ${invalid.join(', ')}. 허용: ${[...ALLOWED_FIELDS].join(', ')}`,
        },
        { status: 400 },
      )
    }
    const fields = rawFields as FieldType[]

    // ── 4. source 원본 조회 ──────────────────────────────────────
    const sourceDoc = await payload.findByID({
      collection: 'posts',
      id: body.postId,
      locale: sourceLocale,
      depth: 0,
    })

    if (!sourceDoc) {
      return NextResponse.json(
        { success: false, error: 'Post not found.' },
        { status: 404 },
      )
    }

    const source = sourceDoc as unknown as Record<string, unknown>

    // publishedLocales 는 비-localized 단일 array. 번역 성공 시 target locale
    // 을 자동으로 추가하여 프론트 라우트가 즉시 노출되도록 합니다 (Phase B-1 ②
    // 정책 A). 운영자가 별도로 admin 에서 토글하지 않아도 번역 + 공개가 한
    // 흐름으로 처리됩니다. source locale 은 건드리지 않습니다.
    const rawPublished = source.publishedLocales
    const currentPublished = new Set<Locale>(
      Array.isArray(rawPublished)
        ? rawPublished.filter((l): l is Locale => typeof l === 'string' && isAllowedLocale(l))
        : [],
    )

    // ── 5. 각 locale 별 번역 + 저장 ───────────────────────────────
    const results: Record<string, Record<string, unknown>> = {}
    let totalInput = 0
    let totalOutput = 0
    let totalContentNodes = 0
    const publishedAdded: Locale[] = []

    for (const locale of targetLocales) {
      const perLocale = new Map<FieldType, string | LexicalRoot>()

      for (const field of fields) {
        const raw = readFieldFromPost(source, field)

        if (field === 'content') {
          // Lexical JSON walker 경로
          if (!raw || typeof raw !== 'object') continue
          const root = raw as LexicalRoot
          if (!root.root) continue

          const { translated, usage } = await translateLexicalRoot(root, async (text) => {
            const r = await translateWithClaude({
              text,
              sourceLocale,
              targetLocale: locale,
              fieldType: 'content',
            })
            return {
              translated: r.translated,
              inputTokens: r.usage.inputTokens,
              outputTokens: r.usage.outputTokens,
            }
          })

          perLocale.set(field, translated)
          totalInput += usage.inputTokens
          totalOutput += usage.outputTokens
          totalContentNodes += usage.nodes
          continue
        }

        // 텍스트 필드 경로
        if (typeof raw !== 'string' || raw.trim().length === 0) continue

        const { translated: out, usage } = await translateWithClaude({
          text: raw,
          sourceLocale,
          targetLocale: locale,
          fieldType: field,
        })

        perLocale.set(field, out)
        totalInput += usage.inputTokens
        totalOutput += usage.outputTokens
      }

      if (perLocale.size > 0) {
        const update = buildPostUpdate(perLocale) as Record<string, unknown>

        // publishedLocales 에 target locale 누적 추가 (LOCALES 순서로 정렬).
        if (!currentPublished.has(locale)) {
          currentPublished.add(locale)
          publishedAdded.push(locale)
        }
        update.publishedLocales = LOCALES.filter((l) => currentPublished.has(l))

        await payload.update({
          collection: 'posts',
          id: body.postId,
          locale,
          data: update as Partial<Post>,
        })

        // 응답에는 평탄화된 형태로 (meta.metaTitle 등) 노출
        const flat: Record<string, unknown> = {}
        for (const [k, v] of perLocale) flat[k] = v
        results[locale] = flat
      }
    }

    return NextResponse.json({
      success: true,
      sourceLocale,
      results,
      publishedLocales: LOCALES.filter((l) => currentPublished.has(l)),
      publishedAdded,
      usage: {
        inputTokens: totalInput,
        outputTokens: totalOutput,
        contentNodes: totalContentNodes,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/translate] error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

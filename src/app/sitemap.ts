import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types'
import { LOCALES, type Locale } from '@/i18n/locales'

/**
 * 언어별 sub-sitemap 분리 + sitemap-index 자동 생성.
 *
 * 정책 결정 (2026-05-09): 단일 sitemap.xml 에 9 개 locale 을 섞어 두면
 * Google SERP 의 "대표 URL" 노출이 언어 혼재로 잡힐 수 있다는 우려가 있어,
 * locale 별로 sub-sitemap 을 분리한다.
 *
 * Next.js App Router 의 `generateSitemaps` 는:
 *   1) `[{ id }]` 배열을 받아 sub-sitemap 의 식별자를 정의
 *   2) 각 식별자별로 `sitemap(id)` 함수를 호출해 entries 생성
 *   3) `/sitemap.xml` 자체는 sitemap-index 로 자동 변환되어
 *      `/sitemap/<id>.xml` URL 들을 가리키게 됨
 *
 * 결과 URL 구조:
 *   /sitemap.xml          → sitemap-index (각 locale 의 sitemap 가리킴)
 *   /sitemap/ko.xml       → 한국어 페이지
 *   /sitemap/en.xml       → 영어 페이지
 *   /sitemap/ja.xml ...   (총 9 개)
 *
 * 각 sub-sitemap entry 에는 `alternates.languages` 로 hreflang 정보를 함께
 * 발행하여, 검색엔진이 동일 콘텐츠의 다른 언어 버전을 인식할 수 있게 한다.
 */

const baseUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

const STATIC_PATHS = ['', '/insights', '/project-inquiry'] as const

const buildLocaleUrl = (locale: Locale, path: string): string =>
  `${baseUrl}/${locale}${path}`

/**
 * 한 path 에 대한 9 locale × URL hreflang 매핑. x-default 는 영문(en).
 */
const buildAlternates = (path: string): Record<string, string> => {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = buildLocaleUrl(locale, path)
  }
  languages['x-default'] = buildLocaleUrl('en', path)
  return languages
}

/**
 * sitemap-index 에 등록할 sub-sitemap 식별자 목록.
 * 각 locale 1 개씩 → 9 개의 sub-sitemap 발행.
 */
export async function generateSitemaps(): Promise<{ id: Locale }[]> {
  return LOCALES.map((locale) => ({ id: locale }))
}

/**
 * 특정 locale 의 sub-sitemap entries.
 *
 * - 정적 페이지 3 종 (홈/insights/project-inquiry)
 * - Posts 상세: publishedLocales 에 해당 locale 이 포함된 published 글만 노출
 * - 모든 entry 에 9 locale alternates.languages 동시 발행
 */
export default async function sitemap({
  id,
}: {
  id: Locale
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // ── 정적 페이지 ──────────────────────────────────────────────
  for (const path of STATIC_PATHS) {
    entries.push({
      url: buildLocaleUrl(id, path),
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.7,
      alternates: { languages: buildAlternates(path) },
    })
  }

  // ── Insights 상세 ──────────────────────────────────────────
  let posts: Post[] = []
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      pagination: false,
      // 본 locale 에서 공개된 글만
      where: {
        publishedLocales: { contains: id },
      },
    })
    posts = result.docs as Post[]
  } catch (err) {
    console.error(`[sitemap:${id}] Failed to load posts:`, err)
    posts = []
  }

  for (const post of posts) {
    const slug = (post as { slug?: string }).slug
    if (!slug) continue

    const lastModified = post.updatedAt ? new Date(post.updatedAt) : now
    const path = `/insights/${slug}`

    // alternates 는 본 글이 공개된 locale 집합으로 제한 (sitemap.ts 단위와 별도)
    const publishedLocales = (post.publishedLocales ?? []) as string[]
    const postLanguages: Record<string, string> = {}
    for (const loc of publishedLocales) {
      if ((LOCALES as readonly string[]).includes(loc)) {
        postLanguages[loc] = buildLocaleUrl(loc as Locale, path)
      }
    }
    if (publishedLocales.includes('en')) {
      postLanguages['x-default'] = buildLocaleUrl('en', path)
    }

    entries.push({
      url: buildLocaleUrl(id, path),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: postLanguages },
    })
  }

  return entries
}

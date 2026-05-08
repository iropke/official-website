import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types'
import { LOCALES, type Locale } from '@/i18n/locales'

/**
 * 다국어 sitemap. 9 locales × (홈 / insights 리스트 / insights 상세 / project-inquiry).
 *
 * - alternates.languages 로 hreflang 신호를 함께 보낸다 (Google 권장).
 * - insights 상세는 Posts 컬렉션에서 publishedLocales 가 비어있지 않은 published
 *   문서만 가져와 각 게시물의 공개 locale 별로 URL 을 생성한다.
 * - lastModified: Posts 는 updatedAt, 정적 페이지는 빌드 시각.
 */

const baseUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

const STATIC_PATHS = ['', '/insights', '/project-inquiry'] as const

const buildLocaleUrl = (locale: Locale, path: string): string =>
  `${baseUrl}/${locale}${path}`

const buildAlternates = (path: string): Record<string, string> => {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = buildLocaleUrl(locale, path)
  }
  // x-default → 영문
  languages['x-default'] = buildLocaleUrl('en', path)
  return languages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // ── 정적 페이지 (홈 / insights 리스트 / project-inquiry) × 9 locales ──
  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: buildLocaleUrl(locale, path),
        lastModified: now,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: { languages: buildAlternates(path) },
      })
    }
  }

  // ── Insights 상세 ───────────────────────────────────────────────
  let posts: Post[] = []
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      // draft:false (기본) → _status=published 만
      pagination: false,
    })
    posts = result.docs as Post[]
  } catch (err) {
    console.error('[sitemap] Failed to load posts:', err)
    posts = []
  }

  for (const post of posts) {
    const slug = (post as { slug?: string }).slug
    if (!slug) continue
    const publishedLocales = (post.publishedLocales ?? []) as string[]
    if (publishedLocales.length === 0) continue

    const lastModified = post.updatedAt ? new Date(post.updatedAt) : now
    const path = `/insights/${slug}`

    // 게시물이 공개된 locale 에서만 URL 노출. alternates 도 같은 집합으로 제한.
    const postLanguages: Record<string, string> = {}
    for (const loc of publishedLocales) {
      if ((LOCALES as readonly string[]).includes(loc)) {
        postLanguages[loc] = buildLocaleUrl(loc as Locale, path)
      }
    }
    if (publishedLocales.includes('en')) {
      postLanguages['x-default'] = buildLocaleUrl('en', path)
    }

    for (const loc of publishedLocales) {
      if (!(LOCALES as readonly string[]).includes(loc)) continue
      entries.push({
        url: buildLocaleUrl(loc as Locale, path),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: postLanguages },
      })
    }
  }

  return entries
}

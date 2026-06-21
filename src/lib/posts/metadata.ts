import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Post } from '@/payload-types'
import type { Locale } from '@/i18n/locales'
import { buildAlternates } from '@/i18n/alternates'
import { getSiteSettings } from '@/lib/site-settings'
import {
  type PostCategory,
  getCategoryBasePath,
  getCategoryPostPath,
} from './urls'

/**
 * Posts 라우트 메타데이터 단일 진입점.
 *
 * 배경: 라우트별 `generateMetadata` 가 `alternates` 만 반환하던 시절에는
 * 체인 어디에서도 `title` 을 주지 않아 루트 레이아웃(`(frontend)/layout.tsx`)의
 * `title.default = siteName` 으로 폴백 → 모든 포스트 페이지가 "Iropke" 로
 * 노출됐다. admin 에 입력/자동동기화된 `meta.metaTitle` / `meta.metaDescription`
 * (Posts.ts hook) 도 프론트에서 조회되지 않아 무시됐다.
 *
 * 이 모듈이 그 매핑을 담당한다:
 *   - 상세: `meta.metaTitle`(폴백 `title`) / `meta.metaDescription`(폴백 `excerpt`)
 *           / `meta.ogImage`(폴백 `thumbnail`)
 *   - 목록: 카테고리 고정 라벨 (영문 단일 파이프라인 — 추후 i18n 확장 여지)
 *
 * 반환한 `title` 문자열은 루트 레이아웃의 `title.template`(`%s | Iropke`)에
 * 주입되어 "Post Title | Iropke" 로 렌더된다.
 */

function mediaUrl(value: (number | null) | Media | undefined): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value.cloudinary?.secure_url ?? value.url ?? undefined
}

/**
 * 카테고리 목록 페이지 `<title>` 라벨. 루트 템플릿이 ` | Iropke` 를 덧붙인다.
 * 영문 단일 파이프라인 정책에 따라 영어 라벨 고정 (섹션 표시명과 동일 계열).
 */
const CATEGORY_LIST_TITLES: Record<PostCategory, string> = {
  insight: 'Insights',
  story: 'Stories',
  portfolio: 'Portfolio',
  solution: 'Solutions',
  service: 'Services',
  origin: 'Origin',
}

/**
 * 목록 페이지 메타데이터. 카테고리 고정 라벨 + path 별 hreflang alternates.
 */
export function buildPostListMetadata(
  locale: Locale,
  category: PostCategory,
): Metadata {
  return {
    title: CATEGORY_LIST_TITLES[category],
    alternates: buildAlternates(locale, getCategoryBasePath(category)),
  }
}

/**
 * 상세 페이지 메타데이터. 공개(published) 포스트의 SEO 필드를 매핑한다.
 *
 * 쿼리는 방문자 시점(공개 + 현재 locale + 스케줄 게이트)을 미러링한다.
 * preview(미공개/미래일자)는 색인 대상이 아니므로 제외 — 미발견 시 `alternates`
 * 만 반환하고 본문 라우트의 `notFound()` 가 실제 응답을 처리한다.
 */
export async function buildPostDetailMetadata(
  locale: Locale,
  category: PostCategory,
  slug: string,
): Promise<Metadata> {
  const alternates = buildAlternates(locale, getCategoryPostPath(category, slug))

  let post: Post | undefined
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      locale,
      depth: 1, // ogImage / thumbnail Media populate
      limit: 1,
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
          { publishedDate: { less_than_equal: new Date().toISOString() } },
          { publishedLocales: { contains: locale } },
          { category: { equals: category } },
        ],
      },
    })
    post = result.docs[0] as Post | undefined
  } catch (err) {
    console.error('[buildPostDetailMetadata] query failed:', err)
  }

  if (!post) {
    return { alternates }
  }

  const title = post.meta?.metaTitle?.trim() || post.title?.trim() || undefined
  const description =
    post.meta?.metaDescription?.trim() || post.excerpt?.trim() || undefined
  const ogImageUrl = mediaUrl(post.meta?.ogImage) ?? mediaUrl(post.thumbnail)

  // siteName 보존: child 의 openGraph 는 부모(layout) openGraph 를 통째로 대체하므로
  // 여기서 다시 명시한다. getSiteSettings 는 React cache() 라 layout 호출과 dedupe.
  const settings = await getSiteSettings(locale)

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates,
    openGraph: {
      type: 'article',
      siteName: settings.siteName,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

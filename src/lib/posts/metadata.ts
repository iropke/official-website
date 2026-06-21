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
import { getPostCategoryMeta } from './categoryMeta'

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
 * 목록 페이지 메타데이터.
 *
 * 제목: `post-category-pages` 글로벌의 카테고리별 `metaTitle`(있으면) → 없으면
 * 기본 라벨. 설명: 글로벌의 `metaDescription`(있으면) → 없으면 부모 레이아웃의
 * 사이트 기본 설명으로 폴백(키 미지정). OG: 카테고리 ogImage → 사이트 기본 OG.
 *
 * 문서 title 은 `{ absolute }` 로 완성형을 직접 구성(루트 `%s | Iropke` 템플릿
 * 이중 적용 방지) — 상세 페이지와 동일 규약. og:title 도 동일 문자열로 맞춘다.
 */
export async function buildPostListMetadata(
  locale: Locale,
  category: PostCategory,
): Promise<Metadata> {
  const [catMeta, settings] = await Promise.all([
    getPostCategoryMeta(locale).then((m) => m[category]),
    getSiteSettings(locale),
  ])

  const label = catMeta?.metaTitle || CATEGORY_LIST_TITLES[category]
  const fullTitle = `${label} | ${settings.siteName}`
  const description = catMeta?.metaDescription || undefined
  const ogImageUrl = catMeta?.ogImageUrl ?? settings.ogImageUrl

  return {
    title: { absolute: fullTitle },
    alternates: buildAlternates(locale, getCategoryBasePath(category)),
    ...(description ? { description } : {}),
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: fullTitle,
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
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

  const baseTitle = post.title?.trim() || undefined
  const metaTitle = post.meta?.metaTitle?.trim() || undefined
  const description =
    post.meta?.metaDescription?.trim() || post.excerpt?.trim() || undefined
  const ogImageUrl = mediaUrl(post.meta?.ogImage) ?? mediaUrl(post.thumbnail)

  // siteName 보존: child 의 openGraph 는 부모(layout) openGraph 를 통째로 대체하므로
  // 여기서 다시 명시한다. getSiteSettings 는 React cache() 라 layout 호출과 dedupe.
  const settings = await getSiteSettings(locale)

  // 완성형 <title> 단일 계산:
  //   - metaTitle 이 title 과 다르면 = 콘텐츠 파이프라인이 명시한 완성형 SEO 타이틀로,
  //     locale 별 브랜드 접미사("| Iropke" / "| 이롭게")가 이미 포함돼 있다 → 그대로 사용.
  //   - 그 외(metaTitle 미설정 또는 auto-sync 로 title 과 동일)면 → "title | siteName" 합성.
  // 문서 title 은 `{ absolute }` 로 반환해 루트 레이아웃의 `%s | Iropke` 템플릿이
  // 한 번 더 적용돼 브랜드가 중복되는 것을 막는다(예: "... | 이롭게 | Iropke").
  // og:title 은 템플릿 영향을 받지 않으므로 동일 문자열을 그대로 전달해 일치시킨다.
  const fullTitle =
    metaTitle && metaTitle !== baseTitle
      ? metaTitle
      : baseTitle
        ? `${baseTitle} | ${settings.siteName}`
        : undefined

  return {
    ...(fullTitle ? { title: { absolute: fullTitle } } : {}),
    ...(description ? { description } : {}),
    alternates,
    openGraph: {
      type: 'article',
      siteName: settings.siteName,
      ...(fullTitle ? { title: fullTitle } : {}),
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

/**
 * Post 카테고리 → 프론트엔드 URL 경로 매핑 (단일 진실 원천).
 *
 * Posts.category enum: 'insight' | 'story' | 'portfolio'
 * URL 패턴 (CLAUDE.md §1 + src/collections/Posts.ts:592 의 주석 기준):
 *   - insight   → /insights   (복수)
 *   - story     → /stories    (복수)
 *   - portfolio → /portfolio  (단수 — 영어권 관습)
 *
 * 이 모듈을 import 해서 사용하는 곳:
 *   - 라우트 page.tsx 들 (basePath / generateMetadata)
 *   - PostList / PostDetail 공용 컴포넌트 (basePath prop)
 *   - sitemap.ts (per-post URL 발급)
 *   - search/page.tsx (검색 결과 링크)
 *   - components/home/Insights (홈 카드 링크)
 *   - collections/Posts.ts (admin preview URL)
 */

export type PostCategory = 'insight' | 'story' | 'portfolio'

const CATEGORY_PATHS: Record<PostCategory, string> = {
  insight: '/insights',
  story: '/stories',
  portfolio: '/portfolio',
}

/**
 * 카테고리의 목록 페이지 경로 (locale prefix 미포함).
 * 예: `getCategoryBasePath('story')` → `'/stories'`
 */
export function getCategoryBasePath(category: PostCategory | string | null | undefined): string {
  if (category && category in CATEGORY_PATHS) {
    return CATEGORY_PATHS[category as PostCategory]
  }
  return CATEGORY_PATHS.insight
}

/**
 * 카테고리의 상세 페이지 경로 (locale prefix 미포함, slug 포함).
 * 예: `getCategoryPostPath('story', 'foo')` → `'/stories/foo'`
 */
export function getCategoryPostPath(
  category: PostCategory | string | null | undefined,
  slug: string,
): string {
  return `${getCategoryBasePath(category)}/${slug}`
}

/**
 * 카테고리의 목록 URL (locale prefix 포함).
 * 예: `getCategoryUrl('en', 'story')` → `'/en/stories'`
 */
export function getCategoryUrl(
  locale: string,
  category: PostCategory | string | null | undefined,
): string {
  return `/${locale}${getCategoryBasePath(category)}`
}

/**
 * 카테고리의 상세 URL (locale prefix + slug 포함).
 * 예: `getPostUrl('en', 'story', 'foo')` → `'/en/stories/foo'`
 */
export function getPostUrl(
  locale: string,
  category: PostCategory | string | null | undefined,
  slug: string,
): string {
  return `/${locale}${getCategoryPostPath(category, slug)}`
}

/**
 * 카테고리 enum 값 배열 (sitemap / 라우트 generation 에서 사용).
 */
export const POST_CATEGORIES: readonly PostCategory[] = ['insight', 'story', 'portfolio']

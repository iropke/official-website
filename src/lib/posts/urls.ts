/**
 * Post 카테고리 → 프론트엔드 URL 경로 매핑 (단일 진실 원천).
 *
 * Posts.category enum: 'insight' | 'story' | 'portfolio' | 'solution' | 'service' | 'origin'
 * URL 패턴 (모두 단수 — 2026-05-11 정책 확정):
 *   - insight   → /insight
 *   - story     → /story
 *   - portfolio → /portfolio
 *   - solution  → /solution
 *   - service   → /service
 *   - origin    → /origin   ('최초의 기록' 연재 — 2026-05-16 추가)
 *
 * 단수 통일 이유:
 *   1. Posts.category enum value 와 URL slug 가 1:1 매칭 (helper = identity)
 *   2. 다국어 (20 locale) 친화 — plural/singular 개념 없는 언어에서 자연
 *   3. brief.category ↔ URL slug ↔ DB enum 일관
 *
 * 이 모듈을 import 해서 사용하는 곳:
 *   - 라우트 page.tsx 들 (basePath / generateMetadata)
 *   - PostList / PostDetail 공용 컴포넌트 (basePath prop)
 *   - sitemap.ts (per-post URL 발급)
 *   - search/page.tsx (검색 결과 링크)
 *   - components/home/Insights (홈 카드 링크)
 *   - collections/Posts.ts (admin preview URL)
 */

export type PostCategory =
  | 'insight'
  | 'story'
  | 'portfolio'
  | 'solution'
  | 'service'
  | 'origin'

const CATEGORY_PATHS: Record<PostCategory, string> = {
  insight: '/insight',
  story: '/story',
  portfolio: '/portfolio',
  solution: '/solution',
  service: '/service',
  origin: '/origin',
}

/**
 * 카테고리의 목록 페이지 경로 (locale prefix 미포함).
 * 예: `getCategoryBasePath('story')` → `'/story'`
 */
export function getCategoryBasePath(category: PostCategory | string | null | undefined): string {
  if (category && category in CATEGORY_PATHS) {
    return CATEGORY_PATHS[category as PostCategory]
  }
  return CATEGORY_PATHS.insight
}

/**
 * 카테고리의 상세 페이지 경로 (locale prefix 미포함, slug 포함).
 * 예: `getCategoryPostPath('story', 'foo')` → `'/story/foo'`
 */
export function getCategoryPostPath(
  category: PostCategory | string | null | undefined,
  slug: string,
): string {
  return `${getCategoryBasePath(category)}/${slug}`
}

/**
 * 카테고리의 목록 URL (locale prefix 포함).
 * 예: `getCategoryUrl('en', 'story')` → `'/en/story'`
 */
export function getCategoryUrl(
  locale: string,
  category: PostCategory | string | null | undefined,
): string {
  return `/${locale}${getCategoryBasePath(category)}`
}

/**
 * 카테고리의 상세 URL (locale prefix + slug 포함).
 * 예: `getPostUrl('en', 'story', 'foo')` → `'/en/story/foo'`
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
export const POST_CATEGORIES: readonly PostCategory[] = [
  'insight',
  'story',
  'portfolio',
  'solution',
  'service',
  'origin',
]

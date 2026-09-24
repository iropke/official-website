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

// 상대 경로: collections/Posts.ts 가 이 모듈을 상대 경로로 import 하므로 alias 의존을 늘리지 않음
import { isLocale } from '../../i18n/locales'

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
 * 본문(Lexical) 안의 사이트 내부 링크를 현재 locale 경로로 보정.
 *
 * 본문 링크는 콘텐츠 파이프라인에서 locale 없이 `/insight/foo` 로 작성되고,
 * 초기 원고 일부는 단수 통일(2026-05-11) 이전 경로 `/insights/foo`·`/stories/foo` 를 쓴다.
 * 라우트는 `/{locale}/{category}/{slug}` 뿐이라 그대로 출력하면 404 가 된다.
 *
 * 규칙:
 *   - `/` 로 시작하는 사이트 내부 경로만 대상 (외부 URL · `//host` · `#hash` · `mailto:` 는 그대로)
 *   - 첫 세그먼트가 이미 locale 이면 그대로
 *   - 복수형 레거시 세그먼트(insights / stories)는 단수로 교정
 *   - 첫 세그먼트가 알려진 프론트엔드 라우트일 때만 locale 을 붙임
 *     (`/api`, `/admin`, `/assets/...` 같은 비-페이지 경로는 건드리지 않음)
 *
 * 예: `localizeContentHref('/insights/foo', 'ko')` → `'/ko/insight/foo'`
 */
const LEGACY_PLURAL_SEGMENTS: Record<string, string> = {
  insights: 'insight',
  stories: 'story',
}

const LOCALIZABLE_ROOT_SEGMENTS = new Set<string>([
  ...Object.values(CATEGORY_PATHS).map((p) => p.slice(1)),
  'project-inquiry',
  'privacy-policy',
  'search',
])

export function localizeContentHref(href: string, locale: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href

  const match = /^([^?#]*)(.*)$/.exec(href)
  const path = match?.[1] ?? href
  const suffix = match?.[2] ?? ''
  const segments = path.split('/')
  const first = segments[1] ?? ''

  if (isLocale(first)) return href

  const root = LEGACY_PLURAL_SEGMENTS[first] ?? first
  if (!LOCALIZABLE_ROOT_SEGMENTS.has(root)) return href

  segments[1] = root
  return `/${locale}${segments.join('/')}${suffix}`
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

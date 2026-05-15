/**
 * Catch-all 404 page under [locale].
 *
 * Next.js 16 의 App Router 에서 unmatched URL (예: `/en/foo-does-not-exist`)
 * 에 대해 `[locale]/not-found.tsx` 가 안정적으로 매칭되지 않고 프레임워크
 * 기본 404 UI 로 폴백되는 사례가 있다. catch-all route 가 모든 미매칭 URL 을
 * 가로채 `notFound()` 를 명시 호출하면, `/en/story/smart` (slug 미존재) 케이스와
 * 동일한 explicit-notFound 흐름이 되어 `[locale]/not-found.tsx` + `[locale]/layout.tsx`
 * (Header/Footer 포함) 가 일관되게 렌더된다.
 *
 * Next.js 의 route specificity 규칙상 구체 라우트 (`/en/insight/[slug]` 등) 가
 * 본 catch-all 보다 우선 매칭되므로 기존 페이지에는 영향이 없다.
 */

import { notFound } from 'next/navigation'

export default function LocaleCatchAllNotFound() {
  notFound()
}

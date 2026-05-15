/**
 * Locale 세그먼트 내부 404.
 *
 * Next.js 16 에서 'use client' + usePathname() 패턴은 unmatched URL 시
 * 정적 빌드 단계에서 의도대로 렌더되지 않고 프레임워크 기본 404 UI 로
 * 폴백되는 사례가 있다 (e.g. `/en/foo-does-not-exist`). 이를 피하기 위해
 * server component 로 전환하고 `headers()` 로 pathname 을 추출한다.
 *
 * not-found.tsx 는 params 를 받지 못하므로 locale 은 헤더에서 직접 파싱.
 * 어떤 헤더도 사용 불가하면 'en' 기본값 (영문 fallback).
 *
 * 본 not-found 는 Next.js 동작상 `[locale]/layout.tsx` 의 Header/Footer 안에
 * 렌더되지 않는 경우(unmatched URL)와 렌더되는 경우(notFound() 호출)가
 * 공존한다 — ErrorScreen 자체가 layout-page 와 동일한 시각 토큰을 사용해
 * standalone 으로도 일관된다.
 */

import { headers } from 'next/headers'
import ErrorScreen from '@/components/error/ErrorScreen'
import { normalizeLocale } from '@/i18n/locales'

function pickLocaleFromPath(pathLike: string): string {
  try {
    const url = new URL(pathLike, 'http://localhost')
    return url.pathname.split('/').filter(Boolean)[0] ?? ''
  } catch {
    return pathLike.split('/').filter(Boolean)[0] ?? ''
  }
}

export default async function LocaleNotFound() {
  const h = await headers()
  const raw =
    h.get('x-invoke-path') ||
    h.get('x-pathname') ||
    h.get('next-url') ||
    h.get('x-matched-path') ||
    h.get('referer') ||
    ''
  const segment = pickLocaleFromPath(raw)
  const locale = normalizeLocale(segment)

  return <ErrorScreen locale={locale} kind="404" />
}

/**
 * (frontend) route group 의 fallback 404.
 *
 * /<unsupported-locale>/* 또는 [locale] 외부 경로에서 매칭이 실패할 때 표시.
 * Next.js 동작상 `(frontend)/layout.tsx` (html/body) 만 적용되고
 * `[locale]/layout.tsx` 의 Header/Footer 는 동반되지 않는다.
 *
 * Next.js 16 에서 'use client' + usePathname() 으로 작성하면 unmatched URL
 * 시 프레임워크 기본 404 UI 로 폴백되는 사례가 있어 server component 로 작성.
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

export default async function FrontendNotFound() {
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

/**
 * (frontend) route group 의 fallback 404.
 *
 * /<unsupported-locale>/* 또는 /[locale] 외부 경로(/admin·/api 제외)에서
 * 매칭이 실패할 때 표시된다. layout.tsx 의 Header/Footer 를 동반하지 않도록
 * 의도적으로 (frontend) 그룹의 최상위에 배치 — Next.js 는 가장 가까운
 * not-found.tsx 를 우선하므로 [locale]/not-found.tsx 가 있는 경우 그쪽이
 * 우선한다. 본 파일은 [locale] 진입 자체가 실패한 케이스 전용 fallback.
 */

'use client'

import { usePathname } from 'next/navigation'
import ErrorScreen from '@/components/error/ErrorScreen'
import { normalizeLocale } from '@/i18n/locales'

export default function FrontendNotFound() {
  const pathname = usePathname() ?? '/'
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = normalizeLocale(segment)

  return <ErrorScreen locale={locale} kind="404" />
}

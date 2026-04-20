'use client'

import { useEffect } from 'react'

/**
 * [locale] 세그먼트에 진입했을 때 <html> 의 lang / dir 속성을 런타임에 갱신합니다.
 *
 * Next.js App Router 는 route group 경계에서 <html> 을 여러 번 열 수 없기에,
 * 상위 (frontend)/layout.tsx 가 lang="ko" 로 고정된 <html> 을 렌더링하고,
 * 이 컴포넌트가 클라이언트에서 document.documentElement 을 실제 locale 로 갱신합니다.
 *
 * - ko/en/es/ru/de/fr/zh: dir="ltr"
 * - ar: dir="rtl"
 */
const RTL_LOCALES = new Set(['ar'])

export default function LocaleHtmlAttributes({ locale }: { locale: string }) {
  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
  }, [locale])

  return null
}

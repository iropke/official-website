'use client'

import { useEffect } from 'react'

import { LOCALE_DIRS, LOCALE_HTML_LANG, isLocale } from '@/i18n/locales'

/**
 * [locale] 세그먼트에 진입했을 때 <html> 의 lang / dir 속성을 런타임에 갱신합니다.
 *
 * Next.js App Router 는 route group 경계에서 <html> 을 여러 번 열 수 없기에,
 * 상위 (frontend)/layout.tsx 가 고정된 <html> 을 렌더링하고, 이 컴포넌트가
 * 클라이언트에서 document.documentElement 을 실제 locale 로 갱신합니다.
 *
 * lang / dir 값은 src/i18n/locales.ts 의 LOCALE_HTML_LANG / LOCALE_DIRS 가 결정.
 * 알 수 없는 locale 이 들어오면 변경하지 않음 (상위 SSR 기본값 유지).
 */
export default function LocaleHtmlAttributes({ locale }: { locale: string }) {
  useEffect(() => {
    if (!isLocale(locale)) return
    const html = document.documentElement
    html.lang = LOCALE_HTML_LANG[locale]
    html.dir = LOCALE_DIRS[locale]
  }, [locale])

  return null
}

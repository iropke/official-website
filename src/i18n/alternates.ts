import type { Metadata } from 'next'
import { LOCALES, LOCALE_HREFLANG, type Locale } from './locales'

/**
 * SEO 메타데이터 헬퍼.
 *
 * - metadataBase: 절대 URL 변환 기준
 * - alternates.canonical: 현재 locale 의 절대 URL
 * - alternates.languages: 9 locales × hreflang(`ko-KR` 등) + `x-default` → en
 *
 * 사용 예:
 *   const path = ''            // 홈
 *   const path = '/insight'    // 리스트
 *   const path = `/insight/${slug}`   // 상세
 */

export const SITE_BASE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

export const buildLocaleUrl = (locale: Locale, path: string): string => {
  const normalizedPath = path === '' || path.startsWith('/') ? path : `/${path}`
  return `${SITE_BASE_URL}/${locale}${normalizedPath}`
}

/**
 * Next.js Metadata 의 alternates 객체를 생성한다.
 *
 * @param currentLocale 현재 페이지의 locale (canonical 산출용)
 * @param path          locale 이후의 경로 (`''`, `'/insight'`, `'/insight/foo'`)
 */
export function buildAlternates(
  currentLocale: Locale,
  path: string,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}

  for (const locale of LOCALES) {
    languages[LOCALE_HREFLANG[locale]] = buildLocaleUrl(locale, path)
  }
  // Google 권장: x-default → 영문(en) 페이지
  languages['x-default'] = buildLocaleUrl('en', path)

  return {
    canonical: buildLocaleUrl(currentLocale, path),
    languages,
  }
}

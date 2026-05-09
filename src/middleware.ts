import { NextRequest, NextResponse } from 'next/server'

import { LOCALES, isLocale, type Locale } from '@/i18n/locales'

/**
 * iropke.com 첫화면 OS 언어 라우팅 미들웨어
 *
 * 우선순위:
 *   1) NEXT_LOCALE 쿠키 (사용자가 LangSwitcher 에서 직접 선택한 언어)
 *   2) Accept-Language 헤더의 1순위 매칭 (region tag 무시, primary subtag 만 비교)
 *   3) MIDDLEWARE_FALLBACK_LOCALE ('en')
 *
 * Note: middleware fallback 은 Payload defaultLocale 과 별개. Payload 의
 *       DEFAULT_LOCALE 도 'en' 으로 통일되어 있어 현재는 동일하지만, 의미상
 *       구분되는 상수이므로 i18n/locales.ts 의 DEFAULT_LOCALE 과 결합하지 않음.
 *
 * 적용 대상: 정확히 '/' 진입 시에만 리디렉션. /en, /ko 등 명시 경로는 통과.
 */

const MIDDLEWARE_FALLBACK_LOCALE: Locale = 'en'

function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return MIDDLEWARE_FALLBACK_LOCALE

  const candidates = header
    .split(',')
    .map((item) => {
      const [tag, ...params] = item.trim().split(';')
      const qParam = params.find((p) => p.trim().startsWith('q='))
      const q = qParam ? parseFloat(qParam.split('=')[1]) : 1
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 }
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of candidates) {
    const primary = tag.split('-')[0]
    if (isLocale(primary)) return primary
  }

  return MIDDLEWARE_FALLBACK_LOCALE
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname !== '/') return NextResponse.next()

  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isLocale(cookieLocale)) {
    const url = new URL(`/${cookieLocale}`, req.url)
    return NextResponse.redirect(url)
  }

  const detected = pickLocaleFromAcceptLanguage(req.headers.get('accept-language'))
  const url = new URL(`/${detected}`, req.url)

  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', detected, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

export { LOCALES }

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * iropke.com 첫화면 OS 언어 라우팅 미들웨어
 *
 * 우선순위:
 *   1) NEXT_LOCALE 쿠키 (대표님이 헤더 LangSwitcher 에서 직접 선택한 언어)
 *   2) Accept-Language 헤더의 1순위 매칭 (region tag 무시, 최상위 언어코드만 비교)
 *   3) 기본값 'en'
 *
 * 적용 대상: 정확히 '/' 진입 시에만 리디렉션. /en, /ko 등 명시 경로는 통과.
 */

const SUPPORTED_LOCALES = ['ko', 'en', 'es', 'ru', 'de', 'fr', 'zh', 'ar'] as const
const DEFAULT_LOCALE = 'en'

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const isSupported = (lang: string): lang is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(lang)

function pickLocaleFromAcceptLanguage(header: string | null): SupportedLocale {
  if (!header) return DEFAULT_LOCALE

  // "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" 같은 헤더를 q 값으로 정렬
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
    // region tag 분리 (예: ko-KR → ko)
    const primary = tag.split('-')[0]
    if (isSupported(primary)) return primary
  }

  return DEFAULT_LOCALE
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 정확히 루트 경로만 처리. /admin, /api, 정적 자원 등은 통과
  if (pathname !== '/') return NextResponse.next()

  // 1순위: 쿠키 (사용자가 명시 선택한 언어)
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isSupported(cookieLocale)) {
    const url = new URL(`/${cookieLocale}`, req.url)
    return NextResponse.redirect(url)
  }

  // 2순위: Accept-Language 헤더
  const detected = pickLocaleFromAcceptLanguage(req.headers.get('accept-language'))
  const url = new URL(`/${detected}`, req.url)

  const response = NextResponse.redirect(url)
  // 첫 자동 매칭 결과를 쿠키에 저장. 헤더 LangSwitcher 에서 변경하면 덮어씀
  response.cookies.set('NEXT_LOCALE', detected, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1년
    sameSite: 'lax',
  })
  return response
}

export const config = {
  // /admin, /api, _next 정적 자원, 파일 확장자가 있는 자원은 모두 제외
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}

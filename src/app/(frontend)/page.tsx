import { redirect } from 'next/navigation'

/**
 * 루트 페이지는 미들웨어가 OS 언어 기반으로 /<locale> 로 리디렉션함.
 * 미들웨어가 어떤 이유로 통과되었을 때를 위한 안전장치로 영문 fallback 유지.
 *
 * 매칭 순서: NEXT_LOCALE 쿠키 → Accept-Language → 'en' (기본값)
 * 상세: src/middleware.ts
 */
export default function RootPage() {
  redirect('/en')
}

import React from 'react'
import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { allFontVariables } from '@/fonts'
import '@/styles/globals.css'
import '@/styles/layout-page.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Iropke',
    default: 'Iropke',
  },
  description: 'Structured growth systems for global brands.',
}

/**
 * GA4 추적 ID. Vercel env `NEXT_PUBLIC_GA_ID` 에 등록되어 있을 때만 스크립트 주입.
 * 로컬 개발(env 미설정) / 프리뷰 환경에서 실수로 이벤트가 흘러 들어가는 것을
 * 방지하기 위해 조건부 렌더로 설계했다.
 *
 * `@next/third-parties/google` 의 `<GoogleAnalytics />` 는
 *   - Next.js `<Script strategy="afterInteractive">` 기반으로 gtag 삽입
 *   - SPA 라우트 전환 시 자동으로 page_view 이벤트 전송
 *   - Next.js 팀이 공식 유지보수 (Next 16 기준)
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  // lang / dir 속성은 [locale]/layout.tsx의 <LocaleHtmlAttributes /> 클라이언트 컴포넌트가
  // 런타임에 document.documentElement 으로 갱신합니다.
  // suppressHydrationWarning 으로 SSR 초기값("ko")과 클라이언트 갱신 차이 경고를 억제합니다.
  return (
    <html lang="ko" className={allFontVariables} suppressHydrationWarning>
      <body className="layout-body">
        {children}
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  )
}

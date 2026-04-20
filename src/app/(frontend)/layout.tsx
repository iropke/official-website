import React from 'react'
import type { Metadata } from 'next'
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

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  // lang / dir 속성은 [locale]/layout.tsx의 <LocaleHtmlAttributes /> 클라이언트 컴포넌트가
  // 런타임에 document.documentElement 으로 갱신합니다.
  // suppressHydrationWarning 으로 SSR 초기값("ko")과 클라이언트 갱신 차이 경고를 억제합니다.
  return (
    <html lang="ko" className={allFontVariables} suppressHydrationWarning>
      <body className="layout-body">
        {children}
      </body>
    </html>
  )
}

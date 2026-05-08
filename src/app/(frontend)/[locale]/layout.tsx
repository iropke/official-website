import React from 'react'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import FloatingActions from '@/components/layout/FloatingActions/FloatingActions'
import CookieConsent from '@/components/CookieConsent/CookieConsent'
import LocaleHtmlAttributes from './LocaleHtmlAttributes'
import { normalizeLocale } from '@/i18n/locales'
import { SITE_BASE_URL, buildAlternates } from '@/i18n/alternates'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Layout-level 기본 메타데이터.
 *
 * - metadataBase: 모든 절대 URL 변환의 기준
 * - alternates.languages: 홈(`/[locale]`) 기준 hreflang. 자식 페이지가
 *   자체 generateMetadata 에서 path 별 alternates 로 덮어쓴다.
 */
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)

  return {
    metadataBase: new URL(SITE_BASE_URL),
    alternates: buildAlternates(locale, ''),
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  return (
    <>
      <LocaleHtmlAttributes locale={locale} />
      <div className="layout-page layout-page--no-clip">
        <Header />
        <main className="layout-main">
          {children}
        </main>
        <Footer />
      </div>
      <FloatingActions inquiryHref={`/${locale}/project-inquiry`} />
      <CookieConsent />
    </>
  )
}

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import FloatingActions from '@/components/layout/FloatingActions/FloatingActions'
import CookieConsent from '@/components/CookieConsent/CookieConsent'
import LocaleHtmlAttributes from './LocaleHtmlAttributes'
import { isLocale } from '@/i18n/locales'
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
 *
 * Invalid-locale 가드 (2026-05-12): `[locale]` 동적 세그먼트는 `/sitemap.xml`,
 * `/foo.bar` 같은 임의 1-세그먼트 URL 도 그대로 받아 page 까지 도달시킨다.
 * 이전에는 `normalizeLocale` 이 unknown 값을 `'en'` 으로 폴백시켜 홈페이지를
 * 200 OK 로 렌더링했고, 이게 sitemap-index (`/sitemap.xml`) 가 HTML 홈페이지로
 * 응답되던 직접적 원인이었다. layout 단에서 `isLocale` 체크 후 `notFound()` 를
 * 호출해 sub-route 전체를 한 번에 보호한다.
 */
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isLocale(rawLocale)) notFound()

  return {
    metadataBase: new URL(SITE_BASE_URL),
    alternates: buildAlternates(rawLocale, ''),
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale = rawLocale

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

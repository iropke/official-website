import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Header from '@/components/layout/Header/Header'
import type { MegaMenuGroup } from '@/components/layout/MegaMenu/MegaMenu'
import Footer from '@/components/layout/Footer/Footer'
import FloatingActions from '@/components/layout/FloatingActions/FloatingActions'
import CookieConsent from '@/components/CookieConsent/CookieConsent'
import LocaleHtmlAttributes from './LocaleHtmlAttributes'
import { isLocale, type Locale } from '@/i18n/locales'
import { SITE_BASE_URL, buildAlternates } from '@/i18n/alternates'
import { getSiteSettings } from '@/lib/site-settings'

const FALLBACK_CARD_GRADIENT = 'linear-gradient(135deg, #1f4a44, #0d201d)'

/**
 * Map the Payload `navigation` global into the `MegaMenuGroup[]` shape the
 * Header renders. Returns `[]` when there is nothing visible to show, in which
 * case the Header falls back to its static data so the site never goes blank.
 */
async function loadNavigation(locale: Locale): Promise<MegaMenuGroup[]> {
  try {
    const payload = await getPayload({ config })
    const nav = await payload.findGlobal({
      slug: 'navigation',
      locale,
      depth: 1,
    })

    const groups: MegaMenuGroup[] = (nav.items ?? [])
      .filter((item) => item.isVisible !== false)
      .map((item) => ({
        label: item.label,
        href: item.link || undefined,
        items: (item.children ?? [])
          .filter((child) => child.isVisible !== false)
          .map((child) => {
            const media =
              child.media && typeof child.media === 'object'
                ? child.media
                : null
            return {
              title: child.label,
              description: child.description ?? '',
              href: child.link,
              kicker: child.badge ?? child.label,
              gradient: child.gradient || FALLBACK_CARD_GRADIENT,
              mediaUrl: media?.url ?? undefined,
              mediaAlt: media?.alt ?? undefined,
              external: child.linkType === 'external',
            }
          }),
      }))
      // Keep a menu when it has visible cards OR a direct top-level link.
      // Drop only menus that would render nothing (no cards, no link).
      .filter((group) => group.items.length > 0 || Boolean(group.href))

    return groups
  } catch (err) {
    console.error('[LocaleLayout] Failed to load navigation global:', err)
    return []
  }
}

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

  const settings = await getSiteSettings(rawLocale)

  return {
    metadataBase: new URL(SITE_BASE_URL),
    alternates: buildAlternates(rawLocale, ''),
    ...(settings.siteDescription
      ? { description: settings.siteDescription }
      : {}),
    openGraph: {
      siteName: settings.siteName,
      ...(settings.ogImageUrl ? { images: [settings.ogImageUrl] } : {}),
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale = rawLocale

  const [navigation, settings] = await Promise.all([
    loadNavigation(locale),
    getSiteSettings(locale),
  ])

  const policy = settings.footerPolicyLink
  const privacyHref = !policy
    ? `/${locale}/privacy-policy`
    : /^https?:\/\//.test(policy)
      ? policy
      : `/${locale}${policy.startsWith('/') ? '' : '/'}${policy}`

  return (
    <>
      <LocaleHtmlAttributes locale={locale} />
      <div className="layout-page layout-page--no-clip">
        <Header
          navigation={navigation}
          logoUrl={settings.logoUrl}
          logoAlt={settings.logoAlt}
        />
        <main className="layout-main">
          {children}
        </main>
        <Footer
          privacyHref={privacyHref}
          copyright={settings.footerCopyright}
          socialLinks={settings.socialLinks}
        />
      </div>
      <FloatingActions inquiryHref={`/${locale}/project-inquiry`} />
      <CookieConsent />
    </>
  )
}

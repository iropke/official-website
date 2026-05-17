import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, SiteSetting } from '@/payload-types'
import type { Locale } from '@/i18n/locales'

export type SocialPlatform = NonNullable<
  NonNullable<SiteSetting['socialLinks']>[number]['platform']
>

export interface NormalizedSiteSettings {
  siteName: string
  siteDescription?: string
  logoUrl?: string
  logoDarkUrl?: string
  logoAlt: string
  faviconUrl?: string
  ogImageUrl?: string
  footerCopyright: string
  footerPolicyLink?: string
  socialLinks: { platform: SocialPlatform; url: string }[]
}

/**
 * Frontend defaults. The `site-settings` global is optional in admin, so every
 * consumer must degrade gracefully — the site never goes blank just because a
 * field was left empty (same philosophy as the `navigation` global fallback).
 */
const DEFAULTS: NormalizedSiteSettings = {
  siteName: 'Iropke',
  footerCopyright: '© Iropke All Rights Reserved.',
  logoAlt: 'Iropke logo',
  socialLinks: [],
}

function mediaUrl(value: Media | number | null | undefined): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value.cloudinary?.secure_url ?? value.url ?? undefined
}

/**
 * Load + normalize the `site-settings` global.
 *
 * Wrapped in React `cache()` so the root layout's `generateMetadata`, the
 * `[locale]` layout's `generateMetadata`, and the `[locale]` layout component
 * share a single fetch per render (deduped by the `locale` arg).
 *
 * `locale` is optional: non-localized fields (siteName, logos, favicon, OG,
 * social links, policy link) are stable across locales; only `siteDescription`
 * and `footerCopyright` are localized and need the visitor's locale.
 */
export const getSiteSettings = cache(
  async (locale?: Locale): Promise<NormalizedSiteSettings> => {
    try {
      const payload = await getPayload({ config })
      const s = await payload.findGlobal({
        slug: 'site-settings',
        depth: 1,
        ...(locale ? { locale } : {}),
      })

      const logoAlt =
        (s.logo && typeof s.logo === 'object' ? s.logo.alt : null) ||
        DEFAULTS.logoAlt

      return {
        siteName: s.siteName?.trim() || DEFAULTS.siteName,
        siteDescription: s.siteDescription?.trim() || undefined,
        logoUrl: mediaUrl(s.logo),
        logoDarkUrl: mediaUrl(s.logoDark),
        logoAlt,
        faviconUrl: mediaUrl(s.favicon),
        ogImageUrl: mediaUrl(s.ogImage),
        footerCopyright: s.footerCopyright?.trim() || DEFAULTS.footerCopyright,
        footerPolicyLink: s.footerPolicyLink?.trim() || undefined,
        socialLinks: (s.socialLinks ?? [])
          .filter((link) => link.isVisible !== false && Boolean(link.url))
          .map((link) => ({ platform: link.platform, url: link.url })),
      }
    } catch (err) {
      console.error('[site-settings] Failed to load global:', err)
      return DEFAULTS
    }
  },
)

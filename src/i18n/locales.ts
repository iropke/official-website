/**
 * 20-locale central registry.
 *
 * Single source of truth for locale codes, labels, direction, and BCP-47 tags.
 * Consumed by:
 *   - src/payload.config.ts          (localization.locales)
 *   - src/middleware.ts              (OS-language routing)
 *   - src/app/(frontend)/[locale]/*  (route validation, <html lang/dir>)
 *   - src/components/layout/...      (LangSwitcher dropdown + search)
 *   - src/app/api/translate/route.ts (target locale allowlist)
 *   - src/lib/translation/...        (Claude prompt locale names)
 *   - SEO: hreflang alternates, sitemap.xml per-locale
 */

export const LOCALES = [
  'en',
  'zh',
  'ja',
  'de',
  'fr',
  'es',
  'ko',
  'pt',
  'hi',
  'ru',
  'nl',
  'it',
  'ar',
  'sv',
  'th',
  'pl',
  'id',
  'ms',
  'da',
  'tr',
] as const

export type Locale = (typeof LOCALES)[number]

/**
 * OS language fallback for middleware Accept-Language matching,
 * and Payload defaultLocale (field-level fallback when a locale value is empty).
 */
export const DEFAULT_LOCALE: Locale = 'en'

/** Frontend LangSwitcher dropdown — native script only (no parenthetical translation). */
export const LOCALE_LABELS_NATIVE: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ko: '한국어',
  pt: 'Português',
  hi: 'हिन्दी',
  ru: 'Русский',
  nl: 'Nederlands',
  it: 'Italiano',
  ar: 'العربية',
  sv: 'Svenska',
  th: 'ไทย',
  pl: 'Polski',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  da: 'Dansk',
  tr: 'Türkçe',
}

/** English names — for admin label composition, LangSwitcher search, dev tooling. */
export const LOCALE_LABELS_EN: Record<Locale, string> = {
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ko: 'Korean',
  pt: 'Portuguese',
  hi: 'Hindi',
  ru: 'Russian',
  nl: 'Dutch',
  it: 'Italian',
  ar: 'Arabic',
  sv: 'Swedish',
  th: 'Thai',
  pl: 'Polish',
  id: 'Indonesian',
  ms: 'Malay',
  da: 'Danish',
  tr: 'Turkish',
}

/**
 * Payload admin locale selector label — "Native (English)" form so non-native
 * operators can identify languages. 'en' collapses to a single token.
 */
export const LOCALE_LABELS_ADMIN: Record<Locale, string> = Object.fromEntries(
  LOCALES.map((code) => {
    const native = LOCALE_LABELS_NATIVE[code]
    const english = LOCALE_LABELS_EN[code]
    return [code, native === english ? native : `${native} (${english})`]
  }),
) as Record<Locale, string>

/** Text direction — only Arabic is RTL in the current locale set. */
export const LOCALE_DIRS: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  zh: 'ltr',
  ja: 'ltr',
  de: 'ltr',
  fr: 'ltr',
  es: 'ltr',
  ko: 'ltr',
  pt: 'ltr',
  hi: 'ltr',
  ru: 'ltr',
  nl: 'ltr',
  it: 'ltr',
  ar: 'rtl',
  sv: 'ltr',
  th: 'ltr',
  pl: 'ltr',
  id: 'ltr',
  ms: 'ltr',
  da: 'ltr',
  tr: 'ltr',
}

/**
 * <html lang="..."> values. Identical to locale codes for now; kept as a
 * separate map so future region-specific tags (e.g. 'zh-CN', 'pt-BR') can be
 * adopted without rippling through the 20-entry codes array.
 */
export const LOCALE_HTML_LANG: Record<Locale, string> = Object.fromEntries(
  LOCALES.map((code) => [code, code]),
) as Record<Locale, string>

/**
 * hreflang attribute values for SEO alternates and sitemap.xml. Same identity
 * mapping as LOCALE_HTML_LANG; intentionally separate for future divergence.
 */
export const LOCALE_HREFLANG: Record<Locale, string> = Object.fromEntries(
  LOCALES.map((code) => [code, code]),
) as Record<Locale, string>

/**
 * BCP-47 tags for Intl.DateTimeFormat / Intl.NumberFormat. Region-extended
 * where the bare 2-letter code is ambiguous for date/number formatting.
 */
export const LOCALE_INTL_TAG: Record<Locale, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ko: 'ko-KR',
  pt: 'pt-PT',
  hi: 'hi-IN',
  ru: 'ru-RU',
  nl: 'nl-NL',
  it: 'it-IT',
  ar: 'ar',
  sv: 'sv-SE',
  th: 'th-TH',
  pl: 'pl-PL',
  id: 'id-ID',
  ms: 'ms-MY',
  da: 'da-DK',
  tr: 'tr-TR',
}

/** Narrows an arbitrary string to Locale at the route boundary. */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Coerce a route param (or any user input) to a known Locale, falling
 * back to DEFAULT_LOCALE when the value is unknown. Used by `[locale]`
 * route handlers so a typo in the URL still renders a page instead of
 * crashing.
 */
export function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

/** Convenience for components that only need direction. */
export function isRtl(locale: Locale): boolean {
  return LOCALE_DIRS[locale] === 'rtl'
}

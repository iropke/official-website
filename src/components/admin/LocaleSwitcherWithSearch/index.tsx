'use client'

/**
 * Custom locale switcher for the Payload admin nav, modeled after the
 * front-end LangSwitcher: button + popup with a search input and filtered
 * list, supporting NFKD-normalized case-insensitive matching across native
 * label / English label / ISO code.
 *
 * Replaces Payload's built-in <Localizer/>, which is a flat dropdown that
 * becomes unusable once the locale set passes ~10 entries (the project now
 * runs at 20). The built-in is hidden via a global CSS rule in index.css
 * so the two don't render side-by-side.
 *
 * Wired into payload.config.ts via:
 *   admin.components.actions = ['/components/admin/LocaleSwitcherWithSearch#default']
 */

import { useRouter } from 'next/navigation'
import {
  useConfig,
  useLocale,
  useRouteTransition,
  useTranslation,
} from '@payloadcms/ui'
import { useEffect, useMemo, useRef, useState } from 'react'

import './index.css'

type LocaleOption = {
  code: string
  label?: unknown
  rtl?: boolean
}

function normalize(value: string): string {
  return value.normalize('NFKD').toLowerCase()
}

function resolveLabel(
  option: LocaleOption,
  i18nLanguage: string | undefined,
): string {
  const raw = option.label
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object') {
    const dict = raw as Record<string, string>
    const lang = i18nLanguage ?? 'en'
    return dict[lang] ?? dict.en ?? option.code
  }
  return option.code
}

export default function LocaleSwitcherWithSearch() {
  const { config } = useConfig()
  const { localization } = config
  const locale = useLocale()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const { i18n } = useTranslation()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [open])

  const locales = localization ? (localization.locales as LocaleOption[]) : []
  const i18nLanguage = i18n?.language

  const filtered = useMemo(() => {
    if (!query) return locales
    const nq = normalize(query)
    return locales.filter((option) => {
      const label = resolveLabel(option, i18nLanguage)
      return (
        normalize(option.code).includes(nq) ||
        normalize(label).includes(nq)
      )
    })
  }, [locales, query, i18nLanguage])

  if (!localization) return null

  function selectLocale(code: string) {
    setOpen(false)
    /**
     * Preserve all existing query params (e.g. drafts, depth, where), set
     * `locale` to the chosen code. Payload's built-in Localizer uses qs-esm
     * for nested-bracket parsing, but our admin URLs are flat enough that
     * URLSearchParams round-trips cleanly without an extra dep.
     */
    const params = new URLSearchParams(window.location.search)
    params.set('locale', code)
    const search = params.toString()
    startRouteTransition(() => {
      router.push(search ? `?${search}` : '?')
    })
  }

  const currentCode = locale?.code ?? ''
  const currentOption =
    locales.find((option) => option.code === currentCode) ?? locales[0]
  const currentLabel = currentOption
    ? resolveLabel(currentOption, i18nLanguage)
    : currentCode

  return (
    <div
      ref={containerRef}
      className={`iropke-localizer${open ? ' iropke-localizer--open' : ''}`}
    >
      <button
        type="button"
        className="iropke-localizer__button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg
          className="iropke-localizer__icon"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M2.5 10h15M10 2.5c2.5 2.5 3.75 5 3.75 7.5S12.5 15 10 17.5C7.5 15 6.25 12.5 6.25 10S7.5 5 10 2.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="iropke-localizer__label">{currentLabel}</span>
        <svg
          className="iropke-localizer__chevron"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="iropke-localizer__menu" role="listbox">
          <div className="iropke-localizer__search-row">
            <input
              ref={inputRef}
              type="text"
              className="iropke-localizer__search-input"
              placeholder="Search language…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
              }}
              aria-label="Search language"
            />
          </div>
          <ul className="iropke-localizer__list">
            {filtered.length === 0 && (
              <li className="iropke-localizer__empty">No language found</li>
            )}
            {filtered.map((option) => {
              const label = resolveLabel(option, i18nLanguage)
              const isActive = option.code === currentCode
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    className={`iropke-localizer__item${
                      isActive ? ' iropke-localizer__item--active' : ''
                    }`}
                    role="option"
                    aria-selected={isActive}
                    disabled={isActive}
                    onClick={() => {
                      if (!isActive) selectLocale(option.code)
                    }}
                  >
                    <span className="iropke-localizer__item-label">{label}</span>
                    <span className="iropke-localizer__item-code">
                      ({option.code})
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

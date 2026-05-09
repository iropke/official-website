'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconGlobe, IconChevron } from '@/components/icons/SvgIcons';
import {
  LOCALES,
  LOCALE_LABELS_NATIVE,
  LOCALE_LABELS_EN,
  isLocale,
  type Locale,
} from '@/i18n/locales';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  /** 'nav' for header, 'footer' for footer placement */
  variant: 'nav' | 'footer';
}

/**
 * 검색 매칭 정규화. NFKD + lowercase 로 diacritic 무시 + 대소문자 무시.
 * 한자/아랍 등 합자 분해 영향이 없는 스크립트는 lowercase 만 적용된 것과 동일.
 */
function normalize(s: string): string {
  return s.normalize('NFKD').toLowerCase();
}

function matchesQuery(query: string, code: Locale): boolean {
  if (!query) return true;
  const q = normalize(query);
  return (
    code.includes(q) ||
    normalize(LOCALE_LABELS_NATIVE[code]).includes(q) ||
    normalize(LOCALE_LABELS_EN[code]).includes(q)
  );
}

function deriveCurrentLocale(pathname: string | null): Locale | undefined {
  if (!pathname) return undefined;
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : undefined;
}

export default function LanguageSelector({ variant }: LanguageSelectorProps) {
  const pathname = usePathname();
  const currentLocale = deriveCurrentLocale(pathname);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  // Reset search + focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  const filtered = useMemo(
    () => LOCALES.filter((code) => matchesQuery(query, code)),
    [query],
  );

  const variantClass = variant === 'footer' ? styles.footer : styles.nav;
  const currentLabel = currentLocale
    ? LOCALE_LABELS_NATIVE[currentLocale]
    : LOCALE_LABELS_NATIVE.en;

  /**
   * Replace the locale segment of the current path. If no locale segment
   * exists, prepend one. Keeps query/hash because we only operate on pathname.
   */
  function buildHref(code: Locale): string {
    if (!pathname) return `/${code}`;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${code}`;
    if (isLocale(segments[0])) {
      segments[0] = code;
    } else {
      segments.unshift(code);
    }
    return '/' + segments.join('/');
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.langSelect} ${variantClass} ${open ? styles.open : ''}`}
      aria-label="Language selector"
    >
      <button
        className={styles.button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.icon} aria-hidden="true">
          <IconGlobe />
        </span>
        <span className={styles.label}>{currentLabel}</span>
        <span className={styles.chevron} aria-hidden="true">
          <IconChevron />
        </span>
      </button>
      {open && (
        <div className={styles.menu} role="listbox">
          <div className={styles.searchRow}>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search language…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
              aria-label="Search language"
            />
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.empty}>No language found</li>
            )}
            {filtered.map((code) => (
              <li key={code}>
                <a
                  href={buildHref(code)}
                  className={`${styles.item} ${
                    code === currentLocale ? styles.itemActive : ''
                  }`}
                  role="option"
                  aria-selected={code === currentLocale}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.itemNative}>
                    {LOCALE_LABELS_NATIVE[code]}
                  </span>
                  <span className={styles.itemEn}>{LOCALE_LABELS_EN[code]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { IconGlobe, IconChevron } from '@/components/icons/SvgIcons';
import styles from './LanguageSelector.module.css';

export interface Language {
  code: string;
  label: string;
  href: string;
}

interface LanguageSelectorProps {
  /** Currently active language label */
  currentLabel: string;
  /** Available languages */
  languages: Language[];
  /** 'nav' for header, 'footer' for footer placement */
  variant: 'nav' | 'footer';
}

export default function LanguageSelector({
  currentLabel,
  languages,
  variant,
}: LanguageSelectorProps) {
  const variantClass = variant === 'footer' ? styles.footer : styles.nav;

  return (
    <div
      className={`${styles.langSelect} ${variantClass}`}
      aria-label="Language selector"
    >
      <button
        className={styles.button}
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className={styles.icon} aria-hidden="true">
          <IconGlobe />
        </span>
        <span className={styles.label}>{currentLabel}</span>
        <span className={styles.chevron} aria-hidden="true">
          <IconChevron />
        </span>
      </button>
      <div className={styles.menu} role="menu">
        {languages.map((lang) => (
          <a key={lang.code} href={lang.href} role="menuitem">
            {lang.label}
          </a>
        ))}
      </div>
    </div>
  );
}

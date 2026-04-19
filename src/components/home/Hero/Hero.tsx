import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

export interface HeroCta {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | null;
  id?: string | null;
}

export interface HeroProps {
  headline: string;
  subCopy?: string | null;
  ctas?: HeroCta[] | null;
  locale: string;
}

/**
 * Hero — Fixed declaration hero.
 * "From Visibility to Control" — static, dominant, no carousel.
 * Background: abstract system / structure visual (SVG grid + orbs).
 */
export default function Hero({ headline, subCopy, ctas, locale }: HeroProps) {
  const primaryCtas = (ctas ?? []).filter(Boolean);

  return (
    <section className={styles.hero} aria-label="Iropke hero" lang={locale}>
      <div className={styles.hero__canvas} aria-hidden="true">
        <div className={styles.hero__grid} />
        <div className={styles.hero__orbA} />
        <div className={styles.hero__orbB} />
      </div>

      <div className={`page-shell ${styles.hero__shell}`}>
        <p className={styles.hero__eyebrow}>
          <span className={styles.hero__eyebrowDot} aria-hidden="true" />
          IROPKE OS&trade;
        </p>

        <h1 className={styles.hero__headline}>{headline}</h1>

        {subCopy && (
          <p className={styles.hero__subCopy}>
            {subCopy.split(/\r?\n/).map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )}

        {primaryCtas.length > 0 && (
          <div className={styles.hero__ctaRow}>
            {primaryCtas.map((cta, i) => {
              const variant = cta.variant ?? (i === 0 ? 'primary' : 'secondary');
              const className =
                variant === 'primary'
                  ? `${styles.hero__cta} ${styles['hero__cta--primary']}`
                  : `${styles.hero__cta} ${styles['hero__cta--secondary']}`;

              // Resolve locale-aware URL for internal paths
              const href = cta.url.startsWith('/')
                ? `/${locale}${cta.url}`.replace(/\/+$/, '') || '/'
                : cta.url;

              return (
                <Link key={cta.id ?? `${variant}-${i}`} href={href} className={className}>
                  <span>{cta.label}</span>
                  <svg
                    className={styles.hero__ctaArrow}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}

        <div className={styles.hero__meta} aria-hidden="true">
          <span className={styles.hero__metaLabel}>01 / System Declaration</span>
          <span className={styles.hero__metaRule} />
          <span className={styles.hero__metaLabel}>Be chosen by AI, not just found</span>
        </div>
      </div>
    </section>
  );
}

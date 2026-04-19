import React from 'react';
import Link from 'next/link';
import styles from './CtaBanner.module.css';

export interface CtaBannerBackgroundImage {
  url?: string | null;
  alt?: string | null;
}

export interface CtaBannerProps {
  message: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  gradient?: string | null;
  backgroundImage?: CtaBannerBackgroundImage | number | null;
  locale: string;
}

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #22908b 0%, #15716d 100%)';

/**
 * CTA Banner — Final conversion hit.
 * "If your problem is bigger than a website, we should talk."
 * Full-width gradient banner, single primary CTA to project inquiry.
 */
export default function CtaBanner({
  message,
  ctaLabel = 'Start a Project',
  ctaUrl = '/project-inquiry',
  gradient,
  backgroundImage,
  locale,
}: CtaBannerProps) {
  const href = ctaUrl
    ? ctaUrl.startsWith('/')
      ? `/${locale}${ctaUrl}`.replace(/\/+$/, '') || '/'
      : ctaUrl
    : null;

  const bg = gradient || DEFAULT_GRADIENT;

  const bgImageUrl =
    typeof backgroundImage === 'object' && backgroundImage
      ? backgroundImage.url ?? null
      : null;
  const bgImageAlt =
    typeof backgroundImage === 'object' && backgroundImage
      ? backgroundImage.alt ?? ''
      : '';

  return (
    <section className={styles.section} aria-label="Project inquiry call to action">
      <div className="page-shell">
        <div className={styles.banner} style={{ background: bg }}>
          {bgImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bgImageUrl}
                alt={bgImageAlt}
                className={styles.banner__bgImage}
              />
              <div className={styles.banner__bgOverlay} aria-hidden="true" />
            </>
          )}
          <div className={styles.banner__grid} aria-hidden="true" />
          <div className={styles.banner__orb} aria-hidden="true" />

          <div className={styles.banner__content}>
            <p className={styles.banner__eyebrow}>
              <span className={styles.banner__eyebrowDot} aria-hidden="true" />
              NEXT STEP
            </p>

            <h2 className={styles.banner__message}>
              {message.split(/\r?\n/).map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>

            {href && ctaLabel && (
              <Link href={href} className={styles.banner__cta}>
                <span>{ctaLabel}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M3 9h12m0 0L10 4m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

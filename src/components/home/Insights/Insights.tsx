import React from 'react';
import Link from 'next/link';
import type { Post, Media } from '@/payload-types';
import styles from './Insights.module.css';

export interface InsightsBackgroundImage {
  url?: string | null;
  alt?: string | null;
}

export interface InsightsProps {
  sectionTitle?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  backgroundImage?: InsightsBackgroundImage | number | null;
  posts: Post[];
  locale: string;
}

function formatDate(dateString: string | null | undefined, locale: string) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

/**
 * Insights — Latest blog posts grid (2~8 cards based on Payload setting).
 * Data is fetched upstream (in page.tsx) so this component stays presentational.
 */
export default function Insights({
  sectionTitle = 'Latest Insights',
  ctaLabel = 'View All Insights',
  ctaUrl = '/insights',
  backgroundImage,
  posts,
  locale,
}: InsightsProps) {
  if (!posts || posts.length === 0) return null;

  const normalizedCtaUrl = ctaUrl
    ? ctaUrl.startsWith('/')
      ? `/${locale}${ctaUrl}`.replace(/\/+$/, '') || '/'
      : ctaUrl
    : null;

  const bgUrl =
    typeof backgroundImage === 'object' && backgroundImage
      ? backgroundImage.url ?? null
      : null;
  const bgAlt =
    typeof backgroundImage === 'object' && backgroundImage
      ? backgroundImage.alt ?? ''
      : '';

  return (
    <section className={styles.section} aria-label={sectionTitle ?? 'Insights'}>
      {bgUrl && (
        <div className={styles.section__bg} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgUrl} alt={bgAlt} className={styles.section__bgImage} />
          <div className={styles.section__bgOverlay} />
        </div>
      )}
      <div className={`page-shell ${styles.section__shell}`}>
        <header className={styles.section__header}>
          <div className={styles.section__headingGroup}>
            <p className={styles.section__eyebrow}>
              <span className={styles.section__eyebrowDot} aria-hidden="true" />
              INSIGHTS
            </p>
            <h2 className={styles.section__title}>{sectionTitle}</h2>
          </div>
          {normalizedCtaUrl && ctaLabel && (
            <Link href={normalizedCtaUrl} className={styles.section__cta}>
              <span>{ctaLabel}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
        </header>

        <ul className={styles.grid}>
          {posts.map((post) => {
            const thumb = post.thumbnail as Media | number | null | undefined;
            const thumbUrl =
              typeof thumb === 'object' && thumb ? thumb.url ?? null : null;
            const thumbAlt =
              typeof thumb === 'object' && thumb ? thumb.alt ?? post.title : post.title;
            const href = `/${locale}/insights/${post.slug}`;
            const date = formatDate(post.publishedDate, locale);

            return (
              <li key={post.id} className={styles.grid__item}>
                <Link href={href} className={styles.card}>
                  <div className={styles.card__thumb}>
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl}
                        alt={thumbAlt ?? ''}
                        loading="lazy"
                        className={styles.card__image}
                      />
                    ) : (
                      <div className={styles.card__placeholder} aria-hidden="true">
                        <span>{post.title?.charAt(0) ?? 'I'}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.card__body}>
                    <h3 className={styles.card__title}>{post.title}</h3>
                    {post.excerpt && (
                      <p className={styles.card__excerpt}>{post.excerpt}</p>
                    )}
                    <div className={styles.card__meta}>
                      {date && <span className={styles.card__date}>{date}</span>}
                      <span className={styles.card__arrow} aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2.5 7h9m0 0L7.5 3m4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import styles from './AIOSGrid.module.css';

export interface AIOSCard {
  name: string;
  tagline: string;
  description?: string | null;
  link?: string | null;
  gradient?: string | null;
  icon?:
    | {
        url?: string | null;
        alt?: string | null;
      }
    | number
    | null;
  id?: string | null;
}

export interface AIOSGridProps {
  sectionTitle?: string | null;
  cards: AIOSCard[] | null | undefined;
  locale: string;
}

// Fallback gradients matching the brand palette for the four modules
const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #1f4a44 0%, #0d201d 100%)', // NOVA
  'linear-gradient(135deg, #345347 0%, #0f1a17 100%)', // SAGE
  'linear-gradient(135deg, #1d4960 0%, #111922 100%)', // LUMI
  'linear-gradient(135deg, #3d4c26 0%, #162013 100%)', // NIX
];

/**
 * AI OS Grid — 4 system modules (NOVA, SAGE, LUMI, NIX).
 * Feels like system modules, not service cards. Hover interactions reveal description.
 */
export default function AIOSGrid({
  sectionTitle = 'IROPKE OS™',
  cards,
  locale,
}: AIOSGridProps) {
  const validCards = (cards ?? []).filter((c) => c && c.name && c.tagline);
  if (validCards.length === 0) return null;

  return (
    <section className={styles.section} aria-label={sectionTitle ?? undefined}>
      <div className={`page-shell ${styles.section__shell}`}>
        <header className={styles.section__header}>
          <p className={styles.section__eyebrow}>
            <span className={styles.section__eyebrowDot} aria-hidden="true" />
            AI OPERATING SYSTEM
          </p>
          <h2 className={styles.section__title}>{sectionTitle}</h2>
          <p className={styles.section__lede}>
            Four system modules. One unified operating system for digital business.
          </p>
        </header>

        <ul className={styles.grid}>
          {validCards.map((card, i) => {
            const gradient =
              card.gradient || DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length];
            const iconUrl =
              typeof card.icon === 'object' && card.icon ? card.icon.url : null;
            const iconAlt =
              typeof card.icon === 'object' && card.icon ? card.icon.alt ?? card.name : card.name;

            const href = card.link
              ? card.link.startsWith('/')
                ? `/${locale}${card.link}`.replace(/\/+$/, '') || '/'
                : card.link
              : null;

            const cardNumber = String(i + 1).padStart(2, '0');

            const cardBody = (
              <>
                <div className={styles.card__media} style={{ background: gradient }} aria-hidden="true">
                  <span className={styles.card__number}>{cardNumber}</span>
                  {iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconUrl} alt={iconAlt ?? ''} className={styles.card__icon} />
                  ) : (
                    <span className={styles.card__moduleMark} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                  <div className={styles.card__mediaGrid} />
                </div>

                <div className={styles.card__body}>
                  <div className={styles.card__head}>
                    <h3 className={styles.card__name}>{card.name}</h3>
                    {href && (
                      <span className={styles.card__arrow} aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className={styles.card__tagline}>{card.tagline}</p>
                  {card.description && (
                    <p className={styles.card__description}>{card.description}</p>
                  )}
                </div>
              </>
            );

            return (
              <li key={card.id ?? card.name} className={styles.grid__item}>
                {href ? (
                  <Link href={href} className={styles.card}>
                    {cardBody}
                  </Link>
                ) : (
                  <div className={styles.card}>{cardBody}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

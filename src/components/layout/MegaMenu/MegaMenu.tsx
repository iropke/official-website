'use client';

import React from 'react';
import styles from './MegaMenu.module.css';

export interface MegaMenuItem {
  title: string;
  description: string;
  href: string;
  kicker: string;
  gradient: string;
  /** Card background image URL. Rendered over the gradient when present. */
  mediaUrl?: string;
  mediaAlt?: string;
  /** linkType === 'external' → open in a new tab. */
  external?: boolean;
}

export interface MegaMenuGroup {
  label: string;
  items: MegaMenuItem[];
}

interface MegaMenuProps {
  items: MegaMenuItem[];
  isOpen: boolean;
  ariaLabel: string;
}

export default function MegaMenu({ items, isOpen, ariaLabel }: MegaMenuProps) {
  return (
    <div
      className={`${styles.mega} ${isOpen ? styles.megaOpen : ''}`}
      role="group"
      aria-label={ariaLabel}
    >
      <div className={styles.megaGrid}>
        {items.map((item) => (
          <div key={item.title} className={styles.megaCard}>
            <a
              className={styles.card}
              href={item.href}
              {...(item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <div
                className={styles.cardMedia}
                data-kicker={item.kicker}
                style={{ '--card-gradient': item.gradient } as React.CSSProperties}
              >
                {item.mediaUrl ? (
                  <img
                    className={styles.cardMediaImg}
                    src={item.mediaUrl}
                    alt={item.mediaAlt ?? ''}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className={styles.cardBody}>
                <h3
                  className={styles.cardTitle}
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p className={styles.cardDesc}>{item.description}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

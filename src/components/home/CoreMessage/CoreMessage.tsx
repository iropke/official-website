import React from 'react';
import styles from './CoreMessage.module.css';

export interface CoreMessageProps {
  message: string;
  subtext?: string | null;
}

/**
 * Core Message — single impact line that pauses scroll.
 * Wide whitespace, Georgia serif, reinforces system concept.
 */
export default function CoreMessage({ message, subtext }: CoreMessageProps) {
  return (
    <section className={styles.section} aria-label="Core message">
      <div className={`page-shell ${styles.section__shell}`}>
        <div className={styles.section__inner}>
          <span className={styles.section__mark} aria-hidden="true">
            <span />
            <span />
          </span>

          <h2 className={styles.section__message}>{message}</h2>

          {subtext && <p className={styles.section__subtext}>{subtext}</p>}

          <span className={styles.section__rule} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

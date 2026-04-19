'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IconArrowUp, IconChat } from '@/components/icons/SvgIcons';
import styles from './FloatingActions.module.css';

interface FloatingActionsProps {
  /** URL for project inquiry page */
  inquiryHref?: string;
}

export default function FloatingActions({ inquiryHref = '/project-inquiry' }: FloatingActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function syncTopButton() {
      setShowScrollTop(window.scrollY >= 240);
    }
    window.addEventListener('scroll', syncTopButton, { passive: true });
    syncTopButton();
    return () => window.removeEventListener('scroll', syncTopButton);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.actions} aria-label="Quick actions">
      <button
        className={`${styles.button} ${!showScrollTop ? styles.hidden : ''}`}
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <span className={styles.label}>Back to top</span>
        <IconArrowUp className={styles.icon} />
      </button>

      <a
        className={`${styles.button} ${styles.chat}`}
        href={inquiryHref}
        aria-label="Project inquiry"
      >
        <span className={styles.label}>Project Inquiry</span>
        <IconChat className={styles.icon} />
      </a>
    </div>
  );
}

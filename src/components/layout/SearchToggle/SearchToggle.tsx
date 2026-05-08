'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { IconSearch } from '@/components/icons/SvgIcons';
import { normalizeLocale } from '@/i18n/locales';
import styles from './SearchToggle.module.css';

export default function SearchToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname() ?? '/';
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  const locale = normalizeLocale(segment);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.search} ${isOpen ? styles.searchOpen : ''}`}
    >
      <button
        className={styles.iconButton}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="layoutSearchInput"
        aria-label="Open search"
      >
        <IconSearch className={styles.icon} />
      </button>
      <form
        className={styles.searchForm}
        action={`/${locale}/search`}
        method="GET"
        role="search"
      >
        <label className="sr-only" htmlFor="layoutSearchInput">Search site</label>
        <input
          ref={inputRef}
          className={styles.searchInput}
          id="layoutSearchInput"
          type="search"
          name="q"
          placeholder="Search for content"
        />
      </form>
    </div>
  );
}

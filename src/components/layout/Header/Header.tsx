'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IconChevron, IconMenu, IconClose } from '@/components/icons/SvgIcons';
import MegaMenu, { type MegaMenuGroup } from '../MegaMenu/MegaMenu';
import SearchToggle from '../SearchToggle/SearchToggle';
import LanguageSelector, { type Language } from '../LanguageSelector/LanguageSelector';
import styles from './Header.module.css';

/** Static navigation data — will be replaced by Payload CMS Navigation Global */
const navigationData: MegaMenuGroup[] = [
  {
    label: 'About',
    items: [
      { title: 'Philosophy', description: 'A quiet, structured approach that turns complex business goals into clearer digital systems.', href: '#', kicker: 'Philosophy', gradient: 'linear-gradient(135deg, #1f4a44, #0d201d)' },
      { title: 'Key Milestones', description: 'A selective timeline of major website, commerce, and platform transformation projects.', href: '#', kicker: 'Milestones', gradient: 'linear-gradient(135deg, #24403f, #101b20)' },
      { title: 'Business Scope', description: 'Strategy, UX, design, development, localization, and operating model support under one structure.', href: '#', kicker: 'Scope', gradient: 'linear-gradient(135deg, #264f38, #0f1f18)' },
      { title: 'Location', description: 'A studio based in Seoul, working with teams that need a calm execution partner across regional and global projects.', href: '#', kicker: 'Location', gradient: 'linear-gradient(135deg, #1d344d, #101b24)' },
    ],
  },
  {
    label: 'Solution',
    items: [
      { title: 'Corpis&trade;', description: 'Corporate website architecture for organizations that need trust, clarity, and scale.', href: '#', kicker: 'Corpis', gradient: 'linear-gradient(135deg, #1c4d45, #112925)' },
      { title: 'Zinis&trade;', description: 'Editorial and insight publishing systems that keep stories organized and discoverable.', href: '#', kicker: 'Zinis', gradient: 'linear-gradient(135deg, #225245, #13282d)' },
      { title: 'Nix&trade;', description: 'Structured web experiences designed for multilingual growth and operational simplicity.', href: '#', kicker: 'Nix', gradient: 'linear-gradient(135deg, #364f25, #121f13)' },
      { title: 'Sage&trade;', description: 'Strategic intelligence layers for content systems, SEO, and AI answer visibility.', href: '#', kicker: 'Sage', gradient: 'linear-gradient(135deg, #345347, #0f1a17)' },
      { title: 'Lumi&trade;', description: 'Performance-focused design and service patterns that make complex interfaces feel lighter.', href: '#', kicker: 'Lumi', gradient: 'linear-gradient(135deg, #1d4960, #111922)' },
    ],
  },
  {
    label: 'Service',
    items: [
      { title: 'AEO Optimization', description: 'Help your site become more citation-ready for AI-generated answers through structure, schema, and content logic.', href: '#', kicker: 'AEO', gradient: 'linear-gradient(135deg, #22564f, #112523)' },
      { title: 'Web Service Build', description: 'From discovery to delivery, we shape business-facing web services with durable UX foundations.', href: '#', kicker: 'Build', gradient: 'linear-gradient(135deg, #25484f, #111b26)' },
      { title: 'Commerce Platform Build', description: 'Commerce systems and storefront planning for brands that need structure beyond templates.', href: '#', kicker: 'Commerce', gradient: 'linear-gradient(135deg, #3d4c26, #162013)' },
    ],
  },
  {
    label: 'Archive',
    items: [
      { title: 'Insight', description: 'Perspectives on search, AI answers, structured websites, and calm digital strategy.', href: '/en/insights', kicker: 'Insight', gradient: 'linear-gradient(135deg, #1d4a45, #12191b)' },
      { title: 'Story', description: 'Selected narratives around brand evolution, collaboration, and behind-the-scenes decisions.', href: '#', kicker: 'Story', gradient: 'linear-gradient(135deg, #335565, #131d24)' },
      { title: 'Portfolio', description: 'A concise view of outcome-driven projects across websites, platforms, and commerce experiences.', href: '#', kicker: 'Portfolio', gradient: 'linear-gradient(135deg, #40512e, #151d15)' },
    ],
  },
];

const languages: Language[] = [
  { code: 'en', label: 'English', href: '/en' },
  { code: 'ko', label: 'Korean', href: '/ko' },
];

export default function Header() {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const desktopQuery = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    desktopQuery.current = window.matchMedia('(min-width: 1080px)');

    const handler = () => {
      if (desktopQuery.current?.matches) {
        setIsMobileOpen(false);
        setOpenMenuIndex(null);
      }
    };

    desktopQuery.current.addEventListener('change', handler);
    return () => desktopQuery.current?.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null);
        setIsMobileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('layout-mobile-nav-open');
    } else {
      document.body.classList.remove('layout-mobile-nav-open');
    }
    return () => document.body.classList.remove('layout-mobile-nav-open');
  }, [isMobileOpen]);

  const toggleMenuItem = useCallback((index: number) => {
    setOpenMenuIndex((prev) => (prev === index ? null : index));
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
    if (isMobileOpen) {
      setOpenMenuIndex(null);
    }
  }, [isMobileOpen]);

  const navClassName = [
    styles.nav,
    isMobileOpen ? styles.navMobileOpen : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <nav ref={navRef} className={navClassName} aria-label="Primary navigation">
          {/* Logo */}
          <div className={styles.logo}>
            <a className={styles.logoLink} href="/" aria-label="Iropke home">
              <span className={styles.logoBadge}>
                {/* Replace with actual SVG logo */}
                <img src="/assets/svg/iropke_symbol.svg" alt="Iropke logo" width={200} height={35} />
              </span>
            </a>
          </div>

          {/* Mobile Panel Wrapper */}
          <div className={styles.mobilePanel}>
            {/* Desktop/Tablet Menu */}
            <div className={styles.menu} id="primaryMenu">
              <ul className={styles.menuList}>
                {navigationData.map((group, index) => (
                  <li
                    key={group.label}
                    className={`${styles.item} ${openMenuIndex === index ? styles.itemOpen : ''}`}
                    data-mobile-item
                  >
                    <button
                      className={styles.primary}
                      type="button"
                      aria-expanded={openMenuIndex === index}
                      onClick={() => toggleMenuItem(index)}
                    >
                      <span>{group.label}</span>
                      <IconChevron className={styles.chevron} aria-hidden="true" />
                    </button>
                    <MegaMenu
                      items={group.items}
                      isOpen={openMenuIndex === index}
                      ariaLabel={`${group.label} menu`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Utilities: Search + Language + Mobile Toggle */}
          <div className={styles.utilities}>
            <SearchToggle />

            <LanguageSelector
              currentLabel="English"
              languages={languages}
              variant="nav"
            />

            <button
              className={styles.menuToggle}
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileOpen}
              aria-controls="primaryMenu"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? (
                <IconClose className={styles.menuIcon} />
              ) : (
                <IconMenu className={styles.menuIcon} />
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

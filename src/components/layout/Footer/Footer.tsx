'use client';

import React from 'react';
import { IconLinkedIn, IconInstagram, IconYouTube } from '@/components/icons/SvgIcons';
import LanguageSelector, { type Language } from '../LanguageSelector/LanguageSelector';
import styles from './Footer.module.css';

const languages: Language[] = [
  { code: 'en', label: 'English', href: '/en' },
  { code: 'ko', label: 'Korean', href: '/ko' },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/iropke', Icon: IconLinkedIn },
  { label: 'Instagram', href: 'https://www.instagram.com/iropke/', Icon: IconInstagram },
  { label: 'YouTube', href: 'https://www.youtube.com/@iropke', Icon: IconYouTube },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.inner}>
          {/* Top Row: Language + Social */}
          <div className={styles.rowTop}>
            <LanguageSelector
              currentLabel="English"
              languages={languages}
              variant="footer"
            />

            <div className={styles.social} aria-label="Social media links">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  className={styles.socialLink}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Bottom Row: Copyright + Policy */}
          <div className={styles.rowBottom}>
            <div className={styles.left}>
              <p className={styles.copy}>&copy; Iropke All Rights Reserved.</p>
              <a className={styles.policy} href="/privacy-policy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

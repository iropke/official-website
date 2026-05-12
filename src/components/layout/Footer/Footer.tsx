'use client';

import React from 'react';
import { IconLinkedIn, IconInstagram, IconYouTube } from '@/components/icons/SvgIcons';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import styles from './Footer.module.css';

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/iropke', Icon: IconLinkedIn },
  { label: 'Instagram', href: 'https://www.instagram.com/iropke/', Icon: IconInstagram },
  { label: 'YouTube', href: 'https://www.youtube.com/@iropke', Icon: IconYouTube },
];

interface FooterProps {
  privacyHref: string;
}

export default function Footer({ privacyHref }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.inner}>
          {/* Top Row: Language + Social */}
          <div className={styles.rowTop}>
            <LanguageSelector variant="footer" />

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
              <a className={styles.policy} href={privacyHref}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React from 'react';
import { IconLinkedIn, IconInstagram, IconYouTube } from '@/components/icons/SvgIcons';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import styles from './Footer.module.css';

type SocialPlatform = 'linkedin' | 'instagram' | 'youtube' | 'twitter' | 'facebook';

/** Platforms we have an icon for. Others are skipped rather than rendered blank. */
const SOCIAL_ICONS: Partial<
  Record<SocialPlatform, { label: string; Icon: React.ComponentType<React.SVGAttributes<SVGSVGElement>> }>
> = {
  linkedin: { label: 'LinkedIn', Icon: IconLinkedIn },
  instagram: { label: 'Instagram', Icon: IconInstagram },
  youtube: { label: 'YouTube', Icon: IconYouTube },
};

/**
 * Used only when the `site-settings` global has no visible social links
 * (never edited in admin). Keeps the footer from going blank.
 */
const FALLBACK_SOCIAL: { platform: SocialPlatform; url: string }[] = [
  { platform: 'linkedin', url: 'https://www.linkedin.com/company/iropke' },
  { platform: 'instagram', url: 'https://www.instagram.com/iropke/' },
  { platform: 'youtube', url: 'https://www.youtube.com/@iropke' },
];

interface FooterProps {
  /** Final, locale-resolved privacy policy href. */
  privacyHref: string;
  /** From `site-settings.footerCopyright` (localized). */
  copyright: string;
  /** From `site-settings.socialLinks` (visible only). Empty → fallback. */
  socialLinks: { platform: SocialPlatform; url: string }[];
}

export default function Footer({ privacyHref, copyright, socialLinks }: FooterProps) {
  const links = socialLinks.length > 0 ? socialLinks : FALLBACK_SOCIAL;

  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.inner}>
          {/* Top Row: Language + Social */}
          <div className={styles.rowTop}>
            <LanguageSelector variant="footer" />

            <div className={styles.social} aria-label="Social media links">
              {links.map(({ platform, url }) => {
                const icon = SOCIAL_ICONS[platform];
                if (!icon) return null;
                const { label, Icon } = icon;
                return (
                  <a
                    key={platform}
                    className={styles.socialLink}
                    href={url}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Copyright + Policy */}
          <div className={styles.rowBottom}>
            <div className={styles.left}>
              <p className={styles.copy}>{copyright}</p>
              <a className={styles.policy} href={privacyHref}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

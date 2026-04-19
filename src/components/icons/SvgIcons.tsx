/**
 * SVG Icon Components
 * Source: references/design/en/assets/svg/
 *
 * Inline SVG components for tree-shaking and styling flexibility.
 * Each icon accepts standard SVG props (className, width, height, etc.)
 */
import React from 'react';

type IconProps = React.SVGAttributes<SVGSVGElement>;

export function IconSearch(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12h20M12 2c2.5 2.8 4 6.2 4 10s-1.5 7.2-4 10c-2.5-2.8-4-6.2-4-10s1.5-7.2 4-10z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLinkedIn(props: IconProps) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconYouTube(props: IconProps) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

export function IropkeSymbol(props: IconProps) {
  return (
    <svg width="200" height="35" viewBox="0 0 200 35" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Placeholder — replace with actual Iropke symbol SVG paths */}
      <text x="0" y="24" fontFamily="var(--font-display)" fontWeight="700" fontSize="22" fill="currentColor">
        IROPKE
      </text>
    </svg>
  );
}

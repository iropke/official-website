#!/usr/bin/env node
// One-off: check Payload DB state for multiple clusters at once.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const websiteRoot = resolve(__dirname, '..');

function loadEnv(envPath) {
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv(resolve(websiteRoot, '.env'));
if (process.env.DATABASE_URL_DIRECT) process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT;
process.env.NODE_ENV = 'production';

const clusters = {
  'privacy-compliance': [
    'web-cookies-privacy-law-guide',
    'gdpr-cookie-consent-2026',
    'pipa-cookie-consent-korea',
    'cookie-banner-ux-patterns',
    'cmp-build-vs-buy',
    'pipl-china-cookie-consent',
    'us-state-privacy-cookie-compliance',
    'uk-gdpr-pecr-cookie-consent',
    'lgpd-brazil-cookie-consent',
    'uae-pdpl-cookie-consent',
    'cross-border-data-transfer-2026',
    'dsar-engineering-fulfillment-at-scale',
    'dpia-practitioner-guide-2026',
    'data-breach-notification-72-hour-playbook',
    'ai-privacy-law-2026',
    'childrens-privacy-online-2026',
    'gdpr-ropa-dpa-dpo-operations-guide',
    'biometric-data-privacy-compliance-2026',
    'eu-ehds-health-data-privacy-2026',
    'privacy-vendor-due-diligence-2026',
  ],
  'accessibility-wcag': [
    'wcag-accessibility-guide-2026',
    'wcag-color-contrast-ratios',
    'keyboard-navigation-wcag',
    'accessible-data-tables',
    'aria-when-not-to-use',
    'accessible-forms-wcag',
    'image-alt-text-decision-tree',
    'focus-management-spa',
    'wcag-2-2-whats-new',
    'accessibility-law-2026-comparison',
    'screen-reader-testing-guide',
    'media-accessibility-captions-audio-description',
    'headings-landmarks-page-structure',
    'cognitive-accessibility-plain-language',
    'accessible-name-accessibility-tree',
  ],
};

const { getPayload } = await import('payload');
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default;
const payload = await getPayload({ config });

for (const [cluster, slugs] of Object.entries(clusters)) {
  const r = await payload.find({
    collection: 'posts',
    where: { slug: { in: slugs } },
    limit: 100,
    locale: 'en',
    depth: 0,
    draft: true,
  });

  console.log(`\n=== ${cluster} (${r.docs.length}/${slugs.length} in DB) ===`);
  for (const d of r.docs.sort((a,b)=>a.id-b.id)) {
    console.log(`  id=${String(d.id).padEnd(3)}  slug=${d.slug.padEnd(50)}  status=${d._status}  role=${(d.clusterRole||'').padEnd(6)}  pub=${d.publishedDate}`);
  }
  const found = new Set(r.docs.map(x => x.slug));
  const missing = slugs.filter(s => !found.has(s));
  if (missing.length) {
    console.log(`  Missing: ${missing.length}`);
    for (const s of missing) console.log('    -', s);
  }
}

process.exit(0);

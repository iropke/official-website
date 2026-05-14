#!/usr/bin/env node
// One-off: check Payload DB state for AEO cluster slugs using Local API.
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

const slugs = [
  'aeo-complete-guide-2026',
  'aeo-content-strategy',
  'aeo-vs-traditional-seo',
  'direct-answer-paragraph-patterns',
  'question-led-headings-aeo',
  'faq-schema-for-aeo',
  'aeo-for-b2b-saas',
  'aeo-measurement-and-tracking',
  'aeo-for-ai-overview-and-perplexity',
  'tldr-extractability-patterns',
];

const { getPayload } = await import('payload');
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default;
const payload = await getPayload({ config });

const r = await payload.find({
  collection: 'posts',
  where: { slug: { in: slugs } },
  limit: 100,
  locale: 'en',
  depth: 0,
});

console.log(`Found ${r.docs.length}/${slugs.length} AEO posts in DB:\n`);
for (const d of r.docs) {
  console.log(`  id=${d.id}  slug=${d.slug}  status=${d._status}  cluster=${d.cluster}  role=${d.clusterRole}  cat=${d.category}  pub=${d.publishedDate}`);
}

const found = new Set(r.docs.map(x => x.slug));
const missing = slugs.filter(s => !found.has(s));
console.log(`\nMissing (not in DB): ${missing.length}`);
for (const s of missing) console.log('  -', s);

process.exit(0);

#!/usr/bin/env node
// One-off: check tag names created during AEO import (acronym handling).
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

const tagSlugs = ['aeo','ai-search','content-strategy','answer-engine','seo','b2b-saas','schema','structured-data','analytics','measurement','google','perplexity','writing-craft'];

const { getPayload } = await import('payload');
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default;
const payload = await getPayload({ config });

const r = await payload.find({
  collection: 'tags',
  where: { slug: { in: tagSlugs } },
  limit: 100,
  locale: 'en',
  depth: 0,
});

console.log(`Found ${r.docs.length}/${tagSlugs.length} AEO-related tags:\n`);
for (const d of r.docs.sort((a,b)=>a.slug.localeCompare(b.slug))) {
  console.log(`  slug=${d.slug.padEnd(20)} name="${d.name}"`);
}

process.exit(0);

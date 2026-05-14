#!/usr/bin/env node
// One-off: fix Tags.name for slug='aeo' to "AEO" (humanize() lacks AEO).
// Per CLAUDE.md §2-A acronym policy fallback procedure.
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

const { getPayload } = await import('payload');
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default;
const payload = await getPayload({ config });

const find = await payload.find({
  collection: 'tags',
  where: { slug: { equals: 'aeo' } },
  limit: 1,
  locale: 'en',
});

if (find.docs.length === 0) {
  console.log('No aeo tag found.');
  process.exit(0);
}

const tag = find.docs[0];
console.log(`Before: id=${tag.id} slug=${tag.slug} name="${tag.name}"`);

if (tag.name === 'AEO') {
  console.log('Already correct, no update needed.');
  process.exit(0);
}

const updated = await payload.update({
  collection: 'tags',
  id: tag.id,
  data: { name: 'AEO' },
  locale: 'en',
});

console.log(`After:  id=${updated.id} slug=${updated.slug} name="${updated.name}"`);
process.exit(0);

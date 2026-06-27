#!/usr/bin/env node
/**
 * flip-with-date.mjs — publish a single Post with an explicit (staggered, possibly future) publishedDate.
 *
 * Why this exists: upload-and-import.ts leaves publishedDate empty and the
 * autoFillPublishedDate hook fills it with import time; drip-publish-queue.mjs
 * flips _status only. The origin weekly drip routine needs each spoke published
 * with a future, staggered publishedDate (Mon..Sun) so the PR #74 visibility
 * gate surfaces them one per day. This sets both in one update.
 *
 *   pnpm tsx scripts/flip-with-date.mjs <slug> <ISO-8601-date>
 *
 * Example:
 *   pnpm tsx scripts/flip-with-date.mjs first-voip-call 2026-06-22T04:00:00.000Z
 *
 * Side effects:
 *   - Posts: _status='published', publishedDate=<date> (locale en, overrideAccess)
 *   - syncs content-generation/{category}/{slug}/payload-imported.json (status + publishedDate)
 * Idempotent-ish: if already published it still updates the date (so re-runs converge).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const websiteRoot = resolve(__dirname, '..')
const contentRoot = resolve(websiteRoot, '..', 'content-generation')
const CATEGORY_DIRS = ['insight', 'story', 'portfolio', 'solution', 'service', 'origin']

function loadEnv(envPath) {
  if (!existsSync(envPath)) return
  for (const rawLine of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const k = line.slice(0, eq).trim()
    let v = line.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
  }
}

loadEnv(resolve(websiteRoot, '.env'))
if (process.env.DATABASE_URL_DIRECT) process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT
process.env.NODE_ENV = 'production'

const slug = process.argv[2]
const dateArg = process.argv[3]
if (!slug || !dateArg) {
  console.error('Usage: pnpm tsx scripts/flip-with-date.mjs <slug> <ISO-8601-date>')
  process.exit(1)
}
const date = new Date(dateArg)
if (Number.isNaN(date.getTime())) {
  console.error(`[ERR] invalid date: ${dateArg}`)
  process.exit(1)
}
const iso = date.toISOString()

const { getPayload } = await import('payload')
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default
const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'posts',
  where: { slug: { equals: slug } },
  limit: 1,
  overrideAccess: true,
  draft: true,
  locale: 'en',
})
if (!docs[0]) {
  console.error(`[ERR] Post not found: ${slug}`)
  process.exit(2)
}

const updated = await payload.update({
  collection: 'posts',
  id: docs[0].id,
  data: { _status: 'published', publishedDate: iso },
  locale: 'en',
  overrideAccess: true,
})
console.log(`[OK] ${slug} id=${updated.id} status=${updated._status} publishedDate=${updated.publishedDate}`)

// sync the content-generation marker (find which category dir holds this slug)
for (const cat of CATEGORY_DIRS) {
  const markerPath = resolve(contentRoot, cat, slug, 'payload-imported.json')
  if (existsSync(markerPath)) {
    const m = JSON.parse(readFileSync(markerPath, 'utf8'))
    m.status = 'published'
    m.publishedDate = iso
    writeFileSync(markerPath, JSON.stringify(m, null, 2) + '\n', 'utf8')
    console.log(`     marker synced: ${cat}/${slug}/payload-imported.json`)
    break
  }
}
process.exit(0)

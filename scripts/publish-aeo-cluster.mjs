#!/usr/bin/env node
/**
 * Bulk-publish the AEO cluster (10 slugs) in a single Payload init.
 * Per CLAUDE.md §4-C Q2 cluster-day publish policy: same-day batch flip.
 *
 *   pnpm tsx scripts/publish-aeo-cluster.mjs
 *   pnpm tsx scripts/publish-aeo-cluster.mjs --dry-run
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const websiteRoot = resolve(__dirname, '..')

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

const DRY_RUN = process.argv.includes('--dry-run')

const AEO_SLUGS = [
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
]

const { getPayload } = await import('payload')
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default
const payload = await getPayload({ config })

let published = 0, alreadyPublished = 0, failed = 0, notFound = 0

for (const slug of AEO_SLUGS) {
  try {
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
      locale: 'en',
    })
    if (!docs[0]) {
      console.error(`[NOT FOUND] ${slug}`)
      notFound++
      continue
    }
    const post = docs[0]
    if (post._status === 'published') {
      console.log(`[SKIP] ${slug} (id=${post.id}) already published`)
      alreadyPublished++
      continue
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] would publish ${slug} (id=${post.id}, current=${post._status})`)
      continue
    }
    const updated = await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'published' },
      locale: 'en',
      overrideAccess: true,
    })
    console.log(`[OK] ${slug} (id=${updated.id}) → ${updated._status}`)
    published++
  } catch (err) {
    console.error(`[ERR] ${slug}:`, err?.message ?? err)
    failed++
  }
}

console.log('\n────────────────────────────────────────')
console.log(`[DONE] published=${published} alreadyPublished=${alreadyPublished} failed=${failed} notFound=${notFound}`)
process.exit(failed > 0 ? 1 : 0)

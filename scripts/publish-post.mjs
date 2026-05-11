#!/usr/bin/env node
/**
 * 특정 slug 의 Post 를 published 상태로 업데이트.
 *   pnpm tsx scripts/publish-post.mjs <slug>
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (process.env[k] === undefined) process.env[k] = v
  }
}

loadEnv(resolve(websiteRoot, '.env'))
if (process.env.DATABASE_URL_DIRECT) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT
}
process.env.NODE_ENV = 'production'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: pnpm tsx scripts/publish-post.mjs <slug>')
  process.exit(1)
}

const { getPayload } = await import('payload')
const config = (
  await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)
).default

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

const post = docs[0]
console.log(`[FOUND] id=${post.id} slug=${post.slug} status=${post._status}`)

if (post._status === 'published') {
  console.log('[OK] already published')
  process.exit(0)
}

const updated = await payload.update({
  collection: 'posts',
  id: post.id,
  data: { _status: 'published' },
  locale: 'en',
  overrideAccess: true,
})

console.log(`[DONE] id=${updated.id} status=${updated._status} publishedDate=${updated.publishedDate ?? '(hook)'}`)
process.exit(0)

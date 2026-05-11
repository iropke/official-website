#!/usr/bin/env node
/**
 * 현재 Posts / Media / Tags 상태 점검.
 *   --inspect (default): 카운트 + 샘플 출력 (read-only)
 *   --reset: 모든 Post / Media / Tag 삭제 (확인 필요)
 *
 * 실행: D:\Claude\iropke\website 에서
 *   pnpm tsx scripts/inspect-and-reset-posts.mjs
 *   pnpm tsx scripts/inspect-and-reset-posts.mjs --reset
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

const RESET = process.argv.includes('--reset')

const { getPayload } = await import('payload')
const config = (
  await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)
).default

const payload = await getPayload({ config })
console.log('[INFO] Payload 초기화 완료.\n')

// ── Inspect
const posts = await payload.find({
  collection: 'posts',
  limit: 100,
  overrideAccess: true,
  draft: true,
  locale: 'en',
})
const tags = await payload.find({ collection: 'tags', limit: 100, overrideAccess: true })
const media = await payload.find({ collection: 'media', limit: 100, overrideAccess: true })

console.log(`Posts: ${posts.totalDocs}`)
for (const p of posts.docs) {
  console.log(
    `  - id=${p.id} slug=${p.slug} status=${p._status} category=${p.category ?? '?'} cluster=${p.cluster ?? '?'}/${p.clusterRole ?? '?'}`,
  )
}
console.log(`\nMedia: ${media.totalDocs}`)
for (const m of media.docs.slice(0, 10)) {
  console.log(`  - id=${m.id} alt='${m.alt ?? ''}' filename=${m.filename ?? '?'}`)
}
console.log(`\nTags: ${tags.totalDocs}`)
for (const t of tags.docs.slice(0, 20)) {
  console.log(`  - id=${t.id} slug=${t.slug} name='${t.name ?? ''}'`)
}

if (!RESET) {
  console.log('\n[OK] inspection only (use --reset to delete all)')
  process.exit(0)
}

// ── Reset
console.log('\n[RESET] Deleting all posts, media, and tags...')

for (const p of posts.docs) {
  await payload.delete({ collection: 'posts', id: p.id, overrideAccess: true })
  console.log(`   ✓ post id=${p.id} (${p.slug}) deleted`)
}
for (const m of media.docs) {
  await payload.delete({ collection: 'media', id: m.id, overrideAccess: true })
  console.log(`   ✓ media id=${m.id} deleted`)
}
for (const t of tags.docs) {
  await payload.delete({ collection: 'tags', id: t.id, overrideAccess: true })
  console.log(`   ✓ tag id=${t.id} (${t.slug}) deleted`)
}

console.log('\n[DONE] All posts / media / tags deleted.')
process.exit(0)

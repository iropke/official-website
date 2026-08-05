#!/usr/bin/env node
/**
 * Posts 의 _status (draft / published) 와 publishedLocales 매칭 상태 종합 점검.
 *
 * 목적: front 에서 미공개 글이 노출되는 원인 진단.
 *   - frontend 쿼리 (publishedLocales: { equals: locale }) 는 admin 이 수동 체크하는
 *     publishedLocales 필드만 검사 + Payload `draft: false` 기본값으로 _status=draft 제외.
 *   - 그러나 다음 케이스는 누출 위험:
 *     (a) _status='draft' 인데 publishedLocales 에 locale 체크됨 — 안전 (draft:false 가 제외)
 *     (b) _status='published' 인데 publishedLocales 비어있음 — UX 모순 (admin 에서 published 인데 front 비노출)
 *     (c) frontend find() 가 (a) 도 반환한다면 ← Payload 버전 시스템 우회 의심
 *
 * Read-only.
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

const { getPayload } = await import('payload')
const config = (
  await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)
).default
const payload = await getPayload({ config })

// ─── (1) 모든 Posts 의 main row (draft 포함) ──────────────────────
const all = await payload.find({
  collection: 'posts',
  limit: 500,
  overrideAccess: true,
  draft: true, // ← latest version 모두 (_status 무관)
  locale: 'en',
  depth: 0,
})

console.log(`\n=== ALL POSTS (draft:true, latest version) — total=${all.totalDocs} ===\n`)
const drafts = []
const publishedNoLocales = []
const orphan = [] // draft + locales 있음 (UX 혼란 후보)

for (const p of all.docs) {
  const locales = Array.isArray(p.publishedLocales) ? p.publishedLocales : []
  const hasEn = locales.includes('en')
  const status = p._status
  const flag = status === 'draft' && locales.length > 0 ? ' ⚠ DRAFT+LOCALES' : ''
  const flag2 = status === 'published' && locales.length === 0 ? ' ⚠ PUB+NOLOC' : ''
  console.log(
    `  id=${String(p.id).padStart(3)}  status=${status.padEnd(9)}  locales=[${locales.join(',')}].padEnd(10)  slug=${p.slug}${flag}${flag2}`,
  )
  if (status === 'draft') drafts.push(p)
  if (status === 'draft' && locales.length > 0) orphan.push(p)
  if (status === 'published' && locales.length === 0) publishedNoLocales.push(p)
}

console.log(`\n  Summary: draft=${drafts.length} / published=${all.totalDocs - drafts.length}`)
console.log(`           ⚠ DRAFT+LOCALES (혼란 후보) = ${orphan.length}`)
console.log(`           ⚠ PUB+NOLOC (admin published but no locale) = ${publishedNoLocales.length}`)

if (orphan.length > 0) {
  console.log(`\n  DRAFT+LOCALES 상세:`)
  for (const p of orphan) {
    console.log(
      `    id=${p.id}  slug=${p.slug}  locales=[${(p.publishedLocales || []).join(',')}]  cat=${p.category}`,
    )
  }
}

// ─── (2) frontend 쿼리 시뮬레이션 (en locale, insight category) ──
console.log(`\n=== frontend simulation: /en/insight 목록 ===\n`)
const insightEn = await payload.find({
  collection: 'posts',
  limit: 100,
  depth: 0,
  locale: 'en',
  // draft 옵션 명시 안 함 = Payload 기본값 draft:false 적용 (front 와 동일)
  where: {
    and: [
      { publishedLocales: { equals: 'en' } },
      { category: { equals: 'insight' } },
    ],
  },
})
console.log(`  반환 카운트: ${insightEn.totalDocs}`)
for (const p of insightEn.docs) {
  console.log(
    `    id=${String(p.id).padStart(3)}  status=${p._status.padEnd(9)}  slug=${p.slug}`,
  )
}

// _status='draft' 인 글이 결과에 포함되어 있는지 확인
const draftLeaks = insightEn.docs.filter((p) => p._status === 'draft')
console.log(
  `\n  ★ frontend 쿼리 결과 중 _status='draft' 글: ${draftLeaks.length}  ${draftLeaks.length > 0 ? '← LEAK!' : '(정상)'}`,
)
for (const p of draftLeaks) {
  console.log(`     LEAK id=${p.id} slug=${p.slug} locales=[${(p.publishedLocales||[]).join(',')}]`)
}

// ─── (3) 5분야 카테고리별 카운트 ─────────────────────────────────
console.log(`\n=== category별 frontend 쿼리 결과 (en locale, draft:false 기본값) ===\n`)
for (const cat of ['insight', 'story', 'portfolio', 'solution', 'service']) {
  const r = await payload.find({
    collection: 'posts',
    limit: 100,
    depth: 0,
    locale: 'en',
    where: {
      and: [
        { publishedLocales: { equals: 'en' } },
        { category: { equals: cat } },
      ],
    },
  })
  const dCount = r.docs.filter((p) => p._status === 'draft').length
  const pCount = r.docs.filter((p) => p._status === 'published').length
  console.log(`  /${cat.padEnd(9)}  total=${r.totalDocs}  pub=${pCount}  draft=${dCount}${dCount > 0 ? ' ← LEAK' : ''}`)
}

process.exit(0)

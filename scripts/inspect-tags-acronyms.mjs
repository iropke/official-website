#!/usr/bin/env node
/**
 * 모든 태그를 20 locale 전체에 걸쳐 조회하고
 * 약어로 표현되어야 하지만 Title Case 로 저장된 단어를 찾아 리포트.
 *
 * 실행:
 *   pnpm tsx scripts/inspect-tags-acronyms.mjs           (dry-run: 검출만)
 *   pnpm tsx scripts/inspect-tags-acronyms.mjs --apply   (실제 update)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ACRONYMS } from './lib/acronyms.mjs'

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

const APPLY = process.argv.includes('--apply')

const LOCALES = [
  'en', 'zh', 'ja', 'de', 'fr', 'es', 'ko', 'pt', 'hi', 'ru',
  'nl', 'it', 'ar', 'sv', 'th', 'pl', 'id', 'ms', 'da', 'tr',
]

// ACRONYMS Map is now imported from ./lib/acronyms.mjs (SSOT — see CLAUDE.md §2-A).
// Compound entries with '-' (e.g. 'json-ld' → 'JSON-LD') are skipped here because
// fixAcronyms works on single tokens within tag names; compound forms are handled
// at humanize() time during new tag creation.

// "Css" / "Ai" / "Html" 처럼 Title Case 로 저장된 약어를 대문자로 치환.
// 단어 경계 (영문/숫자 아닌 문자 또는 문자열 시작/끝) 기준으로 매칭.
function fixAcronyms(text) {
  if (!text) return { fixed: text, changed: false }
  let result = text
  let changed = false
  for (const [lower, upper] of ACRONYMS) {
    // Compound forms ('json-ld', 'e-e-a-t') aren't single tokens — humanize() handles them.
    if (lower.includes('-')) continue
    // Title Case 형태만 잡기. 즉 첫 글자만 대문자 + 나머지 소문자.
    // 예: "Css" → "CSS" (잡음), "css" → 잡지 않음, "CSS" → 이미 정상이라 잡지 않음.
    const titleCase = lower.charAt(0).toUpperCase() + lower.slice(1).toLowerCase()
    // 이미 lower===titleCase 인 1글자짜리 제외 (정상 라틴 단어와 충돌)
    if (titleCase === upper) continue
    // 단어 경계: 영문/숫자/슬래시(/) 아님
    const re = new RegExp(`(^|[^A-Za-z0-9/])${escapeRegExp(titleCase)}(?=$|[^A-Za-z0-9])`, 'g')
    const next = result.replace(re, (_match, prefix) => `${prefix}${upper}`)
    if (next !== result) {
      changed = true
      result = next
    }
  }
  return { fixed: result, changed }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const { getPayload } = await import('payload')
const config = (
  await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)
).default

const payload = await getPayload({ config })
console.log('[INFO] Payload 초기화 완료.\n')

// 1) 전체 태그 ID 목록 (locale 무관) 조회
const baseList = await payload.find({
  collection: 'tags',
  limit: 1000,
  overrideAccess: true,
})

console.log(`[INFO] 총 ${baseList.totalDocs} 개 태그 발견.\n`)

// 2) 각 태그에 대해 20 locale 전부 조회 후 fixAcronyms 적용
const proposals = [] // { id, slug, locale, before, after }
for (const tag of baseList.docs) {
  for (const locale of LOCALES) {
    const doc = await payload.findByID({
      collection: 'tags',
      id: tag.id,
      locale,
      overrideAccess: true,
      fallbackLocale: false,
    })
    const name = doc?.name
    if (!name || typeof name !== 'string') continue
    const { fixed, changed } = fixAcronyms(name)
    if (changed) {
      proposals.push({ id: tag.id, slug: tag.slug, locale, before: name, after: fixed })
    }
  }
}

if (proposals.length === 0) {
  console.log('[OK] 변경 대상 없음. 모든 태그가 이미 정상.')
  process.exit(0)
}

console.log(`[FOUND] ${proposals.length} 건의 변경 후보:\n`)
console.log('id    | locale | slug                          | before                         → after')
console.log('------+--------+-------------------------------+-----------------------------------------------')
for (const p of proposals) {
  console.log(
    `${String(p.id).padEnd(5)} | ${p.locale.padEnd(6)} | ${String(p.slug).slice(0, 29).padEnd(29)} | ${p.before.padEnd(30)} → ${p.after}`,
  )
}

if (!APPLY) {
  console.log('\n[DRY-RUN] --apply 플래그 미지정. 실제 변경은 수행하지 않음.')
  process.exit(0)
}

// 3) 적용
console.log('\n[APPLY] 변경 적용 중...')
for (const p of proposals) {
  await payload.update({
    collection: 'tags',
    id: p.id,
    locale: p.locale,
    data: { name: p.after },
    overrideAccess: true,
  })
  console.log(`   ✓ id=${p.id} [${p.locale}] '${p.before}' → '${p.after}'`)
}
console.log(`\n[DONE] ${proposals.length} 건 적용 완료.`)
process.exit(0)

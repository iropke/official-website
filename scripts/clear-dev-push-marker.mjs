#!/usr/bin/env node
/**
 * payload_migrations 의 batch=-1 row 삭제 (dev push marker 클리어).
 *
 * 사고 컨텍스트 (PR #32 빌드 26분 hang 의 원인):
 *   - getPayload({ config }) 가 NODE_ENV 미설정 상태로 호출되면 Drizzle 이
 *     dev 모드로 인식 → schema push (자동 동기화) → payload_migrations 에
 *     batch=-1 row 삽입.
 *   - 다음 `payload migrate` 실행 시 Drizzle 이 그 row 를 감지하고 prompt
 *     ("It looks like you've run Payload in dev mode, meaning you've
 *     dynamically pushed changes to your database. ... Would you like
 *     to proceed?") 를 띄움. Vercel 빌드는 TTY 가 없어 무한 대기.
 *
 * 영구 재발 방지:
 *   - upload-and-import.ts 의 NODE_ENV='production' 설정으로 dev push
 *     자체가 발생하지 않도록 차단함 (이 스크립트 후속 실행 불필요).
 *
 * 안전:
 *   - batch=-1 row 만 삭제. 실제 적용된 migration 행 (batch >= 1) 은 보존.
 *   - 실 migration 들은 src/migrations/*.ts 에 그대로 있어 재실행 가능.
 *   - 운영 DB 의 컨텐츠 (Posts, Tags, Media, Users) 영향 0.
 *
 * 실행:
 *   D:\Claude\iropke\website 에서
 *     pnpm tsx scripts/clear-dev-push-marker.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const websiteRoot = resolve(__dirname, '..')

// .env 로드 (dotenv 의존성 회피)
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

// CRITICAL: NODE_ENV=production 으로 dev push 재발 방지
process.env.NODE_ENV = 'production'

const { getPayload } = await import('payload')
const config = (
  await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)
).default

const payload = await getPayload({ config })
console.log('[INFO] Payload 초기화 완료. dev push marker 검색...')

const { docs } = await payload.find({
  collection: 'payload-migrations',
  where: { batch: { equals: -1 } },
  limit: 100,
  overrideAccess: true,
})

if (docs.length === 0) {
  console.log('[OK] batch=-1 dev push marker 없음. 클리어 불필요.')
  process.exit(0)
}

console.log(`[FOUND] dev push marker ${docs.length}건 발견:`)
for (const d of docs) {
  console.log(`   - id=${d.id} name=${d.name} createdAt=${d.createdAt}`)
}

for (const d of docs) {
  await payload.delete({
    collection: 'payload-migrations',
    id: d.id,
    overrideAccess: true,
  })
  console.log(`   ✓ deleted id=${d.id}`)
}

// 검증
const { docs: remaining } = await payload.find({
  collection: 'payload-migrations',
  where: { batch: { equals: -1 } },
  limit: 1,
  overrideAccess: true,
})
console.log(`[DONE] 잔여 batch=-1 row: ${remaining.length}건 (= 0 이어야 정상).`)
process.exit(0)

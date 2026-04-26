#!/usr/bin/env node
/**
 * iropke.com — Build wrapper
 *
 * 두 가지 환경에서 안전하게 동작하도록 설계됨:
 *
 *   1) Vercel build (process.env.VERCEL === '1')
 *      DATABASE_URL_DIRECT 가 설정되어 있으면, subprocess 환경에서
 *      DATABASE_URL 을 그 값으로 임시 swap 하여 `payload migrate` 실행.
 *      이후 본 `next build` 는 원래 DATABASE_URL (Transaction pooler 6543) 로 진행.
 *
 *   2) 로컬 빌드 (`pnpm build`)
 *      VERCEL 환경변수가 없으므로 migration 단계 자동 skip.
 *      로컬에서 명시적으로 마이그레이션이 필요하면 PowerShell 에서:
 *        $env:DATABASE_URL = ((Get-Content .env | Where-Object { $_ -match '^DATABASE_URL_DIRECT=' }) -replace '^DATABASE_URL_DIRECT=', '').Trim()
 *        pnpm payload migrate
 *      형태로 수동 실행.
 *
 * 설계 의도:
 *   - 로컬에서 실수로 `pnpm build` 가 production DB 에 migration 적용하는 사고 차단
 *   - Vercel build 에서 자동 migration 으로 schema drift 방지
 *   - subprocess env 는 격리되므로 migrate 의 swap 이 본 build 에 누수되지 않음
 */

import { execSync } from 'node:child_process'

const isVercel = process.env.VERCEL === '1'
const directUrl = process.env.DATABASE_URL_DIRECT

if (isVercel) {
  if (directUrl) {
    console.log('[build] Vercel build detected. Running payload migrate with DATABASE_URL_DIRECT...')
    execSync('pnpm payload migrate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: directUrl },
    })
    console.log('[build] Migration step complete.')
  } else {
    console.warn('[build] WARNING: DATABASE_URL_DIRECT not set on Vercel.')
    console.warn('[build] Skipping migration step. Schema may drift from migration files.')
    console.warn('[build] Add DATABASE_URL_DIRECT in Vercel Project Settings → Environment Variables.')
  }
} else {
  console.log('[build] Local build (VERCEL not set). Skipping migration step.')
  console.log('[build] To migrate locally, run `pnpm payload migrate` after swapping DATABASE_URL.')
}

console.log('[build] Running next build...')
execSync('next build', {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-deprecation --max-old-space-size=8000',
  },
})
console.log('[build] Build complete.')

#!/usr/bin/env node
/**
 * lint-acronyms.mjs — verify CLAUDE.md §2-A ⊆ website/scripts/lib/acronyms.mjs
 *
 * Catches drift between the human-readable acronym table in CLAUDE.md §2-A
 * "약어 (acronym) 대문자 규칙" and the code-readable ACRONYMS Map. Run after
 * any edit to either file; a green run is a precondition for merging.
 *
 * Exit codes:
 *   0 — every CLAUDE.md §2-A acronym is present in ACRONYMS with the exact display form
 *   1 — drift detected (missing entry or display-form mismatch)
 *   2 — could not parse CLAUDE.md §2-A (file missing / heading not found / structure changed)
 *
 * Usage:
 *   pnpm tsx scripts/lint-acronyms.mjs
 *
 * Operational policy: CLAUDE.md §2-A "자동 적용 정책".
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ACRONYMS } from './lib/acronyms.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLAUDE_MD = resolve(__dirname, '..', '..', 'content-generation', 'CLAUDE.md')

if (!existsSync(CLAUDE_MD)) {
  console.error(`[ERR] CLAUDE.md 를 찾을 수 없음: ${CLAUDE_MD}`)
  process.exit(2)
}

const md = readFileSync(CLAUDE_MD, 'utf8')

// Locate the §2-A "약어 (acronym) 대문자 규칙" section: from its heading
// until the next heading at the same depth or '---' separator.
const SECTION_START = /^### 약어 \(acronym\) 대문자 규칙\s*$/m
const SECTION_END = /^(?:###?\s|---\s*$)/m

const startMatch = md.match(SECTION_START)
if (!startMatch) {
  console.error('[ERR] CLAUDE.md 에서 "### 약어 (acronym) 대문자 규칙" 헤더를 찾을 수 없음.')
  console.error('      파일 구조가 변경되었는지 확인하고, 변경되었다면 본 lint 의 정규식도 갱신.')
  process.exit(2)
}

const afterStart = md.slice(startMatch.index + startMatch[0].length)
const endMatch = afterStart.match(SECTION_END)
const section = endMatch ? afterStart.slice(0, endMatch.index) : afterStart

// Expected lines look like:
//   - **개발 / 웹 표준**: HTML, CSS, JS, ..., JSON-LD, ...
//   - **혼합 표기 (대소문자 정확히)**: `iOS` / `macOS` / ... / `iPhone`
const CATEGORY_LINE = /^- \*\*([^*]+)\*\*:\s*(.+)$/gm

const expected = new Map() // lowercase slug → expected display form
let totalLines = 0

for (const line of section.matchAll(CATEGORY_LINE)) {
  totalLines++
  const rawList = line[2]
  // Mixed-casing line uses `` ` / ` `` separators with backticks; other lines use ', '
  const items = rawList.includes('`')
    ? Array.from(rawList.matchAll(/`([^`]+)`/g)).map((m) => m[1])
    : rawList.split(',').map((s) => s.trim())
  for (const item of items) {
    const trimmed = item.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    // Last write wins, but we also flag conflicting display forms within CLAUDE.md
    if (expected.has(key) && expected.get(key) !== trimmed) {
      console.warn(
        `[WARN] CLAUDE.md §2-A 자체 충돌: '${key}' 가 '${expected.get(key)}' 와 '${trimmed}' 두 표기로 등장.`,
      )
    }
    expected.set(key, trimmed)
  }
}

if (totalLines === 0) {
  console.error('[ERR] §2-A 섹션 안에 카테고리 라인 (- **...**: ...) 을 하나도 찾을 수 없음.')
  process.exit(2)
}

// Compare: every key in `expected` should be in ACRONYMS with matching value.
const missing = []
const mismatched = []
for (const [key, displayForm] of expected) {
  if (!ACRONYMS.has(key)) {
    missing.push({ key, displayForm })
    continue
  }
  const actual = ACRONYMS.get(key)
  if (actual !== displayForm) {
    mismatched.push({ key, expected: displayForm, actual })
  }
}

console.log(
  `[INFO] CLAUDE.md §2-A: ${expected.size} 개 약어 / ACRONYMS Map: ${ACRONYMS.size} 개 엔트리 (compound 포함)`,
)

if (missing.length === 0 && mismatched.length === 0) {
  console.log('[OK] CLAUDE.md §2-A ⊆ ACRONYMS — drift 없음.')
  process.exit(0)
}

if (missing.length) {
  console.error(`\n[FAIL] ACRONYMS Map 에 누락된 약어 ${missing.length}건:`)
  for (const m of missing) {
    console.error(`   - '${m.key}' (CLAUDE.md 에는 '${m.displayForm}' 으로 등록됨)`)
  }
  console.error(
    `\n  Fix: D:\\Claude\\iropke\\website\\scripts\\lib\\acronyms.mjs 에 ['${missing[0].key}', '${missing[0].displayForm}'] 형식으로 추가.`,
  )
}

if (mismatched.length) {
  console.error(`\n[FAIL] 표기 형식 불일치 ${mismatched.length}건:`)
  for (const m of mismatched) {
    console.error(`   - '${m.key}': CLAUDE.md='${m.expected}' / ACRONYMS='${m.actual}'`)
  }
}

console.error(
  '\n  Drift 가 발생한 이유를 확인하고 한쪽을 다른쪽에 맞추거나, 의도된 변경이면 양쪽 동시 갱신 + 단위 테스트 케이스 추가.',
)
process.exit(1)

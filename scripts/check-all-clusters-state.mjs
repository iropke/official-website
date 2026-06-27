#!/usr/bin/env node
/**
 * DB SSOT routine — dump publish state of all clusters in a single Payload init.
 * Per CLAUDE.md §4-D, run at session start to detect CLAUDE.md ↔ DB drift before
 * trusting any "본문 X건 완료" / "publish 대기" narrative.
 *
 *   pnpm tsx scripts/check-all-clusters-state.mjs
 *   pnpm tsx scripts/check-all-clusters-state.mjs --cluster aeo
 *   pnpm tsx scripts/check-all-clusters-state.mjs --json
 *
 * Output format (per cluster):
 *   === <cluster-slug> (N/M in DB) — published=A draft=B missing=C ===
 *     id=NN  slug=...  status=published  role=spoke  pub=2026-MM-DDTHH:MMZ
 *
 * Then a "DRIFT SUMMARY" section if any cluster has N != M, or mixed status.
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
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

const argv = process.argv.slice(2)
const ONLY_CLUSTER = (() => {
  const i = argv.indexOf('--cluster')
  return i >= 0 ? argv[i + 1] : null
})()
const JSON_OUT = argv.includes('--json')
// --emit-index: regenerate the DB-derived header+table of guides/cluster-brief-index.md
// from briefs(glob) + DB + filesystem, preserving hand-written narrative outside markers.
// See content-pipeline.md §4-D. Default = dry-run diff; --write applies; --check = CI gate.
const EMIT_INDEX = argv.includes('--emit-index')
const EMIT_WRITE = argv.includes('--write')
const EMIT_CHECK = argv.includes('--check')
const EMIT_CREATE = argv.includes('--create')
const EMIT_VERBOSE = argv.includes('-v') || argv.includes('--verbose')

// Cluster -> { category, slugs } DERIVED from the briefs glob (membership SSOT),
// not hand-maintained -- eliminates the drift the old hardcoded CLUSTERS object had
// for brand-new clusters (content-pipeline.md 4-D anti-stale). Same source the
// --emit-index path uses, so the DB-dump and emit agree on cluster membership.
function deriveClusters() {
  const briefsRoot = resolve(websiteRoot, '..', 'content-generation', 'briefs')
  const CAT_DIRS = ['insight', 'story', 'portfolio', 'solution', 'service', 'origin']
  const byCluster = {}
  for (const cat of CAT_DIRS) {
    const dir = resolve(briefsRoot, cat)
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue
      let b
      try { b = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) } catch { continue }
      if (!b || !b.cluster || !b.slug || !b.clusterRole) continue
      const e = (byCluster[b.cluster] ||= { categories: new Set(), slugs: [] })
      e.categories.add(b.category)
      e.slugs.push(b.slug)
    }
  }
  const out = {}
  for (const [cluster, { categories, slugs }] of Object.entries(byCluster)) {
    out[cluster] = { category: [...categories].sort().join('/'), slugs }
  }
  return out
}
const CLUSTERS = deriveClusters()

const { getPayload } = await import('payload')
const config = (await import(pathToFileURL(resolve(websiteRoot, 'src', 'payload.config.ts')).href)).default
const payload = await getPayload({ config })

// ─────────────────────────────────────────────────────────────────────────
// --emit-index : regenerate DB-derived header+table of cluster-brief-index.md
//   SSOT split (content-pipeline.md §4-D): cluster membership = briefs glob (NOT
//   the CLUSTERS object above — that one goes stale for brand-new clusters);
//   ID/role/slug/priority = briefs; Posts.id = DB; 본문/lexical = filesystem.
//   publish DATE/_status is intentionally NOT written (DB-authoritative → live via
//   the normal mode of this script). Narrative (> blockquotes) outside markers is
//   preserved byte-for-byte.
// ─────────────────────────────────────────────────────────────────────────
if (EMIT_INDEX) {
  const cgRoot = resolve(websiteRoot, '..', 'content-generation')
  const briefsRoot = resolve(cgRoot, 'briefs')
  const indexPath = resolve(cgRoot, 'guides', 'cluster-brief-index.md')
  const CAT_DIRS = ['insight', 'story', 'portfolio', 'solution', 'service', 'origin']
  const CAT_TITLE = { insight: 'Insight', story: 'Story', portfolio: 'Portfolio', solution: 'Solution', service: 'Service', origin: 'Origin' }

  // 1. briefs glob → group by cluster (post briefs only: require cluster+slug+clusterRole)
  const byCluster = {}
  for (const cat of CAT_DIRS) {
    const dir = resolve(briefsRoot, cat)
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue
      let b
      try { b = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) } catch { continue }
      if (!b || !b.cluster || !b.slug || !b.clusterRole) continue
      ;(byCluster[b.cluster] ||= []).push(b)
    }
  }

  const targets = Object.keys(byCluster).filter((c) => !ONLY_CLUSTER || c === ONLY_CLUSTER).sort()
  if (ONLY_CLUSTER && targets.length === 0) {
    console.error(`[emit] cluster '${ONLY_CLUSTER}' has no briefs under briefs/{${CAT_DIRS.join(',')}}/`)
    process.exit(1)
  }

  const titleCase = (slug) => slug.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const counts = (briefs) => {
    let body = 0, lex = 0
    for (const b of briefs) {
      const d = resolve(cgRoot, b.category, b.slug)
      try { if (existsSync(resolve(d, 'body.md')) && statSync(resolve(d, 'body.md')).size > 0) body++ } catch {}
      if (existsSync(resolve(d, 'lexical.json'))) lex++
    }
    return { body, lex }
  }
  const catTitle = (briefs) => {
    const cats = [...new Set(briefs.map((b) => b.category))]
    return cats.length > 1 ? cats.map((c) => CAT_TITLE[c] || c).join('/') + ' ⚠' : (CAT_TITLE[cats[0]] || cats[0])
  }
  const postIds = async (briefs) => {
    const r = await payload.find({ collection: 'posts', where: { slug: { in: briefs.map((b) => b.slug) } }, limit: 300, locale: 'en', depth: 0, draft: true })
    const m = new Map()
    for (const d of r.docs) m.set(d.slug, d.id)
    return m
  }
  const genBlock = (cluster, briefs, idMap, displayName) => {
    const sorted = [...briefs].sort((a, b) =>
      ((a.clusterRole === 'pillar' ? 0 : 1) - (b.clusterRole === 'pillar' ? 0 : 1)) ||
      (parseInt(a.id, 10) - parseInt(b.id, 10)) || String(a.id).localeCompare(String(b.id)))
    const N = briefs.length
    const { body, lex } = counts(briefs)
    let s = `### ${displayName} — \`cluster: ${cluster}\` (${N}건 · 본문 ${body}/${N} · lexical ${lex}/${N} · 분야 ${catTitle(briefs)})\n\n`
    s += `| ID | role | slug | priority | Posts.id |\n|---|---|---|---|---|\n`
    for (const b of sorted) {
      const role = b.clusterRole === 'pillar' ? '**pillar**' : (b.clusterRole || 'spoke')
      const pid = idMap.get(b.slug) ?? '—'
      const pr = b.publishing_priority ?? b.priority ?? '—'
      s += `| ${b.id} | ${role} | \`${b.slug}\` | ${pr} | ${pid} |\n`
    }
    return s.trimEnd()
  }

  if (!existsSync(indexPath)) { console.error(`[emit] index not found: ${indexPath}`); process.exit(1) }
  let text = readFileSync(indexPath, 'utf8')
  const original = text
  const narrBefore = (text.match(/^>/gm) || []).length
  const report = []

  for (const cluster of targets) {
    const briefs = byCluster[cluster]
    const idMap = await postIds(briefs)
    const filled = briefs.filter((b) => idMap.has(b.slug)).length

    const markedRe = new RegExp(`<!-- cbi:auto cluster=${escRe(cluster)} -->[\\s\\S]*?<!-- cbi:/auto -->`)
    const headerRe = new RegExp(`^### ([^\\n]*?) [\\u2014\\u2013-] \`cluster: ${escRe(cluster)}\`[^\\n]*\\n+(?:\\|[^\\n]*\\n?)+`, 'm')

    let action, oldHeader = ''
    if (markedRe.test(text)) {
      const m = text.match(markedRe)[0]
      oldHeader = (m.match(/^### [^\n]*/m) || [''])[0]
      const dn = (m.match(/### ([^\n]*?) [—–-] `cluster:/) || [])[1] || titleCase(cluster)
      text = text.replace(markedRe, `<!-- cbi:auto cluster=${cluster} -->\n${genBlock(cluster, briefs, idMap, dn)}\n<!-- cbi:/auto -->`)
      action = 'updated (marked)'
    } else if (headerRe.test(text)) {
      const m = text.match(headerRe)
      oldHeader = (m[0].match(/^### [^\n]*/) || [''])[0]
      text = text.replace(headerRe, `<!-- cbi:auto cluster=${cluster} -->\n${genBlock(cluster, briefs, idMap, m[1].trim())}\n<!-- cbi:/auto -->\n`)
      action = 'migrated (markers inserted)'
    } else if (EMIT_CREATE) {
      const block = genBlock(cluster, briefs, idMap, titleCase(cluster))
      const stub = `\n<!-- cbi:auto cluster=${cluster} -->\n${block}\n<!-- cbi:/auto -->\n\n> _구조 분담: TODO (수동 작성)_\n>\n> _클러스터 안/간 cross-link 설계: TODO_\n`
      const footRe = /\n### 클러스터 발행 묶음 운용 메모/
      text = footRe.test(text) ? text.replace(footRe, stub + '\n### 클러스터 발행 묶음 운용 메모') : text.trimEnd() + '\n' + stub
      action = 'created (stub + TODO narrative)'
    } else {
      action = 'SKIP — not in index (use --create)'
    }
    report.push({ cluster, action, oldHeader, filled, total: briefs.length })
  }

  // safety guards
  const narrAfter = (text.match(/^>/gm) || []).length
  const mOpen = (text.match(/<!-- cbi:auto /g) || []).length
  const mClose = (text.match(/<!-- cbi:\/auto -->/g) || []).length

  console.log('=== --emit-index ===')
  for (const r of report) console.log(`  ${r.cluster.padEnd(44)} ${r.action}  (Posts.id ${r.filled}/${r.total})`)
  console.log(`\nnarrative(>) lines: ${narrBefore} -> ${narrAfter}  | markers: ${mOpen} open / ${mClose} close`)
  if (mOpen !== mClose) { console.error('[emit] ABORT: marker open/close mismatch — no write.'); process.exit(1) }
  if (narrAfter < narrBefore) { console.error('[emit] ABORT: narrative lines decreased — no write.'); process.exit(1) }

  if (text === original) { console.log('\n[emit] no changes.'); process.exit(0) }

  if (EMIT_CHECK) { console.log('\n[emit] DRIFT — regenerated content differs from current file (--check).'); process.exit(1) }

  if (EMIT_WRITE) {
    const bak = `${indexPath}.bak.emit`
    writeFileSync(bak, original, 'utf8')
    writeFileSync(indexPath, text, 'utf8')
    console.log(`\n[emit] WROTE ${indexPath}`)
    console.log(`[emit] backup: ${bak}`)
    process.exit(0)
  }

  // default: dry-run header diff (+ full block when -v)
  console.log('\n--- dry-run (header diff; narrative untouched) ---')
  for (const r of report) {
    if (r.action.startsWith('SKIP')) continue
    console.log(`\n══ ${r.cluster}  [${r.action}]`)
    if (r.oldHeader) console.log(`  - ${r.oldHeader}`)
    const m2 = (EMIT_VERBOSE ? null : text.match(new RegExp(`<!-- cbi:auto cluster=${escRe(r.cluster)} -->\\n(### [^\\n]*)`)))
    if (m2) console.log(`  + ${m2[1]}`)
    if (EMIT_VERBOSE) {
      const blk = text.match(new RegExp(`<!-- cbi:auto cluster=${escRe(r.cluster)} -->[\\s\\S]*?<!-- cbi:/auto -->`))
      if (blk) console.log(blk[0].split('\n').map((l) => '  | ' + l).join('\n'))
    }
  }
  console.log('\n[emit] dry-run only. --write to apply (auto-backup), --check for CI gate, -v for full blocks.')
  process.exit(0)
}

const clusterEntries = Object.entries(CLUSTERS).filter(([k]) => !ONLY_CLUSTER || k === ONLY_CLUSTER)
if (ONLY_CLUSTER && clusterEntries.length === 0) {
  console.error(`Unknown cluster: ${ONLY_CLUSTER}. Available: ${Object.keys(CLUSTERS).join(', ')}`)
  process.exit(1)
}

const results = []
for (const [cluster, { category, slugs }] of clusterEntries) {
  const r = await payload.find({
    collection: 'posts',
    where: { slug: { in: slugs } },
    limit: 200,
    locale: 'en',
    depth: 0,
    draft: true,
  })
  const found = new Set(r.docs.map((x) => x.slug))
  const missing = slugs.filter((s) => !found.has(s))
  const published = r.docs.filter((d) => d._status === 'published').length
  const draft = r.docs.filter((d) => d._status === 'draft').length
  results.push({ cluster, category, total: slugs.length, found: r.docs.length, published, draft, missing, docs: r.docs })
}

if (JSON_OUT) {
  console.log(JSON.stringify(results, null, 2))
  process.exit(0)
}

for (const { cluster, category, total, found, published, draft, missing, docs } of results) {
  const drift = published !== total ? ' ⚠ DRIFT' : ''
  console.log(`\n=== ${cluster} [${category}] (${found}/${total} in DB — published=${published} draft=${draft} missing=${missing.length})${drift} ===`)
  for (const d of docs.sort((a, b) => a.id - b.id)) {
    const pub = d.publishedDate ? d.publishedDate.toString().slice(0, 19) + 'Z' : '—'
    console.log(`  id=${String(d.id).padEnd(3)}  slug=${d.slug.padEnd(48)}  status=${d._status.padEnd(9)}  role=${(d.clusterRole || '').padEnd(6)}  pub=${pub}`)
  }
  if (missing.length) {
    console.log(`  Missing (not in DB):`)
    for (const s of missing) console.log(`    - ${s}`)
  }
}

// Drift summary
const drifts = results.filter((r) => r.published !== r.total)
console.log('\n────────────────────────────────────────')
if (drifts.length === 0) {
  console.log(`[OK] all ${results.length} clusters fully published — no CLAUDE.md ↔ DB drift detected.`)
} else {
  console.log(`[DRIFT] ${drifts.length}/${results.length} clusters not fully published:`)
  for (const d of drifts) {
    console.log(`  - ${d.cluster}: ${d.published}/${d.total} published (${d.draft} draft, ${d.missing.length} missing in DB)`)
  }
  console.log(`\nIf CLAUDE.md §4-D says "published" but DB shows draft/missing, the table is stale — update §4-D.`)
  console.log(`If DB shows published but §4-D shows plan/target text ("본문 X건 완료" / "publish 대기"), the table is stale — update §4-D.`)
}

process.exit(0)

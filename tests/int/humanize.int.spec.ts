/**
 * humanize() unit tests — CLAUDE.md §2-A acronym-aware tag-name generation.
 *
 * The 8 cases below are mandated by CLAUDE.md §2-A "다음 세션 작업 항목" item 4.
 * Additional cases cover hyphen-preservation compounds and mixed-case acronyms
 * (the two regressions that motivated this lib refactor).
 *
 * SSOT: website/scripts/lib/humanize.mjs + website/scripts/lib/acronyms.mjs.
 */
import { describe, it, expect } from 'vitest'
// @ts-expect-error — pure ESM .mjs sibling lib, no .d.ts needed for tests
import { humanize } from '../../scripts/lib/humanize.mjs'

describe('humanize() — CLAUDE.md §2-A mandatory cases', () => {
  it('humanize("aeo") === "AEO"', () => {
    expect(humanize('aeo')).toBe('AEO')
  })

  it('humanize("geo") === "GEO"', () => {
    expect(humanize('geo')).toBe('GEO')
  })

  it('humanize("json-ld") === "JSON-LD" (compound, hyphen preserved)', () => {
    expect(humanize('json-ld')).toBe('JSON-LD')
  })

  it('humanize("e-e-a-t") === "E-E-A-T" (compound of single letters)', () => {
    expect(humanize('e-e-a-t')).toBe('E-E-A-T')
  })

  it('humanize("ai-search") === "AI Search"', () => {
    expect(humanize('ai-search')).toBe('AI Search')
  })

  it('humanize("llm-seo") === "LLM SEO"', () => {
    expect(humanize('llm-seo')).toBe('LLM SEO')
  })

  it('humanize("saas") === "SaaS" (mixed casing preserved)', () => {
    expect(humanize('saas')).toBe('SaaS')
  })

  it('humanize("content-quality") === "Content Quality" (no acronyms)', () => {
    expect(humanize('content-quality')).toBe('Content Quality')
  })
})

describe('humanize() — mixed-case acronyms preserved exactly', () => {
  it('preserves iOS exactly', () => {
    expect(humanize('ios')).toBe('iOS')
  })
  it('preserves macOS exactly', () => {
    expect(humanize('macos')).toBe('macOS')
  })
  it('preserves npm as lowercase (per upstream convention)', () => {
    expect(humanize('npm')).toBe('npm')
  })
  it('preserves NoSQL exactly', () => {
    expect(humanize('nosql')).toBe('NoSQL')
  })
  it('preserves IoT exactly', () => {
    expect(humanize('iot')).toBe('IoT')
  })
  it('preserves A11y exactly', () => {
    expect(humanize('a11y')).toBe('A11y')
  })
})

describe('humanize() — multi-token slugs with mixed acronyms', () => {
  it('"b2b-saas" → "B2B SaaS"', () => {
    expect(humanize('b2b-saas')).toBe('B2B SaaS')
  })
  it('"answer-engine-optimization" → "Answer Engine Optimization"', () => {
    expect(humanize('answer-engine-optimization')).toBe('Answer Engine Optimization')
  })
  it('"ai-governance" → "AI Governance"', () => {
    expect(humanize('ai-governance')).toBe('AI Governance')
  })
  it('"structured-data" → "Structured Data"', () => {
    expect(humanize('structured-data')).toBe('Structured Data')
  })
  it('"entity-seo" → "Entity SEO"', () => {
    expect(humanize('entity-seo')).toBe('Entity SEO')
  })
  it('"ip-geolocation" → "IP Geolocation"', () => {
    expect(humanize('ip-geolocation')).toBe('IP Geolocation')
  })
})

describe('humanize() — location-based-experiences cluster acronyms (2026-05-15)', () => {
  it('humanize("gps") === "GPS"', () => {
    expect(humanize('gps')).toBe('GPS')
  })
  it('humanize("ip") === "IP"', () => {
    expect(humanize('ip')).toBe('IP')
  })
  it('humanize("webxr") === "WebXR" (mixed casing preserved)', () => {
    expect(humanize('webxr')).toBe('WebXR')
  })
})

describe('humanize() — smart-city-cases cluster acronyms (2026-05-15)', () => {
  it('humanize("3d-modeling") === "3D Modeling"', () => {
    expect(humanize('3d-modeling')).toBe('3D Modeling')
  })
  it('humanize("neom") === "NEOM" (brand all-caps)', () => {
    expect(humanize('neom')).toBe('NEOM')
  })
})

describe('humanize() — edge cases', () => {
  it('empty string → ""', () => {
    expect(humanize('')).toBe('')
  })
  it('single non-acronym → Title Case', () => {
    expect(humanize('analytics')).toBe('Analytics')
  })
  it('uppercase input is lowercased before lookup', () => {
    expect(humanize('AEO')).toBe('AEO')
  })
  it('mixed-case input is lowercased before lookup', () => {
    expect(humanize('Json-Ld')).toBe('JSON-LD')
  })
})

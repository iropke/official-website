/**
 * humanize(slug) — generate the display name for a new Tag from its slug.
 *
 * Algorithm:
 *   1. Exact full-slug lookup in ACRONYMS — handles compound acronyms with
 *      hyphen preservation (e.g. 'json-ld' → 'JSON-LD', 'e-e-a-t' → 'E-E-A-T').
 *   2. Per-token tokenization on '-' — each token is either an ACRONYMS entry
 *      (e.g. 'aeo' → 'AEO') or Title-Cased (e.g. 'quality' → 'Quality').
 *      Tokens are joined with a single space.
 *
 * Mixed-case acronyms (iOS, SaaS, npm, NoSQL) are preserved exactly because
 * the ACRONYMS Map value is used verbatim.
 *
 * Examples (also covered by tests/int/humanize.int.spec.ts):
 *   humanize('aeo')              === 'AEO'
 *   humanize('geo')              === 'GEO'
 *   humanize('json-ld')          === 'JSON-LD'
 *   humanize('e-e-a-t')          === 'E-E-A-T'
 *   humanize('ai-search')        === 'AI Search'
 *   humanize('llm-seo')          === 'LLM SEO'
 *   humanize('saas')             === 'SaaS'
 *   humanize('content-quality')  === 'Content Quality'
 *
 * Operational policy: content-generation/CLAUDE.md §2-A.
 */
import { ACRONYMS } from './acronyms.mjs'

/**
 * @param {string} slug - lowercase kebab-case slug
 * @returns {string} display-ready tag name with acronyms cased correctly
 */
export function humanize(slug) {
  if (!slug || typeof slug !== 'string') return ''
  const lower = slug.toLowerCase()

  // Rule 1: full-slug match (compound acronyms with hyphens preserved)
  if (ACRONYMS.has(lower)) return ACRONYMS.get(lower)

  // Rule 2: per-token lookup, join with space
  return lower
    .split('-')
    .filter(Boolean)
    .map((token) => {
      if (ACRONYMS.has(token)) return ACRONYMS.get(token)
      return token[0].toUpperCase() + token.slice(1)
    })
    .join(' ')
}

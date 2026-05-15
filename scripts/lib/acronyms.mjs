/**
 * ACRONYMS — single source of truth for tag-name acronym casing.
 *
 * Used by:
 *   - content-generation/scripts/upload-and-import.ts  → humanize() for new tag creation
 *   - website/scripts/inspect-tags-acronyms.mjs        → DB scan + repair of Title-Case mistakes
 *
 * Operational policy: content-generation/CLAUDE.md §2-A.
 * Drift verification: website/scripts/lint-acronyms.mjs (CLAUDE.md §2-A ⊆ ACRONYMS).
 *
 * When a new acronym appears in content:
 *   1) Add it to CLAUDE.md §2-A "약어 대문자 규칙" table.
 *   2) Add the same entry to ACRONYMS below.
 *   3) Add a humanize unit test case in website/tests/int/humanize.int.spec.ts.
 *   4) Run `pnpm tsx scripts/lint-acronyms.mjs` — must pass.
 *
 * Entry shape:
 *   - Key   = lowercase slug form (single token OR compound with hyphens, e.g. 'json-ld')
 *   - Value = exact display form for Tags.name (e.g. 'JSON-LD', 'iOS', 'SaaS')
 *
 * Compound entries (containing '-') are matched against the full slug FIRST in humanize().
 * If the slug is not a registered compound, humanize() tokenizes on '-' and looks up each token.
 *
 * Examples:
 *   ACRONYMS.get('aeo')      === 'AEO'        (single token acronym)
 *   ACRONYMS.get('saas')     === 'SaaS'       (mixed-case acronym, preserved exactly)
 *   ACRONYMS.get('json-ld')  === 'JSON-LD'    (compound, hyphen preserved)
 *   ACRONYMS.get('e-e-a-t')  === 'E-E-A-T'    (compound of single letters)
 */
export const ACRONYMS = new Map([
  // --- 개발 / 웹 표준 (development / web standards)
  ['html', 'HTML'],
  ['css', 'CSS'],
  ['scss', 'SCSS'],
  ['js', 'JS'],
  ['ts', 'TS'],
  ['jsx', 'JSX'],
  ['tsx', 'TSX'],
  ['api', 'API'],
  ['rest', 'REST'],
  ['json', 'JSON'],
  ['xml', 'XML'],
  ['yaml', 'YAML'],
  ['svg', 'SVG'],
  ['pdf', 'PDF'],
  ['url', 'URL'],
  ['uri', 'URI'],
  ['dom', 'DOM'],
  ['cdn', 'CDN'],
  ['dns', 'DNS'],
  ['ssl', 'SSL'],
  ['tls', 'TLS'],
  ['http', 'HTTP'],
  ['https', 'HTTPS'],
  ['rss', 'RSS'],
  ['csv', 'CSV'],
  ['tsv', 'TSV'],
  ['sql', 'SQL'],
  ['vpn', 'VPN'],
  ['ip', 'IP'],
  ['gps', 'GPS'],

  // --- AI / 데이터 (AI / data)
  ['ai', 'AI'],
  ['ml', 'ML'],
  ['llm', 'LLM'],
  ['nlp', 'NLP'],
  ['ocr', 'OCR'],
  ['ar', 'AR'],
  ['vr', 'VR'],
  ['xr', 'XR'],
  ['3d', '3D'],
  ['gpu', 'GPU'],
  ['cpu', 'CPU'],
  ['ram', 'RAM'],
  ['ssd', 'SSD'],
  ['hdd', 'HDD'],
  ['rag', 'RAG'],

  // --- 마케팅 / SEO (marketing / SEO)
  ['seo', 'SEO'],
  ['sem', 'SEM'],
  ['aeo', 'AEO'],
  ['geo', 'GEO'],
  ['cta', 'CTA'],
  ['kpi', 'KPI'],
  ['roi', 'ROI'],
  ['okr', 'OKR'],
  ['b2b', 'B2B'],
  ['b2c', 'B2C'],
  ['cms', 'CMS'],
  ['crm', 'CRM'],
  ['erp', 'ERP'],
  ['tco', 'TCO'],

  // --- UX / 디자인 (UX / design)
  ['ui', 'UI'],
  ['ux', 'UX'],
  ['cx', 'CX'],
  ['dx', 'DX'],
  ['rtl', 'RTL'],
  ['ltr', 'LTR'],

  // --- 개인정보 / 규제 (privacy / regulation)
  ['gdpr', 'GDPR'],
  ['ccpa', 'CCPA'],
  ['hipaa', 'HIPAA'],
  ['iso', 'ISO'],
  ['soc', 'SOC'],
  ['pci', 'PCI'],
  ['kisa', 'KISA'],
  ['faq', 'FAQ'],

  // --- 포맷 / 파일 (formats / files)
  ['pwa', 'PWA'],
  ['amp', 'AMP'],
  ['spa', 'SPA'],
  ['ssr', 'SSR'],
  ['csr', 'CSR'],
  ['mvp', 'MVP'],
  ['sdk', 'SDK'],
  ['cli', 'CLI'],
  ['gui', 'GUI'],
  ['ide', 'IDE'],
  ['ci', 'CI'],
  ['cd', 'CD'],
  ['qa', 'QA'],
  ['wysiwyg', 'WYSIWYG'],

  // --- 혼합 표기 (mixed casing — preserve exactly, do not Title-Case)
  ['ios', 'iOS'],
  ['macos', 'macOS'],
  ['watchos', 'watchOS'],
  ['tvos', 'tvOS'],
  ['ipados', 'iPadOS'],
  ['iphone', 'iPhone'],
  ['ebay', 'eBay'],
  ['npm', 'npm'],
  ['sass', 'Sass'],
  ['saas', 'SaaS'],
  ['paas', 'PaaS'],
  ['iaas', 'IaaS'],
  ['nosql', 'NoSQL'],
  ['graphql', 'GraphQL'],
  ['poc', 'PoC'],
  ['iot', 'IoT'],
  ['a11y', 'A11y'],
  ['webxr', 'WebXR'],
  ['neom', 'NEOM'],
  ['javascript', 'JavaScript'],
  ['wordpress', 'WordPress'],
  // Next.js: humanize() tokenizes the slug form 'nextjs' (no dot); lint-acronyms.mjs
  // lowercases the CLAUDE.md §2-A display token 'Next.js' to the key 'next.js'.
  // Both keys map to the same display form so humanize + lint agree.
  ['nextjs', 'Next.js'],
  ['next.js', 'Next.js'],

  // --- 복합 표기 (compound acronyms — hyphen preserved in full slug)
  // Matched against full slug FIRST in humanize().
  ['json-ld', 'JSON-LD'],
  ['e-e-a-t', 'E-E-A-T'],
])

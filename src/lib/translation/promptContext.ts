/**
 * Locale-scoped translation prompt context.
 *
 * Three layers injected into every Claude prompt to lift quality without
 * upgrading the model (Phase B-1 ④ companion). Iropke runs on Haiku;
 * domain accuracy and tone consistency come from this module, not raw model
 * capability.
 *
 *   1. STYLE_GUIDE  — per-locale tone / register directive (formality, sentence
 *                     endings, banned phrasings).
 *   2. GLOSSARY     — per-locale EN → target term map for software/tech vocab
 *                     that is routinely mistranslated by general-purpose models
 *                     ("ship"→"배송" instead of "출시", etc.). The `note` field
 *                     surfaces the disambiguator so the model knows WHY the
 *                     term is being pinned.
 *   3. EXAMPLES     — 2~3 few-shot EN → target pairs per locale demonstrating
 *                     the combined effect of style + glossary on real iropke
 *                     phrasings.
 *
 * Coverage tier:
 *   - CJK (ko/ja/zh): full glossary (~20 terms) + style + 3 examples.
 *   - Cyrillic / RTL (ru/ar): focused glossary (~10) + style + 2 examples.
 *   - Latin (de/fr/es/it/pt/nl/sv/da/pl/tr): minimal glossary (English-loaned
 *     tech terms preserved) + style + 2 examples.
 *   - Other (hi/th/id/ms): light glossary + style + 2 examples.
 *
 * Adding a new term / locale: edit the relevant section below and verify with
 * the admin "Translate" button on a representative Post. No code changes.
 */

import type { Locale } from '@/i18n/locales'

export interface GlossaryEntry {
  /** English source term (case-insensitive match on whole-word / phrase). */
  source: string
  /** Pinned target translation. */
  target: string
  /** Optional disambiguator surfaced to the model. */
  note?: string
}

export interface FewShotExample {
  en: string
  target: string
}

// ─────────────────────────────────────────────────────────────────────────
// Universal translation principle — injected into EVERY prompt regardless of
// locale (prepended in renderStyleGuide). This is the base rule: translate
// for natural reading, not word-for-word. Decided 2026-05-20 after origin
// ko review surfaced pervasive literal/calque phrasing.
// ─────────────────────────────────────────────────────────────────────────

export const UNIVERSAL_TRANSLATION_PRINCIPLE =
  'Core principle — you are a professional editorial translator, NOT a literal/word-for-word converter. ' +
  'Convey the MEANING in fluent, natural target-language prose: restructure sentences, change word order, ' +
  'split or merge clauses, and choose idiomatic phrasings so the result reads as if originally written in ' +
  'the target language by a senior writer. Never produce calques or stiff literal renderings. ' +
  'When no natural target-language word exists for a term, KEEP THE ENGLISH WORD verbatim rather than ' +
  'forcing an awkward translation — a preserved English term is usually more natural than a strained one. ' +
  'Preserve proper nouns, product/brand names, code, and technical identifiers as-is. ' +
  'CRITICAL — boundary whitespace: when the source text has leading or trailing whitespace (a single space, ' +
  'multiple spaces, or other whitespace), preserve that EXACT leading/trailing whitespace in your output. ' +
  'Do NOT trim, normalize, or alter boundary whitespace. The input may be a fragment of a larger sentence ' +
  '(broken up by inline links / bold spans / inline code), and the surrounding spaces are load-bearing — ' +
  'stripping them causes adjacent fragments to collide in the rendered HTML (e.g. "ranking" + " Google" ' +
  'must NOT become "rankingGoogle"). When translating around inline-element placeholders (⟪0⟫ ⟪1⟫ ...), ' +
  'keep the spacing that surrounds each placeholder. ' +
  'Resolve references for the reader: when the source uses a pronoun or demonstrative ' +
  "('it', 'this', 'these', 'that', 'the former/latter', 'the reverse') whose referent is recoverable, " +
  'prefer naming that referent explicitly in the target language instead of mirroring a bare anaphor — ' +
  'many target languages (Korean, Japanese, and others) read as vague or broken when an English pronoun ' +
  'is carried over literally. ' +
  'Translate ALL natural-language content you are given; this is editorial translation across many domains ' +
  '(technology, web/internet history, design, business, culture) — domain hints are only disambiguation aids, ' +
  'NEVER a reason to refuse, question scope, ask for clarification, or explain yourself.'

// ─────────────────────────────────────────────────────────────────────────
// Style guide — one short paragraph per locale. Embedded verbatim under
// "Style guide:" heading in the prompt. Keep under ~3 sentences each.
// ─────────────────────────────────────────────────────────────────────────

export const STYLE_GUIDE: Partial<Record<Locale, string>> = {
  ko: 'Use 합쇼체 (formal polite ~합니다 / ~입니다). Tone: editorial, calm, professional — like a senior engineer writing for peers. Do NOT use 해요체 (~해요), 반말 (~한다), advertising slogans, exclamation marks, or marketing superlatives. For best-practice recommendations (English imperatives like "Avoid X.", "Do Y.", "Prefer Z."), render as recommendation forms (~해야 합니다 / ~하는 것이 좋습니다 / ~을 권장합니다) — NOT plain statements (~합니다). MINIMIZE Sino-Korean (한자어) and stiff bookish wording: prefer plain, modern, natural Korean a real reader would say. AVOID ARCHAIC 한자어 that modern Korean readers do not use — examples: "선조" (use "전신" / "원형" / "초기 형태" for "predecessor / precursor"), "고로" (use "그래서" / "따라서"), "여하튼" (use "어쨌든" / "아무튼"), "왈" (use "말한다" / "말하기를"), "차치하고" (use "제쳐두고" / "차지하고"). If in doubt, choose the word a 2026 newspaper editor would use, not a 1970s textbook. Do NOT translate word-for-word — rewrite each sentence so it reads naturally in Korean (recast structure, do not mirror English syntax). When a natural Korean word does not exist, keep the English term rather than forcing an awkward 한자어/직역 (e.g. "persistent world" → "온라인 멀티플레이어 게임" 같은 자연스러운 의역 또는 영어 용어, NOT "영속적 세계"). Avoid translationese like "그것은 ~입니다 / ~라는 또 다른 질문입니다" — phrase as a Korean writer would. PRESERVE established English SW idioms verbatim (e.g. "silent failure", "race condition", "flaky test", "deadlock", "busy loop") — Korean tech readers expect these terms in English. ACRONYMS: PRESERVE English acronyms (UI / UX / AI / ML / API / URL / CSS / HTML / JS / TS / SEO / AEO / GEO / CMS / CRM / ERP / SaaS / B2B / B2C / GDPR / KPI / ROI / OKR / TCO / RFP / RAG / LLM / NLP / WCAG / JSON-LD / E-E-A-T etc.) VERBATIM in Korean prose. NEVER phonetically transliterate to Hangul (no 유아이 / 에이아이 / 에이피아이 / 에스이오 / 지디피알). NEVER swap an English acronym for its expanded Korean meaning ("AI" stays as "AI", NOT "인공지능"; "SEO" stays as "SEO", NOT "검색엔진최적화"). A first-mention inline gloss is acceptable when natural — "AI (인공지능)" once, then "AI" thereafter — but the acronym itself is never replaced by the meaning. FIRST PERSON: when the source uses "we / our" referring to Iropke (the publisher), render as 저희 / 이롭게 — NOT 우리. 우리 reads either casual or inclusive-of-the-reader in formal editorial; 저희 keeps the polite editorial distance. WHITESPACE: when your input fragment has a leading or trailing space (because it sits next to a bold span, link, or inline code in the parent paragraph), reproduce that exact leading/trailing space in your output — Korean does not need spaces between sentences but it DOES need spaces between adjacent inline elements in the rendered HTML, so do not strip boundary whitespace. KOREAN SYNTAX — translate the MEANING, never mirror English structure. (1) EXPLICIT SUBJECTS: a Korean sentence needs a clear subject/topic far more often than English. When the English elides the subject or carries it with "it / this / these / that / the reverse", name the actual noun in Korean — e.g. "the reverse is also true" → "반대의 경우도 마찬가지입니다" (NOT "반대 방향도 마찬가지입니다"). A bare "이 두 계층은 …" when the reader cannot tell what the two layers are reads as a dangling reference — name them. (2) DO NOT STACK MODIFIERS: English piles pre-modifiers in front of a noun ("top-ranking pages with deep heading structures and pronoun-heavy paragraphs"); mirroring that in Korean reads badly — break it into a short relative clause or split into two sentences. (3) ONE TOPIC PER SENTENCE: do not let the topic marker (X은/는) and the real subject of the predicate diverge — "이 두 계층은 … 이점이 누적됩니다" is broken Korean; recast so the sentence has one coherent subject. (4) DO NOT MIRROR "each X … each X" repetition — say "각 계층은 … 그 아래 계층에 의존합니다" once. (5) CHOOSE THE WORD BY MEANING, not by dictionary lookup — never reach for a stiff or technical 한자어 when a plain word carries the sense: "discrete" → 독립된 / 별개의 (NOT 이산적), "floor / indexing floor" → 최소 요건 (NOT 바닥선), "rewards" (each layer rewards X) → ~에 영향을 준다 / 유리하게 작용한다 (NOT 보상한다), "honest" (honest update date) → 정확한 (NOT 솔직한), "passage" (AEO sense) → 발췌 단위 (NOT 구절 / 구간 / 텍스트 조각). (6) NEVER compose an unfamiliar compound term morpheme-by-morpheme — "co-citation" is 동시 인용 (NOT 동료 + 인용), "byline" is 작성자 표기 (NOT 필명 + 서명); translate the whole concept or keep the English term. (7) If a sentence still reads awkwardly after a literal pass, REWRITE it from the meaning — restructure clause order and word order freely so the result reads as native Korean editorial prose, not as translated English.',
  ja: 'Use です・ます体 (polite written form). Tone: editorial, calm, professional. Avoid だ・である体, casual sentence endings, slang, exclamation marks, and marketing superlatives. Punctuation: 「、」 and 「。」 (full-width). PRESERVE established English SW idioms verbatim (e.g. "silent failure", "race condition", "flaky test", "deadlock", "busy loop") — Japanese tech readers expect these terms in English.',
  zh: 'Use 简体中文 with neutral, formal written register (书面语). Avoid colloquialisms, marketing superlatives, and exclamation marks. Punctuation: full-width「，」「。」「：」. PRESERVE established English SW idioms verbatim (e.g. "silent failure", "race condition", "flaky test", "deadlock", "busy loop") — Chinese tech readers expect these terms in English in editorial prose.',
  de: 'Use the formal Sie-Form when addressing the reader. Tone: editorial and professional, similar to c\'t or heise.de. Avoid Du-Form, marketing exclamations, and over-translation of established English tech terms.',
  fr: 'Use vouvoiement (vous). Tone: editorial and professional, similar to Le Monde tech section. Avoid tutoiement, marketing exclamations, and over-translation of established English tech terms.',
  es: 'Use the formal "usted" (or impersonal/passive constructions where natural). Tone: neutral, editorial, professional — readable across Spain and Latin America. Avoid regional slang and marketing exclamations.',
  it: 'Use the formal "Lei" (or impersonal constructions where natural). Tone: editorial and professional. Avoid colloquialisms and marketing exclamations.',
  pt: 'Use a forma neutra (3ª pessoa / "você" formal). Tom: editorial e profissional — legível tanto em Portugal quanto no Brasil. Evite gírias regionais e exclamações de marketing.',
  nl: 'Use the formal "u". Tone: editorial and professional. Avoid "je/jij", marketing exclamations, and over-translation of established English tech terms.',
  sv: 'Use neutral, professional written Swedish. Address the reader as "du" (standard modern Swedish, not formal "ni"). Avoid marketing exclamations and over-translation of established English tech terms.',
  da: 'Use neutral, professional written Danish. Address the reader as "du" (standard modern Danish). Avoid marketing exclamations and over-translation of established English tech terms.',
  pl: 'Use impersonal / passive constructions where natural, or the formal "Państwo / Pan(i)" when addressing the reader directly. Tone: editorial and professional. Avoid colloquialisms and marketing exclamations.',
  tr: 'Use the formal "siz". Tone: editorial and professional. Avoid "sen", marketing exclamations, and over-translation of established English tech terms.',
  ru: 'Use the formal "Вы" (capitalized when addressing the reader). Tone: editorial and professional, similar to Habr long-reads. Avoid colloquialisms, marketing exclamations, and over-translation of established English tech terms (transliterate established loanwords).',
  ar: 'Use Modern Standard Arabic (MSA / الفصحى). Tone: editorial and professional. Avoid dialectal forms (Egyptian / Levantine / Gulf), marketing exclamations, and over-translation of established English tech terms.',
  hi: 'Use formal "आप". Tone: editorial and professional. Avoid casual Hinglish where formal Hindi exists, but preserve established English tech terms in their common transliteration.',
  th: 'Use polite, formal written Thai (ครับ/ค่ะ are optional and usually omitted in written editorial). Tone: neutral and professional. Avoid casual particles, marketing exclamations, and over-translation of established English tech terms.',
  id: 'Use the formal "Anda" (capitalized). Tone: editorial and professional. Avoid "kamu", regional slang, and marketing exclamations.',
  ms: 'Use the formal "anda". Tone: editorial and professional. Avoid "kamu", regional slang, and marketing exclamations.',
}

// ─────────────────────────────────────────────────────────────────────────
// Glossary — domain-specific terms that get routinely mistranslated.
//
// Format: { source, target, note? }. The `note` is shown to the model to
// explain WHY the pinning exists, which helps it generalize to inflected
// forms ("shipping", "shipped", "shippable" should all map to the release
// sense, not the logistics sense).
//
// Brand names + product names are handled by the brand rule, not glossary.
// ─────────────────────────────────────────────────────────────────────────

const SOFTWARE_CONTEXT_NOTE =
  'in software / product release context — NOT logistics'

export const GLOSSARY: Partial<Record<Locale, GlossaryEntry[]>> = {
  // ── CJK ────────────────────────────────────────────────────────────────
  ko: [
    {
      source: 'Answer Engine Optimization / AEO',
      target: 'Answer Engine Optimization (AEO) / AEO (영문 보존)',
      note:
        'KEEP IN ENGLISH VERBATIM — "AEO" is an established industry term (parallel to "SEO") that Korean ' +
        'marketing/tech readers expect in English. First mention may spell out as "Answer Engine Optimization (AEO)"; ' +
        'subsequent mentions use "AEO" alone. NEVER translate as "답변 엔진 최적화" — this is a stiff calque that ' +
        'no Korean industry source uses. Same policy as "SEO" / "GEO" / "LLM" — preserve as-is.',
    },
    {
      source: 'GEO / Generative Engine Optimization',
      target: 'GEO / Generative Engine Optimization (영문 보존)',
      note:
        'KEEP IN ENGLISH VERBATIM — industry term coined 2023-2024 (Gartner). Use "GEO" or spell out in English. ' +
        'NEVER "생성 엔진 최적화" / "생성형 엔진 최적화".',
    },
    {
      source: 'SEO',
      target: 'SEO (영문 보존)',
      note: 'KEEP IN ENGLISH VERBATIM. NEVER "검색 엔진 최적화" in editorial prose.',
    },
    {
      source: 'predecessor / precursor',
      target: '전신 / 원형 / 초기 형태 / 토대',
      note:
        'NOT 선조 — "선조" is archaic and means "ancestor" in a genealogical sense. For "intellectual ancestor", ' +
        '"predecessor of X" in tech/history writing, use 전신 (most natural for direct lineage), 원형 (prototype/' +
        'template role), 초기 형태 (early form), or 토대 (foundation). For "structural precursor" specifically, ' +
        'a bare "구조적 전신" reads opaque — REWRITE the sentence around the meaning: "the structural precursor of ' +
        'all AI answer engines" → "오늘날 모든 AI 답변 엔진의 구조적 토대가 된 …" or "… 의 구조를 처음 제시한 …".',
    },
    {
      source: 'ship',
      target: '출시 (런칭 의미) / 적용 / 반영 (엔지니어 코드 적용 의미)',
      note:
        'SW context — TWO senses. (a) launching a new feature/product → 출시 / 릴리스 (e.g. "ship a feature"). ' +
        '(b) engineer how-to checklist "ship code" / "what to ship this week" → 적용 / 반영 / 배포. ' +
        'Pick by sentence context. NEVER 배송 (logistics).',
    },
    { source: 'shipping', target: '출시 중 / 적용 중', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'shipped', target: '출시한 / 적용한', note: SOFTWARE_CONTEXT_NOTE },
    {
      source: 'silent failure / silent failure mode',
      target: 'silent failure (영문 보존)',
      note:
        'KEEP IN ENGLISH VERBATIM — "silent failure" is established SW jargon with no idiomatic Korean equivalent. ' +
        'Korean tech readers expect these terms in English. Same policy for "race condition", "flaky test", ' +
        '"deadlock", "busy loop" — preserve as-is. If the sentence is conceptual and needs a Korean rendering, ' +
        'describe the behavior ("겉으론 동작하지만 실제로는 잘못된 케이스"). ' +
        'NEVER 조용한 실패 / 무음 실패 (literal translations that read as foreign).',
    },
    { source: 'sticky', target: '고정 / 스티키', note: 'UI positioning (sticky CTA / sticky header) — NOT 끈기 있는 / 끈적한' },
    { source: 'busy loop', target: 'busy loop / 분주 루프', note: 'CS jargon — keep English when reader is technical' },
    {
      source: 'mental model',
      target: '사고 모델 / 사고방식 / 멘탈 모델',
      note: 'NOT 정신 모델 (직역, 어색함). 한국어 IT 글에서는 "사고 모델" 또는 "사고방식" 이 자연스러움.',
    },
    {
      source: 'defense / defensive (design / code context)',
      target: '대응 / 해결 방법 / 방어책',
      note:
        'When the sentence is about how to mitigate a UX/code problem ' +
        '("the cleanest defense is to ..."), render as 대응 / 해결 방법 / 방어책 — NOT literal 방어.',
    },
    {
      source: 'gains compound',
      target: '효과가 누적됩니다 / 이점이 쌓입니다',
      note: 'Idiom: gains accumulate over time. NOT 이득이 누적됩니다 (financial-leaning).',
    },
    { source: 'release', target: '릴리스 / 배포' },
    { source: 'deploy', target: '배포', note: 'NOT 전개' },
    { source: 'deployment', target: '배포' },
    { source: 'build', target: '빌드', note: 'NOT 건설' },
    { source: 'commit', target: '커밋', note: 'NOT 약속' },
    { source: 'branch', target: '브랜치', note: 'NOT 지점' },
    { source: 'merge', target: '병합 / 머지' },
    { source: 'push', target: '푸시' },
    { source: 'pull', target: '풀' },
    { source: 'pull request', target: 'PR / 풀 리퀘스트' },
    { source: 'repository', target: '저장소 / 리포지토리' },
    { source: 'pipeline', target: '파이프라인', note: 'NOT 송유관' },
    { source: 'production', target: '운영 / 프로덕션', note: 'NOT 생산' },
    { source: 'staging', target: '스테이징' },
    { source: 'preview', target: '프리뷰 / 미리보기' },
    { source: 'migration', target: '마이그레이션', note: 'DB / schema context' },
    { source: 'feature', target: '기능' },
    { source: 'workflow', target: '워크플로' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'SDK', target: 'SDK', note: 'keep verbatim' },
    { source: 'this week', target: '이번 주' },
    { source: 'next week', target: '다음 주' },

    // ── Audit / review / inspection — editorial context, NOT 감사 / 감시 ────
    {
      source: 'audit',
      target: '점검 / 진단 / 검토 (SEO·content·performance·accessibility·UX·brand 맥락) — 감사 (financial·compliance·회계 맥락만)',
      note:
        'CRITICAL — context-dependent and HEAVILY mistranslated. ' +
        '(a) For SEO / content / performance / accessibility / UX / brand audits in editorial prose, ALWAYS render as 점검 / 진단 / 검토. ' +
        'NEVER 감사 in these contexts — 감사 carries a financial-audit / internal-investigation nuance that reads wrong for an SEO or content review. ' +
        'NEVER 감시 — 감시 means surveillance (a completely different word, full mistranslation). ' +
        '(b) For genuine financial / regulatory / compliance audits (회계 감사, 내부 감사), 감사 IS correct and should be used. ' +
        '(c) For security audits, prefer 보안 점검; 보안 감사 is tolerated but less natural in editorial prose. ' +
        'Inflected forms ("auditing", "audited", "auditor") follow the same context rule.',
    },
    {
      source: 'review',
      target: '검토 (일반) / 리뷰 (code · design 산출물 맥락)',
      note: 'NOT 감사 — review ≠ audit. General "review" is 검토; code review / design review use 리뷰.',
    },
    { source: 'assessment', target: '평가 / 진단' },
    { source: 'inspection', target: '점검 / 검사' },

    // ── Business / strategy vocabulary ─────────────────────────────────
    {
      source: 'playbook',
      target: '실행 지침 / 운영 가이드 (preferred) / 플레이북 (acceptable but imported feel)',
      note:
        'Prefer 실행 지침 or 운영 가이드 for editorial consistency. 플레이북 is a valid transliteration but reads as borrowed jargon — use only when the source emphasizes the imported nuance.',
    },
    {
      source: 'framework',
      target: '체계 / 틀 / 프레임 (사고·전략 맥락) — 프레임워크 (tech library 맥락만: React 프레임워크, Next.js 프레임워크)',
      note:
        'CRITICAL — context-dependent. (a) Strategic / mental / conceptual "framework" (decision framework, strategic framework, mental framework) → 체계 / 틀 / 프레임. (b) Technical library / runtime (React, Vue, Next.js, Django) → 프레임워크. Picking the wrong sense makes editorial prose read as a code tutorial.',
    },
    {
      source: 'posture',
      target: '태세 / 대응 체계',
      note: 'NOT 자세 — 자세 means physical body posture, wrong nuance in business prose. Security posture = 보안 태세; brand posture = 브랜드 태세.',
    },
    {
      source: 'stewardship',
      target: '운영 책임 / 관리 책임',
      note: 'NOT 집사 / 집사직 — those are literal "butler / butlership" translations that read absurd in business prose. Brand stewardship = 브랜드 운영 책임; data stewardship = 데이터 관리 책임.',
    },
    {
      source: 'gate',
      target: '게이트 / 검수 단계 / 체크포인트',
      note: 'For quality gate / handoff gate / approval gate. NOT 관문 — 관문 is literal and archaic, reads as a physical gateway, not a process checkpoint.',
    },
    {
      source: 'stack',
      target: '스택 / 기술 스택 (IT 맥락) — 구성 / 조합 (일반 맥락)',
      note: 'Context-dependent. Tech "stack" (frontend stack, deployment stack, MarTech stack) → 스택 / 기술 스택. General "stack of priorities" / "stack of options" → 구성 / 조합.',
    },
    {
      source: 'rollout',
      target: '단계적 도입 / 전환 / 배포',
      note: '롤아웃 is acceptable only in IT release context. In business / strategy prose (feature rollout, market rollout, policy rollout), prefer 단계적 도입 or 전환.',
    },
    {
      source: 'trade-off',
      target: '상충 관계 / 트레이드오프',
      note: 'NOT 거래 — 거래 is a literal mistranslation; trade-off is not a transaction. 상충 관계 is most editorial; 트레이드오프 is acceptable in tech/PM contexts.',
    },
    {
      source: 'takeaway',
      target: '핵심 / 시사점 / 요점',
      note: 'NOT 테이크아웃 — 테이크아웃 is food takeaway, a completely different word. "Key takeaway" = 핵심 시사점; "main takeaways" = 주요 요점.',
    },
    { source: 'deliverable', target: '산출물 / 결과물' },
    {
      source: 'scope',
      target: '범위 / 스코프',
      note: 'Project scope context. 범위 is most natural editorial; 스코프 is acceptable in PM / engineering jargon.',
    },
    { source: 'scope creep', target: '범위 확장 / 스코프 크리프', note: 'Both are used; pick the one that matches surrounding register.' },
    {
      source: 'buy-in',
      target: '승인 / 공감 확보 / 동의 확보',
      note: 'NOT 구매 — 구매 is literal "purchase" and is a complete mistranslation. Stakeholder buy-in = 이해관계자 동의 확보; executive buy-in = 임원 승인.',
    },
    { source: 'roadmap', target: '로드맵' },
    {
      source: 'baseline',
      target: '기준선 / 베이스라인',
      note: 'Tech baseline (performance baseline, browser-support Baseline, perf baseline) → 베이스라인. General reference baseline (baseline measurement, baseline year) → 기준선.',
    },
    { source: 'benchmark', target: '벤치마크 / 기준 척도' },

    // ── Company / brand vocabulary ─────────────────────────────────────
    {
      source: 'enterprise',
      target: '엔터프라이즈 / 기업',
      note: 'Adjective ("enterprise web", "enterprise CTO", "enterprise build") — both are acceptable; pick whichever flows better in the sentence and KEEP THE CHOICE CONSISTENT within a single article.',
    },
    {
      source: 'in-house',
      target: '사내 / 인하우스',
      note: 'For in-house design / dev / brand team. 사내 is more native Korean; 인하우스 is industry jargon. Either is acceptable — pick by surrounding register.',
    },

    // ── Editorial / AEO vocabulary that is routinely calqued ───────────
    {
      source: 'passage',
      target: '단락 / 문단 (물리적 텍스트 블록) — 발췌 단위 / 추출 단위 (AEO 추출 개념)',
      note:
        'CRITICAL — context-dependent and heavily mistranslated. (a) When "passage" means a physical block of ' +
        'body text → 단락 / 문단. (b) When it means the AEO concept — a short self-contained chunk an AI answer ' +
        'engine extracts (the "passage" in "passage ranking" / "passage-level competition" / "AEO ranks passages") ' +
        '→ 발췌 단위 or 추출 단위. NEVER 구절 (reads as a scripture verse), NEVER 구간 (reads as an interval / ' +
        'route section), NEVER 텍스트 조각 (sounds like a stray fragment). "AEO ranks passages" → ' +
        '"AEO 는 발췌 단위를 평가합니다" (NOT "구간을 순위 매깁니다").',
    },
    {
      source: 'discrete',
      target: '독립된 / 별개의 / 하나하나 구분되는',
      note:
        'NOT 이산적 — 이산적 is a mathematics/CS term (discrete vs. continuous) an ordinary reader does not parse. ' +
        '"a discrete chunk of text" → 독립된 텍스트 단위 / 하나의 완결된 텍스트 단위.',
    },
    {
      source: 'honest (honest update date / honest signal 등)',
      target: '정확한 / 사실에 기반한',
      note:
        'NOT 솔직한 — 솔직한 means "candid / frank" (a personality trait) and is wrong here. An "honest update ' +
        'date" is one that truthfully reflects when the content changed → 정확한 업데이트 날짜 / 실제 수정 시점을 ' +
        '반영한 날짜.',
    },
    {
      source: 'the reverse / the opposite (the reverse is also true 등)',
      target: '반대의 경우 / 그 반대도',
      note:
        'NOT 반대 방향 — 반대 방향 means a physical direction. "The reverse is also true" → ' +
        '"반대의 경우도 마찬가지입니다".',
    },
    {
      source: 'reward / rewards (each layer rewards different work 등)',
      target: '~에 영향을 준다 / ~에 유리하게 작용한다 / 좌우한다',
      note:
        'NOT 보상하다 — 보상 means compensation / a reward payment. "Each layer rewards different work" means ' +
        'each layer responds to / is moved by different work → "각 계층은 서로 다른 작업에 영향을 받습니다".',
    },
    {
      source: 'floor (indexing floor / baseline floor 등)',
      target: '최소 요건 / 기본 전제 / 하한선',
      note:
        'NOT 바닥선 — 바닥선 is not idiomatic Korean and is unparseable. An "indexing floor" is the minimum bar ' +
        'a page must clear → "색인을 위한 최소 요건".',
    },
    {
      source: 'co-citation',
      target: '동시 인용 (여러 출처가 같은 맥락에서 함께 인용되는 현상)',
      note:
        'A SINGLE concept — do NOT split it morpheme-by-morpheme into "동료(co) + 인용/말하다" (이는 완전 오역). ' +
        'It is the SEO/AEO phenomenon of two entities being cited together. Translate as 동시 인용; first mention ' +
        'may keep "co-citation" in English if a gloss helps.',
    },
    {
      source: 'byline',
      target: '작성자 표기 / 바이라인',
      note:
        'The author-credit line on an article. Do NOT compose it morpheme-by-morpheme (e.g. "필명이 서명한 배열" ' +
        '— nonsensical). "consistent bylines across articles" → "모든 기사에서 일관된 작성자 표기".',
    },
    {
      source: 'companion spoke / the companion spoke on',
      target: '관련 글 / 함께 보면 좋은 글',
      note:
        'CRITICAL — here "spoke" is the NOUN from "hub-and-spoke" (a sibling article in the same content ' +
        'cluster), NOT the past tense of "speak". "The companion spoke on [X] covers …" → ' +
        '"[X] 를 다루는 관련 글에서는 … 다룹니다". NEVER 동료가 말했습니다 / 동료는 다음과 같이 말했습니다 ' +
        '(reading "spoke" as a verb and "companion" as a colleague — a full mistranslation).',
    },
  ],
  ja: [
    {
      source: 'ship',
      target: 'リリース (公開リリース) / 反映 / 適用 (コード適用)',
      note:
        'SW context — TWO senses. (a) launching a new feature/product → リリース. ' +
        '(b) engineer how-to checklist "ship code" / "what to ship this week" → 反映 / 適用. ' +
        'Pick by sentence context. NEVER 配送 (logistics).',
    },
    { source: 'shipping', target: 'リリース中 / 適用中', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'shipped', target: 'リリース済み / 適用済み', note: SOFTWARE_CONTEXT_NOTE },
    {
      source: 'silent failure / silent failure mode',
      target: 'silent failure (英語のまま)',
      note:
        'KEEP IN ENGLISH VERBATIM — "silent failure" is established SW jargon with no idiomatic Japanese equivalent. ' +
        'Japanese tech readers expect these terms in English. Same policy for "race condition", "flaky test", ' +
        '"deadlock", "busy loop" — preserve as-is. If the sentence is conceptual and needs a Japanese rendering, ' +
        'describe the behavior ("見た目は動いているが実際は失敗しているケース"). ' +
        'NEVER 静かな失敗 / サイレント障害.',
    },
    { source: 'sticky', target: '固定 / スティッキー', note: 'UI positioning — NOT 粘着' },
    { source: 'busy loop', target: 'ビジーループ / busy loop', note: 'CS jargon' },
    {
      source: 'mental model',
      target: '思考モデル / メンタルモデル',
      note: 'NOT 精神モデル (直訳、不自然). Japanese tech writing prefers 思考モデル or transliteration メンタルモデル.',
    },
    {
      source: 'defense / defensive (design / code context)',
      target: '対策 / 解決策 / 防御策',
      note:
        'When the sentence is about mitigating a UX/code problem ("the cleanest defense is to..."), ' +
        'render as 対策 / 解決策 — NOT literal 防御.',
    },
    {
      source: 'gains compound',
      target: '効果が積み上がります / メリットが蓄積します',
      note: 'Idiom: gains accumulate over time. NOT 利得が複合 (literal).',
    },
    { source: 'release', target: 'リリース' },
    { source: 'deploy', target: 'デプロイ' },
    { source: 'deployment', target: 'デプロイ' },
    { source: 'build', target: 'ビルド' },
    { source: 'commit', target: 'コミット' },
    { source: 'branch', target: 'ブランチ' },
    { source: 'merge', target: 'マージ' },
    { source: 'push', target: 'プッシュ' },
    { source: 'pull', target: 'プル' },
    { source: 'pull request', target: 'プルリクエスト' },
    { source: 'repository', target: 'リポジトリ' },
    { source: 'pipeline', target: 'パイプライン' },
    { source: 'production', target: '本番' },
    { source: 'staging', target: 'ステージング' },
    { source: 'preview', target: 'プレビュー' },
    { source: 'migration', target: 'マイグレーション' },
    { source: 'feature', target: '機能' },
    { source: 'workflow', target: 'ワークフロー' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'SDK', target: 'SDK', note: 'keep verbatim' },
  ],
  zh: [
    {
      source: 'ship',
      target: '发布 (产品 / 功能发布) / 落地 / 应用 (工程师代码应用)',
      note:
        'SW context — TWO senses. (a) launching a new feature/product → 发布. ' +
        '(b) engineer how-to checklist "ship code" / "what to ship this week" → 落地 / 应用 / 部署. ' +
        'Pick by sentence context. NEVER 运输 / 装运 (logistics).',
    },
    { source: 'shipping', target: '发布中 / 落地中', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'shipped', target: '已发布 / 已落地', note: SOFTWARE_CONTEXT_NOTE },
    {
      source: 'silent failure / silent failure mode',
      target: 'silent failure (保留英文)',
      note:
        'KEEP IN ENGLISH VERBATIM — "silent failure" is established SW jargon. ' +
        'Chinese tech writing increasingly preserves such terms (race condition, flaky test, deadlock, busy loop). ' +
        'If the sentence is conceptual and needs a Chinese rendering, describe the behavior ' +
        '("看似正常但实际失败的情况"). 静默失败 is acceptable but less natural in long-form editorial. ' +
        'NEVER 无声失败.',
    },
    { source: 'sticky', target: '固定 / 吸顶', note: 'UI positioning — NOT 粘性' },
    { source: 'busy loop', target: '忙循环 / busy loop', note: 'CS jargon' },
    {
      source: 'mental model',
      target: '思维模型 / 心智模型',
      note: 'NOT 精神模型 (literal, awkward). Chinese tech writing prefers 思维模型 or 心智模型.',
    },
    {
      source: 'defense / defensive (design / code context)',
      target: '应对方法 / 解决方法 / 防御策略',
      note:
        'When the sentence is about mitigating a UX/code problem ("the cleanest defense is to..."), ' +
        'render as 应对方法 / 解决方法 — NOT literal 防御.',
    },
    {
      source: 'gains compound',
      target: '收益累积 / 收益叠加',
      note: 'Idiom: gains accumulate over time. NOT 收益复合 (financial-only sense).',
    },
    { source: 'release', target: '发布 / 版本' },
    { source: 'deploy', target: '部署' },
    { source: 'deployment', target: '部署' },
    { source: 'build', target: '构建' },
    { source: 'commit', target: '提交' },
    { source: 'branch', target: '分支' },
    { source: 'merge', target: '合并' },
    { source: 'push', target: '推送' },
    { source: 'pull', target: '拉取' },
    { source: 'pull request', target: 'Pull Request', note: 'keep English' },
    { source: 'repository', target: '仓库' },
    { source: 'pipeline', target: '流水线 / Pipeline' },
    { source: 'production', target: '生产环境' },
    { source: 'staging', target: '预发布环境' },
    { source: 'preview', target: '预览' },
    { source: 'migration', target: '迁移' },
    { source: 'feature', target: '功能' },
    { source: 'workflow', target: '工作流' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'SDK', target: 'SDK', note: 'keep verbatim' },
  ],

  // ── Cyrillic / RTL ────────────────────────────────────────────────────
  ru: [
    { source: 'ship', target: 'выпуск / релиз', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'релиз' },
    { source: 'deploy', target: 'деплой / развёртывание' },
    { source: 'build', target: 'сборка' },
    { source: 'commit', target: 'коммит' },
    { source: 'branch', target: 'ветка' },
    { source: 'merge', target: 'слияние / merge' },
    { source: 'repository', target: 'репозиторий' },
    { source: 'pipeline', target: 'пайплайн' },
    { source: 'production', target: 'продакшн' },
    { source: 'staging', target: 'стейджинг' },
    { source: 'preview', target: 'превью' },
    { source: 'feature', target: 'фича / функция' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  ar: [
    { source: 'ship', target: 'إطلاق / نشر', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'إصدار' },
    { source: 'deploy', target: 'نشر' },
    { source: 'build', target: 'بناء' },
    { source: 'commit', target: 'commit', note: 'keep English transliteration / verbatim' },
    { source: 'branch', target: 'فرع' },
    { source: 'merge', target: 'دمج' },
    { source: 'repository', target: 'مستودع' },
    { source: 'pipeline', target: 'pipeline', note: 'keep verbatim' },
    { source: 'production', target: 'بيئة الإنتاج' },
    { source: 'staging', target: 'staging', note: 'keep verbatim' },
    { source: 'preview', target: 'معاينة' },
    { source: 'feature', target: 'ميزة' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],

  // ── Latin script (keep most tech terms in English) ────────────────────
  de: [
    { source: 'ship', target: 'veröffentlichen / ausliefern', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'Release / Veröffentlichung' },
    { source: 'deploy', target: 'deployen / ausrollen' },
    { source: 'feature', target: 'Feature / Funktion' },
    { source: 'pull request', target: 'Pull Request', note: 'keep English' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'production', target: 'Produktion / Production' },
  ],
  fr: [
    { source: 'ship', target: 'livrer / publier', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release / version' },
    { source: 'deploy', target: 'déployer' },
    { source: 'feature', target: 'fonctionnalité / feature' },
    { source: 'pull request', target: 'pull request', note: 'keep English' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'production', target: 'production' },
  ],
  es: [
    { source: 'ship', target: 'publicar / lanzar', note: SOFTWARE_CONTEXT_NOTE + ' (NO "enviar")' },
    { source: 'release', target: 'release / versión' },
    { source: 'deploy', target: 'desplegar / hacer deploy' },
    { source: 'feature', target: 'funcionalidad / feature' },
    { source: 'pull request', target: 'pull request', note: 'keep English' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
    { source: 'production', target: 'producción' },
  ],
  it: [
    { source: 'ship', target: 'rilasciare / pubblicare', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release / versione' },
    { source: 'deploy', target: 'fare il deploy / rilasciare' },
    { source: 'feature', target: 'funzionalità / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  pt: [
    { source: 'ship', target: 'publicar / lançar', note: SOFTWARE_CONTEXT_NOTE + ' (NÃO "enviar")' },
    { source: 'release', target: 'release / versão' },
    { source: 'deploy', target: 'fazer deploy / publicar' },
    { source: 'feature', target: 'funcionalidade / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  nl: [
    { source: 'ship', target: 'uitbrengen / releasen', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release' },
    { source: 'deploy', target: 'deployen' },
    { source: 'feature', target: 'feature / functie' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  sv: [
    { source: 'ship', target: 'släppa / publicera', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release / version' },
    { source: 'deploy', target: 'deploya' },
    { source: 'feature', target: 'funktion / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  da: [
    { source: 'ship', target: 'frigive / udsende', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release / version' },
    { source: 'deploy', target: 'deploye' },
    { source: 'feature', target: 'funktion / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  pl: [
    { source: 'ship', target: 'wydać / opublikować', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'release / wydanie' },
    { source: 'deploy', target: 'wdrożyć / zdeployować' },
    { source: 'feature', target: 'funkcja / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  tr: [
    { source: 'ship', target: 'yayınlamak', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'sürüm / release' },
    { source: 'deploy', target: 'dağıtmak / deploy etmek' },
    { source: 'feature', target: 'özellik / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],

  // ── Other ─────────────────────────────────────────────────────────────
  hi: [
    { source: 'ship', target: 'रिलीज़ करना', note: SOFTWARE_CONTEXT_NOTE },
    { source: 'release', target: 'रिलीज़' },
    { source: 'deploy', target: 'डिप्लॉय' },
    { source: 'build', target: 'बिल्ड' },
    { source: 'feature', target: 'फ़ीचर' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  th: [
    { source: 'ship', target: 'เปิดตัว / ปล่อย', note: SOFTWARE_CONTEXT_NOTE + ' (ไม่ใช่ "จัดส่ง")' },
    { source: 'release', target: 'ปล่อย / รีลีส' },
    { source: 'deploy', target: 'deploy', note: 'keep English transliteration' },
    { source: 'build', target: 'บิลด์' },
    { source: 'feature', target: 'ฟีเจอร์' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  id: [
    { source: 'ship', target: 'merilis / menerbitkan', note: SOFTWARE_CONTEXT_NOTE + ' (BUKAN "mengirim")' },
    { source: 'release', target: 'rilis' },
    { source: 'deploy', target: 'deploy / menerapkan' },
    { source: 'feature', target: 'fitur' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
  ms: [
    { source: 'ship', target: 'melancarkan / menerbitkan', note: SOFTWARE_CONTEXT_NOTE + ' (BUKAN "menghantar")' },
    { source: 'release', target: 'pelancaran / versi' },
    { source: 'deploy', target: 'deploy / terapkan' },
    { source: 'feature', target: 'ciri / feature' },
    { source: 'API', target: 'API', note: 'keep verbatim' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// Few-shot examples — 2~3 per locale. Each example exercises the style
// guide AND at least one glossary entry, so the model sees them applied
// together. Keep them short, editorial, and recognizably iropke-flavored.
// ─────────────────────────────────────────────────────────────────────────

export const EXAMPLES: Partial<Record<Locale, FewShotExample[]>> = {
  ko: [
    // "ship" sense (a): public release of a new feature/product
    {
      en: 'We are shipping the new editor next week.',
      target: '다음 주에 새 에디터를 출시합니다.',
    },
    // "ship" sense (b): engineer how-to checklist (split-view article heading)
    { en: 'What to ship this week', target: '이번 주에 시도해볼 체크리스트들' },
    // "silent failure" — keep English verbatim (established SW idiom)
    {
      en: 'The most common silent failure mode is X.',
      target: '가장 흔히 발생하는 silent failure 케이스는 X 입니다.',
    },
    // "defense" + "reading X" + fragment around inline code preserved as English
    {
      en: 'The cleanest defense is to stop reading window.innerWidth for layout decisions.',
      target: '가장 깔끔한 해결방법은 레이아웃 결정에 window.innerWidth 를 읽지 않는 것입니다.',
    },
    // Recommendation mood — "Avoid X" should use ~피해야 합니다, not ~합니다
    {
      en: 'Avoid polling window.innerWidth inside setInterval.',
      target: 'setInterval 안에서 window.innerWidth 를 폴링하는 방식은 피해야 합니다.',
    },
    // "mental model" — drop literal "정신 모델"
    {
      en: 'This mental model helps you debug responsive issues.',
      target: '이러한 사고방식은 반응형 이슈를 디버깅할 때 도움이 됩니다.',
    },
    // "gains compound" idiom
    {
      en: 'The migration is incremental and the gains compound.',
      target: '마이그레이션은 점진적이며 실행에 따른 이점이 누적됩니다.',
    },
    // AEO — keep English verbatim, NOT "답변 엔진 최적화"
    {
      en: 'Answer Engine Optimization (AEO) is the practice of structuring page content so AI engines extract and cite your text.',
      target:
        'Answer Engine Optimization (AEO) 는 AI 엔진이 페이지 콘텐츠를 추출하고 인용하도록 구조를 잡는 작업입니다.',
    },
    // "structural precursor" — rewrite, do NOT calque as "구조적 전신"
    {
      en: 'Google launched what is the structural precursor of all AI answer engines.',
      target: 'Google이 출시한 그 기능은 오늘날 모든 AI 답변 엔진의 구조적 토대가 되었습니다.',
    },
    // Boundary whitespace preservation — fragment with leading space before "Google"
    {
      en: ' Google launched the feature in November 2020.',
      target: ' Google은 2020년 11월에 그 기능을 출시했습니다.',
    },
    // "audit" — editorial SEO/content/UX context → 점검 / 진단, NEVER 감사 / 감시
    {
      en: 'Run a content audit before the next planning cycle.',
      target: '다음 기획 사이클 전에 콘텐츠 점검을 진행합니다.',
    },
    {
      en: 'The accessibility audit surfaced three blocking issues.',
      target: '접근성 점검에서 세 가지 차단성 이슈가 발견되었습니다.',
    },
    // Enterprise altitude framing — typical altitude-correct H2 phrasing
    {
      en: 'Diagnostic checklist for the next planning cycle',
      target: '차기 기획 사이클을 위한 진단 체크리스트',
    },
    // "playbook" — 실행 지침 (preferred over 플레이북)
    {
      en: 'This playbook is the operating model for marketing-led growth.',
      target: '이 실행 지침은 마케팅 주도 성장을 위한 운영 모델입니다.',
    },
    // "posture" — 태세, NOT 자세
    {
      en: 'The security posture must be re-evaluated each year.',
      target: '보안 태세는 매년 재평가해야 합니다.',
    },
    // "stewardship" — 운영 책임, NOT 집사
    {
      en: 'Brand consistency is an act of stewardship, not policing.',
      target: '브랜드 일관성은 단속이 아니라 운영 책임의 한 형태입니다.',
    },
    // "buy-in" — 승인 / 동의 확보, NOT 구매
    {
      en: 'Executive buy-in is the bottleneck on every enterprise rebuild.',
      target: '엔터프라이즈 재구축에서 임원 승인은 매번 병목 지점입니다.',
    },
    // "we / our" referring to Iropke → 저희 (NOT 우리)
    {
      en: 'Our team has shipped this pattern across enterprise builds.',
      target: '저희 팀은 엔터프라이즈 빌드 전반에 이 패턴을 적용해 왔습니다.',
    },
    // "framework" — context split: strategic 체계 vs technical 프레임워크
    {
      en: 'This decision framework helps leadership prioritize cross-functional bets.',
      target: '이러한 의사결정 체계는 리더십이 부서 간 투자 우선순위를 정하는 데 도움이 됩니다.',
    },
    // "passage" (AEO sense) — 발췌 단위, NOT 구절 / 구간
    {
      en: 'Classic SEO ranks pages; Answer Engine Optimization ranks passages.',
      target:
        'Classic SEO 는 페이지를 평가하고, Answer Engine Optimization (AEO) 는 발췌 단위를 평가합니다.',
    },
    // "discrete" — 독립된, NOT 이산적 (math jargon)
    {
      en: 'A passage is a discrete chunk of text, 50–90 words long, that an AI engine lifts out as a visible answer.',
      target:
        '발췌 단위란 AI 엔진이 눈에 보이는 답변으로 뽑아내는, 50~90단어 길이의 독립된 텍스트 단위입니다.',
    },
    // "the reverse" — 반대의 경우, NOT 반대 방향
    { en: 'The reverse is also true.', target: '반대의 경우도 마찬가지입니다.' },
    // Anti-calque: an English sentence rewritten as native Korean, not mirrored
    {
      en: 'A page that is not crawlable or carries no canonical link value will not be extracted, no matter how well its paragraphs are written.',
      target:
        '크롤링이 불가능하거나 링크로서의 가치가 없는 페이지는 문단이 아무리 잘 작성되어 있어도 인용되지 않습니다.',
    },
    // Anti-stacking: break English pre-modifier pile-ups into a clean clause
    {
      en: 'Top-ranking pages with deep heading structures and pronoun-heavy paragraphs may still be invisible in AI Overviews.',
      target:
        '제목 구조가 복잡하거나 대명사가 많은 문단으로 이루어진 페이지는 검색 순위가 높더라도 AI Overviews 에는 노출되지 않을 수 있습니다.',
    },
    // "rewards" — 영향을 받는다, NOT 보상한다; and no "each…each" mirroring
    {
      en: 'Each layer rewards different work, and each depends on the one beneath it.',
      target: '각 계층은 서로 다른 작업에 영향을 받으며, 그 아래 계층에 의존합니다.',
    },
    // "honest" (honest update date) — 정확한, NOT 솔직한
    { en: 'an honest update date', target: '정확한 업데이트 날짜' },
  ],
  ja: [
    // "ship" sense (a): public release
    {
      en: 'We are shipping the new editor next week.',
      target: '来週、新しいエディターをリリースします。',
    },
    // "ship" sense (b): engineer how-to checklist
    { en: 'What to ship this week', target: '今週試してみる項目' },
    {
      en: 'The most common silent failure mode is X.',
      target: '最もよくある silent failure ケースは X です。',
    },
    {
      en: 'The cleanest defense is to stop reading window.innerWidth for layout decisions.',
      target: '最も簡潔な対策は、レイアウト判定で window.innerWidth を読まないことです。',
    },
    {
      en: 'Avoid polling window.innerWidth inside setInterval.',
      target: 'setInterval 内で window.innerWidth をポーリングする方法は避けるべきです。',
    },
    {
      en: 'This mental model helps you debug responsive issues.',
      target: 'この思考モデルがレスポンシブの問題のデバッグに役立ちます。',
    },
    {
      en: 'The migration is incremental and the gains compound.',
      target: '移行は段階的に進み、効果が積み上がっていきます。',
    },
  ],
  zh: [
    // "ship" sense (a): public release
    {
      en: 'We are shipping the new editor next week.',
      target: '我们下周发布新的编辑器。',
    },
    // "ship" sense (b): engineer how-to checklist
    { en: 'What to ship this week', target: '本周可以尝试的清单' },
    {
      en: 'The most common silent failure mode is X.',
      target: '最常见的 silent failure 模式是 X。',
    },
    {
      en: 'The cleanest defense is to stop reading window.innerWidth for layout decisions.',
      target: '最简洁的解决方法是不再读取 window.innerWidth 来做布局判断。',
    },
    {
      en: 'Avoid polling window.innerWidth inside setInterval.',
      target: '应避免在 setInterval 内对 window.innerWidth 进行轮询。',
    },
    {
      en: 'This mental model helps you debug responsive issues.',
      target: '这种思维模型有助于调试响应式问题。',
    },
    {
      en: 'The migration is incremental and the gains compound.',
      target: '迁移过程是渐进式的,而收益会持续累积。',
    },
  ],
  ru: [
    { en: 'What to ship this week', target: 'Что выпускаем на этой неделе' },
    { en: 'We deploy on Fridays.', target: 'Мы выкатываем релизы по пятницам.' },
  ],
  ar: [
    { en: 'What to ship this week', target: 'ما سيتم إطلاقه هذا الأسبوع' },
    { en: 'We deploy on Fridays.', target: 'ننشر التحديثات أيام الجمعة.' },
  ],
  de: [
    { en: 'What to ship this week', target: 'Was wir diese Woche veröffentlichen' },
    { en: 'We deploy on Fridays.', target: 'Wir deployen freitags.' },
  ],
  fr: [
    { en: 'What to ship this week', target: 'Ce que nous livrons cette semaine' },
    { en: 'We deploy on Fridays.', target: 'Nous déployons le vendredi.' },
  ],
  es: [
    { en: 'What to ship this week', target: 'Qué publicamos esta semana' },
    { en: 'We deploy on Fridays.', target: 'Hacemos deploy los viernes.' },
  ],
  it: [
    { en: 'What to ship this week', target: 'Cosa rilasciamo questa settimana' },
    { en: 'We deploy on Fridays.', target: 'Facciamo il deploy il venerdì.' },
  ],
  pt: [
    { en: 'What to ship this week', target: 'O que publicamos esta semana' },
    { en: 'We deploy on Fridays.', target: 'Fazemos deploy às sextas-feiras.' },
  ],
  nl: [
    { en: 'What to ship this week', target: 'Wat we deze week uitbrengen' },
    { en: 'We deploy on Fridays.', target: 'We deployen op vrijdag.' },
  ],
  sv: [
    { en: 'What to ship this week', target: 'Vad vi släpper den här veckan' },
    { en: 'We deploy on Fridays.', target: 'Vi deployar på fredagar.' },
  ],
  da: [
    { en: 'What to ship this week', target: 'Hvad vi frigiver denne uge' },
    { en: 'We deploy on Fridays.', target: 'Vi deployer om fredagen.' },
  ],
  pl: [
    { en: 'What to ship this week', target: 'Co wydajemy w tym tygodniu' },
    { en: 'We deploy on Fridays.', target: 'Wdrażamy w piątki.' },
  ],
  tr: [
    { en: 'What to ship this week', target: 'Bu hafta neler yayınlıyoruz' },
    { en: 'We deploy on Fridays.', target: 'Cuma günleri deploy ediyoruz.' },
  ],
  hi: [
    { en: 'What to ship this week', target: 'इस सप्ताह क्या रिलीज़ हो रहा है' },
    { en: 'We deploy on Fridays.', target: 'हम शुक्रवार को डिप्लॉय करते हैं।' },
  ],
  th: [
    { en: 'What to ship this week', target: 'แผนเปิดตัวประจำสัปดาห์นี้' },
    { en: 'We deploy on Fridays.', target: 'เรา deploy ทุกวันศุกร์' },
  ],
  id: [
    { en: 'What to ship this week', target: 'Yang akan kami rilis minggu ini' },
    { en: 'We deploy on Fridays.', target: 'Kami melakukan deploy setiap Jumat.' },
  ],
  ms: [
    { en: 'What to ship this week', target: 'Apa yang akan kami lancarkan minggu ini' },
    { en: 'We deploy on Fridays.', target: 'Kami melaksanakan deploy pada hari Jumaat.' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// Render helpers — turn the per-locale data into prompt-ready blocks. Each
// returns `null` when the locale has no entry so the caller can omit the
// section entirely (keeping prompts minimal for locales without overrides).
// ─────────────────────────────────────────────────────────────────────────

export function renderStyleGuide(locale: Locale): string {
  const guide = STYLE_GUIDE[locale]
  const base = UNIVERSAL_TRANSLATION_PRINCIPLE
  return guide
    ? `${base}\n\nStyle guide for the target language:\n${guide}`
    : base
}

export function renderGlossary(locale: Locale): string | null {
  const entries = GLOSSARY[locale]
  if (!entries || entries.length === 0) return null
  const lines = entries.map(({ source, target, note }) =>
    note ? `- "${source}" → ${target}  (${note})` : `- "${source}" → ${target}`,
  )
  return [
    'Glossary — these English source terms are domain-specific software/product vocabulary.',
    'Translate them with the pinned target rendering, NOT their everyday non-software meaning.',
    'Apply to inflected forms too (e.g. "shipping" / "shipped" follow the "ship" rule).',
    lines.join('\n'),
  ].join('\n')
}

export function renderExamples(locale: Locale): string | null {
  const examples = EXAMPLES[locale]
  if (!examples || examples.length === 0) return null
  const blocks = examples.map(
    ({ en, target }) => `EN: ${en}\n→  ${target}`,
  )
  return ['Examples (style + glossary applied together):', blocks.join('\n\n')].join('\n')
}

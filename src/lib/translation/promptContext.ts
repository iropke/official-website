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
// Style guide — one short paragraph per locale. Embedded verbatim under
// "Style guide:" heading in the prompt. Keep under ~3 sentences each.
// ─────────────────────────────────────────────────────────────────────────

export const STYLE_GUIDE: Partial<Record<Locale, string>> = {
  ko: 'Use 합쇼체 (formal polite ~합니다 / ~입니다). Tone: editorial, calm, professional — like a senior engineer writing for peers. Do NOT use 해요체 (~해요), 반말 (~한다), advertising slogans, exclamation marks, or marketing superlatives. For best-practice recommendations (English imperatives like "Avoid X.", "Do Y.", "Prefer Z."), render as recommendation forms (~해야 합니다 / ~하는 것이 좋습니다 / ~을 권장합니다) — NOT plain statements (~합니다). PRESERVE established English SW idioms verbatim (e.g. "silent failure", "race condition", "flaky test", "deadlock", "busy loop") — Korean tech readers expect these terms in English.',
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

export function renderStyleGuide(locale: Locale): string | null {
  const guide = STYLE_GUIDE[locale]
  return guide ? `Style guide for the target language:\n${guide}` : null
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

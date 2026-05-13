import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { WordTablePasteFeature } from '@/lexical/features/wordTablePaste/feature.server'
import { LOCALES, LOCALE_LABELS_NATIVE } from '../i18n/locales'
import { getCategoryBasePath } from '../lib/posts/urls'

const LOCALE_SELECT_OPTIONS = LOCALES.map((code) => ({
  label: `${LOCALE_LABELS_NATIVE[code]} (${code})`,
  value: code,
}))

/**
 * Task #1.6: meta.ogImage 자동 복사 hook.
 *
 * 새 게시물 작성/수정 시 meta.ogImage 가 비어 있으면 thumbnail 값을 자동 복사.
 * 이미 수동으로 ogImage 를 설정한 경우엔 건드리지 않음 (수동 설정 보존).
 */
const autoFillOgImage: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data
  const ogImage = data.meta?.ogImage
  const thumbnail = data.thumbnail
  if (!ogImage && thumbnail) {
    data.meta = { ...(data.meta ?? {}), ogImage: thumbnail }
  }
  return data
}

/**
 * Task #16 (2026-04-20): SEO 메타 자동 오버라이드 hook.
 *
 * 목적:
 *   - 기본: title → meta.metaTitle, excerpt → meta.metaDescription 자동 동기화
 *   - 예외: 사용자가 SEO 필드를 직접 다른 값으로 수정했다면 그 값을 보존
 *
 * 판별 로직 (스키마 변경 없이 originalDoc 비교):
 *   "자동 모드" = metaTitle 이 비어있음 OR 이전 metaTitle === 이전 title
 *   "수동 모드" = 그 외 (사용자가 title 과 다른 값을 직접 입력한 상태)
 *
 *   create 시에는 originalDoc 이 없으므로:
 *     - metaTitle 비어있으면 → title 복사
 *     - metaTitle 채워져 있으면 → 사용자 수동 입력으로 간주, 보존
 *
 * 자동 모드 복귀: meta 필드를 비우고 저장하면 다시 자동 동기화 시작.
 */
const autoFillSeoMeta: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data

  const prev = originalDoc as
    | {
        title?: string
        excerpt?: string
        meta?: { metaTitle?: string; metaDescription?: string }
      }
    | undefined

  const newTitle = typeof data.title === 'string' ? data.title : undefined
  const newMetaTitle =
    typeof data.meta?.metaTitle === 'string' ? (data.meta.metaTitle as string) : undefined
  const newExcerpt = typeof data.excerpt === 'string' ? data.excerpt : undefined
  const newMetaDescription =
    typeof data.meta?.metaDescription === 'string'
      ? (data.meta.metaDescription as string)
      : undefined

  // ── metaTitle 자동 동기화 ─────────────────────────────────
  const metaTitleIsEmpty = !newMetaTitle?.trim()
  const metaTitleWasInAutoMode =
    prev !== undefined &&
    prev.meta?.metaTitle !== undefined &&
    prev.meta.metaTitle === prev.title
  if ((metaTitleIsEmpty || metaTitleWasInAutoMode) && newTitle) {
    data.meta = { ...(data.meta ?? {}), metaTitle: newTitle }
  }

  // ── metaDescription 자동 동기화 ───────────────────────────
  const metaDescIsEmpty = !newMetaDescription?.trim()
  const metaDescWasInAutoMode =
    prev !== undefined &&
    prev.meta?.metaDescription !== undefined &&
    prev.meta.metaDescription === prev.excerpt
  if ((metaDescIsEmpty || metaDescWasInAutoMode) && newExcerpt) {
    data.meta = { ...(data.meta ?? {}), metaDescription: newExcerpt }
  }

  return data
}

/**
 * Task #14 follow-up (revised 2026-04-20): publishedDate 자동 채움.
 *
 * 배경:
 *   Payload 3.82.1 은 `_status` 를 beforeChange 훅 호출 **이후** 에 내부적으로
 *   할당한다. 따라서 beforeChange 시점의 `data._status` 는 `'published'` 가
 *   아니며, 이전 구현(`data._status === 'published'` 체크)은 항상 false 였다.
 *   Post #6 에서 publishedDate 가 null 로 남은 근본 원인.
 *
 * 수정:
 *   발행 여부는 요청의 `?draft=` 쿼리 파라미터로 판별한다.
 *     - `draft=true`  → 초안 저장 (publishedDate 건드리지 않음)
 *     - 그 외         → 실제 publish (빈 publishedDate 를 현재 시각으로 채움)
 *
 *   수동 입력값이 이미 있으면 그대로 보존. 목록 정렬이 `-publishedDate` 이므로
 *   null 방지가 목적.
 */
const autoFillPublishedDate: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!data) return data

  const draftParam = (req as { query?: { draft?: unknown } } | undefined)?.query?.draft
  const isDraftSave = draftParam === 'true' || draftParam === true

  if (!isDraftSave && !data.publishedDate) {
    data.publishedDate = new Date().toISOString()
  }
  return data
}

/**
 * 안전망: 이미 publish 된 문서인데 publishedDate 가 비어있으면 afterChange 에서
 * 한 번 더 백필. beforeChange 가 어떤 이유로 누락됐을 때(예: 관리자 UI 가
 * draft 쿼리 없이 PATCH 하되 publishedDate 를 명시적으로 빈 문자열로 전송하는 등)
 * 를 대비한다. 재귀 루프 방지는 context 플래그로 처리.
 */
const backfillPublishedDate: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  if (operation === 'create' || operation === 'update') {
    if (context?.skipBackfillPublishedDate) return doc
    if (doc?._status === 'published' && !doc?.publishedDate) {
      try {
        await req.payload.update({
          collection: 'posts',
          id: doc.id,
          data: { publishedDate: new Date().toISOString() },
          context: { skipBackfillPublishedDate: true },
          overrideAccess: true,
        })
      } catch (err) {
        req.payload.logger?.error?.(
          { err },
          'backfillPublishedDate: failed to backfill publishedDate',
        )
      }
    }
  }
  return doc
}

/**
 * Task #1.8 (revised): collection-level livePreview → admin.preview 전환.
 *
 * Payload 3.82.1 은 `admin.livePreview.url` 함수를 클라이언트 config 로 직렬화
 * 하지 못해 (JSON serialize 불가) Live Preview 탭이 렌더되지 않는다. 대신
 * `admin.preview` 는 서버 사이드에서만 호출되므로 함수를 그대로 쓸 수 있고,
 * 편집 화면 우상단에 "Preview" 버튼이 추가되어 새 탭에서 프리뷰가 열린다.
 * root-level admin.livePreview 는 Edit 탭 회귀 이력이 있어 절대 건드리지 말 것.
 */
const resolveServerURL = (): string => {
  // Vercel preview/development 배포는 자기 자신의 deployment URL 우선.
  // (그렇지 않으면 NEXT_PUBLIC_SERVER_URL=production 이라 PREVIEW 버튼이
  //  production 으로 향해 feature branch 의 코드가 적용되지 않은 곳에서 검증됨)
  // VERCEL_BRANCH_URL 은 per-branch 고정 alias 라서 deployment 별
  // VERCEL_URL 보다 안정적 → BRANCH_URL → URL 순으로 fallback.
  const isPreviewEnv =
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development'
  if (isPreviewEnv) {
    const branchURL = process.env.VERCEL_BRANCH_URL
    if (branchURL) return `https://${branchURL}`
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  }
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', '_status', 'updatedAt'],
    group: '콘텐츠',
    preview: (doc, { locale }) => {
      // v2 (2026-04-26): 영문 단일 파이프라인 정책. locale 미지정 시 'en' 기본.
      // ?preview=true 쿼리 + payload-token 쿠키가 모두 있어야 page.tsx 가 draft 모드로 응답.
      // 카테고리별 라우트 (insight → /insight, story → /story, portfolio → /portfolio,
      // solution → /solution, service → /service) 로 분기. URL 은 모두 단수 (2026-05-11).
      const baseUrl = resolveServerURL()
      const localeCode = typeof locale === 'string' && locale ? locale : 'en'
      const d = doc as { slug?: string; category?: string } | undefined
      const slug = d?.slug ?? ''
      if (!slug) return null
      const categoryPath = getCategoryBasePath(d?.category)
      return `${baseUrl}/${localeCode}${categoryPath}/${slug}?preview=true`
    },
  },
  access: {
    // 공개 읽기 허용 (프론트에서 published 필터는 쿼리 단에서 적용)
    read: () => true,
    // Payload 3.82.1 은 access 블록에 read 만 정의하면 create/update/delete 가
    // 인증 기본값으로 fallback 되지 않고 거부된다. 로그인 유저에게 명시적 허용.
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    // Task #1.6, Task #16 (SEO 자동), Task #14 follow-up (revised)
    beforeChange: [autoFillOgImage, autoFillSeoMeta, autoFillPublishedDate],
    // 안전망: publish 된 문서의 publishedDate 가 비어있으면 백필
    afterChange: [backfillPublishedDate],
  },
  fields: [
    // ─── 기본 정보 ─────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      label: '제목',
      localized: true,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: '요약 (Excerpt)',
      localized: true,
      admin: {
        description: '목록 페이지 카드에 표시되는 짧은 설명 (2~3문장)',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload' as const,
      label: '썸네일 이미지',
      relationTo: 'media',
      admin: {
        description: '목록 카드 썸네일 이미지 (540×398 권장)',
      },
    },

    // ─── 본문 ──────────────────────────────────────────────────
    {
      name: 'content',
      type: 'richText',
      label: '본문',
      localized: true,
      /**
       * Task #2 Phase 2 (2026-04-20): 커스텀 BlocksFeature 5종 추가.
       *   - editorialTable / qnaList / codeBlock / rawHtml / videoEmbed
       *   - 부모 richText 가 localized:true 이므로 block 내부 필드에는
       *     localized 를 별도 지정하지 않음 (locale 별 JSON 이 자동 분리됨).
       *   - 실제 렌더는 PostDetail.tsx 의 renderBlockNode switch 에서
       *     Phase 3 에 추가 예정. 현재는 기본 fallback(<p> flatten)으로 동작.
       */
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          // Phase A 1b 디버깅 (2026-04-29):
          //   Word/Excel 표 클립보드(text/html) 를 editorialTable 블록으로 자동 변환.
          //   src/lexical/features/wordTablePaste/Plugin.tsx 의 PASTE_COMMAND 핸들러가
          //   `<table>` 감지 시 INSERT_BLOCK_COMMAND 디스패치.
          WordTablePasteFeature(),
          BlocksFeature({
            blocks: [
              // ─── 표 (editorialTable) ───
              {
                slug: 'editorialTable',
                labels: { singular: 'Editorial 표', plural: 'Editorial 표' },
                fields: [
                  {
                    name: 'caption',
                    type: 'text',
                    label: '접근성 캡션 (aria-label)',
                    admin: {
                      description: '스크린리더용 설명 (선택). 예: "솔루션 비교 표"',
                    },
                  },
                  {
                    name: 'headers',
                    type: 'array',
                    label: '열 헤더',
                    minRows: 1,
                    labels: { singular: '헤더', plural: '헤더' },
                    admin: {
                      description: '표의 첫 행에 표시될 열 헤더들 (순서대로)',
                    },
                    fields: [
                      {
                        name: 'text',
                        type: 'text',
                        label: '헤더 텍스트',
                        required: true,
                      },
                    ],
                  },
                  {
                    name: 'rows',
                    type: 'array',
                    label: '행',
                    minRows: 1,
                    labels: { singular: '행', plural: '행' },
                    admin: {
                      description: '각 행은 헤더 개수만큼의 셀을 가져야 합니다',
                    },
                    fields: [
                      {
                        name: 'cells',
                        type: 'array',
                        label: '셀',
                        minRows: 1,
                        labels: { singular: '셀', plural: '셀' },
                        fields: [
                          {
                            name: 'text',
                            type: 'textarea',
                            label: '셀 내용',
                            required: true,
                            admin: { rows: 2 },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              // ─── Q&A 리스트 (qnaList) ───
              {
                slug: 'qnaList',
                labels: { singular: 'Q&A 리스트', plural: 'Q&A 리스트' },
                fields: [
                  {
                    name: 'items',
                    type: 'array',
                    label: '항목',
                    minRows: 1,
                    labels: { singular: '항목', plural: '항목' },
                    admin: {
                      description: '질문/답변 쌍을 자유롭게 구성 (Q → A → Q → A 순서 권장)',
                    },
                    fields: [
                      {
                        name: 'role',
                        type: 'select',
                        label: '역할',
                        required: true,
                        defaultValue: 'question',
                        options: [
                          { label: '질문 (Question)', value: 'question' },
                          { label: '답변 (Answer)', value: 'answer' },
                        ],
                      },
                      {
                        name: 'text',
                        type: 'textarea',
                        label: '내용',
                        required: true,
                        admin: { rows: 3 },
                      },
                    ],
                  },
                ],
              },

              // ─── 코드 블록 (codeBlock) ───
              {
                slug: 'codeBlock',
                labels: { singular: '코드 블록', plural: '코드 블록' },
                fields: [
                  {
                    name: 'language',
                    type: 'text',
                    label: '언어 라벨',
                    admin: {
                      description:
                        '예: HTML, TypeScript, Bash. 블록 상단에 표시됩니다 (구문 강조는 적용되지 않음)',
                    },
                  },
                  {
                    name: 'code',
                    type: 'textarea',
                    label: '코드',
                    required: true,
                    admin: { rows: 10 },
                  },
                ],
              },

              // ─── Raw HTML (rawHtml) ───
              {
                slug: 'rawHtml',
                labels: { singular: 'Raw HTML', plural: 'Raw HTML' },
                fields: [
                  {
                    name: 'label',
                    type: 'text',
                    label: '라벨',
                    admin: {
                      description: '블록 상단에 표시되는 라벨 (선택). 예: "Raw HTML Example"',
                    },
                  },
                  {
                    name: 'html',
                    type: 'textarea',
                    label: 'HTML 소스',
                    required: true,
                    admin: {
                      rows: 10,
                      description:
                        '⚠ 신뢰된 HTML만 입력하세요. 프론트엔드에서 그대로 삽입됩니다 (XSS 주의)',
                    },
                  },
                ],
              },

              // ─── 동영상 임베드 (videoEmbed) ───
              {
                slug: 'videoEmbed',
                labels: { singular: '동영상 임베드', plural: '동영상 임베드' },
                fields: [
                  {
                    name: 'url',
                    type: 'text',
                    label: 'YouTube URL',
                    required: true,
                    admin: {
                      description:
                        '공유 URL 형식: https://youtu.be/xxxxx 또는 https://www.youtube.com/watch?v=xxxxx — 프론트에서 youtube-nocookie embed 로 자동 변환됩니다',
                    },
                  },
                  {
                    name: 'caption',
                    type: 'textarea',
                    label: '캡션',
                    admin: {
                      rows: 2,
                      description: '영상 아래에 표시되는 설명 (선택)',
                    },
                  },
                ],
              },

              // ─── 이미지 + 캡션 (editorialMedia) ───
              // Phase A 1b 단계 4 (2026-04-27): editor_requirements_v2.md §4-1 표 매핑.
              //   - image:    upload (Media collection 참조). 필수.
              //   - caption:  textarea (rows: 2). 비어있으면 figcaption 미렌더.
              //   - alt:      text. 비어있으면 Media 의 기본 alt 사용.
              //   - alignment: select (full/center/wide). 기본값 center.
              // 렌더는 Phase 3 (PostDetail.tsx renderBlockNode) 에서 별도 추가.
              {
                slug: 'editorialMedia',
                labels: { singular: '이미지 + 캡션', plural: '이미지 + 캡션' },
                fields: [
                  {
                    name: 'image',
                    type: 'upload' as const,
                    label: '이미지',
                    relationTo: 'media',
                    required: true,
                    admin: {
                      description: '본문에 삽입할 이미지 (Cloudinary 업로드)',
                    },
                  },
                  {
                    name: 'caption',
                    type: 'textarea',
                    label: '캡션',
                    admin: {
                      rows: 2,
                      description: '이미지 하단 설명 (선택). 비어있으면 figcaption 미렌더.',
                    },
                  },
                  {
                    name: 'alt',
                    type: 'text',
                    label: '대체 텍스트 (alt)',
                    admin: {
                      description:
                        '접근성용 이미지 설명 (선택). 비어있으면 Media 의 기본 alt 가 사용됩니다.',
                    },
                  },
                  {
                    name: 'alignment',
                    type: 'select',
                    label: '본문 폭 배치',
                    defaultValue: 'center',
                    options: [
                      { label: '본문 폭 (center)', value: 'center' },
                      { label: '확장 폭 (wide)', value: 'wide' },
                      { label: '전체 폭 (full)', value: 'full' },
                    ],
                    admin: {
                      description:
                        '본문 폭 대비 이미지 배치. center=본문 폭, wide=좌우 약간 확장, full=화면 전체 폭.',
                    },
                  },
                ],
              },

              // ─── 가격 카드 (pricingCards) ───
              // Solution / Service 카테고리 (제품 페이지) 의 가격 정보를 markdown 표 대신
              // 카드 그리드로 렌더. 2-4 등급 카드, mobile 세로 stack.
              // 본문 내 다른 곳에서도 사용 가능 (Insight 의 비교 글 등).
              // v1 정책 (2026-05-13 사용자 결정):
              //   - CTA per tier omit (schema 에 ctaLabel/ctaUrl 보존, v1 렌더 X)
              //   - highlight=true 한 등급 border 강조 + optional badge
              //   - features 는 ✓ 체크 아이콘 + 텍스트
              //   - mobile (<=1079px) 세로 stack
              //   - plain white card + subtle border (글래스 모피즘 톤 X)
              {
                slug: 'pricingCards',
                labels: { singular: '가격 카드', plural: '가격 카드' },
                fields: [
                  {
                    name: 'heading',
                    type: 'text',
                    label: '섹션 제목 (선택)',
                    admin: {
                      description: '예: "Pricing", "Plans". 비어 있으면 미렌더.',
                    },
                  },
                  {
                    name: 'intro',
                    type: 'textarea',
                    label: '섹션 소개 (선택)',
                    admin: {
                      rows: 2,
                      description: '카드 그리드 위에 표시되는 한 단락.',
                    },
                  },
                  {
                    name: 'tiers',
                    type: 'array',
                    label: '가격 등급',
                    minRows: 2,
                    maxRows: 4,
                    labels: { singular: 'Tier', plural: 'Tiers' },
                    admin: {
                      description: '2-4개 등급 카드. 데스크탑 가로 그리드, 모바일 세로 stack.',
                    },
                    fields: [
                      {
                        name: 'name',
                        type: 'text',
                        label: '등급 이름',
                        required: true,
                        admin: {
                          description: '예: Basic / Pro / Business / Enterprise',
                        },
                      },
                      {
                        name: 'price',
                        type: 'text',
                        label: '가격',
                        required: true,
                        admin: {
                          description: '예: "$203.88", "Custom". 통화 / 단위 그대로 표기.',
                        },
                      },
                      {
                        name: 'period',
                        type: 'text',
                        label: '기간 (선택)',
                        admin: {
                          description: '예: "/year", "/month". 비어 있으면 가격 옆에 미표시.',
                        },
                      },
                      {
                        name: 'description',
                        type: 'textarea',
                        label: '한 줄 설명 (선택)',
                        admin: {
                          rows: 2,
                          description: '등급 이름 아래 짧은 설명.',
                        },
                      },
                      {
                        name: 'features',
                        type: 'array',
                        label: '포함 기능',
                        minRows: 1,
                        labels: { singular: '기능', plural: '기능' },
                        fields: [
                          {
                            name: 'text',
                            type: 'text',
                            label: '기능 텍스트',
                            required: true,
                          },
                        ],
                      },
                      {
                        name: 'highlight',
                        type: 'checkbox',
                        label: '시각 강조 (highlight)',
                        defaultValue: false,
                        admin: {
                          description:
                            '한 등급을 시각적으로 강조 (border + badge). 클러스터 안에서 1개만 권장.',
                        },
                      },
                      {
                        name: 'badge',
                        type: 'text',
                        label: '배지 라벨 (선택)',
                        admin: {
                          description:
                            'highlight=true 일 때 카드 상단에 표시되는 짧은 문구. 예: "Most Popular", "Recommended".',
                        },
                      },
                      {
                        name: 'ctaLabel',
                        type: 'text',
                        label: 'CTA 라벨 (v1 미사용)',
                        admin: {
                          description:
                            'v1 에서는 렌더되지 않습니다. v2 확장용 schema 보존.',
                        },
                      },
                      {
                        name: 'ctaUrl',
                        type: 'text',
                        label: 'CTA URL (v1 미사용)',
                        admin: {
                          description: 'v1 에서는 렌더되지 않습니다.',
                        },
                      },
                    ],
                  },
                ],
              },

              // ─── 기능 카드 그리드 (featureCards) ───
              // "What you get" / "How it works" 같은 3-col (또는 2/4) 카드 grid.
              // 본문 wall-of-text 해소 + 제품 페이지의 정보 hierarchy 향상.
              // narrow body + breakout 패턴 안에서 wide 폭으로 렌더 (Solution / Service 컨텍스트).
              {
                slug: 'featureCards',
                labels: { singular: '기능 카드', plural: '기능 카드' },
                fields: [
                  {
                    name: 'heading',
                    type: 'text',
                    label: '섹션 제목 (선택)',
                    admin: {
                      description: '예: "What you get", "How it works". 비어 있으면 미렌더.',
                    },
                  },
                  {
                    name: 'intro',
                    type: 'textarea',
                    label: '섹션 소개 (선택)',
                    admin: { rows: 2 },
                  },
                  {
                    name: 'columns',
                    type: 'select',
                    label: '데스크탑 열 수',
                    defaultValue: '3',
                    options: [
                      { label: '2 columns', value: '2' },
                      { label: '3 columns', value: '3' },
                      { label: '4 columns', value: '4' },
                    ],
                    admin: {
                      description: '모바일 (<=1079px) 에서는 세로 stack.',
                    },
                  },
                  {
                    name: 'cards',
                    type: 'array',
                    label: '카드',
                    minRows: 2,
                    maxRows: 8,
                    labels: { singular: 'Card', plural: 'Cards' },
                    fields: [
                      {
                        name: 'title',
                        type: 'text',
                        label: '제목',
                        required: true,
                      },
                      {
                        name: 'description',
                        type: 'textarea',
                        label: '설명',
                        required: true,
                        admin: { rows: 3 },
                      },
                      {
                        name: 'label',
                        type: 'text',
                        label: '라벨/번호 (선택)',
                        admin: {
                          description:
                            '카드 좌상단 작은 라벨. 예: "01", "Step 1", "→". 비어 있으면 미표시.',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ],
      }),
    },

    // ─── 참고 문서 (references) ─────────────────────────────────
    // 본문 하단에 ul 로 노출. 제목/내용/링크 중 하나 이상 입력 시 항목 표시.
    // localized:true — locale 별로 번역된 참고 자료 목록을 가질 수 있음 (자동 번역
    // walker 가 Phase B-1 에서 array 필드를 순회하도록 보강 예정).
    {
      name: 'references',
      type: 'array',
      label: '참고 문서',
      localized: true,
      labels: { singular: '참고 문서', plural: '참고 문서' },
      admin: {
        description:
          '본문 하단에 ul 로 노출됩니다. 제목 / 내용 / 링크 중 하나 이상 입력해야 저장됩니다. 링크가 있으면 새 창으로 열립니다.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '제목',
        },
        {
          name: 'content',
          type: 'textarea',
          label: '내용',
          admin: { rows: 2 },
        },
        {
          name: 'link',
          type: 'text',
          label: '링크 (URL)',
          admin: {
            description: '입력 시 새 창(rel=noopener noreferrer)으로 열립니다.',
          },
        },
      ],
      validate: (rows) => {
        if (!Array.isArray(rows)) return true
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i] as
            | { title?: string | null; content?: string | null; link?: string | null }
            | undefined
          const hasAny = Boolean(
            row?.title?.trim() || row?.content?.trim() || row?.link?.trim(),
          )
          if (!hasAny) {
            return `${i + 1}번째 참고 문서: 제목 / 내용 / 링크 중 하나 이상은 입력해주세요.`
          }
        }
        return true
      },
    },

    // ─── 분류 및 태그 ──────────────────────────────────────────
    {
      name: 'tags',
      type: 'relationship',
      label: '태그',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: '게시물에 연결할 태그 선택 (복수 선택 가능)',
      },
    },

    // ─── 발행 설정 ────────────────────────────────────────────
    {
      name: 'publishedDate',
      type: 'date',
      label: '발행일',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    // Task #14: 커스텀 status 필드 제거. Payload 내장 `_status` (versions.drafts
     // 활성화 시 자동 생성) + 우상단 "Publish changes" 버튼으로 발행 상태를
     // 일원화. 필터는 `payload.find` 가 `draft: false` 기본값으로 _status=published
     // 만 반환하므로 쿼리 측 status 조건도 제거됨. "archived" 상태는 필요 시
     // 별도 `isArchived: checkbox` 필드로 향후 추가.

    // ─── 분류 (카테고리) ──────────────────────────────────────
    // category: 'insight' | 'story' | 'portfolio' | 'solution' | 'service'. 라우트 분기
    //   (/insight · /story · /portfolio · /solution · /service — 모두 단수, 2026-05-11)
    //   + sitemap + 관련 글 query 의 기준.
    //   content-generation 의 meta.json 에서 import 시 그대로 바인딩됨.
    //   모든 운영 글은 이 다섯 중 하나에 속함. defaultValue 'insight' 라
    //   기존 데이터 / 미지정 import 는 자동으로 'insight' 로 분류.
    // 비-localized — 카테고리 분류는 콘텐츠 언어와 무관한 글 자체의 속성.
    {
      name: 'category',
      type: 'select',
      label: '카테고리',
      required: true,
      defaultValue: 'insight',
      options: [
        { label: 'Insight (인사이트)', value: 'insight' },
        { label: 'Story (스토리)', value: 'story' },
        { label: 'Portfolio (포트폴리오)', value: 'portfolio' },
        { label: 'Solution (솔루션)', value: 'solution' },
        { label: 'Service (서비스)', value: 'service' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'insight = 인사이트 / story = 회사 소식 / portfolio = 프로젝트 사례 / solution = 자체 솔루션 (Corpis 등) / service = 업무 영역. 라우트와 sitemap 분기 기준입니다.',
      },
    },

    {
      name: 'publishedLocales',
      type: 'select',
      label: '공개 언어',
      hasMany: true,
      options: LOCALE_SELECT_OPTIONS,
      admin: {
        position: 'sidebar',
        description: '이 게시물을 공개할 언어를 선택하세요. 미선택 언어는 목록에서 숨겨집니다.',
      },
    },

    // ─── 클러스터 (관련 포스트 노출 단위) ────────────────────────
    // cluster: slug 형태의 식별자 (예: privacy-compliance). 같은 cluster 값을 가진
    //   포스트끼리 상세 페이지 우측 "관련 글" 영역에 묶여 노출됨.
    //   클러스터 정의 / 신규 cluster slug 추가는 content-generation 리포의
    //   `briefs/_topic-clusters.md` 가 단일 진실 공급원.
    // clusterRole: 'pillar' | 'spoke'. PILLAR 1건 + spokes N건 구조에서 PILLAR 를
    //   관련 글 목록 상단에 우선 정렬하기 위한 분류. 옵션 (legacy 글은 비워둠).
    // 둘 다 비-localized — 클러스터 식별은 콘텐츠 언어와 무관하게 글 자체의 속성.
    {
      name: 'cluster',
      type: 'text',
      label: '클러스터 slug',
      admin: {
        position: 'sidebar',
        description:
          '같은 cluster 값을 가진 포스트끼리 상세 페이지 "관련 글" 에 묶여 노출됩니다. slug 형식 (영문 소문자/숫자/하이픈). 예: privacy-compliance. 클러스터 정의는 briefs/_topic-clusters.md 참조.',
      },
    },
    {
      name: 'clusterRole',
      type: 'select',
      label: '클러스터 역할',
      options: [
        { label: 'PILLAR (대표 글)', value: 'pillar' },
        { label: 'SPOKE (세부 글)', value: 'spoke' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'PILLAR 는 관련 글 목록 상단에 우선 정렬됩니다. cluster 가 비어있으면 의미 없음.',
      },
    },

    // ─── 번역 상태 ────────────────────────────────────────────
    {
      name: 'translationStatus',
      type: 'json',
      label: '번역 상태',
      admin: {
        position: 'sidebar',
        description: '각 언어별 번역 완료 상태 (자동 관리)',
      },
    },

    // ─── SEO 메타 ─────────────────────────────────────────────
    {
      name: 'meta',
      type: 'group',
      label: 'SEO 메타데이터',
      admin: {
        description:
          '비워두면 본문 제목/요약이 자동으로 SEO 정보에 사용됩니다. 직접 입력한 값은 보존되며, 이후 본문 제목/요약이 바뀌어도 덮어쓰지 않습니다. 자동 모드로 돌아가려면 해당 필드를 비우고 저장하세요.',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: '메타 제목',
          localized: true,
          admin: {
            description: '비워두면 본문 제목이 자동으로 사용됩니다.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: '메타 설명',
          localized: true,
          admin: {
            description: '비워두면 요약(Excerpt)이 자동으로 사용됩니다.',
          },
        },
        {
          name: 'ogImage',
          type: 'upload' as const,
          label: 'OG 이미지',
          relationTo: 'media',
          admin: {
            description: '비워두면 썸네일 이미지가 자동으로 사용됩니다.',
          },
        },
      ],
    },

    // ─── 슬러그 ──────────────────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: '영문 소문자, 숫자, 하이픈만 사용 (예: ai-search-strategy)',
      },
    },

    // ─── 번역 액션 (UI only — 데이터 저장 없음) ─────────────────
    // slug 박스 바로 하위에 "Translate" 버튼이 배치되어, source locale 기준
    // 으로 선택한 target locale 들로 일괄 번역을 트리거합니다 (Phase B-1 ②).
    // 백엔드: /api/translate · 컴포넌트: src/components/admin/TranslateButton.
    {
      name: 'translateAction',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/admin/TranslateButton/index#default',
        },
      },
    },
  ],
}

import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

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
const resolveServerURL = (): string =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', '_status', 'updatedAt'],
    group: '콘텐츠',
    preview: (doc, { locale }) => {
      const baseUrl = resolveServerURL()
      const localeCode = typeof locale === 'string' && locale ? locale : 'ko'
      const slug = (doc as { slug?: string } | undefined)?.slug ?? ''
      if (!slug) return null
      return `${baseUrl}/${localeCode}/insights/${slug}`
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
      editor: lexicalEditor(),
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
    {
      name: 'publishedLocales',
      type: 'select',
      label: '공개 언어',
      hasMany: true,
      options: [
        { label: '한국어 (ko)', value: 'ko' },
        { label: 'English (en)', value: 'en' },
        { label: 'Español (es)', value: 'es' },
        { label: 'Русский (ru)', value: 'ru' },
        { label: 'Deutsch (de)', value: 'de' },
        { label: 'Français (fr)', value: 'fr' },
        { label: '中文 (zh)', value: 'zh' },
        { label: 'العربية (ar)', value: 'ar' },
      ],
      admin: {
        position: 'sidebar',
        description: '이 게시물을 공개할 언어를 선택하세요. 미선택 언어는 목록에서 숨겨집니다.',
      },
    },

    // ─── AI 기능 관련 ─────────────────────────────────────────
    {
      name: 'aiGenerated',
      type: 'checkbox',
      label: 'AI 생성 콘텐츠',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'AI가 초안을 생성한 경우 체크',
      },
    },
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
  ],
}

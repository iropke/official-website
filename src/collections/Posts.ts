import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
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
 * Task #1.8: collection-level livePreview 복구.
 *
 * root-level admin.livePreview 는 Payload 3.82.1 에서 Edit 탭 회귀(접근 금지
 * 아이콘 표시)를 유발했으므로 절대 건드리지 말 것. 여기 collection-level 만
 * 유지한다. serverURL 은 NEXT_PUBLIC_SERVER_URL → VERCEL_URL → localhost 순.
 */
const resolveServerURL = (): string =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'status', 'updatedAt'],
    group: '콘텐츠',
    livePreview: {
      url: ({ data, locale }) => {
        const baseUrl = resolveServerURL()
        const localeCode =
          typeof locale === 'string'
            ? locale
            : ((locale as { code?: string } | undefined)?.code ?? 'ko')
        const slug = (data as { slug?: string } | undefined)?.slug ?? ''
        return `${baseUrl}/${localeCode}/insights/${slug}`
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    // Task #1.6
    beforeChange: [autoFillOgImage],
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
    {
      name: 'status',
      type: 'select',
      label: '상태',
      defaultValue: 'draft',
      options: [
        { label: '초안 (Draft)', value: 'draft' },
        { label: '발행됨 (Published)', value: 'published' },
        { label: '보관됨 (Archived)', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
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
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: '메타 제목',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: '메타 설명',
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload' as const,
          label: 'OG 이미지',
          relationTo: 'media',
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

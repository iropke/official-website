import type { Block, CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// ─── 재사용 가능한 콘텐츠 블록 정의 ──────────────────────────────

const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero 블록', plural: 'Hero 블록' },
  fields: [
    { name: 'headline', type: 'text', label: '헤드라인', localized: true, required: true },
    { name: 'subCopy', type: 'textarea', label: '서브카피', localized: true },
    { name: 'ctaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true },
    { name: 'ctaUrl', type: 'text', label: 'CTA 링크 URL' },
    { name: 'backgroundImage', type: 'upload' as const, label: '배경 이미지', relationTo: 'media' },
  ],
}

const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: '콘텐츠 블록', plural: '콘텐츠 블록' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: '본문',
      localized: true,
      editor: lexicalEditor(),
    },
  ],
}

const CardGridBlock: Block = {
  slug: 'cardGrid',
  labels: { singular: '카드 그리드 블록', plural: '카드 그리드 블록' },
  fields: [
    { name: 'title', type: 'text', label: '섹션 제목', localized: true },
    {
      name: 'cards',
      type: 'array',
      label: '카드 목록',
      fields: [
        { name: 'icon', type: 'text', label: '아이콘 (SVG 이름 또는 이모지)' },
        { name: 'title', type: 'text', label: '카드 제목', localized: true, required: true },
        { name: 'description', type: 'textarea', label: '카드 설명', localized: true },
        { name: 'link', type: 'text', label: '링크 URL' },
      ],
    },
  ],
}

const CTABannerBlock: Block = {
  slug: 'ctaBanner',
  labels: { singular: 'CTA 배너 블록', plural: 'CTA 배너 블록' },
  fields: [
    { name: 'message', type: 'text', label: '메시지', localized: true, required: true },
    { name: 'ctaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true },
    { name: 'ctaUrl', type: 'text', label: 'CTA 링크 URL' },
    { name: 'backgroundGradient', type: 'text', label: '배경 그라데이션 CSS' },
  ],
}

// ─── Pages Collection ─────────────────────────────────────────────

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: '페이지',
  },
  access: {
    // 공개 읽기 허용
    read: () => true,
    // Payload 3.82.1: access 에 read 만 정의하면 나머지 규칙이 기본 인증으로
    // fallback 되지 않고 거부되므로 로그인 유저에게 명시적 허용.
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    readVersions: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ─── 기본 정보 ──────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      label: '페이지 제목',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: '예: about, solution/corpis, privacy-policy',
      },
    },

    // ─── 레이아웃 블록 (Layout Builder) ────────────────────
    {
      name: 'layout',
      type: 'blocks',
      label: '페이지 레이아웃',
      blocks: [HeroBlock, ContentBlock, CardGridBlock, CTABannerBlock],
    },

    // ─── 발행 설정 ──────────────────────────────────────────
    // Task #14: 커스텀 status 필드 제거. Payload 내장 `_status` + "Publish
    // changes" 버튼으로 발행 관리를 일원화.
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
      },
    },

    // ─── SEO 메타 ────────────────────────────────────────────
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
        {
          name: 'noIndex',
          type: 'checkbox',
          label: '검색 엔진 색인 제외 (noindex)',
          defaultValue: false,
        },
      ],
    },
  ],
}

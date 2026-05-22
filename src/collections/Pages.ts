import type { Block, CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { LOCALES, LOCALE_LABELS_NATIVE } from '../i18n/locales'
import { resolveServerURL } from '../lib/serverURL'

const LOCALE_SELECT_OPTIONS = LOCALES.map((code) => ({
  label: `${LOCALE_LABELS_NATIVE[code]} (${code})`,
  value: code,
}))

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

// 글 목록 블록 — Posts 컬렉션의 글을 cluster / tag / category 기준으로 묶어
// 최신순 노출. 서비스 허브 페이지 하단의 "관련 글" 영역 등에 사용.
// 렌더는 <PageBlocks> (src/components/pages/PageBlocks) 가 담당하며, 이 블록을
// 만나면 서버에서 payload.find 로 Posts 를 조회한다.
const PostListBlock: Block = {
  slug: 'postList',
  labels: { singular: '글 목록 블록', plural: '글 목록 블록' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: '섹션 제목',
      localized: true,
      admin: { description: '예: "Related Articles". 비어 있으면 제목 미렌더.' },
    },
    {
      name: 'filterField',
      type: 'select',
      label: '묶음 기준',
      required: true,
      defaultValue: 'cluster',
      options: [
        { label: '클러스터 (cluster)', value: 'cluster' },
        { label: '태그 (tag)', value: 'tag' },
        { label: '카테고리 (category)', value: 'category' },
      ],
      admin: { description: '어떤 기준으로 Post 를 묶어 노출할지 선택.' },
    },
    {
      name: 'filterValue',
      type: 'text',
      label: '기준 값',
      required: true,
      admin: {
        description:
          'cluster / category 는 slug 문자열 (예: web-development). tag 는 태그 slug.',
      },
    },
    {
      name: 'sort',
      type: 'select',
      label: '정렬',
      defaultValue: '-publishedDate',
      options: [
        { label: '최신순', value: '-publishedDate' },
        { label: '오래된순', value: 'publishedDate' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      label: '노출 개수',
      defaultValue: 6,
      min: 1,
      max: 24,
    },
    {
      name: 'emptyText',
      type: 'text',
      label: '글이 없을 때 문구 (선택)',
      localized: true,
      admin: {
        description: '비어 있으면 글이 0건일 때 섹션 자체가 숨겨집니다.',
      },
    },
  ],
}

// ─── Pages Collection ─────────────────────────────────────────────

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: '페이지',
    // Posts 와 동일 패턴: 편집 화면 우상단 "Preview" 버튼 (서버 사이드 함수).
    // Pages 의 프론트 URL = /<locale>/<slug> (예: slug 'service/web-development'
    // → /en/service/web-development). slug 선행 슬래시는 방어적으로 제거.
    // ?preview=true 쿼리 + payload-token 쿠키가 모두 있어야 라우트가 draft
    // 모드로 응답 (대상 라우트에 preview 분기 구현 필요 — 현재 web-development).
    preview: (doc, { locale }) => {
      const baseUrl = resolveServerURL()
      const localeCode = typeof locale === 'string' && locale ? locale : 'en'
      const d = doc as { slug?: string } | undefined
      const slug = (d?.slug ?? '').replace(/^\/+/, '')
      if (!slug) return null
      return `${baseUrl}/${localeCode}/${slug}?preview=true`
    },
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
      blocks: [HeroBlock, ContentBlock, CardGridBlock, CTABannerBlock, PostListBlock],
    },

    // ─── 발행 설정 ──────────────────────────────────────────
    // Task #14: 커스텀 status 필드 제거. Payload 내장 `_status` + "Publish
    // changes" 버튼으로 발행 관리를 일원화.
    {
      name: 'publishedLocales',
      type: 'select',
      label: '공개 언어',
      hasMany: true,
      options: LOCALE_SELECT_OPTIONS,
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

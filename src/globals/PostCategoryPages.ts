import type { GlobalConfig } from 'payload'

/**
 * 게시판(Posts) 카테고리별 목록 페이지의 메타 정보.
 *
 * 목록 라우트(`/[locale]/insight` 등)는 CMS 문서가 아니라 카테고리로 Posts 를
 * 쿼리하는 라우트라, 페이지 자체의 SEO 설명을 담을 곳이 없었다. 이 글로벌이
 * 카테고리별 `metaDescription`(+ 선택 `metaTitle` / `ogImage`)을 보관한다.
 *
 * 프론트는 `src/lib/posts/categoryMeta.ts` 의 `getPostCategoryMeta(locale)` 로
 * 읽어 `buildPostListMetadata` 에서 사용한다. 값이 비면 기본 라벨/사이트 기본값
 * 으로 graceful 폴백 (admin 미입력 시에도 페이지는 정상 동작).
 *
 * 카테고리 옵션은 `src/lib/posts/urls.ts` 의 POST_CATEGORIES 와 1:1 — 새 카테고리
 * 추가 시 아래 options 에도 한 줄 추가할 것 (단수 slug 정책 §5).
 */
export const PostCategoryPages: GlobalConfig = {
  slug: 'post-category-pages',
  label: '게시판 카테고리 페이지',
  admin: {
    group: '설정',
    description:
      '각 게시판(Insights / Stories / Portfolio / Solutions / Services / Origin) 목록 페이지의 메타 설명을 카테고리별로 설정합니다. 카테고리당 한 줄씩 추가하세요.',
  },
  access: {
    read: () => true,
    // SiteSettings 와 동일: read 만 정의 시 update 가 자동 폴백되지 않으므로 명시.
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'categories',
      type: 'array',
      label: '카테고리별 메타',
      labels: { singular: '카테고리', plural: '카테고리' },
      admin: {
        description:
          '카테고리당 한 줄. 설명을 비우면 사이트 기본 설명으로 폴백합니다.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'category',
          type: 'select',
          label: '카테고리',
          required: true,
          options: [
            { label: 'Insights (/insight)', value: 'insight' },
            { label: 'Stories (/story)', value: 'story' },
            { label: 'Portfolio (/portfolio)', value: 'portfolio' },
            { label: 'Solutions (/solution)', value: 'solution' },
            { label: 'Services (/service)', value: 'service' },
            { label: 'Origin (/origin)', value: 'origin' },
          ],
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: '목록 페이지 설명 (메타)',
          localized: true,
          admin: {
            rows: 3,
            description:
              '검색결과/소셜 카드에 노출되는 설명. 비우면 사이트 기본 설명 사용.',
          },
        },
        {
          name: 'metaTitle',
          type: 'text',
          label: '목록 페이지 제목 (선택)',
          localized: true,
          admin: {
            description:
              '비우면 기본 라벨(Insights / Stories …)을 사용. 입력 시 " | Iropke" 가 자동으로 덧붙습니다.',
          },
        },
        {
          name: 'ogImage',
          type: 'upload' as const,
          label: 'OG 이미지 (선택)',
          relationTo: 'media',
          admin: {
            description: '비우면 사이트 기본 OG 이미지를 사용.',
          },
        },
      ],
    },
  ],
}

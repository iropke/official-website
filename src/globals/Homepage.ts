import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: '메인 페이지',
  admin: {
    group: '페이지',
    description: '메인 페이지 각 섹션의 콘텐츠를 관리합니다',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '① Hero',
          fields: [
            { name: 'heroHeadline', type: 'text', label: '헤드라인 (고정 선언문)', localized: true, defaultValue: 'We build operating systems for digital business.', required: true },
            { name: 'heroSubCopy', type: 'textarea', label: '서브카피', localized: true },
            {
              name: 'heroCta', type: 'array', label: 'CTA 버튼', maxRows: 2,
              fields: [
                { name: 'label', type: 'text', label: '버튼 텍스트', localized: true, required: true },
                { name: 'url', type: 'text', label: '링크 URL', required: true },
                { name: 'variant', type: 'select', label: '스타일', options: [{ label: 'Primary (강조)', value: 'primary' }, { label: 'Secondary (보조)', value: 'secondary' }], defaultValue: 'primary' },
              ],
            },
          ],
        },
        {
          label: '② Sub Carousel',
          fields: [
            {
              name: 'carouselSlides', type: 'array', label: '슬라이드 목록 (3~5개)', minRows: 3, maxRows: 5,
              fields: [
                { name: 'title', type: 'text', label: '슬라이드 제목', localized: true, required: true },
                { name: 'description', type: 'textarea', label: '설명', localized: true },
                { name: 'ctaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true },
                { name: 'ctaUrl', type: 'text', label: 'CTA 링크 URL' },
                { name: 'backgroundType', type: 'select', label: '배경 유형', options: [{ label: '그라데이션', value: 'gradient' }, { label: '이미지', value: 'image' }], defaultValue: 'gradient' },
                { name: 'gradient', type: 'text', label: '배경 그라데이션 CSS', admin: { condition: (data, siblingData) => siblingData?.backgroundType === 'gradient' } },
                { name: 'backgroundImage', type: 'upload' as const, label: '배경 이미지', relationTo: 'media', admin: { condition: (data, siblingData) => siblingData?.backgroundType === 'image' } },
              ],
            },
          ],
        },
        {
          label: '③ AI OS Grid',
          fields: [
            { name: 'gridSectionTitle', type: 'text', label: '섹션 제목', localized: true, defaultValue: 'IROPKE OS™' },
            {
              name: 'gridCards', type: 'array', label: '솔루션 카드 (4개)', maxRows: 4,
              fields: [
                { name: 'name', type: 'text', label: '솔루션명 (예: NOVA™)', required: true },
                { name: 'tagline', type: 'text', label: '한 줄 설명', localized: true, required: true },
                { name: 'description', type: 'textarea', label: '상세 설명', localized: true },
                { name: 'link', type: 'text', label: '상세 페이지 링크' },
                { name: 'gradient', type: 'text', label: '카드 배경 그라데이션' },
                { name: 'icon', type: 'upload' as const, label: '아이콘 (SVG)', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: '④ Core Message',
          fields: [
            { name: 'coreMessage', type: 'text', label: '핵심 메시지', localized: true, defaultValue: "IROPKE doesn't build websites. It builds the system behind them.", required: true },
            { name: 'coreMessageSubtext', type: 'textarea', label: '부가 설명', localized: true },
          ],
        },
        {
          label: '⑤ Insights',
          fields: [
            { name: 'insightsSectionTitle', type: 'text', label: '섹션 제목', localized: true, defaultValue: 'Latest Insights' },
            { name: 'insightsCount', type: 'number', label: '표시할 게시물 수', defaultValue: 4, min: 2, max: 8, admin: { description: '최신 게시물 중 표시할 개수 (2~8)' } },
            { name: 'insightsCtaLabel', type: 'text', label: '"View All" 버튼 텍스트', localized: true, defaultValue: 'View All Insights' },
            { name: 'insightsCtaUrl', type: 'text', label: '"View All" 링크', defaultValue: '/insights' },
          ],
        },
        {
          label: '⑥ CTA Banner',
          fields: [
            { name: 'ctaBannerMessage', type: 'text', label: '배너 메시지', localized: true, defaultValue: 'If your problem is bigger than a website, we should talk.', required: true },
            { name: 'ctaBannerCtaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true, defaultValue: 'Start a Project' },
            { name: 'ctaBannerCtaUrl', type: 'text', label: 'CTA 링크 URL', defaultValue: '/project-inquiry' },
            { name: 'ctaBannerGradient', type: 'text', label: '배경 그라데이션', admin: { description: '예: linear-gradient(135deg, #5EB6B2 0%, #15716D 100%)' } },
          ],
        },
      ],
    },
  ],
}
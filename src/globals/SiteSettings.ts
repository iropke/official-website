import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 전역 설정',
  admin: {
    group: '설정',
    description: '사이트 이름, 로고, 소셜 링크, 언어 설정 등 전역 값을 관리합니다',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '기본 설정',
          fields: [
            { name: 'siteName', type: 'text', label: '사이트명', defaultValue: 'Iropke', required: true },
            { name: 'siteDescription', type: 'textarea', label: '사이트 기본 설명 (메타)', localized: true },
            { name: 'logo', type: 'upload' as const, label: '로고 이미지 (밝은 배경용)', relationTo: 'media' },
            { name: 'logoDark', type: 'upload' as const, label: '로고 이미지 (어두운 배경용)', relationTo: 'media' },
            { name: 'favicon', type: 'upload' as const, label: '파비콘', relationTo: 'media' },
          ],
        },
        {
          label: '푸터',
          fields: [
            { name: 'footerCopyright', type: 'text', label: '저작권 문구', defaultValue: '© Iropke All Rights Reserved.', localized: true },
            { name: 'footerPolicyLink', type: 'text', label: 'Privacy Policy 링크', defaultValue: '/privacy-policy' },
            {
              name: 'socialLinks', type: 'array', label: '소셜 미디어 링크',
              fields: [
                { name: 'platform', type: 'select', label: '플랫폼', options: [{ label: 'LinkedIn', value: 'linkedin' }, { label: 'Instagram', value: 'instagram' }, { label: 'YouTube', value: 'youtube' }, { label: 'X (Twitter)', value: 'twitter' }, { label: 'Facebook', value: 'facebook' }], required: true },
                { name: 'url', type: 'text', label: 'URL', required: true },
                { name: 'isVisible', type: 'checkbox', label: '노출', defaultValue: true },
              ],
            },
          ],
        },
        {
          label: '언어',
          fields: [
            { name: 'defaultLocale', type: 'select', label: '기본 언어', defaultValue: 'ko', options: [{ label: '한국어 (ko)', value: 'ko' }, { label: 'English (en)', value: 'en' }, { label: 'Español (es)', value: 'es' }, { label: 'Русский (ru)', value: 'ru' }, { label: 'Deutsch (de)', value: 'de' }, { label: 'Français (fr)', value: 'fr' }, { label: '中文 (zh)', value: 'zh' }, { label: 'العربية (ar)', value: 'ar' }] },
            { name: 'enabledLocales', type: 'select', label: '활성화된 언어', hasMany: true, defaultValue: ['ko', 'en'], options: [{ label: '한국어 (ko)', value: 'ko' }, { label: 'English (en)', value: 'en' }, { label: 'Español (es)', value: 'es' }, { label: 'Русский (ru)', value: 'ru' }, { label: 'Deutsch (de)', value: 'de' }, { label: 'Français (fr)', value: 'fr' }, { label: '中文 (zh)', value: 'zh' }, { label: 'العربية (ar)', value: 'ar' }] },
            { name: 'rtlLocales', type: 'select', label: 'RTL 언어 (우→좌)', hasMany: true, defaultValue: ['ar'], options: [{ label: 'العربية (ar)', value: 'ar' }], admin: { description: '아랍어 등 우→좌 방향 언어. HTML dir="rtl" 자동 적용' } },
          ],
        },
        {
          label: 'AI / 연동',
          fields: [
            { name: 'aiApiProvider', type: 'select', label: 'AI API 프로바이더', defaultValue: 'claude', options: [{ label: 'Anthropic Claude (Haiku)', value: 'claude' }, { label: 'OpenAI', value: 'openai' }], admin: { description: '콘텐츠 생성 및 다국어 번역에 사용할 AI 서비스' } },
            { name: 'contactEmail', type: 'email', label: '문의 수신 이메일', defaultValue: 'hello@iropke.com', admin: { description: '프로젝트 문의 알림 수신 주소' } },
            { name: 'noReplyEmail', type: 'email', label: '발신 이메일 (no-reply)', defaultValue: 'noreply@iropke.com' },
            { name: 'recaptchaSiteKey', type: 'text', label: 'reCAPTCHA v3 Site Key', admin: { description: '프론트엔드에 노출되는 공개 키 (환경변수 권장)' } },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'ogImage', type: 'upload' as const, label: '기본 OG 이미지', relationTo: 'media', admin: { description: '페이지별 OG 이미지가 없을 때 사용하는 기본값' } },
            { name: 'googleAnalyticsId', type: 'text', label: 'Google Analytics ID (GA4)', admin: { description: '예: G-XXXXXXXXXX' } },
            { name: 'googleSearchConsoleVerification', type: 'text', label: 'Google Search Console 인증 코드' },
          ],
        },
      ],
    },
  ],
}
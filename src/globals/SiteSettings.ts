import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 전역 설정',
  admin: {
    group: '설정',
    description: '사이트 이름, 로고, 소셜 링크 등 전역 값을 관리합니다',
  },
  access: {
    read: () => true,
    // Payload 3.82.1: read 만 정의하면 update 가 자동 인증 기본값으로
    // fallback 되지 않으므로 로그인 유저에게 명시적 허용.
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // ─── 기본 정보 ─────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        // ── 탭 1: 기본 설정 ──
        {
          label: '기본 설정',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: '사이트명',
              defaultValue: 'Iropke',
              required: true,
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              label: '사이트 기본 설명 (메타)',
              localized: true,
            },
            {
              name: 'logo',
              type: 'upload' as const,
              label: '로고 이미지 (밝은 배경용)',
              relationTo: 'media',
            },
            {
              name: 'logoDark',
              type: 'upload' as const,
              label: '로고 이미지 (어두운 배경용)',
              relationTo: 'media',
            },
            {
              name: 'favicon',
              type: 'upload' as const,
              label: '파비콘',
              relationTo: 'media',
            },
          ],
        },

        // ── 탭 2: 푸터 설정 ──
        {
          label: '푸터',
          fields: [
            {
              name: 'footerCopyright',
              type: 'text',
              label: '저작권 문구',
              defaultValue: '© Iropke All Rights Reserved.',
              localized: true,
            },
            {
              name: 'footerPolicyLink',
              type: 'text',
              label: 'Privacy Policy 링크',
              defaultValue: '/privacy-policy',
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: '소셜 미디어 링크',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  label: '플랫폼',
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'X (Twitter)', value: 'twitter' },
                    { label: 'Facebook', value: 'facebook' },
                  ],
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'URL',
                  required: true,
                },
                {
                  name: 'isVisible',
                  type: 'checkbox',
                  label: '노출',
                  defaultValue: true,
                },
              ],
            },
          ],
        },

        // ── 탭 3: SEO ──
        {
          label: 'SEO',
          fields: [
            {
              name: 'ogImage',
              type: 'upload' as const,
              label: '기본 OG 이미지',
              relationTo: 'media',
              admin: {
                description: '페이지별 OG 이미지가 없을 때 사용하는 기본값',
              },
            },
            // googleAnalyticsId 필드는 2026-04-20 제거됨.
            // GA4 추적은 Vercel env `NEXT_PUBLIC_GA_ID` + `@next/third-parties`
            // 의 <GoogleAnalytics /> 로 일원화 (src/app/(frontend)/layout.tsx).
            //
            // googleSearchConsoleVerification 필드도 2026-04-20 제거됨.
            // GSC 인증은 DNS TXT 레코드 방식.
            //
            // 언어 설정(defaultLocale/enabledLocales/rtlLocales)은
            // 2026-05-17 제거됨. locale 은 src/i18n/locales.ts 코드 단일
            // 소스가 진실 원천 (CLAUDE.md §4, 함정 F4/F10). admin 필드와
            // 공존 시 진실 원천이 둘로 갈라져 혼란의 원인이 되었다.
            //
            // AI/연동 설정(aiApiProvider/contactEmail/noReplyEmail/
            // recaptchaSiteKey)도 2026-05-17 제거됨. AI 키·메일·reCAPTCHA
            // 는 모두 Vercel env 변수로 관리 (Resend / reCAPTCHA 정책).
            // admin 필드는 어떤 코드에서도 읽히지 않는 dead field 였다.
          ],
        },
      ],
    },
  ],
}

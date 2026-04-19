import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const localeOptions = [
  { label: '한국어 (ko)', value: 'ko' },
    { label: 'English (en)', value: 'en' },
      { label: 'Español (es)', value: 'es' },
        { label: 'Русский (ru)', value: 'ru' },
          { label: 'Deutsch (de)', value: 'de' },
            { label: 'Français (fr)', value: 'fr' },
              { label: '中文 (zh)', value: 'zh' },
                { label: 'العربية (ar)', value: 'ar' },
                ]

                const HeroBlock = {
                  slug: 'hero',
                    labels: { singular: 'Hero 블록', plural: 'Hero 블록' },
                      fields: [
                          { name: 'headline', type: 'text', label: '헤드라인', localized: true, required: true },
                              { name: 'subCopy', type: 'textarea', label: '서브카피', localized: true },
                                  { name: 'ctaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true },
                                      { name: 'ctaUrl', type: 'text', label: 'CTA 링크 URL' },
                                          { name: 'backgroundImage', type: 'upload', label: '배경 이미지', relationTo: 'media' },
                                            ],
                                            }

                                            const ContentBlock = {
                                              slug: 'content',
                                                labels: { singular: '콘텐츠 블록', plural: '콘텐츠 블록' },
                                                  fields: [
                                                      { name: 'content', type: 'richText', label: '본문', localized: true, editor: lexicalEditor() },
                                                        ],
                                                        }

                                                        const CardGridBlock = {
                                                          slug: 'cardGrid',
                                                            labels: { singular: '카드 그리드 블록', plural: '카드 그리드 블록' },
                                                              fields: [
                                                                  { name: 'title', type: 'text', label: '섹션 제목', localized: true },
                                                                      {
                                                                            name: 'cards',
                                                                                  type: 'array',
                                                                                        label: '카드 목록',
                                                                                              fields: [
                                                                                                      { name: 'icon', type: 'text', label: '아이콘' },
                                                                                                              { name: 'title', type: 'text', label: '카드 제목', localized: true, required: true },
                                                                                                                      { name: 'description', type: 'textarea', label: '카드 설명', localized: true },
                                                                                                                              { name: 'link', type: 'text', label: '링크 URL' },
                                                                                                                                    ],
                                                                                                                                        },
                                                                                                                                          ],
                                                                                                                                          }

                                                                                                                                          const CTABannerBlock = {
                                                                                                                                            slug: 'ctaBanner',
                                                                                                                                              labels: { singular: 'CTA 배너 블록', plural: 'CTA 배너 블록' },
                                                                                                                                                fields: [
                                                                                                                                                    { name: 'message', type: 'text', label: '메시지', localized: true, required: true },
                                                                                                                                                        { name: 'ctaLabel', type: 'text', label: 'CTA 버튼 텍스트', localized: true },
                                                                                                                                                            { name: 'ctaUrl', type: 'text', label: 'CTA 링크 URL' },
                                                                                                                                                              ],
                                                                                                                                                              }

                                                                                                                                                              export const Pages: CollectionConfig = {
                                                                                                                                                                slug: 'pages',
                                                                                                                                                                  admin: {
                                                                                                                                                                      useAsTitle: 'title',
                                                                                                                                                                          defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
                                                                                                                                                                              group: '페이지',
                                                                                                                                                                                },
                                                                                                                                                                                  access: { read: () => true },
                                                                                                                                                                                    versions: { drafts: true },
                                                                                                                                                                                      fields: [
                                                                                                                                                                                          { name: 'title', type: 'text', label: '페이지 제목', localized: true, required: true },
                                                                                                                                                                                              {
                                                                                                                                                                                                    name: 'slug',
                                                                                                                                                                                                          type: 'text',
                                                                                                                                                                                                                label: 'Slug (URL)',
                                                                                                                                                                                                                      required: true,
                                                                                                                                                                                                                            unique: true,
                                                                                                                                                                                                                                  admin: { position: 'sidebar' },
                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                          { name: 'layout', type: 'blocks', label: '페이지 레이아웃', blocks: [HeroBlock, ContentBlock, CardGridBlock, CTABannerBlock] },
                                                                                                                                                                                                                                              {
                                                                                                                                                                                                                                                    name: 'status',
                                                                                                                                                                                                                                                          type: 'select',
                                                                                                                                                                                                                                                                label: '상태',
                                                                                                                                                                                                                                                                      defaultValue: 'draft',
                                                                                                                                                                                                                                                                            options: [
                                                                                                                                                                                                                                                                                    { label: '초안 (Draft)', value: 'draft' },
                                                                                                                                                                                                                                                                                            { label: '발행됨 (Published)', value: 'published' },
                                                                                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                                                                                        admin: { position: 'sidebar' },
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                { name: 'publishedLocales', type: 'select', label: '공개 언어', hasMany: true, options: localeOptions, admin: { position: 'sidebar' } },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                          name: 'meta',
                                                                                                                                                                                                                                                                                                                                type: 'group',
                                                                                                                                                                                                                                                                                                                                      label: 'SEO 메타데이터',
                                                                                                                                                                                                                                                                                                                                            fields: [
                                                                                                                                                                                                                                                                                                                                                    { name: 'metaTitle', type: 'text', label: '메타 제목', localized: true },
                                                                                                                                                                                                                                                                                                                                                            { name: 'metaDescription', type: 'textarea', label: '메타 설명', localized: true },
                                                                                                                                                                                                                                                                                                                                                                    { name: 'ogImage', type: 'upload', label: 'OG 이미지', relationTo: 'media' },
                                                                                                                                                                                                                                                                                                                                                                            { name: 'noIndex', type: 'checkbox', label: '검색 엔진 색인 제외', defaultValue: false },
                                                                                                                                                                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                                                                                                                                                        ],
                                                                                                                                                                                                                                                                                                                                                                                        }
import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
    label: '내비게이션 메뉴',
      admin: {
          group: '설정',
            },
              access: { read: () => true },
                fields: [
                    {
                          name: 'items',
                                type: 'array',
                                      label: '대메뉴 항목',
                                            fields: [
                                                    { name: 'label', type: 'text', label: '대메뉴명', localized: true, required: true },
                                                            { name: 'link', type: 'text', label: '링크 URL' },
                                                                    { name: 'isVisible', type: 'checkbox', label: '메뉴 노출', defaultValue: true },
                                                                            {
                                                                                      name: 'children',
                                                                                                type: 'array',
                                                                                                          label: '소메뉴 항목 (카드)',
                                                                                                                    fields: [
                                                                                                                                { name: 'label', type: 'text', label: '소메뉴명', localized: true, required: true },
                                                                                                                                            { name: 'description', type: 'text', label: '카드 설명', localized: true },
                                                                                                                                                        { name: 'link', type: 'text', label: '링크 URL', required: true },
                                                                                                                                                                    {
                                                                                                                                                                                  name: 'linkType',
                                                                                                                                                                                                type: 'select',
                                                                                                                                                                                                              label: '링크 유형',
                                                                                                                                                                                                                            defaultValue: 'internal',
                                                                                                                                                                                                                                          options: [
                                                                                                                                                                                                                                                          { label: '내부 페이지', value: 'internal' },
                                                                                                                                                                                                                                                                          { label: '외부 URL', value: 'external' },
                                                                                                                                                                                                                                                                                        ],
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                { name: 'gradient', type: 'text', label: '카드 배경 그라데이션' },
                                                                                                                                                                                                                                                                                                                            { name: 'media', type: 'upload', label: '카드 배경 이미지', relationTo: 'media' },
                                                                                                                                                                                                                                                                                                                                        { name: 'badge', type: 'text', label: '배지 텍스트' },
                                                                                                                                                                                                                                                                                                                                                    { name: 'isVisible', type: 'checkbox', label: '소메뉴 노출', defaultValue: true },
                                                                                                                                                                                                                                                                                                                                                              ],
                                                                                                                                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                                                                                                                                            ],
                                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                                                                                                                                                                  }
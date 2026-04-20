import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: '내비게이션 메뉴',
  admin: {
    group: '설정',
    description: '헤더 메가메뉴 구조를 관리합니다 (2-depth)',
  },
  access: {
    read: () => true,
    // Payload 3.82.1: read 만 정의하면 update 가 자동 인증 기본값으로
    // fallback 되지 않으므로 로그인 유저에게 명시적 허용.
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: '대메뉴 항목',
      admin: {
        description: '드래그로 순서를 변경할 수 있습니다',
      },
      fields: [
        // ─── 대메뉴 ──────────────────────────────────────────
        {
          name: 'label',
          type: 'text',
          label: '대메뉴명',
          localized: true,
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          label: '링크 URL',
          admin: {
            description: '소메뉴 없이 직접 링크하는 경우에만 입력',
          },
        },
        {
          name: 'isVisible',
          type: 'checkbox',
          label: '메뉴 노출',
          defaultValue: true,
        },

        // ─── 소메뉴 (카드형 메가메뉴) ─────────────────────────
        {
          name: 'children',
          type: 'array',
          label: '소메뉴 항목 (카드)',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: '소메뉴명',
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              label: '카드 설명',
              localized: true,
              admin: {
                description: '메가메뉴 카드에 표시되는 짧은 설명',
              },
            },
            {
              name: 'link',
              type: 'text',
              label: '링크 URL',
              required: true,
            },
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
            {
              name: 'gradient',
              type: 'text',
              label: '카드 배경 그라데이션',
              admin: {
                description: 'CSS gradient 값 (예: linear-gradient(135deg, #5EB6B2, #22908B))',
              },
            },
            {
              name: 'media',
              type: 'upload' as const,
              label: '카드 배경 이미지',
              relationTo: 'media',
              admin: {
                description: '그라데이션 대신 이미지 사용 시 업로드',
              },
            },
            {
              name: 'badge',
              type: 'text',
              label: '배지 텍스트',
              admin: {
                description: '카드 우측 상단에 표시 (예: NEW, TM)',
              },
            },
            {
              name: 'isVisible',
              type: 'checkbox',
              label: '소메뉴 노출',
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
}

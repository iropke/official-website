import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // 공개 읽기 허용 (프론트 이미지 로드)
    read: () => true,
    // Payload 3.82.1: read 만 정의 시 나머지 규칙이 기본 인증으로 fallback 되지
    // 않아 업로드/수정이 거부됨. 로그인 유저 명시적 허용.
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}

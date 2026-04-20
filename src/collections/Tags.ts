import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: '콘텐츠',
  },
  access: {
    read: () => true,
    // Payload 3.82.1: read 만 정의 시 나머지 규칙이 fallback 되지 않음.
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '태그명',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: '영문 소문자, 숫자, 하이픈만 사용 (예: ai-strategy)',
      },
    },
  ],
}

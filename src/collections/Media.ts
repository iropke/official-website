import type { CollectionAfterReadHook, CollectionConfig } from 'payload'

/**
 * Cloudinary URL 우선 사용 (2026-05-09):
 *
 * 기본 `url` 필드는 `${serverURL}/api/media/file/${filename}` 형태인데, Vercel
 * preview deployment 는 deployment protection (401) 으로 보호되어 Next/Image
 * 의 server-side 프록시가 upstream fetch 시 인증되지 않아 broken image 가
 * 반환된다. payload-cloudinary 가 이미 `cloudinary.secure_url` 에 공개 CDN URL
 * 을 저장하고 있으므로 `url` 을 그것으로 덮어써서 모든 환경에서 직접 CDN 에서
 * 이미지가 로드되도록 한다.
 */
const preferCloudinaryURL: CollectionAfterReadHook = ({ doc }) => {
  if (doc && typeof doc === 'object') {
    const secureUrl = (doc as { cloudinary?: { secure_url?: unknown } }).cloudinary?.secure_url
    if (typeof secureUrl === 'string' && secureUrl.length > 0) {
      ;(doc as { url?: string }).url = secureUrl
    }
  }
  return doc
}

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
  hooks: {
    afterRead: [preferCloudinaryURL],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      // drag & drop drawer 에서 alt 입력 기회 없이 즉시 저장할 수 있도록
      // required 해제. 목록/상세 렌더 시 alt 가 비어있으면 filename fallback.
      required: false,
      admin: {
        description: '접근성 / SEO 용 대체 텍스트 (선택 입력)',
      },
    },
  ],
  upload: true,
}

import type { CollectionAfterReadHook, CollectionConfig } from 'payload'

/**
 * Phase A 1b 디버깅 (2026-04-29):
 *   `payload-cloudinary 2.3.0` 는 업로드를 Cloudinary 로 라우팅하지만
 *   `media.url` 필드는 Payload 의 로컬 파일 핸들러 URL (`/api/media/file/<filename>`)
 *   로 그대로 두는 동작이다. Vercel serverless 파일시스템에는 실제 파일이
 *   없으므로 이 URL 은 404 를 반환하고, 프론트엔드의 `<Image src={media.url}>`
 *   가 깨진 상태로 노출된다.
 *
 *   Cloudinary 업로드 자체는 정상이며, 그 결과는 `media.cloudinary.secure_url`
 *   (그리고 `media.thumbnailURL`) 에 저장된다. 이 hook 은 read 시점에
 *   `data.url` 을 Cloudinary URL 로 덮어써서 모든 소비자(프론트 list/detail,
 *   Lexical Upload 노드, editorialMedia 블록 등) 가 깨지지 않은 URL 을 받게 한다.
 *
 *   read-only 방식이므로 기존 DB row 도 즉시 정상 동작하며, 별도 마이그레이션이
 *   필요 없다.
 */
const overwriteUrlWithCloudinary: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc
  const cloudinaryUrl =
    (doc as { cloudinary?: { secure_url?: string } }).cloudinary?.secure_url ||
    (doc as { thumbnailURL?: string }).thumbnailURL
  if (cloudinaryUrl) {
    ;(doc as { url?: string }).url = cloudinaryUrl
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
    afterRead: [overwriteUrlWithCloudinary],
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

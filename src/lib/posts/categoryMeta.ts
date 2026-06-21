import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'
import type { Locale } from '@/i18n/locales'
import type { PostCategory } from './urls'

/**
 * `post-category-pages` 글로벌을 카테고리별 맵으로 정규화해 반환한다.
 *
 * 목록 페이지(`buildPostListMetadata`)가 카테고리별 metaDescription / metaTitle /
 * ogImage 를 읽는 단일 진입점. 글로벌이 비었거나 조회 실패해도 빈 맵을 반환해
 * 페이지가 기본 라벨/사이트 기본값으로 graceful 폴백하도록 한다.
 *
 * React `cache()` 로 감싸 동일 렌더 내 중복 조회를 dedupe (getSiteSettings 와 동일 패턴).
 */

export interface CategoryMeta {
  metaTitle?: string
  metaDescription?: string
  ogImageUrl?: string
}

function mediaUrl(value: Media | number | null | undefined): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value.cloudinary?.secure_url ?? value.url ?? undefined
}

export const getPostCategoryMeta = cache(
  async (locale: Locale): Promise<Partial<Record<PostCategory, CategoryMeta>>> => {
    try {
      const payload = await getPayload({ config })
      const global = await payload.findGlobal({
        slug: 'post-category-pages',
        locale,
        depth: 1, // ogImage Media populate
      })

      const out: Partial<Record<PostCategory, CategoryMeta>> = {}
      for (const row of global.categories ?? []) {
        if (!row.category) continue
        // 같은 카테고리가 중복 입력되면 첫 행만 채택 (admin 실수 방어).
        if (out[row.category as PostCategory]) continue
        out[row.category as PostCategory] = {
          metaTitle: row.metaTitle?.trim() || undefined,
          metaDescription: row.metaDescription?.trim() || undefined,
          ogImageUrl: mediaUrl(row.ogImage),
        }
      }
      return out
    } catch (err) {
      console.error('[getPostCategoryMeta] failed:', err)
      return {}
    }
  },
)

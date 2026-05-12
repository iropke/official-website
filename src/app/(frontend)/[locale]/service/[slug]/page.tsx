import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Post, Tag } from '@/payload-types'
import { isLocale, LOCALE_INTL_TAG, type Locale } from '@/i18n/locales'
import { buildAlternates } from '@/i18n/alternates'

import PostDetail, {
  type PostDetailData,
  type ReferenceData,
  type TagData,
} from '@/components/posts/PostDetail/PostDetail'

const CATEGORY = 'service' as const
const CATEGORY_PATH = '/service'

function normalizeLocale(raw: string): Locale {
  return isLocale(raw) ? raw : 'en'
}

function formatDate(dateString: string | null | undefined, locale: Locale): { label: string; iso: string } {
  if (!dateString) return { label: '', iso: '' }
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return { label: '', iso: '' }
    const label = new Intl.DateTimeFormat(LOCALE_INTL_TAG[locale], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
    return { label, iso: d.toISOString().slice(0, 10) }
  } catch {
    return { label: '', iso: '' }
  }
}

function resolveMedia(
  ref: (number | null) | Media | undefined,
  fallbackAlt: string,
): { url: string; alt: string } {
  if (ref && typeof ref === 'object' && 'url' in ref) {
    return {
      url: ref.url ?? '',
      alt: ref.alt ?? fallbackAlt,
    }
  }
  return { url: '', alt: fallbackAlt }
}

function resolveTags(
  refs: Post['tags'],
  basePath: string,
): TagData[] {
  if (!Array.isArray(refs)) return []
  return refs
    .filter((t): t is Tag => typeof t === 'object' && t !== null)
    .map((t) => ({
      label: t.name ?? '',
      href: `${basePath}?tag=${encodeURIComponent(t.slug ?? '')}`,
    }))
    .filter((t) => t.label.length > 0)
}

function resolveReferences(rows: Post['references']): ReferenceData[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => ({
      title: typeof row?.title === 'string' ? row.title.trim() : '',
      content: typeof row?.content === 'string' ? row.content.trim() : '',
      link: typeof row?.link === 'string' ? row.link.trim() : '',
    }))
    .filter((r) => r.title || r.content || r.link)
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams?: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const locale = normalizeLocale(rawLocale)
  return {
    alternates: buildAlternates(locale, `${CATEGORY_PATH}/${slug}`),
  }
}

export default async function ServiceDetailPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug } = await params
  const locale = normalizeLocale(rawLocale)
  const search = (await searchParams) ?? {}

  const basePath = `/${locale}${CATEGORY_PATH}`

  const payload = await getPayload({ config })

  const headersList = await nextHeaders()
  let isPreviewUser = false
  if (search.preview === 'true') {
    try {
      const authResult = await payload.auth({ headers: headersList })
      isPreviewUser = Boolean(authResult.user)
    } catch (err) {
      console.error('[ServiceDetailPage] Preview auth check failed:', err)
    }
  }

  let post: Post | undefined
  try {
    const result = await payload.find({
      collection: 'posts',
      locale,
      depth: 2,
      limit: 1,
      draft: isPreviewUser,
      where: isPreviewUser
        ? {
            and: [
              { slug: { equals: slug } },
              { category: { equals: CATEGORY } },
            ],
          }
        : {
            and: [
              { slug: { equals: slug } },
              { publishedLocales: { contains: locale } },
              { category: { equals: CATEGORY } },
            ],
          },
    })
    post = result.docs[0] as Post | undefined
  } catch (err) {
    console.error('[ServiceDetailPage] Failed to load post:', err)
  }

  if (!post) {
    notFound()
  }

  // Service 카테고리는 업무 영역 entry 라 우측 관련글 sidebar 없이 full-width 로 렌더.
  // PostDetail 에 hideAside={true} 로 전달하여 본문이 12-col 전체를 사용. relatedPosts 쿼리도 skip.
  const heroThumb = resolveMedia(post.thumbnail, post.title ?? '')
  const postData: PostDetailData = {
    title: post.title ?? '',
    intro: post.excerpt ?? '',
    heroImageUrl: heroThumb.url,
    heroImageAlt: heroThumb.alt,
    content: post.content ?? null,
    tags: resolveTags(post.tags, basePath),
    references: resolveReferences(post.references),
  }

  return (
    <PostDetail
      basePath={basePath}
      locale={locale}
      post={postData}
      relatedPosts={[]}
      hideAside
    />
  )
}

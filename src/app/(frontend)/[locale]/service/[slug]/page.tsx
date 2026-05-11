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
  type RelatedPostData,
  type TagData,
} from '@/components/posts/PostDetail/PostDetail'

const RELATED_POSTS_LIMIT = 5
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

function toRelatedData(post: Post, locale: Locale): RelatedPostData {
  const { label, iso } = formatDate(post.publishedDate, locale)
  const thumb = resolveMedia(post.thumbnail, post.title ?? '')
  return {
    slug: post.slug ?? String(post.id),
    title: post.title ?? '',
    date: label,
    dateISO: iso,
    thumbnailUrl: thumb.url,
    thumbnailAlt: thumb.alt,
  }
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

  const postCluster = typeof post.cluster === 'string' ? post.cluster.trim() : ''
  let relatedDocs: Post[] = []
  try {
    if (postCluster) {
      const relatedResult = await payload.find({
        collection: 'posts',
        locale,
        depth: 1,
        limit: RELATED_POSTS_LIMIT * 2,
        sort: '-publishedDate',
        where: {
          and: [
            { publishedLocales: { contains: locale } },
            { slug: { not_equals: slug } },
            { cluster: { equals: postCluster } },
            { category: { equals: CATEGORY } },
          ],
        },
      })
      const docs = relatedResult.docs as Post[]
      const pillars = docs.filter((d) => d.clusterRole === 'pillar')
      const others = docs.filter((d) => d.clusterRole !== 'pillar')
      relatedDocs = [...pillars, ...others].slice(0, RELATED_POSTS_LIMIT)
    } else {
      const relatedResult = await payload.find({
        collection: 'posts',
        locale,
        depth: 1,
        limit: RELATED_POSTS_LIMIT,
        sort: '-publishedDate',
        where: {
          and: [
            { publishedLocales: { contains: locale } },
            { slug: { not_equals: slug } },
            { category: { equals: CATEGORY } },
          ],
        },
      })
      relatedDocs = relatedResult.docs as Post[]
    }
  } catch (err) {
    console.error('[ServiceDetailPage] Failed to load related posts:', err)
  }

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
  const relatedPosts: RelatedPostData[] = relatedDocs.map((p) => toRelatedData(p, locale))

  return (
    <PostDetail
      basePath={basePath}
      locale={locale}
      post={postData}
      relatedPosts={relatedPosts}
    />
  )
}

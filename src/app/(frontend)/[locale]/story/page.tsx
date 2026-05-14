import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post, Media } from '@/payload-types'
import { isLocale, LOCALE_INTL_TAG, type Locale } from '@/i18n/locales'
import { buildAlternates } from '@/i18n/alternates'

import PostList, { type PostCardData } from '@/components/posts/PostList/PostList'

const POSTS_PER_PAGE = 10
const CATEGORY = 'story' as const
const CATEGORY_PATH = '/story'

function normalizeLocale(raw: string): Locale {
  return isLocale(raw) ? raw : 'en'
}

function formatDate(dateString: string | null | undefined, locale: Locale): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(LOCALE_INTL_TAG[locale], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}

function toCardData(post: Post, locale: Locale): PostCardData {
  const thumb = post.thumbnail as Media | number | null | undefined
  const thumbnailUrl =
    typeof thumb === 'object' && thumb && thumb.url ? thumb.url : ''
  const thumbnailAlt =
    typeof thumb === 'object' && thumb && thumb.alt
      ? thumb.alt
      : post.title ?? ''

  return {
    slug: (post as { slug?: string }).slug ?? String(post.id),
    title: post.title ?? '',
    description: post.excerpt ?? '',
    date: formatDate(post.publishedDate, locale),
    thumbnailUrl,
    thumbnailAlt,
  }
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  return {
    alternates: buildAlternates(locale, CATEGORY_PATH),
  }
}

export default async function StoriesPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params
  const { page } = await searchParams
  const locale = normalizeLocale(rawLocale)
  const currentPage = Math.max(1, Number(page) || 1)

  const payload = await getPayload({ config })

  let docs: Post[] = []
  let totalDocs = 0
  try {
    const result = await payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: POSTS_PER_PAGE,
      page: currentPage,
      sort: '-publishedDate',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { publishedLocales: { equals: locale } },
          { category: { equals: CATEGORY } },
        ],
      },
    })
    docs = result.docs as Post[]
    totalDocs = result.totalDocs ?? docs.length
  } catch (err) {
    console.error('[StoriesPage] Failed to load posts:', err)
    docs = []
    totalDocs = 0
  }

  const posts: PostCardData[] = docs.map((p) => toCardData(p, locale))
  const totalPages = Math.max(1, Math.ceil(totalDocs / POSTS_PER_PAGE))

  return (
    <PostList
      basePath={`/${locale}${CATEGORY_PATH}`}
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
      posts={posts}
    />
  )
}

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post, Media } from '@/payload-types'

import PostListClient, { type PostCardData } from './PostListClient'

type SupportedLocale = 'ko' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'zh' | 'ar'
const SUPPORTED_LOCALES: SupportedLocale[] = [
  'ko', 'en', 'es', 'ru', 'de', 'fr', 'zh', 'ar',
]
const POSTS_PER_PAGE = 10

function normalizeLocale(raw: string): SupportedLocale {
  return (SUPPORTED_LOCALES as string[]).includes(raw)
    ? (raw as SupportedLocale)
    : 'en'
}

function formatDate(dateString: string | null | undefined, locale: string): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}

function toCardData(post: Post, locale: string): PostCardData {
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

export default async function InsightsPage({ params, searchParams }: PageProps) {
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
      // Payload drafts: `payload.find` 는 draft:false(기본값) 에서 _status=published
      // 버전만 반환하므로 별도 status 조건 불필요. publishedLocales 로 언어별
      // 공개 여부만 필터링.
      where: {
        publishedLocales: { equals: locale },
      },
    })
    docs = result.docs as Post[]
    totalDocs = result.totalDocs ?? docs.length
  } catch (err) {
    console.error('[InsightsPage] Failed to load posts:', err)
    docs = []
    totalDocs = 0
  }

  const posts: PostCardData[] = docs.map((p) => toCardData(p, locale))
  const totalPages = Math.max(1, Math.ceil(totalDocs / POSTS_PER_PAGE))

  return (
    <PostListClient
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
      posts={posts}
    />
  )
}

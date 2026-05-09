import { headers as nextHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Post, Tag } from '@/payload-types'

import PostDetailClient, {
  type PostDetailData,
  type RelatedPostData,
  type TagData,
} from './PostDetailClient'

type SupportedLocale = 'ko' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'zh' | 'ar'
const SUPPORTED_LOCALES: SupportedLocale[] = [
  'ko', 'en', 'es', 'ru', 'de', 'fr', 'zh', 'ar',
]
const RELATED_POSTS_LIMIT = 5

function normalizeLocale(raw: string): SupportedLocale {
  return (SUPPORTED_LOCALES as string[]).includes(raw)
    ? (raw as SupportedLocale)
    : 'en'
}

function formatDate(dateString: string | null | undefined, locale: string): { label: string; iso: string } {
  if (!dateString) return { label: '', iso: '' }
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return { label: '', iso: '' }
    const label = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
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
  locale: SupportedLocale,
): TagData[] {
  if (!Array.isArray(refs)) return []
  return refs
    .filter((t): t is Tag => typeof t === 'object' && t !== null)
    .map((t) => ({
      label: t.name ?? '',
      href: `/${locale}/insights?tag=${encodeURIComponent(t.slug ?? '')}`,
    }))
    .filter((t) => t.label.length > 0)
}

function toRelatedData(post: Post, locale: SupportedLocale): RelatedPostData {
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

export default async function PostDetailPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug } = await params
  const locale = normalizeLocale(rawLocale)
  const search = (await searchParams) ?? {}

  const payload = await getPayload({ config })

  // ── PREVIEW 분기: ?preview=true + payload-token 쿠키(admin) 둘 다 충족 시
  //   draft 도 함께 조회하고 publishedLocales 필터 해제. 그 외는 published 만.
  const headersList = await nextHeaders()
  let isPreviewUser = false
  if (search.preview === 'true') {
    try {
      const authResult = await payload.auth({ headers: headersList })
      isPreviewUser = Boolean(authResult.user)
    } catch (err) {
      console.error('[PostDetailPage] Preview auth check failed:', err)
    }
  }

  // ── 1) Target post 조회 ──────────────────────────────────────
  let post: Post | undefined
  try {
    const result = await payload.find({
      collection: 'posts',
      locale,
      depth: 2, // thumbnail + tags + Lexical block uploads populate
      limit: 1,
      draft: isPreviewUser,
      where: isPreviewUser
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { publishedLocales: { contains: locale } },
            ],
          },
    })
    post = result.docs[0] as Post | undefined
  } catch (err) {
    console.error('[PostDetailPage] Failed to load post:', err)
  }

  if (!post) {
    notFound()
  }

  // ── 2) 관련글 조회 (같은 locale 공개 + 현 slug 제외, 최근 5건) ──
  let relatedDocs: Post[] = []
  try {
    const relatedResult = await payload.find({
      collection: 'posts',
      locale,
      depth: 1, // thumbnail 만 populate
      limit: RELATED_POSTS_LIMIT,
      sort: '-publishedDate',
      where: {
        and: [
          { publishedLocales: { contains: locale } },
          { slug: { not_equals: slug } },
        ],
      },
    })
    relatedDocs = relatedResult.docs as Post[]
  } catch (err) {
    console.error('[PostDetailPage] Failed to load related posts:', err)
  }

  // ── 3) Client props 로 변환 ────────────────────────────────
  const heroThumb = resolveMedia(post.thumbnail, post.title ?? '')
  const postData: PostDetailData = {
    title: post.title ?? '',
    intro: post.excerpt ?? '',
    heroImageUrl: heroThumb.url,
    heroImageAlt: heroThumb.alt,
    content: post.content ?? null,
    tags: resolveTags(post.tags, locale),
  }
  const relatedPosts: RelatedPostData[] = relatedDocs.map((p) => toRelatedData(p, locale))

  return (
    <PostDetailClient
      locale={locale}
      post={postData}
      relatedPosts={relatedPosts}
    />
  )
}

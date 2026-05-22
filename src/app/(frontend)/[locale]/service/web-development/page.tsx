/**
 * Service hub "web-development" (hardcoded route, Pages-backed content).
 *
 * Bespoke route bound to one known Pages document (slug: service/web-development).
 * Hub copy is editable in admin > Pages; all block layout/markup lives in the
 * shared <PageBlocks> component so the 7 service hubs render identically.
 *
 * Route precedence: this literal segment wins over the sibling dynamic
 * /service/[slug] (Posts) route in the Next.js App Router.
 *
 * Reserved hub slugs (never reuse as a service Post slug): web-development,
 * aeo-geo, digital-assets, managed-web-services, mobile-app-development, seo,
 * social-media.
 *
 * To clone this for another hub: copy this file, change SLUG / CATEGORY_PATH /
 * HERO_BG and the log prefixes.
 */
import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isLocale, type Locale } from '@/i18n/locales'
import { buildAlternates } from '@/i18n/alternates'
import PageBlocks, { type LayoutBlock } from '@/components/pages/PageBlocks/PageBlocks'

const SLUG = 'service/web-development'
const CATEGORY_PATH = '/service/web-development'
// Hero fallback bg — used when the hero block has no uploaded backgroundImage.
const HERO_BG = '/assets/service-mockup/hero-bg.jpg'

function normalizeLocale(raw: string): Locale {
  return isLocale(raw) ? raw : 'en'
}

interface PageDoc {
  title?: string | null
  layout?: LayoutBlock[] | null
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  return { alternates: buildAlternates(locale, CATEGORY_PATH) }
}

export default async function WebDevelopmentHubPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  const search = (await searchParams) ?? {}

  const payload = await getPayload({ config })

  // ── PREVIEW 분기 (Posts 상세 페이지와 동일 패턴): ?preview=true +
  //   payload-token 쿠키(admin 로그인) 둘 다 충족 시 draft 버전까지 조회하고
  //   _status/publishedLocales 필터 해제. 그 외 공개 요청은 published 만 (F8).
  const headersList = await nextHeaders()
  let isPreviewUser = false
  if (search.preview === 'true') {
    try {
      const authResult = await payload.auth({ headers: headersList })
      isPreviewUser = Boolean(authResult.user)
    } catch (err) {
      console.error('[WebDevelopmentHubPage] Preview auth check failed:', err)
    }
  }

  let doc: PageDoc | undefined
  try {
    const result = await payload.find({
      collection: 'pages',
      locale,
      depth: 1,
      limit: 1,
      draft: isPreviewUser,
      where: isPreviewUser
        ? { slug: { equals: SLUG } }
        : {
            and: [
              { slug: { equals: SLUG } },
              { _status: { equals: 'published' } },
              { publishedLocales: { contains: locale } },
            ],
          },
    })
    doc = result.docs[0] as PageDoc | undefined
  } catch (err) {
    console.error('[WebDevelopmentHubPage] Failed to load page:', err)
  }

  if (!doc) notFound()

  const blocks = Array.isArray(doc.layout) ? doc.layout : []

  return <PageBlocks blocks={blocks} locale={locale} heroFallbackBg={HERO_BG} />
}

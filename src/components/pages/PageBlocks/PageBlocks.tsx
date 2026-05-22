/**
 * <PageBlocks> — shared renderer for Pages `layout` blocks.
 *
 * Async Server Component. Renders hero / cardGrid / ctaBanner / postList from a
 * Pages document's `layout`. Used by every service-hub route (web-development,
 * aeo-geo, ...) so layout/markup stays in one place while hub copy stays
 * editable in admin > Pages.
 *
 * `postList` blocks need a DB read (recent Posts grouped by cluster/tag/
 * category). They are resolved up-front, before the synchronous block map,
 * because the block map itself cannot be async.
 *
 * `content` (Lexical richText) blocks are not yet rendered — service hubs use
 * hero / cardGrid / ctaBanner / postList only. Wire a Lexical serializer into
 * the `content` branch when a hub needs long-form prose.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/locales'
import { getCategoryBasePath } from '@/lib/posts/urls'
import styles from './PageBlocks.module.css'

interface MediaRef {
  url?: string | null
}

interface HeroBlock {
  blockType: 'hero'
  headline?: string | null
  subCopy?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  backgroundImage?: MediaRef | string | number | null
}

interface Card {
  icon?: string | null
  title?: string | null
  description?: string | null
  link?: string | null
}

interface CardGridBlock {
  blockType: 'cardGrid'
  title?: string | null
  cards?: Card[] | null
}

interface CTABannerBlock {
  blockType: 'ctaBanner'
  message?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  backgroundGradient?: string | null
}

interface ContentBlock {
  blockType: 'content'
  content?: unknown
}

interface PostListBlock {
  blockType: 'postList'
  heading?: string | null
  filterField?: 'cluster' | 'tag' | 'category' | null
  filterValue?: string | null
  sort?: string | null
  limit?: number | null
  emptyText?: string | null
}

export type LayoutBlock =
  | HeroBlock
  | CardGridBlock
  | CTABannerBlock
  | ContentBlock
  | PostListBlock

/** Shape of a Post as rendered in a postList card (subset of the full doc). */
interface PostCard {
  id: number
  title?: string | null
  excerpt?: string | null
  slug?: string | null
  category?: string | null
  thumbnail?: MediaRef | string | number | null
}

interface PageBlocksProps {
  blocks: LayoutBlock[]
  locale: Locale
  /** Hero background used when a hero block has no uploaded backgroundImage. */
  heroFallbackBg?: string
}

function mediaUrl(v: MediaRef | string | number | null | undefined): string | null {
  return v && typeof v === 'object' ? (v.url ?? null) : null
}

function isImagePath(v: string | null | undefined): boolean {
  return typeof v === 'string' && v.startsWith('/')
}

export default async function PageBlocks({
  blocks,
  locale,
  heroFallbackBg,
}: PageBlocksProps) {
  const list = Array.isArray(blocks) ? blocks : []

  // postList 블록은 DB 조회가 필요 → 동기 렌더 전에 미리 resolve, 결과를
  // 블록 index 키 Map 에 담아둔다.
  const postListResults = new Map<number, PostCard[]>()
  if (list.some((b) => b.blockType === 'postList')) {
    const payload = await getPayload({ config })
    await Promise.all(
      list.map(async (block, i) => {
        if (block.blockType !== 'postList' || !block.filterValue) return
        const field = block.filterField ?? 'cluster'
        // tag 는 relationship → 하위 slug 필드로 질의 (Payload dot-notation).
        const whereField =
          field === 'tag' ? 'tags.slug' : field === 'category' ? 'category' : 'cluster'
        try {
          const res = await payload.find({
            collection: 'posts',
            locale,
            depth: 1,
            limit: block.limit ?? 6,
            sort: block.sort ?? '-publishedDate',
            where: {
              and: [
                { [whereField]: { equals: block.filterValue } },
                { _status: { equals: 'published' } },
                { publishedLocales: { contains: locale } },
              ],
            },
          })
          postListResults.set(i, res.docs as PostCard[])
        } catch (err) {
          console.error('[PageBlocks] postList query failed:', err)
          postListResults.set(i, [])
        }
      }),
    )
  }

  return (
    <div className={styles.page}>
      {list.map((block, i) => {
        if (block.blockType === 'hero') {
          const bg = mediaUrl(block.backgroundImage) ?? heroFallbackBg
          return (
            <section key={i} className={styles.hero}>
              {/* Swap <img> for <video autoPlay muted loop playsInline> when a clip exists */}
              {bg && (
                <img className={styles.heroMedia} src={bg} alt="" aria-hidden="true" />
              )}
              <div className={styles.heroInner}>
                <h1 className={styles.heroTitle}>{block.headline}</h1>
                {block.subCopy && <p className={styles.heroSub}>{block.subCopy}</p>}
                {block.ctaLabel && (
                  <a className={styles.heroCta} href={block.ctaUrl ?? '#'}>
                    {block.ctaLabel}
                  </a>
                )}
              </div>
            </section>
          )
        }

        if (block.blockType === 'cardGrid') {
          const cards = Array.isArray(block.cards) ? block.cards : []
          return (
            <section key={i} className={styles.section}>
              {block.title && <h2 className={styles.sectionTitle}>{block.title}</h2>}
              <div className={styles.grid}>
                {cards.map((card, ci) => {
                  const inner = (
                    <>
                      {isImagePath(card.icon) ? (
                        <img className={styles.cardImg} src={card.icon as string} alt="" />
                      ) : card.icon ? (
                        <div
                          className={styles.cardImg}
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 34,
                            background: '#eef4f3',
                          }}
                        >
                          {card.icon}
                        </div>
                      ) : null}
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        {card.description && (
                          <p className={styles.cardDesc}>{card.description}</p>
                        )}
                        {card.link && <span className={styles.cardLink}>Learn more →</span>}
                      </div>
                    </>
                  )
                  return card.link ? (
                    <a key={ci} className={styles.card} href={card.link}>
                      {inner}
                    </a>
                  ) : (
                    <div key={ci} className={styles.card}>
                      {inner}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        }

        if (block.blockType === 'ctaBanner') {
          return (
            <section key={i} className={`${styles.section} ${styles.bannerSection}`}>
              <div
                className={styles.banner}
                style={{ background: block.backgroundGradient ?? 'var(--primary, #5eb6b2)' }}
              >
                <p className={styles.bannerMsg}>{block.message}</p>
                {block.ctaLabel && (
                  <a className={styles.bannerCta} href={block.ctaUrl ?? '#'}>
                    {block.ctaLabel}
                  </a>
                )}
              </div>
            </section>
          )
        }

        if (block.blockType === 'postList') {
          const posts = postListResults.get(i) ?? []
          // 글이 0건이고 빈 문구도 없으면 섹션 자체를 숨김.
          if (posts.length === 0 && !block.emptyText) return null
          return (
            <section key={i} className={styles.section}>
              {block.heading && <h2 className={styles.sectionTitle}>{block.heading}</h2>}
              {posts.length === 0 ? (
                <p className={styles.cardDesc}>{block.emptyText}</p>
              ) : (
                <div className={styles.grid}>
                  {posts.map((post) => {
                    const href = `/${locale}${getCategoryBasePath(post.category)}/${post.slug}`
                    const thumb = mediaUrl(post.thumbnail)
                    return (
                      <a key={post.id} className={styles.card} href={href}>
                        {thumb && <img className={styles.cardImg} src={thumb} alt="" />}
                        <div className={styles.cardBody}>
                          <h3 className={styles.cardTitle}>{post.title}</h3>
                          {post.excerpt && (
                            <p className={styles.cardDesc}>{post.excerpt}</p>
                          )}
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
            </section>
          )
        }

        // content (Lexical richText) — 서비스 허브에서는 아직 미렌더 (위 docstring).
        return null
      })}
    </div>
  )
}

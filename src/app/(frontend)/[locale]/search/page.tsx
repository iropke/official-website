import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post, Page } from '@/payload-types'

import {
  normalizeLocale,
  toPayloadLocale,
  type SupportedLocale,
} from '@/i18n/locales'
import { getSearchCopy } from './messages'
import styles from './Search.module.css'

/**
 * 통합 검색 결과 페이지.
 *
 * 기획서: references/requirements/iropke_search_results.md
 *
 * 검색 대상:
 *   - posts (Insights 콘텐츠) — title / excerpt 부분 일치
 *   - pages (Solution / About 등 동적 페이지) — title 부분 일치
 *
 * 검색 로직:
 *   - URL 쿼리 q (또는 query) 받아서 사용
 *   - Payload `like` 연산자로 case-insensitive 부분 일치 (PostgreSQL ILIKE)
 *   - depth 1, limit 20 (페이지네이션 best-effort, 다음 페이지로 이동은
 *     페이지 단위 query string 으로 단순화)
 *
 * 알려진 한계:
 *   - Lexical content 본문 검색은 미구현 (별도 search index 필요).
 *     본 단계는 title / excerpt 만 커버.
 */

const RESULTS_PER_PAGE = 20

interface SearchResultItem {
  id: string
  type: 'post' | 'page'
  title: string
  excerpt: string
  url: string
  date?: string
}

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; query?: string; page?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const sp = await searchParams
  const locale = normalizeLocale(rawLocale)
  const copy = getSearchCopy(locale)
  const q = (sp.q ?? sp.query ?? '').trim()

  return {
    title: q ? `${copy.pageTitle}: ${q}` : copy.pageTitle,
    description: copy.pageMetaDescription,
    robots: { index: false, follow: false },
  }
}

function formatDate(dateString: string | null | undefined, locale: SupportedLocale): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ''
    const intlLocale = locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US'
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
}

async function searchPosts(
  query: string,
  locale: SupportedLocale,
): Promise<SearchResultItem[]> {
  const payload = await getPayload({ config })
  const payloadLocale = toPayloadLocale(locale)

  try {
    const result = await payload.find({
      collection: 'posts',
      locale: payloadLocale,
      depth: 0,
      limit: RESULTS_PER_PAGE,
      sort: '-publishedDate',
      where: {
        and: [
          { publishedLocales: { equals: payloadLocale } },
          {
            or: [
              { title: { like: query } },
              { excerpt: { like: query } },
            ],
          },
        ],
      },
    })

    return (result.docs as Post[]).map((p) => ({
      id: String(p.id),
      type: 'post' as const,
      title: p.title ?? '',
      excerpt: p.excerpt ?? '',
      url: `/${locale}/insights/${(p as { slug?: string }).slug ?? p.id}`,
      date: formatDate(p.publishedDate, locale),
    }))
  } catch (err) {
    console.error('[SearchPage] posts query failed:', err)
    return []
  }
}

async function searchPages(
  query: string,
  locale: SupportedLocale,
): Promise<SearchResultItem[]> {
  const payload = await getPayload({ config })
  const payloadLocale = toPayloadLocale(locale)

  try {
    const result = await payload.find({
      collection: 'pages',
      locale: payloadLocale,
      depth: 0,
      limit: RESULTS_PER_PAGE,
      where: {
        and: [
          { publishedLocales: { equals: payloadLocale } },
          { title: { like: query } },
        ],
      },
    })

    return (result.docs as Page[]).map((p) => ({
      id: String(p.id),
      type: 'page' as const,
      title: p.title ?? '',
      excerpt: p.meta?.metaDescription ?? '',
      url: `/${locale}/${(p as { slug?: string }).slug ?? ''}`,
    }))
  } catch (err) {
    console.error('[SearchPage] pages query failed:', err)
    return []
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale: rawLocale } = await params
  const sp = await searchParams
  const locale = normalizeLocale(rawLocale)
  const copy = getSearchCopy(locale)
  const rawQuery = (sp.q ?? sp.query ?? '').trim()

  let results: SearchResultItem[] = []
  if (rawQuery.length > 0) {
    const [posts, pages] = await Promise.all([
      searchPosts(rawQuery, locale),
      searchPages(rawQuery, locale),
    ])

    // 정적 페이지에 우선 가중치, 그 다음 일반 게시물
    results = [...pages, ...posts]
  }

  const total = results.length

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <h1 className={styles.heading}>{copy.pageTitle}</h1>

        <form
          className={styles.searchForm}
          action={`/${locale}/search`}
          method="GET"
          role="search"
        >
          <label className="sr-only" htmlFor="searchPageInput">
            {copy.inputPlaceholder}
          </label>
          <input
            id="searchPageInput"
            className={styles.input}
            type="search"
            name="q"
            defaultValue={rawQuery}
            placeholder={copy.inputPlaceholder}
            autoComplete="off"
          />
          <button type="submit" className={styles.submit}>
            {copy.searchButton}
          </button>
        </form>

        {rawQuery.length === 0 ? (
          <p className={styles.summaryQuery}>{copy.emptyQueryPrompt}</p>
        ) : (
          <div className={styles.summary}>
            {total > 0 ? (
              <>
                <p className={styles.summaryQuery}>
                  {copy.resultsForPrefix} <em>&ldquo;{rawQuery}&rdquo;</em>
                </p>
                <p className={styles.summaryCount}>
                  {total === 1 ? copy.countOne(total) : copy.countMany(total)}
                </p>
              </>
            ) : (
              <p className={styles.summaryQuery}>{copy.countZero(rawQuery)}</p>
            )}
          </div>
        )}

        {rawQuery.length > 0 && total > 0 && (
          <ul className={styles.list}>
            {results.map((r) => {
              const labelClass =
                r.type === 'page'
                  ? `${styles.cardLabel} ${styles.cardLabelPage}`
                  : styles.cardLabel
              const label =
                r.type === 'page' ? copy.typeLabels.page : copy.typeLabels.post

              return (
                <li key={`${r.type}-${r.id}`}>
                  <Link href={r.url} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={labelClass}>{label}</span>
                      {r.date && <span className={styles.cardDate}>{r.date}</span>}
                    </div>
                    <h2 className={styles.cardTitle}>{r.title || r.url}</h2>
                    {r.excerpt && (
                      <p className={styles.cardExcerpt}>{r.excerpt}</p>
                    )}
                    <p className={styles.cardUrl}>{r.url}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {rawQuery.length > 0 && total === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{copy.emptyHelpTitle}</p>
            <ul className={styles.emptyHelp}>
              {copy.emptyHelpItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.emptyTitle} style={{ marginTop: 16 }}>
              {copy.emptyHelpSuggestionsTitle}
            </p>
            <div className={styles.emptySuggest}>
              <Link href={`/${locale}/insights`} className={styles.emptySuggestLink}>
                {copy.suggestInsights}
              </Link>
              <Link
                href={`/${locale}/project-inquiry`}
                className={styles.emptySuggestLink}
              >
                {copy.suggestProjectInquiry}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

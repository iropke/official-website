'use client'

/**
 * Posts list-view category quick-filter bar.
 *
 * Wired into Posts.ts via:
 *   admin.components.beforeListTable = ['/components/admin/PostsCategoryFilter/index#default']
 *
 * Renders a full-width tab row (전체 / Insight / Story / Portfolio / Solution /
 * Service) directly above the list table. Selecting a tab writes a flat
 * `where[category][equals]=<value>` query param, which Payload's list view
 * parses (via qs-esm) into `{ where: { category: { equals } } }` and applies
 * server-side. The built-in search box, Columns and Filters controls keep
 * working on top of this — Payload merges `search` + `where`.
 *
 * Placement note: Payload's `[Columns][Filters]` button row is the internal
 * ListControls region with no public injection slot. `beforeListTable` is the
 * closest upgrade-safe slot (full-width bar just under those buttons) — DOM/CSS
 * injection into ListControls is the F11/F12 pitfall and is avoided.
 */

import { useRouteTransition } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { POST_CATEGORIES, type PostCategory } from '@/lib/posts/urls'

import './index.css'

const CATEGORY_LABELS: Record<PostCategory, string> = {
  insight: 'Insight',
  story: 'Story',
  portfolio: 'Portfolio',
  solution: 'Solution',
  service: 'Service',
}

// Flat where-clause key. qs-esm (Payload's query parser) decodes the
// percent-encoded brackets back into a nested where object.
const WHERE_KEY = 'where[category][equals]'

export default function PostsCategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { startRouteTransition } = useRouteTransition()

  const active = searchParams.get(WHERE_KEY)

  const select = useCallback(
    (category: PostCategory | null) => {
      // Build from the live URL so any qs-esm-encoded params Payload set
      // (sort, limit, search, locale, columns, …) round-trip untouched.
      const params = new URLSearchParams(window.location.search)
      if (category) {
        params.set(WHERE_KEY, category)
      } else {
        params.delete(WHERE_KEY)
      }
      // Changing the filter can push the current page out of range — reset
      // pagination to the first page.
      params.delete('page')
      const search = params.toString()
      startRouteTransition(() => {
        router.push(search ? `?${search}` : '?')
      })
    },
    [router, startRouteTransition],
  )

  return (
    <nav className="iropke-cat-filter" aria-label="카테고리 필터">
      <button
        type="button"
        className={`iropke-cat-filter__tab${
          !active ? ' iropke-cat-filter__tab--active' : ''
        }`}
        aria-pressed={!active}
        onClick={() => {
          if (active) select(null)
        }}
      >
        전체
      </button>
      {POST_CATEGORIES.map((category) => {
        const isActive = active === category
        return (
          <button
            key={category}
            type="button"
            className={`iropke-cat-filter__tab${
              isActive ? ' iropke-cat-filter__tab--active' : ''
            }`}
            aria-pressed={isActive}
            onClick={() => {
              if (!isActive) select(category)
            }}
          >
            {CATEGORY_LABELS[category]}
          </button>
        )
      })}
    </nav>
  )
}

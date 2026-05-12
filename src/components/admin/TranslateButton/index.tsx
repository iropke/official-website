'use client'

/**
 * Posts edit-view sidebar action: "Translate from EN" button.
 *
 * Wired into Posts.ts as a `type: 'ui'` field placed directly under the slug
 * box (admin position: sidebar). Opens a modal that lets the operator pick a
 * source locale (en/ko) and one or more target locales, then POSTs to
 * `/api/translate` to populate the chosen locales' values.
 *
 * MVP scope (Phase B-1 묶음 ②):
 *   - source/target locale selection
 *   - default fields (title / excerpt / metaTitle / metaDescription / content)
 *   - sonner toast for in-flight / success / failure
 *   - reload the page on success so the localizer reflects the new locale data
 *
 * Out of scope here (handled by later 묶음 steps):
 *   - manuallyEdited flag preservation (Phase B-1 ③)
 *   - references[] / Lexical block walker coverage (Phase B-1 ④)
 *   - per-field selection UI
 */

import { useDocumentInfo, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { LOCALES, LOCALE_LABELS_ADMIN, type Locale } from '@/i18n/locales'

import './index.css'

const SOURCE_LOCALES: Locale[] = ['en', 'ko']

type ApiResponse =
  | {
      success: true
      sourceLocale: Locale
      results: Record<string, Record<string, unknown>>
      publishedLocales: Locale[]
      publishedAdded: Locale[]
      usage: { inputTokens: number; outputTokens: number; contentNodes: number }
    }
  | { success: false; error: string }

export default function TranslateButton() {
  const { id } = useDocumentInfo()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [sourceLocale, setSourceLocale] = useState<Locale>('en')
  const [targetLocales, setTargetLocales] = useState<Set<Locale>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Esc / outside click close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) setOpen(false)
    }
    function onPointer(e: MouseEvent) {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        !submitting
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open, submitting])

  const availableTargets = useMemo<Locale[]>(
    () => LOCALES.filter((l) => l !== sourceLocale),
    [sourceLocale],
  )

  // When source changes, drop source from target set
  useEffect(() => {
    setTargetLocales((prev) => {
      if (!prev.has(sourceLocale)) return prev
      const next = new Set(prev)
      next.delete(sourceLocale)
      return next
    })
  }, [sourceLocale])

  function toggleTarget(code: Locale) {
    setTargetLocales((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  function selectAll() {
    setTargetLocales(new Set(availableTargets))
  }

  function clearAll() {
    setTargetLocales(new Set())
  }

  async function submit() {
    if (!id) {
      toast.error('Post 가 아직 저장되지 않았습니다. 먼저 저장한 뒤 번역을 실행하세요.')
      return
    }
    if (targetLocales.size === 0) {
      toast.error('번역할 언어를 1개 이상 선택하세요.')
      return
    }

    setSubmitting(true)
    const targets = [...targetLocales]
    const loadingId = toast.loading(
      `${LOCALE_LABELS_ADMIN[sourceLocale]} → ${targets.length}개 언어 번역 중…`,
    )

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          postId: id,
          sourceLocale,
          targetLocales: targets,
        }),
      })

      const data = (await res.json().catch(() => null)) as ApiResponse | null

      if (!res.ok || !data?.success) {
        const msg =
          (data && 'error' in data && data.error) ||
          `HTTP ${res.status} ${res.statusText}`
        toast.error(`번역 실패: ${msg}`, { id: loadingId })
        return
      }

      const localeList = Object.keys(data.results).join(', ')
      const publishedNote =
        data.publishedAdded.length > 0
          ? ` · published+ ${data.publishedAdded.join(', ')}`
          : ''
      toast.success(
        `번역 완료 — ${localeList} · input ${data.usage.inputTokens} / output ${data.usage.outputTokens} tokens · ${data.usage.contentNodes} content nodes${publishedNote}`,
        { id: loadingId, duration: 6000 },
      )
      setOpen(false)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`번역 실패: ${msg}`, { id: loadingId })
    } finally {
      setSubmitting(false)
    }
  }

  // ui field renders even before save; we only enable the button after the
  // post has an ID (i.e. it has been saved at least once).
  const disabled = !id

  return (
    <div className="iropke-translate">
      <button
        type="button"
        className="iropke-translate__trigger"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? '먼저 저장한 뒤 번역을 실행할 수 있습니다.' : undefined}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="iropke-translate__icon"
        >
          <path
            d="M3 5h7M6.5 3v2M4 9c.8 1.6 1.9 2.9 3.2 3.9M9 5c-.4 2.8-1.8 5.4-4 7M11 17l3.5-8 3.5 8M12.3 14.5h4.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Translate
      </button>

      {open && (
        <div className="iropke-translate__backdrop" role="presentation">
          <div
            ref={dialogRef}
            className="iropke-translate__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="iropke-translate-title"
          >
            <div className="iropke-translate__header">
              <h2 id="iropke-translate-title" className="iropke-translate__title">
                Translate this post
              </h2>
              <button
                type="button"
                className="iropke-translate__close"
                onClick={() => !submitting && setOpen(false)}
                disabled={submitting}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="iropke-translate__body">
              <label className="iropke-translate__field">
                <span className="iropke-translate__field-label">Source locale</span>
                <select
                  className="iropke-translate__select"
                  value={sourceLocale}
                  onChange={(e) => setSourceLocale(e.target.value as Locale)}
                  disabled={submitting}
                >
                  {SOURCE_LOCALES.map((code) => (
                    <option key={code} value={code}>
                      {LOCALE_LABELS_ADMIN[code]} ({code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="iropke-translate__targets">
                <div className="iropke-translate__targets-head">
                  <span className="iropke-translate__field-label">
                    Target locales ({targetLocales.size} selected)
                  </span>
                  <div className="iropke-translate__targets-actions">
                    <button
                      type="button"
                      className="iropke-translate__link"
                      onClick={selectAll}
                      disabled={submitting}
                    >
                      Select all
                    </button>
                    <span className="iropke-translate__sep">·</span>
                    <button
                      type="button"
                      className="iropke-translate__link"
                      onClick={clearAll}
                      disabled={submitting}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ul className="iropke-translate__list">
                  {availableTargets.map((code) => {
                    const checked = targetLocales.has(code)
                    return (
                      <li key={code}>
                        <label
                          className={`iropke-translate__item${
                            checked ? ' iropke-translate__item--checked' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTarget(code)}
                            disabled={submitting}
                          />
                          <span className="iropke-translate__item-label">
                            {LOCALE_LABELS_ADMIN[code]}
                          </span>
                          <span className="iropke-translate__item-code">{code}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <p className="iropke-translate__note">
                Fields: title · excerpt · metaTitle · metaDescription · content (Lexical text nodes).
                <br />
                번역 성공 시 선택한 locale 이 publishedLocales 에 자동 추가됩니다 (프론트에 즉시 노출).
                <br />
                기존 번역본은 덮어쓰기됩니다 (manuallyEdited 보존은 Phase B-1 ③ 도입 예정).
              </p>
            </div>

            <div className="iropke-translate__footer">
              <button
                type="button"
                className="iropke-translate__btn iropke-translate__btn--ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="iropke-translate__btn iropke-translate__btn--primary"
                onClick={submit}
                disabled={submitting || targetLocales.size === 0}
              >
                {submitting ? 'Translating…' : 'Translate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

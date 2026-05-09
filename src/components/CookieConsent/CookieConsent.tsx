'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { normalizeLocale } from '@/i18n/locales'
import { getCookieConsentCopy } from './messages'
import styles from './CookieConsent.module.css'

/**
 * 쿠키 동의 UI.
 *
 * 기획서: references/requirements/iropke_cookie_consent_ui.md
 *
 * 동작:
 *   - 첫 방문 시 화면 하단 banner 표시
 *   - Accept All / Reject All / Manage Preferences 3개 액션
 *   - Manage Preferences → modal 에서 카테고리별 토글
 *   - localStorage 에 동의 상태 저장 (6개월 만료)
 *   - 이후 방문 시 banner 미표시 (만료되면 재표시)
 *
 * 카테고리:
 *   - Necessary (항상 ON, 비활성화 불가)
 *   - Analytics
 *   - Marketing
 *   - Functional
 *
 * locale 분기는 pathname 첫 세그먼트로 추출. layout.tsx 에 한 번 마운트 됨.
 */

const STORAGE_KEY = 'iropke.cookieConsent.v1'
const STORAGE_VERSION = 1
const TTL_MS = 1000 * 60 * 60 * 24 * 30 * 6 // 6개월

interface ConsentState {
  necessary: true
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface StoredConsent {
  version: number
  state: ConsentState
  decidedAt: number
}

const ALL_OFF: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}

const ALL_ON: ConsentState = {
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
}

function readStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (
      !parsed ||
      parsed.version !== STORAGE_VERSION ||
      typeof parsed.decidedAt !== 'number' ||
      Date.now() - parsed.decidedAt > TTL_MS ||
      typeof parsed.state !== 'object' ||
      parsed.state === null
    ) {
      return null
    }
    return parsed as StoredConsent
  } catch {
    return null
  }
}

function persistConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return
  try {
    const payload: StoredConsent = {
      version: STORAGE_VERSION,
      state,
      decidedAt: Date.now(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage 비활성화 환경(예: private mode 일부) — 그냥 무시.
    // 다음 방문 때 banner 가 다시 뜨겠지만 동작상 문제 없음.
  }
}

export default function CookieConsent() {
  const pathname = usePathname() ?? '/'
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = normalizeLocale(segment)
  const copy = getCookieConsentCopy(locale)

  // 초기 렌더 시점에는 hydration mismatch 를 피하기 위해 hidden 으로 시작.
  // useEffect 에서 localStorage 확인 후 banner 표시 여부 결정.
  const [bannerVisible, setBannerVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<ConsentState>(ALL_OFF)

  useEffect(() => {
    const stored = readStoredConsent()
    if (!stored) {
      setBannerVisible(true)
    }
  }, [])

  const handleAcceptAll = useCallback(() => {
    persistConsent(ALL_ON)
    setBannerVisible(false)
    setModalOpen(false)
  }, [])

  const handleRejectAll = useCallback(() => {
    persistConsent(ALL_OFF)
    setBannerVisible(false)
    setModalOpen(false)
  }, [])

  const handleOpenModal = useCallback(() => {
    setDraft(ALL_OFF)
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    persistConsent(draft)
    setBannerVisible(false)
    setModalOpen(false)
  }, [draft])

  const handleClose = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handleToggle = useCallback(
    (key: 'analytics' | 'marketing' | 'functional') =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft((prev) => ({ ...prev, [key]: e.target.checked }))
      },
    [],
  )

  // ESC 로 modal 닫기
  useEffect(() => {
    if (!modalOpen) return
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen])

  if (!bannerVisible && !modalOpen) return null

  return (
    <>
      {bannerVisible && (
        <div
          className={styles.banner}
          role="dialog"
          aria-live="polite"
          aria-label={copy.modalTitle}
        >
          <p className={styles.bannerMessage}>{copy.bannerMessage}</p>
          <div className={styles.bannerActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={handleOpenModal}
            >
              {copy.managePreferences}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleRejectAll}
            >
              {copy.rejectAll}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleAcceptAll}
            >
              {copy.acceptAll}
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookieConsentModalTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 id="cookieConsentModalTitle" className={styles.modalTitle}>
                {copy.modalTitle}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label={copy.closeLabel}
              >
                ×
              </button>
            </div>
            <p className={styles.modalIntro}>{copy.modalIntro}</p>

            <div className={styles.categoryList}>
              <div className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryTitle}>
                    {copy.categories.necessary.title}
                  </span>
                  <span className={styles.alwaysOn}>{copy.alwaysOn}</span>
                </div>
                <p className={styles.categoryDesc}>
                  {copy.categories.necessary.description}
                </p>
              </div>

              <CategoryToggle
                title={copy.categories.analytics.title}
                description={copy.categories.analytics.description}
                checked={draft.analytics}
                onChange={handleToggle('analytics')}
              />
              <CategoryToggle
                title={copy.categories.marketing.title}
                description={copy.categories.marketing.description}
                checked={draft.marketing}
                onChange={handleToggle('marketing')}
              />
              <CategoryToggle
                title={copy.categories.functional.title}
                description={copy.categories.functional.description}
                checked={draft.functional}
                onChange={handleToggle('functional')}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleRejectAll}
              >
                {copy.rejectAll}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleSave}
              >
                {copy.savePreferences}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleAcceptAll}
              >
                {copy.acceptAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface CategoryToggleProps {
  title: string
  description: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function CategoryToggle({ title, description, checked, onChange }: CategoryToggleProps) {
  return (
    <div className={styles.category}>
      <div className={styles.categoryHeader}>
        <span className={styles.categoryTitle}>{title}</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={checked} onChange={onChange} aria-label={title} />
          <span className={styles.toggleTrack} aria-hidden="true" />
        </label>
      </div>
      <p className={styles.categoryDesc}>{description}</p>
    </div>
  )
}

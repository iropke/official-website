import React from 'react'
import Link from 'next/link'
import styles from './ErrorScreen.module.css'
import { getErrorCopy, type ErrorKind } from './errorMessages'
import { normalizeLocale } from '@/i18n/locales'

interface ErrorScreenProps {
  locale: string
  kind: ErrorKind
  /** 500 등 reset 가능한 오류에서 React Error Boundary 의 reset 함수를 노출. */
  onReset?: () => void
  /** 디버깅용 디지털 코드 (Next.js 가 error 객체에 부여) */
  digest?: string
}

/**
 * Hero-style error screen.
 *
 * 디자인 토큰 / 시각 언어는 globals.css + Hero.module.css 와 동일하게 맞춤:
 *   - section shell (grid + orbs + radial gradient)
 *   - eyebrow chip with status dot
 *   - serif error code (--font-accent-serif) at hero scale
 *   - primary CTA dark + secondary glass
 *   - meta line (mono, uppercase) with error code + digest
 */
export default function ErrorScreen({
  locale: rawLocale,
  kind,
  onReset,
  digest,
}: ErrorScreenProps) {
  const locale = normalizeLocale(rawLocale)
  const copy = getErrorCopy(locale, kind)
  const homeHref = `/${locale}`
  const contactHref = `/${locale}/project-inquiry`

  return (
    <section className={styles.shell} aria-label={`Error ${kind}`} lang={locale}>
      <div className={styles.canvas} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.orbA} />
        <div className={styles.orbB} />
      </div>

      <div className={`page-shell ${styles.shellInner}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            {copy.hintPrefix} · {kind}
          </p>

          <p className={styles.code} aria-hidden="true">
            {kind}
          </p>

          <h1 className={styles.title}>{copy.title}</h1>

          <p className={styles.witty}>&ldquo;{copy.witty}&rdquo;</p>

          <p className={styles.description}>{copy.description}</p>

          <div className={styles.actions}>
            <Link
              href={homeHref}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              <span>{copy.homeLabel}</span>
              <svg
                className={styles.btnArrow}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {copy.backLabel}
              </button>
            )}

            <Link
              href={contactHref}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              {copy.contactLabel}
            </Link>
          </div>

          <div className={styles.meta} aria-hidden="true">
            <span className={styles.metaLabel}>
              {copy.hintPrefix}: {kind}
            </span>
            {digest && (
              <>
                <span className={styles.metaRule} />
                <span className={styles.metaLabel}>{digest}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

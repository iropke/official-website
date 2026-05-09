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
    <div className={styles.shell}>
      <div className={styles.content}>
        <p className={styles.code} aria-hidden="true">
          {kind}
        </p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.witty}>&ldquo;{copy.witty}&rdquo;</p>
        <p className={styles.description}>{copy.description}</p>

        <div className={styles.actions}>
          <Link href={homeHref} className={`${styles.btn} ${styles.btnPrimary}`}>
            {copy.homeLabel}
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

        <p className={styles.hint}>
          {copy.hintPrefix}: {kind}
          {digest ? ` · ${digest}` : ''}
        </p>
      </div>
    </div>
  )
}

/**
 * Locale 세그먼트 내부 500 / 일반 런타임 오류.
 *
 * Next.js App Router error boundary:
 *   - 'use client' 필수
 *   - error/reset prop 자동 주입
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ErrorScreen from '@/components/error/ErrorScreen'
import { normalizeLocale } from '@/i18n/locales'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[LocaleError] Unhandled error in (frontend)/[locale]:', error)
  }, [error])

  const pathname = usePathname() ?? '/'
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = normalizeLocale(segment)

  return (
    <ErrorScreen
      locale={locale}
      kind="500"
      onReset={reset}
      digest={error.digest}
    />
  )
}

/**
 * Locale 세그먼트 내부 404.
 *
 * 기획서 (references/requirements/iropke_error.md) 가 "global header 없이"
 * 라고 명시하지만, Next.js App Router 의 `not-found.tsx` 는 부모 layout 을
 * 그대로 적용한다. 이 파일은 [locale]/layout.tsx 안에 렌더되므로 Header/Footer
 * 가 표시될 수 있다 — 향후 (frontend)/layout.tsx 단계로 끌어올리거나 not-found
 * 전용 layout 을 두는 후속 작업이 필요. 본 단계에서는 메시지 자체는 차분히
 * 표시되므로 사용자 경험 손실은 제한적.
 *
 * locale param 을 비동기 props 로 받지 못하는 not-found 의 한계 때문에,
 * 클라이언트 측에서 pathname 첫 세그먼트로 locale 을 추출한다.
 */

'use client'

import { usePathname } from 'next/navigation'
import ErrorScreen from '@/components/error/ErrorScreen'
import { normalizeLocale } from '@/i18n/locales'

export default function LocaleNotFound() {
  const pathname = usePathname() ?? '/'
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = normalizeLocale(segment)

  return <ErrorScreen locale={locale} kind="404" />
}

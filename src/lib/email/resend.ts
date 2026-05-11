/**
 * Resend client — lazy singleton.
 *
 * 환경변수 `RESEND_API_KEY` 가 미설정인 환경(로컬 dev, 신규 워크트리 등)에서는
 * `null` 을 반환합니다. 호출 측에서 null 체크 후 graceful skip 하도록 설계.
 *
 * 등록 위치: Vercel UI (Production / Preview / Development). 발급은
 * https://resend.com/api-keys 에서 진행. 발송 도메인은 사전에 Resend
 * 콘솔에서 verify 가 필요합니다 (iropke.com).
 */

import { Resend } from 'resend'

let cached: Resend | null | undefined

export function getResend(): Resend | null {
  if (cached !== undefined) return cached

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[resend] RESEND_API_KEY not configured — email skipped')
    cached = null
    return cached
  }

  cached = new Resend(key)
  return cached
}

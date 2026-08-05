/**
 * Payload 이메일 어댑터 — Resend (HTTP API).
 *
 * Payload 의 `payload.sendEmail` (admin 비밀번호 재설정 / verify 메일 등) 은
 * config 의 `email` 어댑터를 통해 발송됩니다. 어댑터가 없으면 Payload 는
 * `consoleEmailAdapter` 로 폴백해 실제 발송 없이 로그만 남깁니다
 * (그 결과 forgot-password 메일이 Resend 에 도달하지 못했음 — 2026-08-05 진단).
 *
 * 새 의존성(@payloadcms/email-resend) 설치로 인한 빌드 취약을 피하려고, 이미
 * dependency 로 존재하는 `resend` SDK 를 감싼 최소 어댑터로 구현합니다.
 * Inquiry 폼(`src/lib/email/sendInquiryEmails.ts`)은 이 어댑터와 무관하게
 * Resend SDK 를 직접 호출하며, 그 경로는 그대로 둡니다.
 *
 * From 주소는 verified 도메인(iropke.com)이어야 합니다 — `EMAIL_FROM` 기본
 * `hello@iropke.com`.
 */

import type { EmailAdapter } from 'payload'
import { Resend } from 'resend'

/** nodemailer 스타일 주소값(string | {address,name} | 배열)을 Resend 문자열 배열로 정규화 */
function toAddressList(value: unknown): string[] {
  if (!value) return []
  const arr = Array.isArray(value) ? value : [value]
  const out: string[] = []
  for (const item of arr) {
    if (!item) continue
    if (typeof item === 'string') {
      out.push(item)
    } else if (typeof item === 'object' && 'address' in item && (item as { address?: string }).address) {
      const { address, name } = item as { address: string; name?: string }
      out.push(name ? `${name} <${address}>` : address)
    }
  }
  return out
}

/** html/text 는 이론상 Buffer/Readable 가능하나 Payload 는 string 을 넘김 */
function toBody(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Buffer.isBuffer(value)) return value.toString('utf8')
  return undefined
}

export interface ResendAdapterArgs {
  apiKey: string
  defaultFromName: string
  defaultFromAddress: string
}

export const resendEmailAdapter = (args: ResendAdapterArgs): EmailAdapter => {
  const { apiKey, defaultFromName, defaultFromAddress } = args
  const resend = new Resend(apiKey)

  return ({ payload }) => ({
    name: 'resend',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message) => {
      const from = toAddressList(message.from)[0] || `${defaultFromName} <${defaultFromAddress}>`
      const to = toAddressList(message.to)
      const replyTo = toAddressList(message.replyTo)
      const cc = toAddressList(message.cc)
      const bcc = toAddressList(message.bcc)
      const html = toBody(message.html)
      const text = toBody(message.text)
      const subject = message.subject ?? ''

      // Resend 는 html/text/react 중 최소 하나 필수 — 방어적 폴백.
      const body = html ? { html } : text ? { text } : { text: subject || ' ' }

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        ...body,
        ...(replyTo.length ? { replyTo } : {}),
        ...(cc.length ? { cc } : {}),
        ...(bcc.length ? { bcc } : {}),
      } as Parameters<typeof resend.emails.send>[0])

      if (error) {
        payload.logger.error({ err: error, msg: '[resend-adapter] sendEmail failed' })
        throw new Error(`Resend send failed: ${error.message ?? 'unknown error'}`)
      }
      return data
    },
  })
}

/**
 * Project Inquiry 메일 발송 entry.
 *
 * `/api/inquiries` step 6 에서 호출. DB 저장 성공 후 fire-and-forget 으로
 * 두 통의 메일을 발송합니다:
 *   (A) 어드민 알림 메일 → INQUIRY_TO_EMAIL (default hello@iropke.com)
 *   (B) 신청자 확인 메일 → input.email
 *
 * 발송 실패는 console.error 로만 로깅 — DB 저장은 이미 성공한 상태이므로
 * 사용자 응답을 차단하지 않습니다. 운영팀은 admin UI 에서 항상 확인 가능.
 *
 * 환경변수:
 *   RESEND_API_KEY     — Resend API 키 (필수 — 미설정 시 메일 skip)
 *   INQUIRY_FROM_EMAIL — From 주소 (default "Iropke <hello@iropke.com>")
 *   INQUIRY_TO_EMAIL   — 어드민 수신 주소 (default "hello@iropke.com")
 *   NEXT_PUBLIC_SERVER_URL / VERCEL_URL — admin 링크 base URL
 */

import { type Locale } from '@/i18n/locales'
import { getResend } from './resend'
import {
  buildAdminNotificationEmail,
  buildConfirmationEmail,
  type AdminNotificationInput,
} from './inquiryTemplates'

const DEFAULT_FROM = 'Iropke <hello@iropke.com>'
const DEFAULT_ADMIN_TO = 'hello@iropke.com'

export interface SendInquiryEmailsInput {
  inquiryId: number | string
  company: string
  contactName: string
  jobTitle?: string
  email: string
  phone: string
  projectOverview: string
  websiteUrl?: string
  launchDate?: string
  submittedLocale: Locale
  recaptchaScore: number
  status: 'new' | 'on_hold'
  hasRfpFile: boolean
  ipAddress?: string
}

function resolveAdminBaseUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`
  return undefined
}

/**
 * Resend 로 어드민 + 신청자 메일을 발송합니다. 실패해도 throw 하지 않으며,
 * 모든 오류는 console.error 로 로깅됩니다.
 */
export async function sendInquiryEmails(input: SendInquiryEmailsInput): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const from = process.env.INQUIRY_FROM_EMAIL?.trim() || DEFAULT_FROM
  const adminTo = process.env.INQUIRY_TO_EMAIL?.trim() || DEFAULT_ADMIN_TO

  const adminPayload: AdminNotificationInput = {
    inquiryId: input.inquiryId,
    company: input.company,
    contactName: input.contactName,
    jobTitle: input.jobTitle,
    email: input.email,
    phone: input.phone,
    projectOverview: input.projectOverview,
    websiteUrl: input.websiteUrl,
    launchDate: input.launchDate,
    submittedLocale: input.submittedLocale,
    recaptchaScore: input.recaptchaScore,
    status: input.status,
    hasRfpFile: input.hasRfpFile,
    ipAddress: input.ipAddress,
    adminBaseUrl: resolveAdminBaseUrl(),
  }

  const adminMail = buildAdminNotificationEmail(adminPayload)
  const userMail = buildConfirmationEmail({
    locale: input.submittedLocale,
    contactName: input.contactName,
  })

  const tasks: Array<Promise<unknown>> = [
    resend.emails
      .send({
        from,
        to: adminTo,
        subject: adminMail.subject,
        text: adminMail.text,
        replyTo: input.email,
      })
      .then((res) => {
        if (res.error) {
          console.error('[sendInquiryEmails] admin mail failed:', res.error)
        }
      })
      .catch((err) => {
        console.error('[sendInquiryEmails] admin mail threw:', err)
      }),
    resend.emails
      .send({
        from,
        to: input.email,
        subject: userMail.subject,
        text: userMail.text,
        replyTo: adminTo,
      })
      .then((res) => {
        if (res.error) {
          console.error('[sendInquiryEmails] confirmation mail failed:', res.error)
        }
      })
      .catch((err) => {
        console.error('[sendInquiryEmails] confirmation mail threw:', err)
      }),
  ]

  await Promise.all(tasks)
}

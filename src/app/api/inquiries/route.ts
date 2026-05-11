/**
 * POST /api/inquiries
 *
 * Project Inquiry 폼 (`/[locale]/project-inquiry`) 의 제출 endpoint.
 * 공개(비로그인) 호출 가능 — `Inquiries.access.create` 가 `() => true` 로
 * 열려있고, 이 라우트는 본인 서버에서 직접 Payload local API 를 호출하므로
 * 외부 인증 없이 접수 가능합니다.
 *
 * 입력 형식: `multipart/form-data` (또는 `application/json` — 파일 미첨부 시)
 *
 * 필드 매핑 (form → Inquiries 컬렉션):
 *   companyName     → company        (required)
 *   contactName     → contactName    (required)
 *   jobTitle        → jobTitle
 *   phone           → phone          (required)
 *   email           → email          (required)
 *   projectOverview → projectOverview(required)
 *   website         → websiteUrl
 *   launchDate      → launchDate
 *   rfpFile (File)  → media collection 업로드 후 ID 를 rfpFile 에 저장
 *   recaptchaToken  → Google siteverify 검증 후 score 를 recaptchaScore 에 저장
 *
 * 스팸 정책 (reCAPTCHA v3):
 *   score < 0.3   → 거절 (HTTP 400)
 *   0.3 ≤ s < 0.5 → 접수하되 status='on_hold' 로 보류 (admin 수동 검토)
 *   score ≥ 0.5   → 정상 접수 (status='new')
 *
 * 메타 필드:
 *   submittedLocale → 폼이 보낸 locale (헤더 또는 form 필드)
 *   ipAddress       → x-forwarded-for / x-real-ip
 *
 * 메일 발송 (Resend):
 *   DB 저장 성공 후 fire-and-forget 으로 어드민 알림 + 신청자 확인 메일을
 *   발송합니다. 발송 실패는 console.error 로만 기록 — 사용자 응답을 차단하지
 *   않습니다. 자세한 정책은 `src/lib/email/sendInquiryEmails.ts` 참조.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/locales'
import { sendInquiryEmails } from '@/lib/email/sendInquiryEmails'

const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20MB — 폼 안내 문구와 일치
const ALLOWED_FILE_EXTS = ['ppt', 'pptx', 'doc', 'docx', 'pdf', 'zip']

interface InquiryInput {
  companyName: string
  contactName: string
  jobTitle: string
  phone: string
  email: string
  projectOverview: string
  website: string
  launchDate: string
  recaptchaToken: string
  submittedLocale: string
}

type ValidationError = {
  field: string
  message: string
}

function validate(input: InquiryInput): ValidationError[] {
  const errors: ValidationError[] = []

  if (!input.companyName.trim()) errors.push({ field: 'companyName', message: 'Required.' })
  if (!input.contactName.trim()) errors.push({ field: 'contactName', message: 'Required.' })
  if (!input.projectOverview.trim())
    errors.push({ field: 'projectOverview', message: 'Required.' })

  // phone — 숫자 7~15 자리, 기호 허용
  const phone = input.phone.trim()
  const digits = phone.replace(/\D/g, '')
  if (!phone || !/^[+\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    errors.push({ field: 'phone', message: 'Invalid phone number.' })
  }

  // email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email address.' })
  }

  // website (필수 — 폼 정책)
  const website = input.website.trim()
  if (!website) {
    errors.push({ field: 'website', message: 'Required.' })
  } else {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`
    try {
      const u = new URL(normalized)
      if (!u.hostname || !u.hostname.includes('.')) throw new Error('bad host')
    } catch {
      errors.push({ field: 'website', message: 'Invalid URL.' })
    }
  }

  // launchDate (선택, YYYY-MM-DD 형식)
  if (input.launchDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(input.launchDate.trim())) {
    errors.push({ field: 'launchDate', message: 'Invalid date format (YYYY-MM-DD).' })
  }

  if (!input.recaptchaToken.trim()) {
    errors.push({ field: 'recaptchaToken', message: 'Spam check token is missing.' })
  }

  return errors
}

interface RecaptchaVerifyResult {
  success: boolean
  score: number | null
  errorCodes?: string[]
}

const RECAPTCHA_REJECT_THRESHOLD = 0.3
const RECAPTCHA_REVIEW_THRESHOLD = 0.5
const RECAPTCHA_EXPECTED_ACTION = 'inquiry'

async function verifyRecaptcha(token: string, ip?: string): Promise<RecaptchaVerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('[api/inquiries] RECAPTCHA_SECRET_KEY not configured')
    return { success: false, score: null, errorCodes: ['missing-secret'] }
  }

  const params = new URLSearchParams({ secret, response: token })
  if (ip) params.append('remoteip', ip)

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) {
      return { success: false, score: null, errorCodes: [`http-${res.status}`] }
    }

    const data = (await res.json()) as {
      success: boolean
      score?: number
      action?: string
      'error-codes'?: string[]
    }

    if (!data.success) {
      return { success: false, score: null, errorCodes: data['error-codes'] }
    }

    if (data.action && data.action !== RECAPTCHA_EXPECTED_ACTION) {
      return {
        success: false,
        score: typeof data.score === 'number' ? data.score : null,
        errorCodes: [`action-mismatch:${data.action}`],
      }
    }

    return {
      success: true,
      score: typeof data.score === 'number' ? data.score : null,
    }
  } catch (err) {
    console.error('[api/inquiries] siteverify network error:', err)
    return { success: false, score: null, errorCodes: ['network-error'] }
  }
}

function getClientIp(req: NextRequest): string | undefined {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim()
  return req.headers.get('x-real-ip') ?? undefined
}

function asString(v: FormDataEntryValue | null | undefined): string {
  if (typeof v === 'string') return v
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // ── 1. 입력 파싱 (multipart 또는 JSON) ──────────────────────
    const contentType = req.headers.get('content-type') ?? ''
    let input: InquiryInput
    let file: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      input = {
        companyName: asString(fd.get('companyName')),
        contactName: asString(fd.get('contactName')),
        jobTitle: asString(fd.get('jobTitle')),
        phone: asString(fd.get('phone')),
        email: asString(fd.get('email')),
        projectOverview: asString(fd.get('projectOverview')),
        website: asString(fd.get('website')),
        launchDate: asString(fd.get('launchDate')),
        recaptchaToken: asString(fd.get('recaptchaToken')),
        submittedLocale: asString(fd.get('submittedLocale')),
      }
      const f = fd.get('rfpFile')
      if (f instanceof File && f.size > 0) file = f
    } else {
      const json = (await req.json().catch(() => null)) as Partial<InquiryInput> | null
      if (!json) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON body.' },
          { status: 400 },
        )
      }
      input = {
        companyName: asString(json.companyName),
        contactName: asString(json.contactName),
        jobTitle: asString(json.jobTitle),
        phone: asString(json.phone),
        email: asString(json.email),
        projectOverview: asString(json.projectOverview),
        website: asString(json.website),
        launchDate: asString(json.launchDate),
        recaptchaToken: asString(json.recaptchaToken),
        submittedLocale: asString(json.submittedLocale),
      }
    }

    // ── 2. 검증 ──────────────────────────────────────────────────
    const errors = validate(input)
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed.', errors },
        { status: 400 },
      )
    }

    // submittedLocale fallback: Accept-Language 첫 토큰
    const raw = input.submittedLocale.trim()
    let submittedLocale: Locale
    if (isLocale(raw)) {
      submittedLocale = raw
    } else {
      const accept = req.headers.get('accept-language') ?? ''
      const first = accept.split(',')[0]?.split('-')[0]?.toLowerCase() ?? ''
      submittedLocale = isLocale(first) ? first : DEFAULT_LOCALE
    }

    // ── 3. reCAPTCHA v3 검증 ────────────────────────────────────
    const ip = getClientIp(req)
    const verify = await verifyRecaptcha(input.recaptchaToken, ip)

    if (!verify.success || verify.score === null) {
      console.warn('[api/inquiries] reCAPTCHA verify failed:', verify.errorCodes)
      return NextResponse.json(
        { success: false, error: 'Spam check failed. Please reload the page and try again.' },
        { status: 400 },
      )
    }

    const score = verify.score
    if (score < RECAPTCHA_REJECT_THRESHOLD) {
      console.warn(
        `[api/inquiries] rejected by reCAPTCHA score=${score} ip=${ip ?? 'unknown'}`,
      )
      return NextResponse.json(
        { success: false, error: 'Submission blocked by spam filter.' },
        { status: 400 },
      )
    }

    const inquiryStatus: 'new' | 'on_hold' = score < RECAPTCHA_REVIEW_THRESHOLD ? 'on_hold' : 'new'

    // ── 4. (선택) 파일 업로드 → media 컬렉션 ────────────────────
    let rfpFileId: number | undefined
    if (file) {
      // 파일 검증
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'File exceeds 20MB limit.' },
          { status: 400 },
        )
      }
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!ALLOWED_FILE_EXTS.includes(ext)) {
        return NextResponse.json(
          { success: false, error: `Unsupported file type: .${ext}` },
          { status: 400 },
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const created = await payload.create({
        collection: 'media',
        data: { alt: `RFP — ${input.companyName}` },
        file: {
          data: buffer,
          mimetype: file.type || 'application/octet-stream',
          name: file.name,
          size: file.size,
        },
        // Media.access.create 는 인증 유저만 허용. 본 서버 라우트는 신뢰
        // 컨텍스트이므로 access 우회.
        overrideAccess: true,
      })
      rfpFileId = created.id
    }

    // ── 5. inquiries 레코드 생성 ─────────────────────────────────
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        company: input.companyName,
        contactName: input.contactName,
        jobTitle: input.jobTitle || undefined,
        phone: input.phone,
        email: input.email,
        projectOverview: input.projectOverview,
        websiteUrl: input.website || undefined,
        launchDate: input.launchDate || undefined,
        rfpFile: rfpFileId,
        status: inquiryStatus,
        recaptchaScore: score,
        submittedLocale,
        ipAddress: ip,
      },
    })

    // ── 6. 메일 발송 (Resend) ───────────────────────────────────
    // fire-and-forget. 실패해도 사용자 응답 차단 안 함 — DB 저장은 이미 성공.
    try {
      await sendInquiryEmails({
        inquiryId: inquiry.id,
        company: input.companyName,
        contactName: input.contactName,
        jobTitle: input.jobTitle || undefined,
        email: input.email,
        phone: input.phone,
        projectOverview: input.projectOverview,
        websiteUrl: input.website || undefined,
        launchDate: input.launchDate || undefined,
        submittedLocale,
        recaptchaScore: score,
        status: inquiryStatus,
        hasRfpFile: Boolean(rfpFileId),
        ipAddress: ip,
      })
    } catch (mailErr) {
      console.error('[api/inquiries] sendInquiryEmails threw:', mailErr)
    }

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/inquiries] error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

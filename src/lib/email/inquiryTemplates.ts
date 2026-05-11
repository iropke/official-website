/**
 * Project Inquiry — 20-locale plain-text email templates.
 *
 * 두 종류의 메일:
 *   (1) 신청자 확인 메일 (confirmation)
 *       제출자(input.email)에게 자동 회신. submittedLocale 기준 20-locale 분기.
 *       미매칭 시 영문 fallback (defensive — 라우트가 isLocale 통과 후 호출).
 *   (2) 어드민 알림 메일 (adminNotification)
 *       hello@iropke.com (또는 INQUIRY_TO_EMAIL) 으로 발송. 한국어 단일 —
 *       운영팀이 모든 inquiry 를 한 언어로 일관되게 처리하기 위함.
 *       submittedLocale 은 메타 라인으로만 노출.
 *
 * 톤: plain-text (HTML 미사용). multi-byte / RTL 안전.
 */

import { type Locale } from '@/i18n/locales'

// ─────────────────────────────────────────────────────────────────────────
// (1) 신청자 확인 메일 — 20 locale
// ─────────────────────────────────────────────────────────────────────────

interface ConfirmationStrings {
  subject: string
  /** {name} placeholder → contactName 으로 치환 */
  greeting: string
  body: string
  signature: string
}

const CONFIRMATION: Record<Locale, ConfirmationStrings> = {
  en: {
    subject: 'We received your project inquiry — Iropke',
    greeting: 'Dear {name},',
    body: 'Your project inquiry has been received. Our team will review it shortly and respond by email.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  zh: {
    subject: '已收到您的项目咨询 — Iropke',
    greeting: '{name} 您好，',
    body: '您的项目咨询已成功提交。我们的团队会尽快审阅并通过电子邮件回复您。',
    signature: '—\nIropke\nhello@iropke.com',
  },
  ja: {
    subject: 'プロジェクトのお問い合わせを受け付けました — Iropke',
    greeting: '{name} 様',
    body: 'プロジェクトのお問い合わせを受け付けました。担当者が確認の上、メールにてご返信いたします。',
    signature: '—\nIropke\nhello@iropke.com',
  },
  de: {
    subject: 'Ihre Projektanfrage ist bei uns eingegangen — Iropke',
    greeting: 'Sehr geehrte/r {name},',
    body: 'Ihre Projektanfrage wurde erfolgreich übermittelt. Unser Team prüft Ihre Anfrage in Kürze und antwortet Ihnen per E-Mail.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  fr: {
    subject: 'Votre demande de projet a bien été reçue — Iropke',
    greeting: 'Bonjour {name},',
    body: "Votre demande de projet a bien été enregistrée. Notre équipe l'examinera rapidement et vous répondra par e-mail.",
    signature: '—\nIropke\nhello@iropke.com',
  },
  es: {
    subject: 'Hemos recibido su consulta de proyecto — Iropke',
    greeting: 'Estimado/a {name}:',
    body: 'Hemos recibido correctamente su consulta de proyecto. Nuestro equipo la revisará en breve y le responderá por correo electrónico.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  ko: {
    subject: '프로젝트 문의가 접수되었습니다 — Iropke',
    greeting: '{name} 님께',
    body: '프로젝트 문의가 정상적으로 등록되었습니다. 담당자가 빠르게 검토 후 이메일로 회신하겠습니다.',
    signature: '—\nIropke 드림\nhello@iropke.com',
  },
  pt: {
    subject: 'A sua consulta de projeto foi recebida — Iropke',
    greeting: 'Caro/a {name},',
    body: 'A sua consulta de projeto foi recebida com sucesso. A nossa equipa irá analisá-la em breve e responderá por e-mail.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  hi: {
    subject: 'आपकी प्रोजेक्ट पूछताछ प्राप्त हुई — Iropke',
    greeting: 'नमस्ते {name},',
    body: 'आपकी प्रोजेक्ट पूछताछ सफलतापूर्वक प्राप्त हुई है। हमारी टीम जल्द ही इसकी समीक्षा करेगी और ईमेल द्वारा उत्तर देगी।',
    signature: '—\nIropke\nhello@iropke.com',
  },
  ru: {
    subject: 'Ваш запрос по проекту получен — Iropke',
    greeting: 'Здравствуйте, {name}!',
    body: 'Ваш запрос по проекту успешно принят. Наша команда рассмотрит его в ближайшее время и ответит по электронной почте.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  nl: {
    subject: 'We hebben uw projectaanvraag ontvangen — Iropke',
    greeting: 'Beste {name},',
    body: 'Uw projectaanvraag is succesvol ontvangen. Ons team zal deze spoedig beoordelen en per e-mail reageren.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  it: {
    subject: 'Abbiamo ricevuto la sua richiesta di progetto — Iropke',
    greeting: 'Gentile {name},',
    body: 'La sua richiesta di progetto è stata ricevuta correttamente. Il nostro team la esaminerà a breve e le risponderà via email.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  ar: {
    subject: 'تم استلام استفسارك بشأن المشروع — Iropke',
    greeting: 'عزيزي/عزيزتي {name},',
    body: 'تم استلام استفسارك بشأن المشروع بنجاح. سيقوم فريقنا بمراجعته قريبًا والرد عبر البريد الإلكتروني.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  sv: {
    subject: 'Vi har mottagit din projektförfrågan — Iropke',
    greeting: 'Hej {name},',
    body: 'Din projektförfrågan har tagits emot. Vårt team kommer att granska den inom kort och svara via e-post.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  th: {
    subject: 'เราได้รับคำขอโครงการของคุณแล้ว — Iropke',
    greeting: 'เรียน คุณ {name}',
    body: 'ได้รับคำขอโครงการของคุณเรียบร้อยแล้ว ทีมงานของเราจะตรวจสอบในเร็วๆ นี้และตอบกลับทางอีเมล',
    signature: '—\nIropke\nhello@iropke.com',
  },
  pl: {
    subject: 'Otrzymaliśmy Twoje zapytanie projektowe — Iropke',
    greeting: 'Szanowny/a {name},',
    body: 'Twoje zapytanie projektowe zostało pomyślnie przyjęte. Nasz zespół wkrótce je rozpatrzy i odpowie e-mailem.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  id: {
    subject: 'Kami telah menerima permintaan proyek Anda — Iropke',
    greeting: 'Yth. {name},',
    body: 'Permintaan proyek Anda telah berhasil diterima. Tim kami akan segera meninjaunya dan membalas melalui email.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  ms: {
    subject: 'Kami telah menerima pertanyaan projek anda — Iropke',
    greeting: 'Yang dihormati {name},',
    body: 'Pertanyaan projek anda telah berjaya diterima. Pasukan kami akan menyemaknya tidak lama lagi dan membalas melalui e-mel.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  da: {
    subject: 'Vi har modtaget din projektforespørgsel — Iropke',
    greeting: 'Kære {name},',
    body: 'Din projektforespørgsel er modtaget. Vores team gennemgår den snarest og svarer dig på e-mail.',
    signature: '—\nIropke\nhello@iropke.com',
  },
  tr: {
    subject: 'Proje talebinizi aldık — Iropke',
    greeting: 'Sayın {name},',
    body: 'Proje talebiniz başarıyla alındı. Ekibimiz kısa süre içinde talebinizi inceleyip e-posta ile yanıt verecektir.',
    signature: '—\nIropke\nhello@iropke.com',
  },
}

export interface ConfirmationInput {
  locale: Locale
  contactName: string
}

/** 신청자 확인 메일 본문(plain-text). subject + body 반환. */
export function buildConfirmationEmail(input: ConfirmationInput): {
  subject: string
  text: string
} {
  const t = CONFIRMATION[input.locale] ?? CONFIRMATION.en
  const greeting = t.greeting.replace('{name}', input.contactName.trim() || '—')
  const text = `${greeting}\n\n${t.body}\n\n${t.signature}\n`
  return { subject: t.subject, text }
}

// ─────────────────────────────────────────────────────────────────────────
// (2) 어드민 알림 메일 — 한국어 단일
// ─────────────────────────────────────────────────────────────────────────

export interface AdminNotificationInput {
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
  adminBaseUrl?: string
}

/** 어드민 알림 메일 본문(plain-text). 한국어 단일. */
export function buildAdminNotificationEmail(input: AdminNotificationInput): {
  subject: string
  text: string
} {
  const statusLabel = input.status === 'on_hold' ? '보류 (reCAPTCHA 점수 낮음)' : '신규 접수'
  const subject = `[Iropke 문의] ${input.company} — ${input.contactName} (${input.submittedLocale})`

  const lines: string[] = [
    `프로젝트 문의가 새로 접수되었습니다.`,
    ``,
    `── 회사 / 담당자 ──`,
    `회사명: ${input.company}`,
    `담당자: ${input.contactName}${input.jobTitle ? ` (${input.jobTitle})` : ''}`,
    `이메일: ${input.email}`,
    `연락처: ${input.phone}`,
    ``,
    `── 프로젝트 ──`,
    `개요:`,
    input.projectOverview,
    ``,
  ]

  if (input.websiteUrl) lines.push(`현재 웹사이트: ${input.websiteUrl}`)
  if (input.launchDate) lines.push(`희망 런칭일: ${input.launchDate}`)
  lines.push(`RFP 첨부: ${input.hasRfpFile ? '있음' : '없음'}`)
  lines.push(``)

  lines.push(`── 메타 ──`)
  lines.push(`처리 상태: ${statusLabel}`)
  lines.push(`제출 언어: ${input.submittedLocale}`)
  lines.push(`reCAPTCHA: ${input.recaptchaScore.toFixed(2)}`)
  if (input.ipAddress) lines.push(`IP: ${input.ipAddress}`)
  lines.push(``)

  if (input.adminBaseUrl) {
    lines.push(`── 어드민 ──`)
    lines.push(`${input.adminBaseUrl}/admin/collections/inquiries/${input.inquiryId}`)
    lines.push(``)
  }

  lines.push(`—`)
  lines.push(`Iropke 운영 알림`)

  return { subject, text: lines.join('\n') + '\n' }
}

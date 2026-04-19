import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'contactName', 'email', 'status', 'createdAt'],
    group: '운영',
    description: '프로젝트 문의 접수 내역 (읽기 전용)',
  },
  access: {
    // 공개 접근 차단 — Admin만 조회 가능
    read: ({ req }) => {
      if (req.user) return true
      return false
    },
    // API를 통한 외부 생성은 허용 (프론트 폼 제출)
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ─── 회사 / 담당자 정보 ────────────────────────────────────
    {
      name: 'company',
      type: 'text',
      label: '회사명 (Company Name)',
      required: true,
    },
    {
      name: 'contactName',
      type: 'text',
      label: '담당자명 (Name)',
      required: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
      label: '직책 (Job Title)',
    },
    {
      name: 'phone',
      type: 'text',
      label: '연락처 (Contact Number)',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: '이메일 (Email Address)',
      required: true,
    },

    // ─── 프로젝트 정보 ─────────────────────────────────────────
    {
      name: 'projectOverview',
      type: 'textarea',
      label: '프로젝트 개요 (Project Overview)',
      required: true,
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: '현재 웹사이트 URL',
    },
    {
      name: 'launchDate',
      type: 'text',
      label: '희망 런칭일 (YYYY-MM-DD)',
    },
    {
      name: 'rfpFile',
      type: 'upload' as const,
      label: 'RFP 파일',
      relationTo: 'media',
      admin: {
        description: 'PPT/Word/PDF/ZIP, 최대 20MB',
      },
    },

    // ─── 처리 상태 ─────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      label: '처리 상태',
      defaultValue: 'new',
      options: [
        { label: '신규 접수', value: 'new' },
        { label: '검토 중', value: 'reviewing' },
        { label: '회신 완료', value: 'replied' },
        { label: '보류', value: 'on_hold' },
        { label: '완료', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'adminNote',
      type: 'textarea',
      label: '내부 메모 (Admin Only)',
      admin: {
        position: 'sidebar',
        description: '담당자 내부 처리 메모 — 외부에 노출되지 않음',
      },
    },

    // ─── reCAPTCHA ────────────────────────────────────────────
    {
      name: 'recaptchaScore',
      type: 'number',
      label: 'reCAPTCHA 점수',
      admin: {
        position: 'sidebar',
        description: '0.0 ~ 1.0 (0.5 미만 시 스팸 의심)',
        readOnly: true,
      },
    },

    // ─── 수신 메타 ─────────────────────────────────────────────
    {
      name: 'submittedLocale',
      type: 'text',
      label: '제출 언어',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '폼 제출 시 사용자 언어',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP 주소',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
    admin: {
        useAsTitle: 'company',
            defaultColumns: ['company', 'contactName', 'email', 'status', 'createdAt'],
                group: '운영',
                  },
                    access: {
                        read: ({ req }) => Boolean(req.user),
                            create: () => true,
                                update: ({ req }) => Boolean(req.user),
                                    delete: ({ req }) => Boolean(req.user),
                                      },
                                        fields: [
                                            { name: 'company', type: 'text', label: '회사명', required: true },
                                                { name: 'contactName', type: 'text', label: '담당자명', required: true },
                                                    { name: 'jobTitle', type: 'text', label: '직책' },
                                                        { name: 'phone', type: 'text', label: '연락처', required: true },
                                                            { name: 'email', type: 'email', label: '이메일', required: true },
                                                                { name: 'projectOverview', type: 'textarea', label: '프로젝트 개요', required: true },
                                                                    { name: 'websiteUrl', type: 'text', label: '현재 웹사이트 URL' },
                                                                        { name: 'launchDate', type: 'text', label: '희망 런칭일 (YYYY-MM-DD)' },
                                                                            { name: 'rfpFile', type: 'upload' as const, label: 'RFP 파일', relationTo: 'media' },
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
                                                                                                                                                                  admin: { position: 'sidebar' },
                                                                                                                                                                      },
                                                                                                                                                                          {
                                                                                                                                                                                name: 'adminNote',
                                                                                                                                                                                      type: 'textarea',
                                                                                                                                                                                            label: '내부 메모 (Admin Only)',
                                                                                                                                                                                                  admin: { position: 'sidebar' },
                                                                                                                                                                                                      },
                                                                                                                                                                                                          {
                                                                                                                                                                                                                name: 'recaptchaScore',
                                                                                                                                                                                                                      type: 'number',
                                                                                                                                                                                                                            label: 'reCAPTCHA 점수',
                                                                                                                                                                                                                                  admin: { position: 'sidebar', readOnly: true },
                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                          {
                                                                                                                                                                                                                                                name: 'submittedLocale',
                                                                                                                                                                                                                                                      type: 'text',
                                                                                                                                                                                                                                                            label: '제출 언어',
                                                                                                                                                                                                                                                                  admin: { position: 'sidebar', readOnly: true },
                                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                                          {
                                                                                                                                                                                                                                                                                name: 'ipAddress',
                                                                                                                                                                                                                                                                                      type: 'text',
                                                                                                                                                                                                                                                                                            label: 'IP 주소',
                                                                                                                                                                                                                                                                                                  admin: { position: 'sidebar', readOnly: true },
                                                                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                                                                        ],
                                                                                                                                                                                                                                                                                                        }
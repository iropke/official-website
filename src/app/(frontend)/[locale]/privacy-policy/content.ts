/**
 * Privacy Policy 콘텐츠 사전 (정적 JSX 렌더용 데이터).
 *
 * 결정 사항:
 *   본 단계에서는 Payload Pages 컬렉션이 아니라 정적 사전 + 페이지 컴포넌트로
 *   구현. 이유:
 *   - 법적 문서이므로 변경 이력 추적이 git 으로 명확
 *   - Pages 컬렉션의 Lexical layout 으로는 14개 anchor 섹션 구조 표현이 번거로움
 *   - 추후 admin 에서 직접 편집해야 한다는 요구사항 발생 시 Pages 로 마이그레이션 가능
 *
 * 기획서: references/requirements/iropke_privacy_policy.md
 * locale 정책: ko / en 만 큐레이션, 나머지 7개는 영문 fallback (TODO).
 */

import type { SupportedLocale } from '@/i18n/locales'

export interface PrivacySection {
  /** anchor href 에 그대로 사용되는 id (기획서의 Anchor ID 와 동일) */
  anchorId: string
  /** TOC 와 본문 제목 */
  title: string
  /** 단락 (각 string 이 <p>) */
  paragraphs?: string[]
  /** bullet list 항목 */
  bullets?: string[]
}

export interface PrivacyPolicyCopy {
  pageTitle: string
  pageMetaDescription: string
  tocLabel: string
  lastUpdatedLabel: string
  lastUpdated: string
  contactEmail: string
  contactEmailLabel: string
  sections: PrivacySection[]
}

const en: PrivacyPolicyCopy = {
  pageTitle: 'Privacy Policy',
  pageMetaDescription:
    'How IROPKE collects, uses, and protects your personal data, aligned with GDPR and CCPA.',
  tocLabel: 'Table of contents',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: '2026-05-08',
  contactEmail: 'privacy@iropke.com',
  contactEmailLabel: 'Email us',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'We are committed to protecting your personal data and ensuring transparency in how we collect, use, and manage information.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Data We Collect',
      paragraphs: ['We may collect:'],
      bullets: [
        'Personal identification data (name, email)',
        'Usage data (pages visited, interactions)',
        'Device and technical data (IP, browser type)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'How We Use Data',
      paragraphs: ['We use data to:'],
      bullets: [
        'Provide and improve services',
        'Communicate with users',
        'Ensure security',
        'Comply with legal obligations',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Legal Basis (GDPR)',
      paragraphs: ['Under GDPR, we process data based on:'],
      bullets: [
        'Consent',
        'Contractual necessity',
        'Legal obligations',
        'Legitimate interests',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Data Sharing',
      paragraphs: ['We may share data with:'],
      bullets: [
        'Service providers',
        'Legal authorities when required',
        'Partners under strict agreements',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'International Transfers',
      paragraphs: [
        'Data may be transferred outside the EU. We ensure safeguards such as:',
      ],
      bullets: ['Standard Contractual Clauses (SCC)', 'Adequacy decisions'],
    },
    {
      anchorId: 'data-retention',
      title: 'Data Retention',
      paragraphs: ['We retain data only as long as necessary for:'],
      bullets: ['Service provision', 'Legal compliance', 'Business purposes'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Your Rights (EU)',
      paragraphs: ['Under GDPR, users have rights to:'],
      bullets: [
        'Access data',
        'Correct data',
        'Delete data',
        'Restrict processing',
        'Data portability',
        'Withdraw consent',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Your Rights (California)',
      paragraphs: ['Under CCPA/CPRA:'],
      bullets: [
        'Right to know',
        'Right to delete',
        'Right to opt-out of sale',
        'Right to non-discrimination',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies & Tracking',
      paragraphs: ['We use cookies for:'],
      bullets: ['Analytics', 'Performance', 'Personalization'],
    },
    {
      anchorId: 'security',
      title: 'Security Measures',
      paragraphs: ['We implement:'],
      bullets: ['Encryption', 'Access control', 'Monitoring systems'],
    },
    {
      anchorId: 'children',
      title: "Children's Privacy",
      paragraphs: ['We do not knowingly collect data from children under 13.'],
    },
    {
      anchorId: 'updates',
      title: 'Updates to Policy',
      paragraphs: ['We may update this policy periodically.'],
    },
    {
      anchorId: 'contact',
      title: 'Contact Information',
      paragraphs: ['For inquiries:'],
    },
  ],
}

const ko: PrivacyPolicyCopy = {
  pageTitle: '개인정보처리방침',
  pageMetaDescription:
    'IROPKE 가 개인정보를 수집·이용·보관하는 방식과 사용자 권리 안내. GDPR / CCPA 기준 준수.',
  tocLabel: '목차',
  lastUpdatedLabel: '최종 업데이트',
  lastUpdated: '2026-05-08',
  contactEmail: 'privacy@iropke.com',
  contactEmailLabel: '이메일로 문의',
  sections: [
    {
      anchorId: 'introduction',
      title: '소개',
      paragraphs: [
        '저희는 사용자의 개인정보 보호와 처리 과정의 투명성 확보를 약속합니다.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: '수집 항목',
      paragraphs: ['수집할 수 있는 정보:'],
      bullets: [
        '신원 정보 (이름, 이메일)',
        '이용 정보 (방문 페이지, 상호작용 기록)',
        '기기 및 기술 정보 (IP, 브라우저 유형)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: '이용 목적',
      paragraphs: ['수집한 정보는 다음 목적으로 사용됩니다.'],
      bullets: [
        '서비스 제공 및 개선',
        '사용자 소통',
        '보안 유지',
        '법적 의무 준수',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: '법적 근거 (GDPR)',
      paragraphs: ['GDPR 에 따라 다음 근거로 처리합니다.'],
      bullets: ['동의', '계약 이행', '법적 의무', '정당한 이익'],
    },
    {
      anchorId: 'data-sharing',
      title: '제3자 제공',
      paragraphs: ['다음 대상에게 정보를 제공할 수 있습니다.'],
      bullets: [
        '서비스 제공 업체',
        '법적 요구가 있는 경우 관계 당국',
        '엄격한 계약 하의 파트너',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: '국외 이전',
      paragraphs: [
        'EU 외부로 정보가 이전될 수 있습니다. 다음 보호 장치를 적용합니다.',
      ],
      bullets: ['표준 계약 조항(SCC)', '적정성 결정'],
    },
    {
      anchorId: 'data-retention',
      title: '보유 기간',
      paragraphs: ['다음 목적에 필요한 기간 동안만 보관합니다.'],
      bullets: ['서비스 제공', '법적 준수', '업무 목적'],
    },
    {
      anchorId: 'eu-rights',
      title: '사용자 권리 (EU)',
      paragraphs: ['GDPR 에 따라 다음 권리를 행사할 수 있습니다.'],
      bullets: [
        '열람권',
        '정정권',
        '삭제권',
        '처리 제한권',
        '데이터 이동권',
        '동의 철회권',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: '사용자 권리 (캘리포니아)',
      paragraphs: ['CCPA / CPRA 에 따라 다음 권리를 행사할 수 있습니다.'],
      bullets: [
        '열람권',
        '삭제권',
        '판매 거부권',
        '차별 받지 않을 권리',
      ],
    },
    {
      anchorId: 'cookies',
      title: '쿠키 및 추적',
      paragraphs: ['다음 목적으로 쿠키를 사용합니다.'],
      bullets: ['분석', '성능 측정', '개인화'],
    },
    {
      anchorId: 'security',
      title: '보안 조치',
      paragraphs: ['다음 조치를 시행합니다.'],
      bullets: ['암호화', '접근 통제', '모니터링 시스템'],
    },
    {
      anchorId: 'children',
      title: '아동 개인정보',
      paragraphs: ['만 13세 미만 아동의 정보를 의도적으로 수집하지 않습니다.'],
    },
    {
      anchorId: 'updates',
      title: '방침 변경',
      paragraphs: ['본 방침은 주기적으로 업데이트될 수 있습니다.'],
    },
    {
      anchorId: 'contact',
      title: '문의처',
      paragraphs: ['문의는 다음 이메일로 부탁드립니다.'],
    },
  ],
}

const dictionaries: Partial<Record<SupportedLocale, PrivacyPolicyCopy>> = {
  ko,
  en,
  // TODO: ja / es / ru / de / fr / zh / ar 번역은 Phase B 에서 추가
}

export function getPrivacyPolicy(locale: SupportedLocale): PrivacyPolicyCopy {
  return dictionaries[locale] ?? en
}

/**
 * 쿠키 동의 UI 카피 사전.
 * 기획서: references/requirements/iropke_cookie_consent_ui.md
 * locale 정책: ko/en 큐레이션, 나머지 7개 영문 fallback (TODO Phase B).
 */

import type { SupportedLocale } from '@/i18n/locales'

export interface CookieCategoryCopy {
  title: string
  description: string
}

export interface CookieConsentCopy {
  bannerMessage: string
  acceptAll: string
  rejectAll: string
  managePreferences: string
  modalTitle: string
  modalIntro: string
  savePreferences: string
  closeLabel: string
  alwaysOn: string
  categories: {
    necessary: CookieCategoryCopy
    analytics: CookieCategoryCopy
    marketing: CookieCategoryCopy
    functional: CookieCategoryCopy
  }
}

const en: CookieConsentCopy = {
  bannerMessage:
    'We use cookies to improve your experience, analyze traffic, and personalize content.',
  acceptAll: 'Accept All',
  rejectAll: 'Reject All',
  managePreferences: 'Manage Preferences',
  modalTitle: 'Cookie Preferences',
  modalIntro:
    'Choose which categories of cookies you allow. Necessary cookies are always active.',
  savePreferences: 'Save Preferences',
  closeLabel: 'Close',
  alwaysOn: 'Always on',
  categories: {
    necessary: {
      title: 'Necessary',
      description: 'Required for site functionality. Cannot be disabled.',
    },
    analytics: {
      title: 'Analytics',
      description: 'Tracks usage and performance to help us improve the site.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Used for ad personalization and tracking.',
    },
    functional: {
      title: 'Functional',
      description: 'Enhances usability such as remembering preferences.',
    },
  },
}

const ko: CookieConsentCopy = {
  bannerMessage:
    '저희는 사용자 경험 향상, 트래픽 분석, 콘텐츠 개인화를 위해 쿠키를 사용합니다.',
  acceptAll: '모두 허용',
  rejectAll: '모두 거부',
  managePreferences: '설정 관리',
  modalTitle: '쿠키 환경설정',
  modalIntro:
    '허용할 쿠키 카테고리를 선택해 주세요. 필수 쿠키는 항상 활성화되어 있습니다.',
  savePreferences: '설정 저장',
  closeLabel: '닫기',
  alwaysOn: '항상 켜짐',
  categories: {
    necessary: {
      title: '필수',
      description: '사이트 기본 기능에 반드시 필요합니다. 비활성화할 수 없습니다.',
    },
    analytics: {
      title: '분석',
      description: '사이트 개선을 위해 이용 패턴과 성능을 측정합니다.',
    },
    marketing: {
      title: '마케팅',
      description: '광고 개인화 및 추적에 사용됩니다.',
    },
    functional: {
      title: '기능',
      description: '환경설정 기억 등 사용 편의 기능에 사용됩니다.',
    },
  },
}

const dictionaries: Partial<Record<SupportedLocale, CookieConsentCopy>> = {
  ko,
  en,
  // TODO: ja / es / ru / de / fr / zh / ar — Phase B 번역 단계에서 추가
}

export function getCookieConsentCopy(locale: SupportedLocale): CookieConsentCopy {
  return dictionaries[locale] ?? en
}

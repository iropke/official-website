/**
 * 오류 페이지 (404 / 500 / 503 / 403) 의 locale 별 카피.
 *
 * 기획서: references/requirements/iropke_error.md
 *   - "위트 있되 어린 톤은 아니어야 함"
 *   - "차분, 신뢰 유지, 명확한 복귀 동선"
 *
 * 현재 ko/en 만 큐레이션. 나머지 7개 locale 은 영문 카피로 fallback (TODO).
 */

import type { SupportedLocale } from '@/i18n/locales'

export type ErrorKind = '404' | '500' | '503' | '403'

export interface ErrorCopy {
  title: string
  witty: string
  description: string
  homeLabel: string
  backLabel: string
  contactLabel: string
  hintPrefix: string
}

const en: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Page Not Found',
    witty: 'I understand that feeling too. Getting lost happens.',
    description:
      'The page you were looking for may have been moved, renamed, or no longer exists.',
    homeLabel: 'Home',
    backLabel: 'Go Back',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '500': {
    title: 'Internal Server Error',
    witty: 'Something behind the curtain seems to be having a moment.',
    description:
      'Something went wrong on our side while processing your request.',
    homeLabel: 'Home',
    backLabel: 'Try Again',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '503': {
    title: 'Service Unavailable',
    witty: 'We are briefly unavailable. Even systems need a breath.',
    description:
      'The service is temporarily unavailable. Please try again in a few moments.',
    homeLabel: 'Home',
    backLabel: 'Try Again',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '403': {
    title: 'Access Denied',
    witty: 'This door seems to require a different key.',
    description: 'You do not currently have permission to access this page.',
    homeLabel: 'Home',
    backLabel: 'Go Back',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
}

const ko: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: '페이지를 찾을 수 없습니다',
    witty: '길을 잃는 일은 누구에게나 있습니다.',
    description:
      '찾으시는 페이지가 이동되었거나 이름이 바뀌었을 수 있습니다. 또는 더 이상 존재하지 않을 수 있습니다.',
    homeLabel: '홈으로',
    backLabel: '이전 페이지',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '500': {
    title: '서버 오류',
    witty: '커튼 뒤편에서 잠시 문제가 생긴 것 같습니다.',
    description: '요청을 처리하는 중에 문제가 발생했습니다.',
    homeLabel: '홈으로',
    backLabel: '다시 시도',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '503': {
    title: '서비스 점검 중',
    witty: '잠시 숨을 고르는 중입니다.',
    description: '서비스가 일시적으로 이용 불가합니다. 잠시 후 다시 시도해 주세요.',
    homeLabel: '홈으로',
    backLabel: '다시 시도',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '403': {
    title: '접근 권한 없음',
    witty: '이 문은 다른 열쇠를 필요로 합니다.',
    description: '이 페이지에 접근할 권한이 없습니다.',
    homeLabel: '홈으로',
    backLabel: '이전 페이지',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
}

const dictionaries: Partial<Record<SupportedLocale, Record<ErrorKind, ErrorCopy>>> = {
  ko,
  en,
  // TODO: ja / es / ru / de / fr / zh / ar 카피는 번역 단계에서 추가.
  //       Phase B 에서 admin UI 의 번역 API 가 활성화되면 일괄 처리 예정.
}

export function getErrorCopy(
  locale: SupportedLocale,
  kind: ErrorKind,
): ErrorCopy {
  return dictionaries[locale]?.[kind] ?? en[kind]
}

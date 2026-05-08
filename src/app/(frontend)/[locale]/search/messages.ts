/**
 * 검색 결과 페이지 카피 사전.
 * ko/en 큐레이션, 나머지 7개 locale 영문 fallback (TODO: Phase B 번역).
 */

import type { SupportedLocale } from '@/i18n/locales'

export interface SearchCopy {
  pageTitle: string
  pageMetaDescription: string
  inputPlaceholder: string
  searchButton: string
  emptyQueryPrompt: string
  resultsForPrefix: string
  countOne: (n: number) => string
  countMany: (n: number) => string
  countZero: (q: string) => string
  emptyHelpTitle: string
  emptyHelpItems: string[]
  emptyHelpSuggestionsTitle: string
  suggestInsights: string
  suggestProjectInquiry: string
  typeLabels: { post: string; page: string }
  cardDateLabel: string
}

const en: SearchCopy = {
  pageTitle: 'Search',
  pageMetaDescription:
    'Search across IROPKE insights, services, and policy pages.',
  inputPlaceholder: 'Search the site',
  searchButton: 'Search',
  emptyQueryPrompt: 'Enter a keyword to search the site.',
  resultsForPrefix: 'Results for',
  countOne: () => '1 result found',
  countMany: (n) => `${n} results found`,
  countZero: (q) => `No results found for "${q}"`,
  emptyHelpTitle: 'Try',
  emptyHelpItems: [
    'checking spelling',
    'using fewer keywords',
    'searching with broader terms',
  ],
  emptyHelpSuggestionsTitle: 'You may also be looking for',
  suggestInsights: 'Visit Insights',
  suggestProjectInquiry: 'Go to Project Inquiry',
  typeLabels: { post: 'Article', page: 'Page' },
  cardDateLabel: 'Published',
}

const ko: SearchCopy = {
  pageTitle: '검색',
  pageMetaDescription: 'IROPKE 인사이트, 서비스, 정책 페이지를 검색합니다.',
  inputPlaceholder: '사이트 검색',
  searchButton: '검색',
  emptyQueryPrompt: '검색어를 입력해 주세요.',
  resultsForPrefix: '검색어',
  countOne: () => '1건의 결과',
  countMany: (n) => `${n}건의 결과`,
  countZero: (q) => `"${q}" 에 대한 결과가 없습니다`,
  emptyHelpTitle: '아래를 시도해 보세요',
  emptyHelpItems: [
    '맞춤법 확인',
    '키워드 수 줄이기',
    '더 일반적인 단어로 검색',
  ],
  emptyHelpSuggestionsTitle: '이런 페이지는 어떠세요',
  suggestInsights: '인사이트 보기',
  suggestProjectInquiry: '프로젝트 문의하기',
  typeLabels: { post: '글', page: '페이지' },
  cardDateLabel: '게시일',
}

const dictionaries: Partial<Record<SupportedLocale, SearchCopy>> = {
  ko,
  en,
  // TODO: ja / es / ru / de / fr / zh / ar 카피는 Phase B 에서 추가
}

export function getSearchCopy(locale: SupportedLocale): SearchCopy {
  return dictionaries[locale] ?? en
}

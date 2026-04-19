# 이롭게 홈페이지 개편 — 요구사항 정의서

> Payload CMS 3.x + Next.js 기반으로 개편할 이롭게 홈페이지의 요구사항을 정의한 문서입니다.
> 이 문서는 프로젝트 진행 중 지속적으로 업데이트하며, 개발 지침으로 활용합니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 이롭게 홈페이지 개편 |
| 기술 스택 | Payload CMS 3.x, Next.js 15 (App Router), React, TypeScript |
| 데이터베이스 | Supabase PostgreSQL |
| 배포 환경 | Vercel |
| 관리자 페이지 | Payload Admin Panel (`/admin`) |

---

## 2. 다국어 지원 (Localization)

| 항목 | 내용 |
|------|------|
| 지원 언어 | 한국어(ko), 영어(en), 스페인어(es), 러시아어(ru), 독일어(de), 프랑스어(fr), **중국어(zh), 아랍어(ar)** |
| 기본 언어 | 한국어 (ko) |
| 적용 범위 | 모든 콘텐츠(게시글, 메뉴, 페이지)는 Payload Localization으로 관리 |
| 프론트엔드 라우팅 | URL prefix 방식 — `/ko/...`, `/en/...`, `/zh/...`, `/ar/...` 등 |
| UI 라벨 | `next-intl` 또는 `next-i18next`로 정적 텍스트 번역 관리 |
| 언어 전환 | 헤더에 언어 선택 드롭다운 UI 제공 |
| **RTL 레이아웃** | **아랍어(ar)는 우→좌(RTL) 언어** — HTML `dir="rtl"` + Tailwind CSS `rtl:` variant 전면 적용 |

### 참고 사항
- Payload Admin Panel 내에서 각 언어별 콘텐츠를 탭으로 전환하며 편집 가능
- URL path는 언어 간 동일하게 유지 — `slug` 필드를 공유하고 locale prefix(`/ko/`, `/en/`)로만 구분

### zh/ar locale 추가 사이드 이펙트

| 영향 범위 | 세부 내용 | 대응 방안 |
|-----------|----------|----------|
| **아랍어 RTL 레이아웃** | 텍스트 방향, flex 방향, 내비게이션, 아이콘, padding/margin 전체 미러링 필요 | Phase 1부터 Tailwind `rtl:` variant 적용, `<html dir>` 동적 전환 |
| 웹폰트 추가 | 중국어: Noto Sans SC, 아랍어: Cairo 또는 Noto Sans Arabic | Google Fonts CDN 또는 self-hosting으로 추가 |
| 언어 선택 UI | 헤더 드롭다운에 zh(中文), ar(العربية) 항목 추가 | Phase 5에서 UI 라벨 확장 |
| Sitemap | sitemap-zh.xml, sitemap-ar.xml 2개 파일 추가 | §5-11 참조 |
| 번역 API | DeepL은 아랍어 미지원 → Claude Haiku API로 통일 | §5-13 참조 |
| 월 번역량 | 6→7개 번역 대상 언어로 증가 (비용 소폭 상승) | §8 비용 참조 |

### Fallback 및 언어별 노출 정책

| 상황 | 동작 |
|------|------|
| 콘텐츠가 해당 언어로 번역됨 | 정상 표시 |
| 콘텐츠가 미번역 (번역 예정) | 기본 언어(영문) fallback 표시 + 상단 안내 배너 ("This content is not yet available in your language.") |
| 콘텐츠가 의도적으로 비노출 | 해당 언어 목록에서 숨김. 직접 URL 접근 시 404 처리 |

#### Payload 구현 방식
- 게시물마다 `publishedLocales` 필드로 언어별 공개 상태 제어 (공개 / 미공개 / fallback 허용)
- 프론트엔드에서 목록 조회 시 `publishedLocales`에 현재 언어가 포함된 콘텐츠만 표시
- 특정 언어에 의도적으로 노출하지 않는 콘텐츠는 해당 locale을 `publishedLocales`에서 제외

---

## 3. 프론트엔드 요구사항

### 3-1. 반응형 웹

| Breakpoint | 대상 기기 | 기준 너비 |
|------------|-----------|-----------|
| Desktop | PC, 노트북 | 1280px 이상 |
| Tablet-wide | 큰 태블릿 | 1024px ~ 1279px |
| Tablet | iPad 등 태블릿 | 768px ~ 1023px |
| Mobile | 스마트폰 | 480px 이하 |

> 참고: 목업 CSS 기준 breakpoint — `480px`, `768px`, `1024px`, `1280px`

### 3-2. 디자인 기준

| 항목 | 내용 |
|------|------|
| 디자인 소스 | `references/design/` 폴더에 HTML 목업 공유 완료 |
| 디자인 가이드 | `references/design/FIGMA_DESIGN_GUIDE.md` 참조 |
| CSS 프레임워크 | Tailwind CSS (권장) 또는 목업 기반 커스텀 CSS |
| 그리드 시스템 | 12컬럼, 최대 너비 1440px, 거터 180px(데스크탑)/36px(태블릿)/20px(모바일) |

### 3-3. 타이포그래피

| 구분 | KR (한국어) | EN (영어) | ZH (중국어) | AR (아랍어) |
|------|-------------|-----------|-------------|-------------|
| UI/Display | Pretendard | system sans-serif | Noto Sans SC | Cairo |
| 본문 Serif | Iropke Batang | Georgia | Noto Serif SC | — (serif 미사용) |
| Mono (코드) | ui-monospace, SFMono-Regular | ui-monospace, SFMono-Regular | ui-monospace | ui-monospace |
| 특징 | 제목은 sans, 본문/인트로는 serif 혼용 | serif 비중이 KR보다 높음 | Simplified Chinese 기준 | RTL 방향, sans 전용 |

> **아랍어(ar) RTL 폰트 유의사항**: Cairo 폰트는 아랍어 RTL을 완전 지원하며 Google Fonts에서 제공. 아랍어 선택 시 `<html lang="ar" dir="rtl">` 적용 및 전체 레이아웃 미러링 필요.

### 3-4. 컬러 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary | `#5EB6B2` | 브랜드 포인트, 링크, 강조 |
| Primary Hover | `#22908B` | 호버 상태 |
| Primary Pressed | `#15716D` | 클릭 상태 |
| Text Primary | `#232329` | 본문 제목 |
| Text Secondary | `#68687B` | 보조 텍스트 |
| Text Tertiary | `#A1A1AF` | 약한 텍스트 |
| BG Canvas | `#FAFAFA` | 기본 배경 |
| BG Soft | `#F3F4F7` | 부드러운 배경 |
| BG Form | `#F6F4F2` | 폼 페이지 배경 |

### 3-5. 아이콘

| 항목 | 내용 |
|------|------|
| 형식 | SVG (인라인) |
| 목록 | `references/design/en/assets/svg/` 폴더에 공유 완료 |
| 주요 아이콘 | 검색, 글로브(언어), 메뉴, 닫기, 화살표, 소셜미디어(LinkedIn/Instagram/YouTube) 등 |

---

## 4. 메뉴 구조

| 항목 | 내용 |
|------|------|
| Depth | 2 Depth (대메뉴 → 소메뉴) |
| 레이아웃 소스 | `references/design/en/layout.html` — header/footer 참조 (body 영역은 디버깅용 임시 블록이므로 무시) |
| 메뉴 형태 | **카드형 Mega Menu** — 소메뉴 항목이 카드(그라데이션 미디어 + 제목 + 설명)로 표시 |
| 관리 기능 | **Admin Panel에서 메뉴를 동적으로 관리** (추가/수정/삭제/순서 변경) |

### 현재 목업 기준 메뉴 구조

| 대메뉴 | 소메뉴 | 비고 |
|--------|--------|------|
| **About** | Philosophy, Key Milestones, Business Scope, Location | 회사 소개 4개 항목 |
| **Solution** | Corpis™, Zinis™, Nix™, Sage™, Lumi™ | 솔루션 5개 (트레이드마크 표기) |
| **Service** | AEO Optimization, Web Service Build, Commerce Platform Build | 서비스 3개 |
| **Archive** | Insight, Story, Portfolio | 게시판/아카이브 3개 카테고리 |

### 메뉴 관리 기능 상세

| 기능 | 설명 |
|------|------|
| 메뉴 항목 CRUD | 관리자가 메뉴 항목을 생성, 수정, 삭제 |
| 순서 변경 | 드래그 앤 드롭 또는 순서 번호로 정렬 |
| 다국어 메뉴명 | 각 언어별 메뉴 이름 설정 |
| 링크 타입 | 내부 페이지 링크 / 외부 URL / 없음(그룹 헤더) 선택 |
| 노출 제어 | 메뉴 항목별 표시/숨김 토글 |
| 카드 설명 | 소메뉴 항목별 짧은 설명 텍스트 (다국어) |
| 카드 미디어 | 소메뉴 항목별 그라데이션 배경 또는 이미지 설정 |

### Header 유틸리티 영역

| 요소 | 설명 |
|------|------|
| 검색 | 토글형 검색 입력 필드 (헤더 우측) |
| 언어 선택 | 드롭다운 (Globe 아이콘 + 현재 언어명) |
| 모바일 메뉴 | 햄버거 토글 (모바일/태블릿에서 패널 슬라이드) |

### Footer 구성

| 요소 | 설명 |
|------|------|
| 언어 선택 | 헤더와 동일한 드롭다운 |
| 소셜 미디어 | LinkedIn, Instagram, YouTube |
| 저작권 | © Iropke All Rights Reserved. |
| 정책 링크 | Privacy Policy |

### 플로팅 액션 버튼

| 요소 | 설명 |
|------|------|
| Back to top | 스크롤 240px 이상 시 표시, 클릭 시 최상단 이동 |
| Project Inquiry | 프로젝트 문의 페이지 바로가기 (채팅 아이콘) |

### Payload 구현 방식
- **Navigation Global**으로 구현
- 2 Depth 구조를 위해 `items` 배열 안에 `children` 배열을 중첩하는 형태
- 각 소메뉴 항목에 `label`, `description`, `link`, `gradient` (또는 `media`) 필드 포함

---

## 5. 페이지 및 기능 요구사항

### 5-1. 첫 화면 (메인 페이지)

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_index.md` |
| 관리 방식 | Admin Panel에서 콘텐츠 관리 가능 |
| 구현 방식 | Payload의 **Page Collection** + Layout Builder (블록 기반) |
| 다국어 | 각 블록별 다국어 콘텐츠 입력 |

#### 메인 페이지 섹션 구성

| # | 섹션 | 설명 |
|---|------|------|
| 1 | **Hero** | 고정형 선언문 ("We build operating systems for digital business.") + Sub Copy + CTA (Explore Our System / Start a Project) |
| 2 | **Sub Carousel** | 3~5슬라이드 롤링 배너, 각 슬라이드에 제목·설명·CTA·배경이미지/그라데이션 |
| 3 | **AI OS Grid** | IROPKE OS™ 4개 솔루션 카드 — NOVA™(Brand Architecture), SAGE™(AI Search Visibility), LUMI™(Social Content Engine), NIX™(Digital Risk Review) |
| 4 | **Core Message** | "IROPKE doesn't build websites. It builds the system behind them." 고정 메시지 영역 |
| 5 | **Insights** | 최신 게시물 4개 그리드 (카드: 썸네일+카테고리+제목+날짜) + "View All" CTA |
| 6 | **CTA Banner** | "If your problem is bigger than a website, we should talk." + Project Inquiry 링크 |

#### 주요 UI 컴포넌트
- Hero 고정 선언문 블록, Sub Carousel 슬라이더, 4-grid 솔루션 카드, Core Message 중앙 정렬 텍스트, Insights 4-grid 카드, CTA 배너

### 5-2. 게시판 (목록 / 상세)

| 항목 | 내용 |
|------|------|
| 마크업 | `references/design/[en|ko]/postList.html`, `postDetail.html` 참조 |
| 관리 방식 | **태그 기반 게시물 관리** |
| 기능 | 목록 조회, 상세 보기, 태그 필터링, 페이지네이션 |
| 다국어 | 게시물별 다국어 콘텐츠 |

#### 목록 페이지 (postList)

| 항목 | 내용 |
|------|------|
| 카드 구조 | 썸네일 이미지(540x398) + 제목 + 설명 + 날짜 |
| 카드 인터랙션 | hover 시 이미지 확대, 제목 색상 전환, 대각선 화살표 회전 |
| 페이지네이션 | 숫자형 (이전/다음 + 페이지 번호) |
| 진입 애니메이션 | IntersectionObserver 기반 reveal (스크롤 시 순차 등장) |
| 접근성 | `prefers-reduced-motion: reduce` 시 애니메이션 비활성화 |

#### 상세 페이지 (postDetail)

| 항목 | 내용 |
|------|------|
| 레이아웃 | 메인 본문(좌) + sticky 관련글 사이드바(우), 데스크탑 1025px 이상에서 sticky 활성 |
| 히어로 | 대표 이미지(1200x675) + 제목 + 인트로 텍스트 |
| 태그 | 본문 하단에 태그 칩 리스트 표시 |
| 관련 글 | 사이드바에 5개 (썸네일+제목+날짜) + "더 보기" 링크 |

#### 에디토리얼 콘텐츠 블록 (Payload Lexical 에디터로 구현)

| 블록 타입 | 설명 |
|-----------|------|
| 헤딩 (H1~H6) | 6단계 계층 구조, 각 레벨별 스타일 차별화 |
| 본문 텍스트 | 단락, 순서형/비순서형 리스트 |
| 이미지 + 캡션 | `editorial-media` — figure + figcaption 구조 |
| 영상 (YouTube) | iframe 임베드, 이미지와 동일한 editorial-media 프레임 |
| 테이블 | 반응형 — 모바일에서 첫 열 고정 + 가로 스크롤, 스와이프 힌트 표시 |
| 인용문 | `blockquote` + `cite`, 큰따옴표 SVG 아이콘 장식 |
| Raw HTML | 별도 라벨("Raw HTML Example") + 분리된 영역으로 표시 |
| 코드 블록 | 언어 표기 헤더 + pre/code, 터미널 스타일 |
| Q&A | 질문/답변 쌍, 아이콘으로 시각 구분 |
| 구분선 | 에디토리얼 delimiter (✦ 또는 § 기호) |

#### 태그 관리

| 기능 | 설명 |
|------|------|
| 태그 CRUD | Admin에서 태그 생성/수정/삭제 |
| 태그 분류 | 게시물 작성 시 다중 태그 선택 |
| 태그 필터 | 프론트엔드에서 태그 클릭 시 해당 태그 게시물만 필터링 |

#### Payload 구현 방식
- **Posts Collection**: 게시물 컬렉션 (title, content, tags, thumbnail, publishedDate 등)
- **Tags Collection**: 태그 컬렉션 (name, slug)
- Relationship 필드로 Posts ↔ Tags 연결
- 본문은 **Lexical Rich Text Editor**로 관리, 위 에디토리얼 블록을 커스텀 노드/블록으로 구현

### 5-3. 프로젝트 문의

| 항목 | 내용 |
|------|------|
| 마크업 | `references/design/en/project_inquiry.html` 참조 |
| 레이아웃 | 메인 폼(좌) + 프로세스 안내 패널(우) 2분할 구조 |
| 데이터 저장 | Admin Panel에 문의 내역 증적 (Inquiries Collection) |
| 이메일 알림 | 문의 접수 시 관리자에게 알림 이메일 자동 발송 |
| 자동 응답 | 문의자에게 접수 확인 이메일 자동 발송 (입력한 이메일 주소로 발송) |
| 성공 모달 | 접수 완료 시 다이얼로그 표시 (ESC/바깥 클릭으로 닫기) |

#### 폼 필드 상세

| 필드명 | 타입 | 필수 | 유효성 검증 |
|--------|------|:----:|-------------|
| Company Name (회사명) | text | ✅ | 빈 값 검증 |
| Name (담당자명) | text | ✅ | 빈 값 검증 |
| Job Title (직책) | text | — | 2자 이상 (입력 시) |
| Contact Number (연락처) | tel | ✅ | 7~15자리 숫자 |
| Email Address (이메일) | email | ✅ | 이메일 형식 검증 |
| Project Overview (프로젝트 개요) | textarea | ✅ | 빈 값 검증 |
| RFP File Upload (RFP 파일) | file | — | PPT/Word/PDF/ZIP, 20MB 제한, 드래그앤드롭 지원 |
| Current Website URL (현재 사이트) | url | ✅ | URL 형식 검증 |
| Desired Launch Date (희망 런칭일) | date(text) | — | YYYY-MM-DD 형식 |
| ~~Spam Filter (스팸 방지)~~ | ~~checkbox~~ | — | → **reCAPTCHA v3 (invisible)** 로 대체. 사용자 인터랙션 없이 백그라운드 점수 판정 |

#### 우측 프로세스 안내 패널

| 단계 | 내용 |
|:----:|------|
| 1 | 필수 입력 항목을 모두 작성해 주세요 |
| 2 | 제출 후 영업일 기준 3시간 이내 회신 |
| 3 | 이메일 직접 문의 가능: hello@iropke.com |

#### 이메일 설정 요구사항

| 항목 | 내용 |
|------|------|
| 이메일 서비스 | Resend (권장) 또는 SendGrid |
| 발신 주소 | noreply@iropke.com (도메인 인증 필요) |
| 알림 수신자 | 관리자 이메일 (환경 변수로 관리) |
| 관리자 알림 템플릿 | 문의 내용 요약을 포함한 HTML 템플릿 |
| 자동 응답 템플릿 | 문의자에게 발송 — "프로젝트 문의가 정상적으로 등록되었습니다. 담당자 검토 후 이메일로 회신 드리겠습니다." (다국어 대응) |

#### Payload 구현 방식
- **Inquiries Collection**: 문의 데이터 저장 (읽기 전용 Admin 뷰)
- `afterChange` Hook에서 이메일 발송 로직 실행 (관리자 알림 + 문의자 자동 응답 동시 발송)

### 5-4. 서비스/솔루션 소개 페이지

| 항목 | 내용 |
|------|------|
| 유형 | Static Pages |
| 페이지 수 | 솔루션 6개 + 서비스 1개 (B.I.A) = **7개** (요구사항 .md 공유 완료) + 메뉴 상 서비스 3개 (AEO Optimization, Web Service Build, Commerce Platform Build — 추후 정의) |
| 관리 방식 | Payload Pages Collection에서 콘텐츠 편집 가능 |
| 다국어 | 각 페이지별 6개 언어 콘텐츠 |
| 공통 레이아웃 | Hero → Problem → Perspective → Concept/Workflow → Features → Benefits → Target Audience → CTA Banner → Related Services |

#### 솔루션 페이지 요약

| 솔루션 | 한 줄 정의 | 핵심 콘셉트 | 요구사항 소스 |
|--------|-----------|------------|--------------|
| **CORPIS™** | 기업 웹사이트 전용 구조화 CMS | From Customization → To Readiness | `iropke_cms_corpis_ver1.md` |
| **ZINIS™** | 기업/공공기관용 웹진 CMS | From Publishing → To Discoverability | `iropke_cms_zinis_ver1.md` |
| **NOVA™** | AI 기반 브랜드 아키텍처 관리 | From Creation → To Continuity | `iropke_solution_nova_ver1.md` |
| **SAGE™** | AI 시대 검색 최적화 (SEO+AEO+SGE) | From Ranking → To Selection | `iropke_solution_sage_ver1.md` |
| **LUMI™** | AI 기반 소셜 콘텐츠 생성 | From One Content → To Multi-Channel | `iropke_solution_lumi_ver1.md` |
| **NIX™** | AI 기반 디지털 리스크 리뷰 | 보이지 않는 리스크를 구조화 | `iropke_solution_nix_ver1.md` |

#### B.I.A (Brand Intelligence Agency) 페이지

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `iropke_service_bia.md` |
| 포지셔닝 | 내러티브 기반 브랜드 인텔리전스 레이어 — 탐정/수사 컨셉 |
| 핵심 UI | **Case Map** — 조사 보드 형태의 인터랙티브 노드/카드 맵 (호버 시 요약, 클릭 시 상세) |
| 카테고리 | Visibility Cases, Brand Cases, Content Cases, Risk Cases |
| 솔루션 연결 | Visibility→SAGE™, Brand→NOVA™, Content→LUMI™, Risk→NIX™ |
| CTA | "Request Investigation" → 프로젝트 문의 연결 |

#### 솔루션 페이지 공통 섹션 구조

| # | 섹션 | 설명 |
|---|------|------|
| 1 | Hero | 헤드라인 + 서브카피 + CTA |
| 2 | Problem | 기존 방식의 문제 제기 |
| 3 | Perspective | 관점 전환 메시지 |
| 4 | Concept/Workflow | AI 활용 방식 또는 프로세스 (3~4단계) |
| 5 | Features | 주요 기능 그리드 (6~7개) |
| 6 | Integration | IROPKE OS™ 연동 다이어그램 (CORPIS™, ZINIS™ 해당) |
| 7 | Benefits | 도입 효과 카드 (5개) |
| 8 | Target Audience | 대상 고객 카드 (4개) |
| 9 | CTA Banner | 프로젝트 문의 연결 |
| 10 | Related Services | 관련 솔루션/서비스 링크 |

#### 세일즈 내러티브 가이드 (참고)
- 소스: `iropke_guide_message_sales_flow.md`
- 페이지가 아닌 **메시징 프레임워크** — 솔루션 페이지의 스토리텔링 흐름에 참고
- 핵심 흐름: Problem → Misconception → Real Problem → Insight → System → Solution → Action
- 포지셔닝 문구: "IROPKE does not build websites. It builds the system behind them."

### 5-5. 회사 소개 페이지

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_aboutUs.md` |
| 유형 | Static Page |
| 관리 방식 | Pages Collection 또는 전용 Global |
| 다국어 | 6개 언어 |

#### 회사 소개 페이지 섹션 구성

| # | 섹션 | 설명 |
|---|------|------|
| 1 | Hero | "We don't build websites. We build the systems behind them." + 서브카피 |
| 2 | Core Identity | IROPKE = Intelligent Resource for Optimizing and Protecting the Knowledge Economy |
| 3 | IROPKE OS™ | 4-layer 시스템 설명 — Identity(NOVA™), Visibility(SAGE™), Content(LUMI™), Risk(NIX™) |
| 4 | What We Do | 서비스 범위 카드 (Enterprise CMS, Webzine, AI Strategy, Risk Review, Brand Architecture) |
| 5 | How We Work | 3단계 프로세스 (Investigate → Architect → Operate) |
| 6 | What Makes Us Different | 차별점 메시지 — "Not an agency. Not a vendor." |
| 7 | Who We Work With | 대상 고객 프로필 카드 |
| 8 | CTA | "If your problem is bigger than a website, we should talk." → 프로젝트 문의 |

### 5-6. 약관 페이지 (Privacy Policy)

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_privacy_policy.md` |
| 유형 | Static Page |
| 종류 | 개인정보 처리방침 (Privacy Policy) |
| 관리 방식 | Pages Collection 또는 전용 Collection |
| 다국어 | 6개 언어 — GDPR 등 region별 법적 요건을 모두 반영한 버전으로 게시 |
| 비고 | 유럽(GDPR), 한국(개인정보보호법), CCPA/CPRA 등 주요 지역 규정 통합 반영 |

#### 레이아웃 구조

| 요소 | 설명 |
|------|------|
| 좌측 사이드바 | 목차 (Table of Contents) — sticky, 스크롤 시 현재 위치 하이라이트 (scrollspy) |
| 우측 본문 | 14개 섹션 콘텐츠 (Introduction ~ Contact Information) |
| 모바일 | 사이드바 → 접이식(collapsible) 또는 상단 드롭다운 |

#### 본문 14개 섹션

| # | 섹션 |
|---|------|
| 1 | Introduction |
| 2 | Information We Collect |
| 3 | How We Use Your Information |
| 4 | Legal Basis for Processing |
| 5 | Data Sharing and Disclosure |
| 6 | International Data Transfers |
| 7 | Data Retention |
| 8 | Your Rights and Choices |
| 9 | Cookies and Tracking Technologies |
| 10 | Security Measures |
| 11 | Children's Privacy |
| 12 | Changes to This Privacy Policy |
| 13 | Governing Law |
| 14 | Contact Information |

### 5-7. 검색 결과 페이지

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_search_results.md` |
| 검색 범위 | **Static Pages + Board/Database Posts** — 하나의 통합 검색 경험 |
| 검색 방식 | Payload 내장 검색 또는 `@payloadcms/plugin-search` 활용 |
| 다국어 | 현재 선택된 언어의 콘텐츠만 검색 |

#### 검색 결과 페이지 구성

| # | 섹션 | 설명 |
|---|------|------|
| 1 | Search Header | 검색 입력 필드 유지 (검색어 자동 전달) |
| 2 | Query Summary | "Results for '검색어'" + 결과 건수 |
| 3 | Tabs/Filters | All / Pages / Posts / Policies / Services — 콘텐츠 유형 필터 |
| 4 | Result List | 통합 결과 카드 (type label + title + excerpt + breadcrumb + date) |
| 5 | Pagination | 숫자형 페이지네이션 또는 Load More |
| 6 | Empty State | "No results found" + 검색 팁 + 추천 링크 |
| 7 | Suggested Links | 인기 서비스, 최신 인사이트, 문의 페이지 등 |

#### 검색 로직 우선순위

| 순위 | 매칭 기준 |
|:----:|----------|
| 1 | 제목 정확 일치 |
| 2 | 제목 부분 일치 |
| 3 | 본문 콘텐츠 일치 |
| 4 | 메타데이터/카테고리 일치 |

#### 가중치 규칙

| 콘텐츠 유형 | 우선순위 |
|------------|:--------:|
| 서비스/솔루션 페이지 | 높음 |
| 회사/정책 페이지 | 중상 |
| 게시물/칼럼/뉴스 | 보통 (최신성 가산) |

### 5-8. AI 챗봇 연동

| 항목 | 내용 |
|------|------|
| 도입 시점 | **Phase 6 (런칭 시점)** — 웹사이트 개발 완료 후 임베드 |
| 1차 후보 | **Chatbase** ($40/월~, 80개+ 언어) 또는 **SiteGPT** ($39/월~, 95개+ 언어) |
| 연동 방식 | 프론트엔드에 스크립트 임베드 (노코드) |
| 콘텐츠 학습 | 웹사이트 URL 크롤링으로 Payload CMS 콘텐츠를 학습 데이터로 활용 |
| 다국어 | 자동 언어 감지 지원 (6개 언어 커버 가능) |
| 장기 로드맵 | 운영 중 더 깊은 연동 필요 시, Payload 자체 RAG 프레임워크 + OpenAI/Claude API 기반 자체 챗봇으로 전환 검토 |

#### 후보 서비스 비교

| 항목 | Chatbase | SiteGPT | Botpress |
|------|----------|---------|----------|
| 콘텐츠 학습 | 웹페이지/문서 크롤링 | 웹사이트 자동 동기화 | RAG 기반 자체 학습 |
| 다국어 | 80개+ 언어 | 95개+ 언어 | 다국어 내장 |
| 설치 | 노코드 임베드 | 노코드 임베드 | 임베드 또는 셀프 호스팅 |
| 가격 | $40/월~ | $39/월~ | 무료(커뮤니티) / $495/월~(Team) |
| 적합성 | 빠른 도입, 심플 | 빠른 도입, 데이터소스 풍부 | 엔터프라이즈, 높은 커스터마이징 |

#### 미결정 사항
- 최종 서비스 선정은 런칭 시점에 무료 체험 후 결정
- 개인정보 처리 정책 검토 필요 (GDPR 등)

### 5-9. 에러 페이지

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_error.md` |
| 유형 | 시스템 페이지 |
| 특징 | **글로벌 헤더 미포함** — 독립적이고 집중된 레이아웃 |
| 톤 | 명확하고 차분한, 약간의 위트 (childish하지 않은) |

#### 지원 에러 유형

| 코드 | 타이틀 | 위트 메시지 예시 |
|:----:|--------|----------------|
| 404 | Page Not Found | "I understand that feeling too. Getting lost happens." |
| 403 | Access Denied | "This door seems to require a different key." |
| 500 | Internal Server Error | "Something behind the curtain seems to be having a moment." |
| 503 | Service Unavailable | "We're briefly unavailable. Even systems need a breath." |

#### 레이아웃 구성

| # | 요소 | 설명 |
|---|------|------|
| 1 | Error Status | 에러 코드 (가장 강한 시각 요소) + 에러 타이틀 |
| 2 | Witty Message | 공감적이고 지적인 한 줄 메시지 |
| 3 | Short Description | 평이한 언어로 상황 설명 |
| 4 | Recovery Actions | **Home** (필수, 시각적 Primary) + Go Back (선택) + Contact Us (선택) |
| 5 | Technical Hint | 에러 코드, 기술 정보 (시각적으로 부차적) |

#### UX 노트
- 중앙 정렬 레이아웃 권장, 컴팩트하고 수직 균형
- 모바일: 버튼 스택 + 넓은 터치 영역
- 미니멀하고 차분한 비주얼 (경고성 강조 지양, 보안 관련 에러 제외)

### 5-10. 쿠키 동의 UI (Cookie Consent)

| 항목 | 내용 |
|------|------|
| 요구사항 소스 | `references/requirements/iropke_cookie_consent_ui.md` |
| 법적 준거 | GDPR, ePrivacy, CCPA/CPRA |
| UI 유형 | 초기 배너 + 상세 설정 모달 |

#### 초기 동의 배너

| 요소 | 설명 |
|------|------|
| 메시지 | "We use cookies to improve your experience, analyze traffic, and personalize content." |
| 버튼 | **Accept All** (Primary) / **Reject All** / **Manage Preferences** |
| 위치 | 하단 또는 중앙 오버레이 |
| 동작 | 동의 전 비필수 쿠키 차단, 선택 결과 저장 |

#### 설정 모달 (Preference Modal)

| 카테고리 | 토글 | 설명 |
|----------|:----:|------|
| Necessary | 항상 ON (비활성화 불가) | 사이트 기능에 필수 |
| Analytics | ON/OFF | 사용량 및 성능 추적 |
| Marketing | ON/OFF | 광고 개인화 및 추적 |
| Functional | ON/OFF | 사용성 향상 (환경설정 등) |

#### 동작 규칙

| 항목 | 내용 |
|------|------|
| 기본 상태 | Necessary만 활성 |
| 저장 방식 | localStorage 또는 쿠키 |
| 만료 | 6~12개월 |
| 재설정 | 푸터 "Cookie Settings" 링크로 재오픈 가능 |
| 접근성 | 키보드 + 스크린 리더 지원 |
| CCPA | "Do Not Sell or Share" 옵션 (해당 시) |

### 5-11. Sitemap.xml 생성

| 항목 | 내용 |
|------|------|
| 생성 대상 | 모든 Static Pages + 모든 게시물 (Posts) |
| 언어별 생성 | 6개 언어(ko, en, es, ru, de, fr)에 대해 `hreflang` 태그 포함 또는 언어별 별도 sitemap |
| 구현 방식 | Next.js `app/sitemap.xml/route.ts` 또는 `next-sitemap` 패키지 활용 |
| 동적 갱신 | 콘텐츠 생성/수정/삭제 시 sitemap 자동 반영 (빌드 시 또는 ISR) |
| 제출 | Google Search Console에 sitemap URL 등록 |

#### Sitemap 구조 권장

| 파일 | 내용 |
|------|------|
| `/sitemap.xml` | 메인 Sitemap Index (각 언어별 sitemap 참조) |
| `/sitemap-ko.xml` | 한국어 페이지 및 게시물 전체 |
| `/sitemap-en.xml` | 영어 페이지 및 게시물 전체 |
| `/sitemap-es.xml` | 스페인어 … |
| `/sitemap-ru.xml` | 러시아어 … |
| `/sitemap-de.xml` | 독일어 … |
| `/sitemap-fr.xml` | 프랑스어 … |
| `/sitemap-zh.xml` | 중국어(간체) 페이지 및 게시물 전체 |
| `/sitemap-ar.xml` | 아랍어 페이지 및 게시물 전체 |

#### 각 URL 항목에 포함할 정보
- `<loc>` — 전체 URL (locale prefix 포함)
- `<lastmod>` — 최종 수정일
- `<xhtml:link rel="alternate" hreflang="xx">` — 동일 콘텐츠의 다른 언어 버전 URL
- `<changefreq>` / `<priority>` — 선택 (서비스 페이지 높음, 게시물 보통)

### 5-13. Backend AI 기능

#### 5-13-1. AI 콘텐츠 자동 생성

| 항목 | 내용 |
|------|------|
| 기능 | 관리자가 주제(Topic)를 입력하면 AI가 콘텐츠 초안을 자동 생성 |
| 구현 위치 | Payload Admin Panel 내 커스텀 UI 버튼 |
| 구현 방식 | Payload Custom Endpoint + Anthropic Claude API (또는 OpenAI API) 호출 |
| 활용 플러그인 | [`payload-ai`](https://github.com/ashbuilds/payload-ai) (GitHub ⭐430) — 텍스트/이미지/번역 통합 지원 |
| 생성 대상 | Posts Collection의 `title`, `content`(Lexical 에디터), `excerpt` 필드 |
| Payload 공식 지원 | Enterprise AI Framework (RAG, 벡터 임베딩, Writing Assistant 내장) |
| 추천 AI 모델 | Anthropic Claude (한국어 생성 품질 우수) |
| 도입 시점 | Phase 3 (Backend 기능 개발) |

#### AI 콘텐츠 생성 워크플로우

| # | 단계 | 설명 |
|---|------|------|
| 1 | 주제 입력 | 관리자가 Admin Panel에서 키워드/주제 텍스트 입력 |
| 2 | AI 호출 | Payload Custom Endpoint → Claude API 요청 |
| 3 | 초안 반환 | 제목 + 본문 초안을 에디터 필드에 자동 채움 |
| 4 | 검토 및 수정 | 관리자가 초안을 검토·수정 후 최종 저장/발행 |

#### 5-13-2. 다국어 자동 번역 (KO → 다국어)

| 항목 | 내용 |
|------|------|
| 기능 | 한국어로 작성된 콘텐츠를 5개 언어로 자동 번역 |
| 지원 언어 | 영어(en), 스페인어(es), 중국어(zh), 아랍어(ar), 러시아어(ru), 독일어(de), 프랑스어(fr) — **7개 언어** |
| 구현 방식 | Payload `afterChange` Hook + 번역 API 호출 → 각 locale 필드 자동 채움 |
| 활용 플러그인 | `payload-plugin-ai-localization` — 비주요 언어 필드에 "Translate" 버튼 자동 추가 |
| **번역 API 확정** | **Claude Haiku API** — 7개 언어 전체 지원(아랍어 포함), 월 ~$6/월 (30건 기준) |
| DeepL 제외 사유 | 아랍어(ar) 미지원으로 제외 |
| 언어 커버리지 | Claude Haiku: EN/ES/ZH/AR/RU/DE/FR 전 언어 지원 |
| 번역 트리거 | 수동 (Admin에서 "Translate" 버튼 클릭) 또는 자동 (콘텐츠 저장 시 Hook) |
| 도입 시점 | Phase 5 (다국어 확장) |

> **확정**: 중국어(zh)·아랍어(ar) locale 추가 확정. Payload Localization 설정 `zh`, `ar` 추가. 아랍어는 RTL 레이아웃 처리 필요 (§2 사이드 이펙트 참조).

#### 다국어 번역 워크플로우

| # | 단계 | 설명 |
|---|------|------|
| 1 | 한국어 원본 저장 | ko locale 콘텐츠 작성 완료 후 저장 |
| 2 | 번역 트리거 | Admin에서 "Translate All" 버튼 클릭 (또는 Hook 자동 실행) |
| 3 | API 번역 | 번역 API가 각 언어별로 콘텐츠 번역 |
| 4 | locale 필드 채움 | en/es/zh/ar/ru locale 필드에 번역 결과 자동 저장 |
| 5 | 검토 및 발행 | 관리자가 번역 결과 검토 후 `publishedLocales`에 해당 언어 추가하여 공개 |

#### Collections 업데이트 (AI 기능 관련)

| Collection/필드 | 추가 내용 |
|----------------|----------|
| `posts` | `aiGenerated` (boolean) — AI 생성 여부 표시 |
| `posts` | `translationStatus` (object) — 언어별 번역 완료 상태 관리 |
| `site-settings` Global | `aiApiKey` — AI API 키 환경 변수 참조 설정 |

---

### 5-14. 결제 PG 연동

| 항목 | 내용 |
|------|------|
| 기능 | 이롭게 솔루션/서비스 결제 처리 |
| **PG 확정** | **Stripe** — 개발 유연성 최고, Payload 연동 레퍼런스 풍부, 8개 언어 UI 지원 |
| 구현 방식 | Payload Custom Endpoint + Stripe SDK → 프론트엔드 결제 UI 연동 |
| 다국어 커버리지 | Stripe: 30개+ 언어 지원 (ko/en/es/zh/ar/ru/de/fr 전체 포함) |
| **도입 시점** | **웹사이트 런칭 후 점진적 도입** — 런칭 시점에는 미포함, 운영 안정화 후 별도 Phase로 추가 |
| 수수료 | 2.9% + $0.30/건 (한국 카드 추가 수수료 별도 확인 필요) |

#### Stripe 도입 로드맵 (런칭 후 점진적)

| 단계 | 내용 | 시점 |
|:----:|------|------|
| 1 | Stripe 계정 개설 및 도메인 인증, 테스트 모드 설정 | 런칭 후 1개월 이내 |
| 2 | Orders Collection + Payload 결제 Endpoint 개발 | 별도 개발 Sprint |
| 3 | 프론트엔드 결제 UI (Stripe Elements) 연동 | 스테이징 환경 검증 |
| 4 | 8개 언어 결제 UI 확인 및 다국어 이메일 영수증 | QA |
| 5 | 운영 환경 배포 및 라이브 결제 전환 | Production 배포 |

#### Payload 구현 방식
- **Orders Collection**: 주문/결제 내역 저장 (orderId, amount, currency, status, locale, customerEmail 등)
- Payload Custom Endpoint (`/api/payment/create-intent`, `/api/payment/webhook`) 구현
- PG Webhook → Payload `afterChange` Hook으로 주문 상태 자동 업데이트

---

### 5-12. 콘텐츠 이관 (Migration)

| 항목 | 내용 |
|------|------|
| 대상 | 현재 운영 중인 웹사이트의 게시물 약 300건 |
| 언어 | 한국어, 영어 (기존 2개 언어) — 각 언어별로 별도 게시물이 DB에 저장된 구조 |
| 이관 방식 | 기존 DB Export(CSV/JSON) → 가공 → Payload Seed Script로 Import |
| 매핑 작업 | 기존 게시물 구조 → 새 Posts Collection 필드 매핑, 한국어·영어 게시물을 slug 기준 매칭 후 Payload Localization 구조로 병합 |
| 이미지 이관 | 기존 이미지 다운로드 → Cloudinary/S3 업로드 후 URL 매핑 |

#### 이관 진행 순서

| # | 단계 | 설명 |
|---|------|------|
| 1 | 기존 DB Export | CSV 또는 JSON으로 게시물 데이터 추출 |
| 2 | 필드 매핑 정의 | 기존 필드 → Payload Collection 필드 매핑 표 작성 |
| 3 | 데이터 가공 | 한국어·영어 게시물을 slug 기준으로 매칭, Payload Localization 구조로 병합, 이미지 URL 정리 |
| 4 | 변환 스크립트 개발 | Node.js 기반 — 가공된 데이터를 Payload Seed Script 형태로 변환 |
| 5 | 테스트 이관 | 일부 게시물로 테스트 후 검증 |
| 6 | 전체 이관 실행 | 전체 300건 이관 및 검수 |

---

## 6. 개발 진행 순서 (Phase)

| Phase | 작업 | 산출물 | 소스 프리징 |
|:-----:|------|--------|:----------:|
| **1** | 기존 HTML 목업 → Next.js 프론트엔드 컴포넌트 변환 (영문 기준). 레이아웃(header/footer), 게시판(목록/상세), 프로젝트 문의 + 미제작 페이지(메인, 솔루션 6개, B.I.A, 회사소개, 약관, 검색, 에러, 쿠키 동의) 영문 기준 생성 | 전체 페이지 프론트엔드 | — |
| **2** | 브라우저 테스트 (Chrome/Firefox/Safari) + 모바일/태블릿 디바이스 테스트 | 테스트 리포트 | ✅ 프론트엔드 프리징 |
| **3** | Payload Admin 포함 백엔드 기능 개발 (영문 기준) — Collections, Globals, 문의 이메일, 검색 등 | 기능 완성 | — |
| **4** | 기능 테스트 및 디버깅 | 테스트 리포트 | ✅ 기능 프리징 |
| **5** | 다국어 확장 (ko, es, ru, de, fr, **zh, ar**) — Localization 필드 + UI 라벨 번역 + 아랍어 RTL 레이아웃 적용 + 콘텐츠 이관(300건) | 다국어 사이트 (8개 언어) | — |
| **6** | AI 챗봇 임베드 + 최종 QA + 런칭 | 운영 사이트 | ✅ 런칭 |

---

## 7. 시스템 메시지 톤 가이드

| 유형 | 톤 | 예시 |
|------|-----|------|
| UX/시스템 메시지 (404, 빈 상태, 로딩 등) | 위트 있는 친근한 톤 | 404: "We looked everywhere. Even behind the sofa." |
| 폼 유효성 검증 | 명확하고 직관적인 톤 | "Please enter a valid email address." |
| 성공/확인 메시지 | 따뜻하고 간결한 톤 | "Your inquiry has been received. We'll be in touch soon." |

> 시스템 메시지는 Phase 1에서 영문 기준으로 먼저 작성하고, Phase 5에서 각 언어별 톤에 맞게 번역합니다.

---

## 8. 비용 구조

### 현재 사용 중인 서비스

| 서비스 | 상태 | 비고 |
|--------|------|------|
| GitHub | 유료 사용 중 | 기존 유지 |
| Vercel | 유료 사용 중 | 기존 유지 |
| Supabase | 유료 사용 중 | DB로 PostgreSQL 활용 가능 (MongoDB Atlas 대신) → 추가 비용 없음 |
| Google Search Console | 사용 중 | 무료 |
| Google Analytics (GA4) | 사용 중 | 무료 |

### 신규 가입 필요 서비스

| 서비스 | 용도 | 예상 비용 |
|--------|------|-----------|
| Resend | 이메일 발송 (프로젝트 문의 알림) | Free tier: 3,000건/월, 이후 $20/월~ |
| Cloudinary | 이미지/미디어 저장소 | Free tier: 25GB 저장/25GB 대역폭, 이후 $89/월~ |
| AI 챗봇 (Chatbase 또는 SiteGPT) | 웹사이트 AI 챗봇 | $39~40/월~ (Phase 6 런칭 시점에 도입) |
| **Claude Haiku API** (번역 + 콘텐츠 생성 통합) | 다국어 자동 번역 + AI 콘텐츠 생성 | 번역: ~$6/월 (30건 × 7언어 기준) / 콘텐츠 생성: 사용량 별도 |
| **Stripe** | 결제 처리 (런칭 후 점진적 도입) | 2.9% + $0.30/건 (초기 고정 비용 없음) |
| **Supabase Staging 프로젝트** | 기존 계정 내 신규 프로젝트 (Staging DB 격리) | ~$10/월 (프로젝트 추가 비용) |

> Supabase를 이미 유료로 사용 중이므로, Payload CMS 3.x의 PostgreSQL 공식 지원을 활용해 별도 MongoDB Atlas 가입 없이 Supabase를 DB로 사용하는 것을 권장합니다.

---

## 9. Payload Collections & Globals 설계 (초안)

### Collections

| Collection | 용도 | 주요 필드 |
|------------|------|-----------|
| `users` | 관리자 계정 | email, password, role |
| `pages` | 정적 페이지 (서비스, 회사, 약관 등) | title, slug, layout(블록), meta |
| `posts` | 게시판 게시물 | title, content, tags, thumbnail, publishedDate |
| `tags` | 게시물 태그 | name, slug |
| `inquiries` | 프로젝트 문의 | company, contactName, jobTitle, phone, email, projectOverview, rfpFile, websiteUrl, launchDate, status |
| `media` | 이미지/파일 업로드 | filename, url, alt |
| `orders` | 결제/주문 내역 | orderId, amount, currency, status, locale, customerEmail, pgProvider |

### Globals

| Global | 용도 | 주요 필드 |
|--------|------|-----------|
| `navigation` | 메뉴 관리 | items[{ label, description, link, gradient/media, children[] }] |
| `site-settings` | 사이트 전역 설정 | siteName, logo, footer(copyright, policyLink), socialLinks[{platform, url}], locales([ko,en,es,ru,de,fr,zh,ar]), rtlLocales([ar]), aiApiProvider(claudeHaiku), pgProvider(stripe) |
| `homepage` | 메인 페이지 레이아웃 | layout blocks[] |

---

## 10. 미결정 사항 (Action Items)

| # | 항목 | 담당 | 상태 |
|---|------|------|:----:|
| 1 | ~~콘텐츠 미번역 시 fallback 정책~~ | 협의 | ✅ fallback 시 영문 표시 + 안내 배너, 의도적 비노출은 목록 숨김 + 404. `publishedLocales` 필드로 제어 |
| 2 | ~~프로젝트 문의 접수 시 자동 응답 이메일 발송 여부~~ | 협의 | ✅ 발송 확정 — 문의자 이메일로 접수 확인 자동 응답 |
| 3 | ~~약관 페이지 종류 확정~~ | Ashley | ✅ 개인정보 처리방침 (Privacy Policy) — GDPR 등 region별 법적 요건 통합 반영 |
| 4 | ~~AI 챗봇 서비스 선정~~ | 협의 | ✅ 런칭 시점에 Chatbase/SiteGPT 중 선정, 장기적으로 Payload RAG 전환 검토 |
| 5 | ~~기존 사이트 DB/CMS 접근 방법 확인~~ | 협의 | ✅ 기존 DB를 CSV/JSON으로 export → 가공 → Payload import 방식으로 진행 |
| 6 | ~~디자인 가이드 (폰트, 아이콘, 컬러 팔레트) 확정~~ | Ashley | ✅ `FIGMA_DESIGN_GUIDE.md` 공유 완료 |
| 7 | ~~HTML 목업 파일 공유 (게시판, 문의, 레이아웃)~~ | Ashley | ✅ `references/design/` 공유 완료 |
| 8 | ~~도메인 및 DNS 관리 권한 확인~~ | Ashley | ✅ Ashley에게 관리 권한 있음 확인 |
| 9 | ~~메인 페이지 콘텐츠 요소 정의 공유 (.md 파일)~~ | Ashley | ✅ `iropke_index.md` 공유 완료 → §5-1 반영 |
| 10 | ~~서비스/솔루션 소개 페이지 콘텐츠 요소 정의 공유 (.md 파일)~~ | Ashley | ✅ CORPIS™, ZINIS™, NOVA™, SAGE™, LUMI™, NIX™, B.I.A 총 7개 .md 공유 완료 → §5-4 반영 |
| 11 | ~~회사 소개 페이지 콘텐츠 요소 정의 공유 (.md 파일)~~ | Ashley | ✅ `iropke_aboutUs.md` 공유 완료 → §5-5 반영 |
| 12 | ~~스팸 방지 방식 확정~~ | 협의 | ✅ reCAPTCHA v3 (invisible) — 백그라운드 점수 판정, 기존 체크박스 제거 |
| 13 | ~~AI 콘텐츠 생성 AI 모델 선정~~ | 협의 | ✅ **Claude Haiku API 확정** — 번역 + 콘텐츠 생성 통합, 월 ~$6 (30건 × 7언어 기준) |
| 14 | ~~다국어 번역 API 선정~~ | 협의 | ✅ **Claude Haiku API 확정** — DeepL은 아랍어 미지원으로 제외. 7개 언어 전체 커버 |
| 15 | ~~중국어(zh)·아랍어(ar) locale Payload 추가 여부~~ | 협의 | ✅ **zh/ar locale 추가 확정** — 아랍어 RTL 레이아웃(Tailwind `rtl:` variant) Phase 1부터 적용 필요 |
| 16 | ~~결제 PG 최종 선정 (Stripe vs Paddle)~~ | Ashley | ✅ **Stripe 확정** — 개발 유연성 우선, Payload 연동 레퍼런스 풍부 |
| 17 | ~~결제 도입 시점 확정~~ | 협의 | ✅ **런칭 후 점진적 도입 확정** — 초기 런칭에는 미포함, 운영 안정화 후 별도 Sprint로 추가 |
| 18 | ~~개발/스테이징 서버 구성 방식 확정~~ | 협의 | ✅ **확정** — Vercel Preview(자동) + `develop` 브랜치 Staging + **기존 Supabase 계정 내 신규 Staging 프로젝트 생성** (추가 ~$10/월). §11 참조 |

---

## 11. 인프라 및 배포 환경

### 11-1. 환경 구성 개요

| 환경 | 목적 | 브랜치 | URL 형태 |
|------|------|--------|---------|
| **Local** | 개발자 로컬 개발 및 기능 구현 | feature/\*, fix/\* | `localhost:3000` |
| **Staging** | 기능 검증, QA, 클라이언트 리뷰 | `develop` | `staging.iropke.com` 또는 Vercel Preview URL |
| **Production** | 실제 서비스 운영 | `main` | `iropke.com` |

### 11-2. 환경별 상세 설정

| 항목 | Local | Staging | Production |
|------|-------|---------|------------|
| **Vercel 배포** | — | Vercel Preview (develop 브랜치 자동 배포) | Vercel Production (main 브랜치) |
| **데이터베이스** | Supabase 로컬 또는 기존 계정 내 Dev 프로젝트 | **기존 계정 내 Staging 프로젝트** (신규 생성, 완전 격리) | 기존 계정 내 Production 프로젝트 |
| **환경변수** | `.env.local` | Vercel Environment Variables (Preview) | Vercel Environment Variables (Production) |
| **AI API** | 테스트용 소량 호출 허용 | Staging API Key (별도 관리) | Production API Key |
| **Stripe** | Stripe Test Mode | Stripe Test Mode | Stripe Live Mode |
| **이메일(Resend)** | 로컬 테스트 주소 | 테스트 도메인 발송 | noreply@iropke.com |

> ✅ **Supabase 프로젝트 분리 확정**: **기존 Supabase 계정 내에 Staging 전용 프로젝트를 신규 생성**하여 Production과 완전 격리. 동일 계정 내 관리로 팀 권한·청구·Dashboard 일원화 가능. 추가 비용 ~$10/월 수준으로 운영 효율 대비 합리적.

### 11-3. 브랜치 전략

| 브랜치 | 역할 | 병합 방향 |
|--------|------|----------|
| `main` | Production 배포 소스 | ← `develop` (PR 검토 후 merge) |
| `develop` | Staging 배포 소스, 통합 브랜치 | ← `feature/*`, `fix/*` |
| `feature/[기능명]` | 신규 기능 개발 | → `develop` |
| `fix/[버그명]` | 버그 수정 | → `develop` |
| `hotfix/[긴급명]` | 운영 긴급 수정 | → `main` + `develop` 동시 병합 |

### 11-4. Vercel 배포 설정

| 항목 | 내용 |
|------|------|
| Production 도메인 | `iropke.com` (main 브랜치 자동 배포) |
| Staging 도메인 | `staging.iropke.com` (develop 브랜치 자동 배포) |
| PR Preview | 모든 PR에 자동으로 고유 Preview URL 생성 — `https://iropke-[hash].vercel.app` |
| 환경변수 관리 | Vercel Dashboard → Settings → Environment Variables에서 환경별 분리 관리 |
| 빌드 캐시 | Vercel 자동 캐시 (Next.js ISR 연동) |

### 11-5. 운영 배포 워크플로우

| # | 단계 | 환경 | 설명 |
|---|------|------|------|
| 1 | 로컬 개발 | Local | feature 브랜치에서 기능 구현 및 단위 테스트 |
| 2 | PR 생성 | Staging (Preview) | `develop` 대상 PR 생성 → Vercel Preview 자동 배포 |
| 3 | 코드 리뷰 + QA | Staging (Preview) | Preview URL에서 기능 확인 및 클라이언트 리뷰 |
| 4 | develop 머지 | Staging | PR merge → `staging.iropke.com` 자동 반영 |
| 5 | 최종 QA | Staging | Staging 환경에서 통합 테스트 |
| 6 | 운영 배포 | Production | `develop` → `main` PR 생성 및 merge → `iropke.com` 자동 배포 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-14 | 최초 작성 | Claude & Ashley |
| 2026-04-15 | 디자인 목업 분석 반영 — breakpoint 상세화, 타이포/컬러/아이콘 확정, 메뉴 구조(4대메뉴·15소메뉴) 확정, 게시판 목록/상세 에디토리얼 블록 정의, 프로젝트 문의 폼 필드 10개 상세 정의, Inquiries/Navigation 스키마 업데이트, 미결정 사항 4건 추가 | Claude & Ashley |
| 2026-04-15 | 검토항목 논의 반영 — 개발 Phase 6단계 정의(영문 우선 개발 → 기능 → 다국어 확장), 시스템 메시지 톤 가이드(위트 vs 명확), AI 챗봇 전략 확정(런칭 시 Chatbase/SiteGPT → 장기 Payload RAG), 비용 구조 정리(Supabase PostgreSQL 활용 권장), 챗봇 검토항목 완료 처리 | Claude & Ashley |
| 2026-04-15 | 미결정 사항 대부분 해소 — fallback 정책 확정(publishedLocales 필드), 자동 응답 이메일 확정, 약관→개인정보처리방침(GDPR 통합), 콘텐츠 이관 방식(DB export→가공→import), DNS 권한 확인, reCAPTCHA v3 확정. 잔여 미결정: #9~#11 콘텐츠 요소 .md 공유 대기 | Claude & Ashley |
| 2026-04-15 | 페이지 요구사항 .md 15개 전체 분석 반영 — §5-1 메인 페이지(6개 섹션 상세), §5-4 서비스/솔루션(7개 페이지 정의 + 공통 레이아웃 + B.I.A + 세일즈 내러티브), §5-5 회사 소개(8개 섹션), §5-6 개인정보처리방침(14개 섹션 + 사이드바 TOC), §5-7 검색 결과(검색 로직·가중치 규칙), §5-9 에러 페이지(4개 에러 유형 + 위트 메시지), §5-10 쿠키 동의(배너+모달+GDPR/CCPA), §5-11 Sitemap.xml(언어별 생성), DB→Supabase PostgreSQL 확정, Action Items #9~#11 완료. 전 항목 해소 | Claude & Ashley |
| 2026-04-19 | AI·결제 기능 추가 요구사항 반영 — §5-13 Backend AI 기능(콘텐츠 자동 생성 + 다국어 자동 번역 KO→EN/ES/ZH/AR/RU), §5-14 결제 PG 연동(Stripe/Paddle 비교, Orders Collection 신규), §8 비용 구조(AI 번역 API·결제 PG 추가), §9 Collections(orders 신규, site-settings 업데이트), Action Items #13~#17 추가(AI 모델 선정, 번역 API 선정, zh·ar locale 추가 여부, PG 선정, 결제 도입 시점) | Claude & Ashley |
| 2026-04-19 | Staging DB 구성 확정 — 기존 Supabase 계정 내 신규 Staging 프로젝트 생성 확정(~$10/월 추가), §11 및 §8 비용 구조 업데이트, Action Item #18 완료 | Claude & Ashley |
| 2026-04-19 | zh/ar locale 확정 및 사이드 이펙트 전체 반영 — §2 지원 언어 6→8개(zh·ar 추가), 아랍어 RTL 레이아웃 사이드 이펙트 표 추가(Tailwind `rtl:` variant 적용 필요), §3-3 타이포그래피(Noto Sans SC·Cairo 웹폰트 추가), §5-11 Sitemap(sitemap-zh.xml·sitemap-ar.xml 추가), §5-13 번역 API Claude Haiku 확정(DeepL 아랍어 미지원으로 제외), §5-14 Stripe 확정·런칭 후 점진적 도입 확정·로드맵 5단계 추가, §6 Phase 5 언어 수 8개로 업데이트, §8 비용 Claude Haiku 통합 확정, §9 site-settings locales/rtlLocales 업데이트, §11 인프라 및 배포 환경 신규 추가(Local/Staging/Production 3단계, 브랜치 전략, Vercel 배포 워크플로우), Action Items #13~#17 완료·#18 Staging 서버 구성 추가 | Claude & Ashley |

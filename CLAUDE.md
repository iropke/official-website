# Iropke 공식 홈페이지 — Claude 작업 지침

> 이 파일은 작업 디렉터리(`D:\Claude\iropke\website`) 자동 로드용입니다.
> Claude 가 매 세션에서 이 파일을 우선 참조하여 일관된 컨텍스트를 유지합니다.
> 갱신은 Claude 가 직접 편집하거나 대표님이 수동 편집할 수 있습니다.

## 1. 프로젝트 개요

| 항목 | 값 |
|------|----|
| 프로젝트명 | Iropke 공식 홈페이지 (iropke.com) |
| 목적 | Payload CMS 기반 다국어(20개) 회사 홈페이지 개편 |
| 라이브 URL | https://official-website-topaz-gamma.vercel.app/en |
| GitHub | https://github.com/iropke/official-website (main = Production) |
| 로컬 경로 | `D:\Claude\iropke\website` |
| 기술 스택 | Next.js 16.2.3 (App Router) · Payload CMS 3.82.1 · TypeScript 5.7.3 · pnpm |
| 인프라 | Supabase PostgreSQL (us-east-1 MICRO) · Cloudinary · Resend · Vercel Pro |
| 지원 locale | en, zh, ja, de, fr, es, ko, pt, hi, ru, nl, it, ar, sv, th, pl, id, ms, da, tr (20개, 모든 select/switcher 공통 순서) — 단일 소스 `src/i18n/locales.ts` |

## 2. 현행 로드맵 (v2 — 2026-04-26 확정)

### 패러다임 전환 요지

기존 한국어 테스트 베이스 → **영문 단일 파이프라인 완성 → 다국어 확장** 으로 전환.
이유: 라틴 계열 확장 시 폰트 fallback / 줄간격 / 행 길이 등 라틴 공통 이슈 분산 검증을 회피.

### Phase A — 영문 단일 파이프라인 완성

| 단계 | 작업 | 상태 |
|------|------|------|
| 0 | Payload migration 전환 (옵션 B - clean reset + baseline + Vercel pipeline) | ✅ 2026-04-27 완료 |
| 0.5 | OS 언어 라우팅 미들웨어 (`src/middleware.ts`) | ✅ 2026-04-26 완료 |
| 1a | 에디터 요구사항 구체화 세션 (별도 1세션) | ✅ 2026-04-26 완료 (`references/requirements/editor_requirements_v2.md`) |
| 1b | **에디터 기능 완성** (editorialMedia 신규 + Phase 3 렌더 + Shiki + editorialTable 사용성) | ✅ 2026-05-09 완료 (PR #16/#17) |
| 1c | Insights (블로그) 목록 + 상세 — **영문** | ⏳ **다음 작업 진입점** |
| 2 | Project Inquiry 폼 + Resend 연동 — 영문 | 🟡 부분 완료 (PR #23) — `/api/inquiries` 백엔드 + 폼 wiring 완료. **잔여**: Resend 메일 발송 (stub만) / reCAPTCHA 점수 검증 |
| 3 | 첫화면 콘텐츠 관리 — 영문 | 대기 |
| 4 | Solution / Service 페이지 관리 — 영문 | 대기 |
| 5 | About / Team 페이지 관리 — 영문 | 대기 |
| 6 | SEO / Sitemap / Analytics — **다국어 크롤링 보조 장치 필수** (hreflang / sitemap.xml / robots.txt) | 🟡 부분 완료 — 의무 4종 (sitemap × 20 sub-sitemap / robots / hreflang / metadataBase) PR #21 머지. **잔여**: Analytics (GA4) 등록 / `NEXT_PUBLIC_SERVER_URL` Vercel 등록 / GSC·Bing 제출 — 모두 D-7 |
| T2 | **정적 페이지 4종** (404·500 / `/search` / `/privacy-policy` / `<CookieConsent>`) | ✅ 2026-05-09 완료 (PR #22). 9 locale 큐레이션 + 11 locale en fallback. references/ 외부화 |
| L20 | **Locale 8 → 20 일괄 확장** (LOCALES 중앙 상수 + Postgres ENUM clean baseline) | ✅ 2026-05-09 완료 (PR #18 + LangSwitcher fix PR #20). 운영 DB wipe + admin 신규 가입 완료 |

### Phase B — 다국어 확장 (Phase A 완료 후)

| 순번 | 언어군 | 작업 |
|------|--------|------|
| 1 | 라틴 (es/de/fr) | **번역 API admin UI 활성화** + manuallyEdited 플래그 + 첫 적용 검증 |
| 2 | 한국어 (ko) | Pretendard / IropkeBatangM 조판 최종 확인 |
| 3 | 키릴 (ru) | NotoSans Cyrillic 자형 검증 |
| 4 | 중국어 (zh) | NotoSansSC / SerifSC 자형 + 행 길이 회귀 |
| 5 | 아랍어 (ar) | RTL 레이아웃 회귀 + LangSwitcher dir 전환. **사전 검토 결과 별도 RTL CSS 패스 필요** — 상세 `references/rtl-audit-2026-05-09.md` |

## 3. 첫화면 라우팅 정책 (v2)

| 항목 | 정책 |
|------|------|
| `/` 진입 | 미들웨어가 OS 언어 자동 감지하여 `/<locale>` 로 리디렉션 |
| 우선순위 | 1) `NEXT_LOCALE` 쿠키 → 2) `Accept-Language` 헤더 → 3) `en` 기본값 |
| 구현 위치 | `src/middleware.ts` (matcher 로 `/admin`, `/api`, 정적 자원 제외) |
| 크롤러 영향 | Googlebot 등 Accept-Language 미설정 → `/en` 진입. 다른 언어는 sitemap/hreflang 으로 발견 |

## 4. 다국어 SEO 의무 항목 (Phase A 단계 6)

| 구현 항목 | 형태 | 상태 |
|----------|------|------|
| `app/[locale]/layout.tsx`의 `generateMetadata` | `alternates: { canonical, languages: { 'ko-KR': '/ko/...', 'en-US': '/en/...', ... } }` 9개 매핑 + `x-default` → en | ✅ 2026-05-09 |
| `app/sitemap.ts` | `generateSitemaps` 로 **언어별 sub-sitemap 분리** (`/sitemap/ko.xml` … `/sitemap/ar.xml`). `/sitemap.xml` 은 sitemap-index 자동 생성 | ✅ 2026-05-09 |
| `app/robots.ts` | 전부 Allow + `/admin`, `/api` 차단 + sitemap URL 명시 | ✅ 2026-05-09 |
| `<html lang="..." dir="...">` | `LocaleHtmlAttributes.tsx` 가 i18n 모듈의 LOCALE_HTML_LANG / LOCALE_DIRS 매핑으로 처리 (`ar` 만 RTL) | ✅ 2026-05-09 |

⚠ 누락 시 영문만 색인되고 다른 언어는 고아 페이지가 됨.

### ⚠ 런칭 전 필수 등록 (Vercel UI)

| 환경변수 | 값 | 사유 |
|---------|----|----|
| `NEXT_PUBLIC_SERVER_URL` | `https://www.iropke.com` (또는 최종 도메인) | 미등록 시 sitemap / robots / hreflang 의 절대 URL 이 `vercel.app` 도메인으로 발급되어 검색엔진이 잘못된 canonical 을 색인함. **현 운영 사이트의 트래픽 영향 차단을 위해 새 사이트 준비 완료 전까지 등록 보류** → Phase A 단계 6 (SEO/Sitemap/Analytics) 작업 직전 또는 D-7 체크리스트 시점에 등록 |

### 20 locale 단일 소스

| 항목 | 위치 |
|------|------|
| 20 locale 상수 (LOCALES, DEFAULT_LOCALE, LOCALE_LABELS_NATIVE/EN/ADMIN, LOCALE_DIRS, LOCALE_HTML_LANG, LOCALE_HREFLANG, LOCALE_INTL_TAG) | `src/i18n/locales.ts` |
| hreflang alternates 헬퍼 (buildAlternates, buildLocaleUrl, SITE_BASE_URL) | `src/i18n/alternates.ts` |
| DEFAULT_LOCALE | `'en'` (OS 언어 미매칭 시 영문 fallback) |

## 5. 핵심 정책

### 브랜치 정책

- 작업 브랜치: `feat/<topic>` 신규 생성
- 병합: `main` 직접 PR (develop 중간 단계 없음, 런칭 D-7 까지)
- Vercel Production = `main` 전용
- PR URL 패턴: https://github.com/iropke/official-website/compare/main...&lt;branch&gt;

### 개발 단위 정책

- **프론트 + 백엔드 + DB 한 세트씩 순차** (여러 기능 병렬 개발 금지)
- 한 세트 완료 = admin UI · API · 프론트 렌더 · 시각 검증까지 모두 통과

### 스키마 변경 정책 (2026-04-27 정착)

**핵심 원칙**

- ❌ ad-hoc `ALTER TABLE` / `CREATE TABLE` / `DROP COLUMN` (Supabase SQL Editor 직접) 금지
- ✅ 모든 schema 변경 = migration 파일 생성 + 코드와 함께 **동일 commit** + push
- ✅ Vercel build 가 `scripts/build.mjs` wrapper 를 통해 자동 migrate 적용
- ⚠ 로컬 `pnpm build` 는 migration 자동 실행 안 함 (사고 차단 — 의도)

**워크플로 (코드의 collection / global / 필드 / Lexical BlocksFeature 변경 직후)**

1. PowerShell 에서 `DATABASE_URL` 을 Session pooler 로 swap:

   ```powershell
   $env:DATABASE_URL = ((Get-Content .env | Where-Object { $_ -match '^DATABASE_URL_DIRECT=' }) -replace '^DATABASE_URL_DIRECT=', '').Trim()
   ```

2. `pnpm payload migrate:create --name <변경요약>` (예: `add-editorial-media`)
3. 생성된 `src/migrations/<ts>-<name>.ts` 검토 — 의도와 일치 확인
4. (선택) 로컬 적용: `pnpm payload migrate`
5. **코드 + migration 파일을 동일 commit** 으로 묶어서 push
6. Vercel build 가 자동 적용 (idempotent — 이미 적용된 migration 은 자동 skip)

**환경변수 두 가지**

| 변수 | 용도 | Port | 등록 위치 |
|------|------|------|----------|
| `DATABASE_URL` | runtime / 일반 쿼리 | 6543 (Transaction pooler) | `.env` + Vercel UI (모든 환경) |
| `DATABASE_URL_DIRECT` | Migration 실행 (DDL) | 5432 (Session pooler) | `.env` + Vercel UI (모든 환경) |

→ host 동일 (`aws-1-us-east-1.pooler.supabase.com`), port 만 다름.

⚠ Direct connection (`db.<ref>.supabase.co`) 는 IPv4 비호환으로 사용 금지. 반드시 Session pooler URL.

### 번역 정책

- 번역 트리거: **admin UI 수동 버튼만** 사용 (on-save hook 금지 — 대표님 영구 선호)
- 번역 API: Claude Haiku 단독 (`claude-haiku-4-5-20251001`)
- 원본 locale: **영문 (en)** — v2 에서 KO → EN 으로 전환됨
- `manuallyEdited` 플래그로 번역본 직접 수정 보존
- ANTHROPIC_API_KEY 는 Phase B 직전까지 미등록 유지 (비용 절감)

### 커밋 정책

- 로컬 git index.lock / FUSE truncation 이슈 시 GitHub 웹 에디터 활용
- 큰 변경 사항은 다중 파일 단위로 PR 묶기

## 6. 환경 정보

| 항목 | 값 |
|------|----|
| 프로덕션 도메인 | https://official-website-topaz-gamma.vercel.app (main 전용) |
| 프리뷰 도메인 패턴 | https://official-website-git-&lt;branch&gt;-iropkes-projects.vercel.app |
| Supabase 프로젝트 | `official-website` / ID `bxfzzkxqdnnxtnuwvbbt` / us-east-1 MICRO |
| Vercel 팀 / 프로젝트 | iropkes-projects / official-website |

## 7. 사용자 컨텍스트

| 항목 | 내용 |
|------|------|
| 사용자 | Ashley 대표님 (비개발자) |
| 소통 언어 | 한국어 (경어체) |
| 답변 형식 선호 | 한 눈에 구조 파악 가능한 테이블/목록 |
| 개발 위임 방식 | Claude 에게 작업 위임, 대표님은 검토 및 의사결정 |

## 8. 보류 / 후순위 (Phase A 동안 손대지 않음)

| 항목 | 사유 / 진입 시점 |
|------|---|
| 번역 API admin UI 버튼 | Phase B-1 직전에 한꺼번에 |
| `manuallyEdited` 플래그 스키마 | 동일 |
| ANTHROPIC_API_KEY 등록 | Phase B 직전까지 보류 |
| 한국어 콘텐츠 입력 | Phase B-2 단계에서 검증용으로만 |
| Supabase RLS 활성화 | Phase B 종료 후 런칭 직전 |
| `NEXT_PUBLIC_SERVER_URL` Vercel 등록 | **D-7 체크리스트 / Phase A 단계 6 SEO 마무리 시점**. 현 운영 사이트 트래픽 영향 차단 위해 새 사이트 준비 완료 전까지 등록 보류 |
| Google Search Console / Bing Webmaster sitemap 제출 | 위와 동일 시점 |
| GA4 (`NEXT_PUBLIC_GA_ID`) 등록 | D-7 |
| **RTL 전용 CSS 패스** (아랍어 대응) | Phase B-5 본 작업. 사전 검토 결과 `references/rtl-audit-2026-05-09.md` 참조 |
| `pnpm lint` 정상화 | 별도 태스크 (의존성 충돌). 의사결정 필요 — §10 |

## 9. 관련 메모리 (자동 로드 외 추가 참조용)

| 메모리 | 용도 |
|--------|------|
| `project_iropke_roadmap_v2.md` | 현행 로드맵 (이 파일과 동일 내용 + Phase B 상세) |
| `project_iropke_editor_requirements_v2.md` | Phase A 단계 1b 본 작업 진입점 (12단계 중 4번부터) |
| `project_iropke_payload_migrations.md` | Phase A 단계 0 작업 기록 (완료) |
| `feedback_iropke_schema_discipline.md` | **schema 변경 시 매번 적용할 영구 워크플로** |
| `reference_iropke_database_urls.md` | DATABASE_URL / DATABASE_URL_DIRECT 두 변수 운영 규칙 |
| `project_iropke_posts_phase2.md` | BlocksFeature 5종 스냅샷 (editorialMedia 가 6번째로 추가됨) |
| `project_iropke_translation_api.md` | Phase B-1 직전에 활성화 |
| `project_iropke_fonts.md` | 폰트 시스템 (라틴 검증용) |
| `project_iropke_launch_d7_checklist.md` | 런칭 직전 스테이지 분리 체크리스트 |
| `references/rtl-audit-2026-05-09.md` | 아랍어 RTL 사전 검토 — Phase B-5 진입 시 필독 |

## 10. 진행 기록 · 함정 · 의사결정 필요 항목

다른 채팅 세션에서 본 프로젝트 합류 시 가장 먼저 훑어볼 섹션. 매 사이클 갱신.

### 10.1 진행된 업무 (PR 별 — main 머지 완료)

| PR | 영역 | 핵심 산출물 |
|----|------|-----------|
| [#15·#16·#17](https://github.com/iropke/official-website/pull/17) | Phase A 1b 에디터 | editorialMedia 블록 + 6종 렌더러 (Shiki / qnaList / videoEmbed / rawHtml / editorialTable TSV) |
| [#18](https://github.com/iropke/official-website/pull/18) | **Locale 8 → 20 확장** | `src/i18n/locales.ts` 중앙 상수 (LOCALES + 4 라벨 맵 + DIRS/HTML_LANG/HREFLANG/INTL_TAG + isLocale/normalizeLocale/isRtl). Postgres 9 ENUM clean baseline 재생성 (`20260509_091136`). LangSwitcher 검색박스 + 3중 매칭. ⚠ 운영 DB wipe + admin 신규 가입 완료 |
| [#19](https://github.com/iropke/official-website/pull/19) | docs 동기화 | CLAUDE.md §1 (8→20) 반영 |
| [#20](https://github.com/iropke/official-website/pull/20) | LangSwitcher fix + admin 검색 | 데스크탑 nav dropdown right-align / 모바일 footer dropdown max-height + sticky search / Payload 기본 Localizer 를 검색 가능 커스텀(`LocaleSwitcherWithSearch`) 으로 교체 |
| [#21](https://github.com/iropke/official-website/pull/21) | Phase A 6 SEO 의무 4종 | `app/sitemap.ts` `generateSitemaps` 로 20 sub-sitemap (`en.xml…tr.xml`) + sitemap-index 자동 / `app/robots.ts` (`/admin`,`/api` 차단) / `src/i18n/alternates.ts` hreflang 헬퍼 / `[locale]/layout.tsx` 의 metadataBase + alternates 통합 / project-inquiry 의 server 래퍼 + client 자식 분리 / 아랍어 RTL 사전 검토 (§10.4) |
| [#22](https://github.com/iropke/official-website/pull/22) | T2 정적 페이지 4종 | 404 / 500 / 503 / 403 + `/search` (Posts·Pages title/excerpt 부분일치) + `/privacy-policy` (sticky TOC + scrollspy) + `<CookieConsent>` 배너+모달. 9 locale 큐레이션 + 11 locale en fallback. references/ 외부화 |
| [#23](https://github.com/iropke/official-website/pull/23) | Phase A 2 (부분) + Translate 5필드 | `/api/inquiries` route (multipart/JSON, RFP→Media `overrideAccess`, 서버 검증, ipAddress/submittedLocale 자동 기록). `/api/translate` 5필드 확장 (title/excerpt/metaTitle/metaDescription/content) + `lib/translation/lexicalWalker.ts` (Lexical 텍스트 노드 walker) |

### 10.2 진행하지 않은 업무 (의식적 보류 / 후속 잔여)

§8 표 참조. 핵심 잔여 항목:

| 항목 | 사유 / 진입 시점 |
|---|---|
| **단계 1c — Insights 영문 페이지** | 다음 작업 진입점. 1b 머지 + locale 확장 + 정적 페이지 정리 후 시작 |
| **단계 2 잔여** — Resend 메일 발송 + reCAPTCHA | Inquiry 백엔드 wiring 은 PR #23 완료. 메일 발송 stub 와 spam 검증만 잔여. RESEND_API_KEY 등록 시 활성화 |
| **단계 3 / 4 / 5** — 첫화면 / Solution·Service / About·Team 콘텐츠 관리 | Phase A 본 작업. **추가 시 반드시 `generateMetadata` + `buildAlternates(locale, path)` 한 쌍 같이 추가** (F2 함정) |
| **단계 6 잔여** — `NEXT_PUBLIC_SERVER_URL` Vercel 등록 / GSC·Bing 제출 / GA4 등록 | D-7 체크리스트. 새 사이트 미준비 시점에 등록하면 SERP 가 새 도메인을 canonical 로 잡아 현 운영 사이트 트래픽 잠식 |
| **Phase B-1** — 번역 API admin UI 활성화 + ANTHROPIC_API_KEY 등록 + manuallyEdited 플래그 + 11 locale 빈 콘텐츠 채움 (`errorMessages.ts`, CookieConsent, privacy-policy 등) | Phase A 종료 후 |
| **Phase B-5** — RTL 전용 CSS 패스 | Phase B-5 본 작업. 사전 검토 결과 §10.4 + `references/rtl-audit-2026-05-09.md` (14개 모듈 × 약 58 physical 속성) |
| **Lexical 블록 텍스트 번역 보강** | 현재 walker 는 `text` 노드만 순회. editorialMedia.caption / editorialTable.cells / qnaList / videoEmbed / rawHtml 은 블록 fields 라 미도달 — Phase B-1 직전 블록별 hook 보강 필요 |
| **`pnpm lint` 정상화** | F5 함정 / D2 의사결정 필요 |

### 10.3 주의해야 할 함정 (Pitfalls)

다른 세션이 같은 영역 작업 시 반복 실수 방지용.

| # | 함정 | 회피 방법 |
|---|---|---|
| F1 | **Client component (`'use client'`) 에 `generateMetadata` 추가 금지** — Next.js 가 export 차단. project-inquiry 가 이 이유로 server 래퍼 (`page.tsx`) + client 자식 (`ProjectInquiryClient.tsx`) 으로 분리됨 | 새 페이지가 form / hook 등 client 만 가능하면 분리 패턴 적용. `page.tsx` 가 metadata + `<ClientComponent />` 만 렌더 |
| F2 | **layout-level `alternates` 가 자식 페이지에 상속됨** — `[locale]/layout.tsx` 의 `generateMetadata` 가 홈 URL alternates 를 깔아두고, 페이지가 자체 `generateMetadata` 미정의 시 모든 자식이 홈 alternates 를 그대로 노출 | 새 라우트 추가 시 항상 `generateMetadata` + `buildAlternates(locale, '/<path>')` 한 쌍 같이 추가 |
| F3 | **DEFAULT_LOCALE 변경 시 다중 위치 동기화** — `src/i18n/locales.ts` 의 `DEFAULT_LOCALE` 과 `src/middleware.ts` 의 `MIDDLEWARE_FALLBACK_LOCALE` 두 곳. 현재 둘 다 `'en'` 이지만 의미가 다름 (Payload field fallback vs. Accept-Language 매칭 실패 시 리디렉션). 변경 시 둘 의도 분리해서 검토 | 단일 소스 마이그레이션 시 두 곳 동시 변경, 코드 주석 확인 |
| F4 | **sitemap baseUrl 누락** — `NEXT_PUBLIC_SERVER_URL` 미등록 시 `process.env.VERCEL_URL` 폴백 → 프리뷰/프로덕션 모두 `vercel.app` 도메인이 검색엔진에 색인됨. SEO 기관 손상 | D-7 체크리스트에 등록. §8 참조 |
| F5 | **pnpm v10 transitive 미hoist** — `eslint.config.mjs` 가 `@eslint/eslintrc` 를 직접 import 하지만 `package.json` 미선언. 같은 이유로 `pg`, `qs-esm` 등 transitive deps 도 직접 import 불가 | (eslint) §10.5 D2 결정 후 처리. (pg/qs-esm) 직접 import 회피 — `URLSearchParams`, payload 의 자체 hook 등으로 대체 |
| F6 | **schema 변경 시 ad-hoc SQL 금지** — Supabase SQL Editor 직접 ALTER 금지. §5 스키마 변경 정책 6단계 준수 | 코드 변경 직후 `pnpm payload migrate:create` → 동일 commit 푸시 |
| F7 | **Posts `publishedLocales` 필터링 누락** — 페이지 쿼리에서 `where: { publishedLocales: { contains/equals: locale } }` 미지정 시 다른 언어 미공개 글이 노출됨. sitemap 도 본 locale 공개 글만 포함해야 함 | 새 Posts 쿼리 추가 시 publishedLocales 조건 항상 포함 |
| F8 | **`<html lang dir>` 는 클라이언트에서만 갱신됨** — Next.js route group 경계에서 `<html>` 두 번 열 수 없어 `(frontend)/layout.tsx` 가 SSR 초기값으로 발급 → `LocaleHtmlAttributes` 가 useEffect 로 갱신. 검색봇이 JS 미실행 시 모든 locale 페이지가 SSR 초기값으로 보임 | hreflang `<link>` 와 sitemap 의 alternates 가 신호 보강. 정확도 더 필요하면 미들웨어 path 기반 `<html>` SSR 라우팅 재설계 (현재 보류) |
| F9 | **Postgres ENUM 순서 in-place 변경 불가** — `ALTER TYPE … ADD VALUE` 는 가능하지만 reordering 은 불가. locale 추가/순서 변경 시 PR #18 처럼 clean baseline 재생성 필요. 운영 콘텐츠 누적 후에는 데이터 마이그레이션 계획 필수 | 신규 locale 추가 시: ① LOCALES 배열 갱신 → ② `pnpm payload generate:types` → ③ baseline 재생성 또는 `ADD VALUE` migration 결정 |
| F10 | **다중 브랜치가 CLAUDE.md 를 동시에 편집하면 rebase 시 광범위 충돌** — PR #21~#23 모두 §10/갱신이력에 entry 추가했고, main 위로 rebase 시 매 PR 마다 docs commit 충돌. 코드 변경에는 영향 없으나 docs commit 만 skip 하고 별도 한줄로 다시 추가하는 방식이 깨끗 | 후행 브랜치는 docs 변경을 **단일 한줄 갱신이력 entry** 로만 두고, §10 본문은 main 머지 후 별도 docs PR 로 갱신 |
| F11 | **Force-push 직전 워크트리에 미커밋 conflict marker 잔존 위험** — cherry-pick 중 충돌 해결 후 일부 markers 가 라인 83~95 같은 떨어진 위치에 남아있어도 typecheck 가 안 잡을 수 있음 (Edit 도구가 markers 를 데이터로 인식). Edit 후 반드시 `grep -c "<<<<<\|>>>>>" file` 로 확인 | force-push 전 `git status` + `grep -rn "<<<<<\|======\|>>>>>" src/` 둘 다 통과 확인 |
| F12 | **Payload 기본 Localizer 와 커스텀 LocaleSwitcher 동시 표시 위험** — `admin.components.actions` 에 커스텀 등록만 하면 둘 다 표시됨. 커스텀 컴포넌트 co-located CSS 가 `.app-header__localizer` 를 `display: none !important` 로 숨겨야 함 | LocaleSwitcherWithSearch/index.css 의 hide rule 유지 |

### 10.4 아랍어 사전 검토 사항 (프론트엔드 작업 시)

**결론: `dir="rtl"` 만으로는 부족. 본격 RTL 작업 진입 시 사전 점검표.**

| 사전 검토 항목 | 위치 / 확인 포인트 |
|---|---|
| **High 위험: SubCarousel** | 좌/우 화살표 버튼 `left/right` 고정 + SVG path 자체 방향 (`M11 3 5 9l6 6` 등) + `ArrowRight→next` 키보드 핸들러 — 3 곳 모두 RTL 분기 필요 |
| **High 위험: SearchToggle** | 검색 입력창 펼침 애니메이션 `translateX(-10px)→0`. RTL 에서 우측 슬라이드되어야 함 |
| **Medium: Header 모바일 패널** | `transform: translateX(20px)` 슬라이드인 + 활성 표시자 `border-left: 3px` |
| **Medium: FloatingActions 호버 라벨** | `right: calc(100%+12px)` — RTL 에서 화면 밖으로 잘림 |
| **Medium: ProjectInquiry 폼** | 검증 체크마크 `right: 18px` + 체크 글리프 `border-left + rotate(-45deg)` |
| **기계적 치환 ~30 줄** | `margin-left/right` → `margin-inline-start/end`, `padding-left/right` → `padding-inline`, `border-left/right` → `border-inline-start/end`, 절대좌표 `left/right` → `inset-inline-start/end` |
| **SVG 화살표 6개** | Hero / AIOSGrid / Insights / CtaBanner / SubCarousel — `:dir(rtl) { transform: scaleX(-1); }` 또는 컴포넌트 분기 |
| **구조 변경 불요** | Grid / Flex `gap`, `space-between`, `flex-end` 는 자동 반전. 14개 모듈 중 5종은 0개 physical 속성 |
| **하지 말 것** | `float: left/right` 신규 사용 금지. `direction: ltr` 하드코딩 금지. 컴포넌트별로 `[dir="rtl"]` 셀렉터 남발하지 말고 logical property 우선 |

상세 audit (14개 CSS 모듈 × 약 58개 physical 속성 위치 / 행번호) → `references/rtl-audit-2026-05-09.md`.

### 10.5 의사결정 필요 항목

| ID | 항목 | 옵션 | 권고 / 상태 |
|---|---|---|---|
| D1 | sitemap baseUrl 등록 시점 | A) 즉시 등록 (vercel.app 노출) / B) D-7 / C) Phase A 단계 6 SEO 마무리 시점 | **B 또는 C** — 현 운영 사이트 트래픽 보존 우선 |
| D2 | `pnpm lint` 정상화 방식 | A) `package.json` devDependency 에 `@eslint/eslintrc` 추가 / B) `eslint-config-next` 업데이트 시도 / C) `eslint.config.mjs` 를 FlatCompat 미사용 직접 flat config 로 마이그레이션 | **A 우선 시도** (1줄 변경, 가장 단순). 실패 시 C |
| D3 | LOCALES 단일 소스 통합 | (이전 결정) | **해결 완료** — PR #18 머지 |
| D4 | 미들웨어 locale 하드코딩 제거 | (이전 결정) | **해결 완료** — PR #18 머지 |
| D5 | client-only 페이지의 generateMetadata 패턴 정착 | 매번 server 래퍼 + client 자식 분리 vs. 별도 metadata 파일 | server 래퍼 분리 패턴 정착 (project-inquiry 가 reference 구현체) |
| D6 | RTL 패스 진입 시점 | A) Phase B-5 (현 계획) / B) Phase A 단계 6 SEO 와 함께 / C) 별도 사이클 | **A 유지** — 현 단계는 영문 단일 파이프라인 완성 우선 |
| D7 | Resend 메일 발송 시점 | A) 단계 1c 와 함께 / B) 단계 2 마무리 시점 / C) D-7 직전 | **B** — Phase A 2 의 자연스러운 잔여물. RESEND_API_KEY 등록 + 템플릿 결정 필요 |
| D8 | reCAPTCHA 도입 여부/방식 | A) reCAPTCHA v3 점수 검증 / B) hCaptcha 등 대안 / C) `notRobot` 체크박스로 충분 | 결정 미정. Inquiries 콜렉션에 `recaptchaScore` 필드는 이미 존재 |
| D9 | Lexical 블록 텍스트 번역 hook 위치 | A) walker 확장 (블록별 매핑) / B) 컬렉션 hook 에서 블록 순회 | A 권장 — walker 가 단일 진입점 |

### 10.4 아랍어 사전 검토 사항 (프론트엔드 작업 시)

**결론: `dir="rtl"` 만으로는 부족. 본격 RTL 작업 진입 시 사전 점검표.**

| 사전 검토 항목 | 위치 / 확인 포인트 |
|---|---|
| **High 위험: SubCarousel** | 좌/우 화살표 버튼 `left/right` 고정 + SVG path 자체 방향 (`M11 3 5 9l6 6` 등) + `ArrowRight→next` 키보드 핸들러 — 3 곳 모두 RTL 분기 필요 |
| **High 위험: SearchToggle** | 검색 입력창 펼침 애니메이션 `translateX(-10px)→0`. RTL 에서 우측 슬라이드되어야 함 |
| **Medium: Header 모바일 패널** | `transform: translateX(20px)` 슬라이드인 + 활성 표시자 `border-left: 3px` |
| **Medium: FloatingActions 호버 라벨** | `right: calc(100%+12px)` — RTL 에서 화면 밖으로 잘림 |
| **Medium: ProjectInquiry 폼** | 검증 체크마크 `right: 18px` + 체크 글리프 `border-left + rotate(-45deg)` |
| **기계적 치환 ~30 줄** | `margin-left/right` → `margin-inline-start/end`, `padding-left/right` → `padding-inline`, `border-left/right` → `border-inline-start/end`, 절대좌표 `left/right` → `inset-inline-start/end` |
| **SVG 화살표 6개** | Hero / AIOSGrid / Insights / CtaBanner / SubCarousel — `:dir(rtl) { transform: scaleX(-1); }` 또는 컴포넌트 분기 |
| **구조 변경 불요** | Grid / Flex `gap`, `space-between`, `flex-end` 는 자동 반전. 14개 모듈 중 5종은 0개 physical 속성 |
| **하지 말 것** | `float: left/right` 신규 사용 금지. `direction: ltr` 하드코딩 금지. 컴포넌트별로 `[dir="rtl"]` 셀렉터 남발하지 말고 logical property 우선 |

상세 audit (14개 CSS 모듈 × 약 58개 physical 속성 위치 / 행번호) → `references/rtl-audit-2026-05-09.md`.

### 10.5 의사결정 필요 항목

| ID | 항목 | 옵션 | 권고 |
|---|---|---|---|
| D1 | sitemap baseUrl 등록 시점 | A) 즉시 등록 (vercel.app 노출) / B) D-7 / C) Phase A 단계 6 SEO 마무리 시점 | **B 또는 C** — 현 운영 사이트 트래픽 보존 우선 |
| D2 | `pnpm lint` 정상화 방식 | A) `.npmrc` 에 `public-hoist-pattern[]=*eslint*` 추가 (1차 에러만 해결) / B) `eslint-config-next` 업데이트 시도 / C) `eslint.config.mjs` 를 FlatCompat 미사용 직접 flat config 로 마이그레이션 / D) 별도 태스크로 분리 후 `feat/seo-essentials` 는 lint 검증 없이 진행 | **D + 후속 별도 태스크에서 C** — 디펜던시 충돌은 본 PR 범위 외 |
| D3 | LOCALES 단일 소스 통합 | (이전 결정) | **해결 완료** — PR #18 의 20 locale 확장이 main 으로 통합되어 `src/i18n/locales.ts` 가 단일 소스로 정착 |
| D4 | 미들웨어 locale 하드코딩 제거 | (이전 결정) | **해결 완료** — PR #18 머지로 `src/middleware.ts` 가 LOCALES import 사용 |
| D5 | client-only 페이지의 generateMetadata 패턴 정착 | 매번 server 래퍼 + client 자식 분리 vs. 별도 metadata 파일 | server 래퍼 분리 패턴 정착 (project-inquiry 가 reference 구현체) |
| D6 | RTL 패스 진입 시점 | A) Phase B-5 (현 계획) / B) Phase A 단계 6 SEO 와 함께 / C) 별도 사이클 | **A 유지** — 현 단계는 영문 단일 파이프라인 완성 우선 |

---

**갱신 이력**

| 날짜 | 변경 |
|------|------|
| 2026-04-26 | 초안 생성. v2 로드맵 / OS 라우팅 / SEO 의무 항목 / 번역 패러다임 전환 (KO→EN) 반영 |
| 2026-04-27 | Phase A 단계 0 완료 (옵션 B clean reset + baseline migration + scripts/build.mjs Vercel pipeline). 스키마 변경 정책 워크플로 정식화. DATABASE_URL_DIRECT (Session pooler 5432) 도입. Payload 3.82.1 → 3.83.0 정렬 |
| 2026-05-09 | **8 → 20 locale 일괄 확장** (PR #18 머지). 신규 12개: ja, pt, hi, nl, it, sv, th, pl, id, ms, da, tr. 모든 select/switcher 공통 순서 (en→zh→ja→de→fr→es→ko→pt→hi→ru→nl→it→ar→sv→th→pl→id→ms→da→tr). `src/i18n/locales.ts` 중앙 상수 (LOCALES, LOCALE_LABELS_NATIVE/EN/ADMIN, LOCALE_DIRS, LOCALE_HTML_LANG, LOCALE_HREFLANG, LOCALE_INTL_TAG, isLocale, normalizeLocale, isRtl). LangSwitcher 검색박스 + 3중 매칭(native/EN/code). Postgres 9 ENUM clean baseline 재생성 (구 baseline 폐기 + drop schema + 신규 baseline `20260509_091136`). 후행 브랜치 `feat/seo-essentials` / `feat/static-pages` / `feat/inquiry-translate` 모두 새 main 위로 rebase + force-push. ⚠ 운영 DB 전체 wipe — admin 계정 첫 부팅 시 `/admin/create-first-user` 로 재생성 필요 |
| 2026-05-09 | Phase A 단계 6 SEO 의무 4종 부분 완료 (PR #21, `feat/seo-essentials`). `src/i18n/alternates.ts` (hreflang 헬퍼, 20 locale × LOCALE_HREFLANG) 신규. `app/sitemap.ts` `generateSitemaps` 로 locale 별 sub-sitemap 분리 (sitemap-index 자동 생성). `app/robots.ts` (`/admin`, `/api` 차단). 20개 hreflang + `x-default` → en. project-inquiry 를 server 래퍼 + client 자식으로 분리 (client component 의 generateMetadata 제약 회피). 아랍어 RTL 사전 검토 → `references/rtl-audit-2026-05-09.md`. CLAUDE.md §10 (진행 기록 / 함정 / 의사결정) 신설 |
| 2026-05-09 | T2 정적 페이지 4종 (404·500 / `/search` / `/privacy-policy` / `<CookieConsent>`) 1차 완료 (PR #22, `feat/static-pages`). 9 locale 큐레이션 + 11 locale en fallback (errorMessages.ts). references/ 폴더 git 외부 관리 정책 정착 (.gitignore + 60 파일 untrack). 콘텐츠 SSOT 외부 위치 (`D:/Claude/iropke/references/contents/`) |
| 2026-05-09 | Project Inquiry 폼 + Translate API 5필드 확장 (PR #23, `feat/inquiry-translate`). **(1)** `/api/inquiries` route 신설 — multipart/JSON, RFP 파일 → Media `overrideAccess` 업로드, 서버 검증, ipAddress/submittedLocale 자동 기록. `ProjectInquiryClient.tsx` 가 fetch FormData 로 전환 + `submitting`/`submitError` 상태. Resend 메일 stub. **(2)** `/api/translate` 5필드 확장 (title/excerpt/metaTitle/metaDescription/content) + `lib/translation/lexicalWalker.ts` (Lexical 텍스트 노드 walker). meta 중첩 자동 조립. ANTHROPIC_API_KEY 미설정 시 503 가드 |
| 2026-05-09 | LangSwitcher 사용성 fix + admin 검색 가능 Localizer (PR #20). 데스크탑 nav dropdown right-align (`right: -1px`) — 우측 짤림 해소. 모바일 footer dropdown 단일 스크롤 컨테이너 (`max-height: 70vh` + sticky `.searchRow`) — 하단 짤림 해소. Payload 기본 `<Localizer/>` 를 검색 가능 커스텀 컴포넌트(`LocaleSwitcherWithSearch`) 로 교체 (`admin.components.actions` 등록 + co-located CSS 로 기본 hide). |
| 2026-05-09 | §10 종합 갱신 (PR #24). 진행/미진행/함정/의사결정 4 카테고리를 PR #18~#23 머지 후 현재 상태로 일괄 정렬. 함정 F9~F12 신설 (Postgres ENUM 재정렬 불가 / 다중 브랜치 CLAUDE.md 충돌 / force-push 전 conflict marker 검증 / 기본 Localizer 동시 표시 위험). 의사결정 D7~D9 신설 (Resend 시점 / reCAPTCHA / Lexical 블록 hook 위치) |

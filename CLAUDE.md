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

## 2. 로드맵 (v2 — 2026-04-26 확정)

### 패러다임

기존 한국어 테스트 베이스 → **영문 단일 파이프라인 완성 → 다국어 확장** 으로 전환.
이유: 라틴 계열 확장 시 폰트 fallback / 줄간격 / 행 길이 등 라틴 공통 이슈 분산 검증을 회피.

### Phase A — 영문 단일 파이프라인 완성

| 단계 | 작업 | 상태 / 관련 PR |
|------|------|------|
| 0 | Payload migration 전환 (옵션 B - clean reset + baseline + Vercel pipeline) | ✅ 2026-04-27 |
| 0.5 | OS 언어 라우팅 미들웨어 (`src/middleware.ts`) | ✅ 2026-04-26 ([#12](https://github.com/iropke/official-website/pull/12)) |
| 1a | 에디터 요구사항 구체화 (별도 1세션, `references/requirements/editor_requirements_v2.md`) | ✅ 2026-04-26 |
| 1b | 에디터 기능 완성 (editorialMedia + 6종 블록 렌더 + Shiki + editorialTable TSV) | ✅ 2026-05-09 ([#14](https://github.com/iropke/official-website/pull/14) · [#16](https://github.com/iropke/official-website/pull/16) · [#17](https://github.com/iropke/official-website/pull/17)) |
| **1c** | **Insights (블로그) 목록 + 상세 — 영문** | ⏳ **다음 작업 진입점** |
| 2 | Project Inquiry 폼 + Resend 연동 — 영문 | 🟡 부분 ([#23](https://github.com/iropke/official-website/pull/23)) — 백엔드 + 폼 wiring 완료. **잔여**: Resend 메일 발송 (stub) / reCAPTCHA |
| 3 | 첫화면 콘텐츠 관리 — 영문 | 대기 |
| 4 | Solution / Service 페이지 관리 — 영문 | 대기 |
| 5 | About / Team 페이지 관리 — 영문 | 대기 |
| 6 | SEO / Sitemap / Analytics — 다국어 크롤링 보조 장치 | 🟡 부분 ([#21](https://github.com/iropke/official-website/pull/21)) — 의무 4종 완료. **잔여**: GA4 / `NEXT_PUBLIC_SERVER_URL` Vercel 등록 / GSC·Bing 제출 (모두 D-7) |
| T2 | 정적 페이지 4종 (404·500 / `/search` / `/privacy-policy` / `<CookieConsent>`) | ✅ 2026-05-09 ([#22](https://github.com/iropke/official-website/pull/22)) — 9 locale 큐레이션 + 11 locale en fallback |
| L20 | Locale 8 → 20 일괄 확장 (LOCALES 중앙 상수 + Postgres ENUM clean baseline) | ✅ 2026-05-09 ([#18](https://github.com/iropke/official-website/pull/18) + [#20](https://github.com/iropke/official-website/pull/20) LangSwitcher fix) — 운영 DB wipe + admin 신규 가입 완료 |

### Phase B — 다국어 확장 (Phase A 완료 후)

| 순번 | 언어군 | 작업 |
|------|--------|------|
| 1 | 라틴 (es/de/fr) | 번역 API admin UI 활성화 + manuallyEdited 플래그 + 첫 적용 검증 |
| 2 | 한국어 (ko) | Pretendard / IropkeBatangM 조판 최종 확인 |
| 3 | 키릴 (ru) | NotoSans Cyrillic 자형 검증 |
| 4 | 중국어 (zh) | NotoSansSC / SerifSC 자형 + 행 길이 회귀 |
| 5 | 아랍어 (ar) | RTL 레이아웃 회귀 + LangSwitcher dir 전환. 별도 RTL CSS 패스 필요 → §9 F8 + `references/rtl-audit-2026-05-09.md` |

## 3. 첫화면 라우팅 정책 (v2)

| 항목 | 정책 |
|------|------|
| `/` 진입 | 미들웨어가 OS 언어 자동 감지하여 `/<locale>` 로 리디렉션 |
| 우선순위 | 1) `NEXT_LOCALE` 쿠키 → 2) `Accept-Language` 헤더 → 3) `en` 기본값 |
| 구현 위치 | `src/middleware.ts` (matcher 로 `/admin`, `/api`, 정적 자원 제외) |
| 크롤러 영향 | Googlebot 등 Accept-Language 미설정 → `/en` 진입. 다른 언어는 sitemap/hreflang 으로 발견 |

## 4. 다국어 SEO 의무 항목

| 구현 항목 | 형태 | 상태 |
|----------|------|------|
| `app/[locale]/layout.tsx`의 `generateMetadata` | `alternates: { canonical, languages: { ... } }` 20개 매핑 + `x-default` → en | ✅ |
| `app/sitemap.ts` | `generateSitemaps` 로 언어별 sub-sitemap 분리 (`/sitemap/en.xml` … `/sitemap/tr.xml`) + sitemap-index 자동 | ✅ |
| `app/robots.ts` | 전부 Allow + `/admin`, `/api` 차단 + sitemap URL 명시 | ✅ |
| `<html lang="..." dir="...">` | `LocaleHtmlAttributes.tsx` 가 `LOCALE_HTML_LANG` / `LOCALE_DIRS` 매핑으로 처리 (`ar` 만 RTL) | ✅ |

⚠ 누락 시 영문만 색인되고 다른 언어는 고아 페이지가 됨.

### 런칭 전 필수 등록 (Vercel UI)

| 환경변수 | 값 | 사유 / 시점 |
|---------|----|----|
| `NEXT_PUBLIC_SERVER_URL` | `https://www.iropke.com` (또는 최종 도메인) | 미등록 시 sitemap / robots / hreflang 의 절대 URL 이 `vercel.app` 도메인으로 발급되어 검색엔진이 잘못된 canonical 색인. **D-7 체크리스트 시점에 등록** (현 운영 사이트 트래픽 보존) |

### 20 locale 단일 소스

| 항목 | 위치 |
|------|------|
| 20 locale 상수 (LOCALES, DEFAULT_LOCALE, LOCALE_LABELS_NATIVE/EN/ADMIN, LOCALE_DIRS, LOCALE_HTML_LANG, LOCALE_HREFLANG, LOCALE_INTL_TAG) | `src/i18n/locales.ts` |
| hreflang alternates 헬퍼 (`buildAlternates`, `buildLocaleUrl`, `SITE_BASE_URL`) | `src/i18n/alternates.ts` |
| DEFAULT_LOCALE | `'en'` (OS 언어 미매칭 시 영문 fallback) |

## 5. 핵심 정책

### 브랜치 정책

- 작업 브랜치: `feat/<topic>` 신규 생성
- 병합: `main` 직접 PR (develop 중간 단계 없음, 런칭 D-7 까지)
- Vercel Production = `main` 전용
- PR URL 패턴: https://github.com/iropke/official-website/compare/main...&lt;branch&gt;
- 머지 후 원격 브랜치는 정리 (혼선 방지)

### 개발 단위 정책

- **프론트 + 백엔드 + DB 한 세트씩 순차** (여러 기능 병렬 개발 금지)
- 한 세트 완료 = admin UI · API · 프론트 렌더 · 시각 검증까지 모두 통과

### 스키마 변경 정책 (2026-04-27 정착)

**핵심 원칙**

- ❌ ad-hoc `ALTER TABLE` / `CREATE TABLE` / `DROP COLUMN` (Supabase SQL Editor 직접) 금지
- ✅ 모든 schema 변경 = migration 파일 생성 + 코드와 함께 **동일 commit** + push
- ✅ Vercel build 가 `scripts/build.mjs` wrapper 를 통해 자동 migrate 적용
- ⚠ 로컬 `pnpm build` 는 migration 자동 실행 안 함 (사고 차단 — 의도)

**워크플로**

1. PowerShell 에서 `DATABASE_URL` 을 Session pooler 로 swap:

   ```powershell
   $env:DATABASE_URL = ((Get-Content .env | Where-Object { $_ -match '^DATABASE_URL_DIRECT=' }) -replace '^DATABASE_URL_DIRECT=', '').Trim()
   ```

2. `pnpm payload migrate:create --name <변경요약>`
3. 생성된 `src/migrations/<ts>-<name>.ts` 검토
4. (선택) 로컬 적용: `pnpm payload migrate`
5. **코드 + migration 파일을 동일 commit** 으로 묶어서 push
6. Vercel build 가 자동 적용 (idempotent)

**환경변수 두 가지**

| 변수 | 용도 | Port | 등록 위치 |
|------|------|------|----------|
| `DATABASE_URL` | runtime / 일반 쿼리 | 6543 (Transaction pooler) | `.env` + Vercel UI (모든 환경) |
| `DATABASE_URL_DIRECT` | Migration 실행 (DDL) | 5432 (Session pooler) | `.env` + Vercel UI (모든 환경) |

→ host 동일 (`aws-1-us-east-1.pooler.supabase.com`), port 만 다름. Direct connection (`db.<ref>.supabase.co`) 은 IPv4 비호환 사용 금지.

### 번역 정책

- 번역 트리거: **admin UI 수동 버튼만** 사용 (on-save hook 금지 — 영구 선호)
- 번역 API: Claude Haiku 단독 (`claude-haiku-4-5-20251001`)
- 원본 locale: **영문 (en)**
- `manuallyEdited` 플래그로 번역본 직접 수정 보존
- ANTHROPIC_API_KEY 는 Phase B 직전까지 미등록 (비용 절감)

### 커밋 / docs 편집 정책

- 로컬 git index.lock / FUSE truncation 이슈 시 GitHub 웹 에디터 활용
- 큰 변경 사항은 다중 파일 단위로 PR 묶기
- **CLAUDE.md 본문 편집은 한 번에 한 PR 에서만** — 다중 브랜치 병렬 작업 시 후행 브랜치는 갱신이력 한 줄만 추가하고, 본문은 별도 docs PR 로 main 머지 후 갱신 (rebase 충돌 방지, F1 참조)

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

## 8. 잔여 / 보류 / 진입 시점

(다음 작업 진입점부터 D-7 체크리스트까지 — 위에서 아래로 시간순)

| 카테고리 | 항목 | 진입 시점 |
|---|---|---|
| **다음 진입점** | 단계 1c — Insights 영문 페이지 | 즉시 (1b/locale/static-pages 모두 완료) |
| Phase A 잔여 | 단계 2 — Resend 메일 발송 활성화 + reCAPTCHA 점수 검증 | RESEND_API_KEY 등록 후 |
| Phase A 잔여 | 단계 3 / 4 / 5 — 첫화면 / Solution·Service / About·Team 콘텐츠 관리 | Phase A 본 작업 (페이지 추가 시 F2 준수) |
| Phase B-1 | 번역 API admin UI 버튼 활성화 + ANTHROPIC_API_KEY 등록 + `manuallyEdited` 플래그 + 11 locale 빈 콘텐츠 채움 (`errorMessages.ts`, CookieConsent, privacy-policy 등) | Phase A 종료 후 |
| Phase B-1 | Lexical 블록 텍스트 번역 walker 보강 (editorialMedia.caption / editorialTable.cells / qnaList / videoEmbed / rawHtml — 현재 `text` 노드만 순회) | Phase B-1 직전 |
| Phase B-2 | 한국어 콘텐츠 입력 (검증용) | Phase B-2 |
| Phase B-5 | RTL 전용 CSS 패스 (아랍어) — §9 F8 + `references/rtl-audit-2026-05-09.md` 14개 모듈 × 약 58 physical 속성 | Phase B-5 |
| **D-7** | `NEXT_PUBLIC_SERVER_URL` Vercel 등록 | D-7 (현 운영 사이트 트래픽 보존) |
| **D-7** | Google Search Console / Bing Webmaster sitemap 제출 | D-7 |
| **D-7** | GA4 (`NEXT_PUBLIC_GA_ID`) 등록 | D-7 |
| 별도 태스크 | Supabase RLS 활성화 | Phase B 종료 후 런칭 직전 |
| 별도 태스크 | `pnpm lint` 정상화 (eslint 의존성 충돌) | §10 D2 결정 후 |

## 9. 함정 (Pitfalls)

다른 세션이 같은 영역 작업 시 반복 실수 방지용. 활성 함정만 — 해결된 함정은 갱신이력 참조.

| # | 함정 | 회피 방법 |
|---|---|---|
| F1 | **다중 브랜치 CLAUDE.md 동시 편집 → rebase 광범위 충돌**. PR #21~#23 모두 §10 본문 편집 후 main 위 rebase 시 매번 충돌. force-push 직전 conflict marker 잔존 위험까지 수반 (Edit 도구가 markers 를 데이터로 인식) | §5 docs 편집 정책 준수: 후행 브랜치는 갱신이력 한 줄만, 본문은 별도 docs PR. force-push 전 `git status` + `grep -rn "<<<<<\|======\|>>>>>" src/` 둘 다 통과 확인 |
| F2 | **layout-level `alternates` 가 자식 페이지에 상속됨** — `[locale]/layout.tsx` 의 홈 alternates 가 자식 페이지에 그대로 노출됨 (자체 generateMetadata 미정의 시) | 새 라우트 추가 시 항상 `generateMetadata` + `buildAlternates(locale, '/<path>')` 한 쌍 같이 추가 |
| F3 | **Client component (`'use client'`) 에 `generateMetadata` 추가 금지** — Next.js 가 export 차단. project-inquiry 가 server 래퍼 (`page.tsx`) + client 자식 (`ProjectInquiryClient.tsx`) 으로 분리됨 | form / hook 등 client 만 가능하면 분리 패턴 적용. `page.tsx` 가 metadata + `<ClientComponent />` 만 렌더 |
| F4 | **DEFAULT_LOCALE 변경 시 다중 위치 동기화** — `src/i18n/locales.ts` 의 `DEFAULT_LOCALE` 과 `src/middleware.ts` 의 `MIDDLEWARE_FALLBACK_LOCALE` 두 곳. 의미 다름 (Payload field fallback vs. Accept-Language 매칭 실패 시 리디렉션) | 변경 시 두 곳 의도 분리해서 검토 |
| F5 | **sitemap baseUrl 누락** — `NEXT_PUBLIC_SERVER_URL` 미등록 시 `process.env.VERCEL_URL` 폴백 → `vercel.app` 도메인 색인됨 (SEO 기관 손상) | D-7 체크리스트에 등록 (§8) |
| F6 | **pnpm v10 transitive 미hoist** — `eslint.config.mjs` 가 `@eslint/eslintrc` 직접 import 하지만 `package.json` 미선언. `pg`, `qs-esm` 등 transitive deps 도 직접 import 불가 | (eslint) §10 D2 결정 후. (pg/qs-esm) 직접 import 회피 — `URLSearchParams` / payload hook 등으로 대체 |
| F7 | **schema 변경 시 ad-hoc SQL 금지** — Supabase SQL Editor 직접 ALTER 금지 | §5 스키마 변경 정책 6단계 준수 |
| F8 | **Posts `publishedLocales` 필터링 누락** — 페이지 쿼리 / sitemap 모두 `where: { publishedLocales: { contains/equals: locale } }` 미지정 시 다른 언어 미공개 글이 노출 | 새 Posts 쿼리 추가 시 publishedLocales 조건 항상 포함 |
| F9 | **`<html lang dir>` 는 클라이언트에서만 갱신됨** — `(frontend)/layout.tsx` 가 SSR 초기값 발급 → `LocaleHtmlAttributes` 가 useEffect 로 갱신. JS 미실행 봇은 모든 locale 페이지가 SSR 초기값으로 보임 | hreflang `<link>` + sitemap alternates 가 신호 보강. 정확도 더 필요하면 미들웨어 path 기반 SSR 라우팅 재설계 (현재 보류) |
| F10 | **Postgres ENUM reordering 불가** — `ALTER TYPE … ADD VALUE` 만 가능. locale 추가/순서 변경 시 PR #18 처럼 clean baseline 재생성. 운영 콘텐츠 누적 후에는 데이터 마이그레이션 계획 필수 | 신규 locale: ① LOCALES 배열 갱신 → ② `pnpm payload generate:types` → ③ baseline 재생성 또는 `ADD VALUE` migration 결정 |
| F11 | **Payload 기본 Localizer 와 커스텀 LocaleSwitcher 동시 표시** — `admin.components.actions` 에 커스텀 등록만 하면 둘 다 표시됨 | LocaleSwitcherWithSearch/index.css 의 `.app-header__localizer { display: none !important }` rule 유지 |

### 아랍어 RTL 사전 점검 요지 (Phase B-5 진입 시)

`dir="rtl"` 만으로는 부족. 상세 audit (14개 CSS 모듈 × 약 58개 physical 속성 위치 / 행번호) → `references/rtl-audit-2026-05-09.md`.

핵심 위험 모듈만:

- **High**: SubCarousel (좌/우 화살표 left/right 고정 + SVG path 방향 + ArrowRight→next 키보드), SearchToggle (입력창 펼침 `translateX(-10px)→0`)
- **Medium**: Header 모바일 패널, FloatingActions 호버 라벨, ProjectInquiry 검증 체크마크
- **기계적 치환 ~30 줄**: `margin/padding/border-left/right` → `*-inline-start/end`, 절대좌표 `left/right` → `inset-inline-start/end`
- **SVG 화살표 6개**: `:dir(rtl) { transform: scaleX(-1); }` 또는 컴포넌트 분기
- **하지 말 것**: `float`, `direction: ltr` 하드코딩, `[dir="rtl"]` 셀렉터 남발 — logical property 우선

## 10. 의사결정 필요 (현재형)

해결된 의사결정은 갱신이력 참조.

| ID | 항목 | 옵션 | 권고 |
|---|---|---|---|
| D1 | sitemap baseUrl (`NEXT_PUBLIC_SERVER_URL`) 등록 시점 | A) 즉시 / B) D-7 / C) Phase A 6 SEO 마무리 | **B 또는 C** — 현 운영 사이트 트래픽 보존 우선 |
| D2 | `pnpm lint` 정상화 방식 | A) `package.json` devDep 에 `@eslint/eslintrc` 추가 / B) `eslint-config-next` 업데이트 / C) `eslint.config.mjs` flat config 직접 마이그레이션 | **A 우선** (1줄 변경). 실패 시 C |
| D3 | client-only 페이지의 generateMetadata 패턴 정착 | server 래퍼 + client 자식 분리 vs. 별도 metadata 파일 | server 래퍼 분리 (project-inquiry 가 reference 구현체) |
| D4 | RTL 패스 진입 시점 | A) Phase B-5 (현 계획) / B) Phase A 6 SEO 와 함께 / C) 별도 사이클 | **A 유지** — 영문 단일 파이프라인 완성 우선 |
| D5 | Resend 메일 발송 활성화 시점 | A) 단계 1c 와 함께 / B) 단계 2 마무리 / C) D-7 직전 | **B** — Phase A 2 의 자연스러운 잔여물. RESEND_API_KEY + 템플릿 결정 필요 |
| D6 | reCAPTCHA 도입 여부/방식 | A) v3 점수 검증 / B) hCaptcha / C) `notRobot` 체크박스로 충분 | 미정. Inquiries 컬렉션에 `recaptchaScore` 필드는 이미 존재 |
| D7 | Lexical 블록 텍스트 번역 hook 위치 | A) walker 확장 (블록별 매핑) / B) 컬렉션 hook 에서 블록 순회 | A 권장 — walker 가 단일 진입점 |

## 11. 관련 메모리 / 외부 참조

| 메모리 / 파일 | 용도 |
|--------|------|
| `project_iropke_roadmap_v2.md` | 현행 로드맵 (이 파일과 동일 내용 + Phase B 상세) |
| `project_iropke_editor_requirements_v2.md` | Phase A 단계 1b 본 작업 진입점 (12단계 중 4번부터) |
| `project_iropke_payload_migrations.md` | Phase A 단계 0 작업 기록 (완료) |
| `feedback_iropke_schema_discipline.md` | schema 변경 시 매번 적용할 영구 워크플로 |
| `reference_iropke_database_urls.md` | DATABASE_URL / DATABASE_URL_DIRECT 두 변수 운영 규칙 |
| `project_iropke_posts_phase2.md` | BlocksFeature 6종 스냅샷 |
| `project_iropke_translation_api.md` | Phase B-1 직전에 활성화 |
| `project_iropke_fonts.md` | 폰트 시스템 (라틴 검증용) |
| `project_iropke_launch_d7_checklist.md` | 런칭 직전 스테이지 분리 체크리스트 |
| `references/rtl-audit-2026-05-09.md` | 아랍어 RTL 사전 검토 — Phase B-5 진입 시 필독 |

---

**갱신 이력**

| 날짜 | 변경 |
|------|------|
| 2026-04-26 | 초안. v2 로드맵 / OS 라우팅 / SEO 의무 / 번역 패러다임 전환 (KO→EN) |
| 2026-04-27 | Phase A 단계 0 완료 (옵션 B clean reset + baseline + Vercel pipeline). 스키마 변경 정책 정식화. DATABASE_URL_DIRECT (Session pooler) 도입. Payload 3.82.1 → 3.83.0 |
| 2026-05-09 | Phase A 일괄 진행 — 8→20 locale 확장 ([#18](https://github.com/iropke/official-website/pull/18)) + LangSwitcher fix ([#20](https://github.com/iropke/official-website/pull/20)) + Phase A 6 SEO 의무 4종 ([#21](https://github.com/iropke/official-website/pull/21)) + 정적 페이지 4종 ([#22](https://github.com/iropke/official-website/pull/22)) + Project Inquiry 백엔드 + Translate 5필드 ([#23](https://github.com/iropke/official-website/pull/23)) + §10 종합 갱신 ([#24](https://github.com/iropke/official-website/pull/24)). 운영 DB wipe + admin 신규 가입 완료 |
| 2026-05-09 | **CLAUDE.md 구조 재편** — §10 의 4-카테고리 (진행/미진행/함정/의사결정) 를 §8/9/10 으로 reflow. PR 별 진행 기록 표 제거 (§2 단계 표에 PR 링크 통합). §10.4 두 번 중복 / §10.5 두 번 중복 (구버전 충돌) 제거. RTL 표 외부 `references/rtl-audit-2026-05-09.md` 참조로 압축. §5 에 다중 브랜치 docs 편집 정책 추가 (F1). 해결된 의사결정 D3/D4 (LOCALES 단일 소스 / 미들웨어 하드코딩 제거) 본문에서 제거 (이력만 보존). 머지 완료 후 잔존 브랜치 8개 정리 (`feat/seo-essentials` / `feat/static-pages` / `feat/inquiry-translate` / `fix/lang-switcher` / `feat/locale-add-config` / `docs/locale-20-claudemd` / `docs/post-merge-status` / `integration/auto-batch-2026-05-08`) + PR #15 superseded close |

# Iropke 공식 홈페이지 — Claude 작업 지침

> 이 파일은 작업 디렉터리(`D:\Claude\iropke\website`) 자동 로드용입니다.
> Claude 가 매 세션에서 이 파일을 우선 참조하여 일관된 컨텍스트를 유지합니다.
> 갱신은 Claude 가 직접 편집하거나 대표님이 수동 편집할 수 있습니다.

## 1. 프로젝트 개요

| 항목 | 값 |
|------|----|
| 프로젝트명 | Iropke 공식 홈페이지 (iropke.com) |
| 목적 | Payload CMS 기반 다국어(8개) 회사 홈페이지 개편 |
| 라이브 URL | https://official-website-topaz-gamma.vercel.app/en |
| GitHub | https://github.com/iropke/official-website (main = Production) |
| 로컬 경로 | `D:\Claude\iropke\website` |
| 기술 스택 | Next.js 16.2.3 (App Router) · Payload CMS 3.82.1 · TypeScript 5.7.3 · pnpm |
| 인프라 | Supabase PostgreSQL (us-east-1 MICRO) · Cloudinary · Resend · Vercel Pro |
| 지원 locale | ko / en / es / ru / de / fr / zh / ar (8개) |

## 2. 현행 로드맵 (v2 — 2026-04-26 확정)

### 패러다임 전환 요지

기존 한국어 테스트 베이스 → **영문 단일 파이프라인 완성 → 다국어 확장** 으로 전환.
이유: 라틴 계열 확장 시 폰트 fallback / 줄간격 / 행 길이 등 라틴 공통 이슈 분산 검증을 회피.

### Phase A — 영문 단일 파이프라인 완성

| 단계 | 작업 | 상태 |
|------|------|------|
| 0 | Payload migration 전환 (`pnpm payload migrate` 체계로 일원화) | 대기 |
| 0.5 | OS 언어 라우팅 미들웨어 (`src/middleware.ts`) | ✅ 2026-04-26 완료 |
| 1a | **에디터 요구사항 구체화 세션** (별도 1세션) | 진행 중 |
| 1b | 에디터 기능 완성 (썸네일 DnD · 이미지 업로드 · BlocksFeature Phase 3 렌더 · TableFeature 전환) | 대기 |
| 1c | Insights (블로그) 목록 + 상세 — **영문** | 대기 |
| 2 | Project Inquiry 폼 + Resend 연동 — 영문 | 대기 |
| 3 | 첫화면 콘텐츠 관리 — 영문 | 대기 |
| 4 | Solution / Service 페이지 관리 — 영문 | 대기 |
| 5 | About / Team 페이지 관리 — 영문 | 대기 |
| 6 | SEO / Sitemap / Analytics — **다국어 크롤링 보조 장치 필수** (hreflang / sitemap.xml / robots.txt) | 대기 |

### Phase B — 다국어 확장 (Phase A 완료 후)

| 순번 | 언어군 | 작업 |
|------|--------|------|
| 1 | 라틴 (es/de/fr) | **번역 API admin UI 활성화** + manuallyEdited 플래그 + 첫 적용 검증 |
| 2 | 한국어 (ko) | Pretendard / IropkeBatangM 조판 최종 확인 |
| 3 | 키릴 (ru) | NotoSans Cyrillic 자형 검증 |
| 4 | 중국어 (zh) | NotoSansSC / SerifSC 자형 + 행 길이 회귀 |
| 5 | 아랍어 (ar) | RTL 레이아웃 회귀 + LangSwitcher dir 전환 |

## 3. 첫화면 라우팅 정책 (v2)

| 항목 | 정책 |
|------|------|
| `/` 진입 | 미들웨어가 OS 언어 자동 감지하여 `/<locale>` 로 리디렉션 |
| 우선순위 | 1) `NEXT_LOCALE` 쿠키 → 2) `Accept-Language` 헤더 → 3) `en` 기본값 |
| 구현 위치 | `src/middleware.ts` (matcher 로 `/admin`, `/api`, 정적 자원 제외) |
| 크롤러 영향 | Googlebot 등 Accept-Language 미설정 → `/en` 진입. 다른 언어는 sitemap/hreflang 으로 발견 |

## 4. 다국어 SEO 의무 항목 (Phase A 단계 6)

| 구현 항목 | 형태 |
|----------|------|
| `app/[locale]/layout.tsx`의 `generateMetadata` | `alternates: { canonical, languages: { 'ko': '/ko/...', 'en': '/en/...', ... } }` 8개 매핑 |
| `app/sitemap.ts` | 모든 정적 경로 × 8 locale 직곱 출력 |
| `app/robots.ts` | 전부 Allow + sitemap URL 명시 |
| `<html lang="..." dir="...">` | `LocaleHtmlAttributes.tsx` 가 처리 (RTL 포함) |

⚠ 누락 시 영문만 색인되고 다른 언어는 고아 페이지가 됨.

## 5. 핵심 정책

### 브랜치 정책

- 작업 브랜치: `feat/<topic>` 신규 생성
- 병합: `main` 직접 PR (develop 중간 단계 없음, 런칭 D-7 까지)
- Vercel Production = `main` 전용
- PR URL 패턴: https://github.com/iropke/official-website/compare/main...&lt;branch&gt;

### 개발 단위 정책

- **프론트 + 백엔드 + DB 한 세트씩 순차** (여러 기능 병렬 개발 금지)
- 한 세트 완료 = admin UI · API · 프론트 렌더 · 시각 검증까지 모두 통과

### 스키마 변경 정책

- ❌ ad-hoc ALTER TABLE 금지 (Drizzle prepared statement 캐시 / Vercel 번들 스냅샷과 불일치 위험)
- ✅ `pnpm payload migrate:create --name <name>` 으로 migration 파일 생성
- ✅ `pnpm payload migrate` 로 적용
- Migration 실행은 Supabase Direct connection (port 5432) 사용 (transaction pooler 6543 은 DDL 비호환)

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

| 항목 | 사유 |
|------|------|
| 번역 API admin UI 버튼 | Phase B-1 직전에 한꺼번에 |
| `manuallyEdited` 플래그 스키마 | 동일 |
| ANTHROPIC_API_KEY 등록 | Phase B 직전까지 보류 |
| 한국어 콘텐츠 입력 | Phase B-2 단계에서 검증용으로만 |
| Supabase RLS 활성화 | Phase B 종료 후 런칭 직전 |

## 9. 관련 메모리 (자동 로드 외 추가 참조용)

| 메모리 | 용도 |
|--------|------|
| `project_iropke_roadmap_v2.md` | 현행 로드맵 (이 파일과 동일 내용) |
| `project_iropke_payload_migrations.md` | Phase A 단계 0 상세 |
| `project_iropke_posts_phase2.md` | Phase A 단계 1b 시작점 (BlocksFeature 5종 admin 스키마 완료 상태) |
| `project_iropke_translation_api.md` | Phase B-1 직전에 활성화 |
| `project_iropke_fonts.md` | 폰트 시스템 (라틴 검증용) |
| `project_iropke_launch_d7_checklist.md` | 런칭 직전 스테이지 분리 체크리스트 |

---

**갱신 이력**

| 날짜 | 변경 |
|------|------|
| 2026-04-26 | 초안 생성. v2 로드맵 / OS 라우팅 / SEO 의무 항목 / 번역 패러다임 전환 (KO→EN) 반영 |

# Iropke — Official Website (이로프케 공식 홈페이지)

Headless CMS 기반 다국어 회사 홈페이지. Payload 3.x + Next.js App Router + Supabase
Postgres + Cloudinary 조합으로 8개 언어를 단일 코드베이스에서 관리합니다.

| Item | Value |
|------|-------|
| Live URL | https://official-website-topaz-gamma.vercel.app |
| Repository | https://github.com/iropke/official-website |
| Production branch | `main` (Vercel Production 전용) |
| Locales (8) | `ko` · `en` · `es` · `ru` · `de` · `fr` · `zh` · `ar` (RTL) |

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16.2.3 (App Router, React 19) |
| CMS | Payload CMS 3.83.0 (`payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`) |
| Database | Supabase Postgres (us-east-1) — Transaction pooler at runtime, Session pooler for migrations |
| Media | Cloudinary (`payload-cloudinary` adapter) |
| Translation | Anthropic Claude Haiku (manual admin trigger only) |
| Analytics | GA4 via `@next/third-parties/google` |
| Hosting | Vercel Pro |
| Language | TypeScript 5.7.3, pnpm 9/10 |

## Local setup

```sh
pnpm install
cp .env.example .env        # fill in real credentials
pnpm dev                    # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`. 첫 실행 시 admin 계정 생성 화면을
거칩니다.

### Required environment variables

전체 목록과 카테고리별 설명은 [`.env.example`](./.env.example) 참고.

| Group | Variables |
|-------|-----------|
| Database | `DATABASE_URL`, `DATABASE_URL_DIRECT` |
| Payload | `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` |
| Media | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Translation | `ANTHROPIC_API_KEY` *(Phase B 활성화 예정)* |
| Email | `RESEND_API_KEY` *(Phase A 단계 2 활성화 예정)* |
| Analytics | `NEXT_PUBLIC_GA_ID` |

### Schema 변경 워크플로 (요약)

ad-hoc `ALTER TABLE` 금지. 코드 변경(컬렉션 / 글로벌 / 필드 / Lexical Blocks)
직후 다음 순서로 migration 파일을 동반 커밋합니다.

```sh
# Session pooler (5432) URL 로 swap (PowerShell 예시)
$env:DATABASE_URL = ((Get-Content .env | Where-Object { $_ -match '^DATABASE_URL_DIRECT=' }) -replace '^DATABASE_URL_DIRECT=', '').Trim()

pnpm payload migrate:create --name <변경요약>
# 생성된 src/migrations/<ts>-<name>.ts 검토 → 코드 + migration 동일 commit
```

Vercel 빌드 wrapper(`scripts/build.mjs`) 가 빌드 시 자동으로 migrate 적용
(idempotent). 로컬 `pnpm build` 는 의도적으로 migration 을 실행하지 않습니다.

## Project structure

```
src/
├── app/
│   ├── (frontend)/        # Public site routes (locale-aware)
│   ├── (payload)/         # Payload admin shell
│   └── api/translate/     # Manual translation endpoint
├── collections/           # Users · Media · Tags · Posts · Pages · Inquiries
├── globals/               # Navigation · SiteSettings · Homepage
├── components/            # Shared React components
├── fonts/                 # Per-locale font registration
├── lexical/               # Custom Lexical blocks (editorialMedia 외)
├── lib/translation/       # Claude Haiku translator
├── middleware.ts          # OS 언어 감지 → /<locale> 리디렉션
├── migrations/            # Payload migration files (Postgres)
└── payload.config.ts      # Payload root config
```

## Internationalisation

- 진입 경로 `/` 는 `src/middleware.ts` 가 `NEXT_LOCALE` 쿠키 → `Accept-Language`
  헤더 → `en` 순으로 우선순위 평가 후 `/<locale>` 로 리디렉션합니다.
- 콘텐츠 원본 locale 은 **영문(en)** 단일 파이프라인 (Phase A). Phase B 에서
  admin 의 "Translate from EN" 버튼으로 7개 locale 일괄 번역.
- Arabic(`ar`) 은 `<html dir="rtl">` 자동 전환.

## Scripts

| Script | 용도 |
|--------|------|
| `pnpm dev` | 로컬 개발 서버 |
| `pnpm build` | 프로덕션 빌드 (`scripts/build.mjs` wrapper, Vercel 에서 migrate 자동 적용) |
| `pnpm start` | 빌드 산출물 서빙 |
| `pnpm lint` | ESLint |
| `pnpm payload <cmd>` | Payload CLI (`migrate`, `migrate:create`, `generate:types`, ...) |
| `pnpm generate:types` | `src/payload-types.ts` 재생성 |
| `pnpm test:int` | Vitest 통합 테스트 |
| `pnpm test:e2e` | Playwright E2E |

## 추가 문서

| 문서 | 용도 |
|------|------|
| [`CLAUDE.md`](./CLAUDE.md) | 프로젝트 운영 정책 / 로드맵 / 워크플로 (Claude 자동 로드) |
| [`AGENTS.md`](./AGENTS.md) | Payload CMS 개발 규칙 (코딩 컨벤션) |
| [`references/requirements/`](./references/requirements/) | 단계별 요구사항 명세 |
| [`references/project-direction/`](./references/project-direction/) | Payload 데이터 모델 · 디자인 방향 메모 |

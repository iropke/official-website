# 이롭게 홈페이지 개편 — 개발 환경 가이드 및 시스템 세팅 순서

> Payload CMS 3.x 기반 프로젝트를 시작하기 위해 **사전에 준비해야 할 항목**과 **세팅 순서**를 정리한 문서입니다.
> ✅ 표시는 필수, ⬜ 표시는 선택(권장) 항목입니다.

---

## 1. 사전 가입이 필요한 서비스

| # | 서비스 | 용도 | 필수 여부 | 비고 |
|---|--------|------|:---------:|------|
| 1 | [GitHub](https://github.com) | 소스코드 버전 관리 | ✅ | 프로젝트 Repository 생성 필요 |
| 2 | [Vercel](https://vercel.com) | 프론트엔드 배포 (Next.js 호스팅) | ✅ | GitHub 연동으로 자동 배포 설정 |
| 3 | [Supabase](https://supabase.com) (기존 유료 사용 중) | 클라우드 데이터베이스 (PostgreSQL) | ✅ | 기존 Supabase 유료 플랜 활용 — Payload CMS 3.x PostgreSQL 공식 지원 |
| 4 | [Resend](https://resend.com) 또는 [SendGrid](https://sendgrid.com) | 이메일 발송 (프로젝트 문의 알림) | ✅ | Resend 추천 — Payload 공식 플러그인 지원 |
| 5 | [Cloudinary](https://cloudinary.com) 또는 [AWS S3](https://aws.amazon.com/s3/) | 이미지/미디어 저장소 | ✅ | Payload Cloud Storage 플러그인 연동 |
| 6 | [Google Search Console](https://search.google.com/search-console) | SEO 관리, 사이트맵 제출 | ⬜ | 런칭 후 설정 가능 |
| 7 | [Google Analytics](https://analytics.google.com) | 웹사이트 트래픽 분석 | ⬜ | GA4 기준 |
| 8 | AI 챗봇 서비스 | AI 챗봇 연동 | ⬜ | 후보: Chatbase, Voiceflow, Botpress 등 — 별도 검토 필요 |

---

## 2. 로컬 개발 환경 — 시스템 요구사항

| 항목 | 최소 사양 | 권장 사양 |
|------|-----------|-----------|
| OS | Windows 10 / macOS 12+ / Ubuntu 20.04+ | macOS 또는 Linux |
| Node.js | v18.17 이상 | v20 LTS |
| 패키지 매니저 | npm 또는 yarn | pnpm (Payload 공식 권장) |
| Git | 2.30+ | 최신 버전 |
| 코드 에디터 | — | VS Code + ESLint, Prettier 확장 |
| 브라우저 | Chrome | Chrome + 반응형 테스트용 Firefox/Safari |
| 메모리(RAM) | 8GB | 16GB 이상 |
| 디스크 여유 | 5GB 이상 | 10GB 이상 |

---

## 3. 세팅 순서 (Step by Step)

### STEP 1: 기본 도구 설치

| 순서 | 작업 | 명령어 / 방법 |
|:----:|------|---------------|
| 1-1 | **Node.js 설치** | [공식 사이트](https://nodejs.org)에서 v20 LTS 다운로드 또는 `nvm install 20` |
| 1-2 | **pnpm 설치** | `npm install -g pnpm` |
| 1-3 | **Git 설치 및 설정** | [git-scm.com](https://git-scm.com) 다운로드 후 `git config --global user.name` / `user.email` 설정 |
| 1-4 | **VS Code 설치** | [code.visualstudio.com](https://code.visualstudio.com) |
| 1-5 | **VS Code 확장 설치** | ESLint, Prettier, Tailwind CSS IntelliSense, i18n Ally (다국어 지원용) |

### STEP 2: 서비스 가입 및 키 발급

| 순서 | 작업 | 확인 사항 |
|:----:|------|-----------|
| 2-1 | **GitHub 가입** → Repository 생성 | Repo 이름 예시: `iropke-website` |
| 2-2 | **Supabase** → Payload용 DB 확인 | 기존 유료 플랜에서 새 프로젝트 또는 DB 생성, Connection String 확보 |
| 2-3 | **Vercel 가입** → GitHub 연동 | GitHub 계정으로 로그인 후 프로젝트 Import 준비 |
| 2-4 | **Resend 가입** → API Key 발급 | 발송용 도메인 DNS 인증 필요 (SPF, DKIM) |
| 2-5 | **Cloudinary 가입** → API Key 발급 | Cloud Name, API Key, API Secret 확보 |

### STEP 3: Payload CMS 프로젝트 초기화

| 순서 | 작업 | 명령어 / 방법 |
|:----:|------|---------------|
| 3-1 | **프로젝트 생성** | `pnpm create payload-app@latest` |
| 3-2 | **옵션 선택** | Template: `blank`, Database: `PostgreSQL` (Supabase), 패키지 매니저: `pnpm` |
| 3-3 | **환경 변수 설정** | 프로젝트 루트에 `.env` 파일 생성 (아래 템플릿 참고) |
| 3-4 | **로컬 실행 확인** | `pnpm dev` → `http://localhost:3000/admin` 접속 확인 |
| 3-5 | **Git 초기 커밋 및 Push** | `git init && git add . && git commit -m "init" && git push` |

### STEP 4: 핵심 플러그인 설치

| 순서 | 플러그인 | 용도 | 설치 명령어 |
|:----:|----------|------|-------------|
| 4-1 | `@payloadcms/richtext-lexical` | 리치 텍스트 에디터 | Payload 3.x 기본 내장 |
| 4-2 | `@payloadcms/plugin-cloud-storage` | 미디어 클라우드 저장 | `pnpm add @payloadcms/plugin-cloud-storage` |
| 4-3 | `@payloadcms/plugin-seo` | SEO 메타 관리 | `pnpm add @payloadcms/plugin-seo` |
| 4-4 | `@payloadcms/plugin-redirects` | URL 리다이렉트 관리 | `pnpm add @payloadcms/plugin-redirects` |
| 4-5 | `payload-plugin-multi-tenant` 또는 i18n 설정 | 다국어(6개 언어) 지원 | Payload 내장 Localization 설정 활용 |
| 4-6 | `@payloadcms/email-resend` | 이메일 발송 | `pnpm add @payloadcms/email-resend` |
| 4-7 | `next-intl` 또는 `next-i18next` | 프론트엔드 다국어 라우팅 | `pnpm add next-intl` |

### STEP 5: Vercel 배포 설정

| 순서 | 작업 | 확인 사항 |
|:----:|------|-----------|
| 5-1 | **Vercel에 프로젝트 Import** | GitHub Repo 연결 |
| 5-2 | **환경 변수 등록** | `.env`의 모든 키를 Vercel Dashboard → Settings → Environment Variables에 등록 |
| 5-3 | **커스텀 도메인 연결** | 이롭게 도메인 DNS 설정 (A 레코드 또는 CNAME) |
| 5-4 | **빌드 확인** | Push 후 자동 배포 → 프리뷰 URL 확인 |

---

## 4. 환경 변수 템플릿 (.env)

```env
# ── Database (Supabase PostgreSQL) ──
DATABASE_URI=postgresql://<username>:<password>@db.<project-ref>.supabase.co:5432/postgres

# ── Payload ──
PAYLOAD_SECRET=<랜덤 문자열 — openssl rand -hex 32 로 생성>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# ── Email (Resend) ──
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@iropke.com

# ── Cloud Storage (Cloudinary) ──
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Analytics (선택) ──
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 5. 세팅 완료 체크리스트

| # | 항목 | 완료 |
|---|------|:----:|
| 1 | Node.js v20, pnpm 설치 확인 | ⬜ |
| 2 | Git 설치 및 GitHub Repo 생성 | ⬜ |
| 3 | Supabase에서 Payload용 DB 생성 및 Connection String 확보 | ⬜ |
| 4 | Resend 가입 및 API Key 발급, 도메인 인증 | ⬜ |
| 5 | Cloudinary 가입 및 API 키 확보 | ⬜ |
| 6 | Payload 프로젝트 `pnpm dev`로 로컬 실행 성공 | ⬜ |
| 7 | `/admin` 페이지 접속 및 관리자 계정 생성 | ⬜ |
| 8 | GitHub에 초기 커밋 Push 완료 | ⬜ |
| 9 | Vercel 배포 및 프리뷰 URL 확인 | ⬜ |
| 10 | 커스텀 도메인 연결 | ⬜ |

---

## 6. 참고 링크

| 자료 | URL |
|------|-----|
| Payload CMS 3.x 공식 문서 | https://payloadcms.com/docs |
| Next.js 공식 문서 | https://nextjs.org/docs |
| Payload + Vercel 배포 가이드 | https://payloadcms.com/docs/production/deployment |
| Payload Localization (다국어) | https://payloadcms.com/docs/configuration/localization |
| Payload Email 설정 | https://payloadcms.com/docs/email/overview |
| Supabase 시작하기 | https://supabase.com/docs/guides/getting-started |

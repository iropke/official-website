# Editor Requirements v2 — Posts(블로그/Insights) 에디터 요구사항

> **확정일:** 2026-04-26
> **확정자:** Ashley 대표님
> **상위 문서:** `requirements.md` §5-2 (Insights), `project_iropke_roadmap_v2.md`
> **목적:** Phase 2(BlocksFeature 5종 admin 스키마)까지의 구현과 초기 기획 사이 불일치를 해소하고, Phase A 단계 1b "에디터 기능 완성" 의 정식 명세로 사용

---

## 1. 결정 배경

| 항목 | 내용 |
|------|------|
| 문제 | 초기 기획(`requirements.md` §5-2 의 10종 블록) 과 Phase 2 구현(BlocksFeature 5종) 사이 누락 블록이 있고, 사용성/렌더 미완성 항목이 다수 존재 |
| 직접 기인한 버그 | 썸네일 drag&drop 500, 본문 이미지 업로드 500, Phase 3 렌더러 미완성, editorialTable 사용성 ↓ |
| 결정 트리거 | 2026-04-26 Cowork 세션에서 영문 우선 파이프라인 전환 합의. 그 직전에 에디터를 정식 완성 후 진입 |

## 2. 콘텐츠 유형 (확정)

| 유형 | 사용 사례 |
|------|----------|
| 인사이트 칼럼/소개글 | 이롭게 관점/철학/업계 인사이트. 인용문·이미지+캡션 빈출 |
| 프로젝트/사례 소개 | 제품 적용 사례, 고객 스토리. 대고화면 이미지·테이블·수치 |
| 회사 소식/보도자료 | 수상, 파트너십, 조직. 짧은 본문·Raw HTML(임베드) 가능 |
| 기술/제품 가이드 | 사용법, 제품 특징. 코드 블록·Q&A·구조적 설명 |

→ 결과: 4종 모두 활용 → 모든 블록 다양성이 잠재적으로 필요

## 3. 블록 인벤토리

### 3-1. 즉시 완성 대상 (Phase A 1b)

| Slug | 분류 | 상태 |
|------|------|------|
| Lexical Heading H1~H6 | 기본 | ✅ Lexical 기본 제공 |
| Lexical Paragraph | 기본 | ✅ Lexical 기본 제공 |
| Lexical List (ol/ul) | 기본 | ✅ Lexical 기본 제공 |
| **`editorialMedia`** (이미지+캡션) | 커스텀 (신규) | ❌ 추가 필요 |
| `editorialTable` | 커스텀 | △ 스키마 완료, 사용성 개선 필요 |
| `videoEmbed` | 커스텀 | △ 스키마 완료, 렌더러 미완성 |
| `rawHtml` | 커스텀 | △ 스키마 완료, 렌더러 미완성 |
| `codeBlock` | 커스텀 | △ 스키마 완료, 렌더러 + Shiki 미완성 |
| `qnaList` | 커스텀 | △ 스키마 완료, 렌더러 미완성 |

### 3-2. 후순위 (Phase A 1b 종료 후)

| Slug | 분류 | 비고 |
|------|------|------|
| 인용문 (`editorialQuote`) | 커스텀 | blockquote + 큰따옴표 SVG. Lexical 기본 Quote 활용 가능 검토 |
| 구분선 (`editorialDivider`) | 커스텀 | ✦ 또는 § 기호. Lexical 기본 HorizontalRule 스타일 재장식 활용 가능 검토 |

이 두 블록은 Phase A 1b 의 "에디터 완성" 정의에 포함하지 **않음**. 이번 라운드 작업 완료 후 별도 안건으로 재논의.

## 4. 블록별 상세 명세

### 4-1. `editorialMedia` (신규) — 이미지 + 캡션

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `image` | upload (Media collection 참조) | ✅ | Cloudinary 업로드 단일 이미지 |
| `caption` | textarea (rows: 2) | ❌ | 이미지 하단 캡션. 비어있으면 figcaption 미렌더 |
| `alt` | text | ❌ | 접근성 alt. 비어 있으면 Media 의 기본 alt 사용 |
| `alignment` | select (`full`, `center`, `wide`) | ❌ | 본문 폭 대비 배치. 기본 `center` |

렌더 출력:

```html
<figure class="editorial-media editorial-media--{alignment}">
  <img src="..." alt="..." />
  <figcaption class="editorial-media-caption">...</figcaption>
</figure>
```

CSS 클래스 `editorial-media` 는 `PostDetail.module.css` 에 일부 정의되어 있음. `editorialMedia--{alignment}` 변형 신설 필요.

### 4-2. `editorialTable` — 유지 + 사용성 개선

**현행:** caption · headers[{text}] · rows[{cells[{text}]}] 3단 nested array. 셀마다 "Add item" 클릭 → 사용성 ↓.

**개선 방향(다음 세션에서 구체 결정):**

| 옵션 | 설명 |
|------|------|
| A. Custom field component | `headers`/`rows` 를 React 표 위젯으로 대체. "행 +", "열 +" 일괄 버튼 |
| B. CSV/TSV import 텍스트 | textarea 한 칸에 탭/콤마 구분 입력 → 저장 시 nested 구조로 파싱 |
| C. 둘 다 (A 가 메인, B 는 빠른 입력용 보조) | 구현 비용 ↑, 작성 효율 ↑ |

→ Phase A 1b 진입 시 옵션 결정. 결정 전까지 현행 nested 입력으로 사용 가능.

### 4-3. `videoEmbed`

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `url` | text (YouTube 공유 URL) | ✅ |
| `caption` | textarea (rows: 2) | ❌ |

렌더러: `youtu.be/{id}` · `youtube.com/watch?v={id}` 둘 다 지원 → `youtube-nocookie.com/embed/{id}` 변환. iframe + figcaption (editorial-media 프레임 재사용).

### 4-4. `rawHtml`

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `label` | text | ❌ |
| `html` | textarea (rows: 10) | ✅ |

렌더러: `<div className="editorialRaw"><span>{label}</span><div dangerouslySetInnerHTML={{__html: fields.html}} /></div>`. admin description 에 XSS 경고 명시.

### 4-5. `codeBlock` + Shiki

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `language` | text (slug, e.g. `ts`, `python`) | ✅ |
| `code` | textarea (rows: 10) | ✅ |

**Shiki 도입 계획:**

| 항목 | 결정 |
|------|------|
| 라이브러리 | `shiki` (build-time 정적 색상화) |
| 테마 | 다음 세션에 결정 (`github-dark` / `vitesse-dark` 후보) |
| 적용 위치 | 프론트 렌더러 — `PostDetailClient.tsx` 의 codeBlock 케이스 |
| 동작 | `await codeToHtml(code, { lang, theme })` → dangerouslySetInnerHTML |
| 폴백 | Shiki 가 인식 못 하는 language → 기본 `<pre><code>` |
| 패키지 추가 | `pnpm add shiki` |
| 번들 영향 | RSC 사용 → 클라이언트 번들 영향 없음 (서버 컴포넌트에서 변환) |

### 4-6. `qnaList`

| 필드 | 타입 |
|------|------|
| `items` | array of `{ role: select(question/answer), text: textarea }` |

렌더러: role 별 QuestionIcon/CheckIcon. `editorialQna` + `editorialQnaIconAnswer` 클래스 (CSS 기존 존재).

## 5. 이미지 흐름 (전체)

| 단계 | 위치 | 현재 상태 | 해결 |
|------|------|----------|------|
| 썸네일 업로드 | Posts collection 의 thumbnail 필드 | 500 (`column "cloudinary_public_id" does not exist`) | Payload migration 전환으로 Drizzle stale schema 해소 |
| 본문 이미지 업로드 | `editorialMedia` 블록 → Media collection upload | 동일 원인으로 500 추정 | 동일 해결책 |
| Cloudinary 변환 | `payload-cloudinary 2.3.0` 플러그인 | 설치됨 + REST API 경로 (`POST /api/media`) 는 201 정상 | (해소) |
| 표시 폭 정책 | `alignment` 필드 | 없음 | `editorialMedia.alignment` 신규 |

## 6. 사전 작업 / 의존성

| 사전 작업 | 이유 |
|----------|------|
| Payload migration 전환 (`pnpm payload migrate` 체계) | Drizzle stale schema 해소 = 이미지 업로드 정상화의 전제 조건 |
| Vercel build command 에 `migrate` 단계 추가 | 프로덕션 배포 시 자동 마이그레이션 적용 |
| Supabase Direct connection URL 분리 | Migration 실행용 (transaction pooler 6543 은 DDL 비호환) |

## 7. 구현 단계 (다음 세션부터)

| 순번 | 작업 | 산출물 |
|------|------|--------|
| 1 | Payload migration baseline 생성 | `src/migrations/<ts>-baseline.ts` (Cloudinary 14컬럼 idempotent 포함) |
| 2 | Vercel build 에 `pnpm payload migrate` 결합 | `package.json` 또는 Vercel UI |
| 3 | 프리뷰 배포 후 admin → media 업로드 검증 | 200 응답 |
| 4 | `editorialMedia` 블록 스키마 추가 | `src/collections/Posts.ts` BlocksFeature.blocks |
| 5 | `pnpm payload generate:importmap` 으로 importMap 자동 갱신 | `src/app/(payload)/admin/importMap.js` |
| 6 | Phase 3 렌더러 — `editorialMedia` 우선 | `PostDetailClient.tsx` `renderBlockNode` |
| 7 | (병렬) Shiki 설치 + codeBlock 렌더 | `pnpm add shiki`, codeBlock 케이스 |
| 8 | (병렬) qnaList/rawHtml/videoEmbed 렌더 | 동 |
| 9 | editorialTable 사용성 개선 옵션 결정 + 구현 | 4-2 옵션 A/B/C 중 1 |
| 10 | Tags 다중 저장 버그 수정 | 별도 세션 또는 9 와 묶음 |
| 11 | feat 브랜치 → main PR | GitHub PR |
| 12 | 프로덕션 검증 | admin 글 1건 작성 → 모든 블록 삽입 → 저장 → 프론트 노출 |

## 8. 검증 시나리오 (Phase A 1b 종료 조건)

| # | 시나리오 | 통과 기준 |
|---|----------|----------|
| 1 | 새 글 작성 → 썸네일 drag&drop 업로드 → 저장 | 200 + Cloudinary URL 저장됨 |
| 2 | 본문에 `editorialMedia` 블록 삽입 → 이미지 업로드 + 캡션 입력 → 저장 | 200 + 프론트에 figure+figcaption 노출 |
| 3 | 본문에 `codeBlock` 삽입 → ts/python/bash 입력 → 저장 → 프론트 노출 | Shiki 색상 적용 |
| 4 | `qnaList` / `videoEmbed` / `rawHtml` / `editorialTable` 각각 1회 삽입 | 모두 정상 렌더 |
| 5 | Tags 3개 다중 선택 → 저장 → admin 재진입 | 3개 모두 표시됨 |
| 6 | 같은 글 영문 입력 후 다른 locale 비어 있는 상태로 저장 | `/en/insights/<slug>` 정상, `/ko/insights/<slug>` 는 fallback 처리 |

## 9. 미정 사항 (다음 세션에서 결정)

| 항목 | 결정 시점 |
|------|----------|
| editorialTable 사용성 개선 옵션 (A/B/C) | 단계 9 직전 |
| Shiki 테마 (github-dark 등) | 단계 7 시작 시 |
| `editorialMedia.alignment` 기본값 / CSS 변형 정의 | 단계 4 작성 시 |
| 인용문 / 구분선 블록 명세 | Phase A 1b 종료 후 |
| 코드 블록 line numbers 표시 여부 | Shiki 적용 시 |

## 10. 관련 파일 / 메모리

| 분류 | 위치 |
|------|------|
| 상위 기획 | `references/requirements/requirements.md` §5-2 |
| Migration 전환 계획 | `spaces/.../memory/project_iropke_payload_migrations.md` |
| 현행 로드맵 | `spaces/.../memory/project_iropke_roadmap_v2.md` |
| Phase 2 구현 스냅샷 | `spaces/.../memory/project_iropke_posts_phase2.md` |
| 다음 세션 작업 계획 | `spaces/.../memory/project_iropke_posts_next_session.md` |
| Lexical 렌더러 패턴 | `spaces/.../memory/reference_iropke_lexical_renderer.md` |
| 자동 로드 지침 | `D:\Claude\iropke\website\CLAUDE.md` |

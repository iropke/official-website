# IROPKE Figma Design Guide

## 목적

이 문서는 HTML/CSS를 기준으로 IROPKE 웹 화면을 Figma 디자인 가이드로 다시 정리하기 위한 기준 문서다.
현재 확인한 주요 화면은 아래 3개 유형이다.

- `postList_[ko|en]_full_v2.html`
- `postDetail_[ko|en]_full_v2.html`
- `project_inquiry_[ko|en]_full_v2.html`

핵심 방향은 "에디토리얼 콘텐츠 경험 + 절제된 인터랙션 + 이중 언어 대응 + 넓은 여백 기반의 레이아웃 시스템"이다.

## 1. 디자인 시스템 핵심 요약

- 브랜드 포인트 컬러는 `#5EB6B2`
- 베이스 텍스트 컬러는 `#232329` 계열
- 배경은 순백보다 약간 부드러운 `#FAFAFA`, `#F3F4F7`, `#F6F4F2` 계열을 사용
- 콘텐츠 화면은 직선적이고 편집적인 톤을 유지하며 `border-radius: 0`이 자주 사용됨
- 폼 화면은 반대로 `18px`, `24px`, `28px`, `999px` 반경을 사용해 더 부드럽고 서비스형 UI 느낌을 줌
- 한국어는 `Pretendard + Iropke Batang`, 영어는 `Georgia + system sans`의 대비가 핵심
- 레이아웃은 `12-column grid`와 넓은 좌우 거터를 기준으로 구성됨

## 2. Figma 파일 권장 구조

Figma 파일은 아래 페이지 순서로 정리하는 것을 권장한다.

1. `Cover`
2. `Foundations / Brand`
3. `Foundations / Color`
4. `Foundations / Typography KR`
5. `Foundations / Typography EN`
6. `Foundations / Spacing & Grid`
7. `Foundations / Radius & Shadow`
8. `Components / Editorial`
9. `Components / Navigation & Pagination`
10. `Components / Form`
11. `Components / Feedback & Modal`
12. `Templates / Post List`
13. `Templates / Post Detail`
14. `Templates / Project Inquiry`
15. `Localization / KR vs EN`

## 3. Color Tokens

아래 값은 `basic_en.css`와 개별 HTML 화면에서 반복적으로 확인된 토큰이다.

### Primary

- `color/primary/default`: `#5EB6B2`
- `color/primary/hover`: `#22908B`
- `color/primary/pressed`: `#15716D`
- `color/primary/tint-12`: `rgba(94, 182, 178, 0.12)`
- `color/primary/tint-14`: `rgba(94, 182, 178, 0.14)`
- `color/primary/tint-10`: `rgba(94, 182, 178, 0.10)`

### Neutral

- `color/text/primary`: `#232329`
- `color/text/secondary`: `#68687B`
- `color/text/tertiary`: `#A1A1AF`
- `color/text/muted`: `#B0B0BC`
- `color/border/subtle`: `#DFDFE4`
- `color/bg/canvas`: `#FAFAFA`
- `color/bg/soft`: `#F3F4F7`
- `color/bg/white`: `#FFFFFF`
- `color/bg/form-page`: `#F6F4F2`
- `color/base/black`: `#000000`

### Semantic Usage

- 에디토리얼 링크/강조/hover는 `color/primary/default`
- 본문 제목은 `color/text/primary`
- 본문 설명과 메타 텍스트는 `#5E6670`, `#666666`, `#7A818B`, `#999999` 계열을 서브 토큰으로 분리
- 카드/패널 테두리는 `rgba(31,31,31,0.08)` 또는 `rgba(35,35,41,0.08)`을 기본으로 사용

## 4. Typography Tokens

## KR Font Families

- `font/ui/kr`: `Pretendard, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, Arial, sans-serif`
- `font/display/kr`: `Pretendard, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, Arial, sans-serif`
- `font/body/kr`: `Pretendard, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, Arial, sans-serif`
- `font/serif/kr`: `Iropke Batang, Noto Serif KR, Georgia, serif`

## EN Font Families

- `font/ui/en`: `ui-sans-serif, system-ui, sans-serif`
- `font/body/en`: `Georgia, Times New Roman, Times, serif`가 실제 화면 제목/본문 일부에 자주 사용됨
- `font/mono`: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Courier New, monospace`

## Type Scale

`basic_en.css` 기준 토큰:

- `type/body-1`: `clamp(20px, 0.3vw + 18.5px, 24px)`
- `type/body-2`: `clamp(16px, 0.15vw + 15px, 18px)`
- `type/body-3`: `clamp(15px, 0.08vw + 14.5px, 16px)`
- `type/body-4`: `clamp(14px, 0.08vw + 13.5px, 15px)`
- `type/body-5`: `clamp(13px, 0.08vw + 12.5px, 14px)`
- `type/body-6`: `clamp(12px, 0.08vw + 11.5px, 13px)`

## Key Display Styles

- `display/post-hero-title`: `clamp(2rem, 2.2vw, 2.75rem)`, `700`, tracking `-0.03em`
- `display/project-form-title`: `clamp(2rem, 3vw, 3rem)`, `700`, tracking `-0.03em`
- `display/post-card-title`: `clamp(1.25rem, 1.65vw, 1.56rem)`, `700`
- `heading/h1-editorial`: `clamp(1.75rem, 1.6vw, 2.5rem)`
- `heading/h2-editorial`: `clamp(1.4rem, 1vw, 1.85rem)`
- `heading/h3-editorial`: `clamp(1.2rem, 0.7vw, 1.5rem)`
- `heading/h4-editorial`: `clamp(1.05rem, 0.45vw, 1.24rem)`

## Typography Rules

- KR 상세 페이지는 제목은 sans, 인트로/설명은 serif를 섞어 대비를 만든다
- EN 화면은 serif 비중이 KR보다 높다
- 메타 정보, 캡션, 보조 설명은 sans 계열로 통일
- Figma에서는 KR/EN 텍스트 스타일을 분리해 관리하고, 동일 이름 안에 `KR`, `EN` suffix를 붙이는 것을 권장

## 5. Spacing, Grid, Breakpoints

### Spacing Tokens

- `spacing/xs`: `5px`
- `spacing/s`: `10px`
- `spacing/m`: `20px`
- `spacing/l`: `30px`
- `spacing/xl`: `40px`
- `spacing/xxl`: `50px`
- `spacing/xxxl`: `60px`
- `spacing/xxxxl`: `80px`

### Layout Tokens

- `layout/breakpoint/mobile`: `480px`
- `layout/breakpoint/tablet`: `768px`
- `layout/breakpoint/tablet-wide`: `1024px`
- `layout/breakpoint/desktop`: `1280px`
- `layout/shell-max`: `1440px`
- `layout/gutter/desktop`: `180px`
- `layout/gutter/tablet`: `36px`
- `layout/gutter/mobile`: `20px`
- `layout/grid-gap/desktop`: `24px`
- `layout/grid-gap/tablet`: `20px`
- `layout/grid-gap/mobile`: `16px`

### Grid Rules

- 기본 페이지는 12컬럼 기준
- `postDetail`은 12컬럼 중 메인 본문이 가운데 6컬럼, 오른쪽 2컬럼을 aside로 사용하는 편집형 구조
- `projectInquiry`는 12컬럼 안에서 메인 영역을 다시 2분할하는 서비스형 구조
- `postList`는 실제 카드 레이아웃에서는 2컬럼 카드 그리드처럼 보이지만 페이지 전체는 넓은 shell 규칙을 따른다

## 6. Radius, Border, Shadow

### Radius

- `radius/none`: `0`
- `radius/s`: `8px`
- `radius/m`: `18px`
- `radius/l`: `24px`
- `radius/xl`: `28px`
- `radius/pill`: `999px`

### Border

- `border/subtle-dark`: `1px solid rgba(35, 35, 41, 0.08)`
- `border/subtle-neutral`: `1px solid rgba(31, 31, 31, 0.08)`
- `border/interactive`: `1px solid #D6D0CB`
- `border/accent`: `1px solid #5EB6B2`

### Shadow

- `shadow/card-editorial`: `0 14px 34px rgba(20, 33, 38, 0.05)`
- `shadow/card-form`: `0 12px 40px rgba(0, 0, 0, 0.04)`
- `shadow/modal`: `0 24px 80px rgba(0, 0, 0, 0.18)`
- `shadow/focus-primary`: `0 0 0 4px rgba(94, 182, 178, 0.14)`

## 7. Component Inventory

Figma 컴포넌트는 아래 범위까지 우선 정리하면 현재 코드와 잘 맞는다.

### Editorial

- `Post Card`
  - Variant: `Language=KR|EN`
  - Elements: image, title, arrow, description, date
- `Post Hero`
  - Elements: media, title, intro
- `Editorial Media`
  - Variant: `Type=Image|Video|Iframe`
- `Editorial Divider`
- `Related Post Item`
- `Tag Chip`
- `Pagination`
  - Variant: `State=Default|Hover|Active`

### Form

- `Inquiry Type Chip`
  - Variant: `State=Default|Checked|Focus`
- `Input Field`
  - Variant: `Type=Text|Email|Tel|Url|Date|File`
  - Variant: `Validation=Default|Focus|Valid|Error`
- `Textarea`
  - Variant: `Validation=Default|Focus|Valid|Error`
- `Field Label`
  - Includes optional required badge
- `Meta Badge`
  - Variant: `Tone=Default|Required`
- `Upload Dropzone`
  - Variant: `State=Default|Focus|Dragover|Uploaded|Error`
- `Consent Checkbox`
- `Primary Button`
- `Ghost Button`
- `Success Modal`

### Layout

- `Sticky Process Card`
- `Page Shell / 12 Col`
- `Page Shell / Wide`

## 8. Page Template Rules

### Post List

- 긴 세로 목록형 카드 구조
- 각 카드 hover 시 이미지 확대, 제목 색상 전환, 화살표 회전이 같이 반응
- 카드 사이 간격보다 `divider` 구조가 더 중요하므로 Figma에서도 개별 카드보다 "list with separators" 패턴으로 설계

### Post Detail

- 중심 본문 + 우측 sticky 보조영역
- 제목과 intro는 여백을 넉넉히 확보
- 미디어는 16:9 기준을 기본으로 유지
- 본문은 heading rhythm과 media block cadence가 중요

### Project Inquiry

- 밝은 배경 위에 유리감 있는 카드 2개
- 메인 입력 폼과 우측 절차 카드가 한 세트
- pill, soft border, focus ring이 주요 UI 언어

## 9. Localization Rules

- 같은 컴포넌트 구조를 유지하고 텍스트 스타일만 언어별 교체
- KR은 줄바꿈 안정성을 위해 `keep-all` 성향을 고려한 폭 설계 필요
- KR 설명문과 인트로는 serif 사용 비중이 더 큼
- EN은 Georgia 기반 타이틀이 더 자연스럽기 때문에 동일한 frame이라도 line-height를 별도로 관리
- Figma에서 `Text Style / Body / KR`, `Text Style / Body / EN`처럼 분리 운영 권장

## 10. Figma 제작 우선순위

1. Color, Typography, Spacing, Grid 토큰 생성
2. KR/EN 텍스트 스타일 분리
3. `Post Card`, `Post Hero`, `Input Field`, `Button` 우선 컴포넌트화
4. `Post List`, `Post Detail`, `Project Inquiry` 템플릿 제작
5. 마지막으로 언어별 variant와 상태 variant 정리

## 11. 코드-디자인 싱크 규칙

- 새 화면을 Figma에 추가할 때는 먼저 `basic_en.css` 토큰을 기준으로 삼는다
- KR 전용 타이포 규칙은 `basic_ko.css`를 우선한다
- 개별 HTML 안에 정의된 스타일은 "페이지 특화 규칙"으로 분리한다
- 색상, spacing, shadow를 임의값으로 다시 만들지 않고 위 토큰으로 흡수한다
- 에디토리얼 화면과 폼 화면은 같은 브랜드 안의 다른 서브시스템으로 취급한다

## 12. 다음 권장 작업

- Figma에서 새 파일을 만들고 위 페이지 구조로 foundation부터 세팅
- 먼저 `Post Detail KR`과 `Project Inquiry KR` 두 화면을 대표 샘플로 디자인 시스템화
- 이후 EN 버전은 텍스트 스타일과 카피만 교체해 variant로 확장


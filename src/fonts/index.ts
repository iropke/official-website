import localFont from 'next/font/local'

/* ══════════════════════════════════════════════════════════════════
   이롭게 홈페이지 다국어 폰트 구성

   - 한국어: Pretendard (9 weights) + IropkeBatangM (브랜드 세리프)
   - Latin + Cyrillic (en/es/de/fr/ru): Noto Sans / Serif / Serif Display
   - 중국어: Noto Sans SC / Serif SC
   - 아랍어: Noto Sans Arabic / Noto Naskh Arabic

   각 폰트는 CSS 변수로 노출되며, globals.css 에서 locale별로
   font-family 우선순위를 지정합니다.
   ══════════════════════════════════════════════════════════════════ */

/* ── 한국어: Pretendard (본문 기본) ─────────────────────────── */
export const pretendard = localFont({
  src: [
    { path: './korean/Pretendard-Thin.woff2',       weight: '100', style: 'normal' },
    { path: './korean/Pretendard-ExtraLight.woff2', weight: '200', style: 'normal' },
    { path: './korean/Pretendard-Light.woff2',      weight: '300', style: 'normal' },
    { path: './korean/Pretendard-Regular.woff2',    weight: '400', style: 'normal' },
    { path: './korean/Pretendard-Medium.woff2',     weight: '500', style: 'normal' },
    { path: './korean/Pretendard-SemiBold.woff2',   weight: '600', style: 'normal' },
    { path: './korean/Pretendard-Bold.woff2',       weight: '700', style: 'normal' },
    { path: './korean/Pretendard-ExtraBold.woff2',  weight: '800', style: 'normal' },
    { path: './korean/Pretendard-Black.woff2',      weight: '900', style: 'normal' },
  ],
  variable: '--font-korean',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
})

/* ── 한국어 브랜드 세리프: IropkeBatangM ───────────────────── */
export const iropkeBatang = localFont({
  src: './korean/IropkeBatangM.woff',
  variable: '--font-iropke-batang',
  display: 'swap',
  weight: '400',
  style: 'normal',
})

/* ── Latin + Cyrillic (en/es/de/fr/ru 공통) ─────────────────── */
/* Noto Sans 단일 파일에 Latin, Cyrillic, Greek 모두 포함 */
export const notoSans = localFont({
  src: [
    { path: './latin/NotoSans-VariableFont_wdth,wght.ttf',        weight: '100 900', style: 'normal' },
    { path: './latin/NotoSans-Italic-VariableFont_wdth,wght.ttf', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-latin',
  display: 'swap',
})

export const notoSerif = localFont({
  src: [
    { path: './latin/NotoSerif-VariableFont_wdth,wght.ttf',        weight: '100 900', style: 'normal' },
    { path: './latin/NotoSerif-Italic-VariableFont_wdth,wght.ttf', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-latin-serif',
  display: 'swap',
})

export const notoSerifDisplay = localFont({
  src: [
    { path: './latin/NotoSerifDisplay-VariableFont_wdth,wght.ttf',        weight: '100 900', style: 'normal' },
    { path: './latin/NotoSerifDisplay-Italic-VariableFont_wdth,wght.ttf', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-latin-display',
  display: 'swap',
})

/* ── 중국어 (zh) ──────────────────────────────────────────── */
export const notoSansSC = localFont({
  src: './chinese/NotoSansSC-VariableFont_wght.ttf',
  variable: '--font-chinese',
  display: 'swap',
  weight: '100 900',
})

export const notoSerifSC = localFont({
  src: './chinese/NotoSerifSC-VariableFont_wght.ttf',
  variable: '--font-chinese-serif',
  display: 'swap',
  weight: '200 900',
})

/* ── 아랍어 (ar, RTL) ─────────────────────────────────────── */
export const notoSansArabic = localFont({
  src: './arabic/NotoSansArabic-VariableFont_wdth,wght.ttf',
  variable: '--font-arabic',
  display: 'swap',
  weight: '100 900',
})

export const notoNaskhArabic = localFont({
  src: './arabic/NotoNaskhArabic-VariableFont_wght.ttf',
  variable: '--font-arabic-naskh',
  display: 'swap',
  weight: '400 700',
})

/* ══════════════════════════════════════════════════════════════════
   모든 폰트 CSS 변수를 합친 className

   최상위 layout (예: app/layout.tsx 또는 [locale]/layout.tsx) 에서
   <html className={allFontVariables}> 형태로 한 번만 적용하면
   모든 자식 요소가 CSS 변수(--font-korean, --font-latin 등) 사용 가능.
   ══════════════════════════════════════════════════════════════════ */
export const allFontVariables = [
  pretendard.variable,
  iropkeBatang.variable,
  notoSans.variable,
  notoSerif.variable,
  notoSerifDisplay.variable,
  notoSansSC.variable,
  notoSerifSC.variable,
  notoSansArabic.variable,
  notoNaskhArabic.variable,
].join(' ')

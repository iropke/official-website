/**
 * admin.preview / 절대 URL 발급용 base URL 해석기 (단일 진실 원천).
 *
 * Posts / Pages 컬렉션의 `admin.preview` 가 공유한다. 과거 Posts.ts 에만
 * 정의돼 있었으나 Pages preview 추가 시 중복 → drift 위험이 있어 추출.
 *
 * Payload 3.82.1 은 `admin.livePreview.url` 함수를 클라이언트 config 로 직렬화
 * 하지 못해 Live Preview 탭이 렌더되지 않는다. 대신 `admin.preview` 는 서버
 * 사이드에서만 호출되므로 함수를 그대로 쓸 수 있고, 편집 화면 우상단에
 * "Preview" 버튼이 추가되어 새 탭에서 프리뷰가 열린다. root-level
 * admin.livePreview 는 Edit 탭 회귀 이력이 있어 절대 건드리지 말 것.
 */
export const resolveServerURL = (): string => {
  // Vercel preview/development 배포는 자기 자신의 deployment URL 우선.
  // (그렇지 않으면 NEXT_PUBLIC_SERVER_URL=production 이라 PREVIEW 버튼이
  //  production 으로 향해 feature branch 의 코드가 적용되지 않은 곳에서 검증됨)
  // VERCEL_BRANCH_URL 은 per-branch 고정 alias 라서 deployment 별
  // VERCEL_URL 보다 안정적 → BRANCH_URL → URL 순으로 fallback.
  const isPreviewEnv =
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development'
  if (isPreviewEnv) {
    const branchURL = process.env.VERCEL_BRANCH_URL
    if (branchURL) return `https://${branchURL}`
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  }
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

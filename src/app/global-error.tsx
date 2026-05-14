/**
 * Root-level error boundary.
 *
 * (frontend)/layout.tsx 자체가 던진 오류처럼 [locale]/error.tsx 가 잡지 못한
 * 최상위 오류를 처리한다. Next.js 규약에 따라 본 컴포넌트는 자체 <html>/<body>
 * 를 렌더해야 한다.
 *
 * locale 추출 불가능한 시점이므로 영어 fallback. 외부 의존(스타일 모듈, 폰트
 * 등) 이 깨졌을 가능성을 감안해 inline style 만 사용한다.
 *
 * 디자인 토큰은 globals.css 와 동일한 값을 직접 inline 으로 박아 두어
 * stylesheet 없이도 브랜드 시각 언어가 유지되도록 함.
 */

'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const COLORS = {
  primary: '#5eb6b2',
  primaryHover: '#22908b',
  ink: '#232329',
  mutedSoft: '#68687b',
  surface: 'rgba(255, 255, 255, 0.72)',
  surfaceBorder: 'rgba(35, 35, 41, 0.12)',
}

const BACKGROUND = [
  'radial-gradient(circle at top left, rgba(94, 182, 178, 0.12), transparent 32%)',
  'radial-gradient(circle at top right, rgba(94, 182, 178, 0.08), transparent 28%)',
  'linear-gradient(180deg, #fafafa 0%, #f3f4f7 100%)',
].join(', ')

const SERIF_STACK =
  '"Noto Serif Display", "Noto Serif", Georgia, "Times New Roman", serif'
const SANS_STACK =
  '"Noto Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[GlobalError] Root layout failure:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px)',
          background: BACKGROUND,
          color: COLORS.ink,
          fontFamily: SANS_STACK,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <p
            aria-hidden="true"
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 'clamp(96px, 18vw, 200px)',
              lineHeight: 0.9,
              fontWeight: 400,
              letterSpacing: '-0.04em',
              margin: 0,
              color: COLORS.ink,
            }}
          >
            500
          </p>

          <h1
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 'clamp(28px, 3.6vw, 44px)',
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              margin: 0,
              color: COLORS.ink,
              maxWidth: '22ch',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: 'italic',
              fontSize: 'clamp(17px, 1.6vw, 20px)',
              lineHeight: 1.5,
              color: COLORS.primaryHover,
              margin: 0,
              maxWidth: '38ch',
            }}
          >
            &ldquo;Something behind the curtain
            <br />
            seems to be having a moment.&rdquo;
          </p>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: COLORS.mutedSoft,
              margin: 0,
              maxWidth: '52ch',
            }}
          >
            Something went wrong on our side while processing your request.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 12,
            }}
          >
            <a
              href="/en"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 48,
                padding: '14px 26px',
                borderRadius: 999,
                background: COLORS.ink,
                color: '#fff',
                border: `1px solid ${COLORS.ink}`,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 14px 30px rgba(35, 35, 41, 0.18)',
              }}
            >
              <span>Home</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                padding: '14px 26px',
                borderRadius: 999,
                background: COLORS.surface,
                color: COLORS.ink,
                border: `1px solid ${COLORS.surfaceBorder}`,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

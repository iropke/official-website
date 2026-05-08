/**
 * Root-level error boundary.
 *
 * (frontend)/layout.tsx 자체가 던진 오류처럼 [locale]/error.tsx 가 잡지 못한
 * 최상위 오류를 처리한다. Next.js 규약에 따라 본 컴포넌트는 자체 <html>/<body>
 * 를 렌더해야 한다.
 *
 * locale 추출 불가능한 시점이므로 영어 fallback. 외부 의존(스타일 모듈, 폰트
 * 등) 이 깨졌을 가능성을 감안해 inline style 만 사용한다.
 */

'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

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
          padding: '48px 24px',
          background: '#f5f5f5',
          color: '#43434e',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 560, width: '100%' }}>
          <p
            aria-hidden="true"
            style={{
              fontSize: 'clamp(64px, 14vw, 128px)',
              lineHeight: 1,
              margin: 0,
              color: '#43434e',
            }}
          >
            500
          </p>
          <h1
            style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 600,
              margin: '12px 0 8px',
              color: '#232329',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ fontStyle: 'italic', color: '#5eb6b2', margin: '0 0 16px' }}>
            &ldquo;Something behind the curtain seems to be having a moment.&rdquo;
          </p>
          <p style={{ opacity: 0.85, lineHeight: 1.6, margin: '0 0 24px' }}>
            Something went wrong on our side while processing your request.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                padding: '12px 24px',
                borderRadius: 999,
                border: '1px solid #5eb6b2',
                background: '#5eb6b2',
                color: '#fff',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/en"
              style={{
                minHeight: 44,
                padding: '12px 24px',
                borderRadius: 999,
                border: '1px solid #43434e',
                background: 'transparent',
                color: '#43434e',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Home
            </a>
          </div>
          {error.digest && (
            <p
              style={{
                marginTop: 24,
                fontSize: 13,
                opacity: 0.55,
                letterSpacing: '0.02em',
              }}
            >
              Error Code: 500 · {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}

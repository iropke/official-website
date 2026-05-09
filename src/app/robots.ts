import type { MetadataRoute } from 'next'

/**
 * /robots.txt 자동 생성.
 *
 * - 모든 경로 Allow
 * - /admin, /api/* 차단 (Payload admin / API 라우트)
 * - sitemap URL 명시 (Google 가이드: 절대 URL 권장)
 */

const baseUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

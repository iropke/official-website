import type { MetadataRoute } from 'next'
import { LOCALES } from '@/i18n/locales'

/**
 * /robots.txt 자동 생성.
 *
 * - 모든 경로 Allow
 * - /admin, /api/* 차단 (Payload admin / API 라우트)
 * - sitemap URL 20개 명시 (locale 별 sub-sitemap 직접 운영)
 *
 * 정책 (2026-05-12): Next.js 16 의 metadata file API 는 `generateSitemaps`
 * 사용 시 sub-sitemap (`/sitemap/<locale>.xml`) 만 자동 생성하고, sitemap-index
 * (`/sitemap.xml`) 는 만들지 않는다 (vercel/next.js#77304). 별도 sitemap-index
 * Route Handler 를 추가하는 대신, robots.txt 에 20개 sub-sitemap URL 을 모두
 * 명시해 크롤러가 직접 발견하도록 한다. GSC/Bing 도 locale 별로 20개 sub-sitemap
 * URL 을 직접 제출 (D-7 체크리스트).
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
    sitemap: LOCALES.map((locale) => `${baseUrl}/sitemap/${locale}.xml`),
    host: baseUrl,
  }
}

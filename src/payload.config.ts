import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Inquiries } from './collections/Inquiries'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Payload 3.82.1 기준, serverURL 미설정 + collection-level livePreview 만 있으면
 * admin UI 에 Live Preview 탭이 뜨지 않는 케이스가 확인됨. root-level livePreview
 * 를 함께 선언하고 Vercel 의 기본 env (VERCEL_URL) 로 serverURL 을 계산하여
 * preview iframe 의 절대 URL 해석이 가능하도록 구성.
 *
 * 우선순위:
 *   NEXT_PUBLIC_SERVER_URL → VERCEL_URL(자동 주입, 도메인만 있음) → localhost
 */
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // root-level livePreview — collection-level 과 함께 선언해 Payload 3.82.1
    // 의 admin UI 가 Live Preview 탭을 인식하도록 보조.
    livePreview: {
      url: ({ data, collectionConfig, locale }) => {
        const code =
          typeof locale === 'string'
            ? locale
            : ((locale as { code?: string })?.code ?? 'ko')
        const slug = (data as { slug?: string })?.slug ?? ''
        const slugPart = slug ? `/${slug}` : ''
        if (collectionConfig?.slug === 'posts') {
          return `${serverURL}/${code}/insights${slugPart}`
        }
        if (collectionConfig?.slug === 'pages') {
          return `${serverURL}/${code}${slugPart}`
        }
        return `${serverURL}/${code}`
      },
      collections: ['posts', 'pages'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Media, Tags, Posts, Pages, Inquiries],
  globals: [Navigation, SiteSettings, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  localization: {
    locales: [
      { label: '한국어', code: 'ko' },
      { label: 'English', code: 'en' },
      { label: 'Español', code: 'es' },
      { label: 'Русский', code: 'ru' },
      { label: 'Deutsch', code: 'de' },
      { label: 'Français', code: 'fr' },
      { label: '中文', code: 'zh' },
      { label: 'العربية', code: 'ar', rtl: true },
    ],
    defaultLocale: 'ko',
    fallback: true,
  },
})

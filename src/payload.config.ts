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
 * serverURL 은 preview/livePreview 에서 절대 URL 을 생성할 때 참조.
 *
 * 우선순위:
 *   NEXT_PUBLIC_SERVER_URL → VERCEL_URL(자동 주입, 도메인만) → localhost
 *
 * root-level admin.livePreview 는 Payload 3.82.1 에서 Edit 탭 회귀(접근 금지
 * 아이콘 표시)를 유발하여 제거. collection-level livePreview 만 유지.
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

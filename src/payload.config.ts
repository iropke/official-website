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

/**
 * CSRF / CORS 허용 오리진.
 *
 * Payload 3.x 는 mutation(POST/PATCH/DELETE) 요청의 Origin 을 `csrf` 배열과
 * 대조하고 일치하지 않으면 req.user 를 주입하지 않아 403 "not allowed" 를
 * 반환한다. 프리뷰 도메인에서 admin 에 접속하면 serverURL(프로덕션) 과
 * origin 이 달라 mutation 이 모두 차단되는 문제가 있어 아래 화이트리스트 필요.
 *
 * 포함:
 *   - serverURL (env 우선순위 결과)
 *   - 프로덕션 고정 도메인
 *   - 현재 작업 중인 프리뷰 브랜치 별칭
 *   - 로컬 개발 (localhost:3000)
 *   - Vercel 이 매 배포마다 자동 주입하는 VERCEL_URL (per-deploy 프리뷰 URL)
 *
 * 새 프리뷰 브랜치 별칭이 추가되면 이 배열에 명시적으로 넣어야 한다.
 */
const allowedOrigins = Array.from(
  new Set(
    [
      serverURL,
      'http://localhost:3000',
      'https://official-website-topaz-gamma.vercel.app',
      'https://official-website-git-feat-homepage-sections-iropkes-projects.vercel.app',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter((origin): origin is string => Boolean(origin)),
  ),
)

export default buildConfig({
  serverURL,
  csrf: allowedOrigins,
  cors: allowedOrigins,
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

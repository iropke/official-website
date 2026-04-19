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

export default buildConfig({
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
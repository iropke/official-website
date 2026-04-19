# Payload CMS 데이터 설계 및 프론트엔드 연동 가이드

> Payload CMS 3.x 컬렉션(Collections), 글로벌(Globals) 스키마 정의와 Next.js 15 App Router 프론트엔드 연동 패턴을 정리한 문서입니다.
> `setup-guide.md`의 환경 세팅이 완료된 후, 실제 데이터 구조를 설계하고 프론트엔드에 연결하는 단계입니다.

---

## 1. 컬렉션(Collections) 정의

현재 프론트엔드 페이지 기준으로 필요한 컬렉션입니다.

| 컬렉션 | 파일 경로 | 용도 | 주요 필드 |
|--------|-----------|------|-----------|
| `posts` | `src/payload/collections/Posts.ts` | Insights 게시글 | title, slug, intro, heroImage, content(Lexical), tags, publishedAt |
| `tags` | `src/payload/collections/Tags.ts` | 게시글 태그 | label, slug |
| `media` | `src/payload/collections/Media.ts` | 이미지/파일 업로드 | filename, alt, url, mimeType |
| `inquiries` | `src/payload/collections/Inquiries.ts` | 프로젝트 문의 저장 | companyName, contactName, email, phone, projectOverview 등 |

### 1-1. Posts 컬렉션 상세 스키마

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|:----:|------|
| `title` | text | ✅ | 게시글 제목 |
| `slug` | text (unique) | ✅ | URL 슬러그 (자동 생성 hook 가능) |
| `intro` | textarea | ✅ | 요약/인트로 텍스트 |
| `heroImage` | upload (→ media) | ✅ | 대표 이미지 |
| `content` | richText (Lexical) | ✅ | 본문 (에디토리얼 블록: h1-h6, p, list, media, table, quote, code, qna, delimiter) |
| `tags` | relationship (→ tags, hasMany) |  | 태그 배열 |
| `publishedAt` | date | ✅ | 발행일 |
| `status` | select (draft / published) | ✅ | 발행 상태 |
| `author` | text |  | 작성자명 |

```ts
// src/payload/collections/Posts.ts
import type { CollectionConfig } from 'payload';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'intro', type: 'textarea', required: true, localized: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'content', type: 'richText', required: true, localized: true },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    { name: 'publishedAt', type: 'date', required: true, admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
};
```

### 1-2. Tags 컬렉션

```ts
// src/payload/collections/Tags.ts
import type { CollectionConfig } from 'payload';

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'label' },
  fields: [
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
  ],
};
```

### 1-3. Media 컬렉션

```ts
// src/payload/collections/Media.ts
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 540, height: 398 },
      { name: 'hero', width: 1200, height: 675 },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true },
  ],
};
```

### 1-4. Inquiries 컬렉션

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|:----:|------|
| `companyName` | text | ✅ | 회사명 |
| `contactName` | text | ✅ | 담당자명 |
| `jobTitle` | text |  | 직책 |
| `phone` | text | ✅ | 연락처 |
| `email` | email | ✅ | 이메일 |
| `projectOverview` | textarea | ✅ | 프로젝트 개요 |
| `rfpFile` | upload (→ media) |  | RFP 첨부파일 |
| `website` | text | ✅ | 현재 웹사이트 URL |
| `launchDate` | date |  | 희망 런칭일 |

```ts
// src/payload/collections/Inquiries.ts
import type { CollectionConfig } from 'payload';

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'contactName', 'email', 'createdAt'],
  },
  access: {
    create: () => true,      // 프론트엔드에서 누구나 문의 가능
    read: ({ req }) => !!req.user,  // 관리자만 열람 가능
  },
  fields: [
    { name: 'companyName', type: 'text', required: true },
    { name: 'contactName', type: 'text', required: true },
    { name: 'jobTitle', type: 'text' },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'projectOverview', type: 'textarea', required: true },
    { name: 'rfpFile', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text', required: true },
    { name: 'launchDate', type: 'date' },
  ],
  hooks: {
    afterChange: [
      // TODO: Resend를 통한 이메일 알림 hook 연결
    ],
  },
};
```

---

## 2. 글로벌(Globals) 정의

모든 페이지에서 공유되는 사이트 전역 데이터입니다.

| 글로벌 | 파일 경로 | 용도 | 주요 필드 |
|--------|-----------|------|-----------|
| `navigation` | `src/payload/globals/Navigation.ts` | Header 메가메뉴 데이터 | menuGroups[ ] → items[ ] |
| `footer` | `src/payload/globals/Footer.ts` | Footer 링크/소셜 | socialLinks[ ], copyright, privacyHref |
| `siteSettings` | `src/payload/globals/SiteSettings.ts` | 사이트 기본 설정 | siteName, defaultLocale, languages[ ] |

### 2-1. Navigation 글로벌

```ts
// src/payload/globals/Navigation.ts
import type { GlobalConfig } from 'payload';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  fields: [
    {
      name: 'menuGroups',
      type: 'array',
      label: 'Menu Groups',
      fields: [
        { name: 'groupLabel', type: 'text', required: true, localized: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'description', type: 'textarea', localized: true },
            { name: 'href', type: 'text', required: true },
            { name: 'kicker', type: 'text', localized: true },
            {
              name: 'gradient',
              type: 'text',
              admin: { description: 'CSS gradient string for card media' },
            },
          ],
        },
      ],
    },
  ],
};
```

### 2-2. Footer 글로벌

```ts
// src/payload/globals/Footer.ts
import type { GlobalConfig } from 'payload';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  fields: [
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['linkedin', 'instagram', 'youtube'] },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'copyright', type: 'text', localized: true },
    { name: 'privacyHref', type: 'text' },
  ],
};
```

### 2-3. SiteSettings 글로벌

```ts
// src/payload/globals/SiteSettings.ts
import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  fields: [
    { name: 'siteName', type: 'text', required: true },
    {
      name: 'languages',
      type: 'array',
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
};
```

---

## 3. Payload 메인 설정 (payload.config.ts)

```ts
// src/payload/payload.config.ts
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { resendAdapter } from '@payloadcms/email-resend';

import { Posts } from './collections/Posts';
import { Tags } from './collections/Tags';
import { Media } from './collections/Media';
import { Inquiries } from './collections/Inquiries';
import { Navigation } from './globals/Navigation';
import { Footer } from './globals/Footer';
import { SiteSettings } from './globals/SiteSettings';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI! },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM!,
    defaultFromName: 'Iropke',
    apiKey: process.env.RESEND_API_KEY!,
  }),
  collections: [Posts, Tags, Media, Inquiries],
  globals: [Navigation, Footer, SiteSettings],
  localization: {
    locales: [
      { code: 'ko', label: '한국어' },
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'ru', label: 'Русский' },
      { code: 'de', label: 'Deutsch' },
      { code: 'fr', label: 'Français' },
    ],
    defaultLocale: 'ko',
    fallback: true,
  },
  plugins: [
    seoPlugin({ collections: ['posts'] }),
    // cloudStoragePlugin({ ... }) — Cloudinary 설정 추가
  ],
  typescript: { outputFile: 'src/payload-types.ts' },
});
```

---

## 4. 프론트엔드 데이터 연동 패턴

### 4-1. getPayload 헬퍼

```ts
// src/lib/payload.ts
import { getPayload as getPayloadInstance } from 'payload';
import config from '@/payload/payload.config';

export async function getPayload() {
  return getPayloadInstance({ config });
}
```

### 4-2. Server / Client 컴포넌트 분리 패턴

핵심은 데이터를 **Server Component에서 fetch**하고, 인터랙션이 필요한 UI만 **Client Component**로 분리하는 것입니다.

| 패턴 | 적용 페이지 | 이유 |
|------|------------|------|
| Server Component에서 fetch → Client에 props 전달 | `insights/page.tsx`, `insights/[slug]/page.tsx` | SEO 필수, 데이터를 서버에서 가져옴 |
| Client Component 유지 | `project-inquiry/page.tsx` | 폼 인터랙션이 핵심, submit만 Server Action 사용 |
| Global은 layout.tsx에서 fetch | `layout.tsx` (Header/Footer) | 모든 페이지에서 공유되는 데이터 |

### 4-3. 데이터 흐름 다이어그램

```
layout.tsx (Server Component)
  │
  ├─ getPayload() → navigation, footer, siteSettings 글로벌 fetch
  ├─ <Header navigationData={nav} languages={settings.languages} />
  ├─ <main>{children}</main>
  └─ <Footer footerData={footer} />

insights/page.tsx (Server Component)
  │
  ├─ getPayload() → posts 컬렉션 fetch (paginated, where: { status: 'published' })
  └─ <PostListClient posts={posts} pagination={...} />

insights/[slug]/page.tsx (Server Component)
  │
  ├─ getPayload() → single post fetch (where: { slug })
  ├─ getPayload() → related posts fetch (limit: 5, exclude current)
  └─ <PostDetailClient post={post} relatedPosts={related} tags={tags} />

project-inquiry/page.tsx (Client Component)
  │
  └─ form submit → Server Action → payload.create({ collection: 'inquiries', data })
```

---

## 5. 페이지별 연동 코드 예시

### 5-1. layout.tsx — Header/Footer 글로벌 연동

```tsx
// src/app/(frontend)/[locale]/layout.tsx
import { getPayload } from '@/lib/payload';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import FloatingActions from '@/components/layout/FloatingActions/FloatingActions';

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const payload = await getPayload();

  const navigation = await payload.findGlobal({
    slug: 'navigation',
    locale: params.locale,
  });

  const footer = await payload.findGlobal({
    slug: 'footer',
    locale: params.locale,
  });

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  });

  return (
    <html lang={params.locale}>
      <body className="layout-body">
        <div className="layout-page layout-page--no-clip">
          <Header
            navigationData={navigation.menuGroups}
            languages={siteSettings.languages}
          />
          <main className="layout-main">{children}</main>
          <Footer footerData={footer} />
        </div>
        <FloatingActions inquiryHref={`/${params.locale}/project-inquiry`} />
      </body>
    </html>
  );
}
```

### 5-2. insights/page.tsx — 게시글 목록

```tsx
// src/app/(frontend)/[locale]/insights/page.tsx (Server Component)
import { getPayload } from '@/lib/payload';
import PostListClient from './PostListClient';

interface PageProps {
  params: { locale: string };
  searchParams: { page?: string };
}

export default async function InsightsPage({ params, searchParams }: PageProps) {
  const payload = await getPayload();
  const currentPage = Number(searchParams.page) || 1;
  const perPage = 20;

  const { docs, totalPages } = await payload.find({
    collection: 'posts',
    locale: params.locale,
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    page: currentPage,
    limit: perPage,
    depth: 1, // heroImage 관계 포함
  });

  return (
    <PostListClient
      posts={docs}
      pagination={{ currentPage, totalPages }}
      locale={params.locale}
    />
  );
}
```

```tsx
// src/app/(frontend)/[locale]/insights/PostListClient.tsx ('use client')
// 기존 page.tsx의 UI 로직을 그대로 옮기되,
// placeholder 데이터 대신 props로 받은 실제 데이터를 사용
```

### 5-3. insights/[slug]/page.tsx — 게시글 상세

```tsx
// src/app/(frontend)/[locale]/insights/[slug]/page.tsx (Server Component)
import { getPayload } from '@/lib/payload';
import { notFound } from 'next/navigation';
import PostDetailClient from './PostDetailClient';

interface PageProps {
  params: { locale: string; slug: string };
}

export default async function PostDetailPage({ params }: PageProps) {
  const payload = await getPayload();

  const { docs } = await payload.find({
    collection: 'posts',
    locale: params.locale,
    where: {
      slug: { equals: params.slug },
      status: { equals: 'published' },
    },
    depth: 2, // heroImage + tags 관계 포함
    limit: 1,
  });

  const post = docs[0];
  if (!post) notFound();

  // 관련 게시글 (같은 태그, 현재 글 제외, 최신 5건)
  const tagIds = (post.tags || []).map((t: any) => (typeof t === 'string' ? t : t.id));
  const { docs: relatedPosts } = await payload.find({
    collection: 'posts',
    locale: params.locale,
    where: {
      and: [
        { status: { equals: 'published' } },
        { id: { not_equals: post.id } },
        ...(tagIds.length > 0 ? [{ tags: { in: tagIds } }] : []),
      ],
    },
    sort: '-publishedAt',
    limit: 5,
    depth: 1,
  });

  return (
    <PostDetailClient
      post={post}
      relatedPosts={relatedPosts}
      locale={params.locale}
    />
  );
}
```

### 5-4. project-inquiry/page.tsx — Server Action 연동

```ts
// src/app/(frontend)/[locale]/project-inquiry/actions.ts
'use server';

import { getPayload } from '@/lib/payload';

export async function submitInquiry(data: {
  companyName: string;
  contactName: string;
  jobTitle?: string;
  phone: string;
  email: string;
  projectOverview: string;
  website: string;
  launchDate?: string;
}) {
  const payload = await getPayload();

  await payload.create({
    collection: 'inquiries',
    data,
  });

  // Resend를 통한 알림 이메일은 Inquiries 컬렉션의 afterChange hook에서 자동 처리
  return { success: true };
}
```

```tsx
// project-inquiry/page.tsx에서 Server Action 호출
import { submitInquiry } from './actions';

// handleSubmit 내부에서:
const result = await submitInquiry(formData);
if (result.success) setShowModal(true);
```

---

## 6. 파일 구조 전체 요약

```
src/
├── payload/
│   ├── payload.config.ts              ← Payload 메인 설정
│   ├── collections/
│   │   ├── Posts.ts                   ← 게시글 컬렉션
│   │   ├── Tags.ts                    ← 태그 컬렉션
│   │   ├── Media.ts                   ← 미디어 컬렉션
│   │   └── Inquiries.ts              ← 문의 컬렉션
│   └── globals/
│       ├── Navigation.ts              ← 메가메뉴 글로벌
│       ├── Footer.ts                  ← 푸터 글로벌
│       └── SiteSettings.ts            ← 사이트 설정 글로벌
│
├── lib/
│   └── payload.ts                     ← getPayload() 헬퍼
│
├── components/
│   ├── icons/
│   │   ├── SvgIcons.tsx
│   │   └── index.ts
│   └── layout/
│       ├── Header/Header.tsx + .module.css
│       ├── Footer/Footer.tsx + .module.css
│       ├── MegaMenu/MegaMenu.tsx + .module.css
│       ├── SearchToggle/SearchToggle.tsx + .module.css
│       ├── LanguageSelector/LanguageSelector.tsx + .module.css
│       ├── FloatingActions/FloatingActions.tsx + .module.css
│       └── index.ts
│
├── app/(frontend)/[locale]/
│   ├── layout.tsx                     ← Server: 글로벌 fetch → Header/Footer에 전달
│   ├── insights/
│   │   ├── page.tsx                   ← Server: posts fetch → PostListClient에 전달
│   │   ├── PostListClient.tsx         ← Client: UI + reveal 애니메이션
│   │   ├── PostList.module.css
│   │   └── [slug]/
│   │       ├── page.tsx               ← Server: single post + related fetch
│   │       ├── PostDetailClient.tsx   ← Client: UI + reveal 애니메이션
│   │       └── PostDetail.module.css
│   └── project-inquiry/
│       ├── page.tsx                   ← Client: 폼 + 유효성 검증
│       ├── actions.ts                 ← Server Action: 문의 저장
│       └── ProjectInquiry.module.css
│
├── styles/
│   ├── globals.css                    ← 디자인 토큰, 리셋
│   └── layout-page.css               ← 페이지 래퍼 스타일
│
└── payload-types.ts                   ← 자동 생성 TypeScript 타입
```

---

## 7. 구현 순서 체크리스트

| # | 단계 | 작업 내용 | 선행 조건 |
|---|------|-----------|-----------|
| 1 | 컬렉션/글로벌 스키마 | Posts, Tags, Media, Inquiries 컬렉션 + Navigation, Footer, SiteSettings 글로벌 파일 생성 | setup-guide.md STEP 3 완료 |
| 2 | payload.config.ts | 메인 설정 파일에 컬렉션/글로벌/로컬라이제이션 등록 | 단계 1 |
| 3 | getPayload 헬퍼 | `src/lib/payload.ts` 생성 | 단계 2 |
| 4 | TypeScript 타입 생성 | `pnpm payload generate:types` 실행 → `payload-types.ts` 자동 생성 | 단계 2 |
| 5 | layout.tsx 리팩터링 | Server Component로 전환, 글로벌 데이터 fetch → Header/Footer props 전달 | 단계 3 |
| 6 | insights/page.tsx 분리 | Server Component(fetch) + PostListClient(UI) 분리 | 단계 3 |
| 7 | insights/[slug]/page.tsx 분리 | Server Component(fetch) + PostDetailClient(UI) 분리 | 단계 3 |
| 8 | Server Action 생성 | `project-inquiry/actions.ts` 생성, 폼에서 호출 연결 | 단계 3 |
| 9 | Admin에서 테스트 데이터 입력 | `/admin`에서 posts, tags, navigation 등 샘플 데이터 입력 | 단계 4 |
| 10 | 프론트엔드 통합 테스트 | 실제 데이터로 전체 페이지 렌더링 확인 | 단계 9 |

---

## 8. 참고 사항

- **Lexical 리치텍스트와 에디토리얼 블록**: Payload 3.x의 Lexical 에디터는 커스텀 블록(Block)을 지원합니다. `editorial-media`, `editorial-table`, `editorial-quote`, `editorial-code`, `editorial-qna` 등의 블록을 Lexical 설정에서 정의하면, 관리자 화면에서 블록 단위로 콘텐츠를 편집할 수 있습니다.
- **다국어(Localization)**: `localized: true`로 설정된 필드는 Payload Admin에서 언어별로 별도 입력이 가능합니다. 프론트엔드에서는 `locale` 파라미터를 전달하면 해당 언어의 데이터가 자동으로 반환됩니다.
- **이미지 최적화**: Media 컬렉션의 `imageSizes` 설정으로 썸네일/히어로 크기를 사전 정의하면, 프론트엔드에서 Next.js `<Image>` 컴포넌트와 함께 최적화된 이미지를 사용할 수 있습니다.
- **접근 제어(Access Control)**: Inquiries 컬렉션은 `create: () => true`로 설정하여 비로그인 사용자도 문의를 제출할 수 있도록 하되, `read`는 관리자만 가능하도록 제한합니다.
- **이메일 알림**: Inquiries 컬렉션의 `afterChange` hook에서 Resend API를 호출하여 새 문의 알림 이메일을 발송할 수 있습니다. (setup-guide.md의 Resend 설정 참조)

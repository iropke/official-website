import PostDetailClient from './PostDetailClient'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { locale, slug } = await params

  return <PostDetailClient locale={locale} slug={slug} />
}

import PostListClient from './PostListClient'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function InsightsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { page } = await searchParams
  const currentPage = Number(page) || 1

  return <PostListClient locale={locale} currentPage={currentPage} />
}

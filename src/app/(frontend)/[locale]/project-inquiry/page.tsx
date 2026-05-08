import type { Metadata } from 'next'
import { normalizeLocale } from '@/i18n/locales'
import { buildAlternates } from '@/i18n/alternates'
import ProjectInquiryClient from './ProjectInquiryClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  return {
    alternates: buildAlternates(locale, '/project-inquiry'),
  }
}

export default function ProjectInquiryPage() {
  return <ProjectInquiryClient />
}

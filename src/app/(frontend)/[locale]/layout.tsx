import React from 'react'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import FloatingActions from '@/components/layout/FloatingActions/FloatingActions'
import LocaleHtmlAttributes from './LocaleHtmlAttributes'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  return (
    <>
      <LocaleHtmlAttributes locale={locale} />
      <div className="layout-page layout-page--no-clip">
        <Header />
        <main className="layout-main">
          {children}
        </main>
        <Footer />
      </div>
      <FloatingActions inquiryHref={`/${locale}/project-inquiry`} />
    </>
  )
}

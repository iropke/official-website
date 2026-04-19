import React from 'react'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/layout-page.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Iropke',
    default: 'Iropke',
  },
  description: 'Structured growth systems for global brands.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="layout-body">
        {children}
      </body>
    </html>
  )
}

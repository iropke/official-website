import React from 'react'
import type { Metadata } from 'next'

import { normalizeLocale } from '@/i18n/locales'
import { getPrivacyPolicy } from './content'
import PrivacyPolicyClient from './PrivacyPolicyClient'

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  const copy = getPrivacyPolicy(locale)

  return {
    title: copy.pageTitle,
    description: copy.pageMetaDescription,
  }
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale: rawLocale } = await params
  const locale = normalizeLocale(rawLocale)
  const copy = getPrivacyPolicy(locale)

  return <PrivacyPolicyClient copy={copy} />
}

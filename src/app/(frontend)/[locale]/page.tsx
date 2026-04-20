import React from 'react';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Homepage as HomepageGlobal, Post } from '@/payload-types';

import Hero from '@/components/home/Hero/Hero';
import SubCarousel from '@/components/home/SubCarousel/SubCarousel';
import AIOSGrid from '@/components/home/AIOSGrid/AIOSGrid';
import CoreMessage from '@/components/home/CoreMessage/CoreMessage';
import Insights from '@/components/home/Insights/Insights';
import CtaBanner from '@/components/home/CtaBanner/CtaBanner';

type SupportedLocale = 'ko' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'zh' | 'ar';
const SUPPORTED_LOCALES: SupportedLocale[] = [
  'ko',
  'en',
  'es',
  'ru',
  'de',
  'fr',
  'zh',
  'ar',
];

function normalizeLocale(raw: string): SupportedLocale {
  return (SUPPORTED_LOCALES as string[]).includes(raw)
    ? (raw as SupportedLocale)
    : 'en';
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const payload = await getPayload({ config });
  let homepage: HomepageGlobal | null = null;
  try {
    homepage = (await payload.findGlobal({
      slug: 'homepage',
      locale,
      depth: 0,
    })) as HomepageGlobal;
  } catch {
    homepage = null;
  }

  const title = homepage?.heroHeadline
    ? `${homepage.heroHeadline} | IROPKE`
    : 'IROPKE — From Visibility to Control';
  const description =
    homepage?.heroSubCopy ??
    'IROPKE builds AI-powered operating systems for digital business.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const payload = await getPayload({ config });

  // ── Fetch Homepage global (localized) ──────────────────────────
  let homepage: HomepageGlobal | null = null;
  try {
    homepage = (await payload.findGlobal({
      slug: 'homepage',
      locale,
      depth: 1,
    })) as HomepageGlobal;
  } catch (err) {
    console.error('[HomePage] Failed to load homepage global:', err);
    homepage = null;
  }

  // ── Fetch latest published insights ────────────────────────────
  const insightsCount = Math.max(
    2,
    Math.min(8, homepage?.insightsCount ?? 4)
  );

  let latestPosts: Post[] = [];
  try {
    const postsResult = await payload.find({
      collection: 'posts',
      locale,
      depth: 1,
      limit: insightsCount,
      sort: '-publishedDate',
      // Payload drafts: 기본 draft:false 이므로 _status=published 만 반환 →
      // 별도 status 조건 불필요. publishedLocales 로 언어별 공개 여부만 필터.
      where: {
        publishedLocales: { equals: locale },
      },
    });
    latestPosts = postsResult.docs as Post[];
  } catch (err) {
    console.error('[HomePage] Failed to load posts:', err);
    latestPosts = [];
  }

  // ── Fallback values when Homepage global is empty ──────────────
  const heroHeadline =
    homepage?.heroHeadline ?? 'From Visibility to Control';
  const heroSubCopy =
    homepage?.heroSubCopy ??
    "We don't build websites.\nWe build the system behind them.";
  const heroCta: NonNullable<HomepageGlobal['heroCta']> =
    homepage?.heroCta && homepage.heroCta.length > 0
      ? homepage.heroCta
      : [
          { label: 'Explore Our System', url: '#os-grid', variant: 'primary' },
          { label: 'Start a Project', url: '/project-inquiry', variant: 'secondary' },
        ];

  const carouselSlides = homepage?.carouselSlides ?? [];

  const gridSectionTitle = homepage?.gridSectionTitle ?? 'IROPKE OS™';
  const gridCards: NonNullable<HomepageGlobal['gridCards']> =
    homepage?.gridCards && homepage.gridCards.length > 0
      ? homepage.gridCards
      : [
          {
            name: 'NOVA™',
            tagline: 'Maintain Your Identity',
            description:
              'Keep brand and product identity coherent across every touchpoint as your business scales.',
            link: '/solution/nova',
            gradient: 'linear-gradient(135deg, #1f4a44 0%, #0d201d 100%)',
          },
          {
            name: 'SAGE™',
            tagline: 'Be Chosen by AI',
            description:
              'Structure content and schema so AI answer engines cite your brand, not your competitors.',
            link: '/solution/sage',
            gradient: 'linear-gradient(135deg, #345347 0%, #0f1a17 100%)',
          },
          {
            name: 'LUMI™',
            tagline: 'Adapt Content Across Channels',
            description:
              'Localize and reshape core content into channel-specific formats without breaking brand tone.',
            link: '/solution/lumi',
            gradient: 'linear-gradient(135deg, #1d4960 0%, #111922 100%)',
          },
          {
            name: 'NIX™',
            tagline: 'Structure Hidden Risks',
            description:
              'Surface structural and compliance risks early and turn them into maintainable system policies.',
            link: '/solution/nix',
            gradient: 'linear-gradient(135deg, #3d4c26 0%, #162013 100%)',
          },
        ];

  const coreMessage =
    homepage?.coreMessage ?? 'Not four services. One system.';
  const coreMessageSubtext =
    homepage?.coreMessageSubtext ??
    'IROPKE OS™ connects branding, visibility, content, and risk into a unified structure.';

  const insightsSectionTitle =
    homepage?.insightsSectionTitle ?? 'Latest Insights';
  const insightsCtaLabel =
    homepage?.insightsCtaLabel ?? 'View All Insights';
  const insightsCtaUrl = homepage?.insightsCtaUrl ?? '/insights';

  const ctaBannerMessage =
    homepage?.ctaBannerMessage ??
    'If your problem is bigger than a website,\nwe should talk.';
  const ctaBannerCtaLabel =
    homepage?.ctaBannerCtaLabel ?? 'Go to Project Inquiry';
  const ctaBannerCtaUrl =
    homepage?.ctaBannerCtaUrl ?? '/project-inquiry';
  const ctaBannerGradient = homepage?.ctaBannerGradient ?? null;
  const heroBackgroundImage = homepage?.heroBackgroundImage ?? null;
  const insightsBackgroundImage = homepage?.insightsBackgroundImage ?? null;
  const ctaBannerBackgroundImage = homepage?.ctaBannerBackgroundImage ?? null;

  return (
    <>
      <Hero
        headline={heroHeadline}
        subCopy={heroSubCopy}
        ctas={heroCta}
        backgroundImage={heroBackgroundImage}
        locale={locale}
      />

      {carouselSlides.length >= 1 && (
        <SubCarousel slides={carouselSlides} locale={locale} />
      )}

      <div id="os-grid">
        <AIOSGrid
          sectionTitle={gridSectionTitle}
          cards={gridCards}
          locale={locale}
        />
      </div>

      <CoreMessage message={coreMessage} subtext={coreMessageSubtext} />

      <Insights
        sectionTitle={insightsSectionTitle}
        ctaLabel={insightsCtaLabel}
        ctaUrl={insightsCtaUrl}
        backgroundImage={insightsBackgroundImage}
        posts={latestPosts}
        locale={locale}
      />

      <CtaBanner
        message={ctaBannerMessage}
        ctaLabel={ctaBannerCtaLabel}
        ctaUrl={ctaBannerCtaUrl}
        gradient={ctaBannerGradient}
        backgroundImage={ctaBannerBackgroundImage}
        locale={locale}
      />
    </>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PostDetail.module.css';

/* ═══════════════════════════════════════════════════════════════
   Public types — produced by the server component (page.tsx)
   ═══════════════════════════════════════════════════════════════ */
export interface TagData {
  label: string;
  href: string;
}

export interface RelatedPostData {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

/**
 * 참고 문서 (references) — 본문 하단 ul 항목.
 * 세 필드 모두 trim 후 빈 문자열일 수 있음. 적어도 하나는 비지 않음을 server 가 보장.
 *  - title: <strong> 으로 굵게
 *  - content: 본문 (whitespace pre-line 보존)
 *  - link: 입력 시 새 창. http(s):// 미입력 시 자동 보정.
 */
export interface ReferenceData {
  title: string;
  content: string;
  link: string;
}

/**
 * Lexical SerializedEditorState shape (loose typing — Payload 의 richText 필드가
 * `{ root: { children: [...] } }` 구조를 반환. 런타임 JSON 을 그대로 받는다).
 */
export interface LexicalContent {
  root: {
    type?: string;
    children?: LexicalNode[];
    direction?: 'ltr' | 'rtl' | null;
    format?: string;
    indent?: number;
    version?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

interface LexicalNode {
  type?: string;
  version?: number;
  children?: LexicalNode[];
  [k: string]: unknown;
}

export interface PostDetailData {
  title: string;
  intro: string;
  heroImageUrl: string;
  heroImageAlt: string;
  content: LexicalContent | null;
  tags: TagData[];
  references: ReferenceData[];
}

/**
 * 참고 문서 link 의 외부 URL 보정.
 * - http://, https://, // 로 시작 → 그대로
 * - 그 외 (도메인만, 또는 mailto: 등) → href 그대로 두되, http(s) 가 빠진 경우만 https:// 보정
 */
function normalizeReferenceLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  if (/^(mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

interface PostDetailProps {
  /**
   * 관련글 카드 / "더 보기" 링크의 prefix.
   * 예: `/en/insight`, `/en/story`, `/en/portfolio`, `/en/solution`, `/en/service`. (locale prefix 포함)
   */
  basePath: string;
  /** 빈 메시지 / "더 보기" 라벨 ko/en 분기용. */
  locale: string;
  post: PostDetailData;
  relatedPosts: RelatedPostData[];
  /**
   * 우측 `<aside>` (관련글 + "더 보기") 렌더 skip + 본문을 12-col 전체 폭으로 확장.
   * Solution / Service 카테고리는 제품 페이지 성격이라 관련글 sidebar 없이 full-width 로 표현.
   * 미지정(기본 false) 시 기존 9+3 두 컬럼 구조 유지 — Insight / Story / Portfolio.
   */
  hideAside?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Lexical 기본 블록 렌더러
   Phase 1 스코프: root / heading / paragraph / list / listitem / quote /
                 upload(image) / horizontalrule / link / text (format bitmask)
   커스텀 블록(table/qna/code/rawHtml/video)은 Phase 2-3 에서 BlocksFeature
   기반으로 확장 예정.
   ═══════════════════════════════════════════════════════════════ */

// Lexical TextNode.format 비트 플래그
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;
const FORMAT_SUBSCRIPT = 1 << 5;
const FORMAT_SUPERSCRIPT = 1 << 6;

function renderTextNode(node: LexicalNode, key: number): React.ReactNode {
  const text = typeof node.text === 'string' ? node.text : '';
  const format = typeof node.format === 'number' ? node.format : 0;

  let element: React.ReactNode = text;
  if (format & FORMAT_CODE) element = <code key={`c${key}`}>{element}</code>;
  if (format & FORMAT_BOLD) element = <strong key={`b${key}`}>{element}</strong>;
  if (format & FORMAT_ITALIC) element = <em key={`i${key}`}>{element}</em>;
  if (format & FORMAT_UNDERLINE) element = <u key={`u${key}`}>{element}</u>;
  if (format & FORMAT_STRIKETHROUGH) element = <s key={`s${key}`}>{element}</s>;
  if (format & FORMAT_SUBSCRIPT) element = <sub key={`sub${key}`}>{element}</sub>;
  if (format & FORMAT_SUPERSCRIPT) element = <sup key={`sup${key}`}>{element}</sup>;

  return <React.Fragment key={key}>{element}</React.Fragment>;
}

function renderInlineChildren(children: LexicalNode[] | undefined): React.ReactNode {
  if (!children || !children.length) return null;
  return children.map((child, i) => {
    const t = child.type;
    if (t === 'text') return renderTextNode(child, i);
    if (t === 'linebreak') return <br key={i} />;
    if (t === 'link') {
      const fields = (child as { fields?: { url?: string; newTab?: boolean } }).fields;
      const url = fields?.url ?? '#';
      const newTab = Boolean(fields?.newTab);
      return (
        <a
          key={i}
          href={url}
          className={styles.editorialLink}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {renderInlineChildren(child.children)}
        </a>
      );
    }
    // autolink, mark 등 기타 inline 은 children 을 flatten
    return <React.Fragment key={i}>{renderInlineChildren(child.children)}</React.Fragment>;
  });
}

interface RenderBlockArgs {
  node: LexicalNode;
  index: number;
  revealClass: string;
  delay: string;
  styles: { [k: string]: string };
}

function renderBlockNode({ node, index, revealClass, delay, styles: s }: RenderBlockArgs): React.ReactNode {
  const t = node.type;
  const key = index;

  if (t === 'heading') {
    const rawTag = typeof node.tag === 'string' ? node.tag : 'h2';
    const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
    const Tag = (allowedTags as readonly string[]).includes(rawTag)
      ? (rawTag as (typeof allowedTags)[number])
      : 'h2';
    return (
      <Tag key={key} className={revealClass} style={{ transitionDelay: delay }}>
        {renderInlineChildren(node.children)}
      </Tag>
    );
  }

  if (t === 'paragraph') {
    // 첫 단락 TL;DR 라벨 시각 숨김 (DOM 에는 보존 — AI 추출 / 검색엔진 신호 유지).
    // 컨벤션: 모든 evergreen body.md 의 첫 단락은 "<strong>TL;DR</strong>: <answer>" 형식으로 시작.
    // <span hidden> = display:none + AT 트리에서 제거 → 시각 사용자 / SR 사용자는
    // 답 본문만 받고, AI 봇 / 크롤러는 HTML 소스에서 "TL;DR: <answer>" 를 그대로 추출.
    // 매칭 조건 3종 모두: ① 첫 블록(index 0) ② 첫 child = bold "TL;DR" 정확 매치
    // ③ 둘째 child = ":" (선택적 공백) 으로 시작하는 텍스트.
    const kids = (node.children ?? []) as LexicalNode[];
    if (index === 0 && kids.length >= 2) {
      const c0 = kids[0];
      const c1 = kids[1];
      // Tolerant match (defense-in-depth, 2026-05-20): the translation
      // pipeline now preserves a verbatim bold "TL;DR" + ":" in every locale,
      // but accept minor variance (spacing, TLDR, fullwidth colon ：) so a
      // stray label never leaks visibly.
      const c0Bold =
        c0?.type === 'text' &&
        typeof c0.format === 'number' &&
        (c0.format & FORMAT_BOLD) !== 0 &&
        typeof c0.text === 'string' &&
        /^TL\s*;?\s*DR$/i.test(c0.text.trim());
      const c1Text = c1?.type === 'text' && typeof c1.text === 'string' ? c1.text : null;
      const colon = c0Bold && c1Text != null ? c1Text.match(/^\s*[:：]\s*/)?.[0] : null;
      if (c0Bold && c1Text != null && colon != null) {
        const c1Trim = { ...c1, text: c1Text.slice(colon.length) };
        return (
          <p key={key} className={revealClass} style={{ transitionDelay: delay }}>
            <span hidden>TL;DR{colon}</span>
            {renderInlineChildren([c1Trim, ...kids.slice(2)])}
          </p>
        );
      }
    }
    // 빈 paragraph 는 vertical spacing 역할만 하도록 유지
    return (
      <p key={key} className={revealClass} style={{ transitionDelay: delay }}>
        {renderInlineChildren(node.children)}
      </p>
    );
  }

  if (t === 'list') {
    const listType = (node as { listType?: string }).listType;
    const tag = (node as { tag?: string }).tag;
    const isOrdered = listType === 'number' || tag === 'ol';
    const ListTag = (isOrdered ? 'ol' : 'ul') as 'ol' | 'ul';
    return (
      <ListTag key={key} className={revealClass} style={{ transitionDelay: delay }}>
        {(node.children ?? []).map((li, i) => {
          if (li.type === 'listitem') {
            return <li key={i}>{renderInlineChildren(li.children)}</li>;
          }
          return null;
        })}
      </ListTag>
    );
  }

  if (t === 'quote') {
    return (
      <div key={key} className={`${s.editorialQuote} ${revealClass}`} style={{ transitionDelay: delay }}>
        <QuoteIcon className={s.editorialQuoteIcon} />
        <blockquote>
          <p>{renderInlineChildren(node.children)}</p>
        </blockquote>
      </div>
    );
  }

  if (t === 'horizontalrule') {
    return (
      <div
        key={key}
        className={`${s.editorialDelimiter} ${revealClass}`}
        style={{ transitionDelay: delay }}
        aria-hidden="true"
      >
        <span className={s.editorialDelimiterMark}>&#10022;</span>
      </div>
    );
  }

  if (t === 'upload') {
    const value = (node as { value?: { url?: string; alt?: string; width?: number; height?: number } }).value;
    const url = value?.url;
    if (!url) return null;
    const alt = value?.alt ?? '';
    const width = value?.width ?? 1200;
    const height = value?.height ?? Math.round(width * (675 / 1200));
    return (
      <div
        key={key}
        className={`${s.editorialMedia} ${revealClass}`}
        style={{ transitionDelay: delay }}
      >
        <figure>
          <div className={s.editorialMediaFrame}>
            <Image
              src={url}
              alt={alt}
              width={width}
              height={height}
              sizes="(max-width: 1079px) 100vw, 75vw"
            />
          </div>
        </figure>
      </div>
    );
  }

  // ─── BlocksFeature 커스텀 블록 (Phase 3) ───────────────────────
  // Lexical BlocksFeature 는 { type: 'block', fields: { blockType, ... } } 형태.
  if (t === 'block') {
    const fields = (node as { fields?: { blockType?: string } & Record<string, unknown> }).fields;
    const blockType = fields?.blockType;

    // editorialMedia: 이미지 + 캡션 + alignment(full/wide/center)
    if (blockType === 'editorialMedia') {
      type MediaRef = { url?: string; alt?: string; width?: number; height?: number };
      const imageRaw = fields?.image;
      const image: MediaRef | null =
        imageRaw && typeof imageRaw === 'object' ? (imageRaw as MediaRef) : null;
      const url = image?.url;
      if (!url) return null;
      const captionRaw = typeof fields?.caption === 'string' ? fields.caption.trim() : '';
      const altOverride = typeof fields?.alt === 'string' ? fields.alt.trim() : '';
      const alt = altOverride || image?.alt || '';
      const alignmentRaw = typeof fields?.alignment === 'string' ? fields.alignment : 'center';
      const alignment: 'center' | 'wide' | 'full' =
        alignmentRaw === 'wide' || alignmentRaw === 'full' ? alignmentRaw : 'center';
      const width = image?.width ?? 1200;
      const height = image?.height ?? Math.round(width * (675 / 1200));
      const alignmentClass =
        alignment === 'full'
          ? s.editorialMediaFull
          : alignment === 'wide'
          ? s.editorialMediaWide
          : s.editorialMediaCenter;
      return (
        <div
          key={key}
          className={`${s.editorialMedia} ${alignmentClass} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          <figure>
            <div className={s.editorialMediaFrame}>
              <Image
                src={url}
                alt={alt}
                width={width}
                height={height}
                sizes={
                  alignment === 'full'
                    ? '100vw'
                    : alignment === 'wide'
                    ? '(max-width: 1079px) 100vw, 82vw'
                    : '(max-width: 1079px) 100vw, 75vw'
                }
              />
            </div>
            {captionRaw && (
              <figcaption className={s.editorialMediaCaption}>{captionRaw}</figcaption>
            )}
          </figure>
        </div>
      );
    }

    // editorialTable: caption + headers[] + rows[].cells[]
    if (blockType === 'editorialTable') {
      type Cell = { text?: unknown };
      type Row = { cells?: Cell[] };
      type Header = { text?: unknown };
      const caption = typeof fields?.caption === 'string' ? fields.caption.trim() : '';
      const headers = Array.isArray(fields?.headers) ? (fields.headers as Header[]) : [];
      const rows = Array.isArray(fields?.rows) ? (fields.rows as Row[]) : [];
      if (!headers.length || !rows.length) return null;
      return (
        <div
          key={key}
          className={`${s.editorialTable} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          <div className={s.editorialTableWrap}>
            <table {...(caption ? { 'aria-label': caption } : {})}>
              <thead>
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} scope="col">
                      {typeof h?.text === 'string' ? h.text : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {(row.cells ?? []).map((cell, ci) => (
                      <td key={ci}>{typeof cell?.text === 'string' ? cell.text : ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // qnaList: items[] of { role: 'question'|'answer', text }
    if (blockType === 'qnaList') {
      type QnaItem = { role?: unknown; text?: unknown };
      const items = Array.isArray(fields?.items) ? (fields.items as QnaItem[]) : [];
      if (!items.length) return null;
      return (
        <div
          key={key}
          className={`${s.editorialQna} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          {items.map((item, ii) => {
            const role = item?.role === 'answer' ? 'answer' : 'question';
            const text = typeof item?.text === 'string' ? item.text : '';
            const iconClass =
              role === 'answer'
                ? `${s.editorialQnaIcon} ${s.editorialQnaIconAnswer}`
                : s.editorialQnaIcon;
            return (
              <div key={ii} className={s.editorialQnaItem} data-role={role}>
                <span className={iconClass} aria-hidden="true">
                  {role === 'answer' ? <AnswerIcon /> : <QuestionIcon />}
                </span>
                <div>
                  <div className={s.editorialQnaLabel}>{role === 'answer' ? 'A' : 'Q'}</div>
                  <p className={s.editorialQnaText}>{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // codeBlock: language + code (Shiki 색상화는 PR-3 에서 추가; 여기서는 plain pre/code)
    if (blockType === 'codeBlock') {
      const language = typeof fields?.language === 'string' ? fields.language.trim() : '';
      const code = typeof fields?.code === 'string' ? fields.code : '';
      if (!code) return null;
      return (
        <div
          key={key}
          className={`${s.editorialCode} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          <div className={s.editorialCodeHead}>
            <span className={s.editorialCodeDots} aria-hidden="true">
              <span /><span /><span />
            </span>
            <span>{language || 'code'}</span>
          </div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // rawHtml: label + html (신뢰된 HTML 만 — admin description 에 XSS 경고 명시됨)
    if (blockType === 'rawHtml') {
      const label = typeof fields?.label === 'string' ? fields.label.trim() : '';
      const html = typeof fields?.html === 'string' ? fields.html : '';
      if (!html) return null;
      return (
        <div
          key={key}
          className={`${s.editorialRaw} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          {label && <div className={s.editorialRawLabel}>{label}</div>}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }

    // pricingCards: 가격 등급 카드 그리드 (Solution / Service 제품 페이지용)
    //   heading + intro + tiers[] (name, price, period, description, features[], highlight, badge, ctaLabel?, ctaUrl?)
    //   v1: CTA per tier omit (schema 보존, 렌더 X), highlight border + badge, ✓ checkmark features, mobile vertical stack.
    if (blockType === 'pricingCards') {
      type PricingFeature = { text?: unknown };
      type PricingTier = {
        name?: unknown;
        price?: unknown;
        period?: unknown;
        description?: unknown;
        features?: PricingFeature[];
        highlight?: unknown;
        badge?: unknown;
      };
      const heading = typeof fields?.heading === 'string' ? fields.heading.trim() : '';
      const intro = typeof fields?.intro === 'string' ? fields.intro.trim() : '';
      const tiersRaw = Array.isArray(fields?.tiers) ? (fields.tiers as PricingTier[]) : [];
      const tiers = tiersRaw.filter((t) => typeof t?.name === 'string' && typeof t?.price === 'string');
      if (!tiers.length) return null;
      return (
        <div
          key={key}
          className={`${s.pricingCards} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          {heading && <h3 className={s.pricingCardsHeading}>{heading}</h3>}
          {intro && <p className={s.pricingCardsIntro}>{intro}</p>}
          <div className={s.pricingCardsGrid} data-count={String(tiers.length)}>
            {tiers.map((tier, ti) => {
              const isHighlight = Boolean(tier.highlight);
              const badge = typeof tier.badge === 'string' ? tier.badge.trim() : '';
              const description = typeof tier.description === 'string' ? tier.description.trim() : '';
              const period = typeof tier.period === 'string' ? tier.period.trim() : '';
              const features = Array.isArray(tier.features)
                ? tier.features
                    .map((f) => (typeof f?.text === 'string' ? f.text.trim() : ''))
                    .filter((t) => t.length > 0)
                : [];
              return (
                <div
                  key={ti}
                  className={`${s.pricingCard} ${isHighlight ? s.pricingCardHighlight : ''}`}
                >
                  {isHighlight && badge && (
                    <span className={s.pricingCardBadge}>{badge}</span>
                  )}
                  <h4 className={s.pricingCardName}>{tier.name as string}</h4>
                  <div className={s.pricingCardPrice}>
                    <span className={s.pricingCardPriceValue}>{tier.price as string}</span>
                    {period && <span className={s.pricingCardPricePeriod}>{period}</span>}
                  </div>
                  {description && (
                    <p className={s.pricingCardDescription}>{description}</p>
                  )}
                  {features.length > 0 && (
                    <ul className={s.pricingCardFeatures}>
                      {features.map((f, fi) => (
                        <li key={fi} className={s.pricingCardFeature}>
                          <CheckIcon className={s.pricingCardFeatureCheck} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // featureCards: 기능 카드 그리드 ("What you get" / "How it works")
    //   heading + intro + columns (2/3/4) + cards[] (title, description, label?)
    if (blockType === 'featureCards') {
      type FeatureCard = { title?: unknown; description?: unknown; label?: unknown };
      const heading = typeof fields?.heading === 'string' ? fields.heading.trim() : '';
      const intro = typeof fields?.intro === 'string' ? fields.intro.trim() : '';
      const columnsRaw = typeof fields?.columns === 'string' ? fields.columns : '3';
      const cols = columnsRaw === '2' || columnsRaw === '4' ? columnsRaw : '3';
      const cardsRaw = Array.isArray(fields?.cards) ? (fields.cards as FeatureCard[]) : [];
      const cards = cardsRaw.filter(
        (c) => typeof c?.title === 'string' && typeof c?.description === 'string',
      );
      if (!cards.length) return null;
      return (
        <div
          key={key}
          className={`${s.featureCards} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          {heading && <h3 className={s.featureCardsHeading}>{heading}</h3>}
          {intro && <p className={s.featureCardsIntro}>{intro}</p>}
          <div className={s.featureCardsGrid} data-cols={cols}>
            {cards.map((card, ci) => {
              const label = typeof card.label === 'string' ? card.label.trim() : '';
              return (
                <div key={ci} className={s.featureCard}>
                  {label && <span className={s.featureCardLabel}>{label}</span>}
                  <h4 className={s.featureCardTitle}>{card.title as string}</h4>
                  <p className={s.featureCardDescription}>{card.description as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // videoEmbed: YouTube URL → youtube-nocookie embed (editorial-media 프레임 재사용)
    if (blockType === 'videoEmbed') {
      const url = typeof fields?.url === 'string' ? fields.url.trim() : '';
      const caption = typeof fields?.caption === 'string' ? fields.caption.trim() : '';
      const videoId = parseYouTubeId(url);
      if (!videoId) return null;
      const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}`;
      return (
        <div
          key={key}
          className={`${s.editorialMedia} ${s.editorialMediaCenter} ${revealClass}`}
          style={{ transitionDelay: delay }}
        >
          <figure>
            <div className={s.editorialMediaFrame}>
              <iframe
                src={embedSrc}
                title={caption || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {caption && (
              <figcaption className={s.editorialMediaCaption}>{caption}</figcaption>
            )}
          </figure>
        </div>
      );
    }

    return null;
  }

  // 알 수 없는 블록: children 이 있다면 텍스트로 fallback
  if (Array.isArray(node.children) && node.children.length > 0) {
    return (
      <p key={key} className={revealClass} style={{ transitionDelay: delay }}>
        {renderInlineChildren(node.children)}
      </p>
    );
  }
  return null;
}

function LexicalRenderer({ content }: { content: LexicalContent | null }) {
  if (!content || !content.root || !Array.isArray(content.root.children)) return null;

  return (
    <>
      {content.root.children.map((node, i) => {
        const delay = `${Math.min(i * 35, 210)}ms`;
        return renderBlockNode({
          node,
          index: i,
          revealClass: styles.reveal,
          delay,
          styles,
        });
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   YouTube URL → video ID 추출
   지원: youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>
   ═══════════════════════════════════════════════════════════════ */
function parseYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host.endsWith('.youtube.com')) {
      if (u.pathname === '/watch') {
        const v = u.searchParams.get('v');
        return v && /^[A-Za-z0-9_-]{6,}$/.test(v) ? v : null;
      }
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([A-Za-z0-9_-]{6,})/);
      if (m) return m[2];
    }
  } catch {
    // 잘못된 URL → null
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   Inline SVG Icons
   ═══════════════════════════════════════════════════════════════ */
function QuoteIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M19 14C13.4772 14 9 18.4772 9 24V34H21V24H15C15 21.7909 16.7909 20 19 20V14Z" fill="currentColor"/>
      <path d="M39 14C33.4772 14 29 18.4772 29 24V34H41V24H35C35 21.7909 36.7909 20 39 20V14Z" fill="currentColor"/>
    </svg>
  );
}

function QuestionIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.2c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 1.1-.7 1.7-1.4 2.2-.7.5-1.1.9-1.1 1.6V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

function AnswerIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 12.4l3 3 6-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M4 9.5l3.2 3.2L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reveal animation hook
   ═══════════════════════════════════════════════════════════════ */
// resetKey 는 soft navigation 으로 같은 라우트 안에서 다른 글로 이동했을 때
// 새 요소들을 다시 관찰하도록 effect 재실행을 트리거. 미지정 시 `.reveal`
// (opacity:0) 상태로 새 요소들이 남아 안 보이게 됨.
function useRevealObserver(
  containerRef: React.RefObject<HTMLElement | null>,
  resetKey: unknown,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = container.querySelectorAll(`.${styles.reveal}`);

    if (reduceMotion) {
      items.forEach((item) => item.classList.add(styles.revealVisible));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealVisible);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [containerRef, resetKey]);
}

/* ═══════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════ */
export default function PostDetail({
  basePath,
  locale,
  post,
  relatedPosts,
  hideAside = false,
}: PostDetailProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // post.title 을 resetKey 로 — 같은 라우트 segment 안에서 slug 만 바뀌어
  // 컴포넌트 인스턴스가 재사용될 때 reveal observer 가 새 요소들을 다시 관찰하도록.
  useRevealObserver(sectionRef, post.title);

  const hasHeroImage = Boolean(post.heroImageUrl);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={`${styles.shell} ${hideAside ? styles.shellFullWidth : ''}`}>
          {/* ── Main article ── */}
          <article className={`${styles.main} ${hideAside ? styles.mainFullWidth : ''}`}>
            <header className={`${styles.hero} ${styles.reveal}`}>
              {hasHeroImage && (
                <figure className={styles.heroMedia}>
                  <div className={styles.heroMediaFrame}>
                    <Image
                      src={post.heroImageUrl}
                      alt={post.heroImageAlt}
                      width={1200}
                      height={675}
                      priority
                      sizes="(max-width: 1079px) 100vw, 75vw"
                    />
                  </div>
                </figure>
              )}
              <h1 className={styles.heroTitle}>{post.title}</h1>
              {post.intro && <p className={styles.heroIntro}>{post.intro}</p>}
            </header>

            <div className={`${styles.editorial} ${hideAside ? styles.editorialNarrow : ''}`}>
              <LexicalRenderer content={post.content} />

              {post.references.length > 0 && (
                <section
                  className={`${styles.postReferences} ${styles.reveal}`}
                  aria-label={locale === 'ko' ? '참고 문서' : 'References'}
                >
                  <h2 className={styles.postReferencesHeading}>
                    {locale === 'ko' ? '참고 문서' : 'References'}
                  </h2>
                  <ul className={styles.postReferencesList}>
                    {post.references.map((ref, i) => {
                      const href = normalizeReferenceLink(ref.link);
                      const titleNode = ref.title ? (
                        <strong className={styles.postReferencesTitle}>{ref.title}</strong>
                      ) : null;
                      const contentNode = ref.content ? (
                        <span className={styles.postReferencesContent}>{ref.content}</span>
                      ) : null;

                      const inner = (
                        <>
                          {titleNode}
                          {titleNode && contentNode ? ' ' : null}
                          {contentNode}
                        </>
                      );

                      return (
                        <li key={i} className={styles.postReferencesItem}>
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.postReferencesLink}
                            >
                              {titleNode || contentNode ? inner : href}
                            </a>
                          ) : (
                            inner
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {post.tags.length > 0 && (
                <section className={`${styles.postTags} ${styles.reveal}`} aria-label="Post tags">
                  <ul className={styles.postTagsList}>
                    {post.tags.map((tag) => (
                      <li key={tag.label} className={styles.postTagsItem}>
                        <Link href={tag.href}>{tag.label}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </article>

          {/* ── Aside: related posts (Solution / Service 카테고리는 hideAside=true 로 skip) ── */}
          {!hideAside && (
          <aside className={styles.aside}>
            <div className={`${styles.asideInner} ${styles.reveal}`}>
              {relatedPosts.length > 0 ? (
                <ul className={styles.relatedList}>
                  {relatedPosts.map((rp) => (
                    <li key={rp.slug} className={styles.relatedItem}>
                      <Link href={`${basePath}/${rp.slug}`} className={styles.relatedLink}>
                        <span className={styles.relatedThumb}>
                          {rp.thumbnailUrl ? (
                            <Image
                              src={rp.thumbnailUrl}
                              alt={rp.thumbnailAlt}
                              width={540}
                              height={398}
                              sizes="(max-width: 1079px) 100vw, 25vw"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              style={{ display: 'block', width: '100%', height: '100%', background: 'var(--iropke-color-border, #eee)' }}
                            />
                          )}
                        </span>
                        <h3 className={styles.relatedPostTitle}>{rp.title}</h3>
                        {rp.date && (
                          <time className={styles.relatedDate} dateTime={rp.dateISO}>
                            {rp.date}
                          </time>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ padding: '24px 0', opacity: 0.7 }}>
                  {locale === 'ko' ? '관련 글이 아직 없습니다.' : 'No related posts yet.'}
                </p>
              )}

              <div className={styles.relatedMore}>
                <Link href={basePath}>
                  {locale === 'ko' ? '더 보기 →' : 'View more →'}
                </Link>
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>
    </section>
  );
}

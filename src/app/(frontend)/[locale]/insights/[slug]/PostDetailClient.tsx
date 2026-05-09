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
}

interface PostDetailClientProps {
  locale: string;
  post: PostDetailData;
  relatedPosts: RelatedPostData[];
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
              <div key={ii} className={s.editorialQnaItem}>
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

/* ═══════════════════════════════════════════════════════════════
   Reveal animation hook
   ═══════════════════════════════════════════════════════════════ */
function useRevealObserver(containerRef: React.RefObject<HTMLElement | null>) {
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
  }, [containerRef]);
}

/* ═══════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════ */
export default function PostDetailClient({
  locale,
  post,
  relatedPosts,
}: PostDetailClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealObserver(sectionRef);

  const hasHeroImage = Boolean(post.heroImageUrl);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.shell}>
          {/* ── Main article ── */}
          <article className={styles.main}>
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

            <div className={styles.editorial}>
              <LexicalRenderer content={post.content} />

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

          {/* ── Aside: related posts ── */}
          <aside className={styles.aside}>
            <div className={`${styles.asideInner} ${styles.reveal}`}>
              {relatedPosts.length > 0 ? (
                <ul className={styles.relatedList}>
                  {relatedPosts.map((rp) => (
                    <li key={rp.slug} className={styles.relatedItem}>
                      <Link href={`/${locale}/insights/${rp.slug}`} className={styles.relatedLink}>
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
                <Link href={`/${locale}/insights`}>
                  {locale === 'ko' ? '더 보기 →' : 'View more →'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

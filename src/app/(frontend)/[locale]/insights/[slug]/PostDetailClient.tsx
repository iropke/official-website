'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PostDetail.module.css';

/* ═══════════════════════════════════════════════════════════════
   Public types
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
  /** blockId → Shiki pre-rendered HTML (server에서 주입) */
  highlightedCode?: Record<string, string>;
}

interface PostDetailClientProps {
  locale: string;
  post: PostDetailData;
  relatedPosts: RelatedPostData[];
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
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5C14.5 11 12 11.5 12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="0.75" fill="currentColor"/>
    </svg>
  );
}

function AnswerIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Text / inline renderers
   ═══════════════════════════════════════════════════════════════ */
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
    return <React.Fragment key={i}>{renderInlineChildren(child.children)}</React.Fragment>;
  });
}

/* ═══════════════════════════════════════════════════════════════
   Block renderer
   ═══════════════════════════════════════════════════════════════ */
interface RenderBlockArgs {
  node: LexicalNode;
  index: number;
  revealClass: string;
  delay: string;
  styles: { [k: string]: string };
  highlightedCode?: Record<string, string>;
}

function renderBlockNode({
  node,
  index,
  revealClass,
  delay,
  styles: s,
  highlightedCode,
}: RenderBlockArgs): React.ReactNode {
  const t = node.type;
  const key = index;

  /* ── Lexical 기본 블록 ── */
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
      <div key={key} className={`${s.editorialMedia} ${revealClass}`} style={{ transitionDelay: delay }}>
        <figure>
          <div className={s.editorialMediaFrame}>
            <Image src={url} alt={alt} width={width} height={height} sizes="(max-width: 1079px) 100vw, 75vw" />
          </div>
        </figure>
      </div>
    );
  }

  /* ── BlocksFeature 커스텀 블록 ── */
  if (t === 'block') {
    const fields = (node as { fields?: Record<string, unknown> }).fields ?? {};
    const blockType = fields.blockType as string | undefined;
    const blockId = fields.id as string | undefined;

    /* editorialMedia — 이미지 + 캡션 */
    if (blockType === 'editorialMedia') {
      const imageField = (fields.image as { url?: string; alt?: string; width?: number; height?: number } | null | undefined);
      const url = imageField?.url;
      if (!url) return null;

      const alt = (fields.alt as string | undefined) || imageField?.alt || '';
      const caption = fields.caption as string | undefined;
      const alignment = (fields.alignment as string) || 'center';
      const width = imageField?.width ?? 1200;
      const height = imageField?.height ?? 675;

      const alignClass =
        alignment === 'wide' ? s.editorialMediaWide
        : alignment === 'full' ? s.editorialMediaFull
        : s.editorialMediaCenter;

      return (
        <div key={key} className={`${s.editorialMedia} ${alignClass ?? ''} ${revealClass}`} style={{ transitionDelay: delay }}>
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
            {caption && <figcaption className={s.editorialMediaCaption}>{caption}</figcaption>}
          </figure>
        </div>
      );
    }

    /* editorialTable — 표 (TSV 파싱) */
    if (blockType === 'editorialTable') {
      const caption = fields.caption as string | undefined;
      const data = (fields.data as string | undefined) ?? '';
      const lines = data.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);
      if (!lines.length) return null;

      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split('\t');
      const rows = dataLines.map(l => l.split('\t'));

      return (
        <div key={key} className={`${s.editorialTable} ${revealClass}`} style={{ transitionDelay: delay }}>
          <div className={s.editorialTableWrap}>
            <table aria-label={caption || undefined}>
              <thead>
                <tr>
                  {headers.map((h, i) => <th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.editorialTableSwipeHint}>← swipe →</p>
        </div>
      );
    }

    /* videoEmbed — YouTube 임베드 */
    if (blockType === 'videoEmbed') {
      const url = fields.url as string | undefined;
      const caption = fields.caption as string | undefined;
      if (!url) return null;

      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&\n]+)/);
      if (!ytMatch) return null;
      const embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;

      return (
        <div key={key} className={`${s.editorialMedia} ${revealClass}`} style={{ transitionDelay: delay }}>
          <figure>
            <div className={s.editorialMediaFrame}>
              <iframe
                src={embedUrl}
                title={caption || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {caption && <figcaption className={s.editorialMediaCaption}>{caption}</figcaption>}
          </figure>
        </div>
      );
    }

    /* rawHtml — Raw HTML 삽입 */
    if (blockType === 'rawHtml') {
      const label = fields.label as string | undefined;
      const html = fields.html as string | undefined;
      if (!html) return null;

      return (
        <div key={key} className={`${s.editorialRaw} ${revealClass}`} style={{ transitionDelay: delay }}>
          {label && <p className={s.editorialRawLabel}>{label}</p>}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }

    /* codeBlock — Shiki 구문 강조 */
    if (blockType === 'codeBlock') {
      const language = fields.language as string | undefined;
      const code = fields.code as string | undefined;
      const preRendered = blockId ? highlightedCode?.[blockId] : undefined;

      return (
        <div key={key} className={`${s.editorialCode} ${revealClass}`} style={{ transitionDelay: delay }}>
          <div className={s.editorialCodeHead}>
            <span className={s.editorialCodeDots}>
              <span /><span /><span />
            </span>
            {language && <span>{language}</span>}
          </div>
          {preRendered
            ? <div dangerouslySetInnerHTML={{ __html: preRendered }} />
            : <pre><code>{code}</code></pre>
          }
        </div>
      );
    }

    /* qnaList — Q&A 리스트 */
    if (blockType === 'qnaList') {
      type QnaItem = { id?: string; role?: string; text?: string };
      const items = (fields.items as QnaItem[] | undefined) ?? [];
      if (!items.length) return null;

      return (
        <div key={key} className={`${s.editorialQna} ${revealClass}`} style={{ transitionDelay: delay }}>
          {items.map((item, i) => (
            <div key={item.id ?? i} className={s.editorialQnaItem}>
              <span className={`${s.editorialQnaIcon} ${item.role === 'answer' ? s.editorialQnaIconAnswer : ''}`}>
                {item.role === 'answer' ? <AnswerIcon width={28} height={28} /> : <QuestionIcon width={28} height={28} />}
              </span>
              <div>
                <p className={s.editorialQnaLabel}>
                  {item.role === 'answer' ? 'Answer' : 'Question'}
                </p>
                <p className={s.editorialQnaText}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  /* 알 수 없는 블록 — children 텍스트로 fallback */
  if (Array.isArray(node.children) && node.children.length > 0) {
    return (
      <p key={key} className={revealClass} style={{ transitionDelay: delay }}>
        {renderInlineChildren(node.children)}
      </p>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   LexicalRenderer
   ═══════════════════════════════════════════════════════════════ */
function LexicalRenderer({
  content,
  highlightedCode,
}: {
  content: LexicalContent | null;
  highlightedCode?: Record<string, string>;
}) {
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
          highlightedCode,
        });
      })}
    </>
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
              <LexicalRenderer content={post.content} highlightedCode={post.highlightedCode} />

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

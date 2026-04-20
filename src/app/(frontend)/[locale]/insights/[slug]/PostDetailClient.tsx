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

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PostDetail.module.css';

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface RelatedPost {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

interface Tag {
  label: string;
  href: string;
}

/* TODO: Replace with Payload CMS rich-text / Lexical block types */
type EditorialBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'orderedList'; items: string[] }
  | { type: 'unorderedList'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; title: string; caption?: string }
  | { type: 'delimiter' }
  | { type: 'verticalPad' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'rawHtml'; label: string; html: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'qna'; question: string; answer: string };

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

function QnaQuestionIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 18H12.01M9.09 9A3 3 0 1 1 14.83 10.17C14 11 13 11.5 12.5 12.5C12.27 12.96 12.15 13.46 12.09 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1117 3.04346 16.4527L2 22L7.54729 20.9565C8.8883 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function QnaAnswerIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Editorial Block Renderer
   ═══════════════════════════════════════════════════════════════ */
function EditorialBlockRenderer({ block, index }: { block: EditorialBlock; index: number }) {
  const delay = `${Math.min(index * 35, 210)}ms`;

  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
      return <Tag className={styles.reveal} style={{ transitionDelay: delay }}>{block.text}</Tag>;
    }
    case 'paragraph':
      return <p className={styles.reveal} style={{ transitionDelay: delay }}>{block.text}</p>;
    case 'orderedList':
      return (
        <ol className={styles.reveal} style={{ transitionDelay: delay }}>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      );
    case 'unorderedList':
      return (
        <ul className={styles.reveal} style={{ transitionDelay: delay }}>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    case 'image':
      return (
        <div className={`${styles.editorialMedia} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <figure>
            <div className={styles.editorialMediaFrame}>
              <Image src={block.src} alt={block.alt} width={1200} height={675} sizes="(max-width: 1079px) 100vw, 75vw" />
            </div>
            {block.caption && <figcaption className={styles.editorialMediaCaption}>{block.caption}</figcaption>}
          </figure>
        </div>
      );
    case 'video':
      return (
        <div className={`${styles.editorialMedia} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <figure>
            <div className={styles.editorialMediaFrame}>
              <iframe
                src={block.src}
                title={block.title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {block.caption && <figcaption className={styles.editorialMediaCaption}>{block.caption}</figcaption>}
          </figure>
        </div>
      );
    case 'delimiter':
      return (
        <div className={`${styles.editorialDelimiter} ${styles.reveal}`} style={{ transitionDelay: delay }} aria-hidden="true">
          <span className={styles.editorialDelimiterMark}>&#10022;</span>
        </div>
      );
    case 'verticalPad':
      return <div className={styles.verticalPad} aria-hidden="true" />;
    case 'table':
      return (
        <div className={`${styles.editorialTable} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <div className={styles.editorialTableWrap} aria-label="Responsive comparison table">
            <table>
              <thead>
                <tr>
                  {block.headers.map((h, i) => <th key={i} scope="col">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.editorialTableSwipeHint}>Swipe to view more &rarr;</div>
        </div>
      );
    case 'quote':
      return (
        <div className={`${styles.editorialQuote} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <QuoteIcon className={styles.editorialQuoteIcon} />
          <blockquote>
            <p>{block.text}</p>
            {block.cite && <cite>{block.cite}</cite>}
          </blockquote>
        </div>
      );
    case 'rawHtml':
      return (
        <div className={`${styles.editorialRaw} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <div className={styles.editorialRawLabel}>{block.label}</div>
          <div className={styles.sampleEmbed} dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case 'code':
      return (
        <div className={`${styles.editorialCode} ${styles.reveal}`} style={{ transitionDelay: delay }} aria-label="Code example viewer">
          <div className={styles.editorialCodeHead}>
            <span>{block.language}</span>
            <span className={styles.editorialCodeDots} aria-hidden="true">
              <span /><span /><span />
            </span>
          </div>
          <pre><code>{block.code}</code></pre>
        </div>
      );
    case 'qna':
      return (
        <div className={`${styles.editorialQna} ${styles.reveal}`} style={{ transitionDelay: delay }}>
          <div className={styles.editorialQnaItem}>
            <div className={styles.editorialQnaIcon} aria-hidden="true">
              <QnaQuestionIcon />
            </div>
            <div>
              <div className={styles.editorialQnaLabel}>Question</div>
              <p className={styles.editorialQnaText}>{block.question}</p>
            </div>
          </div>
          <div className={styles.editorialQnaItem}>
            <div className={`${styles.editorialQnaIcon} ${styles.editorialQnaIconAnswer}`} aria-hidden="true">
              <QnaAnswerIcon />
            </div>
            <div>
              <div className={styles.editorialQnaLabel}>Answer</div>
              <p className={styles.editorialQnaText}>{block.answer}</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
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
/* TODO: Replace with Payload CMS data fetching via `payload.findByID({ collection: 'posts', id })` */
interface PostDetailClientProps {
  locale: string;
  slug: string;
}

export default function PostDetailClient({ locale, slug }: PostDetailClientProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useRevealObserver(sectionRef);

  /* ── Placeholder data — will be replaced by Payload CMS query ── */
  const post = {
    title: 'The structure beneath the surface is now the part that matters most.',
    intro:
      'The web no longer lives only in browsers. It is also interpreted, retrieved, summarized, and reassembled by systems that do not care how dramatic a hero banner looked on launch day. What survives is structure.',
    heroImage: 'https://placehold.co/1200x675',
    heroAlt: 'Editorial hero image',
  };

  const blocks: EditorialBlock[] = [
    { type: 'heading', level: 1, text: 'H1. Editorial systems are becoming architectural systems' },
    { type: 'paragraph', text: 'A post page used to be a quiet room for reading. Now it is also a structured object inside a much larger ecosystem of indexing, retrieval, summarization, and internal reuse. That shift changes the job of design.' },
    { type: 'paragraph', text: 'In other words, aesthetics still matter, but they are no longer the whole performance. The stage lights are lovely. The beams holding the building up have become more important.' },
    { type: 'delimiter' },
    { type: 'heading', level: 2, text: 'H2. A page should explain itself to both readers and systems' },
    { type: 'paragraph', text: 'This is where editorial design becomes strategic. Headings must form a clean hierarchy. Tables should remain usable on smaller screens.' },
    { type: 'heading', level: 3, text: 'H3. Ordered thinking still deserves ordered lists' },
    {
      type: 'orderedList',
      items: [
        'Define the role of the page before polishing the surface.',
        'Preserve semantic structure so the document can be interpreted cleanly.',
        'Design for scanning first, then for delight, then for ornament.',
      ],
    },
    { type: 'heading', level: 4, text: 'H4. Unordered lists are useful when sequence is not the story' },
    {
      type: 'unorderedList',
      items: ['Clear heading rhythm', 'Readable body text', 'Stable media treatment', 'Consistent supporting metadata'],
    },
    {
      type: 'image',
      src: 'https://placehold.co/1200x675',
      alt: 'Editorial placeholder image showing a restrained workspace composition',
      caption: 'Image example. Editorial media should feel calm, spacious, and informative rather than decorative for its own sake.',
    },
    { type: 'heading', level: 5, text: 'H5. Tables should stay useful even when the screen gets narrow' },
    { type: 'paragraph', text: 'On mobile, the first column should remain visible while the rest of the table can be explored horizontally.' },
    {
      type: 'table',
      headers: ['Layer', 'Primary role', 'Risk when absent', 'Editorial implication'],
      rows: [
        ['Heading hierarchy', 'Creates semantic order', 'Ambiguous structure', 'Weak scannability and poor retrieval context'],
        ['Media captions', 'Add interpretive context', 'Floating visual without meaning', 'Images become decorative noise'],
        ['Code presentation', 'Separates example from prose', 'Reader confusion', 'Technical trust starts to wobble'],
        ['Q&A formatting', 'Clarifies dialogue structure', 'Dense informational block', 'Answers become harder to retrieve and skim'],
      ],
    },
    { type: 'verticalPad' },
    { type: 'delimiter' },
    { type: 'heading', level: 6, text: 'H6. Small heading, quiet voice, precise purpose' },
    { type: 'paragraph', text: 'Not every section needs a trumpet. Some need a tuning fork.' },
    {
      type: 'video',
      src: 'https://www.youtube-nocookie.com/embed/zJgUmcUbLtM?rel=0&modestbranding=1&playsinline=1',
      title: 'Sample editorial video embed',
      caption: 'Video example. A YouTube embed can be placed in the same editorial rhythm as images, with a caption below.',
    },
    {
      type: 'quote',
      text: 'A good editorial page does not merely display content. It arranges meaning with enough discipline that the page remains coherent even when its parts are extracted, quoted, resized, or reinterpreted elsewhere.',
      cite: 'Internal editorial note',
    },
    { type: 'heading', level: 2, text: 'Raw HTML should remain visually separated' },
    { type: 'paragraph', text: 'Raw HTML does not need its own decorative costume, but it should not visually melt into surrounding prose.' },
    {
      type: 'rawHtml',
      label: 'Raw HTML Example',
      html: '<div><strong>Inline custom HTML output</strong><br /><span>This block is rendered directly as HTML inserted by the editor.</span></div>',
    },
    { type: 'heading', level: 2, text: 'Code examples need a frame, not a shrug' },
    {
      type: 'code',
      language: 'HTML Snippet',
      code: `<figure class="editorial-media">\n  <img src="/path/image.jpg" alt="Descriptive alt text" />\n  <figcaption>A short explanatory caption.</figcaption>\n</figure>`,
    },
    { type: 'heading', level: 2, text: 'Q&A content works best when question and answer have visual roles' },
    {
      type: 'qna',
      question: 'Does editorial polish still matter when AI systems are reading the page?',
      answer: 'Absolutely. The visual layer shapes trust, pace, and comprehension for human readers. The structural layer supports machine interpretation. The best pages do not choose one audience and betray the other.',
    },
  ];

  const tags: Tag[] = [
    { label: 'Editorial Design', href: '#' },
    { label: 'Content Systems', href: '#' },
    { label: 'AI Visibility', href: '#' },
    { label: 'Information Architecture', href: '#' },
    { label: 'Web Strategy', href: '#' },
  ];

  const relatedPosts: RelatedPost[] = [
    { slug: 'post-1', title: 'Why structured websites matter more in the age of AI answers', date: 'Apr 06, 2026', dateISO: '2026-04-06', thumbnailUrl: 'https://placehold.co/540x398', thumbnailAlt: 'Related post thumbnail' },
    { slug: 'post-2', title: 'Building scalable content systems without drowning in manual work', date: 'Apr 04, 2026', dateISO: '2026-04-04', thumbnailUrl: 'https://placehold.co/540x398', thumbnailAlt: 'Related post thumbnail' },
    { slug: 'post-3', title: 'A calm website can outperform a loud one', date: 'Mar 31, 2026', dateISO: '2026-03-31', thumbnailUrl: 'https://placehold.co/540x398', thumbnailAlt: 'Related post thumbnail' },
    { slug: 'post-4', title: 'When SEO improvements fail to improve AI visibility', date: 'Mar 20, 2026', dateISO: '2026-03-20', thumbnailUrl: 'https://placehold.co/540x398', thumbnailAlt: 'Related post thumbnail' },
    { slug: 'post-5', title: 'Readable for humans, retrievable for machines', date: 'Feb 27, 2026', dateISO: '2026-02-27', thumbnailUrl: 'https://placehold.co/540x398', thumbnailAlt: 'Related post thumbnail' },
  ];

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.shell}>
          {/* ── Main article ── */}
          <article className={styles.main}>
            <header className={`${styles.hero} ${styles.reveal}`}>
              <figure className={styles.heroMedia}>
                <div className={styles.heroMediaFrame}>
                  <Image
                    src={post.heroImage}
                    alt={post.heroAlt}
                    width={1200}
                    height={675}
                    priority
                    sizes="(max-width: 1079px) 100vw, 75vw"
                  />
                </div>
              </figure>
              <h1 className={styles.heroTitle}>{post.title}</h1>
              <p className={styles.heroIntro}>{post.intro}</p>
            </header>

            <div className={styles.editorial}>
              {blocks.map((block, i) => (
                <EditorialBlockRenderer key={i} block={block} index={i} />
              ))}

              <section className={`${styles.postTags} ${styles.reveal}`} aria-label="Post tags">
                <ul className={styles.postTagsList}>
                  {tags.map((tag) => (
                    <li key={tag.label} className={styles.postTagsItem}>
                      <Link href={tag.href}>{tag.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </article>

          {/* ── Aside: related posts ── */}
          <aside className={styles.aside}>
            <div className={`${styles.asideInner} ${styles.reveal}`}>
              <ul className={styles.relatedList}>
                {relatedPosts.map((rp) => (
                  <li key={rp.slug} className={styles.relatedItem}>
                    <Link href={`/${locale}/insights/${rp.slug}`} className={styles.relatedLink}>
                      <span className={styles.relatedThumb}>
                        <Image src={rp.thumbnailUrl} alt={rp.thumbnailAlt} width={540} height={398} sizes="(max-width: 1079px) 100vw, 25vw" />
                      </span>
                      <h3 className={styles.relatedPostTitle}>{rp.title}</h3>
                      <time className={styles.relatedDate} dateTime={rp.dateISO}>{rp.date}</time>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className={styles.relatedMore}>
                <Link href={`/${locale}/insights`}>View more &rarr;</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

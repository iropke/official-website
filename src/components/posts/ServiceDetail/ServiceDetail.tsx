'use client';

/**
 * ServiceDetail — bespoke detail renderer for Posts with category='service'.
 *
 * Why a separate component (not a category branch inside PostDetail):
 *   Service detail pages are landing-page-shaped (hero peak / featured rows /
 *   colored peak section for process / dark case-study band / CTA banner) with
 *   markedly different visual hierarchy from Insight/Story/Portfolio articles.
 *   Keeping a parallel component lets us iterate on service layout without
 *   regression risk to 51+ Insight posts and Story/Portfolio detail pages that
 *   already ship via PostDetail.
 *
 * Block grouping:
 *   The Lexical content is grouped by H2 boundaries. Each group becomes one
 *   <section> with a background derived from the dominant content block:
 *     featureCards(layout=alternating) → tinted "featuresAlt"
 *     featureCards(layout=grid)        → tinted "featuresGrid"
 *     processFlow                       → full-bleed primary peak
 *     editorialTable                    → tinted "table"
 *     qnaList                           → white, accordion-rendered FAQ
 *     prose only                        → white
 *
 *   For featuresAlt sections the section's H2 text is *not* rendered as a big
 *   heading — instead it becomes a small per-row label above each card title
 *   (matches the Figma reference where "What We Build" repeats per row).
 *
 * Case Study & CTA sections are static (not from Lexical content):
 *   caseStudies prop → rendered if non-empty (server query fills it by tag)
 *   CTA banner       → always rendered, links to /<locale>/project-inquiry
 */

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ServiceDetail.module.css';

// ─── Public types (server passes these from page.tsx) ───────────────
export interface TagData { label: string; href: string; }
export interface ReferenceData { title: string; content: string; link: string; }
export interface RelatedPostData {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

export interface LexicalContent {
  root: { children?: LexicalNode[]; [k: string]: unknown };
  [k: string]: unknown;
}
interface LexicalNode {
  type?: string;
  children?: LexicalNode[];
  [k: string]: unknown;
}

export interface ServiceDetailData {
  title: string;
  intro: string;
  heroImageUrl: string;
  heroImageAlt: string;
  content: LexicalContent | null;
  tags: TagData[];
  references: ReferenceData[];
}

interface ServiceDetailProps {
  basePath: string;
  locale: string;
  post: ServiceDetailData;
  /** Hub label derived from cluster slug (e.g. 'web-development' → 'Web Development'). */
  hubLabel?: string;
  /** Portfolio Posts to render in the Case Study section. Empty → section hidden. */
  caseStudies?: RelatedPostData[];
}

// ─── Inline rendering (Lexical text / links) ─────────────────────────
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;

function renderTextNode(node: LexicalNode, key: number): React.ReactNode {
  const text = typeof node.text === 'string' ? node.text : '';
  const format = typeof node.format === 'number' ? node.format : 0;
  let el: React.ReactNode = text;
  if (format & FORMAT_CODE) el = <code key={`c${key}`}>{el}</code>;
  if (format & FORMAT_BOLD) el = <strong key={`b${key}`}>{el}</strong>;
  if (format & FORMAT_ITALIC) el = <em key={`i${key}`}>{el}</em>;
  if (format & FORMAT_UNDERLINE) el = <u key={`u${key}`}>{el}</u>;
  if (format & FORMAT_STRIKETHROUGH) el = <s key={`s${key}`}>{el}</s>;
  return <React.Fragment key={key}>{el}</React.Fragment>;
}

function renderInline(children: LexicalNode[] | undefined): React.ReactNode {
  if (!children?.length) return null;
  return children.map((c, i) => {
    if (c.type === 'text') return renderTextNode(c, i);
    if (c.type === 'linebreak') return <br key={i} />;
    if (c.type === 'link') {
      const fields = (c as { fields?: { url?: string; newTab?: boolean } }).fields;
      const url = fields?.url ?? '#';
      const newTab = Boolean(fields?.newTab);
      return (
        <a
          key={i}
          href={url}
          className={styles.editorialLink}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {renderInline(c.children)}
        </a>
      );
    }
    return <React.Fragment key={i}>{renderInline(c.children)}</React.Fragment>;
  });
}

function flattenText(children: LexicalNode[] | undefined): string {
  if (!children?.length) return '';
  let s = '';
  for (const c of children) {
    if (c.type === 'text' && typeof c.text === 'string') s += c.text;
    else if (Array.isArray(c.children)) s += flattenText(c.children);
  }
  return s;
}

// ─── Block grouping (H2 starts a new section) ────────────────────────
type SectionStyle =
  | 'prose'
  | 'featuresAlt'
  | 'featuresGrid'
  | 'process'
  | 'table'
  | 'faq';

interface Group {
  heading: LexicalNode | null;
  blocks: LexicalNode[];
  style: SectionStyle;
}

function isH2(n: LexicalNode): boolean {
  const tag = (n as { tag?: string }).tag;
  return n.type === 'heading' && (tag === 'h2' || !tag);
}

function determineStyle(blocks: LexicalNode[]): SectionStyle {
  for (const b of blocks) {
    if (b.type === 'block') {
      const fields = (b as { fields?: { blockType?: string; layout?: string } }).fields;
      const bt = fields?.blockType;
      if (bt === 'featureCards') {
        return fields?.layout === 'alternating' ? 'featuresAlt' : 'featuresGrid';
      }
      if (bt === 'processFlow') return 'process';
      if (bt === 'editorialTable') return 'table';
      if (bt === 'qnaList') return 'faq';
    }
  }
  return 'prose';
}

function groupBlocks(content: LexicalContent | null): Group[] {
  if (!content?.root?.children) return [];
  const blocks = content.root.children;
  const groups: Group[] = [];
  let cur: { heading: LexicalNode | null; blocks: LexicalNode[] } = {
    heading: null,
    blocks: [],
  };
  const flush = () => {
    if (cur.heading || cur.blocks.length) {
      groups.push({ heading: cur.heading, blocks: cur.blocks, style: determineStyle(cur.blocks) });
    }
  };
  for (const b of blocks) {
    if (isH2(b)) {
      flush();
      cur = { heading: b, blocks: [] };
    } else {
      cur.blocks.push(b);
    }
  }
  flush();
  return groups;
}

// ─── FAQ Accordion (paired Q/A via <details>/<summary>) ────────────
function FaqAccordion({ items }: { items: Array<{ role: 'question' | 'answer'; text: string }> }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.role === 'question') {
      const next = items[i + 1];
      if (next?.role === 'answer') {
        pairs.push({ q: it.text, a: next.text });
        i++;
      } else {
        pairs.push({ q: it.text, a: '' });
      }
    }
  }
  if (!pairs.length) return null;
  return (
    <div className={styles.faqList}>
      {pairs.map((p, i) => (
        <details key={i} className={styles.faqItem}>
          <summary className={styles.faqQuestion}>
            <span className={styles.faqQuestionText}>{p.q}</span>
            <span className={styles.faqChevron} aria-hidden="true" />
          </summary>
          {p.a && <div className={styles.faqAnswer}>{p.a}</div>}
        </details>
      ))}
    </div>
  );
}

// ─── Feature row (alternating layout) ──────────────────────────────
interface FeatureCardShape {
  title: string;
  description: string;
  label?: string;
  imageUrl?: string;
  bullets?: Array<{ text: string }>;
}
function FeatureRow({
  card,
  reverse,
  rowLabel,
}: {
  card: FeatureCardShape;
  reverse: boolean;
  rowLabel?: string | null;
}) {
  const hasImage = Boolean(card.imageUrl);
  return (
    <div className={`${styles.featureRow} ${reverse ? styles.featureRowReverse : ''} ${styles.reveal}`}>
      <div className={styles.featureRowText}>
        {rowLabel && <p className={styles.featureRowLabel}>{rowLabel}</p>}
        <h3 className={styles.featureRowTitle}>{card.title}</h3>
        <p className={styles.featureRowDescription}>{card.description}</p>
        {card.bullets && card.bullets.length > 0 && (
          <ul className={styles.featureRowBullets}>
            {card.bullets.map((b, bi) => (
              <li key={bi}>{b.text}</li>
            ))}
          </ul>
        )}
      </div>
      {hasImage && (
        <div className={styles.featureRowImage}>
          <Image
            src={card.imageUrl as string}
            alt=""
            width={1200}
            height={900}
            sizes="(max-width: 1079px) 100vw, 48vw"
            className={styles.featureRowImg}
          />
        </div>
      )}
    </div>
  );
}

// ─── Per-block renderer ───────────────────────────────────────────
interface RenderCtx {
  rowLabel: string | null;
  revealClass: string;
  delay: string;
}

function renderBlock(node: LexicalNode, index: number, ctx: RenderCtx): React.ReactNode {
  const t = node.type;
  const key = `b${index}`;

  if (t === 'heading') {
    const rawTag = typeof (node as { tag?: string }).tag === 'string' ? (node as { tag: string }).tag : 'h3';
    const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rawTag) ? rawTag : 'h3') as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6';
    return (
      <Tag key={key} className={`${styles.heading} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
        {renderInline(node.children)}
      </Tag>
    );
  }

  if (t === 'paragraph') {
    return (
      <p key={key} className={`${styles.paragraph} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
        {renderInline(node.children)}
      </p>
    );
  }

  if (t === 'list') {
    const isOl =
      (node as { listType?: string }).listType === 'number' ||
      (node as { tag?: string }).tag === 'ol';
    const ListTag = (isOl ? 'ol' : 'ul') as 'ol' | 'ul';
    return (
      <ListTag key={key} className={`${styles.list} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
        {(node.children ?? []).map((li, i) =>
          li.type === 'listitem' ? <li key={i}>{renderInline(li.children)}</li> : null,
        )}
      </ListTag>
    );
  }

  if (t === 'quote') {
    return (
      <blockquote
        key={key}
        className={`${styles.quote} ${ctx.revealClass}`}
        style={{ transitionDelay: ctx.delay }}
      >
        {renderInline(node.children)}
      </blockquote>
    );
  }

  if (t === 'horizontalrule') {
    return (
      <hr
        key={key}
        className={`${styles.hr} ${ctx.revealClass}`}
        style={{ transitionDelay: ctx.delay }}
        aria-hidden="true"
      />
    );
  }

  if (t === 'block') {
    const fields = (node as { fields?: Record<string, unknown> }).fields;
    const blockType = typeof fields?.blockType === 'string' ? (fields.blockType as string) : '';

    if (blockType === 'featureCards') {
      const heading = typeof fields?.heading === 'string' ? (fields.heading as string).trim() : '';
      const intro = typeof fields?.intro === 'string' ? (fields.intro as string).trim() : '';
      const layout = typeof fields?.layout === 'string' ? (fields.layout as string) : 'grid';
      const cardsRaw = Array.isArray(fields?.cards) ? (fields.cards as FeatureCardShape[]) : [];
      const cards = cardsRaw.filter(
        (c) => typeof c?.title === 'string' && typeof c?.description === 'string',
      );
      if (!cards.length) return null;

      if (layout === 'alternating') {
        return (
          <div key={key} className={styles.featuresAlt}>
            {heading && (
              <h3 className={`${styles.featuresAltHeading} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
                {heading}
              </h3>
            )}
            {intro && (
              <p className={`${styles.featuresAltIntro} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
                {intro}
              </p>
            )}
            <div className={styles.featuresAltList}>
              {cards.map((card, i) => (
                <FeatureRow key={i} card={card} reverse={i % 2 === 1} rowLabel={ctx.rowLabel} />
              ))}
            </div>
          </div>
        );
      }

      // grid (default)
      const columnsRaw = typeof fields?.columns === 'string' ? (fields.columns as string) : '3';
      const cols = columnsRaw === '2' || columnsRaw === '4' ? columnsRaw : '3';
      return (
        <div key={key} className={`${styles.featureCards} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
          {heading && <h3 className={styles.featureCardsHeading}>{heading}</h3>}
          {intro && <p className={styles.featureCardsIntro}>{intro}</p>}
          <div className={styles.featureCardsGrid} data-cols={cols}>
            {cards.map((card, i) => (
              <div key={i} className={styles.featureCard}>
                {card.label && <span className={styles.featureCardLabel}>{card.label}</span>}
                <h4 className={styles.featureCardTitle}>{card.title}</h4>
                <p className={styles.featureCardDescription}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (blockType === 'processFlow') {
      const heading = typeof fields?.heading === 'string' ? (fields.heading as string).trim() : '';
      const intro = typeof fields?.intro === 'string' ? (fields.intro as string).trim() : '';
      type ProcessStep = { title?: unknown; description?: unknown; label?: unknown };
      const stepsRaw = Array.isArray(fields?.steps) ? (fields.steps as ProcessStep[]) : [];
      const steps = stepsRaw.filter(
        (s) => typeof s?.title === 'string' && typeof s?.description === 'string',
      );
      if (!steps.length) return null;
      return (
        <div key={key} className={`${styles.processFlow} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
          {heading && <h3 className={styles.processFlowHeading}>{heading}</h3>}
          {intro && <p className={styles.processFlowIntro}>{intro}</p>}
          <div className={styles.processFlowList}>
            {steps.map((step, i) => {
              const rawLabel = typeof step.label === 'string' ? step.label.trim() : '';
              const label = rawLabel || String(i + 1).padStart(2, '0');
              return (
                <div key={i} className={styles.processFlowStep}>
                  <div className={styles.processFlowMarker} aria-hidden="true">
                    {label}
                  </div>
                  <div className={styles.processFlowBody}>
                    <h4 className={styles.processFlowStepTitle}>{step.title as string}</h4>
                    <p className={styles.processFlowStepDesc}>{step.description as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (blockType === 'editorialTable') {
      type Cell = { text?: unknown };
      type Header = { text?: unknown };
      type Row = { cells?: Cell[] };
      const headers = Array.isArray(fields?.headers) ? (fields.headers as Header[]) : [];
      const rows = Array.isArray(fields?.rows) ? (fields.rows as Row[]) : [];
      const caption = typeof fields?.caption === 'string' ? (fields.caption as string).trim() : '';
      if (!headers.length || !rows.length) return null;
      return (
        <div key={key} className={`${styles.tableWrap} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
          <table className={styles.table} {...(caption ? { 'aria-label': caption } : {})}>
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
      );
    }

    if (blockType === 'qnaList') {
      type Item = { role?: unknown; text?: unknown };
      const itemsRaw = Array.isArray(fields?.items) ? (fields.items as Item[]) : [];
      const items = itemsRaw
        .map((it) => ({
          role: it?.role === 'answer' ? ('answer' as const) : ('question' as const),
          text: typeof it?.text === 'string' ? it.text : '',
        }))
        .filter((it) => it.text.length > 0);
      return <FaqAccordion key={key} items={items} />;
    }

    return null;
  }

  if (Array.isArray(node.children) && node.children.length > 0) {
    return (
      <p key={key} className={`${styles.paragraph} ${ctx.revealClass}`} style={{ transitionDelay: ctx.delay }}>
        {renderInline(node.children)}
      </p>
    );
  }
  return null;
}

// ─── Reveal-on-scroll observer ────────────────────────────────────
function useRevealObserver(ref: React.RefObject<HTMLElement | null>, resetKey: unknown) {
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = c.querySelectorAll(`.${styles.reveal}`);
    if (reduce) {
      items.forEach((i) => i.classList.add(styles.revealVisible));
      return;
    }
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealVisible);
            o.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    items.forEach((i) => obs.observe(i));
    return () => obs.disconnect();
  }, [ref, resetKey]);
}

// ─── Main component ───────────────────────────────────────────────
export default function ServiceDetail({
  basePath: _basePath,
  locale,
  post,
  hubLabel,
  caseStudies,
}: ServiceDetailProps) {
  const rootRef = useRef<HTMLElement>(null);
  useRevealObserver(rootRef, post.title);

  const groups = groupBlocks(post.content);
  const studies = caseStudies ?? [];

  return (
    <article ref={rootRef} className={styles.serviceDetail}>
      {/* Hero — centered title + intro + full-bleed thumb below */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {hubLabel && <p className={`${styles.heroLabel} ${styles.reveal}`}>Service · {hubLabel}</p>}
          <h1 className={`${styles.heroTitle} ${styles.reveal}`}>{post.title}</h1>
          {post.intro && <p className={`${styles.heroIntro} ${styles.reveal}`}>{post.intro}</p>}
        </div>
        {post.heroImageUrl && (
          <div className={`${styles.heroImage} ${styles.reveal}`}>
            <Image
              src={post.heroImageUrl}
              alt={post.heroImageAlt}
              width={1600}
              height={900}
              priority
              sizes="100vw"
              className={styles.heroImg}
            />
          </div>
        )}
      </header>

      {/* Body sections (Lexical groups) */}
      {groups.map((g, gi) => {
        const sectionCls = styles[`section_${g.style}`] ?? styles.section_prose;
        const isAlt = g.style === 'featuresAlt';
        const rowLabel = isAlt && g.heading ? flattenText(g.heading.children).trim() : null;
        return (
          <section key={gi} className={`${styles.section} ${sectionCls}`}>
            <div className={styles.sectionInner}>
              {g.heading && !isAlt && (
                <h2 className={`${styles.sectionHeading} ${styles.reveal}`}>
                  {renderInline(g.heading.children)}
                </h2>
              )}
              {g.blocks.map((b, bi) => {
                const delay = `${Math.min(bi * 35, 210)}ms`;
                return renderBlock(b, bi, { rowLabel, revealClass: styles.reveal, delay });
              })}
            </div>
          </section>
        );
      })}

      {/* Case Study — portfolio Posts (hidden if 0) */}
      {studies.length > 0 && (
        <section className={`${styles.section} ${styles.section_caseStudy}`}>
          <div className={styles.sectionInner}>
            <h2 className={`${styles.caseStudyHeading} ${styles.reveal}`}>Case Study</h2>
            <ul className={styles.caseStudyList}>
              {studies.map((s) => (
                <li key={s.slug} className={`${styles.caseStudyItem} ${styles.reveal}`}>
                  <Link href={`/${locale}/portfolio/${s.slug}`} className={styles.caseStudyLink}>
                    {s.thumbnailUrl && (
                      <Image
                        src={s.thumbnailUrl}
                        alt={s.thumbnailAlt}
                        width={480}
                        height={320}
                        className={styles.caseStudyThumb}
                        sizes="(max-width: 1079px) 100vw, 30vw"
                      />
                    )}
                    <div className={styles.caseStudyText}>
                      <h3 className={styles.caseStudyTitle}>{s.title}</h3>
                      <span className={styles.caseStudyMore}>View More →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA banner — full-bleed primary */}
      <section className={`${styles.section} ${styles.section_cta}`}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaHeading} ${styles.reveal}`}>Have a project in mind?</h2>
          <p className={`${styles.ctaBody} ${styles.reveal}`}>
            Describe what you&rsquo;re trying to build — we&rsquo;ll map out the architecture and give
            you an honest scope estimate.
          </p>
          <div className={`${styles.ctaButtonWrap} ${styles.reveal}`}>
            <Link href={`/${locale}/project-inquiry`} className={styles.ctaButton}>
              Start the Conversation →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PostList.module.css';

/* ── Types ── */
/**
 * Post card shape — denormalized on the server (page.tsx) from payload Post,
 * so this client component stays presentational.
 */
export interface PostCardData {
  slug: string;
  title: string;
  description: string;
  date: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

/* ── Arrow icon (inline SVG — replaces svg-icon--arrow-diagonal) ── */
function ArrowDiagonal(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Chevron icons for pagination ── */
function ChevronLeft(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

/* ── PostCard component ── */
interface PostCardProps {
  post: PostCardData;
  locale: string;
  index: number;
}

function PostCard({ post, locale, index }: PostCardProps) {
  const hasThumb = Boolean(post.thumbnailUrl);

  return (
    <Link
      href={`/${locale}/insights/${post.slug}`}
      className={`${styles.card} ${styles.reveal}`}
      style={{ transitionDelay: `${Math.min(index * 24, 180)}ms` }}
    >
      <figure className={styles.media}>
        {hasThumb ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.thumbnailAlt}
            width={540}
            height={398}
            sizes="(max-width: 480px) 100vw, (max-width: 1024px) 100vw, 340px"
          />
        ) : (
          <div aria-hidden="true" style={{ width: '100%', height: '100%', background: 'var(--iropke-color-border, #eee)' }} />
        )}
      </figure>
      <article className={styles.body}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <span className={styles.titleText}>{post.title}</span>
          </h2>
          <span className={styles.titleArrow} aria-hidden="true">
            <ArrowDiagonal />
          </span>
        </div>
        {post.description && <p className={styles.desc}>{post.description}</p>}
        <div className={styles.footer}>
          {post.date && <span className={styles.date}>{post.date}</span>}
        </div>
      </article>
    </Link>
  );
}

/* ── Pagination component ── */
interface PaginationData {
  currentPage: number;
  totalPages: number;
}

interface PaginationProps {
  pagination: PaginationData;
  basePath: string;
}

function Pagination({ pagination, basePath }: PaginationProps) {
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`${styles.paginationWrap} ${styles.spanFull} ${styles.reveal}`}
      aria-label="Pagination"
    >
      <ul className={styles.pagination}>
        {/* Previous */}
        <li className={styles.paginationItem}>
          <Link
            href={currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : '#'}
            className={`${styles.paginationLink} ${styles.paginationNav}`}
            aria-label="Previous page"
            aria-disabled={currentPage <= 1}
          >
            <ChevronLeft className={styles.paginationIcon} />
          </Link>
        </li>

        {/* Page numbers */}
        {pages.map((page) => (
          <li key={page} className={styles.paginationItem}>
            <Link
              href={`${basePath}?page=${page}`}
              className={`${styles.paginationLink} ${page === currentPage ? styles.paginationLinkActive : ''}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </li>
        ))}

        {/* Next */}
        <li className={styles.paginationItem}>
          <Link
            href={currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : '#'}
            className={`${styles.paginationLink} ${styles.paginationNav}`}
            aria-label="Next page"
            aria-disabled={currentPage >= totalPages}
          >
            <ChevronRight className={styles.paginationIcon} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

/* ── Reveal animation hook ── */
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

/* ── Client component ── */
interface PostListClientProps {
  locale: string;
  currentPage: number;
  totalPages: number;
  posts: PostCardData[];
}

export default function PostListClient({
  locale,
  currentPage,
  totalPages,
  posts,
}: PostListClientProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useRevealObserver(sectionRef);

  const basePath = `/${locale}/insights`;

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.layout}>
        {posts.length === 0 ? (
          <div className={`${styles.postList} ${styles.spanFull}`} aria-label="Post list">
            <p style={{ padding: '80px 0', textAlign: 'center', opacity: 0.7 }}>
              {locale === 'ko' ? '아직 게시된 글이 없습니다.' : 'No posts yet.'}
            </p>
          </div>
        ) : (
          <div className={`${styles.postList} ${styles.spanFull}`} aria-label="Post list">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                index={index}
              />
            ))}
          </div>
        )}

        <Pagination
          pagination={{ currentPage, totalPages }}
          basePath={basePath}
        />
      </div>
    </section>
  );
}

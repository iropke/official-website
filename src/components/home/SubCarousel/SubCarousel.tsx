'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './SubCarousel.module.css';

export interface CarouselSlide {
  title: string;
  description?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  backgroundType?: 'gradient' | 'image' | null;
  gradient?: string | null;
  backgroundImage?:
    | {
        url?: string | null;
        alt?: string | null;
      }
    | number
    | null;
  id?: string | null;
}

export interface SubCarouselProps {
  slides: CarouselSlide[] | null | undefined;
  locale: string;
  intervalMs?: number;
}

const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #1f4a44 0%, #0d201d 100%)',
  'linear-gradient(135deg, #264f38 0%, #0f1f18 100%)',
  'linear-gradient(135deg, #1d344d 0%, #101b24 100%)',
  'linear-gradient(135deg, #345347 0%, #0f1a17 100%)',
  'linear-gradient(135deg, #22908b 0%, #15716d 100%)',
];

/**
 * Sub Carousel — Campaign / Promotion slides.
 * 3~5 slides, auto-rotating at intervalMs (default 3000ms),
 * with prev/next controls and indicator dots.
 */
export default function SubCarousel({
  slides,
  locale,
  intervalMs = 3000,
}: SubCarouselProps) {
  const validSlides = useMemo(
    () => (slides ?? []).filter((s) => s && s.title),
    [slides]
  );
  const total = validSlides.length;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, intervalMs]);

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  if (total === 0) return null;

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Campaigns and featured messages"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="page-shell">
        <div className={styles.carousel__frame}>
          <div
            className={styles.carousel__track}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {validSlides.map((slide, i) => {
              const bgImage =
                typeof slide.backgroundImage === 'object' && slide.backgroundImage
                  ? slide.backgroundImage.url
                  : null;
              const useImage = slide.backgroundType === 'image' && bgImage;
              const gradient =
                slide.gradient || DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length];

              const background = useImage
                ? `linear-gradient(180deg, rgba(15,25,30,0.35), rgba(15,25,30,0.72)), url("${bgImage}") center/cover no-repeat`
                : gradient;

              const ctaHref = slide.ctaUrl
                ? slide.ctaUrl.startsWith('/')
                  ? `/${locale}${slide.ctaUrl}`.replace(/\/+$/, '') || '/'
                  : slide.ctaUrl
                : null;

              return (
                <article
                  className={styles.carousel__slide}
                  key={slide.id ?? `${i}-${slide.title}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${total}`}
                  aria-hidden={index !== i}
                  style={{ background }}
                >
                  <div className={styles.carousel__slideContent}>
                    <span className={styles.carousel__counter}>
                      {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </span>
                    <h3 className={styles.carousel__title}>{slide.title}</h3>
                    {slide.description && (
                      <p className={styles.carousel__description}>{slide.description}</p>
                    )}
                    {ctaHref && slide.ctaLabel && (
                      <Link href={ctaHref} className={styles.carousel__cta}>
                        <span>{slide.ctaLabel}</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path
                            d="M2.5 7h9m0 0L7.5 3m4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                className={`${styles.carousel__nav} ${styles['carousel__nav--prev']}`}
                onClick={prev}
                aria-label="Previous slide"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M11 3 5 9l6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.carousel__nav} ${styles['carousel__nav--next']}`}
                onClick={next}
                aria-label="Next slide"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M7 3l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={styles.carousel__indicators} role="tablist" aria-label="Slide indicators">
                {validSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`${styles.carousel__dot} ${
                      i === index ? styles['carousel__dot--active'] : ''
                    }`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

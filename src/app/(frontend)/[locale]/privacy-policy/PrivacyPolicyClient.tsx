'use client'

import React, { useEffect, useState } from 'react'
import type { PrivacyPolicyCopy, PrivacySection } from './content'
import styles from './PrivacyPolicy.module.css'

interface PrivacyPolicyClientProps {
  copy: PrivacyPolicyCopy
}

/**
 * Privacy Policy 페이지 — sticky TOC + scrollspy.
 *
 * 기획서 요구사항:
 *   - 좌측 sticky 사이드바 TOC
 *   - anchor 클릭 시 해당 섹션으로 스크롤
 *   - 현재 보이는 섹션이 TOC 에서 강조 (scrollspy)
 *   - mobile 에서는 TOC 가 상단에 가로로 펼쳐짐 (CSS 처리)
 */
export default function PrivacyPolicyClient({ copy }: PrivacyPolicyClientProps) {
  const [activeId, setActiveId] = useState<string>(copy.sections[0]?.anchorId ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면 상단에 가까운 섹션 우선
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id
          if (id) setActiveId(id)
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    copy.sections.forEach((s) => {
      const el = document.getElementById(s.anchorId)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [copy.sections])

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <aside className={styles.tocWrap} aria-label={copy.tocLabel}>
          <p className={styles.tocLabel}>{copy.tocLabel}</p>
          <ul className={styles.tocList}>
            {copy.sections.map((s) => (
              <li key={s.anchorId} className={styles.tocItem}>
                <a
                  href={`#${s.anchorId}`}
                  className={`${styles.tocLink} ${
                    activeId === s.anchorId ? styles.tocLinkActive : ''
                  }`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.content}>
          <header className={styles.headerBlock}>
            <h1 className={styles.title}>{copy.pageTitle}</h1>
            <p className={styles.lastUpdated}>
              {copy.lastUpdatedLabel}: {copy.lastUpdated}
            </p>
          </header>

          {copy.sections.map((s) => (
            <PolicySectionView
              key={s.anchorId}
              section={s}
              isContact={s.anchorId === 'contact'}
              contactEmail={copy.contactEmail}
              contactEmailLabel={copy.contactEmailLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface PolicySectionViewProps {
  section: PrivacySection
  isContact: boolean
  contactEmail: string
  contactEmailLabel: string
}

function PolicySectionView({
  section,
  isContact,
  contactEmail,
  contactEmailLabel,
}: PolicySectionViewProps) {
  return (
    <section id={section.anchorId} className={styles.policySection}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className={styles.paragraph}>
          {p}
        </p>
      ))}
      {section.bullets && section.bullets.length > 0 && (
        <ul className={styles.bullets}>
          {section.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {isContact && (
        <a
          className={styles.contactEmail}
          href={`mailto:${contactEmail}`}
          aria-label={contactEmailLabel}
        >
          {contactEmail}
        </a>
      )}
    </section>
  )
}

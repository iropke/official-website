import React from 'react'

export default function HomePage() {
  return (
    <section style={{ padding: 'var(--iropke-page-top, 120px) 0 96px' }}>
      <div style={{ maxWidth: 'var(--page-shell-max, 1440px)', margin: '0 auto', padding: '0 var(--page-shell-gutter, 20px)' }}>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(2rem, 3vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#232329' }}>
          Iropke
        </h1>
        <p style={{ marginTop: '20px', fontSize: '1rem', lineHeight: 1.7, color: '#5e6670', maxWidth: '60ch' }}>
          Structured growth systems for global brands.
        </p>
      </div>
    </section>
  )
}

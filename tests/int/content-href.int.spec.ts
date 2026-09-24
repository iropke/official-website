/**
 * localizeContentHref() — 본문(Lexical) 내부 링크의 locale 보정.
 *
 * SSOT: src/lib/posts/urls.ts. 라우트는 `/{locale}/{category}/{slug}` 뿐이라
 * 본문의 `/insight/foo` · 레거시 `/insights/foo` 를 그대로 출력하면 404 가 된다.
 */
import { describe, it, expect } from 'vitest'
import { localizeContentHref } from '../../src/lib/posts/urls'

describe('localizeContentHref()', () => {
  it('prefixes the current locale to a category path', () => {
    expect(localizeContentHref('/insight/foo', 'en')).toBe('/en/insight/foo')
    expect(localizeContentHref('/story/bar', 'ko')).toBe('/ko/story/bar')
  })

  it('corrects legacy plural segments', () => {
    expect(localizeContentHref('/insights/foo', 'ko')).toBe('/ko/insight/foo')
    expect(localizeContentHref('/stories/bar', 'en')).toBe('/en/story/bar')
  })

  it('keeps query string and hash', () => {
    expect(localizeContentHref('/insights/foo?x=1#sec', 'ja')).toBe('/ja/insight/foo?x=1#sec')
  })

  it('leaves already-localized paths unchanged', () => {
    expect(localizeContentHref('/en/insight/foo', 'ko')).toBe('/en/insight/foo')
  })

  it('leaves external, protocol-relative, hash, and non-page paths unchanged', () => {
    expect(localizeContentHref('https://example.com/insight/foo', 'ko')).toBe('https://example.com/insight/foo')
    expect(localizeContentHref('//cdn.example.com/a.png', 'ko')).toBe('//cdn.example.com/a.png')
    expect(localizeContentHref('#section', 'ko')).toBe('#section')
    expect(localizeContentHref('mailto:hi@example.com', 'ko')).toBe('mailto:hi@example.com')
    expect(localizeContentHref('/api/media/file/a.png', 'ko')).toBe('/api/media/file/a.png')
    expect(localizeContentHref('/assets/img.png', 'ko')).toBe('/assets/img.png')
  })

  it('localizes non-category site pages', () => {
    expect(localizeContentHref('/project-inquiry', 'ko')).toBe('/ko/project-inquiry')
  })
})

import { describe, it, expect } from 'vitest'
import { sanitizeArticleHtml } from '../../src/lib/sanitize'

describe('sanitizeArticleHtml — blocks injection vectors', () => {
  it('strips script tags and their contents', () => {
    const out = sanitizeArticleHtml('<p>Hi</p><script>alert(1)</script>')
    expect(out).toContain('<p>Hi</p>')
    expect(out).not.toContain('script')
    expect(out).not.toContain('alert(1)')
  })

  it('strips inline event handler attributes', () => {
    const out = sanitizeArticleHtml('<img src="https://x.test/a.jpg" onerror="alert(1)">')
    expect(out).not.toContain('onerror')
    expect(out).toContain('src="https://x.test/a.jpg"')
  })

  it('strips javascript: URLs on links', () => {
    const out = sanitizeArticleHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
    expect(out).toContain('click')
  })

  it('strips data: URLs on images', () => {
    const out = sanitizeArticleHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">')
    expect(out).not.toContain('data:')
  })

  it('strips iframe, object and style tags', () => {
    const out = sanitizeArticleHtml(
      '<iframe src="https://evil.test"></iframe><object data="x"></object><style>p{}</style>'
    )
    expect(out).not.toContain('iframe')
    expect(out).not.toContain('object')
    expect(out).not.toContain('style')
  })

  it('strips the style attribute', () => {
    const out = sanitizeArticleHtml('<p style="position:fixed;top:0">x</p>')
    expect(out).not.toContain('style')
    expect(out).toContain('x')
  })
})

describe('sanitizeArticleHtml — preserves real article markup', () => {
  // Note: sanitize-html re-serializes void elements self-closing (<img … />), so this asserts
  // that the markup survives, not that the string round-trips byte-for-byte.
  it('keeps the formatting tags used by existing articles', () => {
    const html =
      '<h2>Heading</h2><p><strong>bold</strong> and <em>italic</em></p>' +
      '<ul><li>one</li></ul>' +
      '<figure><img src="https://cdn.test/a.jpg" alt="A"><figcaption>Cap</figcaption></figure>' +
      '<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>C</td></tr></tbody></table>'
    const out = sanitizeArticleHtml(html)

    expect(out).toContain('<h2>Heading</h2>')
    expect(out).toContain('<strong>bold</strong> and <em>italic</em>')
    expect(out).toContain('<ul><li>one</li></ul>')
    expect(out).toContain('<figure>')
    expect(out).toContain('src="https://cdn.test/a.jpg"')
    expect(out).toContain('alt="A"')
    expect(out).toContain('<figcaption>Cap</figcaption>')
    expect(out).toContain('<thead><tr><th>H</th></tr></thead>')
    expect(out).toContain('<tbody><tr><td>C</td></tr></tbody>')
  })

  it('keeps http, https, mailto and relative links', () => {
    const html =
      '<a href="https://a.test">a</a><a href="http://b.test">b</a>' +
      '<a href="mailto:x@y.test">c</a><a href="/news">d</a>'
    const out = sanitizeArticleHtml(html)
    expect(out).toContain('href="https://a.test"')
    expect(out).toContain('href="http://b.test"')
    expect(out).toContain('href="mailto:x@y.test"')
    expect(out).toContain('href="/news"')
  })
})

describe('sanitizeArticleHtml — empty input', () => {
  it('returns an empty string for null, undefined and empty content', () => {
    expect(sanitizeArticleHtml(null)).toBe('')
    expect(sanitizeArticleHtml(undefined)).toBe('')
    expect(sanitizeArticleHtml('')).toBe('')
  })
})

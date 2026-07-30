import { describe, it, expect } from 'vitest'
import { metaDescription, seoTitle } from '../../src/lib/meta'

describe('metaDescription — decodes HTML entities', () => {
  it('decodes named entities instead of leaking them into the tag', () => {
    const out = metaDescription('<p>Recovers non-ferrous metals &mdash; aluminum and copper.</p>')
    expect(out).toBe('Recovers non-ferrous metals — aluminum and copper.')
    expect(out).not.toContain('&mdash;')
  })

  it('decodes Spanish accented entities', () => {
    const out = metaDescription('<p>La separaci&oacute;n por corriente de Foucault es una tecnolog&iacute;a.</p>')
    expect(out).toBe('La separación por corriente de Foucault es una tecnología.')
  })

  it('decodes numeric entities, decimal and hex', () => {
    expect(metaDescription('20&#8211;30% of defects')).toBe('20–30% of defects')
    expect(metaDescription('20&#x2013;30% of defects')).toBe('20–30% of defects')
  })

  it('decodes &amp; last so &amp;mdash; stays a literal ampersand sequence', () => {
    // Copy that legitimately shows the entity as text must not become an em dash.
    expect(metaDescription('Write &amp;mdash; to get a dash')).toBe('Write &mdash; to get a dash')
  })

  it('decodes &amp;, &lt;, &gt; and &quot;', () => {
    expect(metaDescription('Cutting &amp; sewing')).toBe('Cutting & sewing')
    expect(metaDescription('&quot;jumbo bags&quot;')).toBe('"jumbo bags"')
    expect(metaDescription('a &lt;b&gt; c')).toBe('a <b> c')
  })

  it('does not treat a decoded entity as a tag delimiter', () => {
    // Decoding happens after tag stripping, so &lt;script&gt; cannot re-form a tag.
    expect(metaDescription('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('<script>alert(1)</script>')
  })

  it('measures the length limit against decoded text, not the encoded source', () => {
    // 60 encoded chars of &oacute; collapse to 10 decoded chars, so nothing is truncated.
    const out = metaDescription('&oacute;'.repeat(10), 20)
    expect(out).toBe('ó'.repeat(10))
    expect(out).not.toContain('…')
  })

  it('leaves a lone ampersand untouched', () => {
    expect(metaDescription('Rey & Long')).toBe('Rey & Long')
  })
})

describe('metaDescription — existing trimming behaviour', () => {
  it('returns empty string for nullish input', () => {
    expect(metaDescription(null)).toBe('')
    expect(metaDescription(undefined)).toBe('')
    expect(metaDescription('')).toBe('')
  })

  it('strips tags and collapses whitespace', () => {
    expect(metaDescription('<p>Hello</p>\n\n  <p>world</p>')).toBe('Hello world')
  })

  it('keeps short copy verbatim', () => {
    expect(metaDescription('Short copy.')).toBe('Short copy.')
  })

  it('ends on a sentence boundary when one falls in the healthy range', () => {
    const text = 'First sentence here. ' + 'x'.repeat(200)
    expect(metaDescription(text, 25)).toBe('First sentence here.')
  })

  it('trims at a word boundary with an ellipsis otherwise', () => {
    const out = metaDescription('alpha beta gamma delta epsilon zeta eta theta', 20)
    expect(out.endsWith('…')).toBe(true)
    expect(out.length).toBeLessThanOrEqual(21)
    expect(out).not.toContain('delt…')
  })
})

describe('seoTitle — brands and trims without leaving a dangling separator', () => {
  it('appends the brand when absent', () => {
    expect(seoTitle('Products')).toBe('Products | Reylong')
  })

  it('leaves an already-branded title alone when it fits', () => {
    expect(seoTitle('Contact Us — Reylong')).toBe('Contact Us — Reylong')
  })

  it('drops the dangling em dash when the brand gets trimmed off', () => {
    const out = seoTitle('Non-Ferrous Metal Recycling Trends to Watch in 2026 — Reylong')
    expect(out).toBe('Non-Ferrous Metal Recycling Trends to Watch in 2026')
    expect(out.endsWith('—')).toBe(false)
  })

  it('drops a dangling pipe separator too', () => {
    const out = seoTitle('Non-Ferrous Metal Recycling Trends to Watch in 2026 | Reylong')
    expect(out).toBe('Non-Ferrous Metal Recycling Trends to Watch in 2026')
  })

  it('handles the Spanish product title that regressed in production', () => {
    const out = seoTitle('Soluciones de Inteligencia Artificial para Maquinaria — Reylong')
    expect(out).toBe('Soluciones de Inteligencia Artificial para Maquinaria')
  })

  it('never exceeds the SERP display limit', () => {
    const out = seoTitle('A'.repeat(120))
    expect(out.length).toBeLessThanOrEqual(60)
  })

  it('falls back to a hard slice when a single word exceeds the limit', () => {
    const out = seoTitle('B'.repeat(80), 60)
    expect(out).toBe('B'.repeat(60))
  })

  it('does not strip a hyphen that is part of the last word', () => {
    const out = seoTitle('Guide to Mono-Material', 22)
    expect(out).toBe('Guide to Mono-Material')
  })
})

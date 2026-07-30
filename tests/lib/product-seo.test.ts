import { describe, it, expect } from 'vitest'
import { PRODUCT_SEO_DESCRIPTIONS, productSeoDescription } from '../../src/lib/product-seo'

const entries = Object.entries(PRODUCT_SEO_DESCRIPTIONS)

describe('productSeoDescription — lookup', () => {
  it('returns the curated copy for a known slug', () => {
    const out = productSeoDescription('automatic-printing-tubing-cutting-sewing-line', 'en', 'FALLBACK')
    expect(out).toBe(PRODUCT_SEO_DESCRIPTIONS['automatic-printing-tubing-cutting-sewing-line'].en)
    expect(out).not.toBe('FALLBACK')
  })

  it('returns the Spanish copy when asked for es', () => {
    const out = productSeoDescription('automatic-printing-tubing-cutting-sewing-line', 'es', 'FALLBACK')
    expect(out).toBe(PRODUCT_SEO_DESCRIPTIONS['automatic-printing-tubing-cutting-sewing-line'].es)
  })

  it('falls back to the generated description for an unknown slug', () => {
    expect(productSeoDescription('some-future-machine', 'en', 'FALLBACK')).toBe('FALLBACK')
    expect(productSeoDescription('some-future-machine', 'es', 'FALLBACK')).toBe('FALLBACK')
  })

  it('falls back when the curated copy is an empty string', () => {
    expect(productSeoDescription('', 'en', 'FALLBACK')).toBe('FALLBACK')
  })
})

describe('PRODUCT_SEO_DESCRIPTIONS — every entry meets the SERP constraints', () => {
  it('covers a non-trivial number of products', () => {
    expect(entries.length).toBeGreaterThanOrEqual(5)
  })

  it.each(entries)('%s — fits the ~155 char display limit in both languages', (_slug, copy) => {
    expect(copy.en.length).toBeLessThanOrEqual(160)
    expect(copy.es.length).toBeLessThanOrEqual(160)
  })

  it.each(entries)('%s — is long enough to be useful', (_slug, copy) => {
    expect(copy.en.length).toBeGreaterThanOrEqual(110)
    expect(copy.es.length).toBeGreaterThanOrEqual(110)
  })

  it.each(entries)('%s — does not open with the brand name', (_slug, copy) => {
    // Leading with "Rey Long's ..." spends the most valuable characters on a
    // name the searcher did not query. Lead with what the machine does.
    expect(copy.en).not.toMatch(/^\s*(Rey ?Long|Reylong)/i)
    expect(copy.es).not.toMatch(/^\s*(Rey ?Long|Reylong)/i)
  })

  it.each(entries)('%s — is a complete sentence, not a machine truncation', (_slug, copy) => {
    expect(copy.en.endsWith('…')).toBe(false)
    expect(copy.es.endsWith('…')).toBe(false)
    expect(copy.en).toMatch(/[.!?]$/)
    expect(copy.es).toMatch(/[.!?]$/)
  })

  it.each(entries)('%s — carries no raw or double-encoded HTML entities', (_slug, copy) => {
    for (const text of [copy.en, copy.es]) {
      expect(text).not.toMatch(/&[a-zA-Z]+;/)
      expect(text).not.toMatch(/&#\d+;/)
      expect(text).not.toContain('<')
    }
  })

  it.each(entries)('%s — has distinct EN and ES copy', (_slug, copy) => {
    expect(copy.en).not.toBe(copy.es)
  })
})

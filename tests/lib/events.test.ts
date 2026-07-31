import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

import { eventNewsHref } from '../../src/lib/db/events'
import type { Event } from '../../src/lib/db/events'

const baseEvent: Event = {
  id: '1',
  title_en: 'TAIPEI PACK 2026',
  title_es: 'TAIPEI PACK 2026',
  date_start: '2026-06-24',
  date_end: '2026-06-27',
  location: 'Taipei, Taiwan',
  booth_number: 'K1234',
  description_en: 'Meet us in Taipei',
  description_es: 'Visítenos en Taipéi',
  url: 'https://www.taipeipack.com.tw/en/index.html',
  news_slug: 'taipei-pack-2026'
}

describe('eventNewsHref', () => {
  it('builds an English article path', () => {
    expect(eventNewsHref(baseEvent, 'en')).toBe('/news/taipei-pack-2026')
  })

  it('builds a Spanish article path', () => {
    expect(eventNewsHref(baseEvent, 'es')).toBe('/es/news/taipei-pack-2026')
  })

  it('defaults to English when no language is given', () => {
    expect(eventNewsHref(baseEvent)).toBe('/news/taipei-pack-2026')
  })

  it('returns null when the event has no announcement article', () => {
    expect(eventNewsHref({ ...baseEvent, news_slug: null }, 'en')).toBeNull()
  })

  it('returns null for a blank slug rather than linking to the news index', () => {
    // A stray empty string in the column must not produce "/news/", which is a
    // different page entirely.
    expect(eventNewsHref({ ...baseEvent, news_slug: '   ' }, 'en')).toBeNull()
  })

  // SSR routes are canonicalised WITHOUT a trailing slash — src/middleware.ts
  // 308-redirects the slash form. An internal link that triggers a redirect is
  // exactly the wasted hop this change exists to avoid.
  it('never emits a trailing slash', () => {
    for (const lang of ['en', 'es'] as const) {
      expect(eventNewsHref(baseEvent, lang)).not.toMatch(/\/$/)
    }
  })
})

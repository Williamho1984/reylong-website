import { supabase } from '../supabase'

export type Event = {
  id: string
  title_en: string
  title_es: string
  date_start: string
  date_end: string
  location: string
  booth_number: string
  description_en: string
  description_es: string
  /** Organiser's own site — external, not the Reylong announcement article. */
  url: string
  /** Slug of our announcement article, or null when we never wrote one. */
  news_slug: string | null
}

/**
 * Path to the article announcing an event, or null when there is none.
 *
 * Without this, the two exhibition announcements were reachable only from the
 * /news index — one incoming internal link each, with /events (linked from
 * every page's footer) passing them nothing.
 *
 * No trailing slash: news routes are SSR and src/middleware.ts 308-redirects
 * the slash form, so a slashed link would spend a redirect on every click.
 */
export function eventNewsHref(event: Event, lang: 'en' | 'es' = 'en'): string | null {
  const slug = event.news_slug?.trim()
  if (!slug) return null
  return lang === 'es' ? `/es/news/${slug}` : `/news/${slug}`
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date_end', today)
    .order('date_start', { ascending: true })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: false })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}

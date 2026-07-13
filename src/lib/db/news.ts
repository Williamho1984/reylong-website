import { supabase } from '../supabase'

// Question/answer pairs behind the FAQPage JSON-LD on a guide. Lives in the database rather than
// the page so an answer can be corrected without a redeploy.
export type NewsFaq = {
  q_en: string
  a_en: string
  q_es: string
  a_es: string
}

// 'guide' is an evergreen technical article; 'news' is dated company news (events, announcements).
// They sit in the same table and keep the same /news/<slug> URLs — the split is presentational,
// so nothing needs redirecting.
export type NewsCategory = 'news' | 'guide'

export type NewsArticle = {
  id: string
  slug: string
  published_at: string
  cover_image_url: string
  category: NewsCategory
  title_en: string
  title_es: string
  summary_en: string
  summary_es: string
  content_en: string
  content_es: string
  faq: NewsFaq[]
}

export async function getAllNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch news: ${error.message}`)
  return data ?? []
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch latest news: ${error.message}`)
  return data ?? []
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch news: ${error.message}`)
  }
  return data
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('news').select('slug')
  if (error) throw new Error(`Failed to fetch news slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}

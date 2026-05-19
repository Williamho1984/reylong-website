import { supabase } from '../supabase'

export type NewsArticle = {
  id: string
  slug: string
  published_at: string
  cover_image_url: string
  title_en: string
  title_es: string
  content_en: string
  content_es: string
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

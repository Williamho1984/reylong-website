import { supabase } from '../supabase'

export type CaseStudy = {
  id: string
  slug: string
  client: string
  country: string
  published_at: string
  cover_image_url: string
  title_en: string
  title_es: string
  content_en: string
  content_es: string
  product_id: string | null
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch case studies: ${error.message}`)
  return data ?? []
}

export async function getLatestCaseStudies(limit = 3): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch latest case studies: ${error.message}`)
  return data ?? []
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch case study: ${error.message}`)
  }
  return data
}

export async function getAllCaseStudySlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('case_studies').select('slug')
  if (error) throw new Error(`Failed to fetch case study slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}

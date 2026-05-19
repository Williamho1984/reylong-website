import { supabase } from '../supabase'

export type Product = {
  id: string
  slug: string
  category: string
  is_featured: boolean
  sort_order: number
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  specs: Record<string, string>
  created_at: string
  updated_at: string
}

export type ProductMedia = {
  id: string
  product_id: string
  type: 'image' | 'video' | 'catalog_pdf'
  url: string
  caption_en: string
  caption_es: string
  sort_order: number
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  return data ?? []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(6)
  if (error) throw new Error(`Failed to fetch featured products: ${error.message}`)
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getProductMedia(productId: string): Promise<ProductMedia[]> {
  const { data, error } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch product media: ${error.message}`)
  return data ?? []
}

export async function getAllProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
  if (error) throw new Error(`Failed to fetch product slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}

import { supabase } from '../supabase'

export type ApplicationField = {
  domain_en: string
  domain_zh: string
  domain_es: string
  image_url: string
}

// Rich "article" content for solution-type products (e.g. AI Machine Intelligence),
// presented as a story with alternating image/text sections instead of a specs table.
// Stored in the products.content JSONB column so images can be filled in later
// (upload to the product-media bucket, then set image_url) without a redeploy.
export type AiStoryHighlight = { value: string; label_en: string; label_es: string }
export type AiStorySection = {
  heading_en: string
  heading_es: string
  body_en: string
  body_es: string
  image_url: string
}
export type AiStoryMachine = { name_en: string; name_es: string; image_url: string }
export type AiContent = {
  hero?: { tagline_en: string; tagline_es: string; image_url: string }
  highlights?: AiStoryHighlight[]
  sections?: AiStorySection[]
  machines?: AiStoryMachine[]
}

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
  specs: Array<{ key: string; value: string }> | Record<string, string>
  applications: ApplicationField[]
  content?: AiContent | null
  created_at: string
  updated_at: string
  cover_image_url?: string
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

type ProductRow = Omit<Product, 'cover_image_url'> & {
  product_media: { url: string; type: string; sort_order: number }[]
}

function attachCoverImage(row: ProductRow): Product {
  const first = row.product_media
    ?.filter(m => m.type === 'image')
    .sort((a, b) => a.sort_order - b.sort_order)[0]
  const { product_media: _, ...product } = row
  return { ...product, cover_image_url: first?.url }
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_media(url, type, sort_order)')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  return (data ?? []).map(r => attachCoverImage(r as ProductRow))
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_media(url, type, sort_order)')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(6)
  if (error) throw new Error(`Failed to fetch featured products: ${error.message}`)
  return (data ?? []).map(r => attachCoverImage(r as ProductRow))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch product: ${error.message}`)
  }
  return data
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch product: ${error.message}`)
  }
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

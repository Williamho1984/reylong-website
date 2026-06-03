import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://www.reylong.com'

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/products', priority: '0.9', changefreq: 'weekly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/news', priority: '0.6', changefreq: 'weekly' },
  { url: '/case-studies', priority: '0.6', changefreq: 'monthly' },
]

export const GET: APIRoute = async () => {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co',
    import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'
  )

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')

  const { data: news } = await supabase
    .from('news')
    .select('slug, published_at')

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('slug, published_at')

  const urls = [
    ...staticRoutes.map(
      ({ url, priority, changefreq }) => `
  <url>
    <loc>${SITE}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    ),
    ...(products ?? []).map(
      (p) => `
  <url>
    <loc>${SITE}/products/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
    ...(news ?? []).map(
      (n) => `
  <url>
    <loc>${SITE}/news/${n.slug}</loc>
    <lastmod>${new Date(n.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>`
    ),
    ...(caseStudies ?? []).map(
      (c) => `
  <url>
    <loc>${SITE}/case-studies/${c.slug}</loc>
    <lastmod>${new Date(c.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}

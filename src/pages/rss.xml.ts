import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://www.reylong.com'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const GET: APIRoute = async () => {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co',
    // publishable key is public by design; embed directly to avoid stale build-time env
    'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'
  )

  const { data: news } = await supabase
    .from('news')
    .select('slug, title_en, summary_en, published_at, updated_at')
    .order('published_at', { ascending: false })
    .limit(30)

  const items = (news ?? [])
    .map((n) => {
      const link = `${SITE}/news/${n.slug}`
      const pubDate = new Date(n.updated_at ?? n.published_at).toUTCString()
      return `
    <item>
      <title>${escapeXml(n.title_en)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${n.summary_en ? `<description>${escapeXml(n.summary_en)}</description>` : ''}
    </item>`
    })
    .join('')

  const lastBuildDate = new Date(
    (news ?? [])[0]?.updated_at ?? (news ?? [])[0]?.published_at ?? Date.now()
  ).toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Reylong Machinery — News &amp; Technical Guides</title>
    <link>${SITE}/news</link>
    <description>Technical guides on woven bag production, flexographic printing, heat sealing, eddy current separation and AI inspection, plus company news from Reylong Machinery.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      // The feed is a syndication resource, not a page. Without this it stays
      // eligible for indexing and shows up under "Crawled - currently not
      // indexed" in Search Console. A meta robots tag is impossible in XML, so
      // Google's documented mechanism for non-HTML resources is this header.
      // `follow` is implicit and deliberate: Googlebot can still use the feed
      // to discover new articles, it just won't index the feed itself.
      'X-Robots-Tag': 'noindex',
    },
  })
}

import { defineMiddleware } from 'astro:middleware'

// These routes are prerendered (export const prerender = true) and shipped as
// static files; Cloudflare Pages' asset layer already enforces the trailing
// slash on them (no-slash -> 308 with-slash), bypassing this middleware
// entirely on a match. Excluding them here avoids a redirect loop in case a
// request for the slash form ever does reach the Worker.
const PRERENDERED_PATHS = new Set(['/about/', '/faq/', '/contact/', '/es/about/'])

// Every SSR route was shipping with no Cache-Control at all, so no edge or
// browser cache ever held a page and each request re-ran the Worker and
// re-queried Supabase. That is what a crawler measures as a slow page.
//
// max-age=0 keeps browsers revalidating, so a CMS edit is never stuck behind
// a visitor's local cache; s-maxage lets shared caches serve a hot copy for a
// few minutes; stale-while-revalidate means the refresh happens in the
// background instead of making someone wait for it.
const HTML_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'

// Form and chat endpoints must never be cached or shared between visitors.
const NO_STORE = 'private, no-store'

// Sending the header above turned out not to be enough: reylong.com resolves
// outside Cloudflare, so there is no zone to attach a Cache Rule to, and
// Cloudflare does not cache HTML by default. Responses came back with no
// cf-cache-status at all and a cold TTFB of ~1.1s, because every request
// re-ran the Worker and re-queried Supabase.
//
// The Cache API is available to the Worker itself regardless of zone config,
// so hold the HTML here. It honours s-maxage from the header above, giving
// the same 5-minute window a shared cache would have used.
type EdgeCache = {
  match(request: Request): Promise<Response | undefined>
  put(request: Request, response: Response): Promise<void>
}

type CloudflareLocals = {
  runtime?: { ctx?: { waitUntil?: (promise: Promise<unknown>) => void } }
}

function edgeCache(): EdgeCache | null {
  // Absent when running under `astro dev` (plain Node), so this degrades to a
  // straight pass-through locally.
  return (globalThis as { caches?: { default?: EdgeCache } }).caches?.default ?? null
}

// Query strings are excluded so a crawler appending ?utm_source=… cannot fill
// the cache with duplicates of the same page under different keys.
function isCacheable(request: Request, url: URL): boolean {
  return request.method === 'GET' && !url.search && !url.pathname.startsWith('/api/')
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.ahrefs.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://analytics.ahrefs.com",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

export const onRequest = defineMiddleware(async (_ctx, next) => {
  if (_ctx.url.pathname === '/google080cb8be1b7a8c3b.html') {
    return new Response('google-site-verification: google080cb8be1b7a8c3b.html', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  // SSR routes (output: 'server', no per-page prerender) match with or
  // without a trailing slash and render identical content at 200 for both,
  // each self-referencing a different canonical URL. That contradiction is
  // exactly what Google Search Console flags as "Duplicate, Google chose a
  // different canonical than the user". Normalize to the no-slash form,
  // which matches the convention already used by every internal link.
  const { pathname } = _ctx.url
  if (pathname !== '/' && pathname.endsWith('/') && !PRERENDERED_PATHS.has(pathname)) {
    const target = new URL(_ctx.url)
    target.pathname = pathname.slice(0, -1)
    return _ctx.redirect(target.toString(), 308)
  }

  const cacheable = isCacheable(_ctx.request, _ctx.url)
  const cache = cacheable ? edgeCache() : null
  // Key on the URL alone rather than the inbound Request, so request headers
  // never fragment the cache.
  const cacheKey = cacheable ? new Request(_ctx.url.toString(), { method: 'GET' }) : null

  if (cache && cacheKey) {
    const hit = await cache.match(cacheKey)
    if (hit) {
      const hitHeaders = new Headers(hit.headers)
      hitHeaders.set('X-Cache', 'HIT')
      return new Response(hit.body, {
        status: hit.status,
        statusText: hit.statusText,
        headers: hitHeaders
      })
    }
  }

  const response = await next()
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value)
  }

  // Only fill in a policy where the route did not set one itself — sitemap.xml
  // and rss.xml each pick their own and must keep it.
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', pathname.startsWith('/api/') ? NO_STORE : HTML_CACHE)
  }
  headers.set('X-Cache', cache ? 'MISS' : 'BYPASS')

  const finalResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })

  // Store only clean 200s. A Set-Cookie would make the entry visitor-specific
  // and the Cache API rejects it outright, so skip those rather than throw.
  if (cache && cacheKey && response.status === 200 && !headers.has('Set-Cookie')) {
    const store = cache.put(cacheKey, finalResponse.clone())
    const waitUntil = (_ctx.locals as CloudflareLocals)?.runtime?.ctx?.waitUntil
    if (waitUntil) {
      waitUntil(store)
    } else {
      // No background-task hook (local dev): swallow failures rather than let
      // a caching problem take down the response the visitor is waiting for.
      await store.catch(() => {})
    }
  }

  return finalResponse
})

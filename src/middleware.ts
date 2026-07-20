import { defineMiddleware } from 'astro:middleware'

// These routes are prerendered (export const prerender = true) and shipped as
// static files; Cloudflare Pages' asset layer already enforces the trailing
// slash on them (no-slash -> 308 with-slash), bypassing this middleware
// entirely on a match. Excluding them here avoids a redirect loop in case a
// request for the slash form ever does reach the Worker.
const PRERENDERED_PATHS = new Set(['/about/', '/faq/', '/contact/', '/es/about/'])

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

  const response = await next()
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
})

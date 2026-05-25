import type { APIRoute } from 'astro'

export const GET: APIRoute = () =>
  new Response('google-site-verification: google080cb8be1b7a8c3b.html', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })

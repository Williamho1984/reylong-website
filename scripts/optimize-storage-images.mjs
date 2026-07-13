// Shrink the images in Supabase Storage that the live site actually serves.
//
// Why in-place: image URLs are referenced from product/news/case_studies columns, from JSONB
// blobs (AI story, applications grid), from <img> tags embedded inside article content_en/es,
// and from hard-coded hero paths in index.astro. Overwriting the same Storage key keeps every
// one of those references valid, so this needs no DB or code change.
//
// Supabase's own image transform endpoint is not an option (403 FeatureNotEnabled on this
// plan) and Cloudflare image resizing needs the zone, which reylong.com is not on.
//
// Dry run:  node scripts/optimize-storage-images.mjs
// Apply:    node scripts/optimize-storage-images.mjs --apply
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BACKUP_DIR = join(ROOT, '.image-backup')

const SITE = 'https://www.reylong.com'
const STORAGE_HOST = 'lqgrvkhrbsgbatzhzgvy.supabase.co'
const SUPABASE_URL = `https://${STORAGE_HOST}`

// Size each image to the role it plays. The hero is full-bleed so it really is painted at up
// to ~1920 CSS px; everything else (article bodies are max-w-3xl = 768px, product and card
// images less) never exceeds ~800, so 1200 still leaves 1.5x for high-DPI screens. Capping the
// long tail at 1600 instead would leave the news photos barely compressed (-9% vs -53%).
const HERO_WIDTH = 1920
const CONTENT_WIDTH = 1200
const JPEG_QUALITY = 80
const ONE_YEAR = '31536000'

// Several applications-grid PNGs are cut-outs with genuinely transparent pixels (min alpha 0).
// Re-encoding those as JPEG would flatten the transparency to black, so they stay PNG and get
// palette-quantized instead — that keeps the alpha channel and still cuts ~70%.
async function hasRealTransparency(buf, meta) {
  if (!meta.hasAlpha) return false
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 3; i < data.length; i += info.channels) if (data[i] < 255) return true
  return false
}

const APPLY = process.argv.includes('--apply')

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()]
    })
)
if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env')
const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const kb = n => `${(n / 1024).toFixed(0)}KB`

async function text(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`${res.status} on ${url}`)
  return res.text()
}

// Collect every Storage image the live site actually renders, straight from the sitemap.
async function collectImageUrls() {
  const sitemap = await text(`${SITE}/sitemap.xml`)
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
  const found = new Set()
  for (const page of pages) {
    const html = await text(page)
    for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      if (m[1].includes(STORAGE_HOST)) found.add(m[1])
    }
  }
  return [...found].sort()
}

// https://<host>/storage/v1/object/public/<bucket>/<key...>  ->  { bucket, key }
function parseStorageUrl(url) {
  const m = new URL(url).pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!m) throw new Error(`unrecognized storage URL: ${url}`)
  return { bucket: decodeURIComponent(m[1]), key: decodeURIComponent(m[2]) }
}

function backup(bucket, key, buf) {
  const dest = join(BACKUP_DIR, bucket, key)
  mkdirSync(dirname(dest), { recursive: true })
  if (existsSync(dest)) return dest // never clobber a previously saved original
  writeFileSync(dest, buf)
  return dest
}

const urls = await collectImageUrls()
console.log(`${urls.length} Storage images referenced by the live site`)
console.log(APPLY ? 'MODE: APPLY (will overwrite)\n' : 'MODE: dry run (nothing written)\n')

let before = 0
let after = 0
let rewritten = 0

for (const url of urls) {
  const { bucket, key } = parseStorageUrl(url)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const original = Buffer.from(await res.arrayBuffer())
  const meta = await sharp(original).metadata()

  const width = key.startsWith('hero/') ? HERO_WIDTH : CONTENT_WIDTH
  const transparent = await hasRealTransparency(original, meta)
  const pipe = sharp(original)
    .rotate() // honour EXIF orientation before we drop the metadata
    .resize({ width, withoutEnlargement: true })
  const out = transparent
    ? await pipe.png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 }).toBuffer()
    : await pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toBuffer()
  const contentType = transparent ? 'image/png' : 'image/jpeg'

  // Re-encoding does not always win (the heroes are already tuned). Keep whichever is smaller,
  // but upload either way: every file currently comes back `Cache-Control: no-cache`, and the
  // header only gets fixed by rewriting the object. Skipping the "already small" ones would
  // leave them uncacheable, which is half the performance problem.
  const win = out.length < original.length
  const body = win ? out : original
  const type = win ? contentType : `image/${meta.format === 'png' ? 'png' : 'jpeg'}`

  before += original.length
  after += body.length

  const saved = (100 - (body.length * 100) / original.length).toFixed(0)
  const note = win ? `-> ${kb(body.length)} (-${saved}%)` : 'kept original (cache header only)'
  const fmt = transparent ? 'PNG(alpha)' : 'JPEG'
  console.log(`${kb(original.length).padStart(8)}  ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  ${fmt.padEnd(10)} ${note.padEnd(33)}  ${bucket}/${key}`)

  if (!APPLY) continue

  backup(bucket, key, original)
  const { error } = await supabase.storage.from(bucket).upload(key, body, {
    contentType: type,
    cacheControl: ONE_YEAR, // the live files come back `no-cache` today — that is the other half of the fix
    upsert: true,
  })
  if (error) {
    console.error(`FAIL ${bucket}/${key}: ${error.message}`)
    process.exit(1)
  }
  rewritten++
}

console.log(`\ntotal ${kb(before)} -> ${kb(after)}  (-${(100 - (after * 100) / before).toFixed(1)}%)`)
console.log(APPLY ? `${rewritten} images overwritten; originals saved under .image-backup/` : 'dry run — re-run with --apply to write')

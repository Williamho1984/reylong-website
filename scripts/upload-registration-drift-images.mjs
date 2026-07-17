// Compress the two new registration-drift guide images and upload to Supabase Storage.
// Run from project root: node <this file>
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = 'c:/dev/reylong website'
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] })
)
const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')

const jobs = [
  { src: join(ROOT, 'Camera.jpg'), dest: 'news/registration-drift/inspection-camera.jpg' },
  { src: join(ROOT, 'AI inspection real.jpg'), dest: 'news/registration-drift/ai-inspection-hmi.jpg' },
]

for (const { src, dest } of jobs) {
  const buf = await sharp(src).resize({ width: 1600 }).jpeg({ quality: 80, mozjpeg: true }).toBuffer()
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-media/${dest}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buf,
  })
  if (!res.ok) {
    console.error(`Upload failed for ${dest}:`, res.status, await res.text())
    process.exit(1)
  }
  console.log(`OK ${dest} (${(buf.length / 1024).toFixed(0)} KB)`)
}
console.log('Public base:', `${SUPABASE_URL}/storage/v1/object/public/product-media/news/registration-drift/`)

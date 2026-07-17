import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const SRC = 'C:/dev/marketing strategy/hero-candidates'

// All output as 1920x1080 JPG for a consistent full-bleed hero.
// Woven bags are a product shot on a clean white studio background -> `contain`
// on white, right-aligned (`position: east`) so the left half stays white for
// dark hero text. The other two are full-frame scenes/textures -> `cover`.
// `cropRight` trims a fraction off the right edge to drop Gemini's ✦ artifact.
const LGRAY = { r: 242, g: 243, b: 246 }
const jobs = [
  // Woven bags: product shot on a soft light-grey studio background. `brightness`
  // dims the source's pure-white backdrop down to the light grey so it matches the
  // canvas padding seamlessly; right-aligned (`east`) leaves the left for hero text.
  { file: 'Gemini_Generated_Image_vabxryvabxryvabx.png', remote: 'hero/woven-bags.jpg',      fit: 'contain', bg: LGRAY, position: 'east', brightness: 0.95 },
  { file: 'Gemini_Generated_Image_mayk1dmayk1dmayk.png',  remote: 'hero/recycled-plastic.jpg', fit: 'cover',   position: 'centre', cropRight: 0.10 },
  { file: 'slide4-standup-pouches 2.png',                 remote: 'hero/stand-up-pouches.jpg',  fit: 'cover',   position: 'centre', cropRight: 0.15 },
]

for (const j of jobs) {
  const input = readFileSync(join(SRC, j.file))
  let pipe = sharp(input)
  if (j.cropRight) {
    const meta = await pipe.metadata()
    const keepW = Math.round(meta.width * (1 - j.cropRight))
    pipe = sharp(input).extract({ left: 0, top: 0, width: keepW, height: meta.height })
  }
  if (j.brightness) pipe = pipe.modulate({ brightness: j.brightness })
  const base = pipe.resize(1920, 1080, {
    fit: j.fit,
    position: j.position,
    ...(j.bg ? { background: j.bg } : {}),
  })
  const out = await base.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  const { error } = await supabase.storage.from('product-media')
    .upload(j.remote, out, { contentType: 'image/jpeg', upsert: true })
  if (error) { console.error('FAIL', j.remote, error.message); process.exit(1) }
  const url = supabase.storage.from('product-media').getPublicUrl(j.remote).data.publicUrl
  console.log('OK', (out.length / 1024).toFixed(0) + 'KB', url)
}

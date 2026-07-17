// Seed the products.content JSONB for "AI-Powered Machine Intelligence Solutions"
// with an article-style story (hero, results highlights, alternating image/text
// sections, applicable machines). All image_url fields are intentionally empty —
// upload images to the product-media bucket later and PATCH the URLs in; no redeploy
// needed because the product page reads this JSONB at request time (SSR).
//
// Prereq (one-time): ALTER TABLE products ADD COLUMN IF NOT EXISTS content jsonb;
// Run: node scripts/seed-ai-content.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()]
    })
)

const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')

const SLUG = 'ai-machine-intelligence-solutions'

const content = {
  hero: {
    tagline_en: 'Your machine, with a digital brain.',
    tagline_es: 'Su máquina, con un cerebro digital.',
    image_url: '',
  },
  highlights: [
    { value: '±1 mm', label_en: 'Cutting & sewing accuracy target', label_es: 'Objetivo de precisión de corte y costura' },
    { value: '~2%', label_en: 'Scrap rate, down from ~5%', label_es: 'Tasa de desperdicio, desde ~5%' },
    { value: '95%+', label_en: 'Visual defect recall', label_es: 'Detección de defectos por visión' },
    { value: '4×', label_en: 'Machines per operator, up from 2', label_es: 'Máquinas por operario, desde 2' },
  ],
  sections: [
    {
      heading_en: 'Operator Expertise, Digitized',
      heading_es: 'La Experiencia del Operario, Digitalizada',
      body_en:
        "Veteran technicians tune fabric tension, denier-to-speed torque, and humidity-driven anti-static control by feel — know-how that walks out the door when they retire. Our system captures those decisions into a model that recommends the optimal parameters right on the HMI, so a new hire can set up the line like a 20-year pro and your best operators' judgement is never lost.",
      body_es:
        'Los técnicos veteranos ajustan la tensión del tejido, el par según denier y velocidad, y el control antiestático según la humedad por intuición — un saber que desaparece cuando se jubilan. Nuestro sistema captura esas decisiones en un modelo que recomienda los parámetros óptimos directamente en la HMI, de modo que un operario nuevo configura la línea como un veterano de 20 años y el criterio de sus mejores operarios nunca se pierde.',
      image_url: '',
    },
    {
      heading_en: 'High-Speed Computer-Vision Inspection',
      heading_es: 'Inspección por Visión Artificial de Alta Velocidad',
      body_en:
        'A CNN vision model watches every bag at full line speed, catching printing defects (registration drift, ink skip, blur), material defects (broken filaments, weave holes, fuzz), and stitching defects (skipped stitches, cut-point offset). It deploys few-shot — a working baseline from as few as ~50 reference samples — and alerts the operator the moment a recurring fault appears, before a whole batch is scrapped.',
      body_es:
        'Un modelo de visión CNN inspecciona cada bolsa a plena velocidad de línea, detectando defectos de impresión (desviación de registro, falta de tinta, borrosidad), defectos de material (filamentos rotos, agujeros de tejido, pelusa) y defectos de costura (puntadas saltadas, desplazamiento del punto de corte). Se implementa con pocas muestras — una base funcional a partir de tan solo ~50 muestras de referencia — y alerta al operario en cuanto aparece un fallo recurrente, antes de desperdiciar un lote entero.',
      image_url: '',
    },
    {
      heading_en: 'Dynamic Error Compensation',
      heading_es: 'Compensación Dinámica de Errores',
      body_en:
        'Woven fabric and film stretch as they run, so fixed-length cutting drifts — typically ±5 mm. Vision reads the Eye-Mark on each segment, calculates the real deformation, and corrects the servo drives on the fly, tightening cut and seam accuracy toward ±1 mm while driving scrap down. The same control loop stabilizes hard-to-run PCR recycled material by adapting speed and sealing temperature in real time.',
      body_es:
        'El tejido y el film se estiran al avanzar, por lo que el corte de longitud fija se desvía — normalmente ±5 mm. La visión lee la marca Eye-Mark de cada segmento, calcula la deformación real y corrige los servomotores sobre la marcha, ajustando la precisión de corte y costura hacia ±1 mm y reduciendo el desperdicio. El mismo lazo de control estabiliza el material reciclado PCR, difícil de procesar, adaptando la velocidad y la temperatura de sellado en tiempo real.',
      image_url: '',
    },
  ],
  machines: [
    { name_en: 'Woven-bag production lines', name_es: 'Líneas de producción de sacos tejidos', image_url: '' },
    { name_en: 'Stand-up & zipper pouch machines', name_es: 'Máquinas de bolsas doypack y con cierre', image_url: '' },
    { name_en: 'Flexographic printing machines', name_es: 'Máquinas de impresión flexográfica', image_url: '' },
  ],
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/products?slug=eq.${SLUG}`, {
  method: 'PATCH',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({ content }),
})

const text = await res.text()
if (!res.ok) throw new Error(`Update failed (${res.status}): ${text}`)
const rows = JSON.parse(text)
console.log(`Updated ${rows.length} row(s).`)
console.log('sections:', rows[0]?.content?.sections?.length)
console.log('highlights:', rows[0]?.content?.highlights?.length)
console.log('machines:', rows[0]?.content?.machines?.length)

// Backfill summary_en / summary_es on the six guides that predate the summary column.
//
// Every summary below is condensed from that article's own existing body — no new facts, no new
// numbers. The figures quoted (US$6.6bn FIBC market, PPWR August 2026) are already stated and
// sourced in the articles themselves.
//
// Idempotent. Run: node scripts/backfill-guide-summaries.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const summaries = {
  'fibc-jumbo-bag-production-trends': {
    summary_en: 'The woven-PP bulk bag market was worth around US$6.6 billion in 2025, and four trends are reshaping what buyers now specify: mono-material recyclability, food-grade certification, multi-trip construction, and export-driven consistency at volume.',
    summary_es: 'El mercado de big bags de PP tejido rondaba los 6.600 millones de dólares en 2025, y cuatro tendencias están redefiniendo lo que exigen los compradores: reciclabilidad monomaterial, certificación de grado alimentario, construcción para múltiples viajes y consistencia a gran volumen para exportación.',
  },
  'edge-ai-packaging-lines-vision-inspection-predictive-maintenance': {
    summary_en: 'Quality inspection and predictive maintenance need answers in milliseconds, which is why they run at the edge rather than in the cloud. What vision inspection catches that sampling cannot, what predictive maintenance prevents, and why a cloud round trip is too slow for a line running at speed.',
    summary_es: 'La inspección de calidad y el mantenimiento predictivo necesitan respuestas en milisegundos, y por eso se ejecutan en el borde y no en la nube. Qué detecta la inspección por visión que el muestreo no puede, qué evita el mantenimiento predictivo y por qué un viaje de ida y vuelta a la nube es demasiado lento para una línea a plena velocidad.',
  },
  'water-based-inks-flexographic-printing-sustainable-packaging': {
    summary_en: 'Water-based inks cut VOCs to near zero, suit food contact and fit recyclable packaging — but they are far less forgiving on press than solvent inks. Why anilox specification, kiss-print pressure and ink pH decide whether they run cleanly shift after shift.',
    summary_es: 'Las tintas al agua reducen los COV a casi cero, son aptas para contacto alimentario y encajan con el envase reciclable, pero perdonan mucho menos en máquina que las tintas al disolvente. Por qué la especificación del anilox, la presión de impresión mínima y el pH de la tinta deciden si funcionan limpiamente turno tras turno.',
  },
  'mono-material-recyclable-pouches-heat-seal-challenge': {
    summary_en: "The EU's PPWR applies from August 2026, turning recyclable mono-material packaging into a market-access requirement rather than a preference. The production catch: every layer belongs to the same polymer family, so the temperature that seals the film sits dangerously close to the one that destroys it.",
    summary_es: 'El PPWR de la UE se aplica desde agosto de 2026 y convierte el envase monomaterial reciclable en un requisito de acceso al mercado, no en una preferencia. El problema de producción: todas las capas pertenecen a la misma familia de polímeros, así que la temperatura que sella la película está peligrosamente cerca de la que la destruye.',
  },
  'eddy-current-separation-guide': {
    summary_en: 'How a rapidly rotating magnetic rotor induces eddy currents inside aluminium, copper and brass, ejecting them from a shredded stream while plastic and glass fall straight through — recovering the metal and cleaning the plastic recyclate in a single pass.',
    summary_es: 'Cómo un rotor magnético de giro rápido induce corrientes de Foucault en el aluminio, el cobre y el latón, expulsándolos de un flujo triturado mientras el plástico y el vidrio caen directamente — recuperando el metal y limpiando el reciclado plástico en una sola pasada.',
  },
  '3-side-seal-vs-stand-up-zipper-pouch': {
    summary_en: 'A practical comparison for production and procurement teams: material cost, machine speed, shelf presentation and resealability — and which customer segment each format actually serves. Bulk industrial buyers and retail shelves want different bags.',
    summary_es: 'Una comparación práctica para equipos de producción y compras: coste de material, velocidad de máquina, presentación en lineal y capacidad de recierre, y a qué segmento de cliente sirve realmente cada formato. Los compradores industriales a granel y el lineal minorista quieren bolsas distintas.',
  },
}

let failed = 0
for (const [slug, fields] of Object.entries(summaries)) {
  const { data, error } = await supabase.from('news').update(fields).eq('slug', slug).select('slug')
  if (error) {
    console.error('FAIL', slug, error.message)
    failed++
  } else if (!data?.length) {
    console.error('FAIL', slug, '(no row matched)')
    failed++
  } else {
    console.log('OK  ', slug)
  }
}
if (failed) process.exit(1)

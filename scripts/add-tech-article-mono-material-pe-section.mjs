// Add a 4th tech_article section to the JL-L-2TZP600 product page: mono-material PE
// (MDOPE outer + LLDPE/specialty PE sealant inner) as an alternative to the laminated film
// structures already described in section 1. Leaves the existing 3 sections untouched.
//
// Verified against real industry practice (not invented): MDOPE (machine-direction-oriented
// PE) + PE-based sealant as an all-PE recyclable structure is a real, named technology from
// Dow, Walki and other film suppliers (WebSearch, 2026-07-24). Trade-offs described (tension
// sensitivity, narrower heat-seal window, weaker barrier than PET/foil) are standard materials-
// science facts, cross-checked against what's already stated in this product's own section 1
// and the existing "Mono-Material Recyclable Pouches" news article's heat-seal-window claims —
// not new/unverified numbers.
//
// Dry run:  node scripts/add-tech-article-mono-material-pe-section.mjs
// Apply:    node scripts/add-tech-article-mono-material-pe-section.mjs --apply
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const APPLY = process.argv.includes('--apply')
const SLUG = 'hp-l-2tzp600-stand-up-zipper-pouch-machine'

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] })
)
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env')
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const NEW_SECTION = {
  heading_en: 'Mono-Material PE: An Alternative to Laminated Film',
  body_en: `The multi-layer laminates in the section above — NY/PE, PET/PE, AL/PE — are not the only structure the JL-L-2TZP600 runs. A growing share of production is shifting to mono-material polyethylene: a film built entirely from PE grades instead of combining PE with PET, nylon, or foil. The outer layer is typically MDOPE (machine-direction-oriented PE), stretched during manufacture to gain stiffness, clarity and moisture-barrier performance that standard unoriented PE film does not have; the inner layer is LLDPE or a specialty metallocene PE sealant, chosen for consistent heat-seal strength. Because both layers are the same polymer family, the finished pouch can go through existing PE recycling streams as a single material — a PET/PE or AL/PE laminate cannot, since separating dissimilar polymers at end of life is not commercially viable at scale. The trade-off shows up in processing, not appearance: MDOPE gets its stiffness and clarity from orientation, so it behaves differently under tension than an unoriented laminate, and web tension has to be held more precisely to avoid stretching or necking the film as it runs through the machine; and because the two PE layers are chemically closer to each other than a PET/PE laminate's mismatched melting points, the heat-seal window narrows the same way described above for laminated film. The JL-L-2TZP600's independent Panasonic servo motors hold web tension to a closed-loop setpoint on every axis, and the same 4-heating + 2-cooling zone seal bars that handle retort-grade laminate give the temperature and cooling control a narrower mono-material seal window needs, so a job can move from laminate to mono-material PE by changing process parameters at the touch screen, not by changing machines. Mono-material PE is not a universal upgrade, though: PET and foil laminates still outperform it on oxygen and moisture barrier for products that need long shelf life without an added barrier coating, so the choice is a product-specific trade-off between recyclability and barrier performance, decided by what is being packed — not a strict improvement in either direction.`,
  heading_es: 'PE monomaterial: una alternativa a la película laminada',
  body_es: `Los laminados multicapa de la sección anterior — NY/PE, PET/PE, AL/PE — no son la única estructura que procesa la JL-L-2TZP600. Una parte creciente de la producción está migrando hacia el polietileno monomaterial: una película construida enteramente con grados de PE en lugar de combinar PE con PET, nylon o aluminio. La capa exterior suele ser MDOPE (PE orientado en dirección máquina), estirado durante la fabricación para ganar rigidez, transparencia y barrera a la humedad que la película de PE sin orientar no tiene; la capa interior es LLDPE o un sellante especial de PE metalocénico, elegido por su resistencia de sellado térmico constante. Como ambas capas pertenecen a la misma familia de polímeros, la bolsa terminada puede procesarse en las corrientes de reciclaje de PE existentes como un único material — algo que un laminado PET/PE o AL/PE no puede hacer, ya que separar polímeros distintos al final de su vida útil no es viable comercialmente a escala. El compromiso aparece en el procesamiento, no en el aspecto: el MDOPE obtiene su rigidez y transparencia de la orientación, por lo que se comporta de forma distinta bajo tensión que un laminado sin orientar, y la tensión de banda debe mantenerse con más precisión para evitar que la película se estire o se estreche al pasar por la máquina; y como las dos capas de PE son químicamente más parecidas entre sí que los puntos de fusión dispares de un laminado PET/PE, la ventana de sellado térmico se estrecha de la misma forma descrita arriba para la película laminada. Los servomotores Panasonic independientes de la JL-L-2TZP600 mantienen la tensión de banda en un valor de consigna en lazo cerrado en cada eje, y las mismas mordazas de 4 grupos de calentamiento + 2 de enfriamiento que procesan el laminado de grado retorta ofrecen el control de temperatura y enfriamiento que exige una ventana de sellado monomaterial más estrecha, así que un pedido puede pasar de laminado a PE monomaterial cambiando los parámetros de proceso en la pantalla táctil, no cambiando de máquina. Sin embargo, el PE monomaterial no es una mejora universal: los laminados de PET y aluminio siguen superándolo en barrera al oxígeno y a la humedad para productos que necesitan una vida útil larga sin recubrimiento de barrera adicional, así que la elección es un compromiso específico de cada producto entre reciclabilidad y rendimiento de barrera, según lo que se vaya a envasar — no una mejora estricta en ningún sentido.`,
}

const res = await fetch(`${BASE}/rest/v1/products?slug=eq.${SLUG}&select=id,slug,tech_article`, { headers })
const [product] = await res.json()
if (!product) throw new Error(`Product not found: ${SLUG}`)

const article = product.tech_article
if (!article) throw new Error(`No existing tech_article on ${SLUG} — expected 3 sections already`)

console.log(`Current sections: ${article.sections.length}`)
article.sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.heading_en}`))

const existingIndex = article.sections.findIndex(s => s.heading_en === NEW_SECTION.heading_en)
const sections = existingIndex >= 0
  ? article.sections.map((s, i) => (i === existingIndex ? NEW_SECTION : s))
  : [...article.sections, NEW_SECTION]
const merged = { ...article, sections }
console.log(existingIndex >= 0
  ? `\nWill REPLACE existing section ${existingIndex + 1}: ${NEW_SECTION.heading_en}`
  : `\nWill add section ${merged.sections.length}: ${NEW_SECTION.heading_en}`)

if (!APPLY) {
  console.log('\ndry run — re-run with --apply to write')
  process.exit(0)
}

const patch = await fetch(`${BASE}/rest/v1/products?id=eq.${product.id}`, {
  method: 'PATCH',
  headers: { ...headers, Prefer: 'return=minimal' },
  body: JSON.stringify({ tech_article: merged }),
})
if (!patch.ok) {
  console.error(`FAIL: HTTP ${patch.status} ${await patch.text()}`)
  process.exit(1)
}
console.log('OK — section added')

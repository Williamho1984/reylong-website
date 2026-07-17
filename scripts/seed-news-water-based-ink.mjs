// Seed news article: "Water-Based Inks: The Sustainable Future of Flexographic Packaging Printing"
// News is SSR -> live immediately, no redeploy. Images are Reylong's own product photos
// (already in Supabase), so nothing to upload. Idempotent: update if slug exists else insert.
// Run: node scripts/seed-news-water-based-ink.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] })
)
const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const SLUG = 'water-based-inks-flexographic-printing-sustainable-packaging'
const BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public'
const COVER = `${BASE}/product%20image/printing.jpg`
const IMG_LINE = `${BASE}/product-media/automatic-printing-tubing-cutting-sewing-line/cover.jpg`

const content_en = `<p>Packaging printing is shifting from solvent-based to <strong>water-based inks</strong>. The driver is sustainability: tightening environmental regulations, brand commitments to recyclable packaging, and demand for safer, food-contact-friendly print. For anyone printing PP woven fabric or flexible film on a flexographic press, water-based inks are moving quickly from "nice to have" to the industry default.</p>
<figure><img src="https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/news/water-based-ink/printed-woven-bags.jpeg" alt="Flexographically printed PP woven polypropylene sacks for rice and fertilizer" /><figcaption>Printed PP woven bags &mdash; a typical output of flexographic printing on woven polypropylene fabric.</figcaption></figure>
<h2>Why water-based inks are winning</h2>
<ul>
<li><strong>Near-zero VOCs</strong> &mdash; water-based flexo inks dramatically cut volatile organic compound emissions versus solvent inks; in some systems VOCs are reduced to almost nothing, which means lower emissions and easier compliance with local environmental rules.</li>
<li><strong>Safer for operators</strong> &mdash; fewer hazardous solvents mean a safer pressroom and lower exposure to harmful chemicals.</li>
<li><strong>Food-contact friendly</strong> &mdash; quality water-based inks are formulated free of heavy metals and aromatic hydrocarbons, making them suitable for many food-packaging applications.</li>
<li><strong>Compatible with recyclable packaging</strong> &mdash; as brands move to recyclable mono-material structures, water-based inks fit the sustainability story end to end.</li>
</ul>
<h2>The catch: water-based inks are less forgiving to run</h2>
<p>Sustainability has a process cost. Water-based inks behave differently from solvent inks on press: they dry differently, and their performance depends heavily on <strong>ink chemistry, anilox specification and impression pressure</strong>. Get these wrong and you see filling-in, dirty print, feathering or weak colour. Running water-based inks well is less about the ink alone and more about how precisely the press is controlled.</p>
<h2>How Reylong's flexo press handles water-based inks</h2>
<p>Reylong's <a href="/products/flexographic-printing-machine-6c">6-colour flexographic printing machine</a> is built around the controls that water-based printing demands:</p>
<ul>
<li><strong>Ceramic anilox rollers, correctly specified</strong> &mdash; the anilox is the precision ink-metering device. For non-absorbent substrates such as PP woven fabric, a higher line count and lower volume (roughly 360&ndash;1400 LPI at 1.0&ndash;5.0 BCM) delivers clean, consistent ink transfer; mismatching anilox to substrate is what causes feathering, dirty print or mottling.</li>
<li><strong>"Kiss print" pressure control</strong> &mdash; clean transfer needs the minimum impression pressure, not more. Excessive pressure is the root cause of dot gain and halo; precise pressure control keeps fine detail sharp.</li>
<li><strong>Built for ink-chemistry management</strong> &mdash; water-based ink systems rely on staying in the correct alkaline pH range so the resins stay dissolved; when pH drifts, resins precipitate and you get ink kick-out, foaming and filling-in. Stable, controlled printing conditions keep water-based inks running predictably shift after shift.</li>
<li><strong>Six independent colour stations</strong> with ceramic anilox, configurable for the job at hand.</li>
</ul>
<h2>The bottom line</h2>
<p>Water-based inks are the sustainable direction for packaging printing &mdash; lower emissions, safer operation, food-contact-friendly and aligned with recyclable packaging. They reward presses that give the operator real control over anilox, pressure and ink condition. Choose the press for the inks you will be running tomorrow, not just today.</p>
<p><em><a href="/contact">Talk to Reylong's engineering team</a> about printing PP woven fabric and flexible packaging with water-based inks.</em></p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/fibc-jumbo-bag-production-trends">FIBC (Jumbo Bag) Production Trends to Watch in 2026</a></li>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
</ul>`

const content_es = `<p>La impresión de envases está pasando de las tintas con base disolvente a las <strong>tintas al agua</strong>. El motor es la sostenibilidad: regulaciones ambientales cada vez más estrictas, compromisos de marca con el envase reciclable y la demanda de impresión más segura y apta para contacto alimentario. Para quien imprime tejido de PP (rafia) o película flexible en una prensa flexográfica, las tintas al agua están pasando rápidamente de ser "deseables" a ser el estándar del sector.</p>
<figure><img src="https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/news/water-based-ink/printed-woven-bags.jpeg" alt="Sacos de polipropileno tejido impresos para arroz y fertilizante" /><figcaption>Sacos de PP tejido impresos &mdash; un resultado típico de la impresión flexográfica sobre tejido de polipropileno.</figcaption></figure>
<h2>Por qué se imponen las tintas al agua</h2>
<ul>
<li><strong>COV casi nulos</strong> &mdash; las tintas flexográficas al agua reducen drásticamente las emisiones de compuestos orgánicos volátiles frente a las tintas con disolvente; en algunos sistemas los COV se reducen casi a cero, lo que significa menos emisiones y un cumplimiento más fácil de la normativa ambiental local.</li>
<li><strong>Más seguras para el operario</strong> &mdash; menos disolventes peligrosos significan una sala de impresión más segura y menor exposición a productos químicos nocivos.</li>
<li><strong>Aptas para contacto alimentario</strong> &mdash; las tintas al agua de calidad se formulan sin metales pesados ni hidrocarburos aromáticos, lo que las hace adecuadas para muchas aplicaciones de envase alimentario.</li>
<li><strong>Compatibles con el envase reciclable</strong> &mdash; a medida que las marcas adoptan estructuras monomaterial reciclables, las tintas al agua encajan en la historia de sostenibilidad de principio a fin.</li>
</ul>
<h2>La contrapartida: las tintas al agua son menos tolerantes en máquina</h2>
<p>La sostenibilidad tiene un coste de proceso. Las tintas al agua se comportan de forma distinta a las de disolvente en la prensa: secan de otra manera y su rendimiento depende en gran medida de la <strong>química de la tinta, la especificación del anilox y la presión de impresión</strong>. Si esto no es correcto, aparecen empastes, impresión sucia, plumeado o color débil. Imprimir bien con tintas al agua depende menos de la tinta en sí y más de la precisión con que se controla la prensa.</p>
<h2>Cómo gestiona las tintas al agua la prensa flexográfica de Reylong</h2>
<p>La <a href="/es/products/flexographic-printing-machine-6c">máquina de impresión flexográfica de 6 colores</a> de Reylong está construida en torno a los controles que exige la impresión al agua:</p>
<ul>
<li><strong>Rodillos anilox cerámicos, correctamente especificados</strong> &mdash; el anilox es el dispositivo de precisión que dosifica la tinta. Para sustratos no absorbentes como el tejido de PP, un mayor número de líneas y menor volumen (aproximadamente 360&ndash;1400 LPI a 1,0&ndash;5,0 BCM) ofrece una transferencia de tinta limpia y uniforme; un anilox mal ajustado al sustrato es lo que provoca plumeado, impresión sucia o moteado.</li>
<li><strong>Control de presión "kiss print"</strong> &mdash; una transferencia limpia requiere la mínima presión de impresión, no más. El exceso de presión es la causa principal de la ganancia de punto y el halo; un control preciso de la presión mantiene nítido el detalle fino.</li>
<li><strong>Preparada para la gestión de la química de la tinta</strong> &mdash; los sistemas de tinta al agua dependen de mantenerse en el rango de pH alcalino correcto para que las resinas permanezcan disueltas; cuando el pH se desvía, las resinas precipitan y aparecen separación de tinta, espuma y empastes. Unas condiciones de impresión estables y controladas mantienen las tintas al agua funcionando de forma predecible turno tras turno.</li>
<li><strong>Seis estaciones de color independientes</strong> con anilox cerámico, configurables según el trabajo.</li>
</ul>
<h2>En conclusión</h2>
<p>Las tintas al agua son la dirección sostenible de la impresión de envases: menos emisiones, operación más segura, aptas para contacto alimentario y alineadas con el envase reciclable. Recompensan a las prensas que dan al operario un control real sobre el anilox, la presión y el estado de la tinta. Elija la prensa para las tintas que imprimirá mañana, no solo hoy.</p>
<p><em><a href="/contact">Hable con el equipo de ingeniería de Reylong</a> sobre la impresión de tejido de PP y envase flexible con tintas al agua.</em></p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/fibc-jumbo-bag-production-trends">Tendencias de producción de FIBC (big bags) para 2026</a></li>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico</a></li>
</ul>`

const article = {
  slug: SLUG,
  published_at: '2026-06-29',
  cover_image_url: COVER,
  title_en: 'Water-Based Inks: The Sustainable Future of Flexographic Packaging Printing',
  title_es: 'Tintas al agua: el futuro sostenible de la impresión flexográfica de envases',
  content_en,
  content_es,
}

const { data: existing, error: selErr } = await supabase.from('news').select('id').eq('slug', SLUG).maybeSingle()
if (selErr) { console.error('Select failed:', selErr.message); process.exit(1) }
let res
if (existing) {
  res = await supabase.from('news').update(article).eq('slug', SLUG).select('slug')
} else {
  res = await supabase.from('news').insert({ id: randomUUID(), ...article }).select('slug')
}
if (res.error) { console.error('Write failed:', res.error.message); process.exit(1) }
console.log('OK', existing ? '(updated)' : '(inserted)', '->', res.data?.[0]?.slug)

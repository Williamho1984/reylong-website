// Seed news article: "PP Woven Sack Trends to Watch in 2026"
//
// Distinct from the existing FIBC article (jumbo/bulk bags, 500-2000kg): this covers the
// standard 25-50kg woven sack segment (rice, cement, fertilizer, animal feed). Overlapping
// angles (recyclability, food-grade certification) deliberately left out to avoid repeating
// scripts/seed-news-fibc.mjs — this one leads with resin price volatility and premiumization,
// per user direction.
//
// Stats verified against direct source fetches (not the raw WebSearch aggregate, which had at
// least one wrong company name for an unrelated example — dropped that example entirely):
// - PP resin price (+11% month-on-month, +16.64% YoY, China benchmark as of 2026-07-22):
//   fetched directly from tradingeconomics.com/commodity/polypropylene
// - Woven bag & sack market (USD 4.7B 2026 -> USD 6.3B 2033, 4.2% CAGR; laminated bags 53.8%
//   share; HD/rotogravure printing enabling 10-30% price premium; agriculture 41.3% share):
//   fetched directly from persistencemarketresearch.com's own market page
// JLPTCSM-1300W specs (25-40 bags/min, 4-color print, integrated 4-stage line) come from
// products table via scripts/seed-product-bag-making-line.mjs. Do not invent numbers beyond
// these.
//
// Idempotent. Run: node scripts/seed-news-pp-woven-sack-trends.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const SLUG = 'pp-woven-sack-trends-2026'
// Same product cover already used on the FIBC trends article — same production line, real
// machine photo.
const COVER = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/automatic-printing-tubing-cutting-sewing-line/cover.jpg'

const faq = [
  {
    q_en: "What's driving PP woven sack production costs in 2026?",
    a_en: "Resin price volatility. Polypropylene, the raw material for woven sacks, tracks crude oil and naphtha feedstock costs and moves within weeks of them shifting — as of late July 2026 the China benchmark price was up roughly 11% over the preceding month and about 16.6% year-on-year. A converter has no control over that price. What a converter does control is how much of each kilogram of resin turns into a sellable bag versus scrap, and how many separate production steps (and separate machine setups, and separate yield losses) it takes to get there.",
    q_es: '¿Qué está impulsando los costos de producción de sacos tejidos de PP en 2026?',
    a_es: 'La volatilidad del precio de la resina. El polipropileno, la materia prima de los sacos tejidos, sigue de cerca el costo del petróleo crudo y la nafta y se mueve en cuestión de semanas cuando estos cambian — a finales de julio de 2026 el precio de referencia de China había subido aproximadamente un 11% respecto al mes anterior y cerca de un 16,6% interanual. Un conversor no controla ese precio. Lo que sí controla es qué porcentaje de cada kilogramo de resina se convierte en un saco vendible frente a merma, y cuántos pasos de producción independientes (con sus propios cambios de máquina y sus propias pérdidas de rendimiento) hacen falta para llegar ahí.',
  },
  {
    q_en: 'Why are converters investing in better printing instead of just cutting costs?',
    a_en: "Because buyers are demonstrably paying for it. High-definition and rotogravure-quality printing on woven sacks is commanding a 10-30% price premium over plain or basic-print bags, and laminated bags — which print and protect better than uncoated woven fabric — already account for roughly 54% of the market. When resin cost is fixed and largely out of a converter's hands, print quality is one of the few levers left that a customer will pay more for, which is why printing capability is becoming a differentiator rather than an afterthought.",
    q_es: '¿Por qué los conversores invierten en mejor impresión en lugar de solo recortar costos?',
    a_es: 'Porque los compradores demostrablemente pagan por ello. La impresión de alta definición y calidad rotograbado en sacos tejidos consigue una prima de precio del 10-30% frente a bolsas lisas o de impresión básica, y las bolsas laminadas —que imprimen y protegen mejor que el tejido sin recubrir— ya representan alrededor del 54% del mercado. Cuando el costo de la resina es fijo y en gran medida fuera del control del conversor, la calidad de impresión es una de las pocas palancas que quedan por las que un cliente pagará más, y por eso la capacidad de impresión se está convirtiendo en un diferenciador y no en un añadido secundario.',
  },
  {
    q_en: 'Why does an integrated single-pass production line matter more when resin prices are volatile?',
    a_en: "Because every handoff between separate machines is a place where material gets scrapped, misregistered, or reworked — and when the resin feeding that scrap costs 11% more than it did a month ago, the cost of an inefficient process goes up in lockstep with it. A line that prints, forms the tube, cuts, sews and overtapes in one continuous pass removes those handoffs: there is no intermediate roll of printed fabric sitting in a queue to be picked up, misfed, or damaged by a second machine. The efficiency argument for an integrated line gets stronger, not weaker, exactly when raw material costs are unstable.",
    q_es: '¿Por qué una línea de producción integrada en un solo paso importa más cuando el precio de la resina es volátil?',
    a_es: 'Porque cada traspaso entre máquinas independientes es un punto donde el material se desecha, se desregistra o se retrabaja — y cuando la resina que alimenta ese desecho cuesta un 11% más que hace un mes, el costo de un proceso ineficiente sube al mismo ritmo. Una línea que imprime, forma el tubo, corta, cose y aplica la cinta en un solo paso continuo elimina esos traspasos: no hay un rollo intermedio de tejido impreso esperando en cola para ser recogido, mal alimentado o dañado por una segunda máquina. El argumento de eficiencia a favor de una línea integrada se vuelve más fuerte, no más débil, justo cuando el costo de la materia prima es inestable.',
  },
]

const content_en = `<p>The standard PP woven sack market &mdash; the 25&ndash;50 kg bags used for rice, cement, fertilizer and animal feed, distinct from the large bulk FIBCs covered in <a href="/news/fibc-jumbo-bag-production-trends">our FIBC trends piece</a> &mdash; is on track to grow from <a href="https://www.persistencemarketresearch.com/market-research/polypropylene-woven-bag-and-sack-market.asp">USD 4.7 billion in 2026 to USD 6.3 billion by 2033</a>, a 4.2% CAGR, with agriculture alone accounting for 41.3% of demand. That steady growth is happening against a much less steady input cost. Two trends are shaping how converters are responding in 2026.</p>
<h2>1. Resin price volatility is squeezing margins</h2>
<p>Polypropylene tracks crude oil and naphtha feedstock costs closely, and it moves within weeks of them shifting. As of late July 2026, <a href="https://tradingeconomics.com/commodity/polypropylene">China's benchmark polypropylene price was up roughly 11% over the preceding month and about 16.6% year-on-year</a>. A converter has zero control over that number. What a converter controls is how much of every kilogram of resin becomes a sellable bag rather than scrap &mdash; which puts a premium on production yield and process efficiency at exactly the moment raw material is most expensive.</p>
<h2>2. Premium printing and coatings command a real price premium</h2>
<p>Buyers are demonstrably paying more for better-finished bags. High-definition and rotogravure-quality printing is commanding <a href="https://www.persistencemarketresearch.com/market-research/polypropylene-woven-bag-and-sack-market.asp">a 10&ndash;30% price premium over plain or basic-print sacks</a>, and laminated bags &mdash; which print and protect better than uncoated woven fabric &mdash; already account for roughly 54% of the market. With resin cost fixed and largely uncontrollable, print and finish quality have become one of the few levers a converter has left to differentiate on anything other than price.</p>
<h2>How Reylong fits</h2>
<p>Reylong's <a href="/products/automatic-printing-tubing-cutting-sewing-line">JLPTCSM-1300W Automatic Printing-Tubing-Cutting-Sewing-Overtape Convention Line</a> combines flexographic printing, tube forming, cutting &amp; sewing, and overtape application into a single continuous process &mdash; there is no intermediate roll of printed fabric sitting between separate machines to be misfed, misregistered, or scrapped. It prints up to 4 colors at a repeat length of 450&ndash;1200 mm and up to 1300 mm wide, and runs the full line at 25&ndash;40 bags per minute with servo-controlled 1 mm cutting accuracy. Fewer handoffs means less resin lost to rework at the exact moment resin is most expensive, and print quality that supports the premium end of the market rather than the commodity end.</p>
<p><a href="/contact/">Talk to Reylong's engineering team</a> about an integrated woven sack production line for your market.</p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/fibc-jumbo-bag-production-trends">FIBC (Jumbo Bag) Production Trends to Watch in 2026</a></li>
<li><a href="/news/print-registration-drift-pp-woven-fabric">Print Registration Drift on PP Woven Fabric: A Diagnostic Guide</a></li>
<li><a href="/news/cut-length-drift-woven-bag-lines">Cut-Length Drift on Woven Bag Lines: Why Fixed-Length Cutting Isn't Enough</a></li>
</ul>
<h2>Frequently asked questions</h2>
<h3>${faq[0].q_en}</h3>
<p>${faq[0].a_en}</p>
<h3>${faq[1].q_en}</h3>
<p>${faq[1].a_en}</p>
<h3>${faq[2].q_en}</h3>
<p>${faq[2].a_en}</p>`

const content_es = `<p>El mercado de sacos tejidos de PP estándar &mdash; las bolsas de 25&ndash;50 kg para arroz, cemento, fertilizante y alimento animal, distintas de los grandes FIBC a granel cubiertos en <a href="/es/news/fibc-jumbo-bag-production-trends">nuestro artículo sobre tendencias de FIBC</a> &mdash; va camino de crecer de <a href="https://www.persistencemarketresearch.com/market-research/polypropylene-woven-bag-and-sack-market.asp">4.700 millones de dólares en 2026 a 6.300 millones en 2033</a>, un CAGR del 4,2%, con la agricultura representando por sí sola el 41,3% de la demanda. Ese crecimiento constante ocurre frente a un costo de materia prima mucho menos constante. Dos tendencias están marcando cómo responden los conversores en 2026.</p>
<h2>1. La volatilidad del precio de la resina presiona los márgenes</h2>
<p>El polipropileno sigue de cerca el costo del petróleo crudo y la nafta, y se mueve en cuestión de semanas cuando estos cambian. A finales de julio de 2026, <a href="https://tradingeconomics.com/commodity/polypropylene">el precio de referencia del polipropileno en China había subido aproximadamente un 11% respecto al mes anterior y cerca de un 16,6% interanual</a>. Un conversor no tiene ningún control sobre esa cifra. Lo que sí controla es qué porcentaje de cada kilogramo de resina se convierte en un saco vendible en lugar de merma &mdash; lo que pone una prima sobre el rendimiento de producción y la eficiencia del proceso justo cuando la materia prima está más cara.</p>
<h2>2. La impresión y los recubrimientos premium consiguen una prima de precio real</h2>
<p>Los compradores demostrablemente pagan más por sacos mejor acabados. La impresión de alta definición y calidad rotograbado consigue <a href="https://www.persistencemarketresearch.com/market-research/polypropylene-woven-bag-and-sack-market.asp">una prima de precio del 10-30% frente a sacos lisos o de impresión básica</a>, y las bolsas laminadas &mdash; que imprimen y protegen mejor que el tejido sin recubrir &mdash; ya representan alrededor del 54% del mercado. Con el costo de la resina fijo y en gran medida fuera de control, la calidad de impresión y acabado se ha convertido en una de las pocas palancas que le quedan a un conversor para diferenciarse más allá del precio.</p>
<h2>Cómo encaja Reylong</h2>
<p>La <a href="/es/products/automatic-printing-tubing-cutting-sewing-line">línea automática de sacos de PP tejido JLPTCSM-1300W</a> de Reylong combina impresión flexográfica, formación de tubo, corte y costura, y aplicación de cinta en un solo proceso continuo &mdash; no hay un rollo intermedio de tejido impreso esperando entre máquinas independientes para ser mal alimentado, desregistrado o desechado. Imprime hasta 4 colores con una longitud de repetición de 450&ndash;1200 mm y hasta 1300 mm de ancho, y opera la línea completa a 25&ndash;40 sacos por minuto con precisión de corte servo-controlada de 1 mm. Menos traspasos significa menos resina perdida en retrabajo justo cuando la resina está más cara, y una calidad de impresión que sostiene el segmento premium del mercado en lugar del segmento genérico.</p>
<p><a href="/contact/">Hable con el equipo de ingeniería de Reylong</a> sobre una línea integrada de producción de sacos tejidos para su mercado.</p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/fibc-jumbo-bag-production-trends">Tendencias de producción de FIBC (big bags) para 2026</a></li>
<li><a href="/es/news/print-registration-drift-pp-woven-fabric">Desviación del registro de impresión en tejido PP: guía de diagnóstico</a></li>
<li><a href="/es/news/cut-length-drift-woven-bag-lines">Desviación de longitud de corte en líneas de sacos tejidos: por qué el corte a longitud fija no basta</a></li>
</ul>
<h2>Preguntas frecuentes</h2>
<h3>${faq[0].q_es}</h3>
<p>${faq[0].a_es}</p>
<h3>${faq[1].q_es}</h3>
<p>${faq[1].a_es}</p>
<h3>${faq[2].q_es}</h3>
<p>${faq[2].a_es}</p>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-22T16:00:00Z',
  cover_image_url: COVER,
  title_en: 'PP Woven Sack Trends to Watch in 2026',
  title_es: 'Tendencias de los sacos tejidos de PP para 2026',
  summary_en: 'China-benchmark polypropylene is up ~11% month-on-month and ~16.6% year-on-year, while high-definition printing commands a 10-30% price premium. Why resin volatility and premiumization are pushing woven sack converters toward integrated single-pass production lines.',
  summary_es: 'El polipropileno de referencia en China sube ~11% mensual y ~16,6% interanual, mientras la impresión de alta definición consigue una prima de precio del 10-30%. Por qué la volatilidad de la resina y la premiumización empujan a los conversores hacia líneas de producción integradas.',
  content_en,
  content_es,
  faq,
}

const { data: existing, error: selErr } = await supabase
  .from('news').select('id').eq('slug', SLUG).maybeSingle()
if (selErr) { console.error('Select failed:', selErr.message); process.exit(1) }

const res = existing
  ? await supabase.from('news').update(article).eq('slug', SLUG).select('slug')
  : await supabase.from('news').insert({ id: randomUUID(), ...article }).select('slug')

if (res.error) { console.error('Write failed:', res.error.message); process.exit(1) }
console.log('OK', existing ? '(updated)' : '(inserted)', '->', res.data?.[0]?.slug)

// Seed news article: "Edge AI for Packaging Lines: Real-Time Vision Inspection and Predictive Maintenance"
// News is SSR -> appears live immediately, no redeploy. Sitemap auto-includes the slug.
// Idempotent: updates if slug exists, otherwise inserts.
// Run: node scripts/seed-news-edge-ai.mjs
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

const SLUG = 'edge-ai-packaging-lines-vision-inspection-predictive-maintenance'
const BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media'
const IMG_VISION = `${BASE}/news/edge-ai/vision-inspection.jpeg`
const IMG_LINE = `${BASE}/news/edge-ai/smart-automation-line.jpeg`
const COVER = `${BASE}/ai-machine-intelligence-solutions/cover.jpg`

const content_en = `<p>Artificial intelligence is moving out of the data center and onto the factory floor. By 2026, a large share of industrial data is processed at the <strong>edge</strong> &mdash; on or beside the machine itself &mdash; because the most valuable use cases on a packaging line, quality inspection and predictive maintenance, need answers in milliseconds, not after a round trip to the cloud. For machine builders and packaging plants, embedding AI directly into the production line is becoming a practical, measurable upgrade rather than a futuristic concept.</p>
<figure><img src="${IMG_VISION}" alt="AI machine vision system optically inspecting circuit boards on a production line" /><figcaption>Machine vision inspects every unit at full line speed, catching defects the human eye cannot.</figcaption></figure>
<h2>Machine vision: inspecting 100% of output at line speed</h2>
<p>Traditional quality control relies on human spot-checks or sampling. A deep-learning vision system inspects <em>every</em> unit at full line speed, catching microscopic defects &mdash; print misregistration, contamination, seal flaws and print errors &mdash; that are invisible to the human eye and impossible to catch by sampling alone. On high-speed lines, edge-enabled cameras can flag defective items at well over a thousand units per minute, so a fault is caught and rejected the moment it appears instead of being discovered in a finished pallet.</p>
<figure><img src="${IMG_LINE}" alt="Smart automated production line with edge sensors and servo modules" /><figcaption>Edge AI runs on or beside the line, analysing machine signals in real time.</figcaption></figure>
<h2>Predictive maintenance: fixing problems before they stop the line</h2>
<p>Instead of waiting for a breakdown, edge AI continuously analyses signals from the machine &mdash; vibration, temperature, motor current &mdash; to detect the early signatures of bearing wear, thermal drift or imbalance. Maintenance is scheduled <em>before</em> failure, not after. Industry deployments commonly report unplanned-downtime reductions in the range of 25&ndash;50%, with quality-inspection and predictive-maintenance projects typically reaching positive ROI within 6&ndash;12 months &mdash; though results depend heavily on the line's level of automation and process variability.</p>
<h2>Why "edge", and why it matters on a packaging line</h2>
<p>Safety interlocks and line-speed inspection require sub-5-millisecond responses that a cloud round trip cannot deliver:</p>
<table>
<thead><tr><th>Processing location</th><th>Typical response time</th></tr></thead>
<tbody>
<tr><td>Cloud round-trip</td><td>~100&ndash;250 ms</td></tr>
<tr><td>Edge (on or beside the machine)</td><td>&lt; 5 ms</td></tr>
</tbody>
</table>
<p>Running the model locally also means <strong>process data never leaves the factory</strong> &mdash; a decisive advantage for manufacturers who cannot risk sensitive production data or product IP being sent to an external cloud &mdash; and the system keeps working even with no internet connection.</p>
<h2>How Reylong approaches it</h2>
<p>Reylong's <a href="/products/ai-machine-intelligence-solutions">AI Machine Intelligence solution</a> embeds edge computing and industrial IoT into existing production lines &mdash; delivering real-time computer-vision quality inspection, predictive maintenance and process optimization <strong>without requiring cloud connectivity</strong>. Because it is designed case by case for specific machines, it can be retrofitted onto equipment you already own, without a full machine replacement &mdash; turning an existing line into a smarter, self-monitoring one.</p>
<h2>The bottom line</h2>
<p>Edge AI is no longer experimental on the factory floor; it is a measurable upgrade to yield, uptime and quality. Vision inspection removes defects you currently can't see, and predictive maintenance removes downtime you currently can't predict &mdash; both running locally, in real time, on the line you already have.</p>
<p><em><a href="/contact">Talk to Reylong's engineering team</a> about retrofitting AI vision and predictive maintenance onto your line.</em></p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/water-based-inks-flexographic-printing-sustainable-packaging">Water-Based Inks: The Sustainable Future of Flexographic Packaging Printing</a></li>
<li><a href="/news/fibc-jumbo-bag-production-trends">FIBC (Jumbo Bag) Production Trends to Watch in 2026</a></li>
</ul>`

const content_es = `<p>La inteligencia artificial está saliendo del centro de datos para llegar a la planta de producción. Para 2026, una gran parte de los datos industriales se procesa en el <strong>borde</strong> (edge) &mdash; en la propia máquina o junto a ella &mdash; porque los casos de uso más valiosos en una línea de envasado, la inspección de calidad y el mantenimiento predictivo, necesitan respuestas en milisegundos, no tras un viaje de ida y vuelta a la nube. Para los fabricantes de maquinaria y las plantas de envasado, integrar la IA directamente en la línea de producción se está convirtiendo en una mejora práctica y medible, no en un concepto futurista.</p>
<figure><img src="${IMG_VISION}" alt="Sistema de visión artificial inspeccionando ópticamente placas de circuito en una línea de producción" /><figcaption>La visión artificial inspecciona cada unidad a plena velocidad de línea, detectando defectos invisibles para el ojo humano.</figcaption></figure>
<h2>Visión artificial: inspeccionar el 100% de la producción a velocidad de línea</h2>
<p>El control de calidad tradicional depende de inspecciones humanas por muestreo. Un sistema de visión con aprendizaje profundo inspecciona <em>cada</em> unidad a plena velocidad de línea, detectando defectos microscópicos &mdash; errores de registro de impresión, contaminación, fallos de sellado y errores de impresión &mdash; invisibles para el ojo humano e imposibles de captar solo por muestreo. En líneas de alta velocidad, las cámaras en el borde pueden señalar productos defectuosos a más de mil unidades por minuto, de modo que un fallo se detecta y se rechaza en el momento en que aparece, en lugar de descubrirse en un palé terminado.</p>
<figure><img src="${IMG_LINE}" alt="Línea de producción automatizada inteligente con sensores en el borde y módulos servo" /><figcaption>La IA en el borde se ejecuta en la línea o junto a ella, analizando las señales de la máquina en tiempo real.</figcaption></figure>
<h2>Mantenimiento predictivo: resolver problemas antes de que detengan la línea</h2>
<p>En lugar de esperar una avería, la IA en el borde analiza continuamente las señales de la máquina &mdash; vibración, temperatura, corriente del motor &mdash; para detectar las primeras señales de desgaste de rodamientos, deriva térmica o desequilibrio. El mantenimiento se programa <em>antes</em> del fallo, no después. Los despliegues del sector suelen reportar reducciones del tiempo de inactividad no planificado en el rango del 25&ndash;50%, y los proyectos de inspección de calidad y mantenimiento predictivo suelen alcanzar un ROI positivo en 6&ndash;12 meses &mdash; aunque los resultados dependen en gran medida del nivel de automatización de la línea y de la variabilidad del proceso.</p>
<h2>Por qué el "borde" y por qué importa en una línea de envasado</h2>
<p>Los enclavamientos de seguridad y la inspección a velocidad de línea requieren respuestas de menos de 5 milisegundos que un viaje a la nube no puede ofrecer:</p>
<table>
<thead><tr><th>Ubicación del procesamiento</th><th>Tiempo de respuesta típico</th></tr></thead>
<tbody>
<tr><td>Ida y vuelta a la nube</td><td>~100&ndash;250 ms</td></tr>
<tr><td>Borde (en la máquina o junto a ella)</td><td>&lt; 5 ms</td></tr>
</tbody>
</table>
<p>Ejecutar el modelo localmente también significa que <strong>los datos de proceso nunca salen de la fábrica</strong> &mdash; una ventaja decisiva para los fabricantes que no pueden arriesgarse a enviar datos sensibles de producción o propiedad intelectual a una nube externa &mdash; y el sistema sigue funcionando incluso sin conexión a internet.</p>
<h2>Cómo lo aborda Reylong</h2>
<p>La <a href="/es/products/ai-machine-intelligence-solutions">solución de Inteligencia de Máquina con IA</a> de Reylong integra computación en el borde e IoT industrial en las líneas de producción existentes, ofreciendo inspección de calidad por visión artificial en tiempo real, mantenimiento predictivo y optimización de procesos <strong>sin necesidad de conexión a la nube</strong>. Al diseñarse caso por caso para máquinas específicas, puede adaptarse a equipos que ya posee, sin reemplazar la máquina completa, convirtiendo una línea existente en una más inteligente y con autosupervisión.</p>
<h2>En conclusión</h2>
<p>La IA en el borde ya no es experimental en la planta; es una mejora medible del rendimiento, la disponibilidad y la calidad. La inspección por visión elimina defectos que hoy no puede ver, y el mantenimiento predictivo elimina paradas que hoy no puede predecir, ambos ejecutándose localmente, en tiempo real, en la línea que ya tiene.</p>
<p><em><a href="/contact">Hable con el equipo de ingeniería de Reylong</a> sobre cómo adaptar la visión por IA y el mantenimiento predictivo a su línea.</em></p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/water-based-inks-flexographic-printing-sustainable-packaging">Tintas al agua: el futuro sostenible de la impresión flexográfica de envases</a></li>
<li><a href="/es/news/fibc-jumbo-bag-production-trends">Tendencias de producción de FIBC (big bags) para 2026</a></li>
</ul>`

const article = {
  slug: SLUG,
  published_at: '2026-06-29',
  cover_image_url: COVER,
  title_en: 'Edge AI for Packaging Lines: Real-Time Vision Inspection and Predictive Maintenance',
  title_es: 'IA en el borde para líneas de envasado: inspección visual en tiempo real y mantenimiento predictivo',
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

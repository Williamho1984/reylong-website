// Enhance existing news article "eddy-current-separation-guide":
//  - replace generic hotlinked Unsplash cover with Reylong's own separator photo
//  - add 2 inline images (shredded-plastic feed + recovered copper)
//  - strengthen the "recover non-ferrous metal from shredded plastic" framing
// Preserves the original prose, title and published_at. SSR -> live immediately.
// Run: node scripts/update-eddy-article.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const SLUG = 'eddy-current-separation-guide'
const BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public'
const COVER = `${BASE}/product-media/eddy-current-non-ferrous-separator/cover-v2.jpg`
const IMG_FEED = `${BASE}/product-media/news/eddy-current/shredded-plastic-feed.jpeg`
const IMG_COPPER = `${BASE}/product-media/news/eddy-current/recovered-copper.jpeg`

const content_en = `<p><strong>Eddy current separation</strong> is an electromagnetic sorting technology that recovers non-ferrous metals &mdash; such as aluminum, copper, and brass &mdash; from mixed material streams. It is a core process in plastics recycling, electronic waste (e-waste) handling, and post-industrial material recovery.</p>
<p>It matters most <strong>after shredding</strong>. When scrap such as cables, electronic waste and end-of-life plastic products is shredded, valuable copper, aluminum and brass fragments end up mixed into the plastic. An eddy current separator is what pulls those non-ferrous metals back out &mdash; recovering the metal and cleaning the plastic in a single pass.</p>
<figure><img src="${IMG_FEED}" alt="Shredded mixed plastic fragments, the feed material that contains recoverable non-ferrous metal" /><figcaption>Shredded mixed plastic &mdash; the feed stream in which copper and aluminum fragments are trapped.</figcaption></figure>
<h2>How Does an Eddy Current Separator Work?</h2>
<p>The separator uses a rapidly rotating magnetic rotor inside a non-metallic conveyor drum. As conductive non-ferrous metal particles pass over the drum, the alternating magnetic field induces electrical currents &mdash; called eddy currents &mdash; within the metal. These eddy currents generate an opposing magnetic field that creates a repelling force, propelling the metal away from non-metallic materials like plastic, glass, or paper.</p>
<h2>What Materials Can Be Separated?</h2>
<ul>
<li><strong>Copper fragments and granules</strong> from cable and wire shredding lines</li>
<li><strong>Aluminum and copper bits</strong> liberated from shredded e-waste and mixed plastic scrap</li>
<li><strong>Brass fittings</strong> from demolition and scrap streams</li>
<li><strong>Aluminum caps and foil</strong> from plastic bottle recycling and packaging lines</li>
</ul>
<h2>Why Is Eddy Current Separation Important?</h2>
<p>Non-ferrous metals are valuable commodities. Recovering them from shredded plastic and mixed waste streams generates direct revenue while improving the purity of the downstream plastic recyclate &mdash; a double payback. For facilities processing post-consumer or post-industrial waste, an eddy current separator is typically one of the highest-return pieces of equipment on the line.</p>
<h2>Reylong Eddy Current Non-Ferrous Metal Separator Line</h2>
<p>Reylong manufactures a complete <a href="/products/eddy-current-non-ferrous-separator">Eddy Current Non-Ferrous Metal Separator Line</a> designed for integration into existing recycling and sorting plants. It recovers aluminum, copper and brass from shredded plastic, e-waste and mixed scrap, with adjustable rotor frequency for different particle sizes, a high-throughput belt design, and a compact footprint suitable for retrofitting into existing facilities (throughput depends on material type and fragment size).</p>
<p><a href="/contact">Contact our team</a> to discuss specifications and capacity requirements for your facility.</p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
<li><a href="/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">Edge AI for Packaging Lines: Real-Time Vision Inspection and Predictive Maintenance</a></li>
</ul>`

const content_es = `<p>La <strong>separación por corriente de Foucault</strong> es una tecnología de clasificación electromagnética que recupera metales no ferrosos &mdash;como aluminio, cobre y latón&mdash; de flujos de materiales mixtos. Es un proceso fundamental en el reciclaje de plásticos, la gestión de residuos electrónicos y la recuperación de materiales post-industriales.</p>
<p>Cobra especial importancia <strong>después de la trituración</strong>. Cuando se tritura chatarra como cables, residuos electrónicos y productos plásticos al final de su vida útil, valiosos fragmentos de cobre, aluminio y latón quedan mezclados en el plástico. El separador por corriente de Foucault es lo que extrae esos metales no ferrosos &mdash;recuperando el metal y limpiando el plástico en una sola pasada.</p>
<figure><img src="${IMG_FEED}" alt="Fragmentos de plástico triturado mezclado, el material de alimentación que contiene metal no ferroso recuperable" /><figcaption>Plástico triturado mezclado: el flujo de alimentación en el que quedan atrapados fragmentos de cobre y aluminio.</figcaption></figure>
<h2>¿Cómo funciona un separador por corriente de Foucault?</h2>
<p>El separador utiliza un rotor magnético de rotación rápida dentro de un tambor transportador no metálico. A medida que las partículas de metal no ferroso pasan sobre el tambor, el campo magnético alternante induce corrientes eléctricas &mdash;llamadas corrientes de Foucault&mdash; dentro del metal. Estas corrientes generan un campo magnético opuesto que crea una fuerza repulsiva, separando el metal de materiales no metálicos como plástico, vidrio o papel.</p>
<h2>¿Qué materiales se pueden separar?</h2>
<ul>
<li><strong>Fragmentos y gránulos de cobre</strong> de líneas de trituración de cables</li>
<li><strong>Trozos de aluminio y cobre</strong> liberados de residuos electrónicos triturados y chatarra plástica mixta</li>
<li><strong>Accesorios de latón</strong> de corrientes de demolición y chatarra</li>
<li><strong>Tapas y láminas de aluminio</strong> de líneas de reciclaje de botellas y envases de plástico</li>
</ul>
<h2>¿Por qué es importante?</h2>
<p>Los metales no ferrosos son materias primas valiosas. Recuperarlos del plástico triturado y de corrientes de residuos mixtos genera ingresos directos y mejora la pureza del reciclado de plástico aguas abajo &mdash;un doble beneficio. Un separador por corriente de Foucault suele ser uno de los equipos con mayor retorno de inversión en la línea.</p>
<h2>Línea separadora de Reylong</h2>
<p>Reylong fabrica una <a href="/products/eddy-current-non-ferrous-separator">línea separadora completa de metales no ferrosos</a> diseñada para integrarse en plantas de reciclaje existentes. Recupera aluminio, cobre y latón de plástico triturado, residuos electrónicos y chatarra mixta, con frecuencia de rotor ajustable para distintos tamaños de partícula y diseño de cinta de alta producción (la producción depende del tipo de material y del tamaño de los fragmentos).</p>
<p><a href="/contact">Contacte a nuestro equipo</a> para hablar sobre especificaciones y requisitos de capacidad.</p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico</a></li>
<li><a href="/es/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">IA en el borde para líneas de envasado: inspección visual en tiempo real y mantenimiento predictivo</a></li>
</ul>`

const { data, error } = await supabase.from('news')
  .update({ cover_image_url: COVER, content_en, content_es })
  .eq('slug', SLUG).select('slug')
if (error) { console.error('Update failed:', error.message); process.exit(1) }
console.log('OK updated ->', data?.[0]?.slug)

// Seed news article: "Non-Ferrous Metal Recycling Trends to Watch in 2026"
//
// Stats verified against primary sources (not secondary aggregators):
// - 62Mt e-waste (2022) -> 82Mt (2030), 22.3% recycled: ITU's Global E-waste Monitor 2024
//   report page (https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx)
// - USD 62 billion in unreclaimed resources (2022): ITU press release
// - EU CRMA 2030 targets (10% extraction / 40% processing / 25% recycling / 65% single-country
//   cap): European Commission single-market-economy.ec.europa.eu page
// JLECS-1000W specs (capacity, particle size) come from products table via
// scripts/seed-product-eddy-current-separator.mjs. Do not invent numbers beyond these.
//
// Idempotent. Run: node scripts/seed-news-non-ferrous-recycling-trends.mjs
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

const SLUG = 'non-ferrous-metal-recycling-trends-2026'
// NOT recovered-copper.jpeg: that shows intact stripped wire, but eddy current separation
// (and the JLECS-1000W's 5-200mm particle size spec) works on shredded/crushed fragments —
// an intact-wire photo would misrepresent the process. Use the product photo instead.
const COVER = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/eddy-current-non-ferrous-separator/cover-v2.jpg'

const faq = [
  {
    q_en: "What's driving the growth in non-ferrous metal recovery equipment in 2026?",
    a_en: "Two forces converging. E-waste volumes are rising much faster than recycling capacity — the UN's Global E-waste Monitor 2024 puts 2022 generation at 62 million tonnes, on track for 82 million tonnes by 2030, with only 22.3% formally recycled. At the same time, regulation increasingly treats recycled content as a requirement rather than a preference: the EU's Critical Raw Materials Act sets a 25% recycling target for critical raw materials by 2030. Both push processors toward equipment that recovers more metal per tonne of feedstock, not just equipment that processes more tonnes.",
    q_es: '¿Qué está impulsando el crecimiento del equipo de recuperación de metales no ferrosos en 2026?',
    a_es: 'Dos fuerzas que convergen. El volumen de residuos electrónicos crece mucho más rápido que la capacidad de reciclaje — el Monitor Mundial de Residuos Electrónicos 2024 de la ONU sitúa la generación de 2022 en 62 millones de toneladas, camino de los 82 millones para 2030, con solo un 22,3% reciclado de forma documentada. Al mismo tiempo, la regulación trata cada vez más el contenido reciclado como un requisito y no como una preferencia: la Ley de Materias Primas Críticas de la UE fija un objetivo de reciclaje del 25% para las materias primas críticas de aquí a 2030. Ambas fuerzas empujan a los procesadores hacia equipos que recuperan más metal por tonelada de material, no solo equipos que procesan más toneladas.',
  },
  {
    q_en: 'Why are recyclers retrofitting eddy current separation onto existing lines instead of building new plants?',
    a_en: "Capital efficiency. An eddy current separator line bolts onto an existing plastics recycling or e-waste line — it doesn't need a new building or a new facility permit, and it pays back quickly because it turns a contamination problem (metal fragments mixed into the plastic stream) into two separate revenue streams (clean plastic and recovered metal) almost immediately. That is a faster path to return than building new capacity from scratch, which is why compact, easily-integrated lines have become the more common purchase over stand-alone new plants.",
    q_es: '¿Por qué los recicladores reconvierten líneas existentes con separación por corriente de Foucault en lugar de construir plantas nuevas?',
    a_es: 'Eficiencia de capital. Una línea separadora por corriente de Foucault se añade a una línea existente de reciclaje de plástico o de residuos electrónicos: no necesita un edificio ni un permiso de instalación nuevos, y se amortiza rápido porque convierte un problema de contaminación (fragmentos de metal mezclados en el flujo de plástico) en dos flujos de ingresos independientes (plástico limpio y metal recuperado) casi de inmediato. Ese es un camino más rápido hacia el retorno que construir capacidad nueva desde cero, por lo que las líneas compactas y fáciles de integrar se han convertido en la compra más habitual frente a plantas nuevas independientes.',
  },
  {
    q_en: "What's the practical difference between magnetic separation and eddy current separation?",
    a_en: "Magnetic separation — a magnetic drum — removes ferrous metal (iron and steel) because it's attracted to a magnet. Eddy current separation removes non-ferrous metal (aluminum, copper, brass), which isn't magnetic at all; instead, a rapidly alternating magnetic field induces currents inside the metal that create a repelling force, physically flinging it away from the non-metallic stream. Because the two technologies target different metals, most modern separation lines run both stages in sequence — magnetic drum first to remove ferrous, eddy current roller second to recover non-ferrous — which is exactly how Reylong's JLECS-1000W is configured.",
    q_es: '¿Cuál es la diferencia práctica entre la separación magnética y la separación por corriente de Foucault?',
    a_es: 'La separación magnética — un tambor magnético — retira el metal ferroso (hierro y acero) porque es atraído por un imán. La separación por corriente de Foucault retira el metal no ferroso (aluminio, cobre, latón), que no es magnético en absoluto; en su lugar, un campo magnético que alterna rápidamente induce corrientes dentro del metal que generan una fuerza de repulsión, expulsándolo físicamente del flujo no metálico. Como las dos tecnologías apuntan a metales distintos, la mayoría de las líneas de separación modernas ejecutan ambas etapas en secuencia — primero el tambor magnético para retirar el ferroso, después el rodillo de corriente de Foucault para recuperar el no ferroso —, exactamente como está configurada la JLECS-1000W de Reylong.',
  },
]

const content_en = `<p>The world generated 62 million tonnes of e-waste in 2022 &mdash; and only 22.3% of it was formally collected and recycled. By 2030, that volume is projected to reach <a href="https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx">82 million tonnes, a 32% increase, according to the UN's Global E-waste Monitor 2024</a>. For recyclers and metal-recovery operators, that gap between what's generated and what's actually recovered is not a problem to manage &mdash; it's the market. A few clear trends are shaping how non-ferrous metal recovery equipment gets specified and bought going into 2026.</p>
<h2>1. E-waste volume is outpacing recycling capacity</h2>
<p>In 2022 alone, <a href="https://www.itu.int/hub/2024/04/the-world-generated-62-million-tonnes-of-electronic-waste-in-just-one-year-and-recycled-way-too-little-un-agencies-warn/">an estimated USD 62 billion worth of natural resources embedded in e-waste was trashed without being reclaimed</a>, according to the ITU. That represents copper, aluminum and other non-ferrous metal sitting in landfills and informal waste streams rather than coming back through a separation line. As generation keeps climbing faster than recycling infrastructure, the bottleneck is shifting from "not enough e-waste to process" to "not enough separation capacity to process it with."</p>
<h2>2. Regulation is turning recycled content from a preference into a requirement</h2>
<p>The <a href="https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials/critical-raw-materials-act_en">EU's Critical Raw Materials Act</a>, in force since May 2024, sets binding targets for 2030: at least 25% of the EU's annual consumption of critical raw materials must come from recycling, with no more than 65% sourced from any single non-EU country. Member states are required to improve collection of critical-raw-material-rich waste and invest in the recovery capacity to process it. For processors selling into or supplying EU markets, "we can recover more metal per tonne of feedstock" is moving from a cost-saving pitch to a compliance requirement.</p>
<h2>3. Multi-stage separation is becoming the baseline, not an upgrade</h2>
<p>As feedstock gets more complex &mdash; mixed e-waste, multi-material consumer plastics, shredded cable scrap &mdash; a single separation stage stops being enough to hit purity targets. Ferrous metal has to come out before non-ferrous metal can be recovered cleanly, which is why standalone magnetic drums are increasingly being specified alongside, or replaced by, integrated lines that combine ferrous removal and eddy current recovery in one continuous pass. Buyers are asking for a line, not a single machine.</p>
<h2>4. Retrofit over rebuild</h2>
<p>Adding metal-recovery capacity to an existing plastics recycling or shredding line is a much faster path to return than building new capacity from scratch &mdash; it converts an existing contamination problem (metal fragments mixed into a plastic stream) into two saleable outputs (clean plastic and recovered metal) without a new building or a new permit. That capital-efficiency logic is why compact, easily-integrated separator lines are increasingly the more common purchase over new stand-alone plants.</p>
<h2>How Reylong fits</h2>
<p>Reylong's <a href="/products/eddy-current-non-ferrous-separator">JLECS-1000W Eddy Current Non-Ferrous Metal Separator Line</a> is built around exactly this three-stage logic: a vibratory feeder for even material distribution, a high-intensity magnetic drum to pull out ferrous metal first, and an eddy current magnetic roller to recover non-ferrous metal &mdash; aluminum, copper, brass &mdash; from what's left. It handles particle sizes from 5&ndash;200 mm at up to 1,000 kg/h, with a compact footprint sized for retrofitting into an existing recycling or e-waste line rather than requiring a new facility.</p>
<p><a href="/contact/">Talk to Reylong's engineering team</a> about integrating non-ferrous metal recovery into your recycling line.</p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/eddy-current-separation-guide">What Is Eddy Current Separation? Recovering Non-Ferrous Metals from Recycling Lines</a></li>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
</ul>
<h2>Frequently asked questions</h2>
<h3>${faq[0].q_en}</h3>
<p>${faq[0].a_en}</p>
<h3>${faq[1].q_en}</h3>
<p>${faq[1].a_en}</p>
<h3>${faq[2].q_en}</h3>
<p>${faq[2].a_en}</p>`

const content_es = `<p>El mundo generó 62 millones de toneladas de residuos electrónicos en 2022 &mdash; y solo el 22,3% se recogió y recicló de forma documentada. Para 2030 se prevé que ese volumen alcance <a href="https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx">los 82 millones de toneladas, un aumento del 32%, según el Monitor Mundial de Residuos Electrónicos 2024 de la ONU</a>. Para los recicladores y operadores de recuperación de metales, esa brecha entre lo que se genera y lo que realmente se recupera no es un problema que gestionar: es el mercado. Varias tendencias claras están marcando cómo se especifica y se compra el equipo de recuperación de metales no ferrosos de cara a 2026.</p>
<h2>1. El volumen de residuos electrónicos supera la capacidad de reciclaje</h2>
<p>Solo en 2022, <a href="https://www.itu.int/hub/2024/04/the-world-generated-62-million-tonnes-of-electronic-waste-in-just-one-year-and-recycled-way-too-little-un-agencies-warn/">se estima que 62.000 millones de dólares en materias primas contenidas en residuos electrónicos se desecharon sin recuperar</a>, según la UIT. Eso representa cobre, aluminio y otros metales no ferrosos que terminan en vertederos o en flujos de residuos informales en lugar de volver a través de una línea de separación. A medida que la generación sigue creciendo más rápido que la infraestructura de reciclaje, el cuello de botella pasa de "no hay suficientes residuos electrónicos que procesar" a "no hay suficiente capacidad de separación para procesarlos".</p>
<h2>2. La regulación convierte el contenido reciclado de preferencia en requisito</h2>
<p>La <a href="https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials/critical-raw-materials-act_en">Ley de Materias Primas Críticas de la UE</a>, en vigor desde mayo de 2024, fija objetivos vinculantes para 2030: al menos el 25% del consumo anual de materias primas críticas de la UE debe proceder del reciclaje, sin superar el 65% procedente de un único país ajeno a la UE. Los estados miembros deben mejorar la recogida de residuos ricos en materias primas críticas e invertir en la capacidad de recuperación necesaria para procesarlos. Para los procesadores que venden o abastecen a mercados de la UE, "podemos recuperar más metal por tonelada de material" está dejando de ser un argumento de ahorro de costos para convertirse en un requisito de cumplimiento normativo.</p>
<h2>3. La separación multietapa se vuelve la norma, no una mejora opcional</h2>
<p>A medida que el material de entrada se vuelve más complejo &mdash; residuos electrónicos mixtos, plásticos de consumo multimaterial, chatarra de cable triturada &mdash; una sola etapa de separación deja de ser suficiente para alcanzar los objetivos de pureza. El metal ferroso debe retirarse antes de poder recuperar limpiamente el no ferroso, por lo que los tambores magnéticos independientes se están sustituyendo cada vez más, o complementando, con líneas integradas que combinan la eliminación de ferrosos y la recuperación por corriente de Foucault en un solo paso continuo. Los compradores piden una línea, no una máquina suelta.</p>
<h2>4. Reconvertir antes que construir de nuevo</h2>
<p>Añadir capacidad de recuperación de metales a una línea existente de reciclaje de plástico o trituración es un camino mucho más rápido hacia el retorno de la inversión que construir capacidad nueva desde cero: convierte un problema de contaminación existente (fragmentos de metal mezclados en el flujo de plástico) en dos productos vendibles (plástico limpio y metal recuperado) sin necesidad de un edificio ni un permiso nuevos. Esa lógica de eficiencia de capital explica por qué las líneas separadoras compactas y fáciles de integrar se están convirtiendo en la compra más habitual frente a plantas nuevas independientes.</p>
<h2>Cómo encaja Reylong</h2>
<p>La <a href="/es/products/eddy-current-non-ferrous-separator">línea separadora de metales no ferrosos por corriente de Foucault JLECS-1000W</a> de Reylong está construida precisamente sobre esta lógica de tres etapas: un alimentador vibratorio para una distribución uniforme del material, un tambor magnético de alta intensidad para retirar primero el metal ferroso y un rodillo magnético de corriente de Foucault para recuperar el metal no ferroso &mdash; aluminio, cobre, latón &mdash; del material restante. Procesa tamaños de partícula de 5 a 200 mm a hasta 1.000 kg/h, con un tamaño compacto pensado para reconvertir una línea de reciclaje o de residuos electrónicos existente en lugar de exigir una instalación nueva.</p>
<p><a href="/contact/">Hable con el equipo de ingeniería de Reylong</a> sobre cómo integrar la recuperación de metales no ferrosos en su línea de reciclaje.</p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/eddy-current-separation-guide">¿Qué es la separación por corriente de Foucault? Recuperación de metales no ferrosos en líneas de reciclaje</a></li>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico</a></li>
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
  published_at: '2026-07-22T09:00:00Z',
  cover_image_url: COVER,
  title_en: 'Non-Ferrous Metal Recycling Trends to Watch in 2026',
  title_es: 'Tendencias del reciclaje de metales no ferrosos para 2026',
  summary_en: 'E-waste is rising toward 82 million tonnes by 2030 while the EU mandates 25% recycled critical raw materials by 2030. Four trends reshaping non-ferrous metal recovery equipment in 2026, and why retrofit-ready, multi-stage separation lines are replacing single-machine setups.',
  summary_es: 'Los residuos electrónicos crecerán hasta 82 millones de toneladas en 2030 mientras la UE exige un 25% de materias primas críticas recicladas para 2030. Cuatro tendencias que redefinen el equipo de recuperación de metales no ferrosos en 2026.',
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

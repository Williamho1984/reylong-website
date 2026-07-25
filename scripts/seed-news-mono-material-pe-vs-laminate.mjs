// Seed news article: "Mono-Material PE vs. Laminated Film: Choosing a Structure for
// Stand-Up Pouches"
//
// Distinct from the existing scripts/seed-news-mono-material.mjs article: that one covers WHY
// mono-material matters and HOW the JL-L-2TZP600 solves the narrow heat-seal window; this one
// compares a SPECIFIC mono-material structure (MDOPE outer + LLDPE/specialty PE sealant inner)
// against conventional laminates across stiffness/clarity, barrier, processing and
// environmental trade-offs — a materials-selection comparison, not a heat-seal deep-dive.
// Cross-links both directions so neither article has to repeat the other's depth.
//
// MDOPE + LLDPE as a real, commercialized mono-material PE technology verified via WebSearch
// (Dow, Walki MDO-PE pouch, 2026-07-24) — not invented. Trade-offs (tension sensitivity,
// narrower heat-seal window, weaker O2/moisture barrier vs PET/foil) are standard materials-
// science facts already established in this product's own tech_article and the heat-seal guide.
// JL-L-2TZP600 specs (independent Panasonic servo tension control, 4-heating+2-cooling zones)
// come from products table via scripts/seed-product-stand-up-zipper-pouch-machine.mjs.
// PPWR framing corrected per European Commission's own page (applies mid-2026, recyclable by
// 2030) — same correction applied to seed-news-mono-material.mjs in this same session.
//
// Idempotent. Run: node scripts/seed-news-mono-material-pe-vs-laminate.mjs
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

const SLUG = 'mono-material-pe-vs-laminated-film-comparison'
const COVER = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/hp-l-2tzp600-stand-up-zipper-pouch-machine/cover.jpg'

const faq = [
  {
    q_en: 'What is MDOPE and why is it used for mono-material pouches?',
    a_en: "MDOPE is machine-direction-oriented polyethylene — PE film stretched during manufacture, which increases its stiffness, clarity and moisture-barrier performance well beyond what standard unoriented blown PE achieves. Paired with an LLDPE or metallocene PE sealant as the inner layer, it lets converters build an all-PE pouch that looks and stands up closer to a conventional laminate, while staying within a single polymer family so it can be mechanically recycled. Dow and Walki jointly commercialized an MDO-PE mono-material pouch on this basis in 2025, so this is an established technology, not an experimental one.",
    q_es: '¿Qué es el MDOPE y por qué se usa en bolsas monomaterial?',
    a_es: 'El MDOPE es polietileno orientado en dirección máquina — película de PE estirada durante la fabricación, lo que aumenta su rigidez, transparencia y barrera a la humedad muy por encima de lo que logra el PE soplado sin orientar. Combinado con un sellante de LLDPE o PE metalocénico como capa interior, permite a los conversores construir una bolsa 100% PE con un aspecto y una estabilidad más cercanos a un laminado convencional, manteniéndose dentro de una sola familia de polímeros para poder reciclarse mecánicamente. Dow y Walki comercializaron conjuntamente una bolsa monomaterial MDO-PE sobre esta base en 2025, así que es una tecnología establecida, no experimental.',
  },
  {
    q_en: 'Does mono-material PE perform as well as a PET/PE or foil laminate?',
    a_en: "Not on every property, and buyers should go in with that trade-off clear. Mono-material PE closes most of the stiffness and clarity gap with conventional laminates, but PET and foil laminates still outperform it on oxygen and moisture barrier for products that need long shelf life without an added barrier coating. It is a product-specific decision: mono-material PE wins on recyclability and is adequate for many dry or moderate-shelf-life products; high-barrier applications may still need a laminate or a barrier-coated mono-material variant.",
    q_es: '¿El PE monomaterial rinde igual que un laminado PET/PE o de aluminio?',
    a_es: 'No en todas las propiedades, y conviene tener claro ese compromiso de entrada. El PE monomaterial cierra la mayor parte de la brecha de rigidez y transparencia frente a los laminados convencionales, pero los laminados de PET y aluminio siguen superándolo en barrera al oxígeno y a la humedad para productos que necesitan una vida útil larga sin recubrimiento de barrera adicional. Es una decisión específica de cada producto: el PE monomaterial gana en reciclabilidad y es suficiente para muchos productos secos o de vida útil moderada; las aplicaciones de alta barrera pueden seguir necesitando un laminado o una variante monomaterial con recubrimiento de barrera.',
  },
  {
    q_en: 'Can the same machine run both mono-material PE and conventional laminate film?',
    a_en: "On the JL-L-2TZP600, yes, without a machine change. MDOPE behaves differently under tension than an unoriented laminate, so it needs tighter web-tension control — the machine's independent Panasonic servo motors hold a closed-loop tension setpoint on every axis. And because the two PE layers in a mono-material structure are chemically closer to each other than a PET/PE laminate's mismatched melting points, the heat-seal window narrows — the same 4-heating + 2-cooling zone seal bars that run retort-grade laminate give the temperature and cooling precision that requires. Switching a job between structures is a matter of changing process parameters at the touch screen.",
    q_es: '¿La misma máquina puede procesar PE monomaterial y película laminada convencional?',
    a_es: 'En la JL-L-2TZP600, sí, sin cambiar de máquina. El MDOPE se comporta de forma distinta bajo tensión que un laminado sin orientar, por lo que necesita un control de tensión de banda más estricto — los servomotores Panasonic independientes de la máquina mantienen un valor de consigna de tensión en lazo cerrado en cada eje. Y como las dos capas de PE de una estructura monomaterial son químicamente más parecidas entre sí que los puntos de fusión dispares de un laminado PET/PE, la ventana de sellado térmico se estrecha — las mismas mordazas de 4 grupos de calentamiento + 2 de enfriamiento que procesan el laminado de grado retorta ofrecen la precisión de temperatura y enfriamiento que eso exige. Cambiar un pedido de una estructura a otra es cuestión de cambiar los parámetros de proceso en la pantalla táctil.',
  },
]

const content_en = `<p>"Mono-material" is not one film. The most common commercial answer for a recyclable stand-up pouch is a structure built entirely from PE grades &mdash; typically MDOPE (machine-direction-oriented PE) as the outer layer with an LLDPE or specialty metallocene PE sealant inside &mdash; and it does not perform identically to the conventional laminates it is replacing. This is a property-by-property comparison for anyone deciding between the two.</p>
<h2>What the two structures are</h2>
<p>A conventional high-barrier laminate &mdash; NY/PE, PET/PE, AL/PE &mdash; combines different materials chosen for different jobs: PET or nylon for stiffness and print surface, foil or EVOH for barrier, PE for heat-seal. A mono-material PE structure replaces that stack with different grades of the same polymer. MDOPE gets its stiffness, clarity and moisture-barrier performance from being stretched during manufacture, closing most of the visual and mechanical gap with a laminate that standard unoriented blown PE film cannot close. The inner LLDPE or metallocene PE sealant layer is chosen purely for consistent, reliable heat-seal strength.</p>
<h2>Stiffness, clarity and shelf appeal</h2>
<p>This is where MDOPE mono-material earns its place: it stands up on shelf, holds a crisp print surface, and looks close to a laminate &mdash; not like a soft, hazy commodity PE bag. For brands whose whole reason for choosing a stand-up pouch is shelf presence, MDOPE is what makes an all-PE structure a real option rather than a downgrade.</p>
<h2>Barrier performance: the trade-off</h2>
<p>PET and foil laminates still win here. A foil layer or a PET/EVOH combination gives an oxygen and moisture barrier that a mono-material PE structure cannot fully match, which matters for products that need long shelf life without an added barrier coating. This is the honest limit of mono-material PE: it is not a strict upgrade, it is a different balance of properties, and the right choice depends on what is being packed and how long it needs to last on shelf.</p>
<h2>Processing: tension control and a narrower heat-seal window</h2>
<p>Two things change on the production line. First, because MDOPE gets its properties from orientation, it behaves differently under tension than an unoriented laminate &mdash; web tension has to be held more precisely to avoid stretching or necking the film as it runs through the machine. Second, because the two PE layers are chemically closer to each other than a PET/PE laminate's mismatched melting points, the heat-seal window narrows: the temperature that seals the film sits closer to the temperature that damages it. We cover that heat-seal physics in depth in <a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">our article on solving the mono-material heat-seal challenge</a> &mdash; the short version here is that it demands tighter tension and temperature control than laminate film needs.</p>
<h2>The environmental case</h2>
<p>This is mono-material PE's real advantage. Because both layers are the same polymer family, the finished pouch can go through existing PE recycling streams as a single material. A PET/PE or AL/PE laminate cannot &mdash; separating dissimilar polymers at end of life is not commercially viable at scale, so laminate pouches are recyclable in theory but rarely recycled in practice. The EU's Packaging and Packaging Waste Regulation begins general application in mid-2026 and requires all packaging placed on the EU market to be recyclable by 2030, which is turning that practical gap into a market-access question for brands exporting to Europe.</p>
<h2>How Reylong fits</h2>
<p>The <a href="/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> runs both structures without a machine change. Independent Panasonic servo motors hold web tension to a closed-loop setpoint on every axis &mdash; the precision MDOPE's orientation demands &mdash; and the same 4-heating + 2-cooling zone seal bars built for retort-grade laminate give the temperature and cooling control a narrower mono-material seal window needs. Moving a job from laminate to mono-material PE is a matter of process parameters at the touch screen, not new equipment.</p>
<p><a href="/contact/">Talk to Reylong's engineering team</a> about running mono-material PE or laminate film on the JL-L-2TZP600.</p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
<li><a href="/news/stand-up-pouch-flexible-packaging-trends-2026">Stand-Up Pouch and Flexible Packaging Trends to Watch in 2026</a></li>
<li><a href="/news/3-side-seal-vs-stand-up-zipper-pouch">Three-Side Seal vs Stand-Up Zipper Pouch: Choosing the Right Format</a></li>
</ul>
<h2>Frequently asked questions</h2>
<h3>${faq[0].q_en}</h3>
<p>${faq[0].a_en}</p>
<h3>${faq[1].q_en}</h3>
<p>${faq[1].a_en}</p>
<h3>${faq[2].q_en}</h3>
<p>${faq[2].a_en}</p>`

const content_es = `<p>"Monomaterial" no es una sola película. La respuesta comercial más habitual para una bolsa doypack reciclable es una estructura construida enteramente con grados de PE &mdash; normalmente MDOPE (PE orientado en dirección máquina) como capa exterior con un sellante de LLDPE o PE metalocénico especial en el interior &mdash;, y no rinde de forma idéntica a los laminados convencionales que sustituye. Esta es una comparación propiedad por propiedad para quien tenga que decidir entre ambas.</p>
<h2>Qué son las dos estructuras</h2>
<p>Un laminado de alta barrera convencional &mdash; NY/PE, PET/PE, AL/PE &mdash; combina materiales distintos elegidos para funciones distintas: PET o nylon para rigidez y superficie de impresión, aluminio o EVOH para barrera, PE para el sellado térmico. Una estructura monomaterial de PE sustituye ese conjunto por distintos grados del mismo polímero. El MDOPE obtiene su rigidez, transparencia y barrera a la humedad al estirarse durante la fabricación, cerrando la mayor parte de la brecha visual y mecánica con un laminado que la película de PE soplado sin orientar no puede cerrar. La capa interior de LLDPE o PE metalocénico se elige únicamente por su resistencia de sellado térmico constante y fiable.</p>
<h2>Rigidez, transparencia y presencia en anaquel</h2>
<p>Aquí es donde el PE monomaterial con MDOPE se gana su lugar: se sostiene de pie en el anaquel, mantiene una superficie de impresión nítida y se parece a un laminado, no a una bolsa de PE genérica, blanda y translúcida. Para marcas cuya razón principal para elegir un doypack es la presencia en anaquel, el MDOPE es lo que convierte una estructura 100% PE en una opción real y no en una rebaja.</p>
<h2>Rendimiento de barrera: el compromiso</h2>
<p>Aquí siguen ganando los laminados de PET y aluminio. Una capa de aluminio o una combinación PET/EVOH ofrece una barrera al oxígeno y a la humedad que una estructura monomaterial de PE no puede igualar del todo, algo que importa para productos que necesitan una vida útil larga sin recubrimiento de barrera adicional. Este es el límite honesto del PE monomaterial: no es una mejora estricta, es un equilibrio distinto de propiedades, y la elección correcta depende de qué se envase y cuánto tiempo debe durar en el anaquel.</p>
<h2>Procesamiento: control de tensión y una ventana de sellado más estrecha</h2>
<p>Dos cosas cambian en la línea de producción. Primero, como el MDOPE obtiene sus propiedades de la orientación, se comporta de forma distinta bajo tensión que un laminado sin orientar — la tensión de banda debe mantenerse con más precisión para evitar que la película se estire o se estreche al pasar por la máquina. Segundo, como las dos capas de PE son químicamente más parecidas entre sí que los puntos de fusión dispares de un laminado PET/PE, la ventana de sellado térmico se estrecha: la temperatura que sella la película está más cerca de la que la daña. Tratamos esa física del sellado en profundidad en <a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">nuestro artículo sobre cómo resolver el reto del sellado térmico monomaterial</a> — la versión corta aquí es que exige un control de tensión y temperatura más estricto que la película laminada.</p>
<h2>El argumento ambiental</h2>
<p>Esta es la verdadera ventaja del PE monomaterial. Como ambas capas son de la misma familia de polímeros, la bolsa terminada puede procesarse en las corrientes de reciclaje de PE existentes como un único material. Un laminado PET/PE o AL/PE no puede: separar polímeros distintos al final de su vida útil no es viable comercialmente a escala, así que las bolsas laminadas son reciclables en teoría pero rara vez se reciclan en la práctica. El Reglamento de Envases y Residuos de Envases de la UE comienza su aplicación general a mediados de 2026 y exige que todos los envases comercializados en la UE sean reciclables para 2030, lo que está convirtiendo esa brecha práctica en una cuestión de acceso al mercado para las marcas que exportan a Europa.</p>
<h2>Cómo encaja Reylong</h2>
<p>La <a href="/es/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> procesa ambas estructuras sin cambiar de máquina. Los servomotores Panasonic independientes mantienen la tensión de banda en un valor de consigna en lazo cerrado en cada eje — la precisión que exige la orientación del MDOPE — y las mismas mordazas de 4 grupos de calentamiento + 2 de enfriamiento construidas para el laminado de grado retorta ofrecen el control de temperatura y enfriamiento que exige una ventana de sellado monomaterial más estrecha. Pasar un pedido de laminado a PE monomaterial es cuestión de parámetros de proceso en la pantalla táctil, no de equipo nuevo.</p>
<p><a href="/contact/">Hable con el equipo de ingeniería de Reylong</a> sobre el procesamiento de PE monomaterial o película laminada en la JL-L-2TZP600.</p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico</a></li>
<li><a href="/es/news/stand-up-pouch-flexible-packaging-trends-2026">Tendencias de bolsas doypack y envases flexibles para 2026</a></li>
<li><a href="/es/news/3-side-seal-vs-stand-up-zipper-pouch">Bolsa de tres sellos frente a doypack con cierre: cómo elegir el formato</a></li>
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
  published_at: new Date().toISOString(),
  cover_image_url: COVER,
  title_en: 'Mono-Material PE vs. Laminated Film: Choosing a Structure for Stand-Up Pouches',
  title_es: 'PE monomaterial frente a película laminada: cómo elegir la estructura para bolsas doypack',
  summary_en: 'MDOPE outer layer plus an LLDPE sealant closes most of the stiffness and clarity gap with laminates, but not the barrier gap. A property-by-property comparison of mono-material PE against conventional laminates — stiffness, barrier, processing and recyclability — for stand-up pouch buyers.',
  summary_es: 'La capa exterior de MDOPE más un sellante de LLDPE cierra la mayor parte de la brecha de rigidez y transparencia frente a los laminados, pero no la de barrera. Comparación propiedad por propiedad del PE monomaterial frente a los laminados convencionales para compradores de bolsas doypack.',
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

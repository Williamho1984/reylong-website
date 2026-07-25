// Seed a news article: "Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge"
// Inserts/updates a row in the `news` table. News is SSR (read at request time),
// so the article appears live immediately — no redeploy. The sitemap (also SSR)
// auto-includes the new slug.
//
// Idempotent: updates if the slug already exists, otherwise inserts.
// Run: node scripts/seed-news-mono-material.mjs
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
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()]
    })
)

const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const SLUG = 'mono-material-recyclable-pouches-heat-seal-challenge'

const content_en = `<p>The flexible packaging industry is moving decisively toward <strong>mono-material</strong> structures &mdash; pouches built almost entirely from a single polymer family (all-PE or all-PP) so they can be recycled in existing streams. This is no longer optional. The EU's <strong>Packaging and Packaging Waste Regulation (PPWR)</strong> begins general application in <strong>mid-2026</strong> and requires all packaging placed on the EU market to be recyclable <strong>by 2030</strong>, with design-for-recycling criteria and recyclability grades phasing in over that period. From around 2029, recyclable mono-material pouches will also attract materially lower producer-responsibility fees than multi-layer laminates. For brands exporting to Europe, mono-material is becoming a <strong>market-access requirement</strong>, not just a sustainability preference.</p>
<figure><img src="https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/news/mono-material/recyclable-pouch.jpeg" alt="Recyclable kraft mono-material stand-up pouch" /><figcaption>A recyclable mono-material stand-up pouch &mdash; built from a single polymer family so it can be recycled as one material.</figcaption></figure>
<h2>What "mono-material" means</h2>
<p>A mono-material package is one where roughly 90% or more of the structure comes from a single polymer family. Conventional high-barrier laminates combine different materials &mdash; PET, nylon, aluminum foil, EVOH &mdash; each chosen for a specific job. A mono-material design replaces that stack with different grades of the <em>same</em> polymer, so the finished pouch recycles as one material instead of being discarded as a mixed laminate.</p>
<h2>The core production challenge: a narrower heat-seal window</h2>
<p>In a traditional laminate, the sealing layer and the structural layers are different materials with very different melting points, giving a wide temperature range in which the seal fuses while the outer layers stay intact. In a mono-material film, every layer belongs to the same polymer family, so the temperature that <em>seals</em> the film sits dangerously close to the temperature that <em>melts, distorts, or burns</em> it. The "heat-seal window" becomes much narrower: a few degrees too high shrinks, wrinkles, or burns through the film; a few degrees too low produces a seal that looks fine but leaks. As mono-material adoption accelerates, <strong>precise, stable, zoned temperature control becomes the single most important capability a pouch machine can have.</strong></p>
<h2>How Reylong addresses it</h2>
<p>The <a href="/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> multi-function pouch machine is engineered for exactly this narrow-window reality:</p>
<ul>
<li><strong>Zoned independent temperature control</strong> &mdash; up to 20 individually controlled heating zones, each applying a precise amount of heat to a specific coordinate of the bag (more to thick gusset corners, less to thin film), preventing burn-through while achieving full fusion.</li>
<li><strong>Closed-loop precision</strong> &mdash; PID controllers with solid-state relays feed temperature back about every two seconds, holding the film inside its narrow window at speeds up to 220 packages per minute (subject to material specification).</li>
<li><strong>Progressive multi-stage heating</strong> &mdash; heat builds gradually across 8&ndash;20 heating zones so energy penetrates thick areas without scorching thin layers.</li>
<li><strong>Constant-temperature water cooling</strong> &mdash; a circulating water-cooling system, precisely settable across a 15&ndash;20&nbsp;&deg;C range, solidifies the fused seal immediately, so freshly sealed mono-material film withstands servo tension without distorting.</li>
<li><strong>Ultrasonic zipper sealing</strong> &mdash; a plastic zipper has far greater thermal mass than 30&ndash;180&nbsp;&micro;m film, so the machine bonds it with ultrasonic energy generated only at the zipper-to-film interface, avoiding the external heat that would destroy a mono-material wall.</li>
</ul>
<h2>The bottom line</h2>
<p>Mono-material is the direction of travel for recyclable flexible packaging, and PPWR makes the timeline concrete. Barrier and material science keep improving, but on the converting side the deciding factor is <strong>temperature precision</strong>. Machines built around zoned control, closed-loop feedback and ultrasonic sealing let converters run today's narrow-window mono-material films &mdash; and the even narrower ones coming next &mdash; without sacrificing speed or seal integrity.</p>
<p><em><a href="/contact/">Talk to Reylong's engineering team</a> about running mono-material films on the JL-L-2TZP600.</em></p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/fibc-jumbo-bag-production-trends">FIBC (Jumbo Bag) Production Trends to Watch in 2026</a></li>
<li><a href="/news/water-based-inks-flexographic-printing-sustainable-packaging">Water-Based Inks: The Sustainable Future of Flexographic Packaging Printing</a></li>
</ul>`

const content_es = `<p>La industria del envase flexible avanza decididamente hacia las estructuras <strong>monomaterial</strong>: bolsas fabricadas casi en su totalidad con una sola familia de pol&iacute;meros (todo PE o todo PP) para que puedan reciclarse en los flujos existentes. Ya no es opcional. El <strong>Reglamento de Envases y Residuos de Envases (PPWR)</strong> de la UE comienza su aplicaci&oacute;n general a <strong>mediados de 2026</strong> y exige que todos los envases comercializados en la UE sean reciclables <strong>para 2030</strong>, con criterios de dise&ntilde;o para el reciclaje y grados de reciclabilidad que entrar&aacute;n en vigor progresivamente durante ese periodo. A partir de aproximadamente 2029, las bolsas monomaterial reciclables tambi&eacute;n tendr&aacute;n tarifas de responsabilidad del productor notablemente m&aacute;s bajas que los laminados multicapa. Para las marcas que exportan a Europa, el monomaterial se est&aacute; convirtiendo en un <strong>requisito de acceso al mercado</strong>, no solo en una preferencia de sostenibilidad.</p>
<figure><img src="https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/news/mono-material/recyclable-pouch.jpeg" alt="Bolsa stand-up monomaterial reciclable de aspecto kraft" /><figcaption>Una bolsa stand-up monomaterial reciclable: una sola familia de pol&iacute;meros, dise&ntilde;ada para reciclarse como un &uacute;nico material.</figcaption></figure>
<h2>Qu&eacute; significa "monomaterial"</h2>
<p>Un envase monomaterial es aquel en el que aproximadamente el 90% o m&aacute;s de la estructura proviene de una sola familia de pol&iacute;meros. Los laminados de alta barrera convencionales combinan distintos materiales &mdash; PET, nylon, aluminio, EVOH &mdash;, cada uno elegido para una funci&oacute;n espec&iacute;fica. Un dise&ntilde;o monomaterial sustituye esa estructura por distintos grados del <em>mismo</em> pol&iacute;mero, de modo que la bolsa terminada se recicla como un solo material en lugar de desecharse como un laminado mixto.</p>
<h2>El reto principal de producci&oacute;n: una ventana de sellado m&aacute;s estrecha</h2>
<p>En un laminado tradicional, la capa de sellado y las capas estructurales son materiales diferentes con puntos de fusi&oacute;n muy distintos, lo que ofrece un amplio rango de temperatura en el que el sellado funde mientras las capas exteriores permanecen intactas. En una pel&iacute;cula monomaterial, todas las capas pertenecen a la misma familia de pol&iacute;meros, por lo que la temperatura que <em>sella</em> la pel&iacute;cula est&aacute; peligrosamente cerca de la que la <em>funde, deforma o quema</em>. La "ventana de sellado t&eacute;rmico" se vuelve mucho m&aacute;s estrecha: unos grados de m&aacute;s encogen, arrugan o queman la pel&iacute;cula; unos grados de menos producen un sellado que parece correcto pero tiene fugas. A medida que se acelera la adopci&oacute;n del monomaterial, <strong>el control de temperatura preciso, estable y por zonas se convierte en la capacidad m&aacute;s importante de una m&aacute;quina de bolsas.</strong></p>
<h2>C&oacute;mo lo resuelve Reylong</h2>
<p>La m&aacute;quina multifunci&oacute;n <a href="/es/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> est&aacute; dise&ntilde;ada precisamente para esta realidad de ventana estrecha:</p>
<ul>
<li><strong>Control de temperatura independiente por zonas</strong>: hasta 20 zonas de calentamiento controladas individualmente, cada una aplicando una cantidad precisa de calor a una coordenada espec&iacute;fica de la bolsa (m&aacute;s en las esquinas gruesas de fuelle, menos en la pel&iacute;cula fina), evitando la perforaci&oacute;n por calor y logrando una fusi&oacute;n completa.</li>
<li><strong>Precisi&oacute;n en lazo cerrado</strong>: controladores PID con rel&eacute;s de estado s&oacute;lido retroalimentan la temperatura aproximadamente cada dos segundos, manteniendo la pel&iacute;cula dentro de su estrecha ventana a velocidades de hasta 220 bolsas por minuto (sujeto a las especificaciones del material).</li>
<li><strong>Calentamiento progresivo multietapa</strong>: el calor se acumula gradualmente en 8&ndash;20 zonas de calentamiento para que la energ&iacute;a penetre en las zonas gruesas sin quemar las capas finas.</li>
<li><strong>Refrigeraci&oacute;n por agua a temperatura constante</strong>: un sistema de refrigeraci&oacute;n por agua en circulaci&oacute;n, ajustable con precisi&oacute;n en un rango de 15&ndash;20&nbsp;&deg;C, solidifica el sellado fundido de inmediato, de modo que la pel&iacute;cula monomaterial reci&eacute;n sellada resiste la tensi&oacute;n del servomotor sin deformarse.</li>
<li><strong>Sellado de cierre por ultrasonidos</strong>: un cierre de pl&aacute;stico tiene una masa t&eacute;rmica mucho mayor que una pel&iacute;cula de 30&ndash;180&nbsp;&micro;m, por lo que la m&aacute;quina lo une con energ&iacute;a ultras&oacute;nica generada &uacute;nicamente en la interfaz cierre-pel&iacute;cula, evitando el calor externo que destruir&iacute;a una pared monomaterial.</li>
</ul>
<h2>En conclusi&oacute;n</h2>
<p>El monomaterial es el rumbo del envase flexible reciclable, y el PPWR concreta el calendario. La ciencia de barreras y materiales sigue mejorando, pero en el lado de la conversi&oacute;n el factor decisivo es la <strong>precisi&oacute;n de temperatura</strong>. Las m&aacute;quinas basadas en control por zonas, retroalimentaci&oacute;n en lazo cerrado y sellado por ultrasonidos permiten a los transformadores procesar las pel&iacute;culas monomaterial de ventana estrecha actuales &mdash; y las a&uacute;n m&aacute;s estrechas que vienen &mdash; sin sacrificar velocidad ni integridad del sellado.</p>
<p><em><a href="/contact/">Hable con el equipo de ingenier&iacute;a de Reylong</a> sobre el procesamiento de pel&iacute;culas monomaterial en la JL-L-2TZP600.</em></p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/fibc-jumbo-bag-production-trends">Tendencias de producci&oacute;n de FIBC (big bags) para 2026</a></li>
<li><a href="/es/news/water-based-inks-flexographic-printing-sustainable-packaging">Tintas al agua: el futuro sostenible de la impresi&oacute;n flexogr&aacute;fica de envases</a></li>
</ul>`

const article = {
  slug: SLUG,
  published_at: '2026-06-29',
  // Substantive correction (2026-07): the original text conflated PPWR's mid-2026 general
  // application date with the 2030 recyclability deadline, sourced from a secondary compliance
  // blog. Corrected against the European Commission's own PPWR page, which states application
  // "from mid-2026" and recyclability "by 2030" as two separate facts, not one immediate one.
  updated_at: new Date().toISOString(),
  cover_image_url: 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/hp-l-2tzp600-stand-up-zipper-pouch-machine/cover.jpg',
  title_en: 'Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge',
  title_es: 'Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico',
  content_en,
  content_es,
}

const { data: existing, error: selErr } = await supabase
  .from('news').select('id').eq('slug', SLUG).maybeSingle()
if (selErr) { console.error('Select failed:', selErr.message); process.exit(1) }

let res
if (existing) {
  res = await supabase.from('news').update(article).eq('slug', SLUG).select('slug')
} else {
  res = await supabase.from('news').insert({ id: randomUUID(), ...article }).select('slug')
}
if (res.error) { console.error('Write failed:', res.error.message); process.exit(1) }
console.log('OK', existing ? '(updated)' : '(inserted)', '->', res.data?.[0]?.slug)

// Seed news article: "Stand-Up Pouch and Flexible Packaging Trends to Watch in 2026"
//
// Stats verified against primary/direct sources (not secondary aggregators):
// - E-commerce flexible packaging market (USD 38.27B 2025 -> USD 41.52B 2026 -> USD 86.52B
//   2035, 8.5% CAGR, APAC fastest at 10.28% CAGR): fetched directly from
//   towardspackaging.com/insights/e-commerce-flexible-packaging-market-sizing
// - EU Packaging and Packaging Waste Regulation (EU) 2025/40 (applies from mid-2026, all
//   packaging must be recyclable by 2030): fetched directly from the official European
//   Commission page, environment.ec.europa.eu/.../packaging-packaging-waste-regulation_en.
//   NOTE: secondary compliance-blog sources claimed an "Aug 12 2026 = recyclable now" reading;
//   the EC's own page says application is "mid-2026" and recyclability is required "by 2030" —
//   went with the EC's own wording, not the blogs' compressed timeline.
// JL-L-2TZP600 specs (5 bag styles on one platform, speeds, ultrasonic zipper) come from
// products table via scripts/seed-product-stand-up-zipper-pouch-machine.mjs. Do not invent
// numbers beyond these.
//
// Idempotent. Run: node scripts/seed-news-pouch-flexible-packaging-trends.mjs
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

const SLUG = 'stand-up-pouch-flexible-packaging-trends-2026'
// Same product cover already used on the heat-seal diagnostic guide — real machine photo,
// no risk of misrepresenting the process the way a mismatched stock/reused photo would.
const COVER = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/hp-l-2tzp600-stand-up-zipper-pouch-machine/cover.jpg'

const faq = [
  {
    q_en: "What's driving stand-up pouch and flexible packaging demand in 2026?",
    a_en: "Two forces. E-commerce is the fastest-growing channel for flexible packaging — the e-commerce flexible packaging market is on track to grow from USD 41.52 billion in 2026 to USD 86.52 billion by 2035, an 8.5% CAGR, because pouches are lighter and cheaper to ship than rigid containers and hold up better in parcel transit. At the same time, brands keep converting from rigid bottles and tubs to flexible formats, including refill pouches, to cut material cost and shelf footprint. Both trends point buyers toward stand-up and zipper pouch formats specifically, not flexible packaging in general.",
    q_es: '¿Qué está impulsando la demanda de bolsas doypack y envases flexibles en 2026?',
    a_es: 'Dos fuerzas. El comercio electrónico es el canal de más rápido crecimiento para el envase flexible — se prevé que el mercado de envase flexible para e-commerce pase de 41.520 millones de dólares en 2026 a 86.520 millones en 2035, un CAGR del 8,5%, porque las bolsas pesan menos y cuestan menos de enviar que los envases rígidos y resisten mejor el tránsito en paquetería. Al mismo tiempo, las marcas siguen convirtiendo de botellas y tarrinas rígidas a formatos flexibles, incluidas las bolsas de recarga, para reducir el costo de material y el espacio en anaquel. Ambas tendencias apuntan a los compradores hacia los formatos doypack y con cierre específicamente, no al envase flexible en general.',
  },
  {
    q_en: "What does the EU's packaging recyclability deadline mean for flexible packaging buyers right now, in 2026?",
    a_en: "The compliance clock has started even though the hard deadline is years away. Regulation (EU) 2025/40 (the Packaging and Packaging Waste Regulation) begins general application in mid-2026, and it requires that all packaging placed on the EU market be recyclable by 2030. That is not a 2030 problem — packaging design and supplier qualification cycles run 18-36 months in this industry, so brands selling into the EU are already validating recyclable film structures and production capability now, in 2026, so they are not scrambling in 2029.",
    q_es: '¿Qué significa el plazo de reciclabilidad de envases de la UE para los compradores de envase flexible ahora mismo, en 2026?',
    a_es: 'El reloj del cumplimiento normativo ya empezó a correr, aunque el plazo definitivo esté a años vista. El Reglamento (UE) 2025/40 (Reglamento de Envases y Residuos de Envases) comienza su aplicación general a mediados de 2026 y exige que todo envase comercializado en la UE sea reciclable para 2030. No es un problema de 2030: los ciclos de diseño de envase y calificación de proveedores en este sector duran entre 18 y 36 meses, así que las marcas que venden a la UE ya están validando estructuras de film reciclables y capacidad de producción ahora, en 2026, para no verse en apuros en 2029.',
  },
  {
    q_en: 'Why are converters buying multi-format pouch machines instead of dedicated single-format lines?',
    a_en: "Capex flexibility. A dedicated line only makes one bag style, so if consumer demand shifts from three-side-seal to doypack, or a customer wants a zipper added, the converter either turns down the order or buys another machine. A multi-function platform that produces several bag styles — three-side seal, three-side seal with zipper, four-side seal, and doypack with or without zipper — on the same frame lets a converter follow demand between formats without new capital equipment. That flexibility matters more as e-commerce and rigid-to-flexible conversion keep shifting which format brands ask for.",
    q_es: '¿Por qué los conversores compran máquinas multiformato en lugar de líneas dedicadas a un solo formato?',
    a_es: 'Flexibilidad de capital. Una línea dedicada solo produce un estilo de bolsa, así que si la demanda del consumidor pasa de tres sellos a doypack, o un cliente pide añadir un cierre, el conversor rechaza el pedido o compra otra máquina. Una plataforma multifunción que produce varios estilos de bolsa —tres sellos, tres sellos con cierre, cuatro sellos y doypack con o sin cierre— sobre el mismo bastidor permite al conversor seguir la demanda entre formatos sin nuevo bien de capital. Esa flexibilidad importa más a medida que el comercio electrónico y la conversión de rígido a flexible siguen cambiando qué formato piden las marcas.',
  },
]

const content_en = `<p>The e-commerce flexible packaging market is on track to grow from <a href="https://www.towardspackaging.com/insights/e-commerce-flexible-packaging-market-sizing">USD 41.52 billion in 2026 to USD 86.52 billion by 2035</a>, an 8.5% CAGR, with Asia-Pacific growing fastest at 10.28%. That single number captures why bag-making equipment buyers are asking different questions than they were a few years ago: not just "how fast does it run," but "how many formats can it make, and is it ready for a 2030 EU recyclability deadline that starts applying in 2026." A few clear trends are shaping stand-up pouch and flexible packaging purchasing in 2026.</p>
<h2>1. E-commerce is now the fastest-growing demand driver</h2>
<p>Pouches are lighter and cheaper to ship than rigid bottles or tubs, and they hold up better in parcel transit &mdash; which is why e-commerce flexible packaging is growing faster than the flexible packaging market overall. That demand skews specifically toward stand-up and zipper formats: a pouch that stands on a shelf photo and reseals for repeat use sells better online than a flat pillow bag.</p>
<h2>2. Rigid-to-flexible conversion, including refills</h2>
<p>Brands keep moving products out of rigid bottles and tubs and into flexible formats to cut material cost and shelf footprint. Refill pouches for personal care and household products are a visible part of this shift &mdash; a rigid bottle is bought once and refilled from a pouch that uses a fraction of the plastic and ships far more efficiently. Every one of these conversions is a new candidate for a stand-up or zipper pouch format that did not exist as a market a few years ago.</p>
<h2>3. The EU recyclability clock has started, even though the deadline is 2030</h2>
<p><a href="https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste/packaging-packaging-waste-regulation_en">Regulation (EU) 2025/40, the Packaging and Packaging Waste Regulation</a>, begins general application in mid-2026 and requires that all packaging placed on the EU market be recyclable by 2030. Packaging design and supplier qualification cycles run 18&ndash;36 months in this industry, so 2030 is not a future problem for anyone selling into the EU &mdash; it is a 2026 qualification problem. Buyers are validating recyclable film structures and production capability now.</p>
<h2>4. Format flexibility is a purchasing requirement, not a nice-to-have</h2>
<p>A dedicated single-format line is a bet that today's bag style stays in demand. When it doesn't &mdash; a customer wants a zipper added, or demand shifts from three-side-seal to doypack &mdash; a single-format converter either turns down the order or buys another machine. That risk is pushing buyers toward multi-function platforms that can switch between bag styles on the same frame.</p>
<h2>How Reylong fits</h2>
<p>Reylong's <a href="/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> produces five bag styles on one platform &mdash; three-side seal, three-side seal with zipper, four-side seal, doypack, and doypack with zipper &mdash; at 35&ndash;220 pcs/min depending on style, with full-servo control at &le;0.3 mm positional accuracy and ultrasonic zipper sealing that avoids the heat damage a thermal zipper seal would cause. A converter running this line can follow a customer from a three-side-seal order to a zipper doypack without buying a second machine.</p>
<p><a href="/contact/">Talk to Reylong's engineering team</a> about a multi-format pouch line for your product mix.</p>
<h2>Related reading</h2>
<ul>
<li><a href="/news/3-side-seal-vs-stand-up-zipper-pouch">Three-Side Seal vs Stand-Up Zipper Pouch: Choosing the Right Format</a></li>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
<li><a href="/news/heat-seal-strength-failure-diagnosis">Heat Seal Failures in Pouch Production: A Diagnostic Guide</a></li>
</ul>
<h2>Frequently asked questions</h2>
<h3>${faq[0].q_en}</h3>
<p>${faq[0].a_en}</p>
<h3>${faq[1].q_en}</h3>
<p>${faq[1].a_en}</p>
<h3>${faq[2].q_en}</h3>
<p>${faq[2].a_en}</p>`

const content_es = `<p>Se prevé que el mercado de envase flexible para comercio electrónico crezca de <a href="https://www.towardspackaging.com/insights/e-commerce-flexible-packaging-market-sizing">41.520 millones de dólares en 2026 a 86.520 millones en 2035</a>, un CAGR del 8,5%, con Asia-Pacífico como la región de mayor crecimiento al 10,28%. Esa sola cifra explica por qué los compradores de maquinaria de fabricación de bolsas hacen preguntas distintas a las de hace unos años: ya no solo "¿a qué velocidad produce?", sino "¿cuántos formatos puede hacer, y está lista para un plazo de reciclabilidad de la UE de 2030 que empieza a aplicarse en 2026?". Varias tendencias claras están marcando la compra de bolsas doypack y envase flexible en 2026.</p>
<h2>1. El comercio electrónico es ahora el motor de demanda de más rápido crecimiento</h2>
<p>Las bolsas pesan menos y cuestan menos de enviar que las botellas o tarrinas rígidas, y resisten mejor el tránsito en paquetería &mdash; por eso el envase flexible para e-commerce crece más rápido que el mercado de envase flexible en general. Esa demanda se inclina específicamente hacia los formatos doypack y con cierre: una bolsa que se sostiene de pie en la foto de producto y se puede volver a cerrar para uso repetido se vende mejor en línea que una bolsa plana tipo almohada.</p>
<h2>2. Conversión de rígido a flexible, incluidas las recargas</h2>
<p>Las marcas siguen sacando productos de botellas y tarrinas rígidas hacia formatos flexibles para reducir el costo de material y el espacio en anaquel. Las bolsas de recarga para cuidado personal y productos del hogar son una parte visible de este cambio: una botella rígida se compra una vez y se rellena desde una bolsa que usa una fracción del plástico y se envía de forma mucho más eficiente. Cada una de estas conversiones es un nuevo candidato a formato doypack o con cierre que no existía como mercado hace unos años.</p>
<h2>3. El reloj de reciclabilidad de la UE ya corre, aunque el plazo sea 2030</h2>
<p>El <a href="https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste/packaging-packaging-waste-regulation_en">Reglamento (UE) 2025/40, de Envases y Residuos de Envases</a>, comienza su aplicación general a mediados de 2026 y exige que todo envase comercializado en la UE sea reciclable para 2030. Los ciclos de diseño de envase y calificación de proveedores en este sector duran entre 18 y 36 meses, así que 2030 no es un problema futuro para quien venda a la UE: es un problema de calificación de 2026. Los compradores ya están validando estructuras de film reciclables y capacidad de producción ahora.</p>
<h2>4. La flexibilidad de formato es un requisito de compra, no un plus</h2>
<p>Una línea dedicada a un solo formato es una apuesta a que el estilo de bolsa de hoy seguirá en demanda. Cuando no es así &mdash; un cliente pide añadir un cierre, o la demanda pasa de tres sellos a doypack &mdash; un conversor de formato único rechaza el pedido o compra otra máquina. Ese riesgo empuja a los compradores hacia plataformas multifunción que cambian de estilo de bolsa sobre el mismo bastidor.</p>
<h2>Cómo encaja Reylong</h2>
<p>La <a href="/es/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> de Reylong produce cinco estilos de bolsa en una sola plataforma &mdash; tres sellos, tres sellos con cierre, cuatro sellos, doypack y doypack con cierre &mdash; a 35&ndash;220 bolsas/min según el estilo, con control totalmente servo a una precisión posicional &le;0,3 mm y sellado de cierre por ultrasonidos que evita el daño térmico que causaría un sellado por calor. Un conversor que opera esta línea puede seguir a un cliente desde un pedido de tres sellos hasta un doypack con cierre sin comprar una segunda máquina.</p>
<p><a href="/contact/">Hable con el equipo de ingeniería de Reylong</a> sobre una línea de bolsas multiformato para su mezcla de productos.</p>
<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/3-side-seal-vs-stand-up-zipper-pouch">Bolsa de tres sellos frente a doypack con cierre: cómo elegir el formato</a></li>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: cómo resolver el reto del sellado térmico</a></li>
<li><a href="/es/news/heat-seal-strength-failure-diagnosis">Fallos de sellado térmico en la producción de bolsas: guía de diagnóstico</a></li>
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
  published_at: '2026-07-22T14:00:00Z',
  cover_image_url: COVER,
  title_en: 'Stand-Up Pouch and Flexible Packaging Trends to Watch in 2026',
  title_es: 'Tendencias de bolsas doypack y envases flexibles para 2026',
  summary_en: 'E-commerce flexible packaging is growing at 8.5% CAGR toward 2035, and the EU’s 2030 packaging recyclability deadline starts applying in mid-2026. Four trends reshaping stand-up pouch purchasing, and why multi-format machines are replacing dedicated single-format lines.',
  summary_es: 'El envase flexible para e-commerce crece a un CAGR del 8,5% hacia 2035, y el plazo de reciclabilidad de envases de la UE para 2030 empieza a aplicarse a mediados de 2026. Cuatro tendencias que redefinen la compra de bolsas doypack en 2026.',
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

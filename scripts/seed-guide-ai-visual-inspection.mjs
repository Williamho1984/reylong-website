// Seed the technical guide: "AI Visual Inspection on Woven Bag Lines: What It Catches — and What It Misses"
//
// FACT BOUNDARY (do not blur this when editing):
//   - The CNN vision model DETECTS defects and ALERTS the operator. That ships today.
//   - Closed-loop AI correction of print registration is NOT built. Never claim it.
//   - Eye-Mark / Dynamic Error Compensation corrects CUT AND SEAM length (±1 mm target vs ~±5 mm
//     practical drift on fixed-length cutting), not colour registration.
//   - Rey Long numbers come from the DB: 95%+ recall TARGET (application-dependent), few-shot
//     baseline from ~50 reference samples, 1 operator supervising up to 4 machines vs 2.
//   - Industry numbers and their sources: human inspectors miss 20–30% of defects (Sandia National
//     Laboratories research); attention degrades markedly after ~2 h of continuous visual work;
//     machine-vision industry publishes AI false-reject rates below 1% vs 10–20% for manual
//     inspection. Attribute them as written — do not upgrade them into Rey Long claims.
//
// The visible FAQ block at the end of the body mirrors the `faq` column exactly — Google requires
// FAQPage structured data to match content the reader can actually see on the page.
//
// Idempotent. Run: node scripts/seed-guide-ai-visual-inspection.mjs
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

const SLUG = 'ai-visual-inspection-woven-bag-printing'

const faq = [
  {
    q_en: 'What defects can AI vision detect on woven bags?',
    a_en: 'Three families. Printing defects: registration drift, ink skip, blur and smearing. Material defects: broken warp or weft filaments, weave holes and surface fuzz. Processing defects: skipped stitches, cut-point offset and uneven hems. The common thread is that all of these are visible, recurring faults — exactly the kind a camera watching every bag at line speed is good at, and exactly the kind a tired human eye starts missing two hours into a shift.',
    q_es: '¿Qué defectos puede detectar la visión por IA en sacos tejidos?',
    a_es: 'Tres familias. Defectos de impresión: desviación de registro, falta de tinta, borrosidad y manchado. Defectos de material: filamentos de urdimbre o trama rotos, agujeros en el tramado y pelusa superficial. Defectos de proceso: puntadas saltadas, desplazamiento del punto de corte y dobladillos irregulares. El hilo común es que todos son fallos visibles y recurrentes — exactamente el tipo de fallo que una cámara que observa cada saco a velocidad de línea detecta bien, y exactamente el que un ojo humano cansado empieza a pasar por alto a las dos horas de turno.',
  },
  {
    q_en: 'How many sample images does the AI model need before it works?',
    a_en: 'A working baseline can be built from as few as around 50 reference samples, because the model deploys few-shot: it learns what a good bag looks like from a small set of known-good examples plus whatever defect examples exist, rather than requiring the thousands of labelled images a conventionally trained model would. The exact number depends on the fabric, the print artwork and the defect classes that matter to you — a busy six-colour print needs more references than a plain bag with a two-colour logo.',
    q_es: '¿Cuántas imágenes de muestra necesita el modelo de IA antes de funcionar?',
    a_es: 'Una base funcional puede construirse a partir de unas 50 muestras de referencia, porque el modelo se implementa con pocas muestras (few-shot): aprende cómo es un saco correcto a partir de un conjunto pequeño de ejemplos buenos más los ejemplos de defectos disponibles, en lugar de requerir los miles de imágenes etiquetadas de un modelo entrenado convencionalmente. El número exacto depende del tejido, del arte de impresión y de las clases de defecto que le importen — una impresión compleja de seis colores necesita más referencias que un saco liso con un logotipo de dos colores.',
  },
  {
    q_en: 'Can AI inspection replace human quality control?',
    a_en: 'It repositions it rather than replacing it. Research at Sandia National Laboratories found human inspectors miss 20–30% of defects even under good conditions, and attention degrades markedly after about two hours of continuous visual work — so the camera takes over the task humans are demonstrably bad at: watching every bag, all shift, without fatigue. What stays human is judgement: setting the quality standard, deciding what to do when the system alerts, and the subjective calls a camera cannot make. In practice this shifts staffing rather than eliminating it — one operator can supervise up to four machines instead of two.',
    q_es: '¿Puede la inspección por IA sustituir al control de calidad humano?',
    a_es: 'Lo reposiciona más que sustituirlo. La investigación de Sandia National Laboratories halló que los inspectores humanos pasan por alto el 20–30% de los defectos incluso en buenas condiciones, y la atención se degrada notablemente tras unas dos horas de trabajo visual continuo — así que la cámara asume la tarea en la que los humanos son demostrablemente malos: vigilar cada saco, todo el turno, sin fatiga. Lo que sigue siendo humano es el criterio: fijar el estándar de calidad, decidir qué hacer cuando el sistema alerta y los juicios subjetivos que una cámara no puede hacer. En la práctica esto redistribuye el personal en lugar de eliminarlo — un operario puede supervisar hasta cuatro máquinas en lugar de dos.',
  },
  {
    q_en: 'Why is woven fabric harder to inspect with cameras than plastic film?',
    a_en: 'Because the fabric itself looks like noise. Classic rule-based vision works by flagging anything that deviates from a uniform background — and a woven substrate is never uniform: every tape crossing creates edges, shadows and local contrast that a threshold-based system reads as thousands of false defects. A CNN model handles this because it learns the weave texture as the normal background and flags deviations from it, which is why AI inspection became practical on woven PP years after it was routine on film.',
    q_es: '¿Por qué el tejido es más difícil de inspeccionar con cámaras que la película plástica?',
    a_es: 'Porque el propio tejido parece ruido. La visión clásica basada en reglas funciona señalando cualquier cosa que se desvíe de un fondo uniforme — y un sustrato tejido nunca es uniforme: cada cruce de cintas crea bordes, sombras y contraste local que un sistema de umbrales interpreta como miles de defectos falsos. Un modelo CNN lo maneja porque aprende la textura del tramado como fondo normal y señala las desviaciones respecto a ella; por eso la inspección por IA se volvió práctica en PP tejido años después de ser rutinaria en película.',
  },
  {
    q_en: 'Does the vision system need internet or cloud connectivity?',
    a_en: 'No. All inference runs on edge hardware installed at the machine — an industrial PC or embedded AI accelerator — with near-zero latency and full offline resilience. Integration with the machine happens over standard industrial protocols (OPC-UA, Modbus, MQTT), so the system works in factories with limited networks or strict data-security policies that keep production data on site.',
    q_es: '¿El sistema de visión necesita internet o conectividad a la nube?',
    a_es: 'No. Toda la inferencia se ejecuta en hardware edge instalado en la máquina — un PC industrial o un acelerador de IA embebido — con latencia casi nula y plena resiliencia sin conexión. La integración con la máquina se realiza mediante protocolos industriales estándar (OPC-UA, Modbus, MQTT), de modo que el sistema funciona en fábricas con redes limitadas o con políticas estrictas de seguridad que mantienen los datos de producción en planta.',
  },
]

const content_en = `<p>An AI vision system on a woven bag line reliably catches <strong>visible, recurring defects</strong> &mdash; registration drift, ink skip and blur in the print; broken filaments, weave holes and fuzz in the fabric; skipped stitches and cut-point offset in processing &mdash; at full line speed, with a defect recall target above 95%. What it does not do is correct those faults by itself, judge subjective colour quality the way a customer's eye does, or see defects the camera physically cannot see. This guide draws that line precisely, because the industry conversation around "AI inspection" rarely does.</p>

<h2>Why woven PP defeated machine vision for so long</h2>
<p>Classic machine vision is a rule engine: define a uniform background, flag anything that deviates. That works on cast film because film <em>is</em> uniform. A woven substrate is the opposite &mdash; thousands of tape crossings per square metre, each one an edge with its own shadow and local contrast. Point a threshold-based system at woven PP and it will flag the weave itself, everywhere, forever.</p>
<p>This is why inspection on woven bag lines stayed manual long after film printers had 100% web inspection as a checkbox option. The change is the model class: a convolutional neural network (CNN) does not compare pixels against a fixed reference &mdash; it learns the weave texture as the <em>normal</em> state, in the way an experienced inspector's eye does, and flags deviations from that learned normal. The texture that broke rule-based vision becomes background.</p>
<p>The practical consequence: modern systems deploy <strong>few-shot</strong>, building a working baseline from as few as around 50 reference samples of your actual fabric and artwork, rather than the thousands of labelled defect images conventional training required. On a product that changes SKU weekly, that difference decides whether the system is usable at all.</p>

<h2>The three defect families vision handles today</h2>
<p>Rey Long's <a href="/products/ai-machine-intelligence-solutions">AI-Powered Machine Intelligence</a> inspects for three families of faults, all at full line speed:</p>
<ul>
<li><strong>Printing defects</strong> &mdash; registration drift, ink skip, blur, smearing. On a line running 25&ndash;40 bags/min, a recurring print fault caught on the second bag instead of at end-of-shift is the difference between two scrap bags and a scrapped pallet.</li>
<li><strong>Material defects</strong> &mdash; broken warp or weft filaments, weave holes, surface fuzz. These arrive with the fabric roll; catching them at the machine means the fault is charged to the right process instead of surfacing as a customer claim.</li>
<li><strong>Processing defects</strong> &mdash; skipped stitches, cut-point offset, uneven hems. These are the machine's own faults, and they are the ones where an immediate alert prevents a drifting parameter from quietly producing an hour of rework.</li>
</ul>

<h2>What the accuracy numbers actually mean</h2>
<p>Two numbers matter, and they pull against each other. <strong>Recall</strong> is the share of real defects the system catches; Rey Long's deployment target is 95%+ recall, and the honest qualifier is that the achieved figure is application-dependent &mdash; it varies with fabric, artwork, lighting and which defect classes you care about, which is why it is established during commissioning on your product rather than quoted from a datasheet. <strong>Precision</strong> is the share of alerts that are real; its inverse is the false-reject rate. Figures published across the machine-vision industry put AI false-reject rates below 1%, against roughly 10&ndash;20% for manual inspection &mdash; and false rejects matter more than they sound, because an inspection system that cries wolf trains operators to ignore it, at which point its recall is irrelevant.</p>
<p>For comparison: research at Sandia National Laboratories found human inspectors miss 20&ndash;30% of defects even under good conditions, with attention degrading markedly after about two hours of continuous visual work. The camera's advantage is not superhuman perception on any single bag &mdash; it is that bag ten thousand gets the same inspection as bag one. We compare the two approaches in detail in <a href="/news/manual-vs-ai-inspection-woven-bag-lines">the manual-vs-AI guide</a>.</p>

<h2>The unglamorous part: cameras and light</h2>
<p>A vision system is an optical instrument first and a model second, and industry guidance is blunt on the ranking: lighting decides more inspection projects than camera resolution. Three realities on a woven bag line:</p>
<ul>
<li><strong>Continuous webs want line-scan cameras</strong> synchronised to an encoder, building a seamless image of the moving web instead of stitching overlapping snapshots.</li>
<li><strong>Laminated fabric is glossy.</strong> BOPP lamination turns the surface into a partial mirror; light geometry (and where needed, polarisation) has to be engineered so the camera sees the print, not the reflection of the factory ceiling.</li>
<li><strong>The weave has depth.</strong> Low-angle light that makes a broken filament cast a visible shadow is the difference between detecting it and not &mdash; no model recovers information the optics never captured.</li>
</ul>

<h2>What AI inspection does not do</h2>
<p>Three limits, stated plainly.</p>
<p><strong>It does not fix the fault.</strong> The vision system detects and alerts; the correction loop for print registration &mdash; vision driving the servos to null out colour misalignment without an operator &mdash; is a direction the industry is moving in and one Rey Long is exploring, but it is not a deployed capability, and we will not describe an intention as a product. The vision-to-servo closed loop Rey Long does run today is <strong>Dynamic Error Compensation</strong>, which reads the Eye-Mark and corrects <em>cut and seam length</em> toward a ±1 mm target, against roughly ±5 mm of practical drift on fixed-length cutting. That is a length loop, not a colour loop &mdash; the distinction is spelled out in <a href="/news/print-registration-drift-pp-woven-fabric">the registration guide</a>.</p>
<p><strong>It does not judge colour like a customer.</strong> The model flags deviations from the reference &mdash; a drifting registration, a missing colour. Whether a slightly denser red is still acceptable brand red is a colorimetry question (and ultimately a human one); a vision system is not a spectrophotometer.</p>
<p><strong>It does not see what the camera cannot see.</strong> A fold hiding a stain, the inside of a tubed web, a defect on the back of the fabric when only the front is instrumented &mdash; coverage is defined by camera placement, decided at system design. This is why the assessment phase of a deployment starts from your defect history, not from the hardware catalogue.</p>

<h2>The short version</h2>
<p>AI vision earns its place on a woven bag line by doing one thing relentlessly: watching every bag at line speed for the visible, recurring faults that drain margin &mdash; and alerting a human while the count is still two, not two thousand. It deploys few-shot from ~50 samples, runs on edge hardware with no cloud dependency, and retrofits onto existing lines &mdash; <a href="/news/retrofit-edge-ai-inspection-woven-bag-line">the retrofit guide</a> covers what that involves. What it is not is a closed-loop colour corrector or a replacement for human judgement &mdash; and a vendor who claims otherwise is describing an ambition, not a shipping system.</p>
<p><em><a href="/contact">Talk to Rey Long's engineering team</a> about inspection on your fabric, artwork and defect history.</em></p>

<h2>Frequently asked questions</h2>
<h3>What defects can AI vision detect on woven bags?</h3>
<p>Three families. Printing defects: registration drift, ink skip, blur and smearing. Material defects: broken warp or weft filaments, weave holes and surface fuzz. Processing defects: skipped stitches, cut-point offset and uneven hems. The common thread is that all of these are visible, recurring faults &mdash; exactly the kind a camera watching every bag at line speed is good at, and exactly the kind a tired human eye starts missing two hours into a shift.</p>
<h3>How many sample images does the AI model need before it works?</h3>
<p>A working baseline can be built from as few as around 50 reference samples, because the model deploys few-shot: it learns what a good bag looks like from a small set of known-good examples plus whatever defect examples exist, rather than requiring the thousands of labelled images a conventionally trained model would. The exact number depends on the fabric, the print artwork and the defect classes that matter to you &mdash; a busy six-colour print needs more references than a plain bag with a two-colour logo.</p>
<h3>Can AI inspection replace human quality control?</h3>
<p>It repositions it rather than replacing it. Research at Sandia National Laboratories found human inspectors miss 20&ndash;30% of defects even under good conditions, and attention degrades markedly after about two hours of continuous visual work &mdash; so the camera takes over the task humans are demonstrably bad at: watching every bag, all shift, without fatigue. What stays human is judgement: setting the quality standard, deciding what to do when the system alerts, and the subjective calls a camera cannot make. In practice this shifts staffing rather than eliminating it &mdash; one operator can supervise up to four machines instead of two.</p>
<h3>Why is woven fabric harder to inspect with cameras than plastic film?</h3>
<p>Because the fabric itself looks like noise. Classic rule-based vision works by flagging anything that deviates from a uniform background &mdash; and a woven substrate is never uniform: every tape crossing creates edges, shadows and local contrast that a threshold-based system reads as thousands of false defects. A CNN model handles this because it learns the weave texture as the normal background and flags deviations from it, which is why AI inspection became practical on woven PP years after it was routine on film.</p>
<h3>Does the vision system need internet or cloud connectivity?</h3>
<p>No. All inference runs on edge hardware installed at the machine &mdash; an industrial PC or embedded AI accelerator &mdash; with near-zero latency and full offline resilience. Integration with the machine happens over standard industrial protocols (OPC-UA, Modbus, MQTT), so the system works in factories with limited networks or strict data-security policies that keep production data on site.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/manual-vs-ai-inspection-woven-bag-lines">Manual vs AI Inspection on Woven Bag Lines: An Honest Comparison</a></li>
<li><a href="/news/retrofit-edge-ai-inspection-woven-bag-line">Retrofitting Edge AI Inspection onto an Existing Bag Line</a></li>
<li><a href="/news/print-registration-drift-pp-woven-fabric">Print Registration Drift on PP Woven Fabric: A Diagnostic Guide</a></li>
</ul>`

const content_es = `<p>Un sistema de visi&oacute;n por IA en una l&iacute;nea de sacos tejidos detecta de forma fiable los <strong>defectos visibles y recurrentes</strong> &mdash; desviaci&oacute;n de registro, falta de tinta y borrosidad en la impresi&oacute;n; filamentos rotos, agujeros del tramado y pelusa en el tejido; puntadas saltadas y desplazamiento del punto de corte en el proceso &mdash; a plena velocidad de l&iacute;nea, con un objetivo de detecci&oacute;n de defectos superior al 95%. Lo que no hace es corregir esos fallos por s&iacute; mismo, juzgar la calidad subjetiva del color como lo hace el ojo de un cliente, ni ver defectos que la c&aacute;mara f&iacute;sicamente no puede ver. Esta gu&iacute;a traza esa l&iacute;nea con precisi&oacute;n, porque el discurso del sector sobre la "inspecci&oacute;n por IA" rara vez lo hace.</p>

<h2>Por qu&eacute; el PP tejido derrot&oacute; a la visi&oacute;n artificial durante tanto tiempo</h2>
<p>La visi&oacute;n artificial cl&aacute;sica es un motor de reglas: definir un fondo uniforme y se&ntilde;alar cualquier desviaci&oacute;n. Eso funciona en pel&iacute;cula porque la pel&iacute;cula <em>es</em> uniforme. Un sustrato tejido es lo contrario &mdash; miles de cruces de cinta por metro cuadrado, cada uno un borde con su propia sombra y contraste local. Apunte un sistema de umbrales a PP tejido y se&ntilde;alar&aacute; el propio tramado, en todas partes, para siempre.</p>
<p>Por eso la inspecci&oacute;n en l&iacute;neas de sacos tejidos sigui&oacute; siendo manual mucho despu&eacute;s de que las impresoras de pel&iacute;cula ofrecieran la inspecci&oacute;n 100% de banda como opci&oacute;n de cat&aacute;logo. El cambio est&aacute; en la clase de modelo: una red neuronal convolucional (CNN) no compara p&iacute;xeles contra una referencia fija &mdash; aprende la textura del tramado como el estado <em>normal</em>, como lo hace el ojo de un inspector experimentado, y se&ntilde;ala las desviaciones respecto a esa normalidad aprendida. La textura que romp&iacute;a la visi&oacute;n basada en reglas se convierte en fondo.</p>
<p>La consecuencia pr&aacute;ctica: los sistemas modernos se implementan con <strong>pocas muestras</strong> (few-shot), construyendo una base funcional a partir de unas 50 muestras de referencia de su tejido y su arte real, en lugar de las miles de im&aacute;genes de defectos etiquetadas que exig&iacute;a el entrenamiento convencional. En un producto que cambia de referencia cada semana, esa diferencia decide si el sistema es utilizable o no.</p>

<h2>Las tres familias de defectos que la visi&oacute;n maneja hoy</h2>
<p>La <a href="/es/products/ai-machine-intelligence-solutions">Inteligencia de M&aacute;quina de Rey Long</a> inspecciona tres familias de fallos, todas a plena velocidad de l&iacute;nea:</p>
<ul>
<li><strong>Defectos de impresi&oacute;n</strong> &mdash; desviaci&oacute;n de registro, falta de tinta, borrosidad, manchado. En una l&iacute;nea a 25&ndash;40 sacos/min, un fallo de impresi&oacute;n recurrente detectado en el segundo saco en lugar de al final del turno es la diferencia entre dos sacos de desperdicio y un palet desechado.</li>
<li><strong>Defectos de material</strong> &mdash; filamentos de urdimbre o trama rotos, agujeros del tramado, pelusa superficial. Llegan con la bobina de tejido; detectarlos en la m&aacute;quina significa cargar el fallo al proceso correcto en lugar de que aflore como una reclamaci&oacute;n del cliente.</li>
<li><strong>Defectos de proceso</strong> &mdash; puntadas saltadas, desplazamiento del punto de corte, dobladillos irregulares. Son los fallos propios de la m&aacute;quina, y son aquellos en los que una alerta inmediata evita que un par&aacute;metro a la deriva produzca en silencio una hora de retrabajo.</li>
</ul>

<h2>Qu&eacute; significan realmente las cifras de precisi&oacute;n</h2>
<p>Importan dos n&uacute;meros, y tiran en direcciones opuestas. La <strong>exhaustividad</strong> (recall) es la proporci&oacute;n de defectos reales que el sistema detecta; el objetivo de implementaci&oacute;n de Rey Long es superar el 95%, y el matiz honesto es que la cifra alcanzada depende de la aplicaci&oacute;n &mdash; var&iacute;a con el tejido, el arte, la iluminaci&oacute;n y las clases de defecto que le importen, y por eso se establece durante la puesta en marcha sobre su producto y no se cita de una ficha t&eacute;cnica. La <strong>precisi&oacute;n</strong> es la proporci&oacute;n de alertas que son reales; su inversa es la tasa de rechazos falsos. Las cifras publicadas en el sector de la visi&oacute;n artificial sit&uacute;an los rechazos falsos de la IA por debajo del 1%, frente a un 10&ndash;20% aproximado de la inspecci&oacute;n manual &mdash; y los rechazos falsos importan m&aacute;s de lo que parece, porque un sistema de inspecci&oacute;n que grita "lobo" entrena a los operarios a ignorarlo, y en ese punto su exhaustividad es irrelevante.</p>
<p>Como comparaci&oacute;n: la investigaci&oacute;n de Sandia National Laboratories hall&oacute; que los inspectores humanos pasan por alto el 20&ndash;30% de los defectos incluso en buenas condiciones, con una atenci&oacute;n que se degrada notablemente tras unas dos horas de trabajo visual continuo. La ventaja de la c&aacute;mara no es una percepci&oacute;n sobrehumana en un saco concreto &mdash; es que el saco diez mil recibe la misma inspecci&oacute;n que el saco uno. Comparamos ambos enfoques en detalle en <a href="/es/news/manual-vs-ai-inspection-woven-bag-lines">la gu&iacute;a manual vs IA</a>.</p>

<h2>La parte sin glamur: c&aacute;maras y luz</h2>
<p>Un sistema de visi&oacute;n es primero un instrumento &oacute;ptico y despu&eacute;s un modelo, y la gu&iacute;a del sector es tajante con el orden: la iluminaci&oacute;n decide m&aacute;s proyectos de inspecci&oacute;n que la resoluci&oacute;n de la c&aacute;mara. Tres realidades en una l&iacute;nea de sacos tejidos:</p>
<ul>
<li><strong>Las bandas continuas piden c&aacute;maras line-scan</strong> sincronizadas con un encoder, construyendo una imagen continua de la banda en movimiento en lugar de coser instant&aacute;neas solapadas.</li>
<li><strong>El tejido laminado brilla.</strong> La laminaci&oacute;n BOPP convierte la superficie en un espejo parcial; la geometr&iacute;a de la luz (y donde haga falta, la polarizaci&oacute;n) debe dise&ntilde;arse para que la c&aacute;mara vea la impresi&oacute;n y no el reflejo del techo de la nave.</li>
<li><strong>El tramado tiene profundidad.</strong> Una luz rasante que haga que un filamento roto proyecte una sombra visible es la diferencia entre detectarlo o no &mdash; ning&uacute;n modelo recupera informaci&oacute;n que la &oacute;ptica nunca captur&oacute;.</li>
</ul>

<h2>Lo que la inspecci&oacute;n por IA no hace</h2>
<p>Tres l&iacute;mites, dichos con claridad.</p>
<p><strong>No corrige el fallo.</strong> El sistema de visi&oacute;n detecta y alerta; el lazo de correcci&oacute;n del registro de impresi&oacute;n &mdash; la visi&oacute;n accionando los servos para anular la desalineaci&oacute;n de color sin operario &mdash; es una direcci&oacute;n hacia la que avanza el sector y que Rey Long est&aacute; explorando, pero no es una capacidad desplegada, y no describiremos una intenci&oacute;n como si fuera un producto. El lazo cerrado visi&oacute;n-servo que Rey Long s&iacute; opera hoy es la <strong>Compensaci&oacute;n Din&aacute;mica de Errores</strong>, que lee la marca Eye-Mark y corrige la <em>longitud de corte y costura</em> hacia un objetivo de ±1 mm, frente a los aproximadamente ±5 mm de deriva pr&aacute;ctica del corte de longitud fija. Es un lazo de longitud, no de color &mdash; la distinci&oacute;n se explica en <a href="/es/news/print-registration-drift-pp-woven-fabric">la gu&iacute;a de registro</a>.</p>
<p><strong>No juzga el color como un cliente.</strong> El modelo se&ntilde;ala desviaciones respecto a la referencia &mdash; un registro a la deriva, un color ausente. Si un rojo ligeramente m&aacute;s denso sigue siendo un rojo de marca aceptable es una cuesti&oacute;n de colorimetr&iacute;a (y en &uacute;ltima instancia humana); un sistema de visi&oacute;n no es un espectrofot&oacute;metro.</p>
<p><strong>No ve lo que la c&aacute;mara no puede ver.</strong> Un pliegue que oculta una mancha, el interior de una banda tubular, un defecto en el dorso del tejido cuando solo el frente est&aacute; instrumentado &mdash; la cobertura la define la colocaci&oacute;n de las c&aacute;maras, decidida en el dise&ntilde;o del sistema. Por eso la fase de evaluaci&oacute;n de una implementaci&oacute;n parte de su historial de defectos, no del cat&aacute;logo de hardware.</p>

<h2>En resumen</h2>
<p>La visi&oacute;n por IA se gana su lugar en una l&iacute;nea de sacos tejidos haciendo una cosa sin descanso: vigilar cada saco a velocidad de l&iacute;nea en busca de los fallos visibles y recurrentes que drenan el margen &mdash; y alertar a un humano cuando la cuenta a&uacute;n va por dos, no por dos mil. Se implementa con pocas muestras (~50), se ejecuta en hardware edge sin dependencia de la nube y se instala sobre l&iacute;neas existentes &mdash; <a href="/es/news/retrofit-edge-ai-inspection-woven-bag-line">la gu&iacute;a de retrofit</a> explica lo que eso implica. Lo que no es: un corrector de color en lazo cerrado ni un sustituto del criterio humano &mdash; y un proveedor que afirme lo contrario est&aacute; describiendo una ambici&oacute;n, no un sistema en producci&oacute;n.</p>
<p><em><a href="/es/contact">Hable con el equipo de ingenier&iacute;a de Rey Long</a> sobre la inspecci&oacute;n de su tejido, su arte y su historial de defectos.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Qu&eacute; defectos puede detectar la visi&oacute;n por IA en sacos tejidos?</h3>
<p>Tres familias. Defectos de impresi&oacute;n: desviaci&oacute;n de registro, falta de tinta, borrosidad y manchado. Defectos de material: filamentos de urdimbre o trama rotos, agujeros en el tramado y pelusa superficial. Defectos de proceso: puntadas saltadas, desplazamiento del punto de corte y dobladillos irregulares. El hilo com&uacute;n es que todos son fallos visibles y recurrentes &mdash; exactamente el tipo de fallo que una c&aacute;mara que observa cada saco a velocidad de l&iacute;nea detecta bien, y exactamente el que un ojo humano cansado empieza a pasar por alto a las dos horas de turno.</p>
<h3>&iquest;Cu&aacute;ntas im&aacute;genes de muestra necesita el modelo de IA antes de funcionar?</h3>
<p>Una base funcional puede construirse a partir de unas 50 muestras de referencia, porque el modelo se implementa con pocas muestras (few-shot): aprende c&oacute;mo es un saco correcto a partir de un conjunto peque&ntilde;o de ejemplos buenos m&aacute;s los ejemplos de defectos disponibles, en lugar de requerir las miles de im&aacute;genes etiquetadas de un modelo entrenado convencionalmente. El n&uacute;mero exacto depende del tejido, del arte de impresi&oacute;n y de las clases de defecto que le importen &mdash; una impresi&oacute;n compleja de seis colores necesita m&aacute;s referencias que un saco liso con un logotipo de dos colores.</p>
<h3>&iquest;Puede la inspecci&oacute;n por IA sustituir al control de calidad humano?</h3>
<p>Lo reposiciona m&aacute;s que sustituirlo. La investigaci&oacute;n de Sandia National Laboratories hall&oacute; que los inspectores humanos pasan por alto el 20&ndash;30% de los defectos incluso en buenas condiciones, y la atenci&oacute;n se degrada notablemente tras unas dos horas de trabajo visual continuo &mdash; as&iacute; que la c&aacute;mara asume la tarea en la que los humanos son demostrablemente malos: vigilar cada saco, todo el turno, sin fatiga. Lo que sigue siendo humano es el criterio: fijar el est&aacute;ndar de calidad, decidir qu&eacute; hacer cuando el sistema alerta y los juicios subjetivos que una c&aacute;mara no puede hacer. En la pr&aacute;ctica esto redistribuye el personal en lugar de eliminarlo &mdash; un operario puede supervisar hasta cuatro m&aacute;quinas en lugar de dos.</p>
<h3>&iquest;Por qu&eacute; el tejido es m&aacute;s dif&iacute;cil de inspeccionar con c&aacute;maras que la pel&iacute;cula pl&aacute;stica?</h3>
<p>Porque el propio tejido parece ruido. La visi&oacute;n cl&aacute;sica basada en reglas funciona se&ntilde;alando cualquier cosa que se desv&iacute;e de un fondo uniforme &mdash; y un sustrato tejido nunca es uniforme: cada cruce de cintas crea bordes, sombras y contraste local que un sistema de umbrales interpreta como miles de defectos falsos. Un modelo CNN lo maneja porque aprende la textura del tramado como fondo normal y se&ntilde;ala las desviaciones respecto a ella; por eso la inspecci&oacute;n por IA se volvi&oacute; pr&aacute;ctica en PP tejido a&ntilde;os despu&eacute;s de ser rutinaria en pel&iacute;cula.</p>
<h3>&iquest;El sistema de visi&oacute;n necesita internet o conectividad a la nube?</h3>
<p>No. Toda la inferencia se ejecuta en hardware edge instalado en la m&aacute;quina &mdash; un PC industrial o un acelerador de IA embebido &mdash; con latencia casi nula y plena resiliencia sin conexi&oacute;n. La integraci&oacute;n con la m&aacute;quina se realiza mediante protocolos industriales est&aacute;ndar (OPC-UA, Modbus, MQTT), de modo que el sistema funciona en f&aacute;bricas con redes limitadas o con pol&iacute;ticas estrictas de seguridad que mantienen los datos de producci&oacute;n en planta.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/manual-vs-ai-inspection-woven-bag-lines">Inspecci&oacute;n manual vs IA en l&iacute;neas de sacos tejidos: una comparaci&oacute;n honesta</a></li>
<li><a href="/es/news/retrofit-edge-ai-inspection-woven-bag-line">Instalar inspecci&oacute;n edge AI en una l&iacute;nea de sacos existente</a></li>
<li><a href="/es/news/print-registration-drift-pp-woven-fabric">Desviaci&oacute;n del registro de impresi&oacute;n en tejido PP: gu&iacute;a de diagn&oacute;stico</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-16T10:00:00Z',
  cover_image_url: null,
  title_en: 'AI Visual Inspection on Woven Bag Lines: What It Catches — and What It Misses',
  title_es: 'Inspección visual por IA en líneas de sacos tejidos: qué detecta y qué no',
  summary_en: 'AI vision on a woven bag line catches visible, recurring defects — print, material and processing faults — at full line speed with a 95%+ recall target. What it does not do: correct registration by itself, judge colour like a customer, or see past the camera. The line between the two, drawn precisely.',
  summary_es: 'La visión por IA en una línea de sacos tejidos detecta defectos visibles y recurrentes — de impresión, material y proceso — a plena velocidad con un objetivo de detección superior al 95%. Lo que no hace: corregir el registro por sí misma, juzgar el color como un cliente o ver más allá de la cámara.',
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

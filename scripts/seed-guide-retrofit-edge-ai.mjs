// Seed the technical guide: "Retrofitting Edge AI Inspection onto an Existing Bag Line"
//
// FACT BOUNDARY (do not blur this when editing):
//   - Retrofit is engineered CASE BY CASE for a specific machine and process (DB fact). Never
//     promise universal compatibility or a fixed timeline; deployment timeline is project-dependent.
//   - Integration is via standard industrial protocols: OPC-UA, Modbus, MQTT (DB fact).
//   - Few-shot baseline from ~50 reference samples; 95%+ recall TARGET, application-dependent.
//   - Edge hardware = industrial PC or embedded AI accelerator; no cloud/internet required.
//   - PCR/recycled-material tension loop: AI senses melt-flow-driven micro-variations and adjusts
//     speed and sealing temperature (DB fact) — tension/temperature, NOT colour registration.
//   - No closed-loop colour registration claims, ever.
//
// The visible FAQ block at the end of the body mirrors the `faq` column exactly.
//
// Idempotent. Run: node scripts/seed-guide-retrofit-edge-ai.mjs
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

const SLUG = 'retrofit-edge-ai-inspection-woven-bag-line'

const faq = [
  {
    q_en: 'Can AI inspection be added to machines Rey Long did not build?',
    a_en: 'Often yes, but it is confirmed case by case rather than promised in general. The system integrates through standard industrial protocols — OPC-UA, Modbus, MQTT — so the practical questions are whether your machine\'s control system exposes one of those interfaces (or can be given one), and whether there is physical space for cameras and lighting at the right point in the web path. Send the machine make, model and controller type and Rey Long\'s engineering team will assess it.',
    q_es: '¿Se puede añadir inspección por IA a máquinas que no fabricó Rey Long?',
    a_es: 'A menudo sí, pero se confirma caso por caso en lugar de prometerse en general. El sistema se integra mediante protocolos industriales estándar — OPC-UA, Modbus, MQTT —, así que las preguntas prácticas son si el sistema de control de su máquina expone una de esas interfaces (o puede dotarse de una) y si hay espacio físico para cámaras e iluminación en el punto correcto del recorrido de la banda. Envíe la marca, el modelo y el tipo de controlador de la máquina y el equipo de ingeniería de Rey Long lo evaluará.',
  },
  {
    q_en: 'Does the retrofit require stopping production for long?',
    a_en: 'The physical installation — mounting cameras, lighting and the edge unit, and wiring into the control interface — is planned around your production schedule, and the model baseline is built from reference samples that can be collected during normal running. The honest caveat is that commissioning ends with a validation phase on the live line, tuning recall and false-alert behaviour on your actual product, and that phase needs the line running your real jobs. Total project timeline is scoped per machine rather than quoted generically.',
    q_es: '¿La instalación exige parar la producción mucho tiempo?',
    a_es: 'La instalación física — montar cámaras, iluminación y la unidad edge, y cablear a la interfaz de control — se planifica alrededor de su calendario de producción, y la base del modelo se construye con muestras de referencia que pueden recogerse durante el funcionamiento normal. La salvedad honesta es que la puesta en marcha termina con una fase de validación en la línea en vivo, ajustando la detección y el comportamiento de las alertas sobre su producto real, y esa fase necesita la línea corriendo sus trabajos reales. El plazo total del proyecto se dimensiona por máquina, no se cita de forma genérica.',
  },
  {
    q_en: 'What data do I need to prepare before a retrofit project?',
    a_en: 'Three things, none of them exotic: around 50 reference samples of good product per SKU (the few-shot baseline), whatever examples of past defects you have kept — physical bags or photos both help — and your defect history: which faults occur, how often, and what each one costs you. The defect history matters most, because it decides camera placement and which defect classes the system is tuned to prioritise. Machine documentation (controller type, available interfaces) rounds out the assessment.',
    q_es: '¿Qué datos debo preparar antes de un proyecto de retrofit?',
    a_es: 'Tres cosas, ninguna exótica: unas 50 muestras de referencia de producto correcto por referencia (la base few-shot), los ejemplos de defectos pasados que haya conservado — sirven tanto sacos físicos como fotos — y su historial de defectos: qué fallos ocurren, con qué frecuencia y cuánto cuesta cada uno. El historial de defectos es lo más importante, porque decide la colocación de las cámaras y qué clases de defecto prioriza el sistema. La documentación de la máquina (tipo de controlador, interfaces disponibles) completa la evaluación.',
  },
  {
    q_en: 'Does the system stop the machine when it finds a defect?',
    a_en: 'That is an integration decision made with you, not a fixed behaviour. The lightest integration raises an alert on the HMI and logs the event; a deeper integration can flag bags for downstream rejection or, where the control system allows it, hold the line on a persistent fault. Most deployments start alert-only — it builds operator trust and establishes the false-alert baseline — and add automatic actions once the system has earned confidence on your product.',
    q_es: '¿El sistema detiene la máquina cuando encuentra un defecto?',
    a_es: 'Esa es una decisión de integración que se toma con usted, no un comportamiento fijo. La integración más ligera lanza una alerta en la HMI y registra el evento; una integración más profunda puede marcar sacos para rechazo posterior o, donde el sistema de control lo permita, detener la línea ante un fallo persistente. La mayoría de las implementaciones empiezan solo con alertas — construye la confianza del operario y establece la línea base de falsas alertas — y añaden acciones automáticas cuando el sistema se ha ganado la confianza sobre su producto.',
  },
  {
    q_en: 'Does edge AI inspection help when running recycled (PCR) material?',
    a_en: 'Yes, through a separate capability that shares the same edge hardware: recycled resin has unstable melt flow and tensile strength, which causes breaks and dimension drift at high speed. The AI tension-control loop senses the micro-variations that instability produces and adjusts line speed and sealing temperature automatically to keep the bag within its strength spec. As brands push recycled content upward, this is increasingly the capability that pays for the hardware — inspection rides along on the same platform.',
    q_es: '¿La inspección edge AI ayuda al procesar material reciclado (PCR)?',
    a_es: 'Sí, mediante una capacidad aparte que comparte el mismo hardware edge: la resina reciclada tiene un índice de fluidez y una resistencia a la tracción inestables, lo que causa roturas y deriva dimensional a alta velocidad. El lazo de control de tensión por IA percibe las microvariaciones que produce esa inestabilidad y ajusta automáticamente la velocidad de línea y la temperatura de sellado para mantener el saco dentro de su especificación de resistencia. A medida que las marcas elevan el contenido reciclado, esta es cada vez más la capacidad que amortiza el hardware — la inspección viaja en la misma plataforma.',
  },
]

const content_en = `<p>You do not need a new machine to get AI inspection: a retrofit adds industrial cameras, engineered lighting and an edge compute unit to the line you already run, integrating with the existing controls over standard industrial protocols &mdash; OPC-UA, Modbus or MQTT. A typical project runs assessment &rarr; few-shot model baseline built from around 50 reference samples &rarr; installation &rarr; validation on your live product. No cloud connection is required at any stage. This guide walks through what actually gets installed, what you need to prepare, and where the honest limits are.</p>

<h2>What gets installed</h2>
<p>Three hardware groups, all at the machine:</p>
<ul>
<li><strong>Cameras.</strong> On a continuous web the natural choice is line-scan cameras synchronised to an encoder, building a seamless image of the moving fabric; area cameras suit discrete stations such as post-cut bag inspection. Placement is decided by your defect history &mdash; a camera watching for print faults lives after the last print station, one watching stitch quality lives at the sewing head.</li>
<li><strong>Lighting.</strong> The component that decides more projects than camera resolution. Woven PP needs light geometry engineered for its texture; BOPP-laminated fabric adds gloss that demands careful angles and, where needed, polarisation. Lighting is engineered per installation, not bought off a shelf.</li>
<li><strong>Edge compute.</strong> An industrial PC or embedded AI accelerator mounted at the machine runs all inference locally, with near-zero latency. Production images and data stay on site &mdash; there is no cloud dependency, which also means the system keeps working when the factory network does not.</li>
</ul>

<h2>How it connects to your machine</h2>
<p>Integration happens over the industrial protocols your controls already speak &mdash; OPC-UA, Modbus, MQTT &mdash; and comes in escalating depths, chosen with you rather than imposed:</p>
<ul>
<li><strong>Alert-only</strong> (where most deployments start): defects raise an HMI alert and are logged with images. Operators keep full authority. This stage builds trust and establishes the real false-alert rate on your product.</li>
<li><strong>Flag-and-reject:</strong> detected defects mark bags for downstream rejection, so faults leave the process without stopping it.</li>
<li><strong>Line-hold on persistent faults:</strong> where the control system allows it, a fault that recurs past a threshold can hold the line &mdash; the alert that becomes an action.</li>
</ul>
<p>The retrofit is engineered case by case for the specific machine and process &mdash; Rey Long does not promise universal compatibility, because honest integration depends on what your controller exposes and where cameras can physically live. The assessment settles both before any hardware is ordered.</p>

<h2>What you prepare (it is less than you think)</h2>
<ul>
<li><strong>~50 reference samples per SKU</strong> of known-good product &mdash; the few-shot baseline the model learns "normal" from. These can be collected during ordinary production.</li>
<li><strong>Your defect examples</strong> &mdash; kept reject bags, claim photos, anything. The model benefits, but more importantly the <em>project</em> does: defect history decides camera placement and tuning priorities.</li>
<li><strong>Machine documentation</strong> &mdash; controller type and available interfaces, so integration depth can be scoped accurately.</li>
</ul>
<p>What you explicitly do not need: an internet connection to the line, a data science team, or thousands of labelled defect images. The few-shot approach exists precisely because factories do not have training datasets lying around.</p>

<h2>What changes for operators</h2>
<p>The working change is that operators stop staring and start responding. The system watches every bag; the operator answers alerts, judges edge cases and runs changeovers. In Rey Long deployments this shifts the supervision ratio from one operator per two machines toward <strong>one per four</strong> &mdash; a staffing change, not a staffing cut, and one that moves people from the task documented to fatigue them (research at Sandia National Laboratories puts human miss rates at 20&ndash;30% on sustained visual inspection) to the tasks that use their judgement. The comparison is laid out honestly in <a href="/news/manual-vs-ai-inspection-woven-bag-lines">the manual-vs-AI guide</a>.</p>

<h2>A bonus that shares the hardware: running recycled material</h2>
<p>The same edge platform carries a second capability that has nothing to do with cameras: recycled (PCR) resin brings unstable melt flow and tensile strength, which surfaces as breaks and dimension drift at speed. The AI tension-control loop senses the micro-variations that instability produces and adjusts line speed and sealing temperature on the fly to keep bags inside their strength spec. For factories moving to higher recycled content &mdash; which increasingly means everyone &mdash; this is often the capability that justifies the project on its own.</p>

<h2>The honest limits</h2>
<p>Three boundaries worth stating before any purchase order:</p>
<ul>
<li><strong>Recall is a commissioning result, not a datasheet number.</strong> The 95%+ defect-recall target is application-dependent &mdash; fabric, artwork, lighting and defect classes all move it &mdash; and it is validated on your product during commissioning. See <a href="/news/ai-visual-inspection-woven-bag-printing">what AI inspection catches and misses</a> for what the numbers mean.</li>
<li><strong>Detection is not correction.</strong> The system alerts on print faults; closed-loop colour registration correction is not a deployed capability &mdash; the vision-to-servo loop that does ship corrects <em>cut and seam length</em> via Eye-Mark, toward ±1 mm against roughly ±5 mm of practical drift on fixed-length cutting.</li>
<li><strong>Timelines are scoped, not quoted.</strong> A retrofit on a machine with a modern PLC and clean camera access is a different project from one on a twenty-year-old line with a proprietary controller. The assessment exists to tell you which one you have.</li>
</ul>

<h2>The short version</h2>
<p>An edge AI inspection retrofit is cameras, engineered light and an industrial computer bolted to the machine you already own, talking to controls you already have, learning your product from about 50 samples you can collect this week &mdash; with no cloud, no data team and no new machine. Start alert-only, let it earn trust, deepen the integration when it has. The prerequisite is not budget approval; it is knowing your defect history well enough to point the cameras at the right problem.</p>
<p><em><a href="/contact">Send Rey Long your machine type and defect history</a> for a case-by-case assessment.</em></p>

<h2>Frequently asked questions</h2>
<h3>Can AI inspection be added to machines Rey Long did not build?</h3>
<p>Often yes, but it is confirmed case by case rather than promised in general. The system integrates through standard industrial protocols &mdash; OPC-UA, Modbus, MQTT &mdash; so the practical questions are whether your machine's control system exposes one of those interfaces (or can be given one), and whether there is physical space for cameras and lighting at the right point in the web path. Send the machine make, model and controller type and Rey Long's engineering team will assess it.</p>
<h3>Does the retrofit require stopping production for long?</h3>
<p>The physical installation &mdash; mounting cameras, lighting and the edge unit, and wiring into the control interface &mdash; is planned around your production schedule, and the model baseline is built from reference samples that can be collected during normal running. The honest caveat is that commissioning ends with a validation phase on the live line, tuning recall and false-alert behaviour on your actual product, and that phase needs the line running your real jobs. Total project timeline is scoped per machine rather than quoted generically.</p>
<h3>What data do I need to prepare before a retrofit project?</h3>
<p>Three things, none of them exotic: around 50 reference samples of good product per SKU (the few-shot baseline), whatever examples of past defects you have kept &mdash; physical bags or photos both help &mdash; and your defect history: which faults occur, how often, and what each one costs you. The defect history matters most, because it decides camera placement and which defect classes the system is tuned to prioritise. Machine documentation (controller type, available interfaces) rounds out the assessment.</p>
<h3>Does the system stop the machine when it finds a defect?</h3>
<p>That is an integration decision made with you, not a fixed behaviour. The lightest integration raises an alert on the HMI and logs the event; a deeper integration can flag bags for downstream rejection or, where the control system allows it, hold the line on a persistent fault. Most deployments start alert-only &mdash; it builds operator trust and establishes the false-alert baseline &mdash; and add automatic actions once the system has earned confidence on your product.</p>
<h3>Does edge AI inspection help when running recycled (PCR) material?</h3>
<p>Yes, through a separate capability that shares the same edge hardware: recycled resin has unstable melt flow and tensile strength, which causes breaks and dimension drift at high speed. The AI tension-control loop senses the micro-variations that instability produces and adjusts line speed and sealing temperature automatically to keep the bag within its strength spec. As brands push recycled content upward, this is increasingly the capability that pays for the hardware &mdash; inspection rides along on the same platform.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/ai-visual-inspection-woven-bag-printing">AI Visual Inspection on Woven Bag Lines: What It Catches &mdash; and What It Misses</a></li>
<li><a href="/news/manual-vs-ai-inspection-woven-bag-lines">Manual vs AI Inspection on Woven Bag Lines: An Honest Comparison</a></li>
<li><a href="/news/cut-length-drift-woven-bag-lines">Cut-Length Drift on Woven Bag Lines: Why Fixed-Length Cutting Isn't Enough</a></li>
</ul>`

const content_es = `<p>No necesita una m&aacute;quina nueva para tener inspecci&oacute;n por IA: un retrofit a&ntilde;ade c&aacute;maras industriales, iluminaci&oacute;n dise&ntilde;ada y una unidad de c&oacute;mputo edge a la l&iacute;nea que ya opera, integr&aacute;ndose con los controles existentes mediante protocolos industriales est&aacute;ndar &mdash; OPC-UA, Modbus o MQTT. Un proyecto t&iacute;pico recorre evaluaci&oacute;n &rarr; base del modelo few-shot construida con unas 50 muestras de referencia &rarr; instalaci&oacute;n &rarr; validaci&oacute;n sobre su producto real. No se requiere conexi&oacute;n a la nube en ninguna etapa. Esta gu&iacute;a repasa qu&eacute; se instala realmente, qu&eacute; debe preparar usted y d&oacute;nde est&aacute;n los l&iacute;mites honestos.</p>

<h2>Qu&eacute; se instala</h2>
<p>Tres grupos de hardware, todos en la m&aacute;quina:</p>
<ul>
<li><strong>C&aacute;maras.</strong> En una banda continua la elecci&oacute;n natural son c&aacute;maras line-scan sincronizadas con un encoder, que construyen una imagen continua del tejido en movimiento; las c&aacute;maras de &aacute;rea encajan en estaciones discretas, como la inspecci&oacute;n del saco tras el corte. La colocaci&oacute;n la decide su historial de defectos &mdash; una c&aacute;mara que vigila fallos de impresi&oacute;n vive despu&eacute;s de la &uacute;ltima estaci&oacute;n de impresi&oacute;n; una que vigila la calidad de puntada, en el cabezal de costura.</li>
<li><strong>Iluminaci&oacute;n.</strong> El componente que decide m&aacute;s proyectos que la resoluci&oacute;n de la c&aacute;mara. El PP tejido exige una geometr&iacute;a de luz dise&ntilde;ada para su textura; el tejido laminado con BOPP a&ntilde;ade brillo que exige &aacute;ngulos cuidadosos y, donde haga falta, polarizaci&oacute;n. La iluminaci&oacute;n se dise&ntilde;a por instalaci&oacute;n, no se compra de estanter&iacute;a.</li>
<li><strong>C&oacute;mputo edge.</strong> Un PC industrial o un acelerador de IA embebido montado en la m&aacute;quina ejecuta toda la inferencia localmente, con latencia casi nula. Las im&aacute;genes y datos de producci&oacute;n se quedan en planta &mdash; no hay dependencia de la nube, lo que tambi&eacute;n significa que el sistema sigue funcionando cuando la red de la f&aacute;brica no lo hace.</li>
</ul>

<h2>C&oacute;mo se conecta a su m&aacute;quina</h2>
<p>La integraci&oacute;n se realiza mediante los protocolos industriales que sus controles ya hablan &mdash; OPC-UA, Modbus, MQTT &mdash; y viene en profundidades escalonadas, elegidas con usted y no impuestas:</p>
<ul>
<li><strong>Solo alertas</strong> (donde empieza la mayor&iacute;a): los defectos lanzan una alerta en la HMI y se registran con im&aacute;genes. Los operarios conservan toda la autoridad. Esta etapa construye confianza y establece la tasa real de falsas alertas sobre su producto.</li>
<li><strong>Marcar y rechazar:</strong> los defectos detectados marcan sacos para rechazo posterior, de modo que los fallos salen del proceso sin detenerlo.</li>
<li><strong>Parada ante fallos persistentes:</strong> donde el sistema de control lo permita, un fallo que se repite m&aacute;s all&aacute; de un umbral puede detener la l&iacute;nea &mdash; la alerta que se convierte en acci&oacute;n.</li>
</ul>
<p>El retrofit se dise&ntilde;a caso por caso para la m&aacute;quina y el proceso espec&iacute;ficos &mdash; Rey Long no promete compatibilidad universal, porque la integraci&oacute;n honesta depende de lo que exponga su controlador y de d&oacute;nde puedan vivir f&iacute;sicamente las c&aacute;maras. La evaluaci&oacute;n resuelve ambas cosas antes de pedir ning&uacute;n hardware.</p>

<h2>Qu&eacute; prepara usted (es menos de lo que cree)</h2>
<ul>
<li><strong>~50 muestras de referencia por referencia de producto</strong> en buen estado &mdash; la base few-shot de la que el modelo aprende lo "normal". Pueden recogerse durante la producci&oacute;n ordinaria.</li>
<li><strong>Sus ejemplos de defectos</strong> &mdash; sacos rechazados guardados, fotos de reclamaciones, lo que tenga. El modelo se beneficia, pero sobre todo se beneficia el <em>proyecto</em>: el historial de defectos decide la colocaci&oacute;n de c&aacute;maras y las prioridades de ajuste.</li>
<li><strong>Documentaci&oacute;n de la m&aacute;quina</strong> &mdash; tipo de controlador e interfaces disponibles, para dimensionar con precisi&oacute;n la profundidad de integraci&oacute;n.</li>
</ul>
<p>Lo que expl&iacute;citamente no necesita: conexi&oacute;n a internet en la l&iacute;nea, un equipo de ciencia de datos ni miles de im&aacute;genes de defectos etiquetadas. El enfoque few-shot existe precisamente porque las f&aacute;bricas no tienen datasets de entrenamiento guardados en un caj&oacute;n.</p>

<h2>Qu&eacute; cambia para los operarios</h2>
<p>El cambio de trabajo es que los operarios dejan de mirar y empiezan a responder. El sistema vigila cada saco; el operario atiende alertas, juzga casos l&iacute;mite y ejecuta cambios de formato. En las implementaciones de Rey Long esto desplaza la proporci&oacute;n de supervisi&oacute;n de un operario por cada dos m&aacute;quinas hacia <strong>uno por cada cuatro</strong> &mdash; un cambio de asignaci&oacute;n, no un recorte, que saca a las personas de la tarea documentadamente fatigante (la investigaci&oacute;n de Sandia National Laboratories sit&uacute;a los fallos humanos en el 20&ndash;30% en inspecci&oacute;n visual sostenida) y las lleva a las tareas que usan su criterio. La comparaci&oacute;n se expone con honestidad en <a href="/es/news/manual-vs-ai-inspection-woven-bag-lines">la gu&iacute;a manual vs IA</a>.</p>

<h2>Un extra que comparte el hardware: procesar material reciclado</h2>
<p>La misma plataforma edge lleva una segunda capacidad que no tiene nada que ver con c&aacute;maras: la resina reciclada (PCR) trae un &iacute;ndice de fluidez y una resistencia a la tracci&oacute;n inestables, que afloran como roturas y deriva dimensional a velocidad. El lazo de control de tensi&oacute;n por IA percibe las microvariaciones que produce esa inestabilidad y ajusta sobre la marcha la velocidad de l&iacute;nea y la temperatura de sellado para mantener los sacos dentro de su especificaci&oacute;n de resistencia. Para las f&aacute;bricas que avanzan hacia mayor contenido reciclado &mdash; que cada vez son todas &mdash;, esta suele ser la capacidad que justifica el proyecto por s&iacute; sola.</p>

<h2>Los l&iacute;mites honestos</h2>
<p>Tres fronteras que conviene dejar dichas antes de cualquier orden de compra:</p>
<ul>
<li><strong>La detecci&oacute;n es un resultado de puesta en marcha, no un n&uacute;mero de ficha t&eacute;cnica.</strong> El objetivo de superar el 95% de detecci&oacute;n de defectos depende de la aplicaci&oacute;n &mdash; tejido, arte, iluminaci&oacute;n y clases de defecto lo mueven &mdash; y se valida sobre su producto durante la puesta en marcha. Vea <a href="/es/news/ai-visual-inspection-woven-bag-printing">qu&eacute; detecta y qu&eacute; no la inspecci&oacute;n por IA</a> para entender las cifras.</li>
<li><strong>Detectar no es corregir.</strong> El sistema alerta sobre fallos de impresi&oacute;n; la correcci&oacute;n del registro de color en lazo cerrado no es una capacidad desplegada &mdash; el lazo visi&oacute;n-servo que s&iacute; existe corrige la <em>longitud de corte y costura</em> mediante Eye-Mark, hacia ±1 mm frente a los aproximadamente ±5 mm de deriva pr&aacute;ctica del corte de longitud fija.</li>
<li><strong>Los plazos se dimensionan, no se citan.</strong> Un retrofit en una m&aacute;quina con un PLC moderno y buen acceso para c&aacute;maras es un proyecto distinto que uno en una l&iacute;nea de veinte a&ntilde;os con un controlador propietario. La evaluaci&oacute;n existe para decirle cu&aacute;l de los dos tiene usted.</li>
</ul>

<h2>En resumen</h2>
<p>Un retrofit de inspecci&oacute;n edge AI son c&aacute;maras, luz dise&ntilde;ada y un ordenador industrial atornillados a la m&aacute;quina que ya posee, hablando con los controles que ya tiene, aprendiendo su producto de unas 50 muestras que puede recoger esta semana &mdash; sin nube, sin equipo de datos y sin m&aacute;quina nueva. Empiece solo con alertas, deje que se gane la confianza, profundice la integraci&oacute;n cuando lo haya hecho. El prerrequisito no es la aprobaci&oacute;n del presupuesto; es conocer su historial de defectos lo bastante bien como para apuntar las c&aacute;maras al problema correcto.</p>
<p><em><a href="/es/contact">Env&iacute;e a Rey Long su tipo de m&aacute;quina y su historial de defectos</a> para una evaluaci&oacute;n caso por caso.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Se puede a&ntilde;adir inspecci&oacute;n por IA a m&aacute;quinas que no fabric&oacute; Rey Long?</h3>
<p>A menudo s&iacute;, pero se confirma caso por caso en lugar de prometerse en general. El sistema se integra mediante protocolos industriales est&aacute;ndar &mdash; OPC-UA, Modbus, MQTT &mdash;, as&iacute; que las preguntas pr&aacute;cticas son si el sistema de control de su m&aacute;quina expone una de esas interfaces (o puede dotarse de una) y si hay espacio f&iacute;sico para c&aacute;maras e iluminaci&oacute;n en el punto correcto del recorrido de la banda. Env&iacute;e la marca, el modelo y el tipo de controlador de la m&aacute;quina y el equipo de ingenier&iacute;a de Rey Long lo evaluar&aacute;.</p>
<h3>&iquest;La instalaci&oacute;n exige parar la producci&oacute;n mucho tiempo?</h3>
<p>La instalaci&oacute;n f&iacute;sica &mdash; montar c&aacute;maras, iluminaci&oacute;n y la unidad edge, y cablear a la interfaz de control &mdash; se planifica alrededor de su calendario de producci&oacute;n, y la base del modelo se construye con muestras de referencia que pueden recogerse durante el funcionamiento normal. La salvedad honesta es que la puesta en marcha termina con una fase de validaci&oacute;n en la l&iacute;nea en vivo, ajustando la detecci&oacute;n y el comportamiento de las alertas sobre su producto real, y esa fase necesita la l&iacute;nea corriendo sus trabajos reales. El plazo total del proyecto se dimensiona por m&aacute;quina, no se cita de forma gen&eacute;rica.</p>
<h3>&iquest;Qu&eacute; datos debo preparar antes de un proyecto de retrofit?</h3>
<p>Tres cosas, ninguna ex&oacute;tica: unas 50 muestras de referencia de producto correcto por referencia (la base few-shot), los ejemplos de defectos pasados que haya conservado &mdash; sirven tanto sacos f&iacute;sicos como fotos &mdash; y su historial de defectos: qu&eacute; fallos ocurren, con qu&eacute; frecuencia y cu&aacute;nto cuesta cada uno. El historial de defectos es lo m&aacute;s importante, porque decide la colocaci&oacute;n de las c&aacute;maras y qu&eacute; clases de defecto prioriza el sistema. La documentaci&oacute;n de la m&aacute;quina (tipo de controlador, interfaces disponibles) completa la evaluaci&oacute;n.</p>
<h3>&iquest;El sistema detiene la m&aacute;quina cuando encuentra un defecto?</h3>
<p>Esa es una decisi&oacute;n de integraci&oacute;n que se toma con usted, no un comportamiento fijo. La integraci&oacute;n m&aacute;s ligera lanza una alerta en la HMI y registra el evento; una integraci&oacute;n m&aacute;s profunda puede marcar sacos para rechazo posterior o, donde el sistema de control lo permita, detener la l&iacute;nea ante un fallo persistente. La mayor&iacute;a de las implementaciones empiezan solo con alertas &mdash; construye la confianza del operario y establece la l&iacute;nea base de falsas alertas &mdash; y a&ntilde;aden acciones autom&aacute;ticas cuando el sistema se ha ganado la confianza sobre su producto.</p>
<h3>&iquest;La inspecci&oacute;n edge AI ayuda al procesar material reciclado (PCR)?</h3>
<p>S&iacute;, mediante una capacidad aparte que comparte el mismo hardware edge: la resina reciclada tiene un &iacute;ndice de fluidez y una resistencia a la tracci&oacute;n inestables, lo que causa roturas y deriva dimensional a alta velocidad. El lazo de control de tensi&oacute;n por IA percibe las microvariaciones que produce esa inestabilidad y ajusta autom&aacute;ticamente la velocidad de l&iacute;nea y la temperatura de sellado para mantener el saco dentro de su especificaci&oacute;n de resistencia. A medida que las marcas elevan el contenido reciclado, esta es cada vez m&aacute;s la capacidad que amortiza el hardware &mdash; la inspecci&oacute;n viaja en la misma plataforma.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/ai-visual-inspection-woven-bag-printing">Inspecci&oacute;n visual por IA en l&iacute;neas de sacos tejidos: qu&eacute; detecta y qu&eacute; no</a></li>
<li><a href="/es/news/manual-vs-ai-inspection-woven-bag-lines">Inspecci&oacute;n manual vs IA en l&iacute;neas de sacos tejidos: una comparaci&oacute;n honesta</a></li>
<li><a href="/es/news/cut-length-drift-woven-bag-lines">Desviaci&oacute;n de la longitud de corte en l&iacute;neas de sacos tejidos</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-16T12:00:00Z',
  cover_image_url: null,
  title_en: 'Retrofitting Edge AI Inspection onto an Existing Bag Line: A Practical Guide',
  title_es: 'Instalar inspección edge AI en una línea de sacos existente: guía práctica',
  summary_en: 'No new machine required: an edge AI inspection retrofit adds cameras, engineered lighting and an edge compute unit to the line you already run, integrating over OPC-UA, Modbus or MQTT. What gets installed, the ~50 samples you prepare, the three integration depths, and the honest limits.',
  summary_es: 'No hace falta una máquina nueva: un retrofit de inspección edge AI añade cámaras, iluminación diseñada y una unidad de cómputo edge a la línea que ya opera, integrándose por OPC-UA, Modbus o MQTT. Qué se instala, las ~50 muestras que usted prepara, las tres profundidades de integración y los límites honestos.',
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

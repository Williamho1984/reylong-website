// Seed the technical guide: "Heat Seal Failures in Pouch Production"
//
// Every JL-L-2TZP600 number here comes from the products table: 4 groups heating + 2 groups
// cooling per seal (vertical and horizontal), up to 300 °C, 30–180 µm film, ≤0.3 mm positional
// accuracy, ultrasonic zipper at 13 mm, 35–220 pcs/min. Do not invent zone counts or PID timings.
//
// The visible FAQ block at the end of the body mirrors the `faq` column exactly — Google requires
// FAQPage structured data to match content the reader can actually see on the page.
//
// Idempotent. Run: node scripts/seed-guide-heat-seal-failure.mjs
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

const SLUG = 'heat-seal-strength-failure-diagnosis'

const faq = [
  {
    q_en: 'What are the three variables that control heat seal quality?',
    a_en: 'Temperature, pressure and dwell time. They are not independent knobs — they trade against each other, and that is the single most useful fact when diagnosing a seal failure. If you raise line speed, dwell time falls, and the same temperature that sealed correctly yesterday now under-seals. If you raise temperature to compensate for short dwell, you move toward burn-through and film distortion. A seal recipe is a balance of all three at a given speed, on a given film. Change any one of them and the other two need re-validating.',
    q_es: '¿Cuáles son las tres variables que controlan la calidad del sellado térmico?',
    a_es: 'Temperatura, presión y tiempo de permanencia. No son mandos independientes: se compensan entre sí, y ese es el dato más útil al diagnosticar un fallo de sellado. Si aumenta la velocidad de línea, el tiempo de permanencia baja, y la misma temperatura que ayer sellaba correctamente hoy sella de forma insuficiente. Si sube la temperatura para compensar un tiempo corto, se acerca a la perforación por calor y a la deformación de la película. Una receta de sellado es el equilibrio de las tres a una velocidad dada y sobre una película dada. Si cambia una, hay que revalidar las otras dos.',
  },
  {
    q_en: 'Why does a seal look perfect but still leak?',
    a_en: 'That is a false seal, and it is the most expensive failure mode because it passes visual inspection and fails at the customer. The sealing layers were pressed together and cosmetically fused at the surface, but never reached full molecular interdiffusion across the interface — so the bond has almost no strength and opens under load or over time. The usual causes are temperature slightly too low, dwell time too short (often after a speed increase nobody re-validated), or contamination in the seal area: product powder, dust, or oil migrating between the layers. Visual checks cannot find it. Only a destructive peel test on a seal strength tester, or a leak test, will.',
    q_es: '¿Por qué un sellado parece perfecto y aun así tiene fugas?',
    a_es: 'Eso es un sellado falso, y es el modo de fallo más caro porque supera la inspección visual y falla en casa del cliente. Las capas de sellado se prensaron y fundieron estéticamente en la superficie, pero nunca alcanzaron una interdifusión molecular completa a través de la interfaz, de modo que la unión casi no tiene resistencia y se abre bajo carga o con el tiempo. Las causas habituales son una temperatura ligeramente baja, un tiempo de permanencia demasiado corto (a menudo tras un aumento de velocidad que nadie revalidó) o contaminación en la zona de sellado: polvo de producto, suciedad o aceite migrando entre las capas. Las comprobaciones visuales no lo detectan. Solo un ensayo destructivo de pelado en un dinamómetro de sellado, o una prueba de fugas, lo hará.',
  },
  {
    q_en: 'What causes burn-through and wrinkling at the seal?',
    a_en: 'Too much energy into the film: temperature too high, dwell too long, or pressure high enough to squeeze molten polymer out of the seal and thin the wall. The tell-tale signs are a seal that is visibly thinned or glassy, wrinkling and shrinkage adjacent to the seal bar, and in the worst case a hole. Two mechanical causes are frequently missed. First, worn or damaged PTFE tape on the seal bar creates local hot spots and sticking. Second, the temperature at the film may not be the temperature on the HMI — a drifting thermocouple or an ageing heater cartridge can put the actual bar surface tens of degrees away from setpoint. Measure the bar surface directly before you trust the display.',
    q_es: '¿Qué causa la perforación por calor y las arrugas en el sellado?',
    a_es: 'Demasiada energía en la película: temperatura demasiado alta, tiempo demasiado largo o presión suficiente para expulsar el polímero fundido del sellado y adelgazar la pared. Las señales son un sellado visiblemente adelgazado o vidrioso, arrugas y encogimiento junto a la mordaza y, en el peor caso, un agujero. Dos causas mecánicas se pasan por alto con frecuencia. Primera: la cinta de PTFE de la mordaza desgastada o dañada genera puntos calientes localizados y adherencias. Segunda: la temperatura en la película puede no ser la de la HMI — un termopar descalibrado o una resistencia envejecida pueden dejar la superficie real de la mordaza a decenas de grados del valor de consigna. Mida directamente la superficie de la mordaza antes de fiarse de la pantalla.',
  },
  {
    q_en: 'How does cooling affect seal strength?',
    a_en: 'Decisively, and it is the step most often under-specified. A seal has almost no strength while it is still hot — this is hot tack, the strength of the bond before it has cooled and crystallised. On a high-speed machine the bag is indexed forward under servo tension within a fraction of a second of leaving the seal bar, so if the bond has not been re-solidified under pressure it gets pulled apart or distorted while still molten. That failure looks like random, intermittent weak seals with no pattern, which sends people hunting for a temperature fault that is not there. The JL-L-2TZP600 addresses this structurally: each seal, vertical and horizontal, uses 4 groups of heating bars followed by 2 groups of cooling bars, so the bond is re-solidified under pressure before the bag is released.',
    q_es: '¿Cómo afecta el enfriamiento a la resistencia del sellado?',
    a_es: 'De forma decisiva, y es el paso peor dimensionado con más frecuencia. Un sellado apenas tiene resistencia mientras sigue caliente: es el hot tack, la resistencia de la unión antes de enfriarse y cristalizar. En una máquina de alta velocidad, la bolsa avanza bajo tensión de servo en una fracción de segundo tras salir de la mordaza, de modo que si la unión no se ha resolidificado bajo presión, se desgarra o se deforma aún fundida. Ese fallo se manifiesta como sellados débiles aleatorios e intermitentes sin patrón, lo que lleva a buscar un fallo de temperatura que no existe. La JL-L-2TZP600 lo aborda estructuralmente: cada sellado, vertical y horizontal, emplea 4 grupos de mordazas de calentamiento seguidos de 2 grupos de enfriamiento, de modo que la unión se resolidifica bajo presión antes de liberar la bolsa.',
  },
  {
    q_en: 'Why do mono-material films fail more often at the seal?',
    a_en: 'Because their heat-seal window is much narrower. In a conventional laminate such as PET/PE, the sealing layer and the structural layers are different polymers with very different melting points, so there is a wide temperature band in which the inner layer fuses while the outer layer stays intact and supports the bag. In a mono-material film every layer belongs to the same polymer family, so the temperature that seals the film sits close to the temperature that melts, distorts or burns through it. A few degrees of drift that a PET/PE laminate would absorb without complaint produces either a false seal or burn-through. This is why temperature stability and cooling capacity — not peak temperature — are the capabilities that matter as converters move to recyclable mono-material structures.',
    q_es: '¿Por qué las películas monomaterial fallan más en el sellado?',
    a_es: 'Porque su ventana de sellado térmico es mucho más estrecha. En un laminado convencional como PET/PE, la capa de sellado y las capas estructurales son polímeros distintos con puntos de fusión muy diferentes, por lo que existe una banda amplia de temperatura en la que la capa interior funde mientras la exterior permanece intacta y sostiene la bolsa. En una película monomaterial todas las capas pertenecen a la misma familia de polímeros, así que la temperatura que sella está cerca de la que funde, deforma o perfora. Unos pocos grados de desviación que un laminado PET/PE absorbería sin problema producen aquí un sellado falso o una perforación. Por eso la estabilidad térmica y la capacidad de enfriamiento — no la temperatura máxima — son las capacidades que importan a medida que los transformadores migran a estructuras monomaterial reciclables.',
  },
]

const content_en = `<p>Seal failures are rarely mysterious once you stop treating them as a single defect. "The seal is bad" describes at least four different faults with four different causes, and the fastest route to the answer is to read the <em>failure mode</em> first and only then start turning dials. This guide covers how to tell those modes apart, the order to work through the causes, and how the <a href="/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> is built to keep the seal inside its window at speed.</p>

<h2>The three variables, and why they are not independent</h2>
<p>A heat seal is made by three things acting together: <strong>temperature</strong>, <strong>pressure</strong>, and <strong>dwell time</strong> (how long the film is held between the bars). Almost every seal problem in production is a broken balance between them.</p>
<p>The practical consequence gets forgotten constantly: <strong>dwell time is a function of line speed.</strong> Push a machine from 120 to 180 pcs/min and you have cut the dwell time by a third without touching a temperature setting. The recipe that sealed perfectly last week is now under-sealing, and the operator who "didn't change anything" is telling the truth. Raise the temperature to compensate and you march toward the opposite failure. Every seal recipe is valid at a speed, on a film. Change either and it needs re-validating.</p>

<h2>Read the failure mode before you touch a setting</h2>
<p>Four modes, four different investigations:</p>
<ul>
<li><strong>False seal</strong> &mdash; looks sealed, peels apart with almost no force, or leaks in the field. The layers fused cosmetically at the surface without full interdiffusion across the interface. Points to: temperature too low, dwell too short, or contamination.</li>
<li><strong>Burn-through, thinning, wrinkling</strong> &mdash; the seal is glassy, thinned, shrunken, or holed. Points to: too much energy. Temperature too high, dwell too long, or excessive pressure squeezing molten polymer out of the seal.</li>
<li><strong>Channel leak</strong> &mdash; the seal is strong everywhere except one narrow path that lets air or product through. Points to: contamination in the seal area, or a wrinkle folded into the seal before the bars closed. This is a <em>web handling</em> fault, not a temperature fault, and turning up the heat will not fix it.</li>
<li><strong>Random, intermittent weak seals with no pattern</strong> &mdash; the one that wastes the most time. Points to: inadequate cooling (see below), unstable temperature control, or worn PTFE tape on the bars.</li>
</ul>

<h2>Diagnose in this order</h2>

<h3>1. Measure the actual bar temperature &mdash; do not trust the HMI</h3>
<p>The number on the touch screen is a setpoint, not a measurement of the film. A drifting thermocouple, a failing heater cartridge or a loose connection can leave the real bar surface tens of degrees from where you think it is. Measure the bar surface directly, across its length, and check both bars. An asymmetric temperature profile along the bar produces seals that are strong at one end of the bag and weak at the other &mdash; a pattern people often misread as a pressure problem.</p>

<h3>2. Recalculate dwell time against your current speed</h3>
<p>If the problem appeared after a speed change, stop here; you have almost certainly found it. Restore the old speed and confirm the seal recovers before you go looking for anything else.</p>

<h3>3. Pressure and bar parallelism</h3>
<p>Check the closing force and, more importantly, that the bars are parallel. A bar that closes even slightly out of parallel puts more pressure on one edge of the seal than the other, and you get exactly the strong-end/weak-end pattern described above. Excessive pressure is its own fault mode: it thins the seal by displacing molten polymer, so a seal can be simultaneously over-pressured and weak.</p>

<h3>4. Cooling &mdash; the step that gets under-specified</h3>
<p>A seal has very little strength while it is still hot. That property is <strong>hot tack</strong>, and on a high-speed machine it is the property that decides whether the bag survives. Within a fraction of a second of leaving the seal bar, the bag is indexed forward under servo tension; if the bond has not been re-solidified under pressure, it is pulled apart or distorted while still molten. This is the classic source of "random" weak seals that no amount of temperature tuning fixes, because the temperature was never the problem.</p>

<h3>5. Film structure and batch variation</h3>
<p>Only after the machine is cleared should you suspect the material. Sealant layer thickness variation, a resin change the supplier did not flag, moisture in a hygroscopic layer, or a laminate delaminating under heat will all present as a seal fault. Ask for the certificate of analysis of the failing batch and compare it to a batch that ran cleanly.</p>

<h3>6. The mechanical causes people forget</h3>
<p>Worn or damaged <strong>PTFE tape</strong> on the seal bars is the most common overlooked cause: it creates hot spots, sticking, and inconsistent heat transfer, and it degrades gradually so nobody notices the day it started. Also check for build-up on the bars, and for product powder blowing into the seal area from the filling side &mdash; a contamination path that produces intermittent channel leaks and looks maddeningly random until you find it.</p>

<h2>How the JL-L-2TZP600 holds the seal window at speed</h2>
<p>The machine is built so that the sealing physics above are controlled rather than hoped for:</p>
<ul>
<li><strong>4 groups of heating bars + 2 groups of cooling bars</strong> for each seal, both vertical and horizontal. The cooling groups re-solidify the bond under pressure before the bag releases &mdash; directly addressing the hot-tack failure that causes "random" weak seals.</li>
<li><strong>Progressive multi-stage heating</strong> across those 4 heating groups, so energy builds gradually into the film rather than being dumped in at one bar.</li>
<li><strong>Temperature range up to 300 °C</strong>, covering retort-grade structures, on heat-seal laminated films such as NY/PE, PET/PE and AL/PE at 30&ndash;180 µm.</li>
<li><strong>Full-servo motion with ≤0.3 mm positional accuracy</strong>, reading registration marks with photo-eye sensors, so the seal lands where the artwork says it should &mdash; a seal in the wrong place is a seal failure too.</li>
<li><strong>Ultrasonic zipper sealing</strong>. A plastic zipper has far more thermal mass than 30&ndash;180 µm film; heat-sealing it distorts the interlocking profile. The machine bonds the 13 mm zipper with ultrasonic energy generated only at the bond interface, avoiding the external heat that would wreck the surrounding wall.</li>
<li><strong>35&ndash;220 pcs/min</strong> depending on bag style &mdash; and, per the dwell-time point above, a seal recipe validated at the speed you actually run.</li>
</ul>

<h2>Mono-material narrows the window you are working in</h2>
<p>Everything above gets harder as the industry moves to recyclable mono-material structures. In a PET/PE laminate the sealing layer and the structural layers melt at very different temperatures, giving a wide band in which the inside fuses and the outside holds its shape. In an all-PE or all-PP film there is no such margin: the temperature that seals sits close to the temperature that destroys. Drift that a conventional laminate would absorb without complaint now produces a false seal or a burn-through.</p>
<p>The capability that matters for mono-material is therefore not peak temperature &mdash; it is <strong>temperature stability and cooling capacity</strong>. We look at that shift in more detail in <a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a>.</p>

<h2>The short version</h2>
<p>Identify the failure mode before you change a setting. If the fault arrived with a speed change, it is dwell time. If seals are randomly weak with no pattern, look at cooling and at the PTFE tape before you look at temperature. If the seal leaks through one narrow channel, stop adjusting heat and go find the contamination or the wrinkle. And measure the bar &mdash; the HMI is telling you an intention, not a fact.</p>
<p><em><a href="/contact">Talk to Rey Long's engineering team</a> about running your film structure on the JL-L-2TZP600.</em></p>

<h2>Frequently asked questions</h2>
<h3>What are the three variables that control heat seal quality?</h3>
<p>Temperature, pressure and dwell time. They are not independent knobs &mdash; they trade against each other, and that is the single most useful fact when diagnosing a seal failure. If you raise line speed, dwell time falls, and the same temperature that sealed correctly yesterday now under-seals. If you raise temperature to compensate for short dwell, you move toward burn-through and film distortion. A seal recipe is a balance of all three at a given speed, on a given film. Change any one of them and the other two need re-validating.</p>
<h3>Why does a seal look perfect but still leak?</h3>
<p>That is a false seal, and it is the most expensive failure mode because it passes visual inspection and fails at the customer. The sealing layers were pressed together and cosmetically fused at the surface, but never reached full molecular interdiffusion across the interface &mdash; so the bond has almost no strength and opens under load or over time. The usual causes are temperature slightly too low, dwell time too short (often after a speed increase nobody re-validated), or contamination in the seal area: product powder, dust, or oil migrating between the layers. Visual checks cannot find it. Only a destructive peel test on a seal strength tester, or a leak test, will.</p>
<h3>What causes burn-through and wrinkling at the seal?</h3>
<p>Too much energy into the film: temperature too high, dwell too long, or pressure high enough to squeeze molten polymer out of the seal and thin the wall. The tell-tale signs are a seal that is visibly thinned or glassy, wrinkling and shrinkage adjacent to the seal bar, and in the worst case a hole. Two mechanical causes are frequently missed. First, worn or damaged PTFE tape on the seal bar creates local hot spots and sticking. Second, the temperature at the film may not be the temperature on the HMI &mdash; a drifting thermocouple or an ageing heater cartridge can put the actual bar surface tens of degrees away from setpoint. Measure the bar surface directly before you trust the display.</p>
<h3>How does cooling affect seal strength?</h3>
<p>Decisively, and it is the step most often under-specified. A seal has almost no strength while it is still hot &mdash; this is hot tack, the strength of the bond before it has cooled and crystallised. On a high-speed machine the bag is indexed forward under servo tension within a fraction of a second of leaving the seal bar, so if the bond has not been re-solidified under pressure it gets pulled apart or distorted while still molten. That failure looks like random, intermittent weak seals with no pattern, which sends people hunting for a temperature fault that is not there. The JL-L-2TZP600 addresses this structurally: each seal, vertical and horizontal, uses 4 groups of heating bars followed by 2 groups of cooling bars, so the bond is re-solidified under pressure before the bag is released.</p>
<h3>Why do mono-material films fail more often at the seal?</h3>
<p>Because their heat-seal window is much narrower. In a conventional laminate such as PET/PE, the sealing layer and the structural layers are different polymers with very different melting points, so there is a wide temperature band in which the inner layer fuses while the outer layer stays intact and supports the bag. In a mono-material film every layer belongs to the same polymer family, so the temperature that seals the film sits close to the temperature that melts, distorts or burns through it. A few degrees of drift that a PET/PE laminate would absorb without complaint produces either a false seal or burn-through. This is why temperature stability and cooling capacity &mdash; not peak temperature &mdash; are the capabilities that matter as converters move to recyclable mono-material structures.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/mono-material-recyclable-pouches-heat-seal-challenge">Mono-Material Recyclable Pouches: Solving the Heat-Seal Challenge</a></li>
<li><a href="/news/3-side-seal-vs-stand-up-zipper-pouch">Three-Side Seal vs Stand-Up Zipper Pouch: Choosing the Right Format</a></li>
<li><a href="/news/print-registration-drift-pp-woven-fabric">Print Registration Drift on PP Woven Fabric: A Diagnostic Guide</a></li>
</ul>`

const content_es = `<p>Los fallos de sellado rara vez son un misterio en cuanto se deja de tratarlos como un &uacute;nico defecto. "El sellado est&aacute; mal" describe al menos cuatro fallos distintos con cuatro causas distintas, y el camino m&aacute;s r&aacute;pido a la respuesta es leer primero el <em>modo de fallo</em> y solo despu&eacute;s empezar a mover mandos. Esta gu&iacute;a explica c&oacute;mo distinguir esos modos, en qu&eacute; orden recorrer las causas y c&oacute;mo est&aacute; construida la <a href="/es/products/hp-l-2tzp600-stand-up-zipper-pouch-machine">JL-L-2TZP600</a> para mantener el sellado dentro de su ventana a alta velocidad.</p>

<h2>Las tres variables, y por qu&eacute; no son independientes</h2>
<p>Un sellado t&eacute;rmico lo producen tres factores actuando juntos: <strong>temperatura</strong>, <strong>presi&oacute;n</strong> y <strong>tiempo de permanencia</strong> (cu&aacute;nto tiempo se mantiene la pel&iacute;cula entre las mordazas). Casi todos los problemas de sellado en producci&oacute;n son un equilibrio roto entre ellos.</p>
<p>La consecuencia pr&aacute;ctica se olvida constantemente: <strong>el tiempo de permanencia depende de la velocidad de l&iacute;nea.</strong> Suba una m&aacute;quina de 120 a 180 bolsas/min y habr&aacute; recortado un tercio del tiempo de permanencia sin tocar ning&uacute;n ajuste de temperatura. La receta que sellaba perfectamente la semana pasada ahora sella de forma insuficiente, y el operario que dice que "no cambi&oacute; nada" est&aacute; diciendo la verdad. Suba la temperatura para compensar y avanzar&aacute; hacia el fallo opuesto. Toda receta de sellado es v&aacute;lida a una velocidad y sobre una pel&iacute;cula. Cambie cualquiera de las dos y habr&aacute; que revalidarla.</p>

<h2>Lea el modo de fallo antes de tocar un ajuste</h2>
<p>Cuatro modos, cuatro investigaciones distintas:</p>
<ul>
<li><strong>Sellado falso</strong>: parece sellado, se despega casi sin fuerza o tiene fugas en destino. Las capas fundieron est&eacute;ticamente en la superficie sin interdifusi&oacute;n completa en la interfaz. Apunta a: temperatura baja, tiempo corto o contaminaci&oacute;n.</li>
<li><strong>Perforaci&oacute;n, adelgazamiento, arrugas</strong>: el sellado est&aacute; vidrioso, adelgazado, encogido o agujereado. Apunta a: exceso de energ&iacute;a. Temperatura alta, tiempo largo o presi&oacute;n excesiva que expulsa el pol&iacute;mero fundido del sellado.</li>
<li><strong>Fuga por canal</strong>: el sellado es resistente en todas partes salvo en un canal estrecho que deja pasar aire o producto. Apunta a: contaminaci&oacute;n en la zona de sellado o una arruga plegada dentro del sellado antes de cerrar las mordazas. Es un fallo de <em>manejo de banda</em>, no de temperatura, y subir el calor no lo arreglar&aacute;.</li>
<li><strong>Sellados d&eacute;biles aleatorios e intermitentes, sin patr&oacute;n</strong>: el que m&aacute;s tiempo hace perder. Apunta a: enfriamiento insuficiente (v&eacute;ase m&aacute;s abajo), control de temperatura inestable o cinta de PTFE desgastada en las mordazas.</li>
</ul>

<h2>Diagnostique en este orden</h2>

<h3>1. Mida la temperatura real de la mordaza &mdash; no se f&iacute;e de la HMI</h3>
<p>El n&uacute;mero de la pantalla t&aacute;ctil es una consigna, no una medici&oacute;n de la pel&iacute;cula. Un termopar descalibrado, una resistencia que falla o una conexi&oacute;n floja pueden dejar la superficie real de la mordaza a decenas de grados de donde usted cree. Mida directamente la superficie de la mordaza, a lo largo de toda su longitud, y compruebe ambas mordazas. Un perfil de temperatura asim&eacute;trico produce sellados fuertes en un extremo de la bolsa y d&eacute;biles en el otro, un patr&oacute;n que a menudo se confunde con un problema de presi&oacute;n.</p>

<h3>2. Recalcule el tiempo de permanencia con su velocidad actual</h3>
<p>Si el problema apareci&oacute; tras un cambio de velocidad, deténgase aqu&iacute;: es casi seguro que ya lo ha encontrado. Restablezca la velocidad anterior y confirme que el sellado se recupera antes de buscar cualquier otra cosa.</p>

<h3>3. Presi&oacute;n y paralelismo de las mordazas</h3>
<p>Compruebe la fuerza de cierre y, sobre todo, que las mordazas est&eacute;n paralelas. Una mordaza que cierra aunque sea ligeramente fuera de paralelo aplica m&aacute;s presi&oacute;n en un borde del sellado que en el otro, y aparece exactamente el patr&oacute;n fuerte-d&eacute;bil descrito arriba. La presi&oacute;n excesiva es un modo de fallo en s&iacute; misma: adelgaza el sellado al desplazar pol&iacute;mero fundido, de modo que un sellado puede estar simult&aacute;neamente sobrepresionado y d&eacute;bil.</p>

<h3>4. Enfriamiento &mdash; el paso peor dimensionado</h3>
<p>Un sellado tiene muy poca resistencia mientras sigue caliente. Esa propiedad es el <strong>hot tack</strong>, y en una m&aacute;quina de alta velocidad es la que decide si la bolsa sobrevive. En una fracci&oacute;n de segundo tras salir de la mordaza, la bolsa avanza bajo tensi&oacute;n de servo; si la uni&oacute;n no se ha resolidificado bajo presi&oacute;n, se desgarra o se deforma a&uacute;n fundida. Esta es la fuente cl&aacute;sica de los sellados d&eacute;biles "aleatorios" que ning&uacute;n ajuste de temperatura corrige, porque la temperatura nunca fue el problema.</p>

<h3>5. Estructura de la pel&iacute;cula y variaci&oacute;n entre lotes</h3>
<p>Solo despu&eacute;s de descartar la m&aacute;quina conviene sospechar del material. La variaci&oacute;n de espesor de la capa sellante, un cambio de resina que el proveedor no comunic&oacute;, humedad en una capa higrosc&oacute;pica o un laminado que delamina con el calor se presentan todos como un fallo de sellado. Pida el certificado de an&aacute;lisis del lote defectuoso y comp&aacute;relo con uno que corri&oacute; limpio.</p>

<h3>6. Las causas mec&aacute;nicas que se olvidan</h3>
<p>La <strong>cinta de PTFE</strong> desgastada o da&ntilde;ada en las mordazas es la causa pasada por alto m&aacute;s frecuente: genera puntos calientes, adherencias y transferencia de calor irregular, y se degrada de forma gradual, as&iacute; que nadie nota el d&iacute;a en que empez&oacute;. Revise tambi&eacute;n la acumulaci&oacute;n de residuos en las mordazas y el polvo de producto que llega a la zona de sellado desde el lado de llenado: una v&iacute;a de contaminaci&oacute;n que produce fugas por canal intermitentes y parece exasperantemente aleatoria hasta que se encuentra.</p>

<h2>C&oacute;mo la JL-L-2TZP600 mantiene la ventana de sellado a velocidad</h2>
<p>La m&aacute;quina est&aacute; construida para que la f&iacute;sica del sellado se controle y no se deje al azar:</p>
<ul>
<li><strong>4 grupos de mordazas de calentamiento + 2 grupos de enfriamiento</strong> en cada sellado, vertical y horizontal. Los grupos de enfriamiento resolidifican la uni&oacute;n bajo presi&oacute;n antes de liberar la bolsa, atacando directamente el fallo de hot tack que causa los sellados d&eacute;biles "aleatorios".</li>
<li><strong>Calentamiento progresivo multietapa</strong> a lo largo de esos 4 grupos, de modo que la energ&iacute;a entra gradualmente en la pel&iacute;cula en vez de descargarse de golpe en una sola mordaza.</li>
<li><strong>Rango de temperatura hasta 300 °C</strong>, que cubre estructuras de grado retort, sobre pel&iacute;culas laminadas termosellables como NY/PE, PET/PE y AL/PE de 30&ndash;180 µm.</li>
<li><strong>Movimiento totalmente servo con precisi&oacute;n de posici&oacute;n ≤0,3 mm</strong>, leyendo marcas de registro con sensores fotoel&eacute;ctricos, para que el sellado caiga donde el dise&ntilde;o indica: un sellado en el lugar equivocado tambi&eacute;n es un sellado fallido.</li>
<li><strong>Sellado de cierre por ultrasonidos</strong>. Un cierre de pl&aacute;stico tiene mucha m&aacute;s masa t&eacute;rmica que una pel&iacute;cula de 30&ndash;180 µm; sellarlo con calor deforma el perfil de encaje. La m&aacute;quina une el cierre de 13 mm con energ&iacute;a ultras&oacute;nica generada solo en la interfaz de uni&oacute;n, evitando el calor externo que destruir&iacute;a la pared circundante.</li>
<li><strong>35&ndash;220 bolsas/min</strong> seg&uacute;n el formato &mdash; y, seg&uacute;n lo dicho sobre el tiempo de permanencia, una receta de sellado validada a la velocidad a la que realmente se produce.</li>
</ul>

<h2>El monomaterial estrecha la ventana en la que usted trabaja</h2>
<p>Todo lo anterior se complica a medida que el sector migra a estructuras monomaterial reciclables. En un laminado PET/PE, la capa de sellado y las estructurales funden a temperaturas muy distintas, lo que da una banda amplia en la que el interior funde y el exterior conserva su forma. En una pel&iacute;cula de todo PE o todo PP no existe ese margen: la temperatura que sella est&aacute; cerca de la que destruye. Una desviaci&oacute;n que un laminado convencional absorber&iacute;a sin problema produce ahora un sellado falso o una perforaci&oacute;n.</p>
<p>Por tanto, la capacidad que importa para el monomaterial no es la temperatura m&aacute;xima, sino la <strong>estabilidad t&eacute;rmica y la capacidad de enfriamiento</strong>. Analizamos ese cambio con m&aacute;s detalle en <a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: c&oacute;mo resolver el reto del sellado t&eacute;rmico</a>.</p>

<h2>En resumen</h2>
<p>Identifique el modo de fallo antes de cambiar un ajuste. Si el fallo lleg&oacute; con un cambio de velocidad, es el tiempo de permanencia. Si los sellados son d&eacute;biles de forma aleatoria y sin patr&oacute;n, mire el enfriamiento y la cinta de PTFE antes que la temperatura. Si la fuga es por un canal estrecho, deje de ajustar el calor y busque la contaminaci&oacute;n o la arruga. Y mida la mordaza: la HMI le est&aacute; comunicando una intenci&oacute;n, no un hecho.</p>
<p><em><a href="/es/contact">Hable con el equipo de ingenier&iacute;a de Rey Long</a> sobre el procesamiento de su estructura de pel&iacute;cula en la JL-L-2TZP600.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Cu&aacute;les son las tres variables que controlan la calidad del sellado t&eacute;rmico?</h3>
<p>Temperatura, presi&oacute;n y tiempo de permanencia. No son mandos independientes: se compensan entre s&iacute;, y ese es el dato m&aacute;s &uacute;til al diagnosticar un fallo de sellado. Si aumenta la velocidad de l&iacute;nea, el tiempo de permanencia baja, y la misma temperatura que ayer sellaba correctamente hoy sella de forma insuficiente. Si sube la temperatura para compensar un tiempo corto, se acerca a la perforaci&oacute;n por calor y a la deformaci&oacute;n de la pel&iacute;cula. Una receta de sellado es el equilibrio de las tres a una velocidad dada y sobre una pel&iacute;cula dada. Si cambia una, hay que revalidar las otras dos.</p>
<h3>&iquest;Por qu&eacute; un sellado parece perfecto y aun as&iacute; tiene fugas?</h3>
<p>Eso es un sellado falso, y es el modo de fallo m&aacute;s caro porque supera la inspecci&oacute;n visual y falla en casa del cliente. Las capas de sellado se prensaron y fundieron est&eacute;ticamente en la superficie, pero nunca alcanzaron una interdifusi&oacute;n molecular completa a trav&eacute;s de la interfaz, de modo que la uni&oacute;n casi no tiene resistencia y se abre bajo carga o con el tiempo. Las causas habituales son una temperatura ligeramente baja, un tiempo de permanencia demasiado corto (a menudo tras un aumento de velocidad que nadie revalid&oacute;) o contaminaci&oacute;n en la zona de sellado: polvo de producto, suciedad o aceite migrando entre las capas. Las comprobaciones visuales no lo detectan. Solo un ensayo destructivo de pelado en un dinamómetro de sellado, o una prueba de fugas, lo har&aacute;.</p>
<h3>&iquest;Qu&eacute; causa la perforaci&oacute;n por calor y las arrugas en el sellado?</h3>
<p>Demasiada energ&iacute;a en la pel&iacute;cula: temperatura demasiado alta, tiempo demasiado largo o presi&oacute;n suficiente para expulsar el pol&iacute;mero fundido del sellado y adelgazar la pared. Las se&ntilde;ales son un sellado visiblemente adelgazado o vidrioso, arrugas y encogimiento junto a la mordaza y, en el peor caso, un agujero. Dos causas mec&aacute;nicas se pasan por alto con frecuencia. Primera: la cinta de PTFE de la mordaza desgastada o da&ntilde;ada genera puntos calientes localizados y adherencias. Segunda: la temperatura en la pel&iacute;cula puede no ser la de la HMI &mdash; un termopar descalibrado o una resistencia envejecida pueden dejar la superficie real de la mordaza a decenas de grados del valor de consigna. Mida directamente la superficie de la mordaza antes de fiarse de la pantalla.</p>
<h3>&iquest;C&oacute;mo afecta el enfriamiento a la resistencia del sellado?</h3>
<p>De forma decisiva, y es el paso peor dimensionado con m&aacute;s frecuencia. Un sellado apenas tiene resistencia mientras sigue caliente: es el hot tack, la resistencia de la uni&oacute;n antes de enfriarse y cristalizar. En una m&aacute;quina de alta velocidad, la bolsa avanza bajo tensi&oacute;n de servo en una fracci&oacute;n de segundo tras salir de la mordaza, de modo que si la uni&oacute;n no se ha resolidificado bajo presi&oacute;n, se desgarra o se deforma a&uacute;n fundida. Ese fallo se manifiesta como sellados d&eacute;biles aleatorios e intermitentes sin patr&oacute;n, lo que lleva a buscar un fallo de temperatura que no existe. La JL-L-2TZP600 lo aborda estructuralmente: cada sellado, vertical y horizontal, emplea 4 grupos de mordazas de calentamiento seguidos de 2 grupos de enfriamiento, de modo que la uni&oacute;n se resolidifica bajo presi&oacute;n antes de liberar la bolsa.</p>
<h3>&iquest;Por qu&eacute; las pel&iacute;culas monomaterial fallan m&aacute;s en el sellado?</h3>
<p>Porque su ventana de sellado t&eacute;rmico es mucho m&aacute;s estrecha. En un laminado convencional como PET/PE, la capa de sellado y las capas estructurales son pol&iacute;meros distintos con puntos de fusi&oacute;n muy diferentes, por lo que existe una banda amplia de temperatura en la que la capa interior funde mientras la exterior permanece intacta y sostiene la bolsa. En una pel&iacute;cula monomaterial todas las capas pertenecen a la misma familia de pol&iacute;meros, as&iacute; que la temperatura que sella est&aacute; cerca de la que funde, deforma o perfora. Unos pocos grados de desviaci&oacute;n que un laminado PET/PE absorber&iacute;a sin problema producen aqu&iacute; un sellado falso o una perforaci&oacute;n. Por eso la estabilidad t&eacute;rmica y la capacidad de enfriamiento &mdash; no la temperatura m&aacute;xima &mdash; son las capacidades que importan a medida que los transformadores migran a estructuras monomaterial reciclables.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/mono-material-recyclable-pouches-heat-seal-challenge">Bolsas reciclables monomaterial: c&oacute;mo resolver el reto del sellado t&eacute;rmico</a></li>
<li><a href="/es/news/3-side-seal-vs-stand-up-zipper-pouch">Bolsa de tres sellos frente a doypack con cierre: c&oacute;mo elegir el formato</a></li>
<li><a href="/es/news/print-registration-drift-pp-woven-fabric">Desviaci&oacute;n del registro de impresi&oacute;n en tejido PP: gu&iacute;a de diagn&oacute;stico</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-13T09:00:00Z',
  cover_image_url: 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/hp-l-2tzp600-stand-up-zipper-pouch-machine/cover.jpg',
  title_en: 'Heat Seal Failures in Pouch Production: A Diagnostic Guide',
  title_es: 'Fallos de sellado térmico en la producción de bolsas: guía de diagnóstico',
  summary_en: 'False seals, burn-through, channel leaks and random weak seals are four different faults with four different causes. How to read the failure mode, the order to work through temperature, dwell, pressure and cooling, and why the HMI is telling you an intention rather than a fact.',
  summary_es: 'Sellados falsos, perforaciones, fugas por canal y sellados débiles aleatorios son cuatro fallos distintos con cuatro causas distintas. Cómo leer el modo de fallo, en qué orden revisar temperatura, tiempo, presión y enfriamiento, y por qué la HMI le comunica una intención, no un hecho.',
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

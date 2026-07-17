// Seed the technical guide: "Manual vs AI Inspection on Woven Bag Lines: An Honest Comparison"
//
// FACT BOUNDARY (do not blur this when editing):
//   - Industry numbers and their sources: human inspectors miss 20–30% of defects, attention
//     degrades after ~2 h (Sandia National Laboratories research); inter-inspector agreement
//     55–70% (published inspection-reliability studies); AI false-reject <1% vs manual 10–20%
//     (figures published across the machine-vision industry). Attribute as written.
//   - Rey Long numbers come from the DB and are application-dependent TARGETS: 95%+ recall,
//     scrap toward ~2% from ~5%, print yield +~5%, 1 operator supervising up to 4 machines vs 2.
//   - The guide argues honestly FOR manual inspection in specific cases — keep that section.
//   - No closed-loop colour registration claims. Detection and alerting only.
//
// The visible FAQ block at the end of the body mirrors the `faq` column exactly.
//
// Idempotent. Run: node scripts/seed-guide-manual-vs-ai-inspection.mjs
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

const SLUG = 'manual-vs-ai-inspection-woven-bag-lines'

const faq = [
  {
    q_en: 'How accurate is manual visual inspection really?',
    a_en: 'Research at Sandia National Laboratories found that trained human inspectors miss 20–30% of defects even under good conditions, and published inspection-reliability studies put agreement between different inspectors on the same product at only 55–70%. Attention also degrades markedly after about two hours of continuous visual work, so the miss rate is worst exactly when it matters most: late in the shift, on long runs. None of this is a criticism of inspectors — it is what sustained vigilance tasks do to human attention.',
    q_es: '¿Qué precisión tiene realmente la inspección visual manual?',
    a_es: 'La investigación de Sandia National Laboratories halló que los inspectores humanos entrenados pasan por alto el 20–30% de los defectos incluso en buenas condiciones, y los estudios publicados de fiabilidad de inspección sitúan el acuerdo entre distintos inspectores sobre el mismo producto en solo el 55–70%. La atención además se degrada notablemente tras unas dos horas de trabajo visual continuo, así que la tasa de fallos es peor justo cuando más importa: al final del turno, en tiradas largas. Nada de esto es una crítica a los inspectores — es lo que las tareas de vigilancia sostenida hacen con la atención humana.',
  },
  {
    q_en: 'When is manual inspection still the right choice?',
    a_en: 'Four situations favour keeping inspection manual: very short runs with constant artwork changes, where the reference-building effort outweighs the run; genuinely subjective quality criteria, such as overall colour impression, that a camera cannot arbitrate; low line speeds on a single shift, where a person can actually keep up; and products whose defects are tactile rather than visual, such as hand feel or stiffness. AI inspection earns its cost on long runs, high speeds, multi-shift operations and recurring visible defects — not everywhere.',
    q_es: '¿Cuándo sigue siendo la inspección manual la opción correcta?',
    a_es: 'Cuatro situaciones favorecen mantener la inspección manual: tiradas muy cortas con cambios constantes de arte, donde el esfuerzo de construir la referencia supera a la tirada; criterios de calidad genuinamente subjetivos, como la impresión general del color, que una cámara no puede arbitrar; velocidades bajas en un solo turno, donde una persona realmente puede seguir el ritmo; y productos cuyos defectos son táctiles y no visuales, como el tacto o la rigidez. La inspección por IA amortiza su coste en tiradas largas, velocidades altas, operaciones multiturno y defectos visibles recurrentes — no en todas partes.',
  },
  {
    q_en: 'How much waste does AI inspection actually save?',
    a_en: 'The honest answer is a range, because it depends on your current defect profile. Rey Long deployments target scrap reduced toward roughly 2% from a typical 5% baseline, with print yield improving by around 5% — both application-dependent figures established during commissioning, not guarantees. The mechanism is simple: a recurring fault caught on the second bag instead of at end-of-shift stops being a pallet-level loss. On a conversion line running 25–40 bags/min, one uncaught recurring print defect can consume an hour of production — 1,500 to 2,400 bags — before a manual check catches it.',
    q_es: '¿Cuánto desperdicio ahorra realmente la inspección por IA?',
    a_es: 'La respuesta honesta es un rango, porque depende de su perfil actual de defectos. Las implementaciones de Rey Long apuntan a reducir el desperdicio hacia aproximadamente el 2% desde una base típica del 5%, con una mejora del rendimiento de impresión en torno al 5% — ambas cifras dependen de la aplicación y se establecen durante la puesta en marcha; no son garantías. El mecanismo es simple: un fallo recurrente detectado en el segundo saco en lugar de al final del turno deja de ser una pérdida a nivel de palet. En una línea de conversión a 25–40 sacos/min, un defecto de impresión recurrente sin detectar puede consumir una hora de producción — de 1.500 a 2.400 sacos — antes de que un control manual lo encuentre.',
  },
  {
    q_en: 'Does AI inspection eliminate inspection jobs?',
    a_en: 'In Rey Long deployments it changes the ratio rather than eliminating the role: one operator can supervise up to four machines instead of two, because the system watches the output and the operator responds to alerts, changeovers and judgement calls. The tasks that disappear are the ones humans do worst — uninterrupted staring at a moving web — and the tasks that remain are the ones that actually use human skill. Whether headcount changes is a management decision, not a property of the technology.',
    q_es: '¿La inspección por IA elimina puestos de inspección?',
    a_es: 'En las implementaciones de Rey Long cambia la proporción en lugar de eliminar la función: un operario puede supervisar hasta cuatro máquinas en lugar de dos, porque el sistema vigila la producción y el operario responde a alertas, cambios de formato y decisiones de criterio. Las tareas que desaparecen son las que los humanos hacen peor — mirar sin interrupción una banda en movimiento — y las que quedan son las que realmente usan la destreza humana. Que la plantilla cambie o no es una decisión de gestión, no una propiedad de la tecnología.',
  },
  {
    q_en: 'What does an AI inspection system cost compared to manual inspection?',
    a_en: 'The cost structures are different shapes: manual inspection is a recurring cost that scales with shifts and lines, while an AI system is mostly a one-time project cost (cameras, lighting, edge hardware, integration and commissioning) plus minor upkeep. Rey Long scopes each system case by case — camera count, lighting and integration depth vary with the machine and the defect classes — so there is no meaningful list price; the comparison that matters is project cost against your current cost of scrap, claims and inspection labour. Send your machine type and defect history for a scoped assessment.',
    q_es: '¿Cuánto cuesta un sistema de inspección por IA comparado con la inspección manual?',
    a_es: 'Las estructuras de coste tienen formas distintas: la inspección manual es un coste recurrente que escala con turnos y líneas, mientras que un sistema de IA es sobre todo un coste de proyecto único (cámaras, iluminación, hardware edge, integración y puesta en marcha) más un mantenimiento menor. Rey Long dimensiona cada sistema caso por caso — el número de cámaras, la iluminación y la profundidad de integración varían con la máquina y las clases de defecto —, así que no existe un precio de lista significativo; la comparación que importa es el coste del proyecto frente a su coste actual de desperdicio, reclamaciones y mano de obra de inspección. Envíe su tipo de máquina e historial de defectos para una evaluación dimensionada.',
  },
]

const content_en = `<p>Manual inspection misses 20&ndash;30% of defects even under good conditions &mdash; that figure comes from <a href="https://www.osti.gov/biblio/1055636">research at Sandia National Laboratories</a>, not from a vendor brochure &mdash; while an AI vision system inspects every bag at line speed with the same attention on bag ten thousand as on bag one. That asymmetry, not any single accuracy number, is the real argument for automating inspection on a woven bag line. It is also not the whole story: there are runs where manual inspection remains the right choice, and this guide covers both sides.</p>

<h2>What human inspection actually delivers</h2>
<p>The published evidence on sustained visual inspection is consistent and sobering:</p>
<ul>
<li><strong>20&ndash;30% of defects are missed</strong> by trained inspectors under good conditions (Sandia National Laboratories research on inspection reliability).</li>
<li><strong>Attention degrades after about two hours</strong> of continuous visual work &mdash; the miss rate climbs exactly when long runs need it lowest.</li>
<li><strong>Inspectors disagree with each other.</strong> Published inspection-reliability studies put inter-inspector agreement at 55&ndash;70%, meaning the same bag can pass one shift and fail the next.</li>
<li><strong>False rejects run high.</strong> Figures published across the machine-vision industry put manual false-reject rates around 10&ndash;20% &mdash; good product thrown out, quietly inflating scrap.</li>
</ul>
<p>None of this is a criticism of the people doing the work. Staring at a moving web for hours is a vigilance task, and vigilance tasks are precisely what human attention is worst at sustaining. The inspector's real skill &mdash; judgement about what matters and what to do about it &mdash; is wasted on the staring part.</p>

<h2>What changes when a camera watches the line</h2>
<p>An AI vision system running on <a href="/products/ai-machine-intelligence-solutions">edge hardware at the machine</a> changes four things structurally, not incrementally:</p>
<ul>
<li><strong>Coverage becomes 100%.</strong> Every bag is inspected, not a sample. A defect that appears on one bag in fifty is invisible to sampling and obvious to full inspection.</li>
<li><strong>Consistency becomes absolute.</strong> The model applies the same criteria on every bag, every shift. The pass/fail line stops moving with fatigue, mood or staffing.</li>
<li><strong>Latency collapses.</strong> A recurring fault triggers an alert while the count is two, not two thousand. On a <a href="/products/automatic-printing-tubing-cutting-sewing-line">conversion line at 25&ndash;40 bags/min</a>, an hour of uncaught recurring defect is 1,500&ndash;2,400 bags.</li>
<li><strong>False rejects drop.</strong> Industry-published figures put AI false-reject rates below 1%, against 10&ndash;20% for manual inspection &mdash; which matters twice, once as saved good product and once because a system that rarely cries wolf is a system operators actually trust.</li>
</ul>
<p>Rey Long's deployment target is 95%+ defect recall, and the qualifier belongs in the same sentence: the achieved figure is application-dependent &mdash; fabric, artwork, lighting and defect classes all move it &mdash; and it is established during commissioning on your product. What the system detects, and what it deliberately does not attempt (closed-loop colour correction among other things), is covered in <a href="/news/ai-visual-inspection-woven-bag-printing">the companion guide on AI visual inspection</a>.</p>

<h2>The economics, without the marketing</h2>
<p>The honest cost comparison has two different shapes rather than two numbers. Manual inspection is a <em>recurring</em> cost: it scales with every added shift and every added line, forever. An AI system is mostly a <em>one-time</em> project cost &mdash; cameras, lighting, edge hardware, integration, commissioning &mdash; plus minor upkeep.</p>
<p>What the project buys, in Rey Long deployments, are application-dependent targets rather than guarantees: scrap reduced toward roughly 2% from a typical 5% baseline, print yield up by around 5%, and one operator supervising up to four machines instead of two. Whether those numbers repay the project on <em>your</em> line depends on three things you already know: your line speed, your current scrap and claim costs, and how many shifts you run. A single-shift line running short artisan runs will struggle to repay any inspection system; a three-shift line feeding a supermarket contract repays it in claims avoided alone.</p>

<h2>When manual inspection is still the right answer</h2>
<p>Recommending automation everywhere would be dishonest. Keep inspection manual when:</p>
<ul>
<li><strong>Runs are short and artwork changes constantly.</strong> Few-shot deployment needs ~50 reference samples per product; on a run of 500 bags with weekly artwork changes, reference-building eats the benefit.</li>
<li><strong>The quality criterion is genuinely subjective.</strong> Overall colour impression against a brand standard is a human call (and ultimately a colorimetry instrument's) &mdash; a vision model flags deviation, it does not arbitrate taste.</li>
<li><strong>The defect is tactile.</strong> Hand feel, stiffness, coating tack &mdash; no camera sees these.</li>
<li><strong>The line is slow and single-shift.</strong> At low speeds a person genuinely can keep up, and the fatigue math is kinder on one shift than on three.</li>
</ul>

<h2>The short version</h2>
<p>The case for AI inspection is not that a model is smarter than an inspector &mdash; it is that a camera does not get tired, does not sample, and does not move the pass/fail line between shifts, on a task where documented human performance misses a fifth to a third of defects. The case for manual inspection is real but specific: short runs, subjective criteria, tactile defects, slow single-shift lines. If your line runs long jobs across multiple shifts at 25+ bags/min, the numbers usually point one way &mdash; and <a href="/news/retrofit-edge-ai-inspection-woven-bag-line">retrofitting the system onto the machines you already own</a> is a smaller project than most factories expect.</p>
<p><em><a href="/contact/">Ask Rey Long's engineering team</a> for a scoped assessment against your defect history and line speeds.</em></p>

<h2>Frequently asked questions</h2>
<h3>How accurate is manual visual inspection really?</h3>
<p>Research at Sandia National Laboratories found that trained human inspectors miss 20&ndash;30% of defects even under good conditions, and published inspection-reliability studies put agreement between different inspectors on the same product at only 55&ndash;70%. Attention also degrades markedly after about two hours of continuous visual work, so the miss rate is worst exactly when it matters most: late in the shift, on long runs. None of this is a criticism of inspectors &mdash; it is what sustained vigilance tasks do to human attention.</p>
<h3>When is manual inspection still the right choice?</h3>
<p>Four situations favour keeping inspection manual: very short runs with constant artwork changes, where the reference-building effort outweighs the run; genuinely subjective quality criteria, such as overall colour impression, that a camera cannot arbitrate; low line speeds on a single shift, where a person can actually keep up; and products whose defects are tactile rather than visual, such as hand feel or stiffness. AI inspection earns its cost on long runs, high speeds, multi-shift operations and recurring visible defects &mdash; not everywhere.</p>
<h3>How much waste does AI inspection actually save?</h3>
<p>The honest answer is a range, because it depends on your current defect profile. Rey Long deployments target scrap reduced toward roughly 2% from a typical 5% baseline, with print yield improving by around 5% &mdash; both application-dependent figures established during commissioning, not guarantees. The mechanism is simple: a recurring fault caught on the second bag instead of at end-of-shift stops being a pallet-level loss. On a conversion line running 25&ndash;40 bags/min, one uncaught recurring print defect can consume an hour of production &mdash; 1,500 to 2,400 bags &mdash; before a manual check catches it.</p>
<h3>Does AI inspection eliminate inspection jobs?</h3>
<p>In Rey Long deployments it changes the ratio rather than eliminating the role: one operator can supervise up to four machines instead of two, because the system watches the output and the operator responds to alerts, changeovers and judgement calls. The tasks that disappear are the ones humans do worst &mdash; uninterrupted staring at a moving web &mdash; and the tasks that remain are the ones that actually use human skill. Whether headcount changes is a management decision, not a property of the technology.</p>
<h3>What does an AI inspection system cost compared to manual inspection?</h3>
<p>The cost structures are different shapes: manual inspection is a recurring cost that scales with shifts and lines, while an AI system is mostly a one-time project cost (cameras, lighting, edge hardware, integration and commissioning) plus minor upkeep. Rey Long scopes each system case by case &mdash; camera count, lighting and integration depth vary with the machine and the defect classes &mdash; so there is no meaningful list price; the comparison that matters is project cost against your current cost of scrap, claims and inspection labour. Send your machine type and defect history for a scoped assessment.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/ai-visual-inspection-woven-bag-printing">AI Visual Inspection on Woven Bag Lines: What It Catches &mdash; and What It Misses</a></li>
<li><a href="/news/retrofit-edge-ai-inspection-woven-bag-line">Retrofitting Edge AI Inspection onto an Existing Bag Line</a></li>
<li><a href="/case-studies/taiwan-ai-predictive-maintenance">Case study: AI predictive maintenance on a Taiwan bag line</a></li>
</ul>`

const content_es = `<p>La inspecci&oacute;n manual pasa por alto el 20&ndash;30% de los defectos incluso en buenas condiciones &mdash; la cifra procede de la <a href="https://www.osti.gov/biblio/1055636">investigaci&oacute;n de Sandia National Laboratories</a>, no de un folleto comercial &mdash;, mientras que un sistema de visi&oacute;n por IA inspecciona cada saco a velocidad de l&iacute;nea con la misma atenci&oacute;n en el saco diez mil que en el primero. Esa asimetr&iacute;a, y no ninguna cifra aislada de precisi&oacute;n, es el argumento real para automatizar la inspecci&oacute;n en una l&iacute;nea de sacos tejidos. Tampoco es toda la historia: hay tiradas donde la inspecci&oacute;n manual sigue siendo la opci&oacute;n correcta, y esta gu&iacute;a cubre ambos lados.</p>

<h2>Lo que la inspecci&oacute;n humana realmente ofrece</h2>
<p>La evidencia publicada sobre inspecci&oacute;n visual sostenida es consistente y aleccionadora:</p>
<ul>
<li><strong>Se pasa por alto el 20&ndash;30% de los defectos</strong>, incluso con inspectores entrenados y en buenas condiciones (investigaci&oacute;n de Sandia National Laboratories sobre fiabilidad de inspecci&oacute;n).</li>
<li><strong>La atenci&oacute;n se degrada tras unas dos horas</strong> de trabajo visual continuo &mdash; la tasa de fallos sube justo cuando las tiradas largas necesitan que baje.</li>
<li><strong>Los inspectores discrepan entre s&iacute;.</strong> Los estudios publicados de fiabilidad sit&uacute;an el acuerdo entre inspectores en el 55&ndash;70%: el mismo saco puede aprobar en un turno y suspender en el siguiente.</li>
<li><strong>Los rechazos falsos son altos.</strong> Las cifras publicadas en el sector de la visi&oacute;n artificial sit&uacute;an los rechazos falsos manuales en torno al 10&ndash;20% &mdash; producto bueno desechado, inflando el desperdicio en silencio.</li>
</ul>
<p>Nada de esto es una cr&iacute;tica a las personas que hacen el trabajo. Mirar una banda en movimiento durante horas es una tarea de vigilancia, y las tareas de vigilancia son precisamente lo que peor sostiene la atenci&oacute;n humana. La verdadera destreza del inspector &mdash; el criterio sobre lo que importa y qu&eacute; hacer al respecto &mdash; se desperdicia en la parte de mirar.</p>

<h2>Qu&eacute; cambia cuando una c&aacute;mara vigila la l&iacute;nea</h2>
<p>Un sistema de visi&oacute;n por IA ejecut&aacute;ndose en <a href="/es/products/ai-machine-intelligence-solutions">hardware edge en la m&aacute;quina</a> cambia cuatro cosas de forma estructural, no incremental:</p>
<ul>
<li><strong>La cobertura pasa a ser del 100%.</strong> Se inspecciona cada saco, no una muestra. Un defecto que aparece en un saco de cada cincuenta es invisible para el muestreo y evidente para la inspecci&oacute;n total.</li>
<li><strong>La consistencia pasa a ser absoluta.</strong> El modelo aplica los mismos criterios en cada saco, en cada turno. La l&iacute;nea de aprobado/rechazado deja de moverse con la fatiga, el &aacute;nimo o la plantilla.</li>
<li><strong>La latencia se desploma.</strong> Un fallo recurrente dispara una alerta cuando la cuenta va por dos, no por dos mil. En una <a href="/es/products/automatic-printing-tubing-cutting-sewing-line">l&iacute;nea de conversi&oacute;n a 25&ndash;40 sacos/min</a>, una hora de defecto recurrente sin detectar son 1.500&ndash;2.400 sacos.</li>
<li><strong>Los rechazos falsos caen.</strong> Las cifras publicadas del sector sit&uacute;an los rechazos falsos de la IA por debajo del 1%, frente al 10&ndash;20% de la inspecci&oacute;n manual &mdash; lo que importa dos veces: como producto bueno salvado y porque un sistema que rara vez grita "lobo" es un sistema en el que los operarios conf&iacute;an.</li>
</ul>
<p>El objetivo de implementaci&oacute;n de Rey Long es superar el 95% de detecci&oacute;n de defectos, y el matiz va en la misma frase: la cifra alcanzada depende de la aplicaci&oacute;n &mdash; tejido, arte, iluminaci&oacute;n y clases de defecto la mueven &mdash; y se establece durante la puesta en marcha sobre su producto. Lo que el sistema detecta, y lo que deliberadamente no intenta (la correcci&oacute;n de color en lazo cerrado, entre otras cosas), se explica en <a href="/es/news/ai-visual-inspection-woven-bag-printing">la gu&iacute;a complementaria sobre inspecci&oacute;n visual por IA</a>.</p>

<h2>La econom&iacute;a, sin el marketing</h2>
<p>La comparaci&oacute;n honesta de costes tiene dos formas distintas, no dos n&uacute;meros. La inspecci&oacute;n manual es un coste <em>recurrente</em>: escala con cada turno y cada l&iacute;nea a&ntilde;adida, para siempre. Un sistema de IA es sobre todo un coste de proyecto <em>&uacute;nico</em> &mdash; c&aacute;maras, iluminaci&oacute;n, hardware edge, integraci&oacute;n, puesta en marcha &mdash; m&aacute;s un mantenimiento menor.</p>
<p>Lo que el proyecto compra, en las implementaciones de Rey Long, son objetivos dependientes de la aplicaci&oacute;n y no garant&iacute;as: desperdicio reducido hacia aproximadamente el 2% desde una base t&iacute;pica del 5%, rendimiento de impresi&oacute;n mejorado en torno al 5%, y un operario supervisando hasta cuatro m&aacute;quinas en lugar de dos. Que esas cifras amorticen el proyecto en <em>su</em> l&iacute;nea depende de tres cosas que usted ya conoce: su velocidad de l&iacute;nea, sus costes actuales de desperdicio y reclamaciones, y cu&aacute;ntos turnos opera. Una l&iacute;nea de un turno con tiradas cortas artesanales dif&iacute;cilmente amortiza ning&uacute;n sistema de inspecci&oacute;n; una l&iacute;nea de tres turnos alimentando un contrato de supermercado lo amortiza solo con las reclamaciones evitadas.</p>

<h2>Cu&aacute;ndo la inspecci&oacute;n manual sigue siendo la respuesta correcta</h2>
<p>Recomendar la automatizaci&oacute;n en todas partes ser&iacute;a deshonesto. Mantenga la inspecci&oacute;n manual cuando:</p>
<ul>
<li><strong>Las tiradas son cortas y el arte cambia constantemente.</strong> La implementaci&oacute;n few-shot necesita ~50 muestras de referencia por producto; en una tirada de 500 sacos con cambios de arte semanales, construir la referencia se come el beneficio.</li>
<li><strong>El criterio de calidad es genuinamente subjetivo.</strong> La impresi&oacute;n general del color frente a un est&aacute;ndar de marca es una decisi&oacute;n humana (y en &uacute;ltima instancia de un instrumento de colorimetr&iacute;a) &mdash; un modelo de visi&oacute;n se&ntilde;ala desviaciones, no arbitra gustos.</li>
<li><strong>El defecto es t&aacute;ctil.</strong> El tacto, la rigidez, la pegajosidad del recubrimiento &mdash; ninguna c&aacute;mara los ve.</li>
<li><strong>La l&iacute;nea es lenta y de un solo turno.</strong> A velocidades bajas una persona realmente puede seguir el ritmo, y la matem&aacute;tica de la fatiga es m&aacute;s amable en un turno que en tres.</li>
</ul>

<h2>En resumen</h2>
<p>El argumento a favor de la inspecci&oacute;n por IA no es que un modelo sea m&aacute;s listo que un inspector &mdash; es que una c&aacute;mara no se cansa, no muestrea y no mueve la l&iacute;nea de aprobado/rechazado entre turnos, en una tarea donde el rendimiento humano documentado pasa por alto de una quinta a una tercera parte de los defectos. El argumento a favor de la inspecci&oacute;n manual es real pero espec&iacute;fico: tiradas cortas, criterios subjetivos, defectos t&aacute;ctiles, l&iacute;neas lentas de un turno. Si su l&iacute;nea corre trabajos largos en varios turnos a 25+ sacos/min, los n&uacute;meros suelen apuntar en una direcci&oacute;n &mdash; e <a href="/es/news/retrofit-edge-ai-inspection-woven-bag-line">instalar el sistema sobre las m&aacute;quinas que ya posee</a> es un proyecto m&aacute;s peque&ntilde;o de lo que la mayor&iacute;a de las f&aacute;bricas espera.</p>
<p><em><a href="/contact/">Pida al equipo de ingenier&iacute;a de Rey Long</a> una evaluaci&oacute;n dimensionada contra su historial de defectos y sus velocidades de l&iacute;nea.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Qu&eacute; precisi&oacute;n tiene realmente la inspecci&oacute;n visual manual?</h3>
<p>La investigaci&oacute;n de Sandia National Laboratories hall&oacute; que los inspectores humanos entrenados pasan por alto el 20&ndash;30% de los defectos incluso en buenas condiciones, y los estudios publicados de fiabilidad de inspecci&oacute;n sit&uacute;an el acuerdo entre distintos inspectores sobre el mismo producto en solo el 55&ndash;70%. La atenci&oacute;n adem&aacute;s se degrada notablemente tras unas dos horas de trabajo visual continuo, as&iacute; que la tasa de fallos es peor justo cuando m&aacute;s importa: al final del turno, en tiradas largas. Nada de esto es una cr&iacute;tica a los inspectores &mdash; es lo que las tareas de vigilancia sostenida hacen con la atenci&oacute;n humana.</p>
<h3>&iquest;Cu&aacute;ndo sigue siendo la inspecci&oacute;n manual la opci&oacute;n correcta?</h3>
<p>Cuatro situaciones favorecen mantener la inspecci&oacute;n manual: tiradas muy cortas con cambios constantes de arte, donde el esfuerzo de construir la referencia supera a la tirada; criterios de calidad genuinamente subjetivos, como la impresi&oacute;n general del color, que una c&aacute;mara no puede arbitrar; velocidades bajas en un solo turno, donde una persona realmente puede seguir el ritmo; y productos cuyos defectos son t&aacute;ctiles y no visuales, como el tacto o la rigidez. La inspecci&oacute;n por IA amortiza su coste en tiradas largas, velocidades altas, operaciones multiturno y defectos visibles recurrentes &mdash; no en todas partes.</p>
<h3>&iquest;Cu&aacute;nto desperdicio ahorra realmente la inspecci&oacute;n por IA?</h3>
<p>La respuesta honesta es un rango, porque depende de su perfil actual de defectos. Las implementaciones de Rey Long apuntan a reducir el desperdicio hacia aproximadamente el 2% desde una base t&iacute;pica del 5%, con una mejora del rendimiento de impresi&oacute;n en torno al 5% &mdash; ambas cifras dependen de la aplicaci&oacute;n y se establecen durante la puesta en marcha; no son garant&iacute;as. El mecanismo es simple: un fallo recurrente detectado en el segundo saco en lugar de al final del turno deja de ser una p&eacute;rdida a nivel de palet. En una l&iacute;nea de conversi&oacute;n a 25&ndash;40 sacos/min, un defecto de impresi&oacute;n recurrente sin detectar puede consumir una hora de producci&oacute;n &mdash; de 1.500 a 2.400 sacos &mdash; antes de que un control manual lo encuentre.</p>
<h3>&iquest;La inspecci&oacute;n por IA elimina puestos de inspecci&oacute;n?</h3>
<p>En las implementaciones de Rey Long cambia la proporci&oacute;n en lugar de eliminar la funci&oacute;n: un operario puede supervisar hasta cuatro m&aacute;quinas en lugar de dos, porque el sistema vigila la producci&oacute;n y el operario responde a alertas, cambios de formato y decisiones de criterio. Las tareas que desaparecen son las que los humanos hacen peor &mdash; mirar sin interrupci&oacute;n una banda en movimiento &mdash; y las que quedan son las que realmente usan la destreza humana. Que la plantilla cambie o no es una decisi&oacute;n de gesti&oacute;n, no una propiedad de la tecnolog&iacute;a.</p>
<h3>&iquest;Cu&aacute;nto cuesta un sistema de inspecci&oacute;n por IA comparado con la inspecci&oacute;n manual?</h3>
<p>Las estructuras de coste tienen formas distintas: la inspecci&oacute;n manual es un coste recurrente que escala con turnos y l&iacute;neas, mientras que un sistema de IA es sobre todo un coste de proyecto &uacute;nico (c&aacute;maras, iluminaci&oacute;n, hardware edge, integraci&oacute;n y puesta en marcha) m&aacute;s un mantenimiento menor. Rey Long dimensiona cada sistema caso por caso &mdash; el n&uacute;mero de c&aacute;maras, la iluminaci&oacute;n y la profundidad de integraci&oacute;n var&iacute;an con la m&aacute;quina y las clases de defecto &mdash;, as&iacute; que no existe un precio de lista significativo; la comparaci&oacute;n que importa es el coste del proyecto frente a su coste actual de desperdicio, reclamaciones y mano de obra de inspecci&oacute;n. Env&iacute;e su tipo de m&aacute;quina e historial de defectos para una evaluaci&oacute;n dimensionada.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/ai-visual-inspection-woven-bag-printing">Inspecci&oacute;n visual por IA en l&iacute;neas de sacos tejidos: qu&eacute; detecta y qu&eacute; no</a></li>
<li><a href="/es/news/retrofit-edge-ai-inspection-woven-bag-line">Instalar inspecci&oacute;n edge AI en una l&iacute;nea de sacos existente</a></li>
<li><a href="/es/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">IA en el borde en l&iacute;neas de envasado: inspecci&oacute;n por visi&oacute;n y mantenimiento predictivo</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-16T11:00:00Z',
  cover_image_url: null,
  title_en: 'Manual vs AI Inspection on Woven Bag Lines: An Honest Comparison',
  title_es: 'Inspección manual vs IA en líneas de sacos tejidos: una comparación honesta',
  summary_en: 'Sandia National Laboratories research puts human inspection misses at 20–30% of defects; AI vision inspects every bag at line speed without fatigue. The economics, the documented numbers on both sides, and the four cases where manual inspection is still the right call.',
  summary_es: 'La investigación de Sandia National Laboratories sitúa los fallos de la inspección humana en el 20–30% de los defectos; la visión por IA inspecciona cada saco a velocidad de línea sin fatiga. La economía, las cifras documentadas de ambos lados y los cuatro casos donde la inspección manual sigue siendo la decisión correcta.',
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

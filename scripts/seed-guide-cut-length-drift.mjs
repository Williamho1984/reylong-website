// Seed the technical guide: "Cut-Length Drift on Woven Bag Lines"
//
// CARE REQUIRED — two numbers that look contradictory but are not:
//   - JLPTCSM-1300W spec sheet: cutting accuracy 1 mm. That is the machine's mechanical/servo
//     positioning capability, established on well-behaved fabric.
//   - AI spec: ~±5 mm on "conventional fixed-length cutting" → ≤±1 mm target with Eye-Mark
//     compensation. That ±5 mm is the REAL-WORLD drift a fixed-length cut suffers once elastic
//     woven fabric stretches — a material problem, not a machine positioning problem.
// The article must keep those two framings distinct. Do not write "the machine cuts to ±5 mm".
//
// Eye-Mark / Dynamic Error Compensation DOES close the loop on cut and seam length — this is the
// one place a closed-loop vision-to-servo claim is truthful. It does NOT correct colour
// registration (see the registration-drift guide).
//
// Idempotent. Run: node scripts/seed-guide-cut-length-drift.mjs
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

const SLUG = 'cut-length-drift-woven-bag-lines'

const faq = [
  {
    q_en: 'Why does cut length drift on woven bag lines?',
    a_en: 'Because the encoder measures the roller, not the fabric. A fixed-length cutting system counts how far a driven roller has turned and fires the knife at the calculated distance. That is only correct if the fabric travelling over the roller has the same length as the roller\'s circumference times its rotations — and woven PP does not. It is a textile: it stretches under tension, it stretches differently along warp and weft, and the stretch changes as tension changes through the roll. The encoder faithfully reports the roller\'s truth while the fabric quietly tells a different one, and the bags come out long or short.',
    q_es: '¿Por qué se desvía la longitud de corte en las líneas de sacos tejidos?',
    a_es: 'Porque el encoder mide el rodillo, no el tejido. Un sistema de corte de longitud fija cuenta cuánto ha girado un rodillo motriz y dispara la cuchilla a la distancia calculada. Eso solo es correcto si el tejido que pasa sobre el rodillo tiene la misma longitud que la circunferencia del rodillo por sus vueltas, y el PP tejido no la tiene. Es un textil: se estira bajo tensión, se estira de forma distinta en urdimbre y trama, y ese estiramiento cambia conforme varía la tensión a lo largo de la bobina. El encoder informa fielmente de la verdad del rodillo mientras el tejido cuenta en silencio otra distinta, y los sacos salen largos o cortos.',
  },
  {
    q_en: 'What is Eye-Mark compensation and how does it work?',
    a_en: 'It closes the loop that a bare encoder leaves open. A printed Eye-Mark travels with the fabric, so unlike the roller it has already experienced whatever stretching the fabric experienced. Rey Long\'s Dynamic Error Compensation uses a vision system to read the Eye-Mark on each segment, calculate the real deformation of the running web, and correct the servo drives on the fly — so the knife fires where the fabric actually is rather than where the encoder\'s arithmetic says it should be. It tightens cutting and sewing accuracy toward a ±1 mm target against roughly ±5 mm on conventional fixed-length cutting, and drives scrap down as a direct consequence. The same control loop also stabilises hard-to-run PCR recycled material by adapting speed and sealing temperature in real time.',
    q_es: '¿Qué es la compensación Eye-Mark y cómo funciona?',
    a_es: 'Cierra el lazo que un encoder por sí solo deja abierto. Una marca Eye-Mark impresa viaja con el tejido, de modo que, a diferencia del rodillo, ya ha sufrido el mismo estiramiento que el tejido. La Compensación Dinámica de Errores de Rey Long emplea un sistema de visión para leer la Eye-Mark de cada segmento, calcular la deformación real de la banda y corregir los servomotores sobre la marcha, de forma que la cuchilla corta donde el tejido realmente está y no donde la aritmética del encoder dice que debería estar. Ajusta la precisión de corte y costura hacia un objetivo de ±1 mm frente a los aproximadamente ±5 mm del corte de longitud fija convencional, y reduce el desperdicio como consecuencia directa. El mismo lazo de control estabiliza además el material reciclado PCR, difícil de procesar, adaptando la velocidad y la temperatura de sellado en tiempo real.',
  },
  {
    q_en: 'Why does cut-length drift get worse as the roll runs down?',
    a_en: 'Because unwind tension is hard to hold constant across a changing roll diameter. As the roll empties, its inertia and the relationship between unwind torque and web tension both change. If that taper is not compensated, tension climbs or falls through the roll — and since fabric stretch is a function of tension, the amount the fabric is being stretched changes with it. The signature is unmistakable once you know it: bags that are within tolerance at the start of a roll and out of tolerance by the end. If you see that pattern, investigate unwind tension taper before you suspect the knife, the encoder or the servo.',
    q_es: '¿Por qué la desviación de la longitud de corte empeora al consumirse la bobina?',
    a_es: 'Porque es difícil mantener constante la tensión de desbobinado con un diámetro de bobina que cambia. A medida que la bobina se vacía, cambian su inercia y la relación entre el par de desbobinado y la tensión de la banda. Si esa conicidad no se compensa, la tensión sube o baja a lo largo de la bobina, y como el estiramiento del tejido depende de la tensión, la magnitud del estiramiento cambia con ella. La firma es inconfundible una vez que se conoce: sacos dentro de tolerancia al principio de la bobina y fuera de tolerancia al final. Si observa ese patrón, investigue la conicidad de tensión del desbobinado antes de sospechar de la cuchilla, el encoder o el servo.',
  },
  {
    q_en: 'Are print registration and cut-length drift the same problem?',
    a_en: 'They share a root cause but they are not the same fault, and conflating them leads to the wrong fix. Both originate in the same place: woven PP stretches, so the web is not the length the machine assumes. But registration drift is a colour-to-colour alignment error within the printed image, while cut-length drift is a length error between the image and the knife. They are also at very different stages of automation at Rey Long. Cut-length drift is corrected today by a closed vision-to-servo loop (Eye-Mark compensation). Colour registration is currently detected and flagged to the operator by the CNN vision system — closed-loop correction of registration is not a deployed capability.',
    q_es: '¿La desviación del registro y la de la longitud de corte son el mismo problema?',
    a_es: 'Comparten una causa raíz, pero no son el mismo fallo, y confundirlos lleva a la solución equivocada. Ambos nacen en el mismo sitio: el PP tejido se estira, de modo que la banda no tiene la longitud que la máquina supone. Pero la desviación del registro es un error de alineación entre colores dentro de la imagen impresa, mientras que la desviación de la longitud de corte es un error de longitud entre la imagen y la cuchilla. Además están en fases de automatización muy distintas en Rey Long. La longitud de corte se corrige hoy mediante un lazo cerrado visión-servo (compensación Eye-Mark). El registro de color lo detecta hoy el sistema de visión CNN y lo señala al operario; la corrección en lazo cerrado del registro no es una capacidad desplegada.',
  },
  {
    q_en: 'Can Eye-Mark compensation be retrofitted onto an existing machine?',
    a_en: 'Yes — that is the design intent. Rey Long\'s AI-Powered Machine Intelligence is built to integrate onto machines you already own rather than requiring a full line replacement, and it connects over standard industrial protocols: OPC-UA, Modbus and MQTT. Inference runs on edge hardware installed at the machine rather than in the cloud, so decisions are made in real time with no network latency and the line keeps running if the network does not. The vision models deploy few-shot, reaching a working baseline from as few as around 50 reference samples, so commissioning does not require months of data collection first.',
    q_es: '¿Se puede instalar la compensación Eye-Mark en una máquina existente?',
    a_es: 'Sí, ese es el propósito de diseño. La Inteligencia de Máquina de Rey Long está pensada para integrarse en las máquinas que usted ya posee, sin exigir la sustitución completa de la línea, y se conecta mediante protocolos industriales estándar: OPC-UA, Modbus y MQTT. La inferencia se ejecuta en hardware edge instalado en la propia máquina y no en la nube, de modo que las decisiones se toman en tiempo real sin latencia de red y la línea sigue funcionando aunque la red no lo haga. Los modelos de visión se implementan con pocas muestras, alcanzando una base funcional a partir de unas 50 muestras de referencia, así que la puesta en marcha no exige meses de recogida de datos previos.',
  },
]

const content_en = `<p>A woven bag line can hold every mechanical tolerance on its spec sheet and still produce bags that are the wrong length. The knife is sharp, the servo is healthy, the encoder is reading cleanly &mdash; and the bags come out long at the start of a roll and short by the end of it. The reason is not a fault in any of those components. It is that <strong>they are all measuring the wrong thing.</strong></p>

<h2>The encoder tells you the truth about the roller, not about the fabric</h2>
<p>Fixed-length cutting works by arithmetic. A driven roller of known circumference turns, an encoder counts the rotation, the controller multiplies, and when the product reaches the target length it fires the knife. The logic is sound and it works beautifully &mdash; on a material that does not change length.</p>
<p>Woven polypropylene changes length. It is a textile woven from extruded tapes, and it behaves like one: it stretches elastically under tension, it stretches by different amounts along the warp and across the weft, and how much it stretches depends on how hard it is being pulled at that moment. So the fabric passing over the roller is <em>not</em> the same length as the roller's circumference times its rotations. The encoder is not lying &mdash; it is faithfully reporting the roller's reality, which has quietly stopped being the fabric's reality.</p>
<p>This is why cut-length drift is so resistant to mechanical troubleshooting. You can replace the encoder, re-tune the servo, and sharpen the knife, and the drift will still be there, because none of those parts is where the error is being introduced.</p>

<h2>Two numbers that look contradictory, and are not</h2>
<p>The <a href="/products/automatic-printing-tubing-cutting-sewing-line">JLPTCSM-1300W</a> convention line specifies a <strong>cutting accuracy of 1 mm</strong>. Rey Long's AI documentation describes conventional fixed-length cutting drifting by roughly <strong>±5 mm</strong>. Both are true, and the distinction between them is the whole point of this guide.</p>
<p>The 1 mm figure is the machine's <em>positioning</em> capability &mdash; what the servo and knife can achieve when the fabric arrives at the length the controller believes it has. The ±5 mm figure is the <em>real-world</em> drift a fixed-length cut suffers once elastic fabric, changing tension and a shrinking roll diameter enter the picture. The machine is not missing its target; the target itself has moved, and nothing in a fixed-length system is watching it move.</p>

<h2>Diagnose in this order</h2>

<h3>1. Tension profile through the roll</h3>
<p>Start here, because this is where the drift is created. Map tension from unwind through printing, tubing and cutting &mdash; not the HMI setpoint, the actual tension. Look especially for tension that <em>changes as the roll runs down</em>. As roll diameter falls, inertia and the torque-to-tension relationship at the unwind both change; without taper compensation, tension climbs or falls through the roll, fabric stretch follows it, and cut length drifts with it. Bags in tolerance at the start of a roll and out of tolerance at the end is the signature of exactly this.</p>

<h3>2. Roll-diameter compensation at the unwind</h3>
<p>If your tension trace confirms taper, this is the control to fix before anything else.</p>

<h3>3. Roller slip and wear</h3>
<p>A measuring roller that slips against the fabric breaks the arithmetic at its source. Check the drive roller surface for wear, glazing and contamination, and check nip pressure. Slip produces a drift that is biased in one direction &mdash; consistently short, not randomly scattered.</p>

<h3>4. Fabric batch variation</h3>
<p>Denier, weave density and lamination all change how much a fabric stretches for a given tension. A line that has been stable for weeks and drifts the day a new fabric lot is loaded is not a machine problem. Compare the certificate of analysis against the lot that ran cleanly.</p>

<h3>5. Print repeat length versus cut length</h3>
<p>If the printed artwork and the cut are specified independently, they can disagree. On the JLPTCSM-1300W, print repeat length is adjustable from 450 to 1200 mm and cutting length from 550 to 1250 mm &mdash; confirm the job is set up so the two are consistent before hunting for a drift that is really a setup error.</p>

<h2>Why the printed mark is the only honest ruler</h2>
<p>Here is the insight that makes the fix obvious. The encoder is upstream of the problem: it measures a rigid steel roller that never stretches. The <strong>printed Eye-Mark is downstream of the problem</strong> &mdash; it was printed onto the fabric, it travels with the fabric, and it has therefore already experienced every bit of stretching the fabric experienced. If the fabric grew 3 mm, the mark moved 3 mm with it.</p>
<p>That makes the mark the only measurement on the line that tells you where the fabric <em>actually is</em>, rather than where the machine calculates it ought to be. Any system that wants to cut accurately on an elastic substrate has to take its truth from the material, not from a roller.</p>

<h2>Dynamic Error Compensation: closing the loop</h2>
<p>This is what Rey Long's <a href="/products/ai-machine-intelligence-solutions">Dynamic Error Compensation</a> does, and &mdash; unlike closed-loop colour registration, which is not a deployed capability &mdash; it runs in the field today:</p>
<ul>
<li><strong>Vision reads the Eye-Mark on each segment</strong> as the web runs, at full line speed.</li>
<li><strong>The system calculates the real deformation</strong> of the fabric from the mark's actual position versus its expected position.</li>
<li><strong>It corrects the servo drives on the fly</strong>, so the knife and the sewing head act on where the fabric is, not where the arithmetic put it.</li>
<li><strong>The result:</strong> cutting and sewing accuracy tightened toward a <strong>±1 mm target</strong>, against roughly ±5 mm on conventional fixed-length cutting, with scrap falling as a direct consequence &mdash; to as low as ~2%, down from ~5%, application-dependent.</li>
<li><strong>The same loop stabilises PCR recycled material</strong>, which is notoriously inconsistent to run, by adapting speed and sealing temperature in real time.</li>
</ul>
<p>It retrofits. Inference runs on edge hardware at the machine &mdash; no cloud dependency, no network latency, and the line keeps running if the network does not &mdash; and it integrates over OPC-UA, Modbus and MQTT onto equipment you already own. The vision models deploy few-shot, reaching a working baseline from as few as around 50 reference samples.</p>

<h2>The short version</h2>
<p>Cut-length drift on woven PP is not a knife problem, an encoder problem or a servo problem. It is a measurement problem: the machine is measuring a roller that cannot stretch while cutting a fabric that can. Fix the tension profile first &mdash; particularly the taper through the roll &mdash; because that is where the stretch is created. Then, if the tolerance you need is tighter than an open-loop system can hold on elastic fabric, stop measuring the roller and start measuring the mark that rides on the material itself.</p>
<p><em><a href="/contact">Talk to Rey Long's engineering team</a> about retrofitting Eye-Mark compensation onto your line.</em></p>

<h2>Frequently asked questions</h2>
<h3>Why does cut length drift on woven bag lines?</h3>
<p>Because the encoder measures the roller, not the fabric. A fixed-length cutting system counts how far a driven roller has turned and fires the knife at the calculated distance. That is only correct if the fabric travelling over the roller has the same length as the roller's circumference times its rotations &mdash; and woven PP does not. It is a textile: it stretches under tension, it stretches differently along warp and weft, and the stretch changes as tension changes through the roll. The encoder faithfully reports the roller's truth while the fabric quietly tells a different one, and the bags come out long or short.</p>
<h3>What is Eye-Mark compensation and how does it work?</h3>
<p>It closes the loop that a bare encoder leaves open. A printed Eye-Mark travels with the fabric, so unlike the roller it has already experienced whatever stretching the fabric experienced. Rey Long's Dynamic Error Compensation uses a vision system to read the Eye-Mark on each segment, calculate the real deformation of the running web, and correct the servo drives on the fly &mdash; so the knife fires where the fabric actually is rather than where the encoder's arithmetic says it should be. It tightens cutting and sewing accuracy toward a ±1 mm target against roughly ±5 mm on conventional fixed-length cutting, and drives scrap down as a direct consequence. The same control loop also stabilises hard-to-run PCR recycled material by adapting speed and sealing temperature in real time.</p>
<h3>Why does cut-length drift get worse as the roll runs down?</h3>
<p>Because unwind tension is hard to hold constant across a changing roll diameter. As the roll empties, its inertia and the relationship between unwind torque and web tension both change. If that taper is not compensated, tension climbs or falls through the roll &mdash; and since fabric stretch is a function of tension, the amount the fabric is being stretched changes with it. The signature is unmistakable once you know it: bags that are within tolerance at the start of a roll and out of tolerance by the end. If you see that pattern, investigate unwind tension taper before you suspect the knife, the encoder or the servo.</p>
<h3>Are print registration and cut-length drift the same problem?</h3>
<p>They share a root cause but they are not the same fault, and conflating them leads to the wrong fix. Both originate in the same place: woven PP stretches, so the web is not the length the machine assumes. But registration drift is a colour-to-colour alignment error within the printed image, while cut-length drift is a length error between the image and the knife. They are also at very different stages of automation at Rey Long. Cut-length drift is corrected today by a closed vision-to-servo loop (Eye-Mark compensation). Colour registration is currently detected and flagged to the operator by the CNN vision system &mdash; closed-loop correction of registration is not a deployed capability.</p>
<h3>Can Eye-Mark compensation be retrofitted onto an existing machine?</h3>
<p>Yes &mdash; that is the design intent. Rey Long's AI-Powered Machine Intelligence is built to integrate onto machines you already own rather than requiring a full line replacement, and it connects over standard industrial protocols: OPC-UA, Modbus and MQTT. Inference runs on edge hardware installed at the machine rather than in the cloud, so decisions are made in real time with no network latency and the line keeps running if the network does not. The vision models deploy few-shot, reaching a working baseline from as few as around 50 reference samples, so commissioning does not require months of data collection first.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/print-registration-drift-pp-woven-fabric">Print Registration Drift on PP Woven Fabric: A Diagnostic Guide</a></li>
<li><a href="/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">Edge AI on Packaging Lines: Vision Inspection and Predictive Maintenance</a></li>
<li><a href="/news/fibc-jumbo-bag-production-trends">FIBC (Jumbo Bag) Production Trends to Watch in 2026</a></li>
</ul>`

const content_es = `<p>Una l&iacute;nea de sacos tejidos puede cumplir todas las tolerancias mec&aacute;nicas de su ficha t&eacute;cnica y aun as&iacute; producir sacos con la longitud equivocada. La cuchilla est&aacute; afilada, el servo est&aacute; sano, el encoder lee con limpieza, y los sacos salen largos al principio de la bobina y cortos al final. La raz&oacute;n no es un fallo en ninguno de esos componentes. Es que <strong>todos est&aacute;n midiendo la cosa equivocada.</strong></p>

<h2>El encoder le dice la verdad sobre el rodillo, no sobre el tejido</h2>
<p>El corte de longitud fija funciona por aritm&eacute;tica. Un rodillo motriz de circunferencia conocida gira, un encoder cuenta las vueltas, el controlador multiplica y, cuando el producto alcanza la longitud objetivo, dispara la cuchilla. La l&oacute;gica es correcta y funciona de maravilla&hellip; sobre un material que no cambia de longitud.</p>
<p>El polipropileno tejido cambia de longitud. Es un textil tejido a partir de cintas extruidas, y se comporta como tal: se estira el&aacute;sticamente bajo tensi&oacute;n, se estira en distinta medida en urdimbre y en trama, y cu&aacute;nto se estira depende de con cu&aacute;nta fuerza se tire de &eacute;l en ese momento. As&iacute; que el tejido que pasa sobre el rodillo <em>no</em> tiene la misma longitud que la circunferencia del rodillo por sus vueltas. El encoder no miente: informa fielmente de la realidad del rodillo, que en silencio ha dejado de ser la realidad del tejido.</p>
<p>Por eso la desviaci&oacute;n de la longitud de corte se resiste tanto al diagn&oacute;stico mec&aacute;nico. Puede cambiar el encoder, reajustar el servo y afilar la cuchilla, y la desviaci&oacute;n seguir&aacute; ah&iacute;, porque ninguna de esas piezas es donde se introduce el error.</p>

<h2>Dos cifras que parecen contradictorias y no lo son</h2>
<p>La l&iacute;nea <a href="/es/products/automatic-printing-tubing-cutting-sewing-line">JLPTCSM-1300W</a> especifica una <strong>precisi&oacute;n de corte de 1 mm</strong>. La documentaci&oacute;n de IA de Rey Long describe que el corte de longitud fija convencional se desv&iacute;a aproximadamente <strong>±5 mm</strong>. Ambas son ciertas, y la distinci&oacute;n entre ellas es justamente el objeto de esta gu&iacute;a.</p>
<p>La cifra de 1 mm es la capacidad de <em>posicionamiento</em> de la m&aacute;quina: lo que el servo y la cuchilla pueden lograr cuando el tejido llega con la longitud que el controlador cree que tiene. La cifra de ±5 mm es la desviaci&oacute;n <em>real</em> que sufre un corte de longitud fija en cuanto entran en juego un tejido el&aacute;stico, una tensi&oacute;n cambiante y un di&aacute;metro de bobina que se reduce. La m&aacute;quina no est&aacute; fallando su objetivo: es el objetivo el que se ha movido, y en un sistema de longitud fija nada lo est&aacute; observando moverse.</p>

<h2>Diagnostique en este orden</h2>

<h3>1. Perfil de tensi&oacute;n a lo largo de la bobina</h3>
<p>Empiece aqu&iacute;, porque es donde se crea la desviaci&oacute;n. Levante un mapa de la tensi&oacute;n desde el desbobinado hasta la impresi&oacute;n, el tubulado y el corte; no el valor de consigna de la HMI, sino la tensi&oacute;n real. Busque sobre todo una tensi&oacute;n que <em>cambie a medida que se consume la bobina</em>. Al disminuir el di&aacute;metro, cambian la inercia y la relaci&oacute;n par-tensi&oacute;n en el desbobinado; sin compensaci&oacute;n de conicidad, la tensi&oacute;n sube o baja a lo largo de la bobina, el estiramiento del tejido la sigue y la longitud de corte se desv&iacute;a con ella. Sacos dentro de tolerancia al principio de la bobina y fuera de tolerancia al final es exactamente la firma de esto.</p>

<h3>2. Compensaci&oacute;n de di&aacute;metro en el desbobinado</h3>
<p>Si su registro de tensi&oacute;n confirma la conicidad, este es el control que hay que corregir antes que ning&uacute;n otro.</p>

<h3>3. Deslizamiento y desgaste de rodillos</h3>
<p>Un rodillo de medici&oacute;n que patina contra el tejido rompe la aritm&eacute;tica en su origen. Revise la superficie del rodillo motriz en busca de desgaste, vitrificaci&oacute;n y contaminaci&oacute;n, y compruebe la presi&oacute;n del nip. El deslizamiento produce una desviaci&oacute;n sesgada en una direcci&oacute;n: sacos sistem&aacute;ticamente cortos, no dispersos al azar.</p>

<h3>4. Variaci&oacute;n entre lotes de tejido</h3>
<p>El denier, la densidad del tramado y la laminaci&oacute;n modifican cu&aacute;nto se estira un tejido para una tensi&oacute;n dada. Una l&iacute;nea que ha sido estable durante semanas y se desv&iacute;a el d&iacute;a en que se carga un lote nuevo no tiene un problema de m&aacute;quina. Compare el certificado de an&aacute;lisis con el del lote que corri&oacute; limpio.</p>

<h3>5. Longitud de repetici&oacute;n de impresi&oacute;n frente a longitud de corte</h3>
<p>Si el arte impreso y el corte se especifican de forma independiente, pueden no coincidir. En la JLPTCSM-1300W, la longitud de repetici&oacute;n de impresi&oacute;n es ajustable de 450 a 1200 mm y la longitud de corte de 550 a 1250 mm: confirme que el trabajo est&aacute; configurado de forma coherente antes de perseguir una desviaci&oacute;n que en realidad es un error de preparaci&oacute;n.</p>

<h2>Por qu&eacute; la marca impresa es la &uacute;nica regla honesta</h2>
<p>He aqu&iacute; la idea que vuelve evidente la soluci&oacute;n. El encoder est&aacute; aguas arriba del problema: mide un rodillo de acero r&iacute;gido que nunca se estira. La <strong>marca Eye-Mark impresa est&aacute; aguas abajo del problema</strong>: se imprimi&oacute; sobre el tejido, viaja con el tejido y, por tanto, ya ha sufrido todo el estiramiento que sufri&oacute; el tejido. Si el tejido creci&oacute; 3 mm, la marca se movi&oacute; 3 mm con &eacute;l.</p>
<p>Eso convierte a la marca en la &uacute;nica medici&oacute;n de la l&iacute;nea que indica d&oacute;nde <em>est&aacute; realmente</em> el tejido, y no d&oacute;nde la m&aacute;quina calcula que deber&iacute;a estar. Cualquier sistema que quiera cortar con precisi&oacute;n sobre un sustrato el&aacute;stico tiene que tomar su verdad del material, no de un rodillo.</p>

<h2>Compensaci&oacute;n Din&aacute;mica de Errores: cerrar el lazo</h2>
<p>Esto es lo que hace la <a href="/es/products/ai-machine-intelligence-solutions">Compensaci&oacute;n Din&aacute;mica de Errores</a> de Rey Long y, a diferencia del registro de color en lazo cerrado &mdash; que no es una capacidad desplegada &mdash;, funciona hoy en planta:</p>
<ul>
<li><strong>La visi&oacute;n lee la Eye-Mark de cada segmento</strong> mientras la banda avanza, a plena velocidad de l&iacute;nea.</li>
<li><strong>El sistema calcula la deformaci&oacute;n real</strong> del tejido a partir de la posici&oacute;n efectiva de la marca frente a la esperada.</li>
<li><strong>Corrige los servomotores sobre la marcha</strong>, de modo que la cuchilla y el cabezal de costura act&uacute;an sobre donde el tejido est&aacute;, no sobre donde lo situ&oacute; la aritm&eacute;tica.</li>
<li><strong>El resultado:</strong> precisi&oacute;n de corte y costura ajustada hacia un <strong>objetivo de ±1 mm</strong>, frente a los aproximadamente ±5 mm del corte de longitud fija convencional, con una ca&iacute;da del desperdicio como consecuencia directa: hasta cerca del 2%, desde alrededor del 5%, seg&uacute;n la aplicaci&oacute;n.</li>
<li><strong>El mismo lazo estabiliza el material reciclado PCR</strong>, notoriamente irregular de procesar, adaptando la velocidad y la temperatura de sellado en tiempo real.</li>
</ul>
<p>Es retroadaptable. La inferencia se ejecuta en hardware edge en la propia m&aacute;quina &mdash; sin dependencia de la nube, sin latencia de red, y la l&iacute;nea sigue funcionando aunque la red no lo haga &mdash; y se integra mediante OPC-UA, Modbus y MQTT sobre equipos que usted ya posee. Los modelos de visi&oacute;n se implementan con pocas muestras, alcanzando una base funcional a partir de unas 50 muestras de referencia.</p>

<h2>En resumen</h2>
<p>La desviaci&oacute;n de la longitud de corte en PP tejido no es un problema de cuchilla, ni de encoder, ni de servo. Es un problema de medici&oacute;n: la m&aacute;quina mide un rodillo que no puede estirarse mientras corta un tejido que s&iacute; puede. Corrija primero el perfil de tensi&oacute;n &mdash; en particular la conicidad a lo largo de la bobina &mdash;, porque ah&iacute; es donde se crea el estiramiento. Despu&eacute;s, si la tolerancia que necesita es m&aacute;s estrecha de lo que un sistema en lazo abierto puede sostener sobre un tejido el&aacute;stico, deje de medir el rodillo y empiece a medir la marca que viaja sobre el propio material.</p>
<p><em><a href="/es/contact">Hable con el equipo de ingenier&iacute;a de Rey Long</a> sobre la instalaci&oacute;n de la compensaci&oacute;n Eye-Mark en su l&iacute;nea.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Por qu&eacute; se desv&iacute;a la longitud de corte en las l&iacute;neas de sacos tejidos?</h3>
<p>Porque el encoder mide el rodillo, no el tejido. Un sistema de corte de longitud fija cuenta cu&aacute;nto ha girado un rodillo motriz y dispara la cuchilla a la distancia calculada. Eso solo es correcto si el tejido que pasa sobre el rodillo tiene la misma longitud que la circunferencia del rodillo por sus vueltas, y el PP tejido no la tiene. Es un textil: se estira bajo tensi&oacute;n, se estira de forma distinta en urdimbre y trama, y ese estiramiento cambia conforme var&iacute;a la tensi&oacute;n a lo largo de la bobina. El encoder informa fielmente de la verdad del rodillo mientras el tejido cuenta en silencio otra distinta, y los sacos salen largos o cortos.</p>
<h3>&iquest;Qu&eacute; es la compensaci&oacute;n Eye-Mark y c&oacute;mo funciona?</h3>
<p>Cierra el lazo que un encoder por s&iacute; solo deja abierto. Una marca Eye-Mark impresa viaja con el tejido, de modo que, a diferencia del rodillo, ya ha sufrido el mismo estiramiento que el tejido. La Compensaci&oacute;n Din&aacute;mica de Errores de Rey Long emplea un sistema de visi&oacute;n para leer la Eye-Mark de cada segmento, calcular la deformaci&oacute;n real de la banda y corregir los servomotores sobre la marcha, de forma que la cuchilla corta donde el tejido realmente est&aacute; y no donde la aritm&eacute;tica del encoder dice que deber&iacute;a estar. Ajusta la precisi&oacute;n de corte y costura hacia un objetivo de ±1 mm frente a los aproximadamente ±5 mm del corte de longitud fija convencional, y reduce el desperdicio como consecuencia directa. El mismo lazo de control estabiliza adem&aacute;s el material reciclado PCR, dif&iacute;cil de procesar, adaptando la velocidad y la temperatura de sellado en tiempo real.</p>
<h3>&iquest;Por qu&eacute; la desviaci&oacute;n de la longitud de corte empeora al consumirse la bobina?</h3>
<p>Porque es dif&iacute;cil mantener constante la tensi&oacute;n de desbobinado con un di&aacute;metro de bobina que cambia. A medida que la bobina se vac&iacute;a, cambian su inercia y la relaci&oacute;n entre el par de desbobinado y la tensi&oacute;n de la banda. Si esa conicidad no se compensa, la tensi&oacute;n sube o baja a lo largo de la bobina, y como el estiramiento del tejido depende de la tensi&oacute;n, la magnitud del estiramiento cambia con ella. La firma es inconfundible una vez que se conoce: sacos dentro de tolerancia al principio de la bobina y fuera de tolerancia al final. Si observa ese patr&oacute;n, investigue la conicidad de tensi&oacute;n del desbobinado antes de sospechar de la cuchilla, el encoder o el servo.</p>
<h3>&iquest;La desviaci&oacute;n del registro y la de la longitud de corte son el mismo problema?</h3>
<p>Comparten una causa ra&iacute;z, pero no son el mismo fallo, y confundirlos lleva a la soluci&oacute;n equivocada. Ambos nacen en el mismo sitio: el PP tejido se estira, de modo que la banda no tiene la longitud que la m&aacute;quina supone. Pero la desviaci&oacute;n del registro es un error de alineaci&oacute;n entre colores dentro de la imagen impresa, mientras que la desviaci&oacute;n de la longitud de corte es un error de longitud entre la imagen y la cuchilla. Adem&aacute;s est&aacute;n en fases de automatizaci&oacute;n muy distintas en Rey Long. La longitud de corte se corrige hoy mediante un lazo cerrado visi&oacute;n-servo (compensaci&oacute;n Eye-Mark). El registro de color lo detecta hoy el sistema de visi&oacute;n CNN y lo se&ntilde;ala al operario; la correcci&oacute;n en lazo cerrado del registro no es una capacidad desplegada.</p>
<h3>&iquest;Se puede instalar la compensaci&oacute;n Eye-Mark en una m&aacute;quina existente?</h3>
<p>S&iacute;, ese es el prop&oacute;sito de dise&ntilde;o. La Inteligencia de M&aacute;quina de Rey Long est&aacute; pensada para integrarse en las m&aacute;quinas que usted ya posee, sin exigir la sustituci&oacute;n completa de la l&iacute;nea, y se conecta mediante protocolos industriales est&aacute;ndar: OPC-UA, Modbus y MQTT. La inferencia se ejecuta en hardware edge instalado en la propia m&aacute;quina y no en la nube, de modo que las decisiones se toman en tiempo real sin latencia de red y la l&iacute;nea sigue funcionando aunque la red no lo haga. Los modelos de visi&oacute;n se implementan con pocas muestras, alcanzando una base funcional a partir de unas 50 muestras de referencia, as&iacute; que la puesta en marcha no exige meses de recogida de datos previos.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/print-registration-drift-pp-woven-fabric">Desviaci&oacute;n del registro de impresi&oacute;n en tejido PP: gu&iacute;a de diagn&oacute;stico</a></li>
<li><a href="/es/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">IA en el borde en l&iacute;neas de envasado: inspecci&oacute;n por visi&oacute;n y mantenimiento predictivo</a></li>
<li><a href="/es/news/fibc-jumbo-bag-production-trends">Tendencias de producci&oacute;n de FIBC (big bags) para 2026</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-13T08:00:00Z',
  cover_image_url: 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/automatic-printing-tubing-cutting-sewing-line/cover.jpg',
  title_en: "Cut-Length Drift on Woven Bag Lines: Why Fixed-Length Cutting Isn't Enough",
  title_es: 'Desviación de la longitud de corte en líneas de sacos tejidos: por qué el corte de longitud fija no basta',
  summary_en: 'The encoder measures a steel roller that never stretches, while the knife cuts a fabric that does. Why cut-length drift resists mechanical troubleshooting, how to diagnose it, and how Eye-Mark vision compensation tightens accuracy toward ±1 mm.',
  summary_es: 'El encoder mide un rodillo de acero que nunca se estira, mientras la cuchilla corta un tejido que sí lo hace. Por qué la desviación de la longitud de corte resiste el diagnóstico mecánico, cómo diagnosticarla y cómo la compensación por visión Eye-Mark ajusta la precisión hacia ±1 mm.',
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

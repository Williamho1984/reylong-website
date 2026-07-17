// Seed the technical guide: "Print Registration Drift on PP Woven Fabric"
//
// FACT BOUNDARY (do not blur this when editing):
//   - The CNN vision model DETECTS registration drift and ALERTS the operator. That ships today.
//   - Closed-loop AI correction of registration is NOT built. It is written here as an industry
//     direction Rey Long is exploring, with no timeline and no claim of deployment.
//   - Eye-Mark / Dynamic Error Compensation corrects CUT AND SEAM length, not colour registration.
//
// The visible FAQ block at the end of the body mirrors the `faq` column exactly — Google requires
// FAQPage structured data to match content the reader can actually see on the page.
//
// Idempotent. Run: node scripts/seed-guide-registration-drift.mjs
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

const SLUG = 'print-registration-drift-pp-woven-fabric'

// Real-context images (2026-07-15): cover = inspection camera over the printed web,
// inline = AI inspection HMI in the "What AI vision does today" section.
const IMG_BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/news/registration-drift'
const IMG_COVER = `${IMG_BASE}/inspection-camera.jpg`
const IMG_HMI = `${IMG_BASE}/ai-inspection-hmi.jpg`

const faq = [
  {
    q_en: 'What causes print registration drift on PP woven fabric?',
    a_en: 'In most cases the fabric itself, not the press. Woven PP is not a stable, isotropic web the way film is — it stretches under tension, and it stretches unevenly along the warp and weft. If the web is 0.2% longer at station 6 than it was at station 1, the sixth colour lands 0.2% out of position no matter how perfectly the plate is mounted. Tension variation is therefore the first thing to check, followed by anilox and plate condition, inter-color drying, web path alignment, and ambient humidity. Mechanical causes (a worn bearing, a mis-mounted plate) are real but far less common than tension.',
    q_es: '¿Qué causa la desviación del registro de impresión en tejido de PP?',
    a_es: 'En la mayoría de los casos, el propio tejido, no la impresora. El PP tejido no es una banda estable e isótropa como la película: se estira bajo tensión, y lo hace de forma desigual en urdimbre y trama. Si la banda es un 0,2% más larga en la estación 6 que en la estación 1, el sexto color queda un 0,2% fuera de posición por muy bien montado que esté el cliché. Por eso la variación de tensión es lo primero que hay que comprobar, seguida del estado del anilox y del cliché, el secado entre colores, la alineación del recorrido de la banda y la humedad ambiental. Las causas mecánicas (un rodamiento desgastado, un cliché mal montado) existen, pero son mucho menos frecuentes que la tensión.',
  },
  {
    q_en: 'Can AI correct print registration automatically?',
    a_en: 'Not yet — and it is worth being precise about where the industry actually is. Rey Long\'s CNN vision system inspects every bag at full line speed and detects registration drift, ink skip and blur with 95%+ defect recall, alerting the operator the moment a recurring fault appears. That is detection and alerting, and it ships today. Closing the loop — feeding that vision measurement back into the servo drives to correct registration without human intervention — is a direction the industry is moving in and one Rey Long is actively exploring, but it is not a deployed capability and we will not claim otherwise. Rey Long\'s vision-to-servo closed loop that does exist today corrects cut and seam length via Eye-Mark, which is a different problem.',
    q_es: '¿Puede la IA corregir el registro de impresión automáticamente?',
    a_es: 'Todavía no, y conviene ser precisos sobre dónde está realmente la industria. El sistema de visión CNN de Rey Long inspecciona cada bolsa a plena velocidad de línea y detecta desviación de registro, falta de tinta y borrosidad con más del 95% de detección de defectos, alertando al operario en cuanto aparece un fallo recurrente. Eso es detección y alerta, y está disponible hoy. Cerrar el lazo — devolver esa medición de visión a los servomotores para corregir el registro sin intervención humana — es una dirección hacia la que avanza el sector y que Rey Long está explorando activamente, pero no es una capacidad desplegada y no afirmaremos lo contrario. El lazo cerrado visión-servo que sí existe hoy en Rey Long corrige la longitud de corte y costura mediante Eye-Mark, que es un problema distinto.',
  },
  {
    q_en: 'How tight can registration tolerance realistically be on woven PP?',
    a_en: 'Automatic register control systems on film presses are typically specified around ±0.1 mm. Woven PP will not hold that, because the substrate itself deforms: the achievable tolerance depends on fabric denier, weave density, lamination, tension profile and line speed, and it is properly established by trialling your actual fabric rather than quoted from a datasheet. The practical goal on woven PP is a registration error that stays stable and within your print design\'s trapping allowance — which is why designers of woven-bag artwork build in generous traps instead of relying on film-grade precision.',
    q_es: '¿Qué tolerancia de registro es realista en PP tejido?',
    a_es: 'Los sistemas de control automático de registro en impresoras de película suelen especificarse en torno a ±0,1 mm. El PP tejido no alcanza ese valor, porque el propio sustrato se deforma: la tolerancia alcanzable depende del denier del tejido, la densidad del tramado, la laminación, el perfil de tensión y la velocidad de línea, y se determina correctamente ensayando su tejido real, no citando una ficha técnica. El objetivo práctico en PP tejido es un error de registro estable y dentro del margen de solapamiento (trapping) del diseño — por eso los diseñadores de artes finales para sacos tejidos incorporan solapamientos generosos en lugar de confiar en una precisión propia de película.',
  },
  {
    q_en: 'Why does inter-color drying affect registration?',
    a_en: 'A colour that has not set before the web enters the next print nip does two things: it transfers ink where it should not, and it changes the friction between the web and the next impression cylinder. Inconsistent friction means inconsistent web behaviour at the nip, which shows up as a registration error that seems to come and go with no obvious cause. Drying capacity is also speed-dependent, so a press that registers cleanly at 60 m/min can start drifting at 100 m/min purely because the ink has less time to set. The JLRPM-6800BO/6C carries an inter-color drying system between each of its six stations with 18 kW of inter-color heating for this reason.',
    q_es: '¿Por qué el secado entre colores afecta al registro?',
    a_es: 'Un color que no ha fijado antes de que la banda entre en la siguiente estación hace dos cosas: transfiere tinta donde no debe y modifica la fricción entre la banda y el siguiente cilindro de impresión. Una fricción inconsistente significa un comportamiento inconsistente de la banda, que se manifiesta como un error de registro que aparece y desaparece sin causa aparente. La capacidad de secado también depende de la velocidad, por lo que una impresora que registra correctamente a 60 m/min puede empezar a desviarse a 100 m/min simplemente porque la tinta tiene menos tiempo para fijar. Por eso la JLRPM-6800BO/6C incorpora un sistema de secado entre cada una de sus seis estaciones, con 18 kW de calentamiento entre colores.',
  },
  {
    q_en: 'Does humidity really change print registration?',
    a_en: 'Indirectly, yes, and it is the cause most often missed because it correlates with the season rather than with anything you changed on the machine. Polypropylene absorbs very little moisture, but humidity strongly affects static generation on the running web. A statically charged web behaves differently at the nip and can cling or lift unpredictably, and anti-static conditioning is one of the tacit adjustments veteran operators make by feel. If registration quality tracks the weather rather than the job, look at ambient humidity and static control before you look at the press.',
    q_es: '¿La humedad realmente afecta al registro de impresión?',
    a_es: 'Indirectamente sí, y es la causa que más se pasa por alto porque se correlaciona con la estación del año y no con algo que usted haya cambiado en la máquina. El polipropileno absorbe muy poca humedad, pero la humedad influye mucho en la generación de electricidad estática en la banda en movimiento. Una banda cargada estáticamente se comporta de forma distinta en el nip y puede adherirse o levantarse de manera impredecible; el acondicionamiento antiestático es uno de esos ajustes tácitos que los operarios veteranos hacen por intuición. Si la calidad del registro sigue al clima y no al trabajo, revise la humedad ambiental y el control de estática antes que la impresora.',
  },
]

const content_en = `<p>Registration drift is the defect that quietly eats margin on a woven-bag line. The press is running, the bags look broadly right, and then a customer rejects a pallet because the black keyline sits half a millimetre off the red fill and the logo reads as blurred. This guide walks the diagnosis in the order that finds the cause fastest, explains what the <a href="/products/flexographic-printing-machine-6c">JLRPM-6800BO/6C</a> does to hold registration, and &mdash; just as importantly &mdash; states plainly what AI can and cannot do about it today.</p>

<h2>Why registration is harder on woven PP than on film</h2>
<p>Most flexo troubleshooting advice is written for film or paper. Woven polypropylene breaks the central assumption behind that advice: that the web arriving at station 6 is the same length as the web that left station 1.</p>
<p>It is not. Woven PP is a textile. It is built from extruded tapes crossed in warp and weft, and it behaves like a fabric under load: it stretches, it stretches <em>differently</em> along and across the weave, and the amount it stretches depends on how hard you are pulling it. A tension difference between the unwind and the last print station does not just move the web &mdash; it <strong>changes the web's length</strong>. Every colour after that lands on a substrate that is no longer the size the plate was made for.</p>
<p>This is why registration on woven PP is primarily a <strong>tension</strong> problem wearing the costume of a printing problem. Chasing it in the print unit &mdash; remounting plates, swapping anilox rollers, adjusting impression &mdash; is the most common way to spend a shift and fix nothing.</p>

<h2>Diagnose in this order</h2>
<p>Work from the cause that is most likely and cheapest to check toward the one that is least likely and most invasive. Resist the urge to start with the plates just because the defect is visible in the print.</p>

<h3>1. Web tension profile, unwind to rewind</h3>
<p>Map the tension at every zone, not just the setpoint on the HMI. You are looking for two things: a tension that is too high overall (stretching the fabric), and a tension that <em>varies</em> as the roll runs down. The second is the sneakier one. As roll diameter decreases, the inertia and the effective torque-to-tension relationship at the unwind change; if the taper is not compensated, tension climbs or falls through the roll and registration drifts with it. A defect that is clean at the start of a roll and bad by the end of it is a tension-taper signature, not a plate problem.</p>

<h3>2. Anilox rollers and printing plates</h3>
<p>Only once tension is proven stable does it make sense to look here. Check for a worn or plugged anilox (which changes ink film weight, and therefore apparent register at the edges of a solid), plate mounting error, plate swelling from solvent attack, and uneven impression pressure. Excess impression pressure is worth singling out: bouncing the plate harder into the fabric to "get better coverage" deforms both the plate and the web, and it will smear registration while appearing to solve a density problem.</p>

<h3>3. Inter-color drying</h3>
<p>If a previous colour is still wet when the web reaches the next nip, friction at that nip becomes unpredictable and registration wanders. Drying is speed-dependent, so this fault often appears only above a certain line speed &mdash; a press that registers perfectly at 60 m/min and drifts at 100 m/min is telling you the ink no longer has time to set.</p>

<h3>4. Web path and guiding</h3>
<p>Check idler rollers for wear, contamination and free rotation; check that rollers are parallel and the web is not being steered laterally into the nip. A single dragging idler introduces a local tension spike that no amount of central tension control will see.</p>

<h3>5. Ambient humidity and static</h3>
<p>Last, but check it before you accept "the machine is worn out". Humidity drives static generation on the running web, and a charged web does not behave consistently at the nip. If your registration quality tracks the season rather than the job, this is where the answer is.</p>

<h2>How the JLRPM-6800BO/6C is built to hold registration</h2>
<p>The press cannot make woven fabric behave like film, but it can remove the machine-side variables so the ones that remain are the ones you can act on:</p>
<ul>
<li><strong>Servo-driven tension control</strong> across the web path &mdash; the single most important control on woven PP, for the reasons above.</li>
<li><strong>Six independent ceramic anilox rollers</strong>, one per colour station, metering a consistent ink volume regardless of press speed, so ink film weight does not drift as you change speed.</li>
<li><strong>Inter-color drying between every station</strong>, with 18 kW of inter-color heating, so each colour is set before the next one is laid on top of it.</li>
<li><strong>Four print configurations</strong> (0+6, 1+5, 2+4, 3+3), printing one or both sides of the fabric in a single pass &mdash; fewer passes means fewer chances to reintroduce tension error.</li>
<li><strong>100 m/min maximum printing speed</strong>, with a printing repeat length of 350&ndash;1300 mm and a maximum printing width of 770 mm.</li>
</ul>

<h2>What AI vision does today &mdash; and what it does not</h2>
<p>This is where the industry conversation gets loose, so it is worth being exact.</p>
<p><strong>What ships today.</strong> Rey Long's <a href="/products/ai-machine-intelligence-solutions">AI-Powered Machine Intelligence</a> runs a CNN vision model on edge hardware at the machine, inspecting output at full line speed. It <em>detects</em> printing defects &mdash; registration drift, ink skip, blur &mdash; alongside material and stitching defects, at 95%+ defect recall, and it <strong>alerts the operator the moment a recurring fault appears</strong>, before a whole batch is scrapped. It deploys few-shot, building a working baseline from as few as around 50 reference samples, and it retrofits onto existing machines over standard industrial protocols (OPC-UA, Modbus, MQTT). In practice this converts registration drift from a problem you discover on a finished pallet into one you are told about on the second bag.</p>
<figure><img src="${IMG_HMI}" alt="AI vision inspection HMI on a bag line comparing the printed bag against a reference, with detected print faults highlighted" /><figcaption>The CNN vision system compares every bag against a known-good reference at full line speed and flags print faults on the HMI the moment they recur.</figcaption></figure>
<p><strong>What does not ship today.</strong> Closed-loop <em>correction</em> of colour registration &mdash; vision measuring the drift and driving the servos to null it out with no operator in the loop &mdash; is not a Rey Long capability. It is a direction the industry is moving in, and it is one we are actively exploring, but we are not going to describe an intention as a product. When it exists, it will be documented with real numbers on real fabric.</p>
<p>One distinction matters here, because the two are easy to conflate: Rey Long <em>does</em> run a vision-to-servo closed loop today, in <strong>Dynamic Error Compensation</strong>. Vision reads the Eye-Mark on each segment, calculates the real deformation of the running web, and corrects the servo drives on the fly &mdash; but it does so to tighten <strong>cutting and sewing accuracy</strong>, toward a ±1 mm target against roughly ±5 mm on conventional fixed-length cutting. That is a length problem, not a colour-to-colour alignment problem. The mechanism is closely related; the application is not the same, and it would be dishonest to present one as the other. We cover it in detail in <a href="/news/cut-length-drift-woven-bag-lines">the cut-length guide</a>.</p>

<h2>The short version</h2>
<p>On woven PP, registration drift is a tension problem until proven otherwise. Map the tension profile through the roll before you touch a plate. Then check anilox and impression, then drying, then the web path, then the room. A press with servo tension control, per-station ceramic anilox and inter-color drying removes the machine's contribution to the error; AI vision, today, tells you within seconds when the remaining error has crossed your limit &mdash; which on a line running 100 m/min is the difference between two scrap bags and two thousand.</p>
<p><em><a href="/contact">Talk to Rey Long's engineering team</a> about registration on your fabric and artwork.</em></p>

<h2>Frequently asked questions</h2>
<h3>What causes print registration drift on PP woven fabric?</h3>
<p>In most cases the fabric itself, not the press. Woven PP is not a stable, isotropic web the way film is &mdash; it stretches under tension, and it stretches unevenly along the warp and weft. If the web is 0.2% longer at station 6 than it was at station 1, the sixth colour lands 0.2% out of position no matter how perfectly the plate is mounted. Tension variation is therefore the first thing to check, followed by anilox and plate condition, inter-color drying, web path alignment, and ambient humidity. Mechanical causes (a worn bearing, a mis-mounted plate) are real but far less common than tension.</p>
<h3>Can AI correct print registration automatically?</h3>
<p>Not yet &mdash; and it is worth being precise about where the industry actually is. Rey Long's CNN vision system inspects every bag at full line speed and detects registration drift, ink skip and blur with 95%+ defect recall, alerting the operator the moment a recurring fault appears. That is detection and alerting, and it ships today. Closing the loop &mdash; feeding that vision measurement back into the servo drives to correct registration without human intervention &mdash; is a direction the industry is moving in and one Rey Long is actively exploring, but it is not a deployed capability and we will not claim otherwise. Rey Long's vision-to-servo closed loop that does exist today corrects cut and seam length via Eye-Mark, which is a different problem.</p>
<h3>How tight can registration tolerance realistically be on woven PP?</h3>
<p>Automatic register control systems on film presses are typically specified around ±0.1 mm. Woven PP will not hold that, because the substrate itself deforms: the achievable tolerance depends on fabric denier, weave density, lamination, tension profile and line speed, and it is properly established by trialling your actual fabric rather than quoted from a datasheet. The practical goal on woven PP is a registration error that stays stable and within your print design's trapping allowance &mdash; which is why designers of woven-bag artwork build in generous traps instead of relying on film-grade precision.</p>
<h3>Why does inter-color drying affect registration?</h3>
<p>A colour that has not set before the web enters the next print nip does two things: it transfers ink where it should not, and it changes the friction between the web and the next impression cylinder. Inconsistent friction means inconsistent web behaviour at the nip, which shows up as a registration error that seems to come and go with no obvious cause. Drying capacity is also speed-dependent, so a press that registers cleanly at 60 m/min can start drifting at 100 m/min purely because the ink has less time to set. The JLRPM-6800BO/6C carries an inter-color drying system between each of its six stations with 18 kW of inter-color heating for this reason.</p>
<h3>Does humidity really change print registration?</h3>
<p>Indirectly, yes, and it is the cause most often missed because it correlates with the season rather than with anything you changed on the machine. Polypropylene absorbs very little moisture, but humidity strongly affects static generation on the running web. A statically charged web behaves differently at the nip and can cling or lift unpredictably, and anti-static conditioning is one of the tacit adjustments veteran operators make by feel. If registration quality tracks the weather rather than the job, look at ambient humidity and static control before you look at the press.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/news/cut-length-drift-woven-bag-lines">Cut-Length Drift on Woven Bag Lines: Why Fixed-Length Cutting Isn't Enough</a></li>
<li><a href="/news/water-based-inks-flexographic-printing-sustainable-packaging">Water-Based Inks: The Sustainable Future of Flexographic Packaging Printing</a></li>
<li><a href="/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">Edge AI on Packaging Lines: Vision Inspection and Predictive Maintenance</a></li>
</ul>`

const content_es = `<p>La desviaci&oacute;n del registro es el defecto que se come el margen en silencio en una l&iacute;nea de sacos tejidos. La impresora funciona, los sacos parecen correctos a primera vista, y entonces un cliente rechaza un palet porque la l&iacute;nea negra queda medio mil&iacute;metro fuera del relleno rojo y el logotipo se ve borroso. Esta gu&iacute;a recorre el diagn&oacute;stico en el orden que encuentra la causa m&aacute;s r&aacute;pido, explica qu&eacute; hace la <a href="/es/products/flexographic-printing-machine-6c">JLRPM-6800BO/6C</a> para mantener el registro y &mdash; igual de importante &mdash; dice con claridad qu&eacute; puede y qu&eacute; no puede hacer hoy la IA al respecto.</p>

<h2>Por qu&eacute; el registro es m&aacute;s dif&iacute;cil en PP tejido que en pel&iacute;cula</h2>
<p>Casi todos los consejos de resoluci&oacute;n de problemas de flexograf&iacute;a est&aacute;n escritos para pel&iacute;cula o papel. El polipropileno tejido rompe el supuesto central de esos consejos: que la banda que llega a la estaci&oacute;n 6 tiene la misma longitud que la banda que sali&oacute; de la estaci&oacute;n 1.</p>
<p>No la tiene. El PP tejido es un textil. Est&aacute; formado por cintas extruidas cruzadas en urdimbre y trama, y se comporta como un tejido bajo carga: se estira, se estira <em>de forma distinta</em> a lo largo y a lo ancho del tramado, y la magnitud del estiramiento depende de la fuerza con la que se tire de &eacute;l. Una diferencia de tensi&oacute;n entre el desbobinador y la &uacute;ltima estaci&oacute;n de impresi&oacute;n no solo desplaza la banda: <strong>cambia su longitud</strong>. Todos los colores posteriores caen sobre un sustrato que ya no tiene el tama&ntilde;o para el que se hizo el clich&eacute;.</p>
<p>Por eso el registro en PP tejido es, ante todo, un problema de <strong>tensi&oacute;n</strong> disfrazado de problema de impresi&oacute;n. Perseguirlo en la unidad de impresi&oacute;n &mdash; remontando clich&eacute;s, cambiando anilox, ajustando la presi&oacute;n &mdash; es la forma m&aacute;s habitual de gastar un turno entero sin arreglar nada.</p>

<h2>Diagnostique en este orden</h2>
<p>Avance desde la causa m&aacute;s probable y m&aacute;s barata de comprobar hacia la menos probable y m&aacute;s invasiva. Resista la tentaci&oacute;n de empezar por los clich&eacute;s solo porque el defecto se ve en la impresi&oacute;n.</p>

<h3>1. Perfil de tensi&oacute;n, del desbobinado al rebobinado</h3>
<p>Levante un mapa de la tensi&oacute;n en cada zona, no solo del valor de consigna en la HMI. Busque dos cosas: una tensi&oacute;n demasiado alta en conjunto (que estira el tejido) y una tensi&oacute;n que <em>var&iacute;a</em> a medida que se consume la bobina. La segunda es la m&aacute;s traicionera. Al disminuir el di&aacute;metro de la bobina cambian la inercia y la relaci&oacute;n efectiva par-tensi&oacute;n en el desbobinado; si la conicidad no se compensa, la tensi&oacute;n sube o baja a lo largo de la bobina y el registro se desv&iacute;a con ella. Un defecto que est&aacute; limpio al principio de la bobina y mal al final es la firma de una conicidad de tensi&oacute;n, no un problema de clich&eacute;.</p>

<h3>2. Anilox y clich&eacute;s</h3>
<p>Solo tiene sentido mirar aqu&iacute; una vez demostrada la estabilidad de la tensi&oacute;n. Compruebe si el anilox est&aacute; desgastado u obstruido (lo que cambia el peso de la pel&iacute;cula de tinta y, por tanto, el registro aparente en los bordes de una masa), errores de montaje del clich&eacute;, hinchamiento del clich&eacute; por ataque del disolvente y presi&oacute;n de impresi&oacute;n desigual. La presi&oacute;n excesiva merece menci&oacute;n aparte: forzar el clich&eacute; contra el tejido para "conseguir mejor cobertura" deforma tanto el clich&eacute; como la banda, y emborrona el registro mientras aparenta resolver un problema de densidad.</p>

<h3>3. Secado entre colores</h3>
<p>Si un color anterior sigue h&uacute;medo cuando la banda llega al siguiente nip, la fricci&oacute;n en ese punto se vuelve impredecible y el registro baila. El secado depende de la velocidad, por lo que este fallo suele aparecer solo por encima de cierta velocidad de l&iacute;nea: una impresora que registra perfectamente a 60 m/min y se desv&iacute;a a 100 m/min le est&aacute; diciendo que la tinta ya no tiene tiempo de fijar.</p>

<h3>4. Recorrido y gu&iacute;a de la banda</h3>
<p>Revise el desgaste, la contaminaci&oacute;n y el giro libre de los rodillos locos; compruebe que los rodillos est&aacute;n paralelos y que la banda no entra desviada lateralmente en el nip. Un solo rodillo que arrastra introduce un pico de tensi&oacute;n local que ning&uacute;n control central de tensi&oacute;n llegar&aacute; a ver.</p>

<h3>5. Humedad ambiental y electricidad est&aacute;tica</h3>
<p>En &uacute;ltimo lugar, pero compru&eacute;belo antes de aceptar que "la m&aacute;quina est&aacute; gastada". La humedad determina la generaci&oacute;n de est&aacute;tica en la banda en movimiento, y una banda cargada no se comporta de forma consistente en el nip. Si la calidad del registro sigue a la estaci&oacute;n del a&ntilde;o y no al trabajo, la respuesta est&aacute; aqu&iacute;.</p>

<h2>C&oacute;mo la JLRPM-6800BO/6C mantiene el registro</h2>
<p>La impresora no puede hacer que un tejido se comporte como una pel&iacute;cula, pero s&iacute; puede eliminar las variables de la m&aacute;quina para que las que queden sean aquellas sobre las que usted puede actuar:</p>
<ul>
<li><strong>Control de tensi&oacute;n mediante servomotores</strong> a lo largo del recorrido de la banda: el control m&aacute;s importante en PP tejido, por las razones anteriores.</li>
<li><strong>Seis rodillos anilox cer&aacute;micos independientes</strong>, uno por estaci&oacute;n de color, que dosifican un volumen de tinta constante con independencia de la velocidad, de modo que el peso de la pel&iacute;cula de tinta no se desv&iacute;a al cambiar de velocidad.</li>
<li><strong>Secado entre todas las estaciones</strong>, con 18 kW de calentamiento entre colores, para que cada color quede fijado antes de aplicar el siguiente encima.</li>
<li><strong>Cuatro configuraciones de impresi&oacute;n</strong> (0+6, 1+5, 2+4, 3+3), imprimiendo una o ambas caras del tejido en una sola pasada: menos pasadas significan menos ocasiones de reintroducir un error de tensi&oacute;n.</li>
<li><strong>Velocidad m&aacute;xima de impresi&oacute;n de 100 m/min</strong>, con una longitud de repetici&oacute;n de 350&ndash;1300 mm y una anchura m&aacute;xima de impresi&oacute;n de 770 mm.</li>
</ul>

<h2>Qu&eacute; hace hoy la visi&oacute;n artificial &mdash; y qu&eacute; no</h2>
<p>Aqu&iacute; es donde el discurso del sector se vuelve impreciso, as&iacute; que conviene ser exactos.</p>
<p><strong>Lo que est&aacute; disponible hoy.</strong> La <a href="/es/products/ai-machine-intelligence-solutions">Inteligencia de M&aacute;quina de Rey Long</a> ejecuta un modelo de visi&oacute;n CNN en hardware edge instalado en la propia m&aacute;quina, inspeccionando la producci&oacute;n a plena velocidad de l&iacute;nea. <em>Detecta</em> defectos de impresi&oacute;n &mdash; desviaci&oacute;n de registro, falta de tinta, borrosidad &mdash; junto con defectos de material y de costura, con m&aacute;s del 95% de detecci&oacute;n de defectos, y <strong>alerta al operario en cuanto aparece un fallo recurrente</strong>, antes de desperdiciar un lote entero. Se implementa con pocas muestras (una base funcional a partir de unas 50 muestras de referencia) y se instala sobre m&aacute;quinas existentes mediante protocolos industriales est&aacute;ndar (OPC-UA, Modbus, MQTT). En la pr&aacute;ctica, esto convierte la desviaci&oacute;n de registro de un problema que se descubre en un palet terminado en uno del que le avisan en el segundo saco.</p>
<figure><img src="${IMG_HMI}" alt="HMI de inspecci&oacute;n visual por IA en una l&iacute;nea de sacos comparando el saco impreso con una referencia, con los defectos de impresi&oacute;n detectados resaltados" /><figcaption>El sistema de visi&oacute;n CNN compara cada saco con una referencia correcta a plena velocidad de l&iacute;nea y se&ntilde;ala los fallos de impresi&oacute;n en la HMI en cuanto se repiten.</figcaption></figure>
<p><strong>Lo que no est&aacute; disponible hoy.</strong> La <em>correcci&oacute;n</em> en lazo cerrado del registro de color &mdash; la visi&oacute;n midiendo la desviaci&oacute;n y accionando los servos para anularla sin operario en el lazo &mdash; no es una capacidad de Rey Long. Es una direcci&oacute;n hacia la que avanza el sector y que estamos explorando activamente, pero no vamos a describir una intenci&oacute;n como si fuera un producto. Cuando exista, se documentar&aacute; con cifras reales sobre tejido real.</p>
<p>Una distinci&oacute;n importa aqu&iacute;, porque las dos cosas se confunden con facilidad: Rey Long <em>s&iacute;</em> opera hoy un lazo cerrado visi&oacute;n-servo, en la <strong>Compensaci&oacute;n Din&aacute;mica de Errores</strong>. La visi&oacute;n lee la marca Eye-Mark de cada segmento, calcula la deformaci&oacute;n real de la banda y corrige los servomotores sobre la marcha, pero lo hace para ajustar la <strong>precisi&oacute;n de corte y costura</strong>, hacia un objetivo de ±1 mm frente a los aproximadamente ±5 mm del corte de longitud fija convencional. Eso es un problema de longitud, no de alineaci&oacute;n entre colores. El mecanismo est&aacute; emparentado; la aplicaci&oacute;n no es la misma, y ser&iacute;a deshonesto presentar una como la otra. Lo tratamos en detalle en <a href="/es/news/cut-length-drift-woven-bag-lines">la gu&iacute;a sobre longitud de corte</a>.</p>

<h2>En resumen</h2>
<p>En PP tejido, la desviaci&oacute;n del registro es un problema de tensi&oacute;n mientras no se demuestre lo contrario. Levante el perfil de tensi&oacute;n a lo largo de la bobina antes de tocar un clich&eacute;. Despu&eacute;s revise anilox y presi&oacute;n, luego el secado, luego el recorrido de la banda, y por &uacute;ltimo la nave. Una impresora con control de tensi&oacute;n por servo, anilox cer&aacute;mico por estaci&oacute;n y secado entre colores elimina la contribuci&oacute;n de la m&aacute;quina al error; la visi&oacute;n artificial, hoy, le avisa en segundos cuando el error restante ha superado su l&iacute;mite, lo que en una l&iacute;nea a 100 m/min es la diferencia entre dos sacos de desperdicio y dos mil.</p>
<p><em><a href="/es/contact">Hable con el equipo de ingenier&iacute;a de Rey Long</a> sobre el registro en su tejido y sus artes finales.</em></p>

<h2>Preguntas frecuentes</h2>
<h3>&iquest;Qu&eacute; causa la desviaci&oacute;n del registro de impresi&oacute;n en tejido de PP?</h3>
<p>En la mayor&iacute;a de los casos, el propio tejido, no la impresora. El PP tejido no es una banda estable e is&oacute;tropa como la pel&iacute;cula: se estira bajo tensi&oacute;n, y lo hace de forma desigual en urdimbre y trama. Si la banda es un 0,2% m&aacute;s larga en la estaci&oacute;n 6 que en la estaci&oacute;n 1, el sexto color queda un 0,2% fuera de posici&oacute;n por muy bien montado que est&eacute; el clich&eacute;. Por eso la variaci&oacute;n de tensi&oacute;n es lo primero que hay que comprobar, seguida del estado del anilox y del clich&eacute;, el secado entre colores, la alineaci&oacute;n del recorrido de la banda y la humedad ambiental. Las causas mec&aacute;nicas (un rodamiento desgastado, un clich&eacute; mal montado) existen, pero son mucho menos frecuentes que la tensi&oacute;n.</p>
<h3>&iquest;Puede la IA corregir el registro de impresi&oacute;n autom&aacute;ticamente?</h3>
<p>Todav&iacute;a no, y conviene ser precisos sobre d&oacute;nde est&aacute; realmente la industria. El sistema de visi&oacute;n CNN de Rey Long inspecciona cada bolsa a plena velocidad de l&iacute;nea y detecta desviaci&oacute;n de registro, falta de tinta y borrosidad con m&aacute;s del 95% de detecci&oacute;n de defectos, alertando al operario en cuanto aparece un fallo recurrente. Eso es detecci&oacute;n y alerta, y est&aacute; disponible hoy. Cerrar el lazo &mdash; devolver esa medici&oacute;n de visi&oacute;n a los servomotores para corregir el registro sin intervenci&oacute;n humana &mdash; es una direcci&oacute;n hacia la que avanza el sector y que Rey Long est&aacute; explorando activamente, pero no es una capacidad desplegada y no afirmaremos lo contrario. El lazo cerrado visi&oacute;n-servo que s&iacute; existe hoy en Rey Long corrige la longitud de corte y costura mediante Eye-Mark, que es un problema distinto.</p>
<h3>&iquest;Qu&eacute; tolerancia de registro es realista en PP tejido?</h3>
<p>Los sistemas de control autom&aacute;tico de registro en impresoras de pel&iacute;cula suelen especificarse en torno a ±0,1 mm. El PP tejido no alcanza ese valor, porque el propio sustrato se deforma: la tolerancia alcanzable depende del denier del tejido, la densidad del tramado, la laminaci&oacute;n, el perfil de tensi&oacute;n y la velocidad de l&iacute;nea, y se determina correctamente ensayando su tejido real, no citando una ficha t&eacute;cnica. El objetivo pr&aacute;ctico en PP tejido es un error de registro estable y dentro del margen de solapamiento (trapping) del dise&ntilde;o &mdash; por eso los dise&ntilde;adores de artes finales para sacos tejidos incorporan solapamientos generosos en lugar de confiar en una precisi&oacute;n propia de pel&iacute;cula.</p>
<h3>&iquest;Por qu&eacute; el secado entre colores afecta al registro?</h3>
<p>Un color que no ha fijado antes de que la banda entre en la siguiente estaci&oacute;n hace dos cosas: transfiere tinta donde no debe y modifica la fricci&oacute;n entre la banda y el siguiente cilindro de impresi&oacute;n. Una fricci&oacute;n inconsistente significa un comportamiento inconsistente de la banda, que se manifiesta como un error de registro que aparece y desaparece sin causa aparente. La capacidad de secado tambi&eacute;n depende de la velocidad, por lo que una impresora que registra correctamente a 60 m/min puede empezar a desviarse a 100 m/min simplemente porque la tinta tiene menos tiempo para fijar. Por eso la JLRPM-6800BO/6C incorpora un sistema de secado entre cada una de sus seis estaciones, con 18 kW de calentamiento entre colores.</p>
<h3>&iquest;La humedad realmente afecta al registro de impresi&oacute;n?</h3>
<p>Indirectamente s&iacute;, y es la causa que m&aacute;s se pasa por alto porque se correlaciona con la estaci&oacute;n del a&ntilde;o y no con algo que usted haya cambiado en la m&aacute;quina. El polipropileno absorbe muy poca humedad, pero la humedad influye mucho en la generaci&oacute;n de electricidad est&aacute;tica en la banda en movimiento. Una banda cargada est&aacute;ticamente se comporta de forma distinta en el nip y puede adherirse o levantarse de manera impredecible; el acondicionamiento antiest&aacute;tico es uno de esos ajustes t&aacute;citos que los operarios veteranos hacen por intuici&oacute;n. Si la calidad del registro sigue al clima y no al trabajo, revise la humedad ambiental y el control de est&aacute;tica antes que la impresora.</p>

<h2>Lecturas relacionadas</h2>
<ul>
<li><a href="/es/news/cut-length-drift-woven-bag-lines">Desviaci&oacute;n de la longitud de corte en l&iacute;neas de sacos tejidos</a></li>
<li><a href="/es/news/water-based-inks-flexographic-printing-sustainable-packaging">Tintas al agua: el futuro sostenible de la impresi&oacute;n flexogr&aacute;fica de envases</a></li>
<li><a href="/es/news/edge-ai-packaging-lines-vision-inspection-predictive-maintenance">IA en el borde en l&iacute;neas de envasado: inspecci&oacute;n por visi&oacute;n y mantenimiento predictivo</a></li>
</ul>`

const article = {
  slug: SLUG,
  category: 'guide',
  published_at: '2026-07-13T10:00:00Z',
  cover_image_url: IMG_COVER,
  title_en: 'Print Registration Drift on PP Woven Fabric: A Diagnostic Guide',
  title_es: 'Desviación del registro de impresión en tejido PP: guía de diagnóstico',
  summary_en: 'Registration drift on woven PP is a tension problem wearing the costume of a printing problem. A step-by-step diagnosis, what the JLRPM-6800BO/6C controls, and an honest account of what AI vision can and cannot do about it today.',
  summary_es: 'La desviación del registro en PP tejido es un problema de tensión disfrazado de problema de impresión. Diagnóstico paso a paso, qué controla la JLRPM-6800BO/6C y una explicación honesta de lo que la visión artificial puede y no puede hacer hoy.',
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

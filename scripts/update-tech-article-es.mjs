// Fill the Spanish side of products.tech_article.
//
// Every product had English tech_article content and no Spanish at all, so each Spanish product
// page rendered a bare "Principio Técnico" heading above two empty <p> tags — visible to users
// and thin content for search. This merges the Spanish fields into the existing JSONB, leaving
// the English text and image_url on each section untouched.
//
// Dry run:  node scripts/update-tech-article-es.mjs
// Apply:    node scripts/update-tech-article-es.mjs --apply
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const APPLY = process.argv.includes('--apply')

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()]
    })
)
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env')
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// Spanish is keyed by slug; sections are matched by index against the existing English sections.
const ES = {
  'flexographic-printing-machine-6c': {
    title_es: 'Cómo funciona la impresión flexográfica sobre tejido de PP',
    summary_es: 'La JLRPM-6800BO/6C emplea seis estaciones independientes con rodillo anilox cerámico para aplicar hasta seis colores sobre tejido de PP a velocidades de hasta 100 metros por minuto, con secado entre colores en cada estación para evitar que las tintas se corran y mantener un registro de impresión nítido.',
    sections: [
      {
        heading_es: 'El sistema de rodillo anilox cerámico',
        body_es: 'La impresión flexográfica controla el volumen de tinta mediante el rodillo anilox cerámico: un rodillo de acero grabado con un patrón microscópico de celdas y recubierto de cerámica industrial para resistir el desgaste. Cada celda recoge del tintero una cantidad de tinta precisa y dosificada, y la transfiere a la plancha de impresión con un volumen constante, sea cual sea la velocidad de la máquina. La lineatura (líneas por centímetro) y el volumen de celda determinan cuánta tinta se deposita, lo que permite ajustar el espesor de la película de tinta de cada color sin tocar la presión de impresión. La JLRPM-6800BO/6C incorpora un rodillo anilox cerámico dedicado por estación de color en las seis estaciones.',
      },
      {
        heading_es: 'Secado entre colores y registro de impresión',
        body_es: 'Imprimir varios colores en secuencia exige que cada capa de tinta seque antes de que la siguiente estación deposite tinta encima; de lo contrario los colores se corren y se mezclan en la superficie. La JLRPM-6800BO/6C incluye un sistema de secado entre colores en cada una de sus seis estaciones, de modo que el color anterior queda fijado antes de que la banda entre en la siguiente estación de impresión. El registro de impresión —la alineación precisa de cada color respecto a los demás— se mantiene mediante un control de tensión de la banda accionado por servomotores. La máquina admite cuatro modos de configuración (0+6, 1+5, 2+4, 3+3) para imprimir por una o ambas caras del tejido de PP en una sola pasada, a velocidades de hasta 100 metros por minuto.',
      },
    ],
  },

  'eddy-current-non-ferrous-separator': {
    title_es: 'Cómo funciona la separación por corrientes de Foucault',
    summary_es: 'El JLECS-1000W utiliza un rotor magnético de tierras raras que gira a alta velocidad para inducir corrientes de Foucault en los metales no ferrosos, generando una fuerza de repulsión que expulsa el aluminio, el cobre y el latón de flujos de material mezclado sin contacto mecánico.',
    sections: [
      {
        heading_es: 'La física de la recuperación de metales no ferrosos',
        body_es: 'Cuando un metal no ferroso conductor pasa sobre un rotor magnético de tierras raras que gira a gran velocidad, el campo magnético variable induce corrientes de Foucault en el interior del metal. Según la ley de Lenz, esas corrientes generan a su vez un campo magnético opuesto, lo que produce una fuerza de repulsión que impulsa la partícula metálica hacia arriba y fuera de la cinta transportadora. Los materiales no conductores —plástico, vidrio, caucho— no experimentan ninguna fuerza y caen verticalmente, completando la separación sin ningún contacto mecánico.',
      },
      {
        heading_es: 'Separación en dos etapas: primero los ferrosos, después los no ferrosos',
        body_es: 'El JLECS-1000W procesa el material en dos etapas consecutivas. En la primera, un tambor magnético retira los metales ferrosos (acero, hierro) del flujo de entrada: las partículas ferrosas son fuertemente atraídas y quedan retenidas contra el tambor hasta salir del flujo de material. En la segunda etapa, el flujo ya limpio pasa sobre el rotor de corrientes de Foucault, donde el aluminio, el cobre y el latón se expulsan hacia una canaleta dedicada. Retirar los metales ferrosos aguas arriba evita que amortigüen el campo de corrientes inducidas y que degraden la tasa de recuperación de los no ferrosos.',
      },
      {
        heading_es: 'Aplicaciones habituales',
        body_es: 'La separación por corrientes de Foucault se emplea allí donde hay que recuperar metales no ferrosos de un flujo mezclado: recuperación de aluminio en chatarra triturada, extracción de cobre y latón de residuos electrónicos (placas de circuito impreso, mazos de cables), eliminación de metales en líneas de reciclaje de plástico para evitar la contaminación del regranulado, y recuperación de no ferrosos en el tratamiento de residuos sólidos urbanos. El JLECS-1000W procesa hasta 1.000 kg/h; contáctenos indicando la composición y la granulometría de su material de entrada y evaluaremos el rendimiento.',
      },
    ],
  },

  'hp-l-2tzp600-stand-up-zipper-pouch-machine': {
    title_es: 'Cómo funciona la máquina de bolsas doypack con cremallera',
    summary_es: 'La JL-L-2TZP600 combina un control totalmente servoasistido Panasonic con una configuración de termosellado de 4+2 grupos para producir cinco formatos de bolsa flexible —incluidas las doypack de fondo estable y las bolsas con cremallera— con una precisión de posicionamiento de 0,3 mm o mejor y hasta 220 piezas por minuto.',
    sections: [
      {
        heading_es: 'Tecnología de termosellado sobre película laminada',
        body_es: 'Las bolsas flexibles se fabrican con películas laminadas termosellables —estructuras multicapa como NY/PE, PET/PE o AL/PE— en las que la capa más interna se funde y se une al comprimirse entre barras de sellado calientes. La JL-L-2TZP600 emplea 4 grupos de barras calefactoras más 2 grupos de barras de enfriamiento en cada sellado (vertical y horizontal). Los grupos de enfriamiento vuelven a solidificar la unión bajo presión antes de liberar la bolsa, lo que impide que la película, aún fundida, se deforme. Esta configuración 4+2 permite mantener una resistencia de sellado constante a alta velocidad, en un rango de temperatura de hasta 300 grados Celsius para películas de grado retorta.',
      },
      {
        heading_es: 'Precisión totalmente servoasistida y capacidad multiformato',
        body_es: 'Cada eje de movimiento —avance de la película, sellado, corte e inserción de la cremallera— está accionado por un servomotor Panasonic independiente con realimentación de posición en lazo cerrado. Gracias a ello la máquina alcanza una precisión de posicionamiento de 0,3 mm o mejor sobre películas preimpresas: lee las marcas de registro con sensores fotoeléctricos y corrige el avance de la película en tiempo real. Esa misma arquitectura servoasistida permite cambiar entre cinco formatos de bolsa (sellado de tres lados, tres lados con cremallera, cuatro lados, doypack y doypack con cremallera) modificando parámetros en la pantalla táctil del PLC, sin necesidad de reconfiguración mecánica.',
      },
      {
        heading_es: 'Sellado ultrasónico de la cremallera',
        body_es: 'La cremallera exige un mecanismo de sellado distinto al del resto de la bolsa. Termosellar una cremallera de plástico puede deformar su perfil de cierre y dificultar la apertura y el recierre. La JL-L-2TZP600 utiliza una unidad de sellado ultrasónico para fijar la cremallera: un transductor la hace vibrar a alta frecuencia y genera calor por fricción localizado únicamente en la interfaz de unión, en lugar de en toda la sección de la cremallera. El resultado es un sellado limpio y preciso que conserva el perfil de la cremallera en el ancho estándar de 13 mm.',
      },
    ],
  },

  'automatic-printing-tubing-cutting-sewing-line': {
    title_es: 'Cómo funciona la línea integral de sacos de PP tejido',
    summary_es: 'La JLPTCSM-1300W integra impresión flexográfica, formación del tubo, corte, cosido y aplicación de sobrecinta en un único proceso continuo, produciendo sacos de PP tejido terminados a un ritmo de 25 a 40 sacos por minuto a partir de la bobina de tejido, sin transferencias manuales entre etapas.',
    sections: [
      {
        heading_es: 'De la bobina de tejido al saco terminado en una sola pasada',
        body_es: 'En una fábrica de sacos tejidos convencional, la impresión, el tubulado, el corte, el cosido y el encintado se ejecutan como operaciones separadas, con transferencias de material entre cada paso. La línea JLPTCSM-1300W elimina esas transferencias enlazando las cinco operaciones en un único sistema de accionamiento sincronizado. El tejido de PP se desbobina, atraviesa la unidad de impresión flexográfica de 4 colores, se conforma en tubo, se corta a medida, se cose por el fondo y se remata con una sobrecinta, todo ello en un movimiento continuo a una cadencia de 25 a 40 sacos por minuto.',
      },
      {
        heading_es: 'Impresión flexográfica de 4 colores sobre tejido de PP',
        body_es: 'Imprimir en flexografía sobre tejido de PP exige un control de tensión preciso, porque el material se estira de forma distinta al papel o a la película. La JLPTCSM-1300W incorpora una unidad flexográfica de 4 colores (4+0) con rodillos anilox cerámicos, que dosifican el volumen de tinta de manera uniforme en toda la banda con independencia de las variaciones de velocidad de la línea. La longitud de repetición de impresión es ajustable de 450 a 1200 mm y el ancho máximo de impresión es de 1300 mm. Admite tanto tejido de PP sin recubrir como laminado con BOPP; este último permite obtener sacos resistentes a la humedad con una superficie impresa brillante.',
      },
    ],
  },

  // No sections and no English title: this product tells its story through the AiSolutionStory
  // component (products.content), not a tech article. Only the summary needs a Spanish version,
  // and it is what the Spanish product card shows.
  'ai-machine-intelligence-solutions': {
    title_es: '',
    summary_es: 'La Inteligencia de Máquina con IA de Rey Long integra computación en el borde y visión artificial directamente en las líneas de producción de bolsas de plástico: detecta defectos en tiempo real, digitaliza el conocimiento de los operarios y compensa los servoaccionamientos para lograr una precisión de corte y cosido inferior a ±1 mm, sin necesidad de conexión a la nube.',
  },
}

const res = await fetch(`${BASE}/rest/v1/products?select=id,slug,tech_article`, { headers })
const products = await res.json()

let updated = 0
for (const product of products) {
  const spanish = ES[product.slug]
  const article = product.tech_article
  if (!spanish || !article) {
    console.log(`skip ${product.slug} (${!article ? 'no tech_article' : 'no translation'})`)
    continue
  }

  const sections = (article.sections ?? []).map((section, i) => ({
    ...section, // keep body_en, image_url, image_caption_en, animation_url
    heading_es: spanish.sections?.[i]?.heading_es ?? section.heading_es ?? '',
    body_es: spanish.sections?.[i]?.body_es ?? section.body_es ?? '',
  }))

  const merged = { ...article, title_es: spanish.title_es, summary_es: spanish.summary_es, sections }

  const translatedSections = sections.filter(s => s.body_es).length
  console.log(`${product.slug}: title_es + summary_es + ${translatedSections}/${sections.length} sections`)

  if (!APPLY) continue

  const patch = await fetch(`${BASE}/rest/v1/products?id=eq.${product.id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ tech_article: merged }),
  })
  if (!patch.ok) {
    console.error(`FAIL ${product.slug}: HTTP ${patch.status} ${await patch.text()}`)
    process.exit(1)
  }
  updated++
}

console.log(APPLY ? `\n${updated} products updated` : '\ndry run — re-run with --apply to write')

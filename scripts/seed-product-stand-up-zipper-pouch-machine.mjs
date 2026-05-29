import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually
const envVars = readFileSync(new URL('../.env', import.meta.url), 'utf8')
for (const line of envVars.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const BUCKET = 'product-media'

const IMAGE_PATH = resolve('C:/Users/Willim Ho/Desktop/網站資料/產品/三封機/中封夾鏈袋.jpg')

const PRODUCT = {
  slug: 'hp-l-2tzp600-stand-up-zipper-pouch-machine',
  category: 'bag-making-machines',
  is_featured: true,
  sort_order: 20,
  name_en: 'High-Speed Multi-Function Stand-Up Zipper Pouch Bag Making Machine',
  name_es: 'Máquina de Alta Velocidad Multifunción para Fabricar Bolsas Doypack con Cierre Zip',
  description_en: `The JL-L-2TZP600 is Rey Long's flagship high-speed, multi-function pouch bag making machine, capable of producing five bag styles — three-side sealing bags, three-side sealing zipper bags, four-side sealing bags, stand-up doypack pouches (with or without zipper) — on a single platform. Built with a 10 mm steel-plate frame, full servo-motor control (Panasonic), and a PLC touch-screen interface, the machine delivers positional accuracy of ≤0.3 mm and speeds up to 220 pcs/min for three-side sealing bags. Zipper sealing is achieved via ultrasonic wave technology, eliminating heat damage to film. Optional double-unwinding and non-stop accumulator modules maximize uptime for continuous production.`,
  description_es: `La JL-L-2TZP600 es la máquina insignia de Rey Long para fabricación de bolsas flexibles de alta velocidad y múltiples funciones, capaz de producir cinco estilos de bolsa — bolsa de tres sellos, bolsa de tres sellos con cierre zip, bolsa de cuatro sellos, doypack sin cierre y doypack con cierre — en una sola plataforma. Construida con estructura de acero de 10 mm, control completo por servomotores (Panasonic) e interfaz táctil PLC, la máquina ofrece una precisión posicional de ≤0,3 mm y velocidades de hasta 220 bolsas/min para bolsas de tres sellos. El sellado del cierre se realiza mediante tecnología ultrasónica, eliminando el daño por calor al film. Los módulos opcionales de doble desbobinado y acumulador de parada cero maximizan el tiempo de funcionamiento en producción continua.`,
  specs: [
    { key: 'Model',                      value: 'JL-L-2TZP600' },
    { key: 'Speed (3-side seal)',         value: '35–220 pcs/min' },
    { key: 'Speed (3-side seal + zipper)', value: '35–150 pcs/min' },
    { key: 'Speed (Doypack)',             value: '35–120 pcs/min' },
    { key: 'Bag Types',                  value: 'Three-side seal / Three-side seal + zipper / Four-side seal / Doypack / Doypack with zipper' },
    { key: 'Applicable Material',        value: 'Heat-seal laminated film' },
    { key: 'Film Thickness',             value: '30–180 μm' },
    { key: 'Max Web Width',              value: '1240 mm (patch web: 150 mm)' },
    { key: 'Max Web Roll Diameter',      value: 'φ600 mm (patch web: φ600 mm)' },
    { key: 'Bag Width (3-side seal)',    value: '100–580 mm' },
    { key: 'Bag Length',                 value: '50–420 mm (skip function up to 6× for longer bags)' },
    { key: 'Bottom Seal Width',          value: '5–60 mm' },
    { key: 'Zipper Width',               value: '13 mm' },
    { key: 'Positional Accuracy',        value: '≤0.3 mm' },
    { key: 'Vertical Sealing',           value: '4 groups heating + 2 groups cooling' },
    { key: 'Horizontal Sealing',         value: '4 groups heating + 2 groups cooling' },
    { key: 'Zipper Sealing',             value: 'Ultrasonic wave, 1 group' },
    { key: 'Temperature Range',          value: 'Indoor – 300 °C' },
    { key: 'Power Supply',               value: '220 V / 3P / 60 Hz, 60 kW' },
    { key: 'Machine Weight',             value: '9,000 kg' },
  ],
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) throw new Error(`Failed to create bucket: ${error.message}`)
    console.log(`✓ Bucket "${BUCKET}" created`)
  } else {
    console.log(`✓ Bucket "${BUCKET}" exists`)
  }
}

async function uploadFile(localPath, storagePath, mimeType) {
  const file = readFileSync(localPath)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: true })
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  console.log(`✓ Uploaded: ${data.publicUrl}`)
  return data.publicUrl
}

async function main() {
  console.log('=== Seeding: JL-L-2TZP600 Stand-Up Zipper Pouch Machine ===\n')

  await ensureBucket()

  const slug = PRODUCT.slug
  const imageUrl = await uploadFile(IMAGE_PATH, `${slug}/cover.jpg`, 'image/jpeg')

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation,resolution=merge-duplicates',
  }

  const res = await fetch(`${url}/rest/v1/products?on_conflict=slug`, {
    method: 'POST',
    headers,
    body: JSON.stringify(PRODUCT),
  })
  const productData = await res.json()
  if (!res.ok) throw new Error(`Product insert failed: ${JSON.stringify(productData)}`)
  const product = Array.isArray(productData) ? productData[0] : productData
  console.log(`✓ Product upserted: ${product.id}`)

  await fetch(`${url}/rest/v1/product_media?product_id=eq.${product.id}`, {
    method: 'DELETE',
    headers,
  })

  const media = [
    {
      product_id: product.id,
      type:        'image',
      url:         imageUrl,
      caption_en:  'JL-L-2TZP600 Stand-Up Zipper Pouch Bag Making Machine',
      caption_es:  'Máquina JL-L-2TZP600 para Fabricar Bolsas Doypack con Cierre Zip',
      sort_order:  1,
    },
  ]

  const mediaRes = await fetch(`${url}/rest/v1/product_media`, {
    method: 'POST',
    headers,
    body: JSON.stringify(media),
  })
  if (!mediaRes.ok) {
    const err = await mediaRes.json()
    throw new Error(`Media insert failed: ${JSON.stringify(err)}`)
  }
  console.log(`✓ Media record inserted (image)`)

  console.log('\n=== Done! ===')
  console.log(`Product URL: https://www.reylong.com/products/${slug}`)
}

main().catch(err => {
  console.error('ERROR:', err.message)
  process.exit(1)
})

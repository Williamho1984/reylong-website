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
const IMAGE_PATH = resolve('C:/Users/Willim Ho/Desktop/網站資料/產品/渦電流/WhatsApp Image 2026-05-08 at 4.54.46 PM.jpeg')

const PRODUCT = {
  slug: 'eddy-current-non-ferrous-separator',
  category: 'recycling-machines',
  is_featured: true,
  sort_order: 20,
  name_en: 'Eddy Current Non-Ferrous Metal Separator Line',
  name_es: 'Línea Separadora de Metales No Ferrosos por Corriente de Foucault',
  description_en: `Rey Long's JLECS-1000W is a complete non-ferrous metal separation line combining three stages in one system: a vibratory feeder for material distribution, a high-intensity magnetic drum separator for ferrous removal, and an eddy current magnetic roller for precise non-ferrous metal recovery. Ideal for recycling plants, e-waste processing, and mixed-material sorting.`,
  description_es: `El JLECS-1000W de Rey Long es una línea completa de separación de metales no ferrosos que combina tres etapas en un solo sistema: un alimentador vibratorio para la distribución del material, un separador magnético de tambor de alta intensidad para la eliminación de metales ferrosos y un rodillo magnético de corriente de Foucault para la recuperación precisa de metales no ferrosos. Ideal para plantas de reciclaje, procesamiento de residuos electrónicos y clasificación de materiales mixtos.`,
  specs: [
    { key: 'Model',                    value: 'JLECS-1000W' },
    { key: 'Capacity',                 value: '1,000 kg/h' },
    { key: 'Separation Particle Size', value: '5–200 mm' },
    { key: 'Working Width',            value: '1,000 mm' },
    { key: 'Magnetic Field Strength',  value: '3,000 GS' },
    { key: 'Max Rotary Speed',         value: '3,000 RPM' },
    { key: 'Total Power',              value: '12 kW' },
    { key: 'Dimension (L × W × H)',   value: '4,500 × 2,100 × 2,500 mm' },
    { key: 'Weight',                   value: '3,400 kg' },
  ],
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
  console.log('=== Seeding: Eddy Current Non-Ferrous Separator ===\n')

  const slug = PRODUCT.slug
  const imageUrl = await uploadFile(IMAGE_PATH, `${slug}/cover.jpg`, 'image/jpeg')

  const url  = process.env.SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
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
      product_id:  product.id,
      type:        'image',
      url:         imageUrl,
      caption_en:  'Eddy Current Non-Ferrous Metal Separator Line – JLECS-1000W',
      caption_es:  'Línea Separadora de Metales No Ferrosos – JLECS-1000W',
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
  console.log(`✓ Media record inserted (image only — add catalog PDF later)`)

  console.log('\n=== Done! ===')
  console.log(`Product URL: https://www.reylong.com/products/${slug}`)
}

main().catch(err => {
  console.error('ERROR:', err.message)
  process.exit(1)
})

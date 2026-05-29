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

const IMAGE_PATH = resolve('C:/Users/Willim Ho/Desktop/網站資料/產品/製袋機/製袋機照片.jpg')
const PDF_PATH   = resolve('C:/Users/Willim Ho/Desktop/網站資料/產品/製袋機/JLPTCSOM-1300W-EM(080421).pdf')

const PRODUCT = {
  slug: 'automatic-printing-tubing-cutting-sewing-line',
  category: 'bag-making-machines',
  is_featured: true,
  sort_order: 10,
  name_en: 'Automatic Printing-Tubing-Cutting-Sewing-Overtape Convention Line',
  name_es: 'Línea Convencional Automática de Impresión-Tubería-Corte-Costura',
  description_en: `Rey Long's fully integrated bag-making convention line combines four production stages — flexographic printing, tube forming, cutting & sewing, and overtape application — into a single, continuous process. Designed for high-volume PP woven bag production, the line delivers consistent quality with servo-controlled precision and a touch-screen control system.`,
  description_es: `La línea convencional totalmente integrada de Rey Long combina cuatro etapas de producción — impresión flexográfica, formación de tubos, corte y costura, y aplicación de cinta adhesiva — en un proceso único y continuo. Diseñada para la producción en grandes volúmenes de sacos de PP tejido, la línea ofrece calidad constante con precisión controlada por servo y un sistema de control con pantalla táctil.`,
  specs: [
    { key: 'Model',                        value: 'JLPTCSM-1300W' },
    { key: 'Production Capacity',          value: '25–40 bags/min' },
    { key: 'Printing Colors',              value: '4 Colors (4+0)' },
    { key: 'Printing Repeat Length',       value: '450–1200 mm' },
    { key: 'Max Printing Width',           value: '1300 mm' },
    { key: 'Fabric Width (Before Tubing)', value: '700–1300 mm' },
    { key: 'Fabric Width (After Tubing)',  value: '430–660 mm' },
    { key: 'Max Web Width',                value: '1300 mm' },
    { key: 'Gusset Depth',                 value: '40–90 mm' },
    { key: 'Cutting Length',               value: '550–1250 mm' },
    { key: 'Cutting Accuracy',             value: '1 mm' },
    { key: 'Overtape Width',               value: '55 mm or 65 mm' },
    { key: 'Stitching Range',              value: '6–12 mm' },
    { key: 'Total Power',                  value: '51.7 kW' },
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
  console.log('=== Seeding: Bag Making Convention Line ===\n')

  await ensureBucket()

  const slug = PRODUCT.slug
  const imageUrl = await uploadFile(IMAGE_PATH, `${slug}/cover.jpg`,        'image/jpeg')
  const pdfUrl   = await uploadFile(PDF_PATH,   `${slug}/catalog.pdf`,      'application/pdf')

  const url  = process.env.SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation,resolution=merge-duplicates',
  }

  // Upsert product via fetch (bypasses supabase-js session management)
  const res = await fetch(`${url}/rest/v1/products?on_conflict=slug`, {
    method: 'POST',
    headers,
    body: JSON.stringify(PRODUCT),
  })
  const productData = await res.json()
  if (!res.ok) throw new Error(`Product insert failed: ${JSON.stringify(productData)}`)
  const product = Array.isArray(productData) ? productData[0] : productData
  console.log(`✓ Product upserted: ${product.id}`)

  // Delete existing media to avoid duplicates on re-run
  await fetch(`${url}/rest/v1/product_media?product_id=eq.${product.id}`, {
    method: 'DELETE',
    headers,
  })

  const media = [
    {
      product_id:  product.id,
      type:        'image',
      url:         imageUrl,
      caption_en:  'Automatic Printing-Tubing-Cutting-Sewing-Overtape Convention Line',
      caption_es:  'Línea Convencional Automática de Impresión-Tubería-Corte-Costura',
      sort_order:  1,
    },
    {
      product_id:  product.id,
      type:        'catalog_pdf',
      url:         pdfUrl,
      caption_en:  'Product Catalog (PDF)',
      caption_es:  'Catálogo del Producto (PDF)',
      sort_order:  2,
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
  console.log(`✓ Media records inserted (image + PDF)`)

  console.log('\n=== Done! ===')
  console.log(`Product URL: https://www.reylong.com/products/${slug}`)
}

main().catch(err => {
  console.error('ERROR:', err.message)
  process.exit(1)
})

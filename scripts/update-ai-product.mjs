// Update the "AI-Powered Machine Intelligence Solutions" product with content
// integrated from the 114年 AI 輔助決策系統研發轉型計畫, generalized from woven
// bags to plastic bag making machines. Numbers kept but framed as targets/up-to.
// Run: node scripts/update-ai-product.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// --- read .env manually (no dotenv) ---
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
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
}

const SLUG = 'ai-machine-intelligence-solutions'

const description_en =
  "Rey Long's AI-Powered Machine Intelligence turns a conventional plastic bag making machine into a self-optimizing production line. Instead of running in the cloud, AI inference happens on edge hardware installed at the machine — delivering real-time decisions with near-zero latency and full offline resilience, and retrofittable onto your existing equipment without a full replacement. The program is built on three field-proven capabilities. First, Operator Expertise Digitization captures the tacit know-how of veteran technicians — fabric and film tension, denier-to-feed-speed torque compensation, humidity-driven anti-static control — and turns it into a model that recommends optimal parameters directly on the HMI, so a new operator can set up the line like a 20-year veteran. Second, High-Speed Computer-Vision Inspection uses a CNN model to catch printing, material, and stitching defects in real time at full machine speed, alerting the operator the moment a recurring fault appears. Third, Dynamic Error Compensation reads Eye-Mark deformation through vision and corrects the servo drives on the fly, tightening cutting and sewing accuracy while driving down scrap. Proven on woven-bag lines, stand-up pouch machines, and flexographic printing machines and integrated through standard industrial protocols (OPC-UA, Modbus, MQTT), it delivers measurable ROI on the equipment you already own."

const description_es =
  "La Inteligencia de Máquinas con IA de Rey Long convierte una máquina convencional de fabricación de bolsas de plástico en una línea de producción autooptimizada. En lugar de ejecutarse en la nube, la inferencia de IA se realiza en hardware de borde instalado en la propia máquina, ofreciendo decisiones en tiempo real con latencia casi nula y plena resiliencia sin conexión, y se puede adaptar a sus equipos existentes sin sustituirlos por completo. El programa se basa en tres capacidades probadas en campo. Primero, la Digitalización de la Experiencia del Operario captura el conocimiento tácito de los técnicos veteranos —tensión de tejido y film, compensación de par según denier y velocidad de alimentación, control antiestático según la humedad— y lo convierte en un modelo que recomienda los parámetros óptimos directamente en la HMI, de modo que un operario nuevo puede configurar la línea como un veterano de 20 años. Segundo, la Inspección por Visión Artificial de Alta Velocidad emplea un modelo CNN para detectar defectos de impresión, material y costura en tiempo real a plena velocidad de la máquina, alertando al operario en cuanto aparece un fallo recurrente. Tercero, la Compensación Dinámica de Errores lee la deformación mediante marcas Eye-Mark a través de la visión y corrige los servomotores sobre la marcha, mejorando la precisión de corte y costura y reduciendo el desperdicio. Probada en líneas de sacos tejidos, máquinas de bolsas doypack y máquinas de impresión flexográfica, e integrada mediante protocolos industriales estándar (OPC-UA, Modbus, MQTT), ofrece un ROI medible sobre los equipos que ya posee."

const specs = {
  'Deployment': 'Edge computing at the machine — runs fully offline, no cloud dependency',
  'Retrofit': 'Integrates onto existing machines; no full line replacement required',
  'Cutting & sewing accuracy': 'Target ≤ ±1 mm (vs. ~±5 mm on conventional fixed-length cutting)',
  'Scrap rate': 'Reduced to as low as ~2%, down from ~5% (application-dependent)',
  'Visual defect detection': 'Up to 95%+ defect recall via CNN inference',
  'Print yield': 'Up to +5% improvement, case by case',
  'Operator efficiency': 'One operator can supervise up to 4 machines (vs. 2)',
  'Model setup': 'Few-shot — baseline model from as few as ~50 reference samples',
  'Industrial protocols': 'OPC-UA, Modbus, MQTT',
  'Applicable machines': 'Woven-bag lines, stand-up pouch machines, flexographic printing machines',
}

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/products?slug=eq.${SLUG}`,
  {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ description_en, description_es, specs }),
  }
)

const text = await res.text()
if (!res.ok) {
  throw new Error(`Update failed (${res.status}): ${text}`)
}
const rows = JSON.parse(text)
console.log(`Updated ${rows.length} row(s).`)
console.log('name_en:', rows[0]?.name_en)
console.log('specs keys:', Object.keys(rows[0]?.specs ?? {}).length)
console.log('description_en length:', rows[0]?.description_en?.length)

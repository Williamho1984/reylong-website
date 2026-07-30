/**
 * Hand-written meta descriptions for product pages.
 *
 * The generated fallback (`metaDescription(product.description_en)`) takes the
 * on-page product copy and cuts it at ~155 characters. That copy is written to
 * introduce the machine to a reader who already landed on the page, so it opens
 * with the brand name and runs long — which makes it a poor SERP snippet: the
 * most valuable characters go to a name the searcher did not query, and the
 * sentence gets guillotined mid-clause.
 *
 * These entries lead with what the machine does and the numbers a buyer
 * searches on, and each is a complete sentence inside the display limit.
 * Every figure here is taken from the product's own specs or FAQ — nothing is
 * rounded up or invented.
 *
 * Products without an entry fall back to the generated description, so adding
 * a machine never breaks the page; it just misses this polish until curated.
 * Kept as a code-level table for the same reason `productFAQ` is: five rows,
 * version-controlled, and testable.
 */
export type ProductSeoCopy = { en: string; es: string }

export const PRODUCT_SEO_DESCRIPTIONS: Record<string, ProductSeoCopy> = {
  'automatic-printing-tubing-cutting-sewing-line': {
    en: 'Fully integrated PP woven sack line: flexographic printing, tube forming, cutting, sewing and overtape in one continuous pass at 25–40 bags/min.',
    es: 'Línea integrada de sacos de PP tejido: impresión flexográfica, tubulado, corte, costura y cinta en un solo paso continuo a 25–40 sacos/min.',
  },
  'hp-l-2tzp600-stand-up-zipper-pouch-machine': {
    en: 'Five pouch formats on one servo platform — three-side seal, zipper, four-side seal and doypack — running to 220 pcs/min at ≤0.3 mm accuracy.',
    es: 'Cinco formatos de bolsa en una plataforma servo: tres sellos, cierre zip, cuatro sellos y doypack, hasta 220 bolsas/min con precisión de ≤0,3 mm.',
  },
  'flexographic-printing-machine-6c': {
    en: 'Six-color flexographic press for PP woven and laminated fabric: 800 mm web width, up to 120 m/min, ceramic anilox rollers and inter-color drying.',
    es: 'Impresora flexográfica de 6 colores para tejido de PP y laminado: ancho de banda de 800 mm, hasta 120 m/min, anilox cerámicos y secado entre colores.',
  },
  'eddy-current-non-ferrous-separator': {
    en: 'Recover aluminum, copper and brass from mixed waste at 1,000 kg/h: vibratory feeder, magnetic drum for ferrous removal and eddy current rotor.',
    es: 'Recupere aluminio, cobre y latón de residuos mezclados a 1.000 kg/h: alimentador vibratorio, tambor magnético para ferrosos y rotor de Foucault.',
  },
  'ai-machine-intelligence-solutions': {
    en: 'Edge AI retrofit for plastic bag making machines: on-machine vision inspection, operator know-how digitization and servo error compensation.',
    es: 'Retrofit de IA en el borde para máquinas de bolsas de plástico: inspección por visión, saber del operario digitalizado y compensación servo.',
  },
}

/**
 * Curated meta description for a product page, or `fallback` when the product
 * has no entry yet.
 */
export function productSeoDescription(
  slug: string,
  lang: 'en' | 'es',
  fallback: string
): string {
  return PRODUCT_SEO_DESCRIPTIONS[slug]?.[lang] || fallback
}

# Tech Article AEO Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `tech_article` JSONB column to the `products` table so each product page shows structured technical prose and emits `TechArticle` JSON-LD, improving citation by AI answer engines.

**Architecture:** New `tech_article` JSONB column on `products` table → TypeScript type in `products.ts` → new `TechArticleSection.astro` component renders prose on detail pages → `ProductCard.astro` shows summary on listing page → `ProductSchema.astro` emits second JSON-LD block.

**Tech Stack:** Supabase (Postgres JSONB), Astro 5, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/lib/db/products.ts` |
| Create | `src/components/ui/TechArticleSection.astro` |
| Modify | `src/components/ui/ProductCard.astro` |
| Modify | `src/components/seo/ProductSchema.astro` |
| Modify | `src/pages/products/[slug].astro` |
| Modify | `src/pages/es/products/[slug].astro` |
| Seed SQL | (run in Supabase SQL editor, no file created) |

---

## Task 1: Add `tech_article` Column to Supabase

**Files:** Supabase SQL editor (no local file)

- [ ] **Step 1: Run migration in Supabase SQL editor**

Go to Supabase dashboard → SQL Editor → New query. Run:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_article JSONB;
```

Expected: `ALTER TABLE` — no error.

- [ ] **Step 2: Verify column exists**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'tech_article';
```

Expected: one row returned, `data_type = 'jsonb'`.

- [ ] **Step 3: Commit note**

No local files changed. Note in git commit when types are added (Task 2).

---

## Task 2: Add TypeScript Types

**Files:**
- Modify: `src/lib/db/products.ts`

- [ ] **Step 1: Add types at the top of the types section**

Open `src/lib/db/products.ts`. After the `AiContent` type block (around line 28), add:

```typescript
export type TechArticleSection = {
  heading_en: string
  heading_es: string
  body_en: string
  body_es: string
  image_url?: string
  image_caption_en?: string
  animation_url?: string
}

export type TechArticle = {
  summary_en: string
  summary_es: string
  title_en: string
  title_es: string
  sections: TechArticleSection[]
}
```

- [ ] **Step 2: Add field to Product type**

In the `Product` type (around line 30), after `content?: AiContent | null`, add:

```typescript
  tech_article?: TechArticle | null
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx astro check
```

Expected: 0 errors. If errors appear, they will be in files that import `Product` — fix by checking the type name matches exactly.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/products.ts
git commit -m "feat: add TechArticle types to Product"
```

---

## Task 3: Create TechArticleSection Component

**Files:**
- Create: `src/components/ui/TechArticleSection.astro`

- [ ] **Step 1: Create the component**

```astro
---
import type { TechArticle } from '../../lib/db/products'

interface Props {
  article: TechArticle
  lang?: 'en' | 'es'
}

const { article, lang = 'en' } = Astro.props
const title = lang === 'es' ? article.title_es : article.title_en
---

<section class="mt-12" id="technical-overview" aria-label="Technical overview">
  <h2 class="mb-6">{title || (lang === 'es' ? 'Principio Técnico' : 'How It Works')}</h2>
  <div class="space-y-8">
    {article.sections.map(section => {
      const heading = lang === 'es' ? section.heading_es : section.heading_en
      const body = lang === 'es' ? section.body_es : section.body_en
      return (
        <div>
          {heading && <h3 class="text-lg font-semibold mb-2">{heading}</h3>}
          <p class="text-gray-700 leading-relaxed">{body}</p>
          {section.image_url && (
            <figure class="mt-4">
              <img
                src={section.image_url}
                alt={section.image_caption_en ?? heading ?? ''}
                class="w-full max-w-2xl rounded"
                loading="lazy"
              />
              {section.image_caption_en && (
                <figcaption class="text-sm text-gray-500 mt-1">{section.image_caption_en}</figcaption>
              )}
            </figure>
          )}
          {section.animation_url && !section.image_url && (
            <video
              src={section.animation_url}
              autoplay
              loop
              muted
              playsinline
              class="mt-4 w-full max-w-2xl rounded"
              aria-label={heading ?? ''}
            />
          )}
        </div>
      )
    })}
  </div>
</section>
```

- [ ] **Step 2: Run type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TechArticleSection.astro
git commit -m "feat: add TechArticleSection component"
```

---

## Task 4: Update ProductSchema to Emit TechArticle JSON-LD

**Files:**
- Modify: `src/components/seo/ProductSchema.astro`

- [ ] **Step 1: Add TechArticle schema block**

Open `src/components/seo/ProductSchema.astro`. The current file ends at line 49 with one `<script type="application/ld+json">`. Add a second block after it:

```astro
---
import type { Product } from '../../lib/db/products'

interface Props {
  product: Product
  imageUrl?: string
  pageUrl: string
}

const { product, imageUrl, pageUrl } = Astro.props

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name_en,
  description: product.description_en,
  url: pageUrl,
  brand: {
    '@type': 'Brand',
    name: 'Reylong'
  },
  manufacturer: {
    '@type': 'Organization',
    name: 'Reylong Machinery Co., Ltd.',
    url: 'https://reylong.com'
  },
  ...(imageUrl ? { image: imageUrl } : {}),
  additionalProperty: Array.isArray(product.specs)
    ? (product.specs as Array<{key: string; value: string}>).map(({ key, value }) => ({
        '@type': 'PropertyValue',
        name: key,
        value
      }))
    : Object.entries(product.specs ?? {}).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value
      }))
}

const techArticleSchema = product.tech_article?.title_en ? {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: product.tech_article.title_en,
  description: product.tech_article.summary_en,
  url: `${pageUrl}#technical-overview`,
  publisher: {
    '@type': 'Organization',
    name: 'Reylong Machinery Co., Ltd.',
    url: 'https://reylong.com'
  }
} : null

function safeJson(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\//g, '\\u002f')
}
---

<script type="application/ld+json" set:html={safeJson(schema)} />
{techArticleSchema && (
  <script type="application/ld+json" set:html={safeJson(techArticleSchema)} />
)}
```

- [ ] **Step 2: Run type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/seo/ProductSchema.astro
git commit -m "feat: emit TechArticle JSON-LD schema when tech_article present"
```

---

## Task 5: Update ProductCard to Show Summary

**Files:**
- Modify: `src/components/ui/ProductCard.astro`

- [ ] **Step 1: Add summary line after description**

Open `src/components/ui/ProductCard.astro`. In the `<div class="p-4">` section, after the `<p>` description line (currently line 35), add:

```astro
    {product.tech_article?.summary_en && lang === 'en' && (
      <p class="text-gray-500 text-xs mt-2 line-clamp-2 italic">
        {product.tech_article.summary_en}
      </p>
    )}
    {product.tech_article?.summary_es && lang === 'es' && (
      <p class="text-gray-500 text-xs mt-2 line-clamp-2 italic">
        {product.tech_article.summary_es}
      </p>
    )}
```

The full updated `<div class="p-4">` section becomes:

```astro
  <div class="p-4">
    <h3 class="font-semibold text-lg group-hover:text-brand-blue transition-colors line-clamp-2">
      {name}
    </h3>
    <p class="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>
    {product.tech_article?.summary_en && lang === 'en' && (
      <p class="text-gray-500 text-xs mt-2 line-clamp-2 italic">
        {product.tech_article.summary_en}
      </p>
    )}
    {product.tech_article?.summary_es && lang === 'es' && (
      <p class="text-gray-500 text-xs mt-2 line-clamp-2 italic">
        {product.tech_article.summary_es}
      </p>
    )}
    <a
      href={productUrl}
      class="inline-block mt-4 text-brand-blue text-sm font-medium hover:underline"
    >
      {learnMoreLabel} →
    </a>
  </div>
```

- [ ] **Step 2: Run type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProductCard.astro
git commit -m "feat: show tech article summary on product listing card"
```

---

## Task 6: Update EN Product Detail Page

**Files:**
- Modify: `src/pages/products/[slug].astro`

- [ ] **Step 1: Import TechArticleSection**

At the top of the frontmatter imports (around line 8), add:

```typescript
import TechArticleSection from '../../components/ui/TechArticleSection.astro'
```

- [ ] **Step 2: Insert TechArticleSection between specs and FAQ**

Find the comment `<!-- FAQ Section (AEO) -->` (around line 149). Directly before it, add:

```astro
    {/* Technical Article (AEO) — shown for non-AI products that have prose sections */}
    {!aiContent && product.tech_article?.sections?.length ? (
      <TechArticleSection article={product.tech_article} lang="en" />
    ) : null}
```

- [ ] **Step 3: Run type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/products/[slug].astro
git commit -m "feat: insert TechArticleSection on EN product detail page"
```

---

## Task 7: Update ES Product Detail Page

**Files:**
- Modify: `src/pages/es/products/[slug].astro`

- [ ] **Step 1: Import TechArticleSection**

In the frontmatter imports, add:

```typescript
import TechArticleSection from '../../../components/ui/TechArticleSection.astro'
```

- [ ] **Step 2: Insert TechArticleSection before the inquiry form**

Find the `<section id="inquiry"` block (around line 69). Directly before it, add:

```astro
    {!aiContent && product.tech_article?.sections?.length ? (
      <TechArticleSection article={product.tech_article} lang="es" />
    ) : null}
```

- [ ] **Step 3: Run type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/es/products/[slug].astro
git commit -m "feat: insert TechArticleSection on ES product detail page"
```

---

## Task 8: Seed — Eddy Current Separator

**Files:** Supabase SQL editor

- [ ] **Step 1: Run seed SQL**

```sql
UPDATE products
SET tech_article = '{
  "summary_en": "The JLECS-1000W uses a high-speed rotating rare-earth magnetic rotor to induce eddy currents in non-ferrous metals, generating a repulsive force that ejects aluminum, copper, and brass from mixed material streams without contact.",
  "summary_es": "",
  "title_en": "How Eddy Current Separation Works",
  "title_es": "",
  "sections": [
    {
      "heading_en": "The Physics of Non-Ferrous Recovery",
      "heading_es": "",
      "body_en": "When a conductive non-ferrous metal passes over a rapidly spinning rare-earth magnetic rotor, the changing magnetic field induces circulating eddy currents within the metal. By Lenz''s Law, these currents generate their own opposing magnetic field, producing a repulsive force that propels the metal particle upward and away from the conveyor belt. Non-conductors — plastic, glass, rubber — feel no force and fall straight down, completing the separation without any mechanical contact.",
      "body_es": ""
    },
    {
      "heading_en": "Two-Stage Separation: Ferrous First, Then Non-Ferrous",
      "heading_es": "",
      "body_en": "The JLECS-1000W processes material in two sequential stages. In the first stage, a magnetic drum removes ferrous metals (steel, iron) from the input stream — ferrous particles are strongly attracted and held against the drum until they clear the material flow. In the second stage, the cleaned stream passes over the eddy current rotor, where aluminum, copper, and brass are ejected into a dedicated chute. Separating ferrous metals upstream prevents them from dampening the eddy current field and degrading non-ferrous recovery rates.",
      "body_es": ""
    },
    {
      "heading_en": "Common Applications",
      "heading_es": "",
      "body_en": "Eddy current separation is used wherever non-ferrous metal recovery is required from a mixed stream: aluminum recovery from shredded scrap, copper and brass extraction from e-waste (printed circuit boards, wire harnesses), metal removal from plastic recycling lines to prevent contamination of regranulate, and non-ferrous recovery in municipal solid waste processing. The JLECS-1000W processes up to 1,000 kg/h — contact us with your input material composition and particle size for a performance assessment.",
      "body_es": ""
    }
  ]
}'::jsonb
WHERE slug = 'eddy-current-non-ferrous-separator';
```

- [ ] **Step 2: Verify**

```sql
SELECT slug, tech_article->>'title_en' AS title, jsonb_array_length(tech_article->'sections') AS sections
FROM products WHERE slug = 'eddy-current-non-ferrous-separator';
```

Expected: `title = 'How Eddy Current Separation Works'`, `sections = 3`.

---

## Task 9: Seed — AI Machine Intelligence (Summary Only)

**Files:** Supabase SQL editor

- [ ] **Step 1: Run seed SQL**

```sql
UPDATE products
SET tech_article = '{
  "summary_en": "Rey Long''s AI Machine Intelligence embeds edge computing and computer vision directly into plastic bag production lines — detecting defects in real time, digitizing operator know-how, and compensating servo drives to achieve cutting and sewing accuracy below ±1 mm without cloud connectivity.",
  "summary_es": "",
  "title_en": "",
  "title_es": "",
  "sections": []
}'::jsonb
WHERE slug = 'ai-machine-intelligence-solutions';
```

Note: `sections` is empty because `AiSolutionStory` already serves as the full technical article on the detail page. Only `summary_en` is needed for the product listing card.

- [ ] **Step 2: Verify**

```sql
SELECT slug, tech_article->>'summary_en' AS summary, jsonb_array_length(tech_article->'sections') AS sections
FROM products WHERE slug = 'ai-machine-intelligence-solutions';
```

Expected: summary text present, `sections = 0`.

---

## Task 10: Seed — PP Woven Bag Convention Line

**Files:** Supabase SQL editor

- [ ] **Step 1: Run seed SQL**

```sql
UPDATE products
SET tech_article = '{
  "summary_en": "The JLPTCSM-1300W integrates flexographic printing, tube forming, cutting and sewing, and overtape application into a single continuous process — producing finished PP woven bags at 25–40 bags/min from a raw fabric roll without manual transfer between stages.",
  "summary_es": "",
  "title_en": "How the PP Woven Bag Convention Line Works",
  "title_es": "",
  "sections": [
    {
      "heading_en": "From Fabric Roll to Finished Bag in One Continuous Pass",
      "heading_es": "",
      "body_en": "In a traditional woven bag factory, printing, tubing, cutting, sewing, and overtaping are run as separate operations with material transfers between each step. The JLPTCSM-1300W convention line eliminates these transfers by linking all four stages in one synchronized drive system. PP woven fabric unwinds from a roll, passes through the 4-color flexographic printing unit, is formed into a tube, cut to length, sewn at the bottom, and finished with an overtape — all in a single continuous motion at 25–40 bags/min.",
      "body_es": ""
    },
    {
      "heading_en": "4-Color Flexographic Printing on PP Fabric",
      "heading_es": "",
      "body_en": "Flexographic printing on woven PP fabric requires precise tension control because the material stretches differently from paper or film. The JLPTCSM-1300W uses a 4-color (4+0) flexographic unit with ceramic anilox rollers, which meter ink volume consistently across the web regardless of line speed variation. Print repeat length is adjustable from 450 to 1200 mm, and the max printing width is 1300 mm. Both plain and BOPP laminated PP fabric are supported — laminated fabric enables moisture-resistant bags with a glossy printed surface.",
      "body_es": ""
    }
  ]
}'::jsonb
WHERE slug = 'automatic-printing-tubing-cutting-sewing-line';
```

- [ ] **Step 2: Verify**

```sql
SELECT slug, tech_article->>'title_en' AS title, jsonb_array_length(tech_article->'sections') AS sections
FROM products WHERE slug = 'automatic-printing-tubing-cutting-sewing-line';
```

Expected: `title = 'How the PP Woven Bag Convention Line Works'`, `sections = 2`.

---

## Task 11: Seed — Stand-Up Zipper Pouch Machine

**Files:** Supabase SQL editor

- [ ] **Step 1: Run seed SQL**

```sql
UPDATE products
SET tech_article = '{
  "summary_en": "The JL-L-2TZP600 uses full Panasonic servo control and a 4+2 heat-seal group configuration to produce five flexible pouch formats — including doypack stand-up pouches and zipper bags — with ≤0.3 mm positional accuracy at up to 220 pcs/min.",
  "summary_es": "",
  "title_en": "How the Stand-Up Zipper Pouch Machine Works",
  "title_es": "",
  "sections": [
    {
      "heading_en": "Heat-Seal Lamination Technology",
      "heading_es": "",
      "body_en": "Flexible pouch bags are made from heat-seal laminated films — multi-layer structures such as NY/PE, PET/PE, or AL/PE — where the innermost layer melts and bonds when compressed between heated sealing bars. The JL-L-2TZP600 uses 4 groups of heating bars plus 2 groups of cooling bars for each seal (vertical and horizontal). The cooling groups re-solidify the seal bond under pressure before the bag releases, preventing the still-molten film from deforming. This 4+2 configuration allows the machine to maintain consistent seal strength at high speed, across a temperature range up to 300°C for retort-grade films.",
      "body_es": ""
    },
    {
      "heading_en": "Full-Servo Accuracy and Multi-Format Capability",
      "heading_es": "",
      "body_en": "Every motion axis — film feed, sealing, cutting, and zipper insertion — is driven by an independent Panasonic servo motor with closed-loop position feedback. This allows the machine to achieve ≤0.3 mm positional accuracy on pre-printed films by reading registration marks with photo-eye sensors and correcting the film feed in real time. The same servo architecture enables the machine to switch between five bag formats (three-side seal, three-side seal with zipper, four-side seal, doypack, doypack with zipper) through parameter changes on the PLC touch screen rather than mechanical retooling.",
      "body_es": ""
    },
    {
      "heading_en": "Ultrasonic Zipper Sealing",
      "heading_es": "",
      "body_en": "Zipper bags require a different sealing mechanism for the zipper track itself. Heat-sealing a plastic zipper can distort the interlocking profile, making it difficult to open and reclose. The JL-L-2TZP600 uses an ultrasonic sealing unit for zipper attachment — a transducer vibrates the zipper at high frequency, generating localized frictional heat only at the bond interface rather than across the whole zipper cross-section. This produces a precise, clean seal that preserves the zipper profile at the standard 13 mm zipper width.",
      "body_es": ""
    }
  ]
}'::jsonb
WHERE slug = 'hp-l-2tzp600-stand-up-zipper-pouch-machine';
```

- [ ] **Step 2: Verify**

```sql
SELECT slug, tech_article->>'title_en' AS title, jsonb_array_length(tech_article->'sections') AS sections
FROM products WHERE slug = 'hp-l-2tzp600-stand-up-zipper-pouch-machine';
```

Expected: `title = 'How the Stand-Up Zipper Pouch Machine Works'`, `sections = 3`.

---

## Task 12: Seed — Flexographic Printing Machine

**Files:** Supabase SQL editor

- [ ] **Step 1: Run seed SQL**

```sql
UPDATE products
SET tech_article = '{
  "summary_en": "The JLRPM-6800BO/6C uses six independent ceramic anilox roller stations to apply up to six colors onto PP woven fabric at up to 100 m/min, with inter-color drying between each station to prevent ink bleeding and maintain sharp print registration.",
  "summary_es": "",
  "title_en": "How Flexographic Printing Works on PP Woven Fabric",
  "title_es": "",
  "sections": [
    {
      "heading_en": "The Ceramic Anilox Roller System",
      "heading_es": "",
      "body_en": "Flexographic printing controls ink volume through a ceramic anilox roller — a steel roller engraved with a microscopic cell pattern and coated with industrial ceramic for wear resistance. Each cell picks up a precise, metered amount of ink from the ink tray and transfers it to the printing plate at a consistent volume, regardless of press speed. The cell count (lines per centimeter) and cell volume (measured in BCM) determine how much ink is laid down, allowing printers to dial in the correct ink film weight for each color without adjusting press pressure. The JLRPM-6800BO/6C uses one dedicated ceramic anilox roller per color station across all six stations.",
      "body_es": ""
    },
    {
      "heading_en": "Inter-Color Drying and Print Registration",
      "heading_es": "",
      "body_en": "Printing multiple colors in sequence requires each ink layer to dry before the next station applies ink on top of it — otherwise colors bleed and mix at the surface. The JLRPM-6800BO/6C includes an inter-color drying system between each of its six stations, ensuring the previous color is set before the web enters the next print nip. Print registration — the precise alignment of each color relative to the others — is maintained through servo-driven tension control on the web path. The machine supports four configuration modes (0+6, 1+5, 2+4, 3+3) to print on one or both sides of the PP fabric in a single pass at speeds up to 100 m/min.",
      "body_es": ""
    }
  ]
}'::jsonb
WHERE slug = 'flexographic-printing-machine-6c';
```

- [ ] **Step 2: Verify**

```sql
SELECT slug, tech_article->>'title_en' AS title, jsonb_array_length(tech_article->'sections') AS sections
FROM products WHERE slug = 'flexographic-printing-machine-6c';
```

Expected: `title = 'How Flexographic Printing Works on PP Woven Fabric'`, `sections = 2`.

---

## Task 13: End-to-End Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check product listing page**

Open `http://localhost:4321/products`. Verify:
- Eddy current separator card shows italic summary text below description
- AI machine intelligence card shows italic summary text below description
- Cards without `tech_article` show nothing extra (no crash)

- [ ] **Step 3: Check product detail pages**

Open `http://localhost:4321/products/eddy-current-non-ferrous-separator`. Verify:
- "How Eddy Current Separation Works" h2 heading appears between specs table and FAQ
- All 3 sections visible with h3 headings and body text
- Page source includes `"@type":"TechArticle"` JSON-LD block

Open `http://localhost:4321/products/ai-machine-intelligence-solutions`. Verify:
- `AiSolutionStory` still renders correctly (no regression)
- NO "How It Works" section appears (sections array is empty → not rendered)
- Summary still visible on listing card

- [ ] **Step 4: Check ES page**

Open `http://localhost:4321/es/products/eddy-current-non-ferrous-separator`. Verify:
- TechArticleSection renders with EN content (Spanish fields are empty strings, component falls back gracefully since heading/body are just empty — acceptable until Spanish content is added)

- [ ] **Step 5: Validate JSON-LD**

Copy the page source of any product with `tech_article`. Paste into Google's Rich Results Test or Schema.org validator. Confirm `TechArticle` entity is parsed without errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: tech article AEO field — components, schema, seed content"
```

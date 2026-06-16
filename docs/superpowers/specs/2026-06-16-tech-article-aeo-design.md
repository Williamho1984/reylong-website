# Tech Article Field — AEO Enhancement Design

**Date:** 2026-06-16  
**Status:** Approved  
**Goal:** Add a structured technical article to each product page to increase citation rate by AI answer engines (Perplexity, ChatGPT, Google AI Overview).

---

## Problem

Product pages currently have:
- Specs table (numbers, not explanations)
- FAQ (hardcoded in `[slug].astro`, not in DB)
- ApplicationsGrid

AI engines prefer citing pages with deep technical prose. A specs table alone doesn't answer "how does X work?" — the kind of question AI engines receive most.

---

## Solution

Add a `tech_article` JSONB column to the `products` table. Each product gets:
- A **summary** (1–2 sentences) shown on the product listing card
- A **title + sections** (2–4 prose paragraphs) shown on the product detail page
- A `TechArticle` JSON-LD schema tag on the detail page for AI engine discovery

Content source: existing `chatbot_qa` technical answers, reformatted from Q&A into prose paragraphs.

---

## Data Structure

### TypeScript Types (added to `src/lib/db/products.ts`)

```typescript
export type TechArticleSection = {
  heading_en: string
  heading_es: string
  body_en: string
  body_es: string
  image_url?: string         // upload to product-media bucket, fill later
  image_caption_en?: string
  animation_url?: string     // GIF or WebM, fill later
}

export type TechArticle = {
  summary_en: string         // shown on product listing card
  summary_es: string
  title_en: string           // e.g. "How Eddy Current Separation Works"
  title_es: string
  sections: TechArticleSection[]
}
```

Add `tech_article?: TechArticle | null` to the `Product` type.

### Database Migration

```sql
ALTER TABLE products ADD COLUMN tech_article JSONB;
```

Spanish fields (`_es`) may be left as empty strings initially and filled in later. `image_url` and `animation_url` are optional — absent fields do not affect rendering.

---

## Frontend Changes

### 1. `src/lib/db/products.ts`
- Add `TechArticleSection` and `TechArticle` types
- Add `tech_article?: TechArticle | null` to `Product` type

### 2. `src/components/ui/TechArticleSection.astro` (new)
- Props: `article: TechArticle`, `lang: 'en' | 'es'`
- Renders: `<h2>` title, then for each section: `<h3>` heading + `<p>` body
- If `image_url` present: renders image full-width below the section text (`<img>` with caption if `image_caption_en` set)
- If `animation_url` present: renders `<video autoplay loop muted playsinline>` below the section text (GIF fallback: use `<img>`)

### 3. `src/components/ui/ProductCard.astro`
- If `product.tech_article?.summary_en` exists, render a `<p>` summary line below the product description
- Keep it subtle — small text, not a new card section

### 4. `src/pages/products/[slug].astro`
- Insert `<TechArticleSection>` between the specs table and the FAQ section
- Condition: `product.tech_article?.sections?.length > 0`
- Section wrapper: `<section aria-label="Technical overview">`

### 5. `src/components/seo/ProductSchema.astro`
- When `product.tech_article` is present, emit a second JSON-LD block:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "<title_en>",
  "description": "<summary_en>",
  "url": "<pageUrl>#technical-overview",
  "publisher": {
    "@type": "Organization",
    "name": "Reylong Machinery Co., Ltd.",
    "url": "https://reylong.com"
  }
}
```

---

## Seed Content Plan

Rewrite existing `chatbot_qa` technical answers into prose for these products (priority order):

| Product slug | Source categories in chatbot_qa | Sections to write |
|---|---|---|
| `eddy-current-non-ferrous-separator` | Technical – Recycling | Physics of eddy currents, Two-stage process |
| `ai-machine-intelligence-solutions` | AI Solutions | Add `summary_en` only (no sections needed — `AiSolutionStory` already serves as the technical article on the detail page; `TechArticleSection` render is skipped when `aiContent` is active) |
| `automatic-printing-tubing-cutting-sewing-line` | Technical – JLPTCSM-1300W | Integrated process, Flexo printing stage |
| `hp-l-2tzp600-stand-up-zipper-pouch-machine` | Technical – JL-L-2TZP600 | Heat-seal lamination, Servo accuracy |
| `flexographic-printing-machine-6c` | Technical – Printing Machine | Anilox roller system, Color separation |

Seed via SQL `UPDATE products SET tech_article = '...'::jsonb WHERE slug = '...'`.

---

## What This Does NOT Change

- `chatbot_qa` table — untouched, RAG chatbot continues as-is
- Existing FAQ hardcoded in `[slug].astro` — kept as-is for now
- `AiSolutionStory` layout for AI products — kept as-is
- Spanish pages (`/es/products/`) — wired up but `_es` fields can be empty initially

---

## Success Criteria

- `tech_article` JSONB column exists in Supabase `products` table
- Product listing cards show summary line for products that have `tech_article`
- Product detail pages show technical article section above FAQ
- `TechArticle` JSON-LD schema present on detail pages with tech article content
- At least 2 products seeded with content before launch

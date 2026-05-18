# Reylong 公開網站實作計劃 (Plan A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Reylong B2B 公司網站公開部分，含產品目錄、詢價表單、新聞、案例、展覽、AEO 語義基礎。

**Architecture:** Astro 5 hybrid 渲染（公開頁全 SSG，`getStaticPaths` 在 build time 向 Supabase 取資料）。Cloudflare Pages 部署，全球 CDN。Admin CMS 留待 Plan B。

**Tech Stack:** Astro 5, Tailwind CSS, Alpine.js, @supabase/supabase-js, Zod, Vitest, Playwright, @astrojs/cloudflare

---

## 檔案結構

```
src/
  components/
    layout/
      Header.astro          導覽列（含手機選單 Alpine.js）
      Footer.astro           頁尾
    ui/
      ProductCard.astro     產品卡片
      NewsCard.astro        新聞卡片
      CaseStudyCard.astro   案例卡片
      EventCard.astro       展覽卡片
      HeroCarousel.astro    首頁輪播 (Alpine.js)
      InquiryForm.astro     詢價表單（客戶端 Alpine.js + fetch）
      ImageGallery.astro    產品圖片輪播
      SpecsTable.astro      規格表（JSONB 動態渲染）
    seo/
      SEOHead.astro         title/meta/OG
      ProductSchema.astro   Schema.org Product JSON-LD
  layouts/
    BaseLayout.astro        主版型（slot: default）
  pages/
    index.astro             首頁 (SSG)
    products/
      index.astro           產品目錄
      [slug].astro          產品詳情
    news/
      index.astro           新聞列表
      [slug].astro          新聞詳情
    case-studies/
      index.astro           案例列表
      [slug].astro          案例詳情
    events/
      index.astro           展覽列表
    about.astro             關於我們
    contact.astro           聯絡/詢價
    api/
      inquiries.ts          POST API endpoint (SSR)
    llms.txt.ts             llms.txt (SSR endpoint)
    es/                     西班牙語鏡像（Task 12）
  lib/
    supabase.ts             Supabase client
    db/
      products.ts           products + product_media 查詢
      news.ts               news 查詢
      case-studies.ts       case_studies 查詢
      events.ts             events 查詢
      inquiries.ts          inquiries insert
    i18n/
      en.ts                 英語字串
      es.ts                 西班牙語字串
      utils.ts              getCurrentLang(), t() helper
  styles/
    global.css
  env.d.ts
supabase/
  migrations/
    001_initial_schema.sql
tests/
  lib/
    products.test.ts
    inquiries.test.ts
  e2e/
    inquiry-form.spec.ts
astro.config.mjs
tailwind.config.mjs
tsconfig.json
vitest.config.ts
.env.example
```

---

## Task 1: 專案鷹架 + 依賴安裝

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Create: `src/env.d.ts`

- [ ] **Step 1: 初始化 Astro 專案**

在 `C:\dev\reylong website` 目錄執行：

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

- [ ] **Step 2: 安裝所有依賴**

```bash
npm install @astrojs/tailwind @astrojs/alpinejs @astrojs/cloudflare tailwindcss alpinejs @supabase/supabase-js zod
npm install -D vitest @vitest/coverage-v8 @playwright/test
```

- [ ] **Step 3: 設定 `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import alpinejs from '@astrojs/alpinejs'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind(), alpinejs()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }
  }
})
```

- [ ] **Step 4: 設定 `tailwind.config.mjs`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E8001C',
          blue: '#0033CC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
}
```

- [ ] **Step 5: 設定 `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80 }
    }
  }
})
```

- [ ] **Step 6: 設定 `src/env.d.ts`**

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 7: 建立 `.env.example`**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

然後複製為 `.env` 並填入真實值（不可 commit `.env`）。

- [ ] **Step 8: 確認開發伺服器啟動**

```bash
npm run dev
```

預期：`http://localhost:4321` 顯示空白頁面，無 error。

- [ ] **Step 9: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs tsconfig.json vitest.config.ts .env.example src/env.d.ts package.json package-lock.json
git commit -m "chore: initialize Astro 5 project with Tailwind, Alpine.js, Supabase"
```

---

## Task 2: Supabase Schema + Client

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/db/products.ts`
- Create: `src/lib/db/news.ts`
- Create: `src/lib/db/case-studies.ts`
- Create: `src/lib/db/events.ts`
- Create: `src/lib/db/inquiries.ts`
- Create: `tests/lib/products.test.ts`
- Create: `tests/lib/inquiries.test.ts`

- [ ] **Step 1: 寫失敗測試（products DB 函數）**

建立 `tests/lib/products.test.ts`：

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

import { supabase } from '../../src/lib/supabase'
import { getAllProducts, getFeaturedProducts, getProductBySlug } from '../../src/lib/db/products'

const mockProduct = {
  id: '1',
  slug: 'circular-loom-cl-8',
  category: 'circular-loom',
  is_featured: true,
  sort_order: 1,
  name_en: 'Circular Loom CL-8',
  name_es: 'Telar Circular CL-8',
  description_en: 'High speed circular loom',
  description_es: 'Telar circular de alta velocidad',
  specs: { speed: '120 bags/min' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('getAllProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns sorted products', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockProduct], error: null })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    const result = await getAllProducts()
    expect(result).toEqual([mockProduct])
    expect(supabase.from).toHaveBeenCalledWith('products')
  })

  it('throws on database error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    await expect(getAllProducts()).rejects.toThrow('Failed to fetch products: DB error')
  })
})

describe('getProductBySlug', () => {
  it('returns null when not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    const result = await getProductBySlug('not-found')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: 執行測試 — 確認 FAIL**

```bash
npx vitest run tests/lib/products.test.ts
```

預期：FAIL，`Cannot find module '../../src/lib/supabase'`

- [ ] **Step 3: 建立 `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
)
```

- [ ] **Step 4: 建立 `src/lib/db/products.ts`**

```typescript
import { supabase } from '../supabase'

export type Product = {
  id: string
  slug: string
  category: string
  is_featured: boolean
  sort_order: number
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  specs: Record<string, string>
  created_at: string
  updated_at: string
}

export type ProductMedia = {
  id: string
  product_id: string
  type: 'image' | 'video' | 'catalog_pdf'
  url: string
  caption_en: string
  caption_es: string
  sort_order: number
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  return data ?? []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(6)
  if (error) throw new Error(`Failed to fetch featured products: ${error.message}`)
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getProductMedia(productId: string): Promise<ProductMedia[]> {
  const { data, error } = await supabase
    .from('product_media')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch product media: ${error.message}`)
  return data ?? []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getAllProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
  if (error) throw new Error(`Failed to fetch product slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}
```

- [ ] **Step 5: 執行測試 — 確認 PASS**

```bash
npx vitest run tests/lib/products.test.ts
```

預期：所有測試 PASS

- [ ] **Step 6: 建立其他 DB 函數 `src/lib/db/news.ts`**

```typescript
import { supabase } from '../supabase'

export type NewsArticle = {
  id: string
  slug: string
  published_at: string
  cover_image_url: string
  title_en: string
  title_es: string
  content_en: string
  content_es: string
}

export async function getAllNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch news: ${error.message}`)
  return data ?? []
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch latest news: ${error.message}`)
  return data ?? []
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('news').select('slug')
  if (error) throw new Error(`Failed to fetch news slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}
```

- [ ] **Step 7: 建立 `src/lib/db/case-studies.ts`**

```typescript
import { supabase } from '../supabase'

export type CaseStudy = {
  id: string
  slug: string
  client: string
  country: string
  published_at: string
  cover_image_url: string
  title_en: string
  title_es: string
  content_en: string
  content_es: string
  product_id: string | null
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch case studies: ${error.message}`)
  return data ?? []
}

export async function getLatestCaseStudies(limit = 3): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch latest case studies: ${error.message}`)
  return data ?? []
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getAllCaseStudySlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('case_studies').select('slug')
  if (error) throw new Error(`Failed to fetch case study slugs: ${error.message}`)
  return (data ?? []).map(r => r.slug)
}
```

- [ ] **Step 8: 建立 `src/lib/db/events.ts`**

```typescript
import { supabase } from '../supabase'

export type Event = {
  id: string
  title_en: string
  title_es: string
  date_start: string
  date_end: string
  location: string
  booth_number: string
  description_en: string
  description_es: string
  url: string
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date_end', today)
    .order('date_start', { ascending: true })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: false })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}
```

- [ ] **Step 9: 建立 `src/lib/db/inquiries.ts`**

```typescript
import { supabase } from '../supabase'
import { z } from 'zod'

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required').max(200),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().max(50).optional().default(''),
  product_id: z.string().uuid().optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
})

export type InquiryInput = z.infer<typeof inquirySchema>

export async function createInquiry(input: InquiryInput): Promise<void> {
  const validated = inquirySchema.parse(input)
  const { error } = await supabase.from('inquiries').insert({
    ...validated,
    status: 'new'
  })
  if (error) throw new Error(`Failed to submit inquiry: ${error.message}`)
}
```

- [ ] **Step 10: 寫 inquiries 測試**

建立 `tests/lib/inquiries.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'
import { inquirySchema } from '../../src/lib/db/inquiries'

describe('inquirySchema', () => {
  it('validates a complete valid inquiry', () => {
    const input = {
      name: 'John Smith',
      email: 'john@example.com',
      company: 'ACME Corp',
      country: 'USA',
      message: 'I am interested in your circular loom machines.'
    }
    expect(() => inquirySchema.parse(input)).not.toThrow()
  })

  it('rejects invalid email', () => {
    const input = {
      name: 'John',
      email: 'not-an-email',
      company: 'ACME',
      country: 'USA',
      message: 'Hello there, testing message'
    }
    expect(() => inquirySchema.parse(input)).toThrow()
  })

  it('rejects message shorter than 10 chars', () => {
    const input = {
      name: 'John',
      email: 'john@example.com',
      company: 'ACME',
      country: 'USA',
      message: 'Short'
    }
    expect(() => inquirySchema.parse(input)).toThrow()
  })

  it('allows optional phone and product_id', () => {
    const input = {
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Corp',
      country: 'Mexico',
      phone: '+52 55 1234 5678',
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      message: 'We need 5 machines for our new factory.'
    }
    expect(() => inquirySchema.parse(input)).not.toThrow()
  })
})
```

- [ ] **Step 11: 執行所有測試**

```bash
npx vitest run
```

預期：全部 PASS

- [ ] **Step 12: 建立 Supabase migration 檔案**

建立 `supabase/migrations/001_initial_schema.sql`：

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  is_featured boolean default false,
  sort_order integer default 0,
  name_en text not null,
  name_es text not null,
  description_en text not null,
  description_es text not null,
  specs jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  type text check (type in ('image', 'video', 'catalog_pdf')) not null,
  url text not null,
  caption_en text default '',
  caption_es text default '',
  sort_order integer default 0
);

create table news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  published_at timestamptz not null,
  cover_image_url text default '',
  title_en text not null,
  title_es text not null,
  content_en text not null,
  content_es text not null
);

create table case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client text not null,
  country text not null,
  published_at timestamptz not null,
  cover_image_url text default '',
  title_en text not null,
  title_es text not null,
  content_en text not null,
  content_es text not null,
  product_id uuid references products(id) on delete set null
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_es text not null,
  date_start date not null,
  date_end date not null,
  location text not null,
  booth_number text default '',
  description_en text not null,
  description_es text not null,
  url text default ''
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  company text not null,
  country text not null,
  phone text default '',
  product_id uuid references products(id) on delete set null,
  message text not null,
  status text check (status in ('new', 'read', 'replied')) default 'new'
);

-- RLS
alter table products enable row level security;
alter table product_media enable row level security;
alter table news enable row level security;
alter table case_studies enable row level security;
alter table events enable row level security;
alter table inquiries enable row level security;

create policy "public_read_products" on products for select using (true);
create policy "public_read_product_media" on product_media for select using (true);
create policy "public_read_news" on news for select using (true);
create policy "public_read_case_studies" on case_studies for select using (true);
create policy "public_read_events" on events for select using (true);
create policy "public_insert_inquiries" on inquiries for insert with check (true);
```

在 Supabase Dashboard → SQL Editor 執行此 SQL。

- [ ] **Step 13: 在 Supabase 插入測試資料**

在 Supabase Dashboard → SQL Editor 執行：

```sql
insert into products (slug, category, is_featured, sort_order, name_en, name_es, description_en, description_es, specs)
values
  ('circular-loom-cl-8', 'circular-loom', true, 1,
   'Circular Loom CL-8', 'Telar Circular CL-8',
   'High-speed 8-shuttle circular loom for PP/PE woven bags.',
   'Telar circular de alta velocidad con 8 lanzaderas para bolsas tejidas PP/PE.',
   '{"speed": "120 bags/min", "width": "300-1200mm", "shuttles": "8"}'),
  ('tape-stretching-line-tsl-3', 'tape-line', true, 2,
   'Tape Stretching Line TSL-3', 'Línea de Estiramiento de Cintas TSL-3',
   'Complete tape extrusion and stretching line for woven bag fabric.',
   'Línea completa de extrusión y estiramiento de cintas para tela de sacos tejidos.',
   '{"output": "200 kg/hr", "tape_width": "2-4mm"}');
```

- [ ] **Step 14: Commit**

```bash
git add supabase/ src/lib/ tests/
git commit -m "feat: add Supabase schema, DB query functions, and unit tests"
```

---

## Task 3: 品牌基礎 — Layout、Header、Footer

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/layout/Header.astro`
- Create: `src/components/layout/Footer.astro`
- Create: `src/components/seo/SEOHead.astro`

- [ ] **Step 1: 建立 `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-800 bg-white font-sans;
  }
  h1 { @apply text-3xl md:text-4xl lg:text-5xl font-bold; }
  h2 { @apply text-2xl md:text-3xl font-bold; }
  h3 { @apply text-xl md:text-2xl font-semibold; }
}

@layer components {
  .btn-primary {
    @apply inline-block bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700 transition-colors;
  }
  .btn-secondary {
    @apply inline-block border-2 border-brand-blue text-brand-blue px-6 py-3 font-semibold hover:bg-brand-blue hover:text-white transition-colors;
  }
  .container-wide {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}
```

- [ ] **Step 2: 建立 `src/components/seo/SEOHead.astro`**

```astro
---
interface Props {
  title: string
  description: string
  canonicalURL?: string
  ogImage?: string
}

const {
  title,
  description,
  canonicalURL = new URL(Astro.url.pathname, Astro.site).toString(),
  ogImage = '/og-default.jpg'
} = Astro.props

const fullTitle = title.includes('Reylong') ? title : `${title} | Reylong`
---

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<meta property="og:type" content="website" />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:image" content={ogImage} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
```

- [ ] **Step 3: 建立 `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css'
import SEOHead from '../components/seo/SEOHead.astro'
import Header from '../components/layout/Header.astro'
import Footer from '../components/layout/Footer.astro'

interface Props {
  title: string
  description: string
  ogImage?: string
}

const { title, description, ogImage } = Astro.props
---

<!doctype html>
<html lang="en">
  <head>
    <SEOHead title={title} description={description} ogImage={ogImage} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <slot name="head" />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: 建立 `src/components/layout/Header.astro`**

```astro
---
const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const currentPath = Astro.url.pathname
---

<header class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div class="container-wide">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2">
        <span class="text-2xl font-bold">
          <span class="text-brand-red">Rey</span><span class="text-brand-blue">long</span>
        </span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-6">
        {navLinks.map(link => (
          <a
            href={link.href}
            class:list={[
              'text-sm font-medium transition-colors hover:text-brand-blue',
              currentPath.startsWith(link.href)
                ? 'text-brand-blue border-b-2 border-brand-blue pb-1'
                : 'text-gray-700'
            ]}
          >
            {link.label}
          </a>
        ))}
        <a href="/contact" class="btn-primary text-sm px-4 py-2">Get a Quote</a>
      </nav>

      <!-- Mobile menu button -->
      <button
        x-data
        @click="$dispatch('toggle-menu')"
        class="lg:hidden p-2 text-gray-700"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Nav -->
  <div
    x-data="{ open: false }"
    @toggle-menu.window="open = !open"
    x-show="open"
    x-transition
    class="lg:hidden bg-white border-t border-gray-100"
  >
    <nav class="container-wide py-4 flex flex-col gap-2">
      {navLinks.map(link => (
        <a
          href={link.href}
          class="py-2 text-gray-700 font-medium hover:text-brand-blue"
        >
          {link.label}
        </a>
      ))}
      <a href="/contact" class="btn-primary text-center mt-2">Get a Quote</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 5: 建立 `src/components/layout/Footer.astro`**

```astro
---
const year = new Date().getFullYear()
---

<footer class="bg-gray-900 text-gray-300 mt-20">
  <div class="container-wide py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div class="text-2xl font-bold mb-3">
          <span class="text-brand-red">Rey</span><span class="text-[#4d88ff]">long</span>
        </div>
        <p class="text-sm text-gray-400 leading-relaxed">
          Professional manufacturer of woven bag making machines.<br />
          Serving clients worldwide.
        </p>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Products</h3>
        <ul class="space-y-1 text-sm">
          <li><a href="/products" class="hover:text-white transition-colors">All Products</a></li>
          <li><a href="/products#circular-loom" class="hover:text-white transition-colors">Circular Looms</a></li>
          <li><a href="/products#tape-line" class="hover:text-white transition-colors">Tape Lines</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h3>
        <ul class="space-y-1 text-sm">
          <li><a href="/about" class="hover:text-white transition-colors">About Us</a></li>
          <li><a href="/case-studies" class="hover:text-white transition-colors">Case Studies</a></li>
          <li><a href="/events" class="hover:text-white transition-colors">Events</a></li>
          <li><a href="/contact" class="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-2">
      <span>© {year} Reylong Machinery Co., Ltd. All rights reserved.</span>
      <span>reylong.com</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 6: 啟動 dev server 確認 layout 正常**

```bash
npm run dev
```

開啟 `http://localhost:4321`，確認 Header 和 Footer 渲染，手機選單能開關。

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add brand foundation — BaseLayout, Header, Footer, SEOHead"
```

---

## Task 4: 首頁

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/components/ui/HeroCarousel.astro`
- Create: `src/components/ui/ProductCard.astro`
- Create: `src/components/ui/NewsCard.astro`
- Create: `src/components/ui/CaseStudyCard.astro`
- Create: `src/components/ui/EventCard.astro`

- [ ] **Step 1: 建立 `src/components/ui/ProductCard.astro`**

```astro
---
import type { Product } from '../../lib/db/products'

interface Props {
  product: Product
  lang?: 'en' | 'es'
}

const { product, lang = 'en' } = Astro.props
const name = lang === 'es' ? product.name_es : product.name_en
const description = lang === 'es' ? product.description_es : product.description_en
---

<article class="bg-white border border-gray-200 hover:border-brand-blue transition-colors group">
  <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
    <div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
      Product Image
    </div>
  </div>
  <div class="p-4">
    <h3 class="font-semibold text-lg group-hover:text-brand-blue transition-colors line-clamp-2">
      {name}
    </h3>
    <p class="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>
    <a
      href={`/products/${product.slug}`}
      class="inline-block mt-4 text-brand-blue text-sm font-medium hover:underline"
    >
      Learn More →
    </a>
  </div>
</article>
```

- [ ] **Step 2: 建立 `src/components/ui/NewsCard.astro`**

```astro
---
import type { NewsArticle } from '../../lib/db/news'

interface Props {
  article: NewsArticle
  lang?: 'en' | 'es'
}

const { article, lang = 'en' } = Astro.props
const title = lang === 'es' ? article.title_es : article.title_en
const date = new Date(article.published_at).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})
---

<article class="border-b border-gray-200 pb-4 last:border-0">
  <time class="text-xs text-gray-500 uppercase tracking-wide">{date}</time>
  <h3 class="font-semibold mt-1 hover:text-brand-blue transition-colors">
    <a href={`/news/${article.slug}`}>{title}</a>
  </h3>
</article>
```

- [ ] **Step 3: 建立 `src/components/ui/CaseStudyCard.astro`**

```astro
---
import type { CaseStudy } from '../../lib/db/case-studies'

interface Props {
  caseStudy: CaseStudy
  lang?: 'en' | 'es'
}

const { caseStudy, lang = 'en' } = Astro.props
const title = lang === 'es' ? caseStudy.title_es : caseStudy.title_en
---

<article class="bg-white border border-gray-200 p-4 hover:border-brand-blue transition-colors">
  <div class="flex items-start gap-3">
    <div class="text-2xl">🏭</div>
    <div>
      <h3 class="font-semibold hover:text-brand-blue transition-colors">
        <a href={`/case-studies/${caseStudy.slug}`}>{title}</a>
      </h3>
      <p class="text-sm text-gray-500 mt-1">{caseStudy.client} · {caseStudy.country}</p>
    </div>
  </div>
</article>
```

- [ ] **Step 4: 建立 `src/components/ui/EventCard.astro`**

```astro
---
import type { Event } from '../../lib/db/events'

interface Props {
  event: Event
  lang?: 'en' | 'es'
}

const { event, lang = 'en' } = Astro.props
const title = lang === 'es' ? event.title_es : event.title_en
const startDate = new Date(event.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const endDate = new Date(event.date_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
---

<article class="flex gap-4 py-3 border-b border-gray-200 last:border-0">
  <div class="text-center min-w-[50px]">
    <div class="text-brand-red font-bold text-sm">{startDate.split(' ')[0].toUpperCase()}</div>
    <div class="text-2xl font-bold">{startDate.split(' ')[1]}</div>
  </div>
  <div>
    <h3 class="font-semibold">{title}</h3>
    <p class="text-sm text-gray-500">{event.location}</p>
    {event.booth_number && <p class="text-sm text-brand-blue">Booth: {event.booth_number}</p>}
    <p class="text-xs text-gray-400">{startDate} – {endDate}</p>
  </div>
</article>
```

- [ ] **Step 5: 建立 `src/components/ui/HeroCarousel.astro`**

```astro
---
interface Slide {
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  bgColor: string
}

interface Props {
  slides: Slide[]
}

const { slides } = Astro.props
---

<div
  x-data={`{ current: 0, slides: ${JSON.stringify(slides)} }`}
  class="relative overflow-hidden bg-gray-900"
>
  <div class="relative h-[60vh] md:h-[70vh] min-h-[400px]">
    {slides.map((slide, i) => (
      <div
        x-show={`current === ${i}`}
        x-transition:enter="transition-opacity duration-700"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        class:list={['absolute inset-0 flex items-center', slide.bgColor]}
      >
        <div class="container-wide text-white">
          <h1 class="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">{slide.title}</h1>
          <p class="text-xl mt-4 text-gray-300 max-w-xl">{slide.subtitle}</p>
          <a href={slide.ctaHref} class="btn-primary mt-8 inline-block text-lg">{slide.ctaText}</a>
        </div>
      </div>
    ))}
  </div>

  <!-- Controls -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
    {slides.map((_, i) => (
      <button
        @click={`current = ${i}`}
        class:list={['w-3 h-3 rounded-full transition-colors', `current === ${i} ? 'bg-white' : 'bg-white/40'`]}
        x-bind:class={`current === ${i} ? 'bg-white' : 'bg-white/40'`}
        aria-label={`Slide ${i + 1}`}
      />
    ))}
  </div>
</div>

<script>
  // Auto-advance every 5 seconds
  document.addEventListener('alpine:init', () => {
    Alpine.data('heroAutoplay', () => ({
      init() {
        setInterval(() => {
          // @ts-ignore
          this.current = (this.current + 1) % this.slides.length
        }, 5000)
      }
    }))
  })
</script>
```

- [ ] **Step 6: 建立 `src/pages/index.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../layouts/BaseLayout.astro'
import HeroCarousel from '../components/ui/HeroCarousel.astro'
import ProductCard from '../components/ui/ProductCard.astro'
import NewsCard from '../components/ui/NewsCard.astro'
import CaseStudyCard from '../components/ui/CaseStudyCard.astro'
import EventCard from '../components/ui/EventCard.astro'
import { getFeaturedProducts } from '../lib/db/products'
import { getLatestNews } from '../lib/db/news'
import { getLatestCaseStudies } from '../lib/db/case-studies'
import { getUpcomingEvents } from '../lib/db/events'

const [featuredProducts, latestNews, latestCases, upcomingEvents] = await Promise.all([
  getFeaturedProducts(),
  getLatestNews(3),
  getLatestCaseStudies(3),
  getUpcomingEvents()
])

const heroSlides = [
  {
    title: 'High-Performance Woven Bag Machines',
    subtitle: 'Circular looms, tape lines, and complete production solutions for PP/PE woven bags.',
    ctaText: 'View Products',
    ctaHref: '/products',
    bgColor: 'bg-gradient-to-r from-gray-900 to-brand-blue/80'
  },
  {
    title: 'Global Manufacturing Partner',
    subtitle: 'Trusted by woven bag manufacturers in 30+ countries. Built to last.',
    ctaText: 'Our Case Studies',
    ctaHref: '/case-studies',
    bgColor: 'bg-gradient-to-r from-brand-red/90 to-gray-900'
  }
]
---

<BaseLayout
  title="Reylong — Woven Bag Machine Manufacturer"
  description="Reylong manufactures high-performance circular looms and woven bag production machines. Serving clients in 30+ countries."
>
  <!-- Hero -->
  <HeroCarousel slides={heroSlides} />

  <!-- Featured Products -->
  <section class="py-16 container-wide">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2>Our Machines</h2>
        <p class="text-gray-500 mt-1">Industrial-grade equipment for serious manufacturers</p>
      </div>
      <a href="/products" class="btn-secondary text-sm">View All →</a>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProducts.map(product => (
        <ProductCard product={product} />
      ))}
    </div>
  </section>

  <!-- Company Intro -->
  <section class="bg-gray-50 py-16">
    <div class="container-wide grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2>Why Reylong?</h2>
        <p class="text-gray-600 mt-4 leading-relaxed">
          With over two decades of experience, Reylong delivers robust woven bag machinery
          engineered for continuous, high-volume production. Our machines operate in factories
          across Asia, Latin America, the Middle East, and Africa.
        </p>
        <ul class="mt-6 space-y-2 text-gray-700">
          <li class="flex items-center gap-2"><span class="text-brand-red font-bold">✓</span> 20+ years manufacturing experience</li>
          <li class="flex items-center gap-2"><span class="text-brand-red font-bold">✓</span> Clients in 30+ countries</li>
          <li class="flex items-center gap-2"><span class="text-brand-red font-bold">✓</span> Full after-sales technical support</li>
          <li class="flex items-center gap-2"><span class="text-brand-red font-bold">✓</span> Customization available</li>
        </ul>
        <a href="/about" class="btn-primary mt-8 inline-block">Learn About Us</a>
      </div>
      <div class="bg-gray-200 aspect-video flex items-center justify-center text-gray-500">
        Factory Image
      </div>
    </div>
  </section>

  <!-- News + Case Studies + Events -->
  <section class="py-16 container-wide">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- News -->
      <div>
        <div class="flex justify-between items-end mb-6">
          <h2 class="text-xl font-bold">News</h2>
          <a href="/news" class="text-brand-blue text-sm hover:underline">All →</a>
        </div>
        <div class="space-y-1">
          {latestNews.map(article => <NewsCard article={article} />)}
          {latestNews.length === 0 && <p class="text-gray-500 text-sm">No news yet.</p>}
        </div>
      </div>

      <!-- Case Studies -->
      <div>
        <div class="flex justify-between items-end mb-6">
          <h2 class="text-xl font-bold">Case Studies</h2>
          <a href="/case-studies" class="text-brand-blue text-sm hover:underline">All →</a>
        </div>
        <div class="space-y-3">
          {latestCases.map(cs => <CaseStudyCard caseStudy={cs} />)}
          {latestCases.length === 0 && <p class="text-gray-500 text-sm">No case studies yet.</p>}
        </div>
      </div>

      <!-- Events -->
      <div>
        <div class="flex justify-between items-end mb-6">
          <h2 class="text-xl font-bold">Upcoming Events</h2>
          <a href="/events" class="text-brand-blue text-sm hover:underline">All →</a>
        </div>
        <div>
          {upcomingEvents.slice(0, 3).map(event => <EventCard event={event} />)}
          {upcomingEvents.length === 0 && <p class="text-gray-500 text-sm">No upcoming events.</p>}
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="bg-brand-blue py-16 text-center text-white">
    <div class="container-wide">
      <h2 class="text-white">Ready to upgrade your production line?</h2>
      <p class="mt-3 text-blue-200 text-lg">Get a personalized quote from our team.</p>
      <a href="/contact" class="mt-8 inline-block bg-white text-brand-blue px-8 py-4 font-bold hover:bg-gray-100 transition-colors">
        Request a Quote
      </a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 7: 確認首頁渲染**

```bash
npm run dev
```

開啟 `http://localhost:4321`，確認：Hero 輪播顯示、產品卡片顯示（若 Supabase 有資料）、三欄區塊正常。

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add home page with hero carousel, featured products, news, events"
```

---

## Task 5: 產品目錄 + 詳情頁 + Schema.org

**Files:**
- Create: `src/pages/products/index.astro`
- Create: `src/pages/products/[slug].astro`
- Create: `src/components/ui/ImageGallery.astro`
- Create: `src/components/ui/SpecsTable.astro`
- Create: `src/components/seo/ProductSchema.astro`

- [ ] **Step 1: 建立 `src/components/seo/ProductSchema.astro`**

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
  additionalProperty: Object.entries(product.specs ?? {}).map(([name, value]) => ({
    '@type': 'PropertyValue',
    name,
    value
  }))
}
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: 建立 `src/components/ui/SpecsTable.astro`**

```astro
---
interface Props {
  specs: Record<string, string>
}

const { specs } = Astro.props
const entries = Object.entries(specs)
---

{entries.length > 0 && (
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-gray-800 text-white">
          <th class="text-left px-4 py-2 font-semibold">Specification</th>
          <th class="text-left px-4 py-2 font-semibold">Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value], i) => (
          <tr class:list={['border-b border-gray-200', i % 2 === 1 ? 'bg-gray-50' : 'bg-white']}>
            <td class="px-4 py-2 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
            <td class="px-4 py-2 text-gray-700">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

- [ ] **Step 3: 建立 `src/components/ui/ImageGallery.astro`**

```astro
---
import type { ProductMedia } from '../../lib/db/products'

interface Props {
  media: ProductMedia[]
  productName: string
}

const { media, productName } = Astro.props
const images = media.filter(m => m.type === 'image')
const videos = media.filter(m => m.type === 'video')
const pdfs = media.filter(m => m.type === 'catalog_pdf')
---

<div x-data="{ activeImage: 0 }">
  <!-- Main image -->
  <div class="aspect-[4/3] bg-gray-100 overflow-hidden mb-3">
    {images.length > 0 ? (
      images.map((img, i) => (
        <img
          src={img.url}
          alt={img.caption_en || productName}
          x-show={`activeImage === ${i}`}
          class="w-full h-full object-cover"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))
    ) : (
      <div class="w-full h-full flex items-center justify-center text-gray-400">
        No images available
      </div>
    )}
  </div>

  <!-- Thumbnails -->
  {images.length > 1 && (
    <div class="flex gap-2 overflow-x-auto">
      {images.map((img, i) => (
        <button
          @click={`activeImage = ${i}`}
          class="flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors"
          x-bind:class={`activeImage === ${i} ? 'border-brand-blue' : 'border-gray-200'`}
        >
          <img src={img.url} alt="" class="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )}

  <!-- Videos -->
  {videos.length > 0 && (
    <div class="mt-6">
      <h3 class="font-semibold mb-3">Product Videos</h3>
      <div class="space-y-4">
        {videos.map(video => {
          const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be')
          const embedUrl = isYouTube
            ? video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
            : video.url
          return (
            <div class="aspect-video">
              <iframe
                src={embedUrl}
                class="w-full h-full"
                allowfullscreen
                loading="lazy"
                title={video.caption_en || 'Product video'}
              />
            </div>
          )
        })}
      </div>
    </div>
  )}

  <!-- PDF Downloads -->
  {pdfs.length > 0 && (
    <div class="mt-6">
      <h3 class="font-semibold mb-3">Product Catalog</h3>
      <div class="space-y-2">
        {pdfs.map(pdf => (
          <a
            href={pdf.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-brand-blue hover:underline"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {pdf.caption_en || 'Download Catalog (PDF)'}
          </a>
        ))}
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 4: 建立 `src/pages/products/index.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import ProductCard from '../../components/ui/ProductCard.astro'
import { getAllProducts } from '../../lib/db/products'

const products = await getAllProducts()
const categories = [...new Set(products.map(p => p.category))]
---

<BaseLayout
  title="Products — Reylong Woven Bag Machines"
  description="Browse Reylong's full range of woven bag machines including circular looms, tape stretching lines, and complete production systems."
>
  <div class="container-wide py-12">
    <h1>Our Products</h1>
    <p class="text-gray-600 mt-2 text-lg">Industrial woven bag machinery engineered for performance.</p>

    {categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category)
      return (
        <section class="mt-12" id={category}>
          <h2 class="capitalize border-b-2 border-brand-red pb-2 inline-block">
            {category.replace(/-/g, ' ')}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {categoryProducts.map(product => (
              <ProductCard product={product} />
            ))}
          </div>
        </section>
      )
    })}

    {products.length === 0 && (
      <p class="text-gray-500 mt-12 text-center">Products coming soon.</p>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 5: 建立 `src/pages/products/[slug].astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import ImageGallery from '../../components/ui/ImageGallery.astro'
import SpecsTable from '../../components/ui/SpecsTable.astro'
import ProductSchema from '../../components/seo/ProductSchema.astro'
import InquiryForm from '../../components/ui/InquiryForm.astro'
import { getAllProductSlugs, getProductBySlug, getProductMedia } from '../../lib/db/products'

export async function getStaticPaths() {
  const slugs = await getAllProductSlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const { slug } = Astro.params
const product = await getProductBySlug(slug)
if (!product) return Astro.redirect('/products')

const media = await getProductMedia(product.id)
const mainImageUrl = media.find(m => m.type === 'image')?.url
const pageUrl = new URL(Astro.url.pathname, Astro.site).toString()
---

<BaseLayout
  title={`${product.name_en} — Reylong`}
  description={product.description_en}
  ogImage={mainImageUrl}
>
  <slot slot="head" name="head">
    <ProductSchema product={product} imageUrl={mainImageUrl} pageUrl={pageUrl} />
  </slot>

  <div class="container-wide py-12">
    <nav class="text-sm text-gray-500 mb-6">
      <a href="/" class="hover:text-brand-blue">Home</a>
      <span class="mx-2">›</span>
      <a href="/products" class="hover:text-brand-blue">Products</a>
      <span class="mx-2">›</span>
      <span class="text-gray-800">{product.name_en}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Media -->
      <div>
        <ImageGallery media={media} productName={product.name_en} />
      </div>

      <!-- Info -->
      <div>
        <p class="text-sm text-gray-500 uppercase tracking-wide mb-1 capitalize">
          {product.category.replace(/-/g, ' ')}
        </p>
        <h1>{product.name_en}</h1>
        <p class="text-gray-600 mt-4 leading-relaxed">{product.description_en}</p>

        <a href="#inquiry" class="btn-primary mt-6 inline-block">Request a Quote</a>
        <a href="/contact" class="btn-secondary mt-3 ml-3 inline-block">Contact Us</a>
      </div>
    </div>

    <!-- Specs -->
    {Object.keys(product.specs ?? {}).length > 0 && (
      <section class="mt-12">
        <h2 class="mb-4">Technical Specifications</h2>
        <SpecsTable specs={product.specs} />
      </section>
    )}

    <!-- FAQ (AEO) -->
    <section class="mt-12">
      <h2 class="mb-6">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <details class="border border-gray-200 p-4">
          <summary class="font-semibold cursor-pointer">
            What materials can the {product.name_en} process?
          </summary>
          <p class="mt-2 text-gray-600">
            The {product.name_en} is designed for processing polypropylene (PP) and polyethylene (PE) materials,
            which are standard in woven bag production. Please contact us for specific material requirements.
          </p>
        </details>
        <details class="border border-gray-200 p-4">
          <summary class="font-semibold cursor-pointer">
            What after-sales support does Reylong provide?
          </summary>
          <p class="mt-2 text-gray-600">
            Reylong provides full technical documentation, remote support, and on-site installation assistance.
            Spare parts are available globally.
          </p>
        </details>
      </div>
    </section>

    <!-- Inquiry Form -->
    <section id="inquiry" class="mt-12 bg-gray-50 p-8">
      <h2 class="mb-2">Request a Quote for {product.name_en}</h2>
      <p class="text-gray-600 mb-6">Fill in the form and our team will respond within 1 business day.</p>
      <InquiryForm productId={product.id} productName={product.name_en} />
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 6: 確認產品頁渲染**

```bash
npm run dev
```

開啟 `http://localhost:4321/products` 和 `http://localhost:4321/products/circular-loom-cl-8`，確認頁面正確渲染。

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add product catalog and detail pages with Schema.org markup"
```

---

## Task 6: 詢價表單 + API Endpoint

**Files:**
- Create: `src/components/ui/InquiryForm.astro`
- Create: `src/pages/api/inquiries.ts`
- Create: `tests/e2e/inquiry-form.spec.ts`

- [ ] **Step 1: 建立 E2E 測試（先寫，後實作）**

建立 `tests/e2e/inquiry-form.spec.ts`：

```typescript
import { test, expect } from '@playwright/test'

test.describe('Inquiry Form', () => {
  test('submits successfully with valid data', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('[name="name"]', 'Carlos Mendez')
    await page.fill('[name="email"]', 'carlos@fabrica.mx')
    await page.fill('[name="company"]', 'Fabrica de Bolsas SA')
    await page.fill('[name="country"]', 'Mexico')
    await page.fill('[name="message"]', 'We are interested in 3 circular loom machines for our new factory.')

    await page.click('[type="submit"]')

    await expect(page.locator('[data-testid="form-success"]')).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'not-an-email')
    await page.fill('[name="company"]', 'Test Co')
    await page.fill('[name="country"]', 'USA')
    await page.fill('[name="message"]', 'Testing the form validation')

    await page.click('[type="submit"]')

    await expect(page.locator('[data-testid="form-error"]')).toBeVisible()
  })
})
```

- [ ] **Step 2: 建立 API endpoint `src/pages/api/inquiries.ts`**

```typescript
export const prerender = false

import type { APIRoute } from 'astro'
import { createInquiry, inquirySchema } from '../../lib/db/inquiries'
import { ZodError } from 'zod'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const validated = inquirySchema.parse(body)
    await createInquiry(validated)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: error.errors[0]?.message ?? 'Validation failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to submit inquiry. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

- [ ] **Step 3: 建立 `src/components/ui/InquiryForm.astro`**

```astro
---
interface Props {
  productId?: string
  productName?: string
}

const { productId, productName } = Astro.props
---

<div
  x-data={`{
    form: { name: '', email: '', company: '', country: '', phone: '', message: '' },
    status: 'idle',
    errorMsg: '',
    async submit() {
      this.status = 'loading'
      this.errorMsg = ''
      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...this.form,
            product_id: ${productId ? `'${productId}'` : 'null'}
          })
        })
        const data = await res.json()
        if (data.success) {
          this.status = 'success'
        } else {
          this.status = 'error'
          this.errorMsg = data.error || 'Submission failed.'
        }
      } catch (e) {
        this.status = 'error'
        this.errorMsg = 'Network error. Please try again.'
      }
    }
  }`}
>
  <!-- Success state -->
  <div x-show="status === 'success'" data-testid="form-success" class="bg-green-50 border border-green-200 p-6 text-center">
    <div class="text-green-600 text-4xl mb-3">✓</div>
    <h3 class="text-green-800 font-semibold text-lg">Message Sent!</h3>
    <p class="text-green-700 mt-1">Thank you for your inquiry. We'll respond within 1 business day.</p>
  </div>

  <!-- Error message -->
  <div x-show="status === 'error'" data-testid="form-error" class="bg-red-50 border border-red-200 p-3 mb-4 text-red-700 text-sm">
    <span x-text="errorMsg"></span>
  </div>

  <!-- Form -->
  <form x-show="status !== 'success'" @submit.prevent="submit" class="space-y-4" novalidate>
    {productName && (
      <p class="text-sm text-gray-500">
        Inquiring about: <strong class="text-gray-800">{productName}</strong>
      </p>
    )}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-name">
          Full Name <span class="text-brand-red">*</span>
        </label>
        <input
          id="inq-name"
          name="name"
          type="text"
          x-model="form.name"
          required
          class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-email">
          Email <span class="text-brand-red">*</span>
        </label>
        <input
          id="inq-email"
          name="email"
          type="email"
          x-model="form.email"
          required
          class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
          placeholder="john@company.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-company">
          Company <span class="text-brand-red">*</span>
        </label>
        <input
          id="inq-company"
          name="company"
          type="text"
          x-model="form.company"
          required
          class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
          placeholder="Your Company Name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-country">
          Country <span class="text-brand-red">*</span>
        </label>
        <input
          id="inq-country"
          name="country"
          type="text"
          x-model="form.country"
          required
          class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
          placeholder="United States"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-phone">
          Phone (optional)
        </label>
        <input
          id="inq-phone"
          name="phone"
          type="tel"
          x-model="form.phone"
          class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
          placeholder="+1 555 000 0000"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1" for="inq-message">
        Message <span class="text-brand-red">*</span>
      </label>
      <textarea
        id="inq-message"
        name="message"
        x-model="form.message"
        required
        rows="4"
        class="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-blue resize-none"
        placeholder="Describe what you need — machine type, quantity, application..."
      ></textarea>
    </div>

    <button
      type="submit"
      :disabled="status === 'loading'"
      class="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span x-show="status !== 'loading'">Send Inquiry</span>
      <span x-show="status === 'loading'">Sending…</span>
    </button>
  </form>
</div>
```

- [ ] **Step 4: 建立 `src/pages/contact.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../layouts/BaseLayout.astro'
import InquiryForm from '../components/ui/InquiryForm.astro'
---

<BaseLayout
  title="Contact Us — Reylong"
  description="Contact Reylong for product inquiries, pricing, technical support, or factory visits. Our team responds within 1 business day."
>
  <div class="container-wide py-12">
    <div class="max-w-3xl">
      <h1>Get in Touch</h1>
      <p class="text-gray-600 mt-2 text-lg">
        Ready to discuss your production needs? Fill in the form and we'll get back to you promptly.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
      <div class="lg:col-span-2">
        <InquiryForm />
      </div>

      <aside class="space-y-6">
        <div>
          <h3 class="font-semibold">Response Time</h3>
          <p class="text-gray-600 text-sm mt-1">Within 1 business day for general inquiries. Technical questions may take 2–3 days.</p>
        </div>
        <div>
          <h3 class="font-semibold">Sales Office</h3>
          <p class="text-gray-600 text-sm mt-1">Available Monday–Friday, 09:00–18:00 CST.</p>
        </div>
        <div>
          <h3 class="font-semibold">Email</h3>
          <a href="mailto:info@reylong.com" class="text-brand-blue text-sm hover:underline">info@reylong.com</a>
        </div>
      </aside>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 5: 手動測試表單提交**

```bash
npm run dev
```

1. 前往 `http://localhost:4321/contact`
2. 填入有效資料，送出，確認成功訊息
3. 填入無效 email，確認錯誤訊息
4. 確認 Supabase Dashboard → inquiries 表有新紀錄

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add inquiry form with API endpoint and Zod validation"
```

---

## Task 7: 新聞頁面

**Files:**
- Create: `src/pages/news/index.astro`
- Create: `src/pages/news/[slug].astro`

- [ ] **Step 1: 建立 `src/pages/news/index.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import NewsCard from '../../components/ui/NewsCard.astro'
import { getAllNews } from '../../lib/db/news'

const articles = await getAllNews()
---

<BaseLayout
  title="News — Reylong"
  description="Latest news from Reylong: new products, exhibitions, industry updates, and company announcements."
>
  <div class="container-wide py-12">
    <h1>News</h1>
    <div class="mt-8 max-w-2xl space-y-0">
      {articles.map(article => <NewsCard article={article} />)}
      {articles.length === 0 && (
        <p class="text-gray-500">No news articles yet.</p>
      )}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: 建立 `src/pages/news/[slug].astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import { getAllNewsSlugs, getNewsBySlug } from '../../lib/db/news'

export async function getStaticPaths() {
  const slugs = await getAllNewsSlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const { slug } = Astro.params
const article = await getNewsBySlug(slug)
if (!article) return Astro.redirect('/news')

const date = new Date(article.published_at).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})
---

<BaseLayout title={`${article.title_en} — Reylong`} description={article.title_en}>
  <article class="container-wide py-12 max-w-3xl">
    <nav class="text-sm text-gray-500 mb-6">
      <a href="/" class="hover:text-brand-blue">Home</a>
      <span class="mx-2">›</span>
      <a href="/news" class="hover:text-brand-blue">News</a>
      <span class="mx-2">›</span>
      <span class="text-gray-800">{article.title_en}</span>
    </nav>

    <time class="text-sm text-gray-500 uppercase tracking-wide">{date}</time>
    <h1 class="mt-2">{article.title_en}</h1>

    {article.cover_image_url && (
      <img
        src={article.cover_image_url}
        alt={article.title_en}
        class="w-full aspect-video object-cover mt-6"
      />
    )}

    <div class="prose prose-gray max-w-none mt-8" set:html={article.content_en} />
  </article>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/news/
git commit -m "feat: add news list and detail pages"
```

---

## Task 8: 案例頁面

**Files:**
- Create: `src/pages/case-studies/index.astro`
- Create: `src/pages/case-studies/[slug].astro`

- [ ] **Step 1: 建立 `src/pages/case-studies/index.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import CaseStudyCard from '../../components/ui/CaseStudyCard.astro'
import { getAllCaseStudies } from '../../lib/db/case-studies'

const caseStudies = await getAllCaseStudies()
---

<BaseLayout
  title="Case Studies — Reylong"
  description="See how Reylong machines power woven bag factories around the world. Real implementations, real results."
>
  <div class="container-wide py-12">
    <h1>Case Studies</h1>
    <p class="text-gray-600 mt-2">Real-world implementations from our global client base.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {caseStudies.map(cs => <CaseStudyCard caseStudy={cs} />)}
      {caseStudies.length === 0 && (
        <p class="text-gray-500 col-span-3">No case studies yet.</p>
      )}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: 建立 `src/pages/case-studies/[slug].astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../../lib/db/case-studies'
import { getProductById } from '../../lib/db/products'

export async function getStaticPaths() {
  const slugs = await getAllCaseStudySlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const { slug } = Astro.params
const caseStudy = await getCaseStudyBySlug(slug)
if (!caseStudy) return Astro.redirect('/case-studies')

const relatedProduct = caseStudy.product_id ? await getProductById(caseStudy.product_id) : null

const date = new Date(caseStudy.published_at).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})
---

<BaseLayout title={`${caseStudy.title_en} — Reylong`} description={caseStudy.title_en}>
  <article class="container-wide py-12 max-w-3xl">
    <nav class="text-sm text-gray-500 mb-6">
      <a href="/" class="hover:text-brand-blue">Home</a>
      <span class="mx-2">›</span>
      <a href="/case-studies" class="hover:text-brand-blue">Case Studies</a>
      <span class="mx-2">›</span>
      <span class="text-gray-800">{caseStudy.title_en}</span>
    </nav>

    <div class="flex gap-4 text-sm text-gray-500 mb-2">
      <span>Client: <strong class="text-gray-800">{caseStudy.client}</strong></span>
      <span>·</span>
      <span>{caseStudy.country}</span>
      <span>·</span>
      <time>{date}</time>
    </div>

    <h1>{caseStudy.title_en}</h1>

    {caseStudy.cover_image_url && (
      <img
        src={caseStudy.cover_image_url}
        alt={caseStudy.title_en}
        class="w-full aspect-video object-cover mt-6"
      />
    )}

    <div class="prose prose-gray max-w-none mt-8" set:html={caseStudy.content_en} />

    {relatedProduct && (
      <div class="mt-8 p-6 bg-gray-50 border border-gray-200">
        <p class="text-sm text-gray-600">
          Machine used in this project:
          <a href={`/products/${relatedProduct.slug}`} class="text-brand-blue hover:underline ml-1">
            {relatedProduct.name_en} →
          </a>
        </p>
      </div>
    )}
  </article>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/case-studies/
git commit -m "feat: add case studies list and detail pages"
```

---

## Task 9: 展覽 + 關於我們 頁面

**Files:**
- Create: `src/pages/events/index.astro`
- Create: `src/pages/about.astro`

- [ ] **Step 1: 建立 `src/pages/events/index.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import EventCard from '../../components/ui/EventCard.astro'
import { getAllEvents } from '../../lib/db/events'

const events = await getAllEvents()
const today = new Date().toISOString().split('T')[0]
const upcoming = events.filter(e => e.date_end >= today)
const past = events.filter(e => e.date_end < today)
---

<BaseLayout
  title="Events & Exhibitions — Reylong"
  description="Meet Reylong at international trade shows and exhibitions. See our latest machines live."
>
  <div class="container-wide py-12">
    <h1>Events & Exhibitions</h1>
    <p class="text-gray-600 mt-2">Find us at international trade shows around the world.</p>

    {upcoming.length > 0 && (
      <section class="mt-10">
        <h2 class="text-xl font-bold border-b pb-2 mb-4">Upcoming</h2>
        <div class="max-w-xl">
          {upcoming.map(event => <EventCard event={event} />)}
        </div>
      </section>
    )}

    {past.length > 0 && (
      <section class="mt-10">
        <h2 class="text-xl font-bold border-b pb-2 mb-4 text-gray-500">Past Events</h2>
        <div class="max-w-xl opacity-60">
          {past.map(event => <EventCard event={event} />)}
        </div>
      </section>
    )}

    {events.length === 0 && <p class="text-gray-500 mt-8">No events scheduled.</p>}
  </div>
</BaseLayout>
```

- [ ] **Step 2: 建立 `src/pages/about.astro`**

```astro
---
export const prerender = true

import BaseLayout from '../layouts/BaseLayout.astro'
---

<BaseLayout
  title="About Reylong — Woven Bag Machine Manufacturer"
  description="Reylong has been manufacturing high-performance woven bag machines for over 20 years, serving clients in 30+ countries."
>
  <div class="container-wide py-12">
    <h1>About Reylong</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8 items-start">
      <div class="prose prose-gray max-w-none">
        <p class="text-lg text-gray-700 leading-relaxed">
          Reylong Machinery Co., Ltd. is a professional manufacturer of woven bag making machines
          with over two decades of experience. We design and build industrial-grade equipment
          for factories producing PP and PE woven bags worldwide.
        </p>

        <h2>Our Products</h2>
        <p>
          Our product range covers the complete woven bag production workflow: tape extrusion lines,
          circular looms, lamination machines, cutting and sewing equipment, and printing solutions.
          Each machine is engineered for reliability and continuous high-volume production.
        </p>

        <h2>Global Reach</h2>
        <p>
          Reylong machines operate in factories across Asia, Latin America, the Middle East, South Asia,
          and Africa. We have established partnerships with distributors and service centers in key markets
          to ensure prompt after-sales support wherever our clients operate.
        </p>

        <h2>Quality Commitment</h2>
        <p>
          Every machine is manufactured to international quality standards. We provide comprehensive
          technical documentation, installation support, and training to ensure our clients achieve
          optimal production efficiency.
        </p>
      </div>

      <aside class="space-y-6">
        <div class="bg-gray-50 p-6 border-l-4 border-brand-red">
          <div class="text-4xl font-bold text-brand-red">20+</div>
          <div class="text-gray-600 mt-1">Years of manufacturing experience</div>
        </div>
        <div class="bg-gray-50 p-6 border-l-4 border-brand-blue">
          <div class="text-4xl font-bold text-brand-blue">30+</div>
          <div class="text-gray-600 mt-1">Countries served</div>
        </div>
        <div class="bg-gray-50 p-6 border-l-4 border-gray-600">
          <div class="text-4xl font-bold text-gray-700">20</div>
          <div class="text-gray-600 mt-1">Machine models available</div>
        </div>

        <div class="mt-6">
          <a href="/contact" class="btn-primary w-full text-center block">Contact Our Team</a>
          <a href="/products" class="btn-secondary w-full text-center block mt-3">View All Products</a>
        </div>
      </aside>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/events/ src/pages/about.astro
git commit -m "feat: add events and about pages"
```

---

## Task 10: AEO 基礎 — llms.txt + SEO 強化

**Files:**
- Create: `src/pages/llms.txt.ts`

- [ ] **Step 1: 建立 `src/pages/llms.txt.ts`**

```typescript
export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const content = `# Reylong

> Reylong Machinery Co., Ltd. manufactures high-performance woven bag making machines for B2B industrial clients worldwide.

## Company

Reylong is a professional manufacturer of PP and PE woven bag production equipment. Founded with over 20 years of experience, we serve factories in 30+ countries across Asia, Latin America, the Middle East, and Africa.

## Products

Reylong produces the following machine categories:
- Circular Looms: multi-shuttle, high-speed weaving machines for tubular PP/PE fabric
- Tape Stretching Lines: complete extrusion and stretching lines for production of flat tapes
- Lamination Machines: coating and lamination equipment for woven fabric
- Printing Machines: flexographic printing for woven bags
- Cutting & Sewing: automated cutting, sewing, and finishing equipment

## Contact

- Website: https://reylong.com
- Inquiry: https://reylong.com/contact
- Products: https://reylong.com/products

## Content

- /products — full product catalog
- /case-studies — client implementation stories
- /news — company and industry news
- /events — trade shows and exhibitions
- /about — company information
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

- [ ] **Step 2: 確認 llms.txt 正常**

```bash
npm run dev
```

開啟 `http://localhost:4321/llms.txt`，確認純文字內容正確顯示。

- [ ] **Step 3: 確認 Schema.org 已正確嵌入**

開啟 `http://localhost:4321/products/circular-loom-cl-8`，在頁面原始碼搜尋 `application/ld+json`，確認 Product schema 存在且格式正確。

可使用 Google 的 [Rich Results Test](https://search.google.com/test/rich-results) 驗證（非必要，build 後再測）。

- [ ] **Step 4: Commit**

```bash
git add src/pages/llms.txt.ts
git commit -m "feat: add llms.txt for AEO and AI crawler readability"
```

---

## Task 11: i18n 西班牙語路由

**Files:**
- Create: `src/lib/i18n/en.ts`
- Create: `src/lib/i18n/es.ts`
- Create: `src/lib/i18n/utils.ts`
- Create: `src/pages/es/index.astro`
- Create: `src/pages/es/products/index.astro`
- Create: `src/pages/es/products/[slug].astro`

- [ ] **Step 1: 建立 i18n 字串檔**

建立 `src/lib/i18n/en.ts`：

```typescript
export const en = {
  nav: {
    products: 'Products',
    caseStudies: 'Case Studies',
    news: 'News',
    events: 'Events',
    about: 'About',
    contact: 'Contact',
    getQuote: 'Get a Quote',
  },
  home: {
    heroTitle: 'High-Performance Woven Bag Machines',
    heroSubtitle: 'Circular looms, tape lines, and complete production solutions for PP/PE woven bags.',
    heroCta: 'View Products',
  },
  products: {
    title: 'Our Products',
    subtitle: 'Industrial-grade equipment for serious manufacturers',
    viewAll: 'View All',
    requestQuote: 'Request a Quote',
    learnMore: 'Learn More',
  },
  contact: {
    title: 'Get in Touch',
    sendInquiry: 'Send Inquiry',
    sending: 'Sending…',
    successTitle: 'Message Sent!',
    successMsg: "Thank you for your inquiry. We'll respond within 1 business day.",
  }
} as const
```

建立 `src/lib/i18n/es.ts`：

```typescript
export const es = {
  nav: {
    products: 'Productos',
    caseStudies: 'Casos de Éxito',
    news: 'Noticias',
    events: 'Eventos',
    about: 'Nosotros',
    contact: 'Contacto',
    getQuote: 'Solicitar Cotización',
  },
  home: {
    heroTitle: 'Máquinas de Alto Rendimiento para Sacos Tejidos',
    heroSubtitle: 'Telares circulares, líneas de cinta y soluciones completas de producción para sacos tejidos PP/PE.',
    heroCta: 'Ver Productos',
  },
  products: {
    title: 'Nuestros Productos',
    subtitle: 'Equipos industriales para fabricantes serios',
    viewAll: 'Ver Todos',
    requestQuote: 'Solicitar Cotización',
    learnMore: 'Más Información',
  },
  contact: {
    title: 'Contáctenos',
    sendInquiry: 'Enviar Consulta',
    sending: 'Enviando…',
    successTitle: '¡Mensaje Enviado!',
    successMsg: 'Gracias por su consulta. Responderemos en 1 día hábil.',
  }
} as const
```

建立 `src/lib/i18n/utils.ts`：

```typescript
import { en } from './en'
import { es } from './es'

type Lang = 'en' | 'es'
const translations = { en, es } as const

export function t(lang: Lang) {
  return translations[lang]
}

export function getAlternateLangPath(currentPath: string, targetLang: Lang): string {
  if (targetLang === 'es') {
    return currentPath.startsWith('/es') ? currentPath : `/es${currentPath}`
  }
  return currentPath.replace(/^\/es/, '') || '/'
}
```

- [ ] **Step 2: 建立 `/es` 首頁**

建立 `src/pages/es/index.astro`：

```astro
---
export const prerender = true

import BaseLayout from '../../layouts/BaseLayout.astro'
import ProductCard from '../../components/ui/ProductCard.astro'
import { getFeaturedProducts } from '../../lib/db/products'
import { getLatestNews } from '../../lib/db/news'
import { getUpcomingEvents } from '../../lib/db/events'
import { t } from '../../lib/i18n/utils'

const lang = 'es'
const tr = t(lang)

const [featuredProducts, latestNews, upcomingEvents] = await Promise.all([
  getFeaturedProducts(),
  getLatestNews(3),
  getUpcomingEvents()
])
---

<BaseLayout
  title="Reylong — Fabricante de Máquinas para Sacos Tejidos"
  description="Reylong fabrica máquinas circulares de alta velocidad y equipos completos para producción de sacos tejidos PP/PE."
>
  <div class="container-wide py-12">
    <h1>{tr.home.heroTitle}</h1>
    <p class="text-gray-600 mt-2 text-lg">{tr.home.heroSubtitle}</p>
    <a href="/es/products" class="btn-primary mt-6 inline-block">{tr.home.heroCta}</a>

    <section class="mt-12">
      <h2>{tr.products.title}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {featuredProducts.map(product => (
          <ProductCard product={product} lang={lang} />
        ))}
      </div>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 3: 建立 `/es/products` 目錄頁**

建立 `src/pages/es/products/index.astro`：

```astro
---
export const prerender = true

import BaseLayout from '../../../layouts/BaseLayout.astro'
import ProductCard from '../../../components/ui/ProductCard.astro'
import { getAllProducts } from '../../../lib/db/products'

const products = await getAllProducts()
---

<BaseLayout
  title="Productos — Reylong"
  description="Catálogo completo de máquinas Reylong para sacos tejidos: telares circulares, líneas de cinta y más."
>
  <div class="container-wide py-12">
    <h1>Nuestros Productos</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {products.map(product => (
        <ProductCard product={product} lang="es" />
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: 建立 `/es/products/[slug]`**

建立 `src/pages/es/products/[slug].astro`：

```astro
---
export const prerender = true

import BaseLayout from '../../../layouts/BaseLayout.astro'
import ImageGallery from '../../../components/ui/ImageGallery.astro'
import SpecsTable from '../../../components/ui/SpecsTable.astro'
import ProductSchema from '../../../components/seo/ProductSchema.astro'
import InquiryForm from '../../../components/ui/InquiryForm.astro'
import { getAllProductSlugs, getProductBySlug, getProductMedia } from '../../../lib/db/products'

export async function getStaticPaths() {
  const slugs = await getAllProductSlugs()
  return slugs.map(slug => ({ params: { slug } }))
}

const { slug } = Astro.params
const product = await getProductBySlug(slug)
if (!product) return Astro.redirect('/es/products')

const media = await getProductMedia(product.id)
const mainImageUrl = media.find(m => m.type === 'image')?.url
const pageUrl = new URL(Astro.url.pathname, Astro.site).toString()
---

<BaseLayout
  title={`${product.name_es} — Reylong`}
  description={product.description_es}
  ogImage={mainImageUrl}
>
  <slot slot="head" name="head">
    <ProductSchema product={product} imageUrl={mainImageUrl} pageUrl={pageUrl} />
  </slot>

  <div class="container-wide py-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ImageGallery media={media} productName={product.name_es} />
      <div>
        <h1>{product.name_es}</h1>
        <p class="text-gray-600 mt-4 leading-relaxed">{product.description_es}</p>
        <a href="#inquiry" class="btn-primary mt-6 inline-block">Solicitar Cotización</a>
      </div>
    </div>

    {Object.keys(product.specs ?? {}).length > 0 && (
      <section class="mt-12">
        <h2 class="mb-4">Especificaciones Técnicas</h2>
        <SpecsTable specs={product.specs} />
      </section>
    )}

    <section id="inquiry" class="mt-12 bg-gray-50 p-8">
      <h2 class="mb-6">Solicitar Cotización — {product.name_es}</h2>
      <InquiryForm productId={product.id} productName={product.name_es} />
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 5: 確認 i18n 路由**

```bash
npm run dev
```

確認：
- `http://localhost:4321/es` → 西班牙語首頁
- `http://localhost:4321/es/products` → 西班牙語產品目錄
- `http://localhost:4321/es/products/circular-loom-cl-8` → 西班牙語產品詳情

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n/ src/pages/es/
git commit -m "feat: add Spanish (es) i18n routes for home, products"
```

---

## Task 12: Build + Cloudflare Pages 部署

**Files:**
- Create: `public/_headers`
- Modify: `astro.config.mjs`（加 site URL）

- [ ] **Step 1: 加 site URL 到 `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import alpinejs from '@astrojs/alpinejs'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://reylong.com',
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind(), alpinejs()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }
  }
})
```

- [ ] **Step 2: 建立 `public/_headers`（安全 headers）**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- [ ] **Step 3: 執行 build 確認成功**

```bash
npm run build
```

預期：`dist/` 目錄生成，無 TypeScript 或 build error。

- [ ] **Step 4: 在 Cloudflare Pages 建立專案**

1. 前往 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. 建立新專案，連結 Git repository（或直接上傳 `dist/`）
3. 設定 Build 指令：`npm run build`
4. 設定 Build output：`dist`
5. 加入環境變數：`SUPABASE_URL`、`SUPABASE_ANON_KEY`

- [ ] **Step 5: 最終 commit**

```bash
git add .
git commit -m "chore: add site URL, security headers, ready for Cloudflare Pages deploy"
```

---

## 驗收清單

部署後確認以下項目：

- [ ] `https://reylong.com` — 首頁載入，輪播運作
- [ ] `/products` — 所有產品顯示
- [ ] `/products/[slug]` — Schema.org JSON-LD 存在（`<script type="application/ld+json">`）
- [ ] `/contact` — 詢價表單提交成功，Supabase inquiries 有新紀錄
- [ ] `/llms.txt` — 純文字正確顯示
- [ ] `/es` — 西班牙語首頁
- [ ] PageSpeed Insights ≥ 90 (Mobile)
- [ ] 無 console error

---

## Plan B 預告：Admin CMS

Plan B 涵蓋 `/admin/*` 後台（SSR）：
- Supabase Auth 登入保護
- 產品新增/編輯/刪除（含圖片上傳至 Supabase Storage）
- 新聞、案例、展覽的 CRUD
- 詢價單狀態管理

Plan B 可在 Plan A 公開網站完成並上線後開始。

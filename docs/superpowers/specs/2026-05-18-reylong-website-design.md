# Reylong Website Design Spec
**Date:** 2026-05-18  
**Stack:** Astro 5 + Supabase  
**Domain:** reylong.com  

---

## 1. 專案概述

Reylong 是一家編織袋機製造商，需要一個全球性 B2B 公司網站。  
風格參考：[Starlinger](https://www.starlinger.com/en/)（工業風、專業、信任感）。

**品牌：**
- Logo：R + L 組合標誌，紅色 + 藍色
- 主色：紅色 `#E8001C`、藍色 `#0033CC`、白底

**語言：** 英語（主）、西班牙語（輔）  
**主要市場：** 全球  

---

## 2. 整體架構

```
reylong.com
├── 公開網站（Astro SSG 靜態生成）
│   ├── /                    首頁
│   ├── /products            產品目錄
│   ├── /products/[slug]     產品詳情
│   ├── /news                新聞列表
│   ├── /news/[slug]         新聞詳情
│   ├── /case-studies        案例列表
│   ├── /case-studies/[slug] 案例詳情
│   ├── /events              展覽活動
│   ├── /about               關於我們
│   └── /contact             聯絡/詢價
│
├── 後台管理（Astro SSR，需登入）
│   ├── /admin/dashboard
│   ├── /admin/products
│   ├── /admin/news
│   ├── /admin/case-studies
│   ├── /admin/events
│   └── /admin/inquiries
│
└── /es/*                    西班牙語版（對應所有公開頁面）
```

### 技術選擇

| 層次 | 技術 |
|---|---|
| 前端框架 | Astro 5（混合渲染：SSG 公開頁 + SSR 後台） |
| 樣式 | Tailwind CSS（Mobile First 響應式） |
| 互動 | Alpine.js（輕量，用於選單、輪播等） |
| 資料庫 | Supabase（PostgreSQL） |
| 媒體儲存 | Supabase Storage（圖片、PDF） |
| 影片 | YouTube / Vimeo 嵌入連結 |
| 身份驗證 | Supabase Auth |
| 部署 | Cloudflare Pages（免費） |
| i18n | Astro 內建 i18n routing |
| AEO 準備 | Schema.org + llms.txt + 語義化 HTML |

---

## 3. 資料庫結構（Supabase）

### products
```sql
id            uuid PK
slug          text UNIQUE
category      text
is_featured   boolean        -- 首頁展示
sort_order    integer
name_en       text
name_es       text
description_en text
description_es text
specs         JSONB          -- 彈性規格，如 {speed: "120 bags/min"}
created_at    timestamptz
updated_at    timestamptz
```

### product_media
```sql
id            uuid PK
product_id    uuid FK → products
type          text  -- 'image' | 'video' | 'catalog_pdf'
url           text  -- 圖片/PDF: Supabase Storage 路徑；影片: YouTube/Vimeo URL
caption_en    text
caption_es    text
sort_order    integer
```

### news
```sql
id            uuid PK
slug          text UNIQUE
published_at  timestamptz
cover_image_url text
title_en      text
title_es      text
content_en    text  -- 富文字 HTML
content_es    text
```

### case_studies
```sql
id            uuid PK
slug          text UNIQUE
client        text
country       text
published_at  timestamptz
cover_image_url text
title_en      text
title_es      text
content_en    text
content_es    text
product_id    uuid FK → products (nullable)
```

### events
```sql
id            uuid PK
title_en      text
title_es      text
date_start    date
date_end      date
location      text
booth_number  text
description_en text
description_es text
url           text  -- 展覽官網（nullable）
```

### inquiries
```sql
id            uuid PK
created_at    timestamptz
name          text
email         text
company       text
country       text
phone         text
product_id    uuid FK → products (nullable)
message       text
status        text  -- 'new' | 'read' | 'replied'
```

---

## 4. 後台 CMS

路徑：`/admin/*`，Supabase Auth 保護。

| 路徑 | 功能 |
|---|---|
| `/admin/dashboard` | 統計：新詢價數、待處理事項 |
| `/admin/products` | 產品列表、新增/編輯/刪除 |
| `/admin/products/[id]` | 編輯：英西雙語、規格（動態欄位）、圖片上傳（拖曳排序）、YouTube 連結、PDF 型錄上傳、is_featured 開關 |
| `/admin/news` | 新聞列表、富文字編輯（英西） |
| `/admin/case-studies` | 案例列表、關聯產品選擇 |
| `/admin/events` | 展覽活動管理 |
| `/admin/inquiries` | 詢價單列表、狀態管理（new/read/replied） |

---

## 5. 公開網站頁面

### 首頁 `/`
1. Hero 輪播（主力機器大圖 + 標語）
2. 主力產品卡片（is_featured = true，最多 6 張）
3. 公司簡介區塊
4. 最新新聞（3篇）
5. 最新案例（3篇）
6. 近期展覽
7. 詢價 CTA 按鈕

### 產品詳情 `/products/[slug]`
- 圖片輪播
- 規格表（從 JSONB 動態渲染）
- YouTube 影片嵌入
- PDF 型錄下載按鈕
- 相關案例
- 詢價表單（提交至 Supabase inquiries）

### 其他頁面
- `/news`、`/case-studies`、`/events` → 列表 + 詳情
- `/about` → 公司介紹、歷史、聯絡資訊
- `/contact` → 詢價表單

---

## 6. AEO 準備（Prototype 就埋好）

- 每個產品頁加 `Schema.org Product` JSON-LD
- 根目錄放 `/llms.txt`（讓 AI 爬蟲了解公司）
- 語義化 HTML：`<article>`、`<section>`、`<main>`
- 產品頁加 FAQ 區塊
- 清晰的 `<title>` 和 `<meta description>`

> **注意：** Prototype 先以 SEO 語義結構為基礎建立，之後視情況強化為完整 AEO 策略。

---

## 7. 費用估算

| 服務 | 費用 |
|---|---|
| Cloudflare Pages | 免費 |
| Supabase Free Plan | 免費（500MB DB、5GB Storage） |
| 網域 reylong.com | ~$10-15/年 |
| YouTube 影片托管 | 免費 |
| **初期總計** | **~$10-15/年** |

升級時機：Supabase Storage 接近 5GB 時升級至 Pro（$25/月）。

---

## 8. 響應式設計斷點（Tailwind）

| 裝置 | 斷點 |
|---|---|
| 手機 | 預設 < 640px |
| 平板 | `md:` 768px+ |
| 桌機 | `lg:` 1024px+ |
| 寬螢幕 | `xl:` 1280px+ |

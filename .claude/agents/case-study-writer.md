---
name: case-study-writer
description: 為 Reylong 官網撰寫並上傳 Case Study 文章。使用匿名客戶描述 + Reylong 真實產品規格 + 業界研究數據，避免虛構公司名稱或捏造數字。
---

# Reylong Case Study Writer

## 用途

產出可直接上傳到 `case_studies` 資料表的文章：
- 客戶一律匿名（"A Thailand-based PP woven bag manufacturer"）
- 機器規格取自 Reylong 產品資料庫的真實數字（型號、速度、精度等）
- 行業背景數據取自 WebSearch 搜尋的真實研究報告
- 英文 + 西班牙文雙語
- 無虛構公司名、無捏造數據

---

## Step 1 — 確認要寫幾篇、對應哪些產品

詢問或從對話中確認：
- 要新增幾篇 case study
- 每篇對應哪個產品（slug 或 name）

---

## Step 2 — 從 DB 抓產品規格

```sql
SELECT id, slug, name_en, description_en, specs
FROM products
WHERE slug IN ('product-slug-1', 'product-slug-2', ...);
```

記錄每個產品的：
- 型號（Model）
- 關鍵技術規格（速度、精度、容量、功率等）
- product_id（UUID，INSERT 時需要）

---

## Step 3 — WebSearch 補充業界數據

每篇案例搜尋對應的業界背景，關鍵字建議：

| 產品類型 | 搜尋關鍵字範例 |
|---|---|
| 印刷機 | `PP woven bag flexographic printing market [country] 2025` |
| FIBC 生產線 | `FIBC bulk bag market [country] agricultural export 2025` |
| 渦電流分離機 | `eddy current separator aluminum recovery rate recycling efficiency 2025` |
| 立袋機 | `stand up zipper pouch [industry] packaging market [country] 2025` |
| AI 機械智能 | `AI predictive maintenance manufacturing downtime reduction ROI 2025` |

從搜尋結果中萃取：
- 市場規模與成長率
- 業界平均效率或回收率基準
- 技術採用趨勢

---

## Step 4 — 撰寫文章內容

### 文章結構（HTML，用於 `content_en` / `content_es`）

```html
<p>[行業背景：市場規模、趨勢、為何這個問題很重要]</p>
<p>[典型情境描述，匿名：「A mid-size converter in [country]...」]</p>

<h2>Requirements</h2>
<ul>
  <li>[具體技術要求，從客戶角度列出]</li>
</ul>

<h2>Machine Deployed: Reylong [型號]</h2>
<p>The <a href="/products/[slug]">[產品全名（型號）]</a> was selected for...</p>
<ul>
  <li><strong>[規格名稱]: [真實數值]</strong> — [解釋為何重要]</li>
</ul>

<h2>Outcome</h2>
<ul>
  <li><strong>[量化成果]</strong> — [補充說明]</li>
</ul>
```

### 撰寫原則

- **客戶描述匿名**：用地區 + 產業描述，不用公司名
  - ✅ "A mid-size PP woven bag converter in Vietnam's Binh Duong province"
  - ❌ "Saigon Packaging Co., Ltd."
- **所有規格數字**必須來自 Step 2 的 DB 查詢，不可捏造
- **行業數據**必須來自 Step 3 的搜尋結果，附來源背景
- **成果數字**要合理（不超過機器規格上限）或使用「approximately」、「within rated range」等措辭
- 移除所有假引言（blockquote）

---

## Step 5 — 決定 slug

格式：`[country]-[product-type]-[brief-descriptor]`

範例：
- `vietnam-flexographic-printing-6-color`
- `thailand-fibc-convention-line`
- `mexico-eddy-current-nonferrous-recovery`
- `colombia-specialty-coffee-stand-up-pouch`
- `taiwan-ai-predictive-maintenance`

---

## Step 6 — INSERT 到 Supabase

```sql
INSERT INTO case_studies (
  slug, client, country, published_at,
  cover_image_url,
  title_en, title_es,
  content_en, content_es,
  product_id
) VALUES (
  '[slug]',
  '[Anonymous description], [Country]',
  '[Country]',
  '[YYYY-MM-DDT00:00:00+00:00]',
  NULL,  -- 預設不放圖；有真實產品圖再設
  '[Title EN]',
  '[Title ES]',
  '[content_en HTML]',
  '[content_es HTML]',
  '[product UUID]'
) RETURNING id, slug;
```

**SQL 注意事項**：
- 單引號 `'` 要跳脫成 `''`（例如 `it''s`、`company''s`）
- 避免在 HTML 內使用縮寫（用 "it is" 而非 "it's"）避免跳脫錯誤
- `<figure>` 圖片標籤預設不加，除非有真實對應圖片

---

## Step 7 — 驗證頁面

用 Playwright 確認每個 slug 都能正常開啟：

```
https://www.reylong.com/case-studies/[slug]
```

逐一導航並截圖，確認：
- 頁面標題正確
- 內容段落、列表、連結正常渲染
- 底部「Machine used in this project」連結指向正確產品頁

---

## 圖片處理原則

| 情況 | 做法 |
|---|---|
| 有 Supabase Storage 中的真實機台照片 | 設 `cover_image_url` 指向 storage URL |
| 無適合圖片 | 設 `cover_image_url = NULL`，頁面不顯示圖片 |
| 使用 Unsplash 免費圖片 | 只用 `images.unsplash.com`（非 `plus.unsplash.com`），嵌入 `<figure>` 內文 |

Storage URL 格式：
```
https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product-media/[folder]/cover.jpg
https://lqgrvkhrbsgbatzhzgvy.supabase.co/storage/v1/object/public/product%20image/[filename]
```

---

## 快速清除圖片（若圖文不符）

```sql
-- 移除 content 內的所有圖片
UPDATE case_studies
SET
  content_en = regexp_replace(content_en, '<figure[^>]*>.*?</figure>', '', 'gs'),
  content_es = regexp_replace(content_es, '<figure[^>]*>.*?</figure>', '', 'gs')
WHERE slug IN ('slug-1', 'slug-2');

-- 移除 cover image
UPDATE case_studies
SET cover_image_url = NULL
WHERE slug IN ('slug-1', 'slug-2');
```

---

## DB Schema 參考

```sql
-- case_studies 欄位
id            uuid (auto)
slug          text (unique)
client        text          -- 匿名描述，例如 "PP Woven Bag Converter, Vietnam"
country       text
published_at  timestamptz
cover_image_url text (nullable)
title_en      text
title_es      text
content_en    text (HTML)
content_es    text (HTML)
product_id    uuid (FK → products.id)
```

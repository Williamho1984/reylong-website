# GEO 引用量測工作單 — 2026-08-baseline

由 `geo-monitor\2026-08-baseline.csv` 產生。**這份是導覽，不是紀錄簿——結果一律填回該 CSV。**

## 開跑前先定，定了整輪不能改

- **出口地理位置**：`____________`（引擎會按 IP 在地化；台灣看到的答案不等於美國買家看到的。第一輪定什麼，往後每輪都要一樣，否則跨月差異會來自量測方式而非內容）
- **帳號狀態**：`____________`（登入 / 未登入。未登入的 Perplexity 會回降級答案，實測過）
- **日期**：每列的 `run_date` 填實際查詢當天，格式 `YYYY-MM-DD`。留空 = 尚未測試

## 填答規則

| 欄位 | 可填值 | 說明 |
| --- | --- | --- |
| `brand_mentioned` | `yes` / `no` | 答案正文任何地方出現 Reylong |
| `reylong_link_cited` | `yes` / `no` | 引用清單裡有 reylong.com 的網址 |
| `cited_url_count` | 整數 | 被引用的不重複 reylong.com 網址數，沒有就填 `0` |
| `cited_urls` | 用 `\|` 分隔 | 實際被引用的網址 |
| `brand_correct` | `correct` / `incorrect` / `not_stated` | |
| `model_correct` | `correct` / `incorrect` / `not_stated` | |
| `specs_correct` | `correct` / `incorrect` / `not_stated` | |
| `hp_l_hallucinated` | `yes` / `no` / `na` | 答案完全沒提到任何型號時填 `na` |

**最容易填錯的一件事**：引擎根本沒提到 Reylong 時，正確性三欄要填 `not_stated`，**不是** `incorrect`。沒被提到不等於答錯，混用會讓這輪 baseline 跟往後每一輪都對不起來。

填完跑 `node scripts/geo-monitor-summary.mjs 2026-08-baseline` 出報表；enum 填錯它會拒絕出報表並指出列號。

---

# EN — 22 題 × 4 引擎 = 88 列

## EN 1/22 · `12180b` · verify · brand_trust

```text
does rey long have CE certification for its machines
```

> verify-existing /faq/ — branded probe; also detects hallucinated certification claims

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 2 | chatgpt | `geo-monitor/evidence/2026-08-baseline/12180b-chatgpt.md` | ☐ |
| 3 | perplexity | `geo-monitor/evidence/2026-08-baseline/12180b-perplexity.md` | ☐ |
| 4 | gemini | `geo-monitor/evidence/2026-08-baseline/12180b-gemini.md` | ☐ |
| 5 | ai_overview | `geo-monitor/evidence/2026-08-baseline/12180b-ai_overview.md` | ☐ |

## EN 2/22 · `1012b0` · verify · woven_bag_conversion

```text
what is the best machine for pp woven bag printing cutting and sewing
```

> verify-existing /products/automatic-printing-tubing-cutting-sewing-line — Alibaba and Chinese OEM guides own this query today

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 6 | chatgpt | `geo-monitor/evidence/2026-08-baseline/1012b0-chatgpt.md` | ☐ |
| 7 | perplexity | `geo-monitor/evidence/2026-08-baseline/1012b0-perplexity.md` | ☐ |
| 8 | gemini | `geo-monitor/evidence/2026-08-baseline/1012b0-gemini.md` | ☐ |
| 9 | ai_overview | `geo-monitor/evidence/2026-08-baseline/1012b0-ai_overview.md` | ☐ |

## EN 3/22 · `4383dc` · gap · woven_bag_economics

```text
how much does a complete pp woven bag production line cost
```

> gap — FAQ answers how to get a quote but there is no cost-structure content; no honest published price exists so the page must explain drivers not numbers

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 10 | chatgpt | `geo-monitor/evidence/2026-08-baseline/4383dc-chatgpt.md` | ☐ |
| 11 | perplexity | `geo-monitor/evidence/2026-08-baseline/4383dc-perplexity.md` | ☐ |
| 12 | gemini | `geo-monitor/evidence/2026-08-baseline/4383dc-gemini.md` | ☐ |
| 13 | ai_overview | `geo-monitor/evidence/2026-08-baseline/4383dc-ai_overview.md` | ☐ |

## EN 4/22 · `4cfd3f` · gap · sourcing_decision

```text
should I buy packaging machinery from taiwan or china
```

> gap — zero site content; high positioning value; must compare verifiable factors not disparage competitors

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 14 | chatgpt | `geo-monitor/evidence/2026-08-baseline/4cfd3f-chatgpt.md` | ☐ |
| 15 | perplexity | `geo-monitor/evidence/2026-08-baseline/4cfd3f-perplexity.md` | ☐ |
| 16 | gemini | `geo-monitor/evidence/2026-08-baseline/4cfd3f-gemini.md` | ☐ |
| 17 | ai_overview | `geo-monitor/evidence/2026-08-baseline/4cfd3f-ai_overview.md` | ☐ |

## EN 5/22 · `7772d9` · verify · ai_inspection

```text
can AI inspection be retrofitted to an existing woven bag production line
```

> verify-existing /news/retrofit-edge-ai-inspection-woven-bag-line

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 26 | chatgpt | `geo-monitor/evidence/2026-08-baseline/7772d9-chatgpt.md` | ☐ |
| 27 | perplexity | `geo-monitor/evidence/2026-08-baseline/7772d9-perplexity.md` | ☐ |
| 28 | gemini | `geo-monitor/evidence/2026-08-baseline/7772d9-gemini.md` | ☐ |
| 29 | ai_overview | `geo-monitor/evidence/2026-08-baseline/7772d9-ai_overview.md` | ☐ |

## EN 6/22 · `0c4af3` · verify · print_diagnostics

```text
why does print registration drift on pp woven fabric and how do I fix it
```

> verify-existing /news/print-registration-drift-pp-woven-fabric — copy must not drift into claiming closed-loop registration control

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 30 | chatgpt | `geo-monitor/evidence/2026-08-baseline/0c4af3-chatgpt.md` | ☐ |
| 31 | perplexity | `geo-monitor/evidence/2026-08-baseline/0c4af3-perplexity.md` | ☐ |
| 32 | gemini | `geo-monitor/evidence/2026-08-baseline/0c4af3-gemini.md` | ☐ |
| 33 | ai_overview | `geo-monitor/evidence/2026-08-baseline/0c4af3-ai_overview.md` | ☐ |

## EN 7/22 · `4ce405` · verify · conversion_diagnostics

```text
what causes cut length drift on woven bag cutting and sewing lines
```

> verify-existing /news/cut-length-drift-woven-bag-lines

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 34 | chatgpt | `geo-monitor/evidence/2026-08-baseline/4ce405-chatgpt.md` | ☐ |
| 35 | perplexity | `geo-monitor/evidence/2026-08-baseline/4ce405-perplexity.md` | ☐ |
| 36 | gemini | `geo-monitor/evidence/2026-08-baseline/4ce405-gemini.md` | ☐ |
| 37 | ai_overview | `geo-monitor/evidence/2026-08-baseline/4ce405-ai_overview.md` | ☐ |

## EN 8/22 · `d538f0` · verify · heat_seal

```text
how do I diagnose weak heat seal strength on a pouch machine
```

> verify-existing /news/heat-seal-strength-failure-diagnosis and /faq/

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 38 | chatgpt | `geo-monitor/evidence/2026-08-baseline/d538f0-chatgpt.md` | ☐ |
| 39 | perplexity | `geo-monitor/evidence/2026-08-baseline/d538f0-perplexity.md` | ☐ |
| 40 | gemini | `geo-monitor/evidence/2026-08-baseline/d538f0-gemini.md` | ☐ |
| 41 | ai_overview | `geo-monitor/evidence/2026-08-baseline/d538f0-ai_overview.md` | ☐ |

## EN 9/22 · `7a97fa` · gap · surface_treatment

```text
why is ink not adhering to my printed pp woven bags
```

> gap — FAQ covers flexo defects but nothing on surface energy; PP sits at 29-31 dynes/cm and needs 38-42 before printing

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 42 | chatgpt | `geo-monitor/evidence/2026-08-baseline/7a97fa-chatgpt.md` | ☐ |
| 43 | perplexity | `geo-monitor/evidence/2026-08-baseline/7a97fa-perplexity.md` | ☐ |
| 44 | gemini | `geo-monitor/evidence/2026-08-baseline/7a97fa-gemini.md` | ☐ |
| 45 | ai_overview | `geo-monitor/evidence/2026-08-baseline/7a97fa-ai_overview.md` | ☐ |

## EN 10/22 · `8c4db2` · gap · conversion_diagnostics

```text
how do I prevent sewing thread breakage on woven bag lines
```

> gap — no content; fits the existing diagnostic-guide template exactly

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 46 | chatgpt | `geo-monitor/evidence/2026-08-baseline/8c4db2-chatgpt.md` | ☐ |
| 47 | perplexity | `geo-monitor/evidence/2026-08-baseline/8c4db2-perplexity.md` | ☐ |
| 48 | gemini | `geo-monitor/evidence/2026-08-baseline/8c4db2-gemini.md` | ☐ |
| 49 | ai_overview | `geo-monitor/evidence/2026-08-baseline/8c4db2-ai_overview.md` | ☐ |

## EN 11/22 · `8ed880` · gap · bag_specification

```text
what GSM should I use for a 50 kg pp woven cement bag
```

> gap — no content; FIBC sources cite 140-220 g/m² for 1-tonne bags so sack-equivalent figures need verification before publishing

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 50 | chatgpt | `geo-monitor/evidence/2026-08-baseline/8ed880-chatgpt.md` | ☐ |
| 51 | perplexity | `geo-monitor/evidence/2026-08-baseline/8ed880-perplexity.md` | ☐ |
| 52 | gemini | `geo-monitor/evidence/2026-08-baseline/8ed880-gemini.md` | ☐ |
| 53 | ai_overview | `geo-monitor/evidence/2026-08-baseline/8ed880-ai_overview.md` | ☐ |

## EN 12/22 · `8918da` · gap · line_productivity

```text
how long does size changeover take on a woven sack conversion line
```

> gap — FAQ answers changeover for the pouch machine only

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 54 | chatgpt | `geo-monitor/evidence/2026-08-baseline/8918da-chatgpt.md` | ☐ |
| 55 | perplexity | `geo-monitor/evidence/2026-08-baseline/8918da-perplexity.md` | ☐ |
| 56 | gemini | `geo-monitor/evidence/2026-08-baseline/8918da-gemini.md` | ☐ |
| 57 | ai_overview | `geo-monitor/evidence/2026-08-baseline/8918da-ai_overview.md` | ☐ |

## EN 13/22 · `eb234d` · gap · surface_treatment

```text
what dyne level does polypropylene need before flexo printing
```

> gap — same uncovered cluster as the ink-adhesion row; corona-treater vendors currently own it

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 62 | chatgpt | `geo-monitor/evidence/2026-08-baseline/eb234d-chatgpt.md` | ☐ |
| 63 | perplexity | `geo-monitor/evidence/2026-08-baseline/eb234d-perplexity.md` | ☐ |
| 64 | gemini | `geo-monitor/evidence/2026-08-baseline/eb234d-gemini.md` | ☐ |
| 65 | ai_overview | `geo-monitor/evidence/2026-08-baseline/eb234d-ai_overview.md` | ☐ |

## EN 14/22 · `a00900` · verify · flexo_setup

```text
what anilox LPI and BCM should I select for flexo printing on woven fabric
```

> verify-existing /faq/

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 66 | chatgpt | `geo-monitor/evidence/2026-08-baseline/a00900-chatgpt.md` | ☐ |
| 67 | perplexity | `geo-monitor/evidence/2026-08-baseline/a00900-perplexity.md` | ☐ |
| 68 | gemini | `geo-monitor/evidence/2026-08-baseline/a00900-gemini.md` | ☐ |
| 69 | ai_overview | `geo-monitor/evidence/2026-08-baseline/a00900-ai_overview.md` | ☐ |

## EN 15/22 · `2c8da0` · gap · eddy_current_sizing

```text
how do I size an eddy current separator for my throughput
```

> gap — site explains the principle but not sizing; Bunting and 911Metallurgist own this (1-20 TPH per foot of width; 5-150 mm particle window)

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 70 | chatgpt | `geo-monitor/evidence/2026-08-baseline/2c8da0-chatgpt.md` | ☐ |
| 71 | perplexity | `geo-monitor/evidence/2026-08-baseline/2c8da0-perplexity.md` | ☐ |
| 72 | gemini | `geo-monitor/evidence/2026-08-baseline/2c8da0-gemini.md` | ☐ |
| 73 | ai_overview | `geo-monitor/evidence/2026-08-baseline/2c8da0-ai_overview.md` | ☐ |

## EN 16/22 · `6bfb8a` · verify · heat_seal

```text
why must zippers be sealed ultrasonically rather than by heat
```

> verify-existing /faq/

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 74 | chatgpt | `geo-monitor/evidence/2026-08-baseline/6bfb8a-chatgpt.md` | ☐ |
| 75 | perplexity | `geo-monitor/evidence/2026-08-baseline/6bfb8a-perplexity.md` | ☐ |
| 76 | gemini | `geo-monitor/evidence/2026-08-baseline/6bfb8a-gemini.md` | ☐ |
| 77 | ai_overview | `geo-monitor/evidence/2026-08-baseline/6bfb8a-ai_overview.md` | ☐ |

## EN 17/22 · `905aeb` · verify · spec_accuracy

```text
what is the maximum production speed of the JL-L-2TZP600
```

> verify-existing /faq/ and /products/hp-l-2tzp600-stand-up-zipper-pouch-machine — spec-accuracy probe; URL slug says HP-L while every on-page mention says JL-L

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 78 | chatgpt | `geo-monitor/evidence/2026-08-baseline/905aeb-chatgpt.md` | ☐ |
| 79 | perplexity | `geo-monitor/evidence/2026-08-baseline/905aeb-perplexity.md` | ☐ |
| 80 | gemini | `geo-monitor/evidence/2026-08-baseline/905aeb-gemini.md` | ☐ |
| 81 | ai_overview | `geo-monitor/evidence/2026-08-baseline/905aeb-ai_overview.md` | ☐ |

## EN 18/22 · `44db02` · gap · eddy_current_economics

```text
what is the payback period on an eddy current separator
```

> gap — vendor sources claim 6-18 month payback; verify independently before publishing any figure

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 86 | chatgpt | `geo-monitor/evidence/2026-08-baseline/44db02-chatgpt.md` | ☐ |
| 87 | perplexity | `geo-monitor/evidence/2026-08-baseline/44db02-perplexity.md` | ☐ |
| 88 | gemini | `geo-monitor/evidence/2026-08-baseline/44db02-gemini.md` | ☐ |
| 89 | ai_overview | `geo-monitor/evidence/2026-08-baseline/44db02-ai_overview.md` | ☐ |

## EN 19/22 · `212360` · verify · bag_formats

```text
3 side seal bag vs stand up zipper pouch which should I choose
```

> verify-existing /news/3-side-seal-vs-stand-up-zipper-pouch

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 90 | chatgpt | `geo-monitor/evidence/2026-08-baseline/212360-chatgpt.md` | ☐ |
| 91 | perplexity | `geo-monitor/evidence/2026-08-baseline/212360-perplexity.md` | ☐ |
| 92 | gemini | `geo-monitor/evidence/2026-08-baseline/212360-gemini.md` | ☐ |
| 93 | ai_overview | `geo-monitor/evidence/2026-08-baseline/212360-ai_overview.md` | ☐ |

## EN 20/22 · `0941c8` · verify · eddy_current_principle

```text
how does an eddy current separator work in plastic recycling
```

> verify-existing /news/eddy-current-separation-guide

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 94 | chatgpt | `geo-monitor/evidence/2026-08-baseline/0941c8-chatgpt.md` | ☐ |
| 95 | perplexity | `geo-monitor/evidence/2026-08-baseline/0941c8-perplexity.md` | ☐ |
| 96 | gemini | `geo-monitor/evidence/2026-08-baseline/0941c8-gemini.md` | ☐ |
| 97 | ai_overview | `geo-monitor/evidence/2026-08-baseline/0941c8-ai_overview.md` | ☐ |

## EN 21/22 · `b188fa` · verify · recyclable_packaging

```text
what is the difference between mono material PE pouches and laminated film
```

> verify-existing /news/mono-material-pe-vs-laminated-film-comparison

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 98 | chatgpt | `geo-monitor/evidence/2026-08-baseline/b188fa-chatgpt.md` | ☐ |
| 99 | perplexity | `geo-monitor/evidence/2026-08-baseline/b188fa-perplexity.md` | ☐ |
| 100 | gemini | `geo-monitor/evidence/2026-08-baseline/b188fa-gemini.md` | ☐ |
| 101 | ai_overview | `geo-monitor/evidence/2026-08-baseline/b188fa-ai_overview.md` | ☐ |

## EN 22/22 · `e66e40` · gap · fibc_operations

```text
how many workers does an FIBC bulk bag production line need
```

> gap — industry sources cite 10-20 people on stitching and QC; verify before publishing

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 102 | chatgpt | `geo-monitor/evidence/2026-08-baseline/e66e40-chatgpt.md` | ☐ |
| 103 | perplexity | `geo-monitor/evidence/2026-08-baseline/e66e40-perplexity.md` | ☐ |
| 104 | gemini | `geo-monitor/evidence/2026-08-baseline/e66e40-gemini.md` | ☐ |
| 105 | ai_overview | `geo-monitor/evidence/2026-08-baseline/e66e40-ai_overview.md` | ☐ |

---

# ES — 5 題 × 4 引擎 = 20 列

西語這一輪的引用資料是完全空白的，所以重點是取得基準，不是找缺口。查詢請用西語出口位置。

## ES 1/5 · `7bce5a` · verify · woven_bag_conversion_es

```text
cuál es la mejor máquina para imprimir cortar y coser sacos de polipropileno
```

> verify-existing /es/products/automatic-printing-tubing-cutting-sewing-line — first ES citation baseline

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 18 | chatgpt | `geo-monitor/evidence/2026-08-baseline/7bce5a-chatgpt.md` | ☐ |
| 19 | perplexity | `geo-monitor/evidence/2026-08-baseline/7bce5a-perplexity.md` | ☐ |
| 20 | gemini | `geo-monitor/evidence/2026-08-baseline/7bce5a-gemini.md` | ☐ |
| 21 | ai_overview | `geo-monitor/evidence/2026-08-baseline/7bce5a-ai_overview.md` | ☐ |

## ES 2/5 · `fd01c3` · gap · woven_bag_economics_es

```text
cuánto cuesta una línea completa de sacos de polipropileno tejido
```

> gap — mirrors the EN cost row; no ES content exists

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 22 | chatgpt | `geo-monitor/evidence/2026-08-baseline/fd01c3-chatgpt.md` | ☐ |
| 23 | perplexity | `geo-monitor/evidence/2026-08-baseline/fd01c3-perplexity.md` | ☐ |
| 24 | gemini | `geo-monitor/evidence/2026-08-baseline/fd01c3-gemini.md` | ☐ |
| 25 | ai_overview | `geo-monitor/evidence/2026-08-baseline/fd01c3-ai_overview.md` | ☐ |

## ES 3/5 · `189bfa` · verify · ai_inspection_es

```text
se puede añadir inspección con IA a una línea de sacos existente
```

> verify-existing /es/news/retrofit-edge-ai-inspection-woven-bag-line

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 58 | chatgpt | `geo-monitor/evidence/2026-08-baseline/189bfa-chatgpt.md` | ☐ |
| 59 | perplexity | `geo-monitor/evidence/2026-08-baseline/189bfa-perplexity.md` | ☐ |
| 60 | gemini | `geo-monitor/evidence/2026-08-baseline/189bfa-gemini.md` | ☐ |
| 61 | ai_overview | `geo-monitor/evidence/2026-08-baseline/189bfa-ai_overview.md` | ☐ |

## ES 4/5 · `030e35` · verify · bag_formats_es

```text
diferencia entre bolsa de tres sellos laterales y doypack con cierre
```

> verify-existing /es/news/3-side-seal-vs-stand-up-zipper-pouch

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 82 | chatgpt | `geo-monitor/evidence/2026-08-baseline/030e35-chatgpt.md` | ☐ |
| 83 | perplexity | `geo-monitor/evidence/2026-08-baseline/030e35-perplexity.md` | ☐ |
| 84 | gemini | `geo-monitor/evidence/2026-08-baseline/030e35-gemini.md` | ☐ |
| 85 | ai_overview | `geo-monitor/evidence/2026-08-baseline/030e35-ai_overview.md` | ☐ |

## ES 5/5 · `c74447` · verify · eddy_current_principle_es

```text
cómo funciona un separador de corrientes de Foucault en el reciclaje
```

> verify-existing /es/news/eddy-current-separation-guide

| CSV 列 | engine | 答案存檔位置 | 完成 |
| --- | --- | --- | --- |
| 106 | chatgpt | `geo-monitor/evidence/2026-08-baseline/c74447-chatgpt.md` | ☐ |
| 107 | perplexity | `geo-monitor/evidence/2026-08-baseline/c74447-perplexity.md` | ☐ |
| 108 | gemini | `geo-monitor/evidence/2026-08-baseline/c74447-gemini.md` | ☐ |
| 109 | ai_overview | `geo-monitor/evidence/2026-08-baseline/c74447-ai_overview.md` | ☐ |

---

共 108 列待填。存檔目錄需自行建立：`geo-monitor/evidence/2026-08-baseline/`

# AEO/GEO Audit — www.reylong.com

**Audited:** 2026-07-17 · **Pages crawled:** 30 · **Tool:** audit-website-aeo skill (16 deterministic checks + 6-dimension content evaluation)

## Score

| | Score | |
|---|---|---|
| Foundational (16 checks) | 87/100 | |
| Intelligence (6 dimensions) | 77/100 | |
| **Final** | **82/100** | **Grade: B+** |

The site is technically clean and unusually well-prepared editorially (diagnostic guides, FAQ blocks, direct-answer intros), but loses points on two easy foundational gaps (invalid llms.txt, no RSS) and on evidence attribution (no authors, few linked sources).

## Foundational Checks

| | Check | Detail |
|---|---|---|
| ✗ | llms.txt valid | File exists at /llms.txt but **contains no links** — fails the format AI crawlers expect (heading + markdown link list) |
| ✗ | RSS/Atom feed | No feed discoverable — AI systems use feeds to track fresh content |
| ✓ | Clear page title | 30/30 |
| ✓ | Meta description | 30/30 |
| ✓ | Canonical URL | 30/30 |
| ✓ | Single H1 | 30/30 |
| ✓ | Structured data (JSON-LD) | 30/30 |
| ✓ | Schema types recognized | 30/30 (Organization, NewsArticle, Product, FAQPage…) |
| ✓ | Open Graph basics | 30/30 |
| ✓ | Internal linking (5+) | 30/30 |
| ✓ | Image alt coverage | 30/30 |
| ✓ | Readable content depth | 27/30 (contact / case-studies / events listing pages thin — acceptable) |
| ✓ | Indexable | 30/30 |
| ✓ | AI-accessible meta tags | 30/30 — no nosnippet/noai |
| ✓ | Heading hierarchy | 27/30 |
| ✓ | AI bot access | robots.txt blocks none of the 9 major AI crawlers |

## Intelligence Evaluation

**Answer Readiness — 4/5 (80).** The two article pages reviewed lead with direct answers ("A 3-side seal bag is a flat format sealed on three edges…"), the news listing itself carries answer-style summaries with hard numbers, and the diagnostic guides ship visible FAQ blocks. Product and navigation pages remain promotional rather than question-answering — which is why the deterministic prior reads lower (53) across all 30 pages.
*Key finding: articles answer first; product pages don't.*

**Quotability — 4/5 (80).** "Key Differences at a Glance" comparison sections, clean spec lists (Materials / Typical uses / Machine speed / Cost), and self-contained 40–60-word passages throughout the reviewed articles. Comparison tables are the single highest-leverage citation format (2.8× citations) and they are present but not on every content type.
*Key finding: strong lists and tables on guides; extendable to products.*

**Evidence Density — 3/5 (60).** Numbers are everywhere (220 pcs/min, 60–150 bags/min, Sandia's 20–30% human miss rate, ~50 reference samples), and Sandia National Laboratories is cited by name. But **zero author attribution on any page**, no visible "last updated" stamps, and most statistics are not linked to their sources in-text (+115% visibility for lower-ranked sites when they are).
*Key finding: good numbers, weak attribution — no authors, few linked sources.*

**Content Depth — 4/5 (80).** 90% of pages meet the depth threshold; the diagnostic guides are genuine long-form references with multi-branch diagnosis trees and honest capability limits. Listing pages are thin by design.
*Key finding: guides are reference-grade; depth is a strength.*

**Freshness — 4/5 (80).** Articles dated within the last month (July 16, 2026), published dates in schema. But `dateModified` is empty everywhere, there is no visible "last updated" indicator, and no feed — 76% of ChatGPT's most-cited pages were updated within 30 days, so update signals matter.
*Key finding: content is fresh; the signals proving it are incomplete.*

**Structural Clarity — 4/5 (80).** Perfect single-H1 and clean H2/H3 hierarchy on 27/30 pages. One notable defect: the homepage carousel's inline script leaks JavaScript into extracted text (`{ const id = setInterval(...)`), which is exactly what an AI crawler sees first on the most-linked page of the site.
*Key finding: clean semantics; homepage leaks script text into extraction.*

Intelligence = (4+4+3+4+4+4)/6 × 20 = **77/100** (deterministic prior: 78 — consistent).

## Prioritized Fixes

1. **Fix llms.txt format** — file exists but has no links, so it fails outright. Rewrite as: H1 site name, one-line summary, then markdown link list of the ~20 highest-value URLs (guides, products, FAQ) with one-line descriptions. *High impact / Low effort — recovers 10 foundational points.*
2. **Add an RSS/Atom feed** — Astro ships `@astrojs/rss`; expose the news/guides table as `/rss.xml` and link it in `<head>`. AI systems use feeds for discovery and freshness tracking. *Medium impact / Low effort — recovers 8 points.*
3. **Add author + dateModified signals** — a byline block ("Reylong Engineering Team"), visible "Last updated" date on guides, and `dateModified` in NewsArticle/TechArticle schema. Currently 0% of pages have author attribution. *Medium impact / Low effort.*
4. **Link statistics to sources in-text** — the Sandia numbers and industry figures should carry `<a>` links to the primary source. In-text citations are worth +115% visibility for lower-ranked domains. *Medium impact / Low effort, editorial.*
5. **Stop the homepage script leak** — move the carousel interval logic out of inline attribute/script position so text extraction sees content, not code. *Low impact / Low effort.*
6. **Q&A-style sections on product pages** — product pages are spec-sheets; adding a short visible FAQ (already done for some) and definition-first intro per product would lift the weakest Answer-Readiness surface. *Medium impact / Medium effort.*

## Weakest Pages

| % | URL |
|---|---|
| 84% | /contact |
| 84% | /case-studies |
| 89% | /events |
| 95% | /es/products |

(All listing/utility pages — low priority.)

## Recommendation

The editorial strategy (diagnostic guides, direct answers, FAQ blocks, hedged real numbers) is already ahead of most industrial-machinery sites; the remaining losses are cheap technical fixes. Fixing llms.txt + RSS alone lifts the foundational score from 87 to ~100. Run the `improve-aeo-geo` skill against this report next — items 1, 2, 3 and 5 are code-level changes it can make directly in the Astro codebase.

---

# Re-audit after fixes — 2026-07-17 (same day)

Fixes shipped (commits `890c453`, `24d1160`): valid llms.txt, /rss.xml + site-wide discovery link, article bylines + visible "Updated" dates + `article:published_time/modified_time` + schema `dateModified` from the new `news.updated_at` column, sitemap lastmod from `updated_at`, carousel `x-init` rewritten without arrow functions (the `>` in the attribute leaked script text to naive parsers).

## Score after

| | Before | After |
|---|---|---|
| Foundational (16 checks) | 87/100 (14/16) | **100/100 (16/16)** |
| Intelligence (6 dimensions) | 77/100 | **83/100** |
| **Final** | **82 — B+** | **92 — A** |

Intelligence dimension changes, re-scored on the fresh crawl: **Freshness 4→5** (visible "Updated" stamps, modified-time meta, RSS — active maintenance now evident), **Structural Clarity 4→5** (homepage script leak eliminated; extraction is clean), Evidence Density stays 3 (author attribution added, but statistics still lack in-text source links), Answer Readiness 4, Quotability 4, Content Depth 4 unchanged. Deterministic prior agrees: 83/100.

## Remaining opportunities (editorial, not technical)

1. Link statistics to primary sources in-text (Sandia, industry figures) — worth +115% visibility for lower-ranked domains (KDD 2024)
2. Q&A-style sections / definition-first intros on product pages (Answer-Readiness prior is 52 because product and utility pages don't answer questions)
3. Consider a stable docs/knowledge section for product facts (the audit's only remaining prioritized fix)

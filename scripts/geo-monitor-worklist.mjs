// Turns a round CSV into a printable worklist for whoever runs the queries by hand.
//
//   node scripts/geo-monitor-worklist.mjs 2026-08-baseline
//
// The engines cannot be queried programmatically in any way that reflects what a
// real buyer sees: an anonymous or automated session gets a degraded answer, and
// driving a logged-in consumer account breaks the terms of the services. So the
// 108 queries are done by a person, and the job here is to make that person's
// pass fast and consistent rather than to pretend it can be automated.
//
// The worklist is derived output — it holds nothing that was typed by hand, so
// unlike a round CSV it can be regenerated freely and needs no overwrite guard.
// Results are never recorded here; they go back into the round CSV, which is the
// only file the summary reads.
//
// Prompt context (which page a `verify` row is checking) comes from prompts.csv,
// joined on the prompt_id hash rather than on row position, for the same reason
// the id is a hash in the first place.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertConsistentColumnCount, parseCsv } from './lib/csv.mjs'
import { ENGINES, createPromptId, validateHeader } from './lib/geo-monitor-schema.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const round = args.find(arg => !arg.startsWith('--'))
const option = name => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a path`)
  return args[index + 1]
}

if (!round) {
  throw new Error('usage: node scripts/geo-monitor-worklist.mjs <round> [--input <path>] [--prompts <path>] [--output <path>]')
}

const inputPath = resolve(option('--input') ?? `${root}geo-monitor/${round}.csv`)
const promptsPath = resolve(option('--prompts') ?? `${root}prompts.csv`)
const out = resolve(option('--output') ?? `${root}geo-monitor/${round}-worklist.md`)

const rows = assertConsistentColumnCount(parseCsv(readFileSync(inputPath, 'utf8')), inputPath)
const header = rows[0]
validateHeader(header)
const records = rows.slice(1).map((row, index) => ({
  ...Object.fromEntries(header.map((column, columnIndex) => [column, row[columnIndex].trim()])),
  csvRow: index + 2, // 1-based, +1 for the header — this is the line to edit
}))

// prompts.csv is optional context: a worklist is still usable without it.
let context = new Map()
try {
  const promptRows = assertConsistentColumnCount(parseCsv(readFileSync(promptsPath, 'utf8')), promptsPath)
  const promptHeader = promptRows[0]
  const promptColumn = promptHeader.indexOf('prompt')
  const notesColumn = promptHeader.indexOf('notes')
  if (promptColumn !== -1 && notesColumn !== -1) {
    context = new Map(promptRows.slice(1).map(row => [createPromptId(row[promptColumn]), row[notesColumn]]))
  }
} catch {
  // Missing or unreadable prompts.csv only costs the per-prompt note line.
}

// One block per prompt, in CSV order, so the worklist and the file being edited
// scroll together. Grouping by prompt is deliberate: asking the same question
// four times in a row is far less error-prone than four passes of the full list.
const byPrompt = new Map()
for (const record of records) {
  if (!byPrompt.has(record.prompt_id)) byPrompt.set(record.prompt_id, [])
  byPrompt.get(record.prompt_id).push(record)
}

const evidenceFor = record => `geo-monitor/evidence/${round}/${record.prompt_id}-${record.engine}.md`

const lines = []
const push = (...text) => lines.push(...text)

push(`# GEO 引用量測工作單 — ${round}`, '')
push(`由 \`${relative(root, inputPath) || inputPath}\` 產生。**這份是導覽，不是紀錄簿——結果一律填回該 CSV。**`, '')

push('## 開跑前先定，定了整輪不能改', '')
push('- **出口地理位置**：`____________`（引擎會按 IP 在地化；台灣看到的答案不等於美國買家看到的。第一輪定什麼，往後每輪都要一樣，否則跨月差異會來自量測方式而非內容）')
push('- **帳號狀態**：`____________`（登入 / 未登入。未登入的 Perplexity 會回降級答案，實測過）')
push('- **日期**：每列的 `run_date` 填實際查詢當天，格式 `YYYY-MM-DD`。留空 = 尚未測試')
push('')

push('## 填答規則', '')
push('| 欄位 | 可填值 | 說明 |')
push('| --- | --- | --- |')
push('| `brand_mentioned` | `yes` / `no` | 答案正文任何地方出現 Reylong |')
push('| `reylong_link_cited` | `yes` / `no` | 引用清單裡有 reylong.com 的網址 |')
push('| `cited_url_count` | 整數 | 被引用的不重複 reylong.com 網址數，沒有就填 `0` |')
push('| `cited_urls` | 用 `\\|` 分隔 | 實際被引用的網址 |')
push('| `brand_correct` | `correct` / `incorrect` / `not_stated` | |')
push('| `model_correct` | `correct` / `incorrect` / `not_stated` | |')
push('| `specs_correct` | `correct` / `incorrect` / `not_stated` | |')
push('| `hp_l_hallucinated` | `yes` / `no` / `na` | 答案完全沒提到任何型號時填 `na` |')
push('')
push('**最容易填錯的一件事**：引擎根本沒提到 Reylong 時，正確性三欄要填 `not_stated`，**不是** `incorrect`。沒被提到不等於答錯，混用會讓這輪 baseline 跟往後每一輪都對不起來。')
push('')
push('填完跑 `node scripts/geo-monitor-summary.mjs ' + round + '` 出報表；enum 填錯它會拒絕出報表並指出列號。')
push('')

const langLabel = { en: 'EN', es: 'ES' }
for (const lang of ['en', 'es']) {
  const prompts = [...byPrompt.values()].filter(group => group[0].lang === lang)
  if (!prompts.length) continue

  push('---', '')
  push(`# ${langLabel[lang]} — ${prompts.length} 題 × ${ENGINES.length} 引擎 = ${prompts.length * ENGINES.length} 列`, '')
  if (lang === 'es') {
    push('西語這一輪的引用資料是完全空白的，所以重點是取得基準，不是找缺口。查詢請用西語出口位置。', '')
  }

  prompts.forEach((group, index) => {
    const first = group[0]
    const note = context.get(first.prompt_id)
    push(`## ${langLabel[lang]} ${index + 1}/${prompts.length} · \`${first.prompt_id}\` · ${first.track} · ${first.cluster}`, '')
    push('```text')
    push(first.prompt)
    push('```')
    if (note) push('', `> ${note}`)
    push('')
    push('| CSV 列 | engine | 答案存檔位置 | 完成 |')
    push('| --- | --- | --- | --- |')
    for (const engine of ENGINES) {
      const record = group.find(item => item.engine === engine)
      if (!record) continue
      push(`| ${record.csvRow} | ${engine} | \`${evidenceFor(record)}\` | ☐ |`)
    }
    push('')
  })
}

push('---', '')
push(`共 ${records.length} 列待填。存檔目錄需自行建立：\`geo-monitor/evidence/${round}/\``)
push('')

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, lines.join('\n'), 'utf8')

console.log(relative(root, out) || out)
console.log(`  ${byPrompt.size} prompts / ${records.length} rows`)

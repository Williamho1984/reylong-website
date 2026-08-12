// Measures how much an engine's answer moves when nothing about the site changed.
//
//   node scripts/geo-monitor-noise.mjs --init 2026-08          # emit the blank sheet
//   node scripts/geo-monitor-noise.mjs 2026-08                 # read it back
//
// Why this runs before the 108-query baseline: each cell of a monitoring round is
// a single sample from a non-deterministic system. If the same question asked five
// times in a row returns five different source lists, then a cell flipping between
// rounds is noise, not progress, and the whole programme has to be read in
// aggregate — or not monthly. Fifteen queries settle that before ninety-three more
// get spent on the assumption.
//
// The sheet records the FULL list of cited domains, not just reylong.com. Today the
// site is probably cited zero times, so a reylong-only record would read as five
// identical empty sets — perfectly stable, and completely uninformative. The
// quantity that matters is how much the whole slate of sources churns, because that
// is the volatility Reylong's own appearances will be subject to once they start.
//
// All five runs of a prompt must be done in one sitting, same engine, same session,
// same country. Anything else and the thing being measured is the change in method.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, quoteCsv, assertConsistentColumnCount } from './lib/csv.mjs'
import { createPromptId } from './lib/geo-monitor-schema.mjs'

const RUNS = 5

// Deliberately not a random sample: a branded lookup (narrowest retrieval, should be
// the most stable thing there is), a competitive supplier shortlist (the widest and
// most contested), and a definitional question in between. Five runs of three
// brackets tells you the best and worst case; five runs of three similar prompts
// would only tell you about the middle.
const PROMPTS = [
  { prompt: 'does rey long have CE certification for its machines', kind: 'branded' },
  { prompt: 'what is the best machine for pp woven bag printing cutting and sewing', kind: 'shortlist' },
  { prompt: 'how does an eddy current separator work in plastic recycling', kind: 'definition' },
]

const COLUMNS = ['label', 'kind', 'prompt_id', 'run', 'engine', 'prompt', 'brand_mentioned', 'reylong_cited', 'all_cited_domains', 'notes']

const args = process.argv.slice(2)
const init = args.includes('--init')
const label = args.find(arg => !arg.startsWith('--'))
const option = name => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a value`)
  return args[index + 1]
}
if (!label) throw new Error('usage: node scripts/geo-monitor-noise.mjs [--init] <label> [--engine <name>] [--output <path>]')

const root = fileURLToPath(new URL('..', import.meta.url))
const out = resolve(option('--output') ?? `${root}geo-monitor/noise-${label}.csv`)

if (init) {
  if (existsSync(out)) {
    console.error(`refusing to overwrite existing file: ${out}\npass a new label, or delete it first`)
    process.exit(1)
  }
  const engine = option('--engine') ?? 'perplexity'
  const lines = [COLUMNS.join(',')]
  for (const entry of PROMPTS) {
    for (let run = 1; run <= RUNS; run++) {
      lines.push([label, entry.kind, createPromptId(entry.prompt), run, engine, entry.prompt, '', '', '', '']
        .map(quoteCsv).join(','))
    }
  }
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${lines.join('\n')}\n`, 'utf8')

  console.log(relative(root, out) || out)
  console.log(`  ${PROMPTS.length} prompts x ${RUNS} runs = ${PROMPTS.length * RUNS} queries on ${engine}`)
  console.log('')
  console.log('  跑法（偏離任何一條，量到的就是方法本身的變化，不是引擎的雜訊）：')
  console.log('   1. 同一個引擎、同一個 session、同一個出口位置，一次做完')
  console.log('   2. 每次都開新對話，不要在同一串裡追問 — 上下文會讓後面幾次互相污染')
  console.log('   3. brand_mentioned / reylong_cited 填 yes 或 no')
  console.log('   4. all_cited_domains 填「整份來源清單」的網域，用 | 分隔，只記網域不記完整網址')
  console.log('        例：alibaba.com|made-in-china.com|wikipedia.org')
  console.log('   5. 五次之間不要修改題目一個字')
  process.exit(0)
}

const rows = assertConsistentColumnCount(parseCsv(readFileSync(out, 'utf8')), out)
const header = rows[0]
const records = rows.slice(1).map(row => Object.fromEntries(header.map((column, i) => [column, row[i].trim()])))
const filled = records.filter(record => record.all_cited_domains || record.brand_mentioned)

if (!filled.length) {
  console.error(`${relative(root, out) || out} 還沒有任何結果。先跑完 ${records.length} 次查詢再回來。`)
  process.exit(1)
}

const domainsOf = record => new Set(record.all_cited_domains.split('|').map(part => part.trim()).filter(Boolean))
const jaccard = (a, b) => {
  const union = new Set([...a, ...b])
  if (!union.size) return 1
  return [...a].filter(value => b.has(value)).length / union.size
}

const groups = new Map()
for (const record of filled) {
  if (!groups.has(record.prompt_id)) groups.set(record.prompt_id, [])
  groups.get(record.prompt_id).push(record)
}

console.log(`雜訊測試 ${label}\n`)
const similarities = []
let anyBrandFlip = false

for (const [promptId, group] of groups) {
  const sets = group.map(domainsOf)
  // With no source lists recorded there is nothing to compare, and every pair of
  // empty sets scores a perfect 1.00 — a stability figure invented out of missing
  // data, which is worse than reporting none at all.
  const hasDomains = sets.some(set => set.size > 0)
  const pairs = []
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) pairs.push(jaccard(sets[i], sets[j]))
  }
  const mean = pairs.length ? pairs.reduce((sum, value) => sum + value, 0) / pairs.length : 1
  if (hasDomains) similarities.push(mean)

  const mentioned = group.filter(record => record.brand_mentioned === 'yes').length
  const cited = group.filter(record => record.reylong_cited === 'yes').length
  // A prompt that answers the same way every time is not a flip, whichever way it went.
  const flipped = mentioned !== 0 && mentioned !== group.length
  if (flipped) anyBrandFlip = true

  const everywhere = [...(sets[0] ?? [])].filter(domain => sets.every(set => set.has(domain)))
  const counts = new Map()
  for (const set of sets) for (const domain of set) counts.set(domain, (counts.get(domain) ?? 0) + 1)
  const once = [...counts.values()].filter(value => value === 1).length

  // How many runs agreed on the single most common source list. Counting only the
  // number of distinct lists would hide the shape: 3 distinct lists across 5 runs is
  // a very different result if it is 3+1+1 rather than 2+2+1.
  const shapes = new Map()
  for (const set of sets) {
    const signature = [...set].sort().join('|')
    shapes.set(signature, (shapes.get(signature) ?? 0) + 1)
  }
  const agreed = Math.max(...shapes.values())

  console.log(`${group[0].kind}  \`${promptId}\`  ${group.length} 次`)
  console.log(`  Reylong 被提到      ${mentioned}/${group.length}${flipped ? '   ← 同一題答案會翻面' : ''}`)
  console.log(`  Reylong 被引用      ${cited}/${group.length}`)
  if (hasDomains) {
    console.log(`  最多幾次同一份清單  ${agreed}/${group.length}（共出現 ${shapes.size} 種不同的來源組合）`)
    console.log(`  每次都出現的網域    ${everywhere.length} 個`)
    console.log(`  只出現過一次的網域  ${once} 個`)
    console.log(`  兩兩相似度平均      ${mean.toFixed(2)}`)
  } else {
    console.log('  來源清單未記錄      無法計算 churn（all_cited_domains 全空）')
  }
  console.log('')
}

const overall = similarities.length
  ? similarities.reduce((sum, value) => sum + value, 0) / similarities.length
  : null
if (overall === null) {
  console.log('整體來源穩定度  無法計算（沒有任何一題記錄了來源清單）\n')
} else {
  console.log(`整體來源穩定度  ${overall.toFixed(2)}（1.00 = 每次都一模一樣，0.00 = 每次完全不同）\n`)
}

// Thresholds are judgement calls for reading this instrument, not established
// statistics — three prompts at five runs cannot support an inference test. They
// exist so the decision is made against the data instead of against a hunch.
if (anyBrandFlip) {
  console.log('判讀：同一題在沒有任何內容變動的情況下就會翻面。')
  console.log('  → 單格（一題一引擎）的月度變化不可解讀，只能看 27 題聚合')
  console.log('  → 手動輪次改季度；月度跑不出高於雜訊的訊號，不值得那個人工')
} else if (overall === null) {
  console.log('判讀：品牌出現與否在各題內都一致，但沒有來源清單可判斷 churn 程度。')
  console.log('  → 補記 all_cited_domains 後再跑一次才能決定頻率')
} else if (overall >= 0.8) {
  console.log('判讀：來源清單相當穩定。')
  console.log('  → 單格變化有一定參考價值，月度頻率說得過去')
  console.log('  → 仍然只用聚合數字下結論，單格拿來當線索去看原始答案')
} else if (overall >= 0.5) {
  console.log('判讀：來源清單中度浮動。')
  console.log('  → 聚合數字要變動 3 次以上才值得解讀，1-2 次的差異視為雜訊')
  console.log('  → 手動輪次建議季度，月度的訊噪比不划算')
} else {
  console.log('判讀：來源清單大幅churn，引擎每次抓的來源都不一樣。')
  console.log('  → 單次取樣沒有意義；要嘛同題重複問取多數決，要嘛放棄這個量測面')
  console.log('  → 把力氣移到爬蟲抓取紀錄與 AI 推薦流量這兩個確定性資料源')
}
console.log('\n（本測試只涵蓋一個引擎。其他引擎可能更穩或更亂 —— 一個引擎的高雜訊足以否定單格解讀，')
console.log('  但一個引擎穩定不能推論其他三個也穩定。）')

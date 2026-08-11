// Summarises a monitoring round as absolute counts.
//
//   node scripts/geo-monitor-summary.mjs 2026-08-baseline
//
// No percentages anywhere: there is no denominator for "citation rate" — the engines
// expose no ranking or share data, so any percentage here would be an invented number.
//
// English and Spanish are reported as separate blocks and never summed. They are
// different markets with different corpora; one combined figure would hide whichever
// is doing worse — and ES starts from zero citation data, so it would be the one hidden.
//
// A typo in an enum silently miscounts, so an invalid value refuses to report at all
// (exit 1) rather than quietly producing a wrong number. Column meanings and the legal
// values live in scripts/lib/geo-monitor-schema.mjs.
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertConsistentColumnCount, parseCsv } from './lib/csv.mjs'
import { ENGINES, ENUMS, validateHeader, validateRecord } from './lib/geo-monitor-schema.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const round = args.find(arg => !arg.startsWith('--'))
const inputIndex = args.indexOf('--input')
const input = inputIndex === -1 ? undefined : args[inputIndex + 1]
if (!round) {
  const found = readdirSync(`${root}geo-monitor`).filter(file => file.endsWith('.csv'))
  throw new Error(`usage: node scripts/geo-monitor-summary.mjs <round> [--input <path>]\navailable: ${found.join(' ')}`)
}
if (inputIndex !== -1 && (!input || input.startsWith('--'))) throw new Error('--input requires a path')

const inputPath = resolve(input ?? `${root}geo-monitor/${round}.csv`)
const rows = assertConsistentColumnCount(parseCsv(readFileSync(inputPath, 'utf8')), inputPath)
const header = rows[0]
validateHeader(header)
const records = rows.slice(1).map((row, index) => {
  const record = Object.fromEntries(header.map((column, columnIndex) => [column, row[columnIndex].trim()]))
  try {
    return validateRecord(record, index + 2)
  } catch (error) {
    throw new Error(`invalid values in ${inputPath}:\n${error.message}`)
  }
})

const count = (recordsToCount, predicate) => recordsToCount.filter(predicate).length
const tested = recordsToCount => count(recordsToCount, record => record.run_date)
const appeared = recordsToCount => count(recordsToCount, record => record.brand_mentioned === 'yes')
const cited = recordsToCount => count(recordsToCount, record => record.reylong_link_cited === 'yes')
const urls = recordsToCount => recordsToCount.reduce((sum, record) => sum + (parseInt(record.cited_url_count, 10) || 0), 0)
const line = (label, recordsToCount, width = 22) =>
  `    ${label.padEnd(width)}引用 ${String(cited(recordsToCount)).padStart(3)} 次 / 出現 ${String(appeared(recordsToCount)).padStart(3)} 次 / 測試 ${String(tested(recordsToCount)).padStart(3)} 次`

function block(lang, languageRecords) {
  const prompts = new Set(languageRecords.map(record => record.prompt_id)).size
  console.log(`\n${lang.toUpperCase()} — ${prompts} prompts x ${ENGINES.length} engines = ${languageRecords.length} rows`)
  if (!tested(languageRecords)) {
    console.log('    尚未測試（run_date 全空）')
    return
  }
  console.log(line('全部', languageRecords))
  console.log(`    引用到的 Reylong URL 次數合計  ${urls(languageRecords)}`)
  console.log('\n    依引擎')
  for (const engine of ENGINES) console.log(line(engine, languageRecords.filter(record => record.engine === engine), 18))
  console.log('\n    依 track')
  for (const track of ENUMS.track) {
    console.log(line(track === 'verify' ? 'verify（既有內容）' : 'gap（尚未覆蓋）', languageRecords.filter(record => record.track === track), 18))
  }
  console.log('\n    正確性（只計有明確說法的列）')
  for (const column of ['brand_correct', 'model_correct', 'specs_correct']) {
    const correct = count(languageRecords, record => record[column] === 'correct')
    const incorrect = count(languageRecords, record => record[column] === 'incorrect')
    const notStated = count(languageRecords, record => record[column] === 'not_stated')
    console.log(`      ${column.replace('_correct', '').padEnd(8)}正確 ${String(correct).padStart(3)} / 錯誤 ${String(incorrect).padStart(3)} / 未提及 ${String(notStated).padStart(3)}`)
  }
  console.log(`\n    HP-L-2TZP600 型號誤判  ${count(languageRecords, record => record.hp_l_hallucinated === 'yes')} 次`)
}

console.log(`round: ${round}`)
for (const lang of ENUMS.lang) {
  const languageRecords = records.filter(record => record.lang === lang)
  if (languageRecords.length) block(lang, languageRecords)
}
console.log('\n(絕對計數，不計百分比；英語與西語分開呈現，不合併)')

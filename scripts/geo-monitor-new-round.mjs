// Emits a blank monitoring round: every prompt in prompts.csv crossed with every
// engine, pre-filled so a tester only ever types results — never prompt text.
// Retyping prompts by hand is how rounds stop being comparable.
//
//   node scripts/geo-monitor-new-round.mjs 2026-09
//   node scripts/geo-monitor-new-round.mjs 2026-09 --dry-run
//   node scripts/geo-monitor-new-round.mjs 2026-09 --force
//
// Column meanings and why the enums look the way they do: scripts/lib/geo-monitor-schema.mjs
//
// Writing is guarded because a round CSV is hand-filled over weeks: re-running this
// against an existing file would silently discard a month of manual testing. An
// existing target is refused outright; --force has to be typed on purpose.
//
// --prompts / --output exist so the tests can drive the real CLI against fixtures
// in a temp directory instead of touching prompts.csv or geo-monitor/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertConsistentColumnCount, parseCsv, quoteCsv } from './lib/csv.mjs'
import { COLUMNS, ENGINES, createPromptId, deriveLang, deriveTrack } from './lib/geo-monitor-schema.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const round = args.find(arg => !arg.startsWith('--'))
const option = name => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a path`)
  return args[index + 1]
}
const dryRun = args.includes('--dry-run')
const force = args.includes('--force')

if (!round || !/^\d{4}-\d{2}(-[a-z0-9-]+)?$/.test(round)) {
  throw new Error('usage: node scripts/geo-monitor-new-round.mjs <YYYY-MM[-label]> [--dry-run] [--force] [--prompts <path>] [--output <path>]')
}

const promptsPath = resolve(option('--prompts') ?? `${root}prompts.csv`)
const out = resolve(option('--output') ?? `${root}geo-monitor/${round}.csv`)
const rows = assertConsistentColumnCount(parseCsv(readFileSync(promptsPath, 'utf8')), promptsPath)
const header = rows[0]
const at = name => {
  const index = header.indexOf(name)
  if (index === -1) throw new Error(`${promptsPath}: missing required column "${name}"`)
  return index
}
const promptColumn = at('prompt')
const clusterColumn = at('cluster')
const notesColumn = at('notes')
const seenPrompts = new Map()

const prompts = rows.slice(1).map((row, index) => {
  const rowNumber = index + 2
  const prompt = row[promptColumn]
  const normalized = prompt.toLowerCase().trim()
  if (!normalized) throw new Error(`${promptsPath}: row ${rowNumber} has an empty prompt`)
  if (seenPrompts.has(normalized)) {
    throw new Error(`${promptsPath}: duplicate prompt at rows ${seenPrompts.get(normalized)} and ${rowNumber}`)
  }
  seenPrompts.set(normalized, rowNumber)

  const notes = row[notesColumn]
  let track
  try {
    track = deriveTrack(notes)
  } catch (error) {
    throw new Error(`${promptsPath}: row ${rowNumber}: ${error.message}`)
  }
  const cluster = row[clusterColumn]
  return { id: createPromptId(prompt), prompt, cluster, lang: deriveLang(cluster), track }
})

const ids = new Map()
for (const [index, prompt] of prompts.entries()) {
  if (ids.has(prompt.id)) {
    throw new Error(`prompt_id collision at rows ${ids.get(prompt.id)} and ${index + 2} — widen the hash slice`)
  }
  ids.set(prompt.id, index + 2)
}

// Grouped by prompt, not by engine: asking the same question four times in a row
// is far less error-prone than working through four full passes of the list.
const lines = [COLUMNS.join(',')]
for (const prompt of prompts) {
  for (const engine of ENGINES) {
    lines.push([
      round, '', engine, prompt.id, prompt.lang, prompt.track, prompt.cluster, prompt.prompt,
      '', '', '', '', '', '', '', '', '', '',
    ].map(quoteCsv).join(','))
  }
}

if (!dryRun) {
  if (existsSync(out) && !force) {
    console.error(`refusing to overwrite existing file: ${out}\npass --force to overwrite it`)
    process.exit(1)
  }
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${lines.join('\n')}\n`, 'utf8')
}

const es = prompts.filter(prompt => prompt.lang === 'es').length
const displayPath = relative(root, out) || out
console.log(`${dryRun ? '[dry-run] ' : ''}${displayPath}`)
console.log(`  ${prompts.length} prompts x ${ENGINES.length} engines = ${lines.length - 1} rows`)
console.log(`  en ${prompts.length - es} / es ${es}`)
console.log(`  verify ${prompts.filter(prompt => prompt.track === 'verify').length} / gap ${prompts.filter(prompt => prompt.track === 'gap').length}`)

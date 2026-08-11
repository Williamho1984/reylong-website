// The single source of truth for the monitoring round schema — both CLIs import
// from here so the column list and the enums can never drift apart.
//
// Column contract — the enums are the whole point; free text in these columns
// means the summary cannot count anything:
//
//   run_month          round label, pre-filled
//   run_date           YYYY-MM-DD the query was actually run — blank = not yet tested
//   engine             chatgpt | perplexity | gemini | ai_overview
//   prompt_id          stable 6-char hash of the prompt
//   lang               en | es — reported separately, never merged
//   track              verify | gap
//   cluster            from prompts.csv
//   prompt             the exact string to paste into the engine
//   brand_mentioned    yes | no — Reylong named anywhere in the answer body
//   reylong_link_cited yes | no — a reylong.com URL appears in the citations
//   cited_url_count    integer — how many distinct reylong.com URLs were cited (0 if none)
//   cited_urls         pipe-separated reylong.com URLs
//   brand_correct      correct | incorrect | not_stated
//   model_correct      correct | incorrect | not_stated
//   specs_correct      correct | incorrect | not_stated
//   hp_l_hallucinated  yes | no | na — na when the answer names no model at all
//   evidence_path      relative path to the saved answer or screenshot
//   notes              free text
//
// `not_stated` and `na` are load-bearing, not filler: without them an engine that
// never mentions Reylong gets recorded as having answered *wrongly*. That single
// ambiguity is enough to make the first round inconsistent, and a baseline nobody
// filled in the same way cannot support any before/after comparison. Do not
// "simplify" them away.
//
// An empty string is legal in every result column because a blank round is the
// normal starting state — a row is untested until run_date is filled in.
import { createHash } from 'node:crypto'

export const ENGINES = Object.freeze(['chatgpt', 'perplexity', 'gemini', 'ai_overview'])

export const COLUMNS = Object.freeze([
  'run_month', 'run_date', 'engine', 'prompt_id', 'lang', 'track', 'cluster', 'prompt',
  'brand_mentioned', 'reylong_link_cited', 'cited_url_count', 'cited_urls',
  'brand_correct', 'model_correct', 'specs_correct', 'hp_l_hallucinated',
  'evidence_path', 'notes',
])

export const ENUMS = Object.freeze({
  engine: ENGINES,
  lang: Object.freeze(['en', 'es']),
  track: Object.freeze(['verify', 'gap']),
  brand_mentioned: Object.freeze(['yes', 'no', '']),
  reylong_link_cited: Object.freeze(['yes', 'no', '']),
  brand_correct: Object.freeze(['correct', 'incorrect', 'not_stated', '']),
  model_correct: Object.freeze(['correct', 'incorrect', 'not_stated', '']),
  specs_correct: Object.freeze(['correct', 'incorrect', 'not_stated', '']),
  hp_l_hallucinated: Object.freeze(['yes', 'no', 'na', '']),
})

// A hash of the prompt text, deliberately not a row number: reordering prompts.csv
// or inserting a question in the middle must not break joins against earlier rounds.
export function createPromptId(prompt) {
  return createHash('sha1').update(prompt.toLowerCase().trim()).digest('hex').slice(0, 6)
}

// lang and track are derived from prompts.csv conventions rather than stored twice.
// Note the asymmetry: an unrecognised `notes` prefix throws (see deriveTrack), but a
// cluster without the `_es` suffix simply reads as English — a mistyped Spanish
// cluster name lands silently in the EN block. Rename ES clusters with care.
export function deriveLang(cluster) {
  return cluster.endsWith('_es') ? 'es' : 'en'
}

export function deriveTrack(notes) {
  if (notes.startsWith('verify-existing')) return 'verify'
  if (notes.startsWith('gap')) return 'gap'
  throw new Error('notes must start with "verify-existing" or "gap"')
}

export function validateHeader(header) {
  if (header.length !== COLUMNS.length || header.some((column, i) => column !== COLUMNS[i])) {
    throw new Error(`invalid geo-monitor header; expected: ${COLUMNS.join(',')}`)
  }
}

export function validateRecord(record, rowNumber) {
  const errors = []
  for (const [column, allowed] of Object.entries(ENUMS)) {
    if (record[column] === undefined || !allowed.includes(record[column])) {
      errors.push(`  row ${rowNumber}  ${column}="${record[column]}"  allowed: ${allowed.filter(Boolean).join(' | ')}`)
    }
  }
  if (record.cited_url_count === undefined || (record.cited_url_count !== '' && !/^\d+$/.test(record.cited_url_count))) {
    errors.push(`  row ${rowNumber}  cited_url_count="${record.cited_url_count}"  must be an integer`)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return record
}

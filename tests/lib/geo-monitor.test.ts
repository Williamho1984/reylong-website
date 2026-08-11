import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { assertConsistentColumnCount, parseCsv, quoteCsv } from '../../scripts/lib/csv.mjs'
import {
  COLUMNS,
  createPromptId,
  deriveLang,
  deriveTrack,
  validateRecord,
} from '../../scripts/lib/geo-monitor-schema.mjs'

const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const newRoundScript = join(repo, 'scripts/geo-monitor-new-round.mjs')
const summaryScript = join(repo, 'scripts/geo-monitor-summary.mjs')
const worklistScript = join(repo, 'scripts/geo-monitor-worklist.mjs')
let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'geo-monitor-test-'))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

function validRecord(overrides: Record<string, string> = {}) {
  return {
    run_month: '2099-01-test', run_date: '2099-01-02', engine: 'chatgpt',
    prompt_id: 'abc123', lang: 'en', track: 'verify', cluster: 'machine', prompt: 'Question?',
    brand_mentioned: 'yes', reylong_link_cited: 'yes', cited_url_count: '1',
    cited_urls: 'https://www.reylong.com/example', brand_correct: 'correct',
    model_correct: 'not_stated', specs_correct: 'correct', hp_l_hallucinated: 'na',
    evidence_path: 'evidence.txt', notes: '', ...overrides,
  }
}

function writePrompts(path: string) {
  writeFileSync(path, [
    'prompt,cluster,notes',
    'English question,machines,verify-existing source',
    'Spanish question,machines_es,gap opportunity',
  ].join('\n') + '\n')
}

function run(script: string, args: string[]) {
  return spawnSync(process.execPath, [script, ...args], { cwd: tempDir, encoding: 'utf8' })
}

describe('geo-monitor schema', () => {
  it('accepts legal enums including not_stated and na', () => {
    expect(() => validateRecord(validRecord(), 2)).not.toThrow()
  })

  it('rejects illegal enum values and non-integer cited_url_count', () => {
    expect(() => validateRecord(validRecord({ brand_correct: 'unknown' }), 7))
      .toThrow(/row 7.*brand_correct="unknown"/)
    expect(() => validateRecord(validRecord({ cited_url_count: '1.5' }), 8))
      .toThrow(/row 8.*cited_url_count="1\.5".*integer/)
  })

  it('creates the same stable prompt_id after trimming and case folding', () => {
    const expected = createPromptId('Which machine?')
    expect(createPromptId('  WHICH MACHINE?  ')).toBe(expected)
    expect(expected).toMatch(/^[a-f0-9]{6}$/)
  })

  it('derives lang and track from the documented prompt fields', () => {
    expect(deriveLang('printing_es')).toBe('es')
    expect(deriveLang('printing')).toBe('en')
    expect(deriveTrack('verify-existing article')).toBe('verify')
    expect(deriveTrack('gap missing page')).toBe('gap')
    expect(() => deriveTrack('other')).toThrow(/verify-existing.*gap/)
  })
})

describe('CSV validation', () => {
  it('throws with the row number when a row has the wrong column count', () => {
    const rows = parseCsv('a,b\n1,2\n3\n')
    expect(() => assertConsistentColumnCount(rows, 'fixture.csv'))
      .toThrow('fixture.csv: row 3 has 1 columns; expected 2')
  })
})

describe('geo-monitor new round CLI', () => {
  it('--dry-run prints statistics and writes no file', () => {
    const prompts = join(tempDir, 'prompts.csv')
    const output = join(tempDir, 'dry-run.csv')
    writePrompts(prompts)
    const result = run(newRoundScript, ['2099-01-dry-run', '--prompts', prompts, '--output', output, '--dry-run'])
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('[dry-run]')
    expect(result.stdout).toContain('2 prompts x 4 engines = 8 rows')
    expect(() => readFileSync(output)).toThrow()
  })

  it('refuses an existing target unless --force is explicit', () => {
    const prompts = join(tempDir, 'prompts.csv')
    const output = join(tempDir, 'round.csv')
    writePrompts(prompts)
    writeFileSync(output, 'DO NOT OVERWRITE\n')

    const refused = run(newRoundScript, ['2099-01-protection', '--prompts', prompts, '--output', output])
    expect(refused.status).toBe(1)
    expect(refused.stderr).toContain('refusing to overwrite existing file')
    expect(readFileSync(output, 'utf8')).toBe('DO NOT OVERWRITE\n')

    const forced = run(newRoundScript, ['2099-01-protection', '--prompts', prompts, '--output', output, '--force'])
    expect(forced.status).toBe(0)
    expect(readFileSync(output, 'utf8')).toMatch(/^run_month,run_date,engine,/)
  })
})

describe('geo-monitor worklist CLI', () => {
  function buildRound() {
    const prompts = join(tempDir, 'prompts.csv')
    const round = join(tempDir, 'round.csv')
    writePrompts(prompts)
    const created = run(newRoundScript, ['2099-01-worklist', '--prompts', prompts, '--output', round])
    expect(created.status).toBe(0)
    return { prompts, round }
  }

  it('points at the real CSV line numbers, grouped four engines per prompt', () => {
    const { prompts, round } = buildRound()
    const output = join(tempDir, 'worklist.md')
    const result = run(worklistScript, ['2099-01-worklist', '--input', round, '--prompts', prompts, '--output', output])
    expect(result.status).toBe(0)

    const worklist = readFileSync(output, 'utf8')
    const cited = [...worklist.matchAll(/^\| (\d+) \| (\w+) \|/gm)].map(match => [Number(match[1]), match[2]])
    // Two prompts x four engines, occupying CSV lines 2..9 in engine order.
    expect(cited).toEqual([
      [2, 'chatgpt'], [3, 'perplexity'], [4, 'gemini'], [5, 'ai_overview'],
      [6, 'chatgpt'], [7, 'perplexity'], [8, 'gemini'], [9, 'ai_overview'],
    ])

    // A row number is only useful if it really is the line to edit.
    const csv = readFileSync(round, 'utf8').split('\n')
    for (const [lineNumber, engine] of cited) expect(csv[lineNumber - 1]).toContain(`,${engine},`)
  })

  it('keeps EN and ES in separate sections and warns about not_stated', () => {
    const { prompts, round } = buildRound()
    const output = join(tempDir, 'worklist.md')
    run(worklistScript, ['2099-01-worklist', '--input', round, '--prompts', prompts, '--output', output])

    const worklist = readFileSync(output, 'utf8')
    expect(worklist).toMatch(/^# EN — 1 題/m)
    expect(worklist).toMatch(/^# ES — 1 題/m)
    expect(worklist.indexOf('# EN —')).toBeLessThan(worklist.indexOf('# ES —'))
    expect(worklist).toContain('not_stated')
    // The prompt text has to survive verbatim; a tester pastes it into the engine.
    expect(worklist).toContain('English question')
    expect(worklist).toContain('Spanish question')
  })

  it('regenerates over itself without --force, holding no hand-entered data', () => {
    const { prompts, round } = buildRound()
    const output = join(tempDir, 'worklist.md')
    run(worklistScript, ['2099-01-worklist', '--input', round, '--prompts', prompts, '--output', output])
    const again = run(worklistScript, ['2099-01-worklist', '--input', round, '--prompts', prompts, '--output', output])
    expect(again.status).toBe(0)
    expect(readFileSync(output, 'utf8')).toContain('# GEO 引用量測工作單')
  })
})

describe('geo-monitor summary CLI', () => {
  it('counts a filled fixture correctly in separate EN and ES blocks', () => {
    const fixture = join(tempDir, 'filled.csv')
    const records = [
      validRecord({ prompt_id: 'en0001', engine: 'chatgpt', lang: 'en', cited_url_count: '2' }),
      validRecord({ prompt_id: 'en0001', engine: 'gemini', lang: 'en', brand_mentioned: 'no', reylong_link_cited: 'no', cited_url_count: '0', brand_correct: 'not_stated', specs_correct: 'not_stated' }),
      validRecord({ prompt_id: 'es0001', engine: 'perplexity', lang: 'es', track: 'gap', cited_url_count: '3', model_correct: 'incorrect', hp_l_hallucinated: 'yes' }),
    ]
    const lines = [COLUMNS.join(','), ...records.map(record => COLUMNS.map(column => quoteCsv(record[column])).join(','))]
    writeFileSync(fixture, `${lines.join('\n')}\n`)

    const result = run(summaryScript, ['2099-01-fixture', '--input', fixture])
    expect(result.status).toBe(0)
    const en = result.stdout.slice(result.stdout.indexOf('EN —'), result.stdout.indexOf('ES —'))
    const es = result.stdout.slice(result.stdout.indexOf('ES —'))
    expect(en).toContain('EN — 1 prompts x 4 engines = 2 rows')
    expect(en).toContain('引用到的 Reylong URL 次數合計  2')
    expect(es).toContain('ES — 1 prompts x 4 engines = 1 rows')
    expect(es).toContain('引用到的 Reylong URL 次數合計  3')
    expect(result.stdout).toContain('英語與西語分開呈現，不合併')
    expect(result.stdout).not.toContain('次數合計  5')
  })
})

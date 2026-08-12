import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const script = join(repo, 'scripts/geo-monitor-crawlers.mjs')
let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'crawler-report-'))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

interface Hit {
  bot: string
  kind: string
  path: string
  status?: number
  verified?: boolean | null
}

function runReport(hits: Hit[]) {
  const fixture = join(tempDir, 'hits.json')
  writeFileSync(fixture, JSON.stringify(hits.map(hit => ({ hit_at: new Date().toISOString(), status: 200, verified: true, ...hit }))))
  return spawnSync(process.execPath, [script, '--fixture', fixture], { encoding: 'utf8' })
}

describe('crawler report', () => {
  it('separates live retrieval from corpus crawling in the page ranking', () => {
    // The training crawl piles onto one page hard enough to top the overall table
    // while nothing live ever touches it. Reading only the overall ranking would
    // point the next month of work at the wrong page.
    const result = runReport([
      ...Array.from({ length: 40 }, () => ({ bot: 'gptbot', kind: 'training', path: '/loved-by-training' })),
      ...Array.from({ length: 5 }, () => ({ bot: 'oai-searchbot', kind: 'search', path: '/loved-by-search' })),
      { bot: 'chatgpt-user', kind: 'user', path: '/loved-by-search' },
    ])
    expect(result.status).toBe(0)

    const overall = result.stdout.slice(result.stdout.indexOf('最常被抓的頁面'), result.stdout.indexOf('只看 user + search'))
    const live = result.stdout.slice(result.stdout.indexOf('只看 user + search'))
    expect(overall.indexOf('/loved-by-training')).toBeLessThan(overall.indexOf('/loved-by-search'))
    expect(live).toContain('/loved-by-search')
    expect(live).not.toContain('/loved-by-training')
  })

  it('says so plainly when every visit was corpus crawling', () => {
    const result = runReport([{ bot: 'ccbot', kind: 'training', path: '/anything' }])
    expect(result.stdout).toContain('全部都是語料爬取，沒有任何一次與即時查詢有關')
  })

  it('counts only corroborated hits as verified', () => {
    const result = runReport([
      { bot: 'gptbot', kind: 'training', path: '/a', verified: true },
      { bot: 'gptbot', kind: 'training', path: '/a', verified: false },
      { bot: 'bytespider', kind: 'training', path: '/a', verified: false },
    ])
    expect(result.stdout).toMatch(/gptbot\s+2 次（已驗證 1）/)
    // Nothing corroborated at all must not claim a verified count.
    expect(result.stdout).toMatch(/bytespider\s+1 次\s*$/m)
  })

  it('reports every distinct error status rather than the first one it saw', () => {
    const result = runReport([
      { bot: 'ccbot', kind: 'training', path: '/gone', status: 410 },
      { bot: 'ccbot', kind: 'training', path: '/missing', status: 404 },
      { bot: 'gptbot', kind: 'training', path: '/fine', status: 200 },
    ])
    expect(result.stdout).toContain('有 2 次抓取拿到錯誤回應（404、410）')
  })

  it('restates the two blind spots every time, so a reader never mistakes this for full coverage', () => {
    const result = runReport([{ bot: 'gptbot', kind: 'training', path: '/a' }])
    expect(result.stdout).toContain('Googlebot')
    expect(result.stdout).toContain('/faq/')
  })
})

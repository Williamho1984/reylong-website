import { describe, it, expect } from 'vitest'
import { assembleSse, evaluateChat } from '../../scripts/health-check.mjs'

const groundedAnswer = 'The JL-L-2TZP600 runs at up to 220 pcs/min for three-side seal bags.'

function sse(...chunks: string[]): string {
  return chunks.map(c => `data: ${JSON.stringify({ response: c })}\n\n`).join('') + 'data: [DONE]\n\n'
}

describe('assembleSse', () => {
  it('joins the streamed response chunks back into one answer', () => {
    expect(assembleSse(sse('Hello', ' world'))).toBe('Hello world')
  })

  it('ignores the [DONE] sentinel and malformed frames', () => {
    expect(assembleSse('data: [DONE]\n\ndata: not-json\n\n' + sse('ok'))).toBe('ok')
  })
})

describe('evaluateChat', () => {
  it('passes when the answer carries a spec that only the knowledge base knows', () => {
    expect(evaluateChat(200, sse(groundedAnswer)).ok).toBe(true)
  })

  it('fails on a non-200 — this is what the deprecated model would have caught', () => {
    const result = evaluateChat(500, '{"error":"Failed to process request"}')
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('500')
  })

  it('fails on an empty stream', () => {
    const result = evaluateChat(200, '')
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/empty/i)
  })

  // The failure mode a status check cannot see: the API answers 200, but retrieval is broken
  // (embedding model swapped, Supabase down, RPC changed) so the model has no specs to cite.
  it('fails when the model answers but has no grounding — a 200 is not enough', () => {
    const ungrounded = sse("I don't have that specific information. Please contact our sales team.")
    const result = evaluateChat(200, ungrounded)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/grounded|retrieval/i)
  })
})

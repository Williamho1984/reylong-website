// Outside-in health check for www.reylong.com, run on a schedule from GitHub Actions.
//
// This exists because the chatbot sat broken for six weeks and nothing said a word: Workers AI
// deprecated the generation model out from under us on 2026-05-30 and every message 500'd.
// Deliberately runs off Cloudflare, so a Cloudflare-wide failure is something it can report on
// rather than something that takes it down too.
const SITE = process.env.HEALTH_CHECK_SITE ?? 'https://www.reylong.com'
const ALERT_TO = process.env.HEALTH_CHECK_EMAIL ?? 'william19840805@gmail.com'
const ALERT_FROM = 'Reylong Website <noreply@reylong.com>'

// The probe asks something whose answer lives ONLY in the Supabase knowledge base — the system
// prompt carries no specs at all. So a reply that quotes a real speed proves the whole chain:
// embedding, pgvector retrieval, and generation. A plain 200 proves none of it.
const PROBE_QUESTION = 'What is the production speed of the JL-L-2TZP600?'
const GROUNDING_MARKERS = ['220', '150']

export function assembleSse(raw) {
  let out = ''
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = line.slice(6).trim()
    if (payload === '[DONE]') continue
    try {
      out += JSON.parse(payload).response ?? ''
    } catch {
      // A frame we cannot parse is not fatal on its own; an empty result is caught below.
    }
  }
  return out
}

export function evaluateChat(status, rawBody) {
  if (status !== 200) return { ok: false, reason: `chat API returned HTTP ${status}` }

  const answer = assembleSse(rawBody).trim()
  if (!answer) return { ok: false, reason: 'chat API streamed an empty answer' }

  const flat = answer.replace(/,/g, '')
  if (!GROUNDING_MARKERS.some(m => flat.includes(m))) {
    return {
      ok: false,
      reason: `chat answered but was not grounded — no knowledge-base spec in the reply, so retrieval is broken (embedding model, Supabase, or the RPC). Answer: "${answer.slice(0, 200)}"`,
    }
  }
  return { ok: true, answer }
}

async function sendAlert(failures) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY not set — cannot email; relying on the workflow failure instead.')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: ALERT_FROM,
      to: [ALERT_TO],
      subject: `[Reylong] health check FAILED — ${failures.length} problem(s)`,
      text: [
        `The scheduled health check for ${SITE} failed at ${new Date().toISOString()}.`,
        '',
        ...failures.map(f => `- ${f}`),
        '',
        'This check runs daily from GitHub Actions.',
      ].join('\n'),
    }),
  })
  console.log(res.ok ? 'alert email sent' : `alert email FAILED: HTTP ${res.status}`)
}

async function main() {
  const failures = []

  const home = await fetch(SITE, { headers: { 'User-Agent': 'reylong-health-check' } })
  if (!home.ok) failures.push(`homepage returned HTTP ${home.status}`)
  else console.log('homepage OK')

  const chat = await fetch(`${SITE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE },
    body: JSON.stringify({ message: PROBE_QUESTION }),
  })
  const verdict = evaluateChat(chat.status, await chat.text())
  if (!verdict.ok) failures.push(verdict.reason)
  else console.log(`chat OK — grounded answer: "${verdict.answer.slice(0, 120)}..."`)

  if (failures.length === 0) {
    console.log('\nall checks passed')
    return
  }

  console.error(`\n${failures.length} check(s) FAILED:`)
  for (const f of failures) console.error(`  - ${f}`)
  await sendAlert(failures)
  process.exitCode = 1
}

// Only run when invoked directly, so importing this from tests does not fire real requests.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).href) {
  await main()
}

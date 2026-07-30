/** Named HTML entities that actually appear in the CMS copy (EN + ES). */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  deg: '°',
  plusmn: '±',
  times: '×',
  micro: 'µ',
  euro: '€',
  pound: '£',
  copy: '©',
  reg: '®',
  trade: '™',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü',
  iquest: '¿', iexcl: '¡', laquo: '«', raquo: '»'
}

/**
 * Decode HTML entities in a single left-to-right pass. One pass matters: it
 * means `&amp;mdash;` decodes to the literal text `&mdash;` rather than being
 * re-decoded into an em dash. Unknown entities are left untouched.
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.startsWith('#')) {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match
    }
    return NAMED_ENTITIES[body] ?? match
  })
}

/**
 * Build a clean meta description from arbitrary (possibly long, possibly HTML)
 * copy. Strips tags, decodes entities, collapses whitespace, and trims to `max`
 * characters at a sentence boundary when one falls in the healthy range,
 * otherwise at a word boundary with an ellipsis. Keeps descriptions in the
 * ~150–160 char sweet spot so search engines don't truncate them mid-word.
 *
 * Entities are decoded before measuring, because the source stores `&oacute;`
 * and `&mdash;` — eight source characters that render as one — and both the
 * length budget and the rendered tag would otherwise be wrong.
 */
export function metaDescription(text: string | null | undefined, max = 155): string {
  if (!text) return ''
  const clean = decodeEntities(text.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const slice = clean.slice(0, max)
  const lastStop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? ')
  )
  // Prefer ending on a full sentence if that keeps a healthy length.
  if (lastStop >= max * 0.7) return slice.slice(0, lastStop + 1).trim()

  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + '…'
}

/** Trailing separators left behind once the brand suffix is trimmed off. */
const DANGLING_SEPARATORS = /[\s—–\-|·:,;]+$/

/**
 * Brand a page title and keep it within the ~60-char SERP display limit,
 * trimmed at a word boundary so it stays coherent (the on-page H1 keeps the
 * full text). Page titles are built as `${headline} — Reylong`, so trimming
 * the overflow tends to strip the brand and strand its separator — the
 * dangling `—` is removed rather than shipped into the `<title>`.
 */
export function seoTitle(title: string, max = 60): string {
  const branded = title.includes('Reylong') ? title : `${title} | Reylong`
  if (branded.length <= max) return branded

  const sliced = branded.slice(0, max)
  // A cut landing exactly on a space means the last word survived intact.
  const atWordBoundary = /\s/.test(branded.charAt(max))
    ? sliced
    : sliced.replace(/\s+\S*$/, '')

  return (atWordBoundary || sliced).replace(DANGLING_SEPARATORS, '') || sliced
}

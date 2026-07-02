/**
 * Build a clean meta description from arbitrary (possibly long, possibly HTML)
 * copy. Strips tags, collapses whitespace, and trims to `max` characters at a
 * sentence boundary when one falls in the healthy range, otherwise at a word
 * boundary with an ellipsis. Keeps descriptions in the ~150–160 char sweet spot
 * so search engines don't truncate them mid-word.
 */
export function metaDescription(text: string | null | undefined, max = 155): string {
  if (!text) return ''
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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

import sanitizeHtml from 'sanitize-html'

// Article bodies (news.content_en / content_es, case_studies.content_en) are stored as raw
// HTML and rendered with set:html. Only service_role can currently write them, but that is an
// access-control accident, not a guarantee — sanitize at render so a compromised or careless
// write path can never turn into stored XSS.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Images must come from a real host — this is what rejects data: payloads.
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
}

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, OPTIONS)
}

import type { NewsFaq } from './db/news'

export type FaqQuestion = {
  '@type': 'Question'
  name: string
  acceptedAnswer: { '@type': 'Answer'; text: string }
}

export type FaqPage = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: FaqQuestion[]
}

// FAQPage JSON-LD for a technical guide. This is what puts the article's answers in front of AI
// engines and rich results as discrete question/answer pairs rather than prose they have to
// infer structure from.
//
// Returns null rather than an empty FAQPage: Google rejects one with no questions, and most rows
// in the news table are plain announcements with no FAQ at all.
export function faqPageSchema(faq: NewsFaq[] | undefined | null, lang: 'en' | 'es'): FaqPage | null {
  if (!faq?.length) return null

  const mainEntity = faq
    .map(pair => ({
      question: lang === 'es' ? pair.q_es : pair.q_en,
      answer: lang === 'es' ? pair.a_es : pair.a_en,
    }))
    // A guide can be published in English before its Spanish translation lands, so skip any pair
    // that has no text in the language being rendered instead of emitting an empty question.
    .filter(pair => pair.question?.trim() && pair.answer?.trim())
    .map(pair => ({
      '@type': 'Question' as const,
      name: pair.question.trim(),
      acceptedAnswer: { '@type': 'Answer' as const, text: pair.answer.trim() },
    }))

  if (!mainEntity.length) return null

  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }
}

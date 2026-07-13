import { describe, it, expect } from 'vitest'
import { faqPageSchema } from '../../src/lib/schema'
import type { NewsFaq } from '../../src/lib/db/news'

const faq: NewsFaq[] = [
  { q_en: 'Why does registration drift?', a_en: 'Because the fabric stretches.', q_es: '¿Por qué se desvía el registro?', a_es: 'Porque el tejido se estira.' },
  { q_en: 'How is it corrected?', a_en: 'Servo tension control.', q_es: '¿Cómo se corrige?', a_es: 'Control de tensión servoasistido.' },
]

describe('faqPageSchema', () => {
  it('builds a FAQPage with one Question per pair', () => {
    const schema = faqPageSchema(faq, 'en')
    expect(schema?.['@type']).toBe('FAQPage')
    expect(schema?.mainEntity).toHaveLength(2)
    expect(schema?.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Why does registration drift?',
      acceptedAnswer: { '@type': 'Answer', text: 'Because the fabric stretches.' },
    })
  })

  it('uses the Spanish pair on Spanish pages', () => {
    const schema = faqPageSchema(faq, 'es')
    expect(schema?.mainEntity[0].name).toBe('¿Por qué se desvía el registro?')
    expect(schema?.mainEntity[0].acceptedAnswer.text).toBe('Porque el tejido se estira.')
  })

  // Google rejects a FAQPage with no questions, and most articles are plain news with no FAQ,
  // so the schema has to be omitted rather than emitted empty.
  it('returns null when there is nothing to answer', () => {
    expect(faqPageSchema([], 'en')).toBeNull()
    expect(faqPageSchema(undefined, 'en')).toBeNull()
  })

  // A guide whose Spanish translation has not landed yet must not emit half-empty questions.
  it('drops pairs that have no text in the requested language', () => {
    const partial: NewsFaq[] = [
      ...faq,
      { q_en: 'Only English', a_en: 'Answer', q_es: '', a_es: '' },
    ]
    expect(faqPageSchema(partial, 'en')?.mainEntity).toHaveLength(3)
    expect(faqPageSchema(partial, 'es')?.mainEntity).toHaveLength(2)
  })
})

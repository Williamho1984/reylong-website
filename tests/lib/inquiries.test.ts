import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

import { inquirySchema } from '../../src/lib/db/inquiries'

describe('inquirySchema', () => {
  it('validates a complete valid inquiry', () => {
    const input = {
      name: 'John Smith',
      email: 'john@example.com',
      company: 'ACME Corp',
      country: 'USA',
      message: 'I am interested in your circular loom machines.'
    }
    expect(() => inquirySchema.parse(input)).not.toThrow()
  })

  it('rejects invalid email', () => {
    const input = {
      name: 'John',
      email: 'not-an-email',
      company: 'ACME',
      country: 'USA',
      message: 'Hello there, testing message'
    }
    expect(() => inquirySchema.parse(input)).toThrow()
  })

  it('rejects message shorter than 10 chars', () => {
    const input = {
      name: 'John',
      email: 'john@example.com',
      company: 'ACME',
      country: 'USA',
      message: 'Short'
    }
    expect(() => inquirySchema.parse(input)).toThrow()
  })

  it('allows optional phone and product_id', () => {
    const input = {
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Corp',
      country: 'Mexico',
      phone: '+52 55 1234 5678',
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      message: 'We need 5 machines for our new factory.'
    }
    expect(() => inquirySchema.parse(input)).not.toThrow()
  })
})

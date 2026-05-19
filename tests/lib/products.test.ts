import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

import { supabase } from '../../src/lib/supabase'
import { getAllProducts, getFeaturedProducts, getProductBySlug } from '../../src/lib/db/products'

const mockProduct = {
  id: '1',
  slug: 'circular-loom-cl-8',
  category: 'circular-loom',
  is_featured: true,
  sort_order: 1,
  name_en: 'Circular Loom CL-8',
  name_es: 'Telar Circular CL-8',
  description_en: 'High speed circular loom',
  description_es: 'Telar circular de alta velocidad',
  specs: { speed: '120 bags/min' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('getAllProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns sorted products', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockProduct], error: null })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    const result = await getAllProducts()
    expect(result).toEqual([mockProduct])
    expect(supabase.from).toHaveBeenCalledWith('products')
  })

  it('throws on database error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    await expect(getAllProducts()).rejects.toThrow('Failed to fetch products: DB error')
  })
})

describe('getProductBySlug', () => {
  it('returns null when not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    }
    vi.mocked(supabase.from).mockReturnValue(mockChain as never)

    const result = await getProductBySlug('not-found')
    expect(result).toBeNull()
  })
})

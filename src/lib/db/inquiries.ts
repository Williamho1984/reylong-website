import { supabase } from '../supabase'
import { z } from 'zod'

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required').max(200),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().max(50).optional().default(''),
  product_id: z.string().uuid().optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
})

export type InquiryInput = z.infer<typeof inquirySchema>

export async function createInquiry(input: InquiryInput): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    ...input,
    status: 'new'
  })
  if (error) throw new Error(`Failed to submit inquiry: ${error.message}`)
}

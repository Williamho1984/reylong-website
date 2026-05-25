export const prerender = false

import type { APIRoute } from 'astro'
import { createInquiry, inquirySchema } from '../../lib/db/inquiries'
import { ZodError } from 'zod'

export const POST: APIRoute = async ({ request }) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const validated = inquirySchema.parse(body)
    if (validated.website) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    await createInquiry(validated)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: error.errors[0]?.message ?? 'Validation failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error('Inquiry submission failed:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to submit inquiry. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

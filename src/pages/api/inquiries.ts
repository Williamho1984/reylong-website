export const prerender = false

import type { APIRoute } from 'astro'
import { createInquiry, inquirySchema } from '../../lib/db/inquiries'
import { ZodError } from 'zod'

async function sendNotificationEmail(
  data: {
    name: string
    company: string
    email: string
    country: string
    phone?: string
    message: string
  },
  apiKey: string
) {
  const text = [
    `New inquiry received on reylong.com`,
    ``,
    `Name:    ${data.name}`,
    `Company: ${data.company}`,
    `Email:   ${data.email}`,
    `Country: ${data.country}`,
    `Phone:   ${data.phone || '—'}`,
    ``,
    `Message:`,
    data.message,
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Reylong Website <noreply@reylong.com>',
      to: 't6960638@ms45.hinet.net',
      subject: `New Inquiry: ${data.name} (${data.company})`,
      text,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Try Cloudflare runtime env first, fall back to build-time env
  const env = (locals as any)?.runtime?.env ?? {}
  const apiKey: string | undefined = env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY

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
    if (apiKey) {
      await sendNotificationEmail(validated, apiKey).catch(err =>
        console.error('Email notification failed:', err)
      )
    } else {
      console.error('RESEND_API_KEY not configured')
    }
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

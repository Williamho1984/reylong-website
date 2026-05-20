export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const content = `# Reylong

> Reylong Machinery Co., Ltd. manufactures high-performance woven bag making machines for B2B industrial clients worldwide.

## Company

Reylong is a professional manufacturer of PP and PE woven bag production equipment. Founded with over 20 years of experience, we serve factories in 30+ countries across Asia, Latin America, the Middle East, and Africa.

## Products

Reylong produces the following machine categories:
- Circular Looms: multi-shuttle, high-speed weaving machines for tubular PP/PE fabric
- Tape Stretching Lines: complete extrusion and stretching lines for production of flat tapes
- Lamination Machines: coating and lamination equipment for woven fabric
- Printing Machines: flexographic printing for woven bags
- Cutting & Sewing: automated cutting, sewing, and finishing equipment

## Contact

- Website: https://reylong.com
- Inquiry: https://reylong.com/contact
- Products: https://reylong.com/products

## Content

- /products — full product catalog
- /case-studies — client implementation stories
- /news — company and industry news
- /events — trade shows and exhibitions
- /about — company information
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}

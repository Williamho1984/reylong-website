export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const content = `# Reylong

> Reylong Machinery Co., Ltd. manufactures industrial plastic and packaging machinery for B2B clients worldwide.

## Company

Reylong is a professional manufacturer of plastic processing and flexible packaging machinery with over 20 years of experience. We serve factories in 30+ countries across Asia, Latin America, the Middle East, and Africa. Our product range spans woven bag production, plastic recycling, and flexible packaging equipment.

## Products

Reylong produces the following machine categories:
- Circular Looms: multi-shuttle, high-speed weaving machines for tubular PP/PE fabric
- Tape Stretching Lines: complete extrusion and stretching lines for flat tape production
- Lamination Machines: coating and lamination equipment for woven fabric
- Printing Machines: flexographic printing for woven and plastic packaging
- Cutting & Sewing: automated cutting, sewing, and finishing equipment
- Eddy Current Separators: non-ferrous metal and plastic separation equipment for recycling lines
- Pouch Making Machines: 3-seal and other format flexible packaging pouch production machines

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

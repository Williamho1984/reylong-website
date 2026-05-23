import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import alpinejs from '@astrojs/alpinejs'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://reylong.com',
  output: 'server',
  adapter: cloudflare(),
  session: { driver: 'memory' },
  integrations: [tailwind(), alpinejs()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }
  }
})

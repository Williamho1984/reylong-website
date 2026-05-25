import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import alpinejs from '@astrojs/alpinejs'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://www.reylong.com',
  output: 'server',
  adapter: cloudflare(),
  session: { driver: 'memory' },
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [tailwind(), alpinejs()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }
  }
})

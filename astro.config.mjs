import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import alpinejs from '@astrojs/alpinejs'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://www.reylong.com',
  output: 'server',
  adapter: cloudflare({
    // Without this, `astro dev` opens a remote proxy session that requires an
    // interactive `wrangler login` (OAuth via browser) to fetch live bindings.
    // Headless environments have no browser to complete that flow, so dev
    // never starts. Local emulation is also the right default for dev: the
    // AI and RATE_LIMIT bindings should not read/write production state
    // while testing locally.
    platformProxy: { remoteBindings: false }
  }),
  session: { driver: 'memory' },
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [tailwind(), alpinejs()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }
  }
})

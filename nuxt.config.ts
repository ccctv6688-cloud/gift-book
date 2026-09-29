const appBaseURL = process.env.NUXT_APP_BASE_URL || './'
const withBase = (path: string) => {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  const base = appBaseURL.endsWith('/') ? appBaseURL : `${appBaseURL}/`
  return `${base}${path.replace(/^\/+/, '')}`
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: { tailwindcss: {}, autoprefixer: {} },
  },
  app: {
    baseURL: appBaseURL,
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      link: [{ rel: 'icon', type: 'image/x-icon', href: withBase('/favicon.ico') }],
    },
  },
  nitro: {
    prerender: {
      routes: ['/', '/guest-screen', '/index.html', '/guest-screen.html'],
    },
  },
})

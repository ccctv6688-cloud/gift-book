const pendingScripts = new Map()

export function getAppBaseURL() {
  if (typeof window === 'undefined') return '/'
  return window.__NUXT__?.config?.app?.baseURL || '/'
}

export function withBase(path) {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  const baseURL = getAppBaseURL()
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  return `${base}${path.replace(/^\/+/, '')}`
}

export function loadScript(src) {
  const resolvedSrc = withBase(src)
  if (!pendingScripts.has(resolvedSrc)) {
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = resolvedSrc
      const timeout = window.setTimeout(() => fail(), 30000)
      const fail = () => {
        window.clearTimeout(timeout)
        script.remove()
        pendingScripts.delete(resolvedSrc)
        reject(new Error(`Failed to load ${resolvedSrc}`))
      }
      script.onload = () => {
        window.clearTimeout(timeout)
        resolve()
      }
      script.onerror = fail
      document.head.appendChild(script)
    })
    pendingScripts.set(resolvedSrc, promise)
  }
  return pendingScripts.get(resolvedSrc)
}

export async function loadPdfTools() {
  await Promise.all([
    loadScript('/static/pdf-lib.min.js'),
    loadScript('/static/fontkit.umd.min.js'),
  ])
  await loadScript('/static/GiftListPDFGenerator.js')
}

/**
 * 获取 Nuxt 当前配置的基础路径，用于兼容一级或二级目录部署。
 */
export function getAppBaseURL() {
  if (typeof window === 'undefined') return '/'
  return window.__NUXT__?.config?.app?.baseURL || '/'
}

/**
 * 给站内资源路径补上基础路径，外链和 data/blob 地址保持原样。
 */
export function withBase(path) {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  const baseURL = getAppBaseURL()
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  return `${base}${path.replace(/^\/+/, '')}`
}

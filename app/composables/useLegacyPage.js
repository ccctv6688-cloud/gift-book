import { withBase } from '~/utils/load-script'

/**
 * 挂载旧版页面逻辑，并在 Nuxt 页面卸载时恢复全局样式和释放资源。
 */
export function useLegacyPage({ title, bodyClass, styles, start }) {
  const error = ref('')
  const ready = ref(false)
  let active = true
  let instance
  let bodyStyle = ''
  let rootStyle = ''

  useHead({
    title,
    bodyAttrs: { class: bodyClass },
    link: styles.map(href => ({ rel: 'stylesheet', href: withBase(href) })),
  })

  onMounted(async () => {
    bodyStyle = document.body.style.cssText
    rootStyle = document.documentElement.style.cssText
    try {
      instance = start()
      await instance.ready
      if (active) ready.value = true
    } catch (cause) {
      console.error('Page initialization failed:', cause)
      if (active) error.value = '页面加载失败，请刷新后重试。'
    }
  })

  onBeforeUnmount(() => {
    active = false
    ready.value = false
    instance?.dispose()
    document.body.style.cssText = bodyStyle
    document.documentElement.style.cssText = rootStyle
  })

  return { error, ready }
}

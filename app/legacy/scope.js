/**
 * 创建旧版页面运行作用域，将事件监听和延迟任务绑定到 Nuxt 页面生命周期。
 */
export function createLegacyScope() {
  const controller = new AbortController()
  const timers = new Set()
  const idleJobs = new Set()

  const scope = {
    get disposed() {
      return controller.signal.aborted
    },
    /**
     * 注册会在页面卸载时自动移除的事件监听。
     */
    listen(target, type, handler) {
      target.addEventListener(type, handler, { signal: controller.signal })
    },
    /**
     * 注册会在页面卸载时自动取消的延迟任务。
     */
    setTimeout(handler, delay, ...args) {
      if (scope.disposed) return
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (!scope.disposed) handler(...args)
      }, delay)
      timers.add(id)
      return id
    },
    /**
     * 在浏览器空闲时执行任务，不支持时降级为短延迟。
     */
    requestIdleCallback(handler) {
      if (scope.disposed) return
      if (!window.requestIdleCallback) return scope.setTimeout(handler, 16)
      const id = window.requestIdleCallback(deadline => {
        idleJobs.delete(id)
        if (!scope.disposed) handler(deadline)
      })
      idleJobs.add(id)
      return id
    },
    /**
     * 释放当前页面作用域下的监听、定时器和空闲任务。
     */
    dispose() {
      controller.abort()
      timers.forEach(id => window.clearTimeout(id))
      idleJobs.forEach(id => window.cancelIdleCallback(id))
      timers.clear()
      idleJobs.clear()
    },
  }
  return scope
}

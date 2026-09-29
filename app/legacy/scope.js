// Keep document listeners and delayed work tied to the Nuxt page lifetime.
export function createLegacyScope() {
  const controller = new AbortController()
  const timers = new Set()
  const idleJobs = new Set()

  const scope = {
    get disposed() {
      return controller.signal.aborted
    },
    listen(target, type, handler) {
      target.addEventListener(type, handler, { signal: controller.signal })
    },
    setTimeout(handler, delay, ...args) {
      if (scope.disposed) return
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (!scope.disposed) handler(...args)
      }, delay)
      timers.add(id)
      return id
    },
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

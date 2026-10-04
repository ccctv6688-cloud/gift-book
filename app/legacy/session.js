/**
 * 清理旧版本遗留的登录信息和本地密码缓存。
 */
export function clearLegacyCredentials(session, local) {
  try {
    const saved = session.getItem('activeEventSession')
    if (saved) {
      const value = JSON.parse(saved)
      if (value?.encryptedPassword || value?.event) session.removeItem('activeEventSession')
    }
  } catch {
    session.removeItem('activeEventSession')
  }
  for (const key of Object.keys(local)) {
    if (key.startsWith('adminPwdCache_')) local.removeItem(key)
  }
}

/**
 * 管理当前打开的事项会话，只持久化事项 ID，不落地保存密码。
 */
export class SessionManager {
  /**
   * 创建会话管理器，默认使用 sessionStorage。
   */
  constructor(storage = sessionStorage) {
    this.storage = storage
  }

  /**
   * 保存当前事项 ID，方便刷新后回到同一事项。
   */
  save(event) {
    this.storage.setItem('activeEventSession', JSON.stringify({ eventId: event.id }))
  }

  /**
   * 读取当前事项 ID，格式不合法时返回空。
   */
  load() {
    try {
      const saved = JSON.parse(this.storage.getItem('activeEventSession'))
      return Number.isSafeInteger(saved?.eventId) ? saved.eventId : null
    } catch {
      return null
    }
  }

  /**
   * 清除当前事项会话。
   */
  clear() {
    this.storage.removeItem('activeEventSession')
  }

  /**
   * 判断某个事项是否已经展示过结束提醒。
   */
  hasNotification(eventId) {
    return this.storage.getItem(`eventEndedNotif_${eventId}`) === 'true'
  }

  /**
   * 标记某个事项已经展示过结束提醒。
   */
  markNotification(eventId) {
    this.storage.setItem(`eventEndedNotif_${eventId}`, 'true')
  }
}

/**
 * 在内存里短时间缓存管理员密码，避免频繁重复输入。
 */
export class PasswordCache {
  /**
   * 根据分钟数设置密码缓存有效期。
   */
  constructor(durationMinutes) {
    this.duration = durationMinutes * 60000
    this.entries = new Map()
  }

  /**
   * 缓存某个事项的管理员密码。
   */
  store(eventId, password) {
    this.entries.set(eventId, { password, expiresAt: Date.now() + this.duration })
  }

  /**
   * 读取缓存密码，过期或不存在时返回空。
   */
  retrieve(eventId) {
    const entry = this.entries.get(eventId)
    if (!entry || Date.now() >= entry.expiresAt) {
      this.entries.delete(eventId)
      return null
    }
    return entry.password
  }

  /**
   * 清除单个事项或全部事项的密码缓存。
   */
  clear(eventId) {
    if (eventId === undefined) this.entries.clear()
    else this.entries.delete(eventId)
  }
}

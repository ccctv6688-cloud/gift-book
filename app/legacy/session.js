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

// Only the selected event ID persists. Unlock credentials stay in memory.
export class SessionManager {
  constructor(storage = sessionStorage) {
    this.storage = storage
  }
  save(event) {
    this.storage.setItem('activeEventSession', JSON.stringify({ eventId: event.id }))
  }
  load() {
    try {
      const saved = JSON.parse(this.storage.getItem('activeEventSession'))
      return Number.isSafeInteger(saved?.eventId) ? saved.eventId : null
    } catch {
      return null
    }
  }
  clear() {
    this.storage.removeItem('activeEventSession')
  }
  hasNotification(eventId) {
    return this.storage.getItem(`eventEndedNotif_${eventId}`) === 'true'
  }
  markNotification(eventId) {
    this.storage.setItem(`eventEndedNotif_${eventId}`, 'true')
  }
}

export class PasswordCache {
  constructor(durationMinutes) {
    this.duration = durationMinutes * 60000
    this.entries = new Map()
  }
  store(eventId, password) {
    this.entries.set(eventId, { password, expiresAt: Date.now() + this.duration })
  }
  retrieve(eventId) {
    const entry = this.entries.get(eventId)
    if (!entry || Date.now() >= entry.expiresAt) {
      this.entries.delete(eventId)
      return null
    }
    return entry.password
  }
  clear(eventId) {
    if (eventId === undefined) this.entries.clear()
    else this.entries.delete(eventId)
  }
}

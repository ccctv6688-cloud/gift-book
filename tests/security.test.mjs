import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { SessionManager, PasswordCache, clearLegacyCredentials } from '../app/legacy/session.js'

const dom = new JSDOM('', { url: 'https://example.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
const { escapeHtml, sanitizeRichText } = await import('../app/utils/safe-html.js')

test('plain text remains literal in HTML, attributes and textareas', () => {
  const value = '\"><img src=x onerror=alert(1)></textarea><script>bad()</script>&\''
  const host = document.createElement('div')
  host.innerHTML = `<span>${escapeHtml(value)}</span><input value="${escapeHtml(value)}"><textarea>${escapeHtml(value)}</textarea>`
  assert.equal(host.querySelector('span').textContent, value)
  assert.equal(host.querySelector('input').value, value)
  assert.equal(host.querySelector('textarea').value, value)
  assert.equal(host.querySelectorAll('img,script').length, 0)
})

test('guest rich text keeps editor formatting but removes executable and overlay content', () => {
  const html = sanitizeRichText('<p><b>Welcome</b><font color="#cc0000" size="5">Guests</font><span style="color: red; position: fixed; background: url(https://invalid.test/x)" onclick="bad()">Hello</span><img src=x onerror=bad()><script>bad()</script><a href="javascript:bad()">Link</a></p>')
  const host = document.createElement('div')
  host.innerHTML = html
  assert.equal(host.querySelector('b').textContent, 'Welcome')
  assert.equal(host.querySelector('font').getAttribute('size'), '5')
  assert.equal(host.querySelector('span').style.color, 'red')
  assert.equal(host.querySelector('span').style.position, '')
  assert.equal(host.querySelector('span').style.background, '')
  assert.equal(host.querySelectorAll('script,img,a,[onclick]').length, 0)
})

test('session remembers only event ID, never password or its decrypting hash', () => {
  const storage = dom.window.sessionStorage
  storage.clear()
  const session = new SessionManager(storage)
  session.save({ id: 23, name: 'Test', passwordHash: 'hash-secret' }, 'password-secret')
  assert.deepEqual(JSON.parse(storage.getItem('activeEventSession')), { eventId: 23 })
  assert.equal(session.load(), 23)
  session.clear()
  assert.equal(session.load(), null)
})

test('legacy credential cleanup leaves unrelated data and display settings intact', () => {
  const { sessionStorage: session, localStorage: local } = dom.window
  session.setItem('activeEventSession', JSON.stringify({ event: { id: 23 }, encryptedPassword: 'old' }))
  local.setItem('adminPwdCache_23', 'old')
  local.setItem('guest-screen-settings', '{"layout":"left"}')
  local.setItem('unrelated', 'keep')
  clearLegacyCredentials(session, local)
  assert.equal(session.getItem('activeEventSession'), null)
  assert.equal(local.getItem('adminPwdCache_23'), null)
  assert.equal(local.getItem('guest-screen-settings'), '{"layout":"left"}')
  assert.equal(local.getItem('unrelated'), 'keep')
})

test('password cache expires and a fresh page cannot restore it', t => {
  let now = 1000
  t.mock.method(Date, 'now', () => now)
  const cache = new PasswordCache(5)
  cache.store(23, 'temporary-password')
  assert.equal(cache.retrieve(23), 'temporary-password')
  assert.equal(new PasswordCache(5).retrieve(23), null)
  now += 300000
  assert.equal(cache.retrieve(23), null)
  cache.store(23, 'temporary-password')
  cache.clear()
  assert.equal(cache.retrieve(23), null)
})

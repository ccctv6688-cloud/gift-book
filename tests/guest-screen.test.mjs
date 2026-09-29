import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { parse } from 'vue/compiler-sfc'

test('guest screen renders trusted updates, ignores other senders and cleans up on unmount', async () => {
  const page = readFileSync(new URL('../app/pages/guest-screen.vue', import.meta.url), 'utf8')
  const template = parse(page).descriptor.template.content
  const dom = new JSDOM(template, { url: 'https://example.test/guest-screen' })
  const { window } = dom
  Object.assign(globalThis, { window, document: window.document, localStorage: window.localStorage, AbortController: window.AbortController })
  delete globalThis.caches
  delete window.caches
  const sent = []
  const opener = { postMessage: (...message) => sent.push(message) }
  window.opener = opener
  const { startGuestScreen } = await import('../app/legacy/guest-screen.js')
  const instance = startGuestScreen()
  const data = {
    eventName: 'Test event', theme: 'theme-festive', hidePrivacy: false, typeText: 'Gift', currentPage: 1,
    gifts: [{ id: 1, name: '<b>Literal</b>', amount: 200, amountChinese: 'Two hundred', type: 'cash' }],
  }
  const send = (source, origin, value = data) => window.dispatchEvent(new window.MessageEvent('message', {
    source, origin, data: { type: 'guest_screen_update', data: value },
  }))
  try {
    assert.deepEqual(sent[0], [{ type: 'guest_screen_ready' }, window.location.origin])
    send({}, window.location.origin)
    send(opener, 'https://wrong.test')
    assert.equal(document.querySelector('#app-container').classList.contains('hidden'), true)
    send(opener, window.location.origin)
    assert.equal(document.querySelector('#event-title').textContent, 'Test event')
    assert.equal(document.querySelector('.name').textContent, '<b>Literal</b>')
    assert.equal(document.querySelector('.name b'), null)
    instance.dispose()
    send(opener, window.location.origin, { ...data, eventName: 'Should be ignored' })
    assert.equal(document.querySelector('#event-title').textContent, 'Test event')
    await new Promise(resolve => setImmediate(resolve))
  } finally {
    instance.dispose()
    window.close()
  }
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { loadScript, loadPdfTools, withBase } from '../app/utils/load-script.js'

const dom = new JSDOM('', { url: 'https://example.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document

test('concurrent requests share one script and resolved scripts are reused', async () => {
  const first = loadScript('/dedup.js')
  const second = loadScript('/dedup.js')
  assert.equal(first, second)
  const elements = document.querySelectorAll('script[src="/dedup.js"]')
  assert.equal(elements.length, 1)
  elements[0].dispatchEvent(new window.Event('load'))
  await first
  await loadScript('/dedup.js')
  assert.equal(document.querySelectorAll('script[src="/dedup.js"]').length, 1)
})

test('a failed tool download can be retried', async () => {
  const first = loadScript('/retry.js')
  document.querySelector('script[src="/retry.js"]').dispatchEvent(new window.Event('error'))
  await assert.rejects(first, /Failed to load/)
  const retry = loadScript('/retry.js')
  assert.notEqual(first, retry)
  document.querySelector('script[src="/retry.js"]').dispatchEvent(new window.Event('load'))
  await retry
})

test('PDF generator is loaded only after both PDF dependencies', async () => {
  const ready = loadPdfTools()
  assert.equal(document.querySelector('script[src="/static/GiftListPDFGenerator.js"]'), null)
  document.querySelector('script[src="/static/pdf-lib.min.js"]').dispatchEvent(new window.Event('load'))
  document.querySelector('script[src="/static/fontkit.umd.min.js"]').dispatchEvent(new window.Event('load'))
  await new Promise(resolve => setImmediate(resolve))
  document.querySelector('script[src="/static/GiftListPDFGenerator.js"]').dispatchEvent(new window.Event('load'))
  await ready
})

test('root asset paths respect configured app base URL', async () => {
  window.__NUXT__ = { config: { app: { baseURL: '/gift-book/' } } }
  try {
    assert.equal(withBase('/static/example.js'), '/gift-book/static/example.js')
    const ready = loadScript('/static/base-test.js')
    const script = document.querySelector('script[src="/gift-book/static/base-test.js"]')
    assert.notEqual(script, null)
    script.dispatchEvent(new window.Event('load'))
    await ready
  } finally {
    delete window.__NUXT__
  }
})

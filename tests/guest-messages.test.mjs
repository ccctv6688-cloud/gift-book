import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isTrustedMessage, isGuestDisplayData } from '../app/utils/guest-messages.js'

test('screen messages require both the expected window and the same origin', () => {
  const source = {}
  const origin = 'https://example.test'
  assert.equal(isTrustedMessage({ source, origin }, source, origin), true)
  assert.equal(isTrustedMessage({ source: {}, origin }, source, origin), false)
  assert.equal(isTrustedMessage({ source, origin: 'https://other.test' }, source, origin), false)
  assert.equal(isTrustedMessage({ source: null, origin }, null, origin), false)
})

test('guest payload validation rejects malformed records without rejecting literal names', () => {
  const gift = { id: 1, name: '<b>Literal name</b>', amount: 200, amountChinese: '200', type: 'cash' }
  const data = { eventName: 'Test', theme: 'theme-festive', hidePrivacy: false, typeText: 'Gift', currentPage: 1, gifts: [gift] }
  assert.equal(isGuestDisplayData(data), true)
  for (const value of [null, {}, { ...data, gifts: null }, { ...data, theme: 'other' }, { ...data, gifts: [{ ...gift, amount: Infinity }] }, { ...data, gifts: [{ ...gift, name: {} }] }]) {
    assert.equal(isGuestDisplayData(value), false)
  }
  assert.equal(isGuestDisplayData({ ...data, gifts: Array(24).fill(gift) }), true)
  assert.equal(isGuestDisplayData({ ...data, gifts: Array(25).fill(gift) }), false)
})

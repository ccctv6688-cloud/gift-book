/**
 * 校验副屏消息是否来自已打开的副屏窗口和预期来源。
 */
export function isTrustedMessage(event, source, origin) {
  return Boolean(source) && event.source === source && event.origin === origin
}

/**
 * 校验发送给副屏展示的数据结构，避免异常消息污染页面。
 */
export function isGuestDisplayData(data) {
  return Boolean(data) && typeof data === 'object' && !Array.isArray(data) &&
    typeof data.eventName === 'string' &&
    ['theme-festive', 'theme-solemn'].includes(data.theme) &&
    typeof data.hidePrivacy === 'boolean' && typeof data.typeText === 'string' &&
    Number.isInteger(data.currentPage) && data.currentPage >= 1 &&
    Array.isArray(data.gifts) && data.gifts.length <= 24 &&
    Array.from(data.gifts).every(gift =>
      gift && typeof gift === 'object' && !Array.isArray(gift) &&
      (typeof gift.id === 'string' || Number.isFinite(gift.id)) &&
      typeof gift.name === 'string' && Number.isFinite(gift.amount) && gift.amount >= 0 &&
      typeof gift.amountChinese === 'string' && typeof gift.type === 'string',
    )
}

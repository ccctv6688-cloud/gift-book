import DOMPurify from 'dompurify'

export function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character])
}

export function sanitizeRichText(value) {
  const fragment = DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS: ['div', 'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'font', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['color', 'size', 'style'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  })
  // Keep the editor's text formatting, but not positioning or resource-loading styles.
  const properties = ['color', 'font-size', 'font-weight', 'font-style', 'text-decoration', 'text-align']
  for (const element of fragment.querySelectorAll('[style]')) {
    const values = properties.map(property => [property, element.style.getPropertyValue(property)])
    element.removeAttribute('style')
    for (const [property, content] of values) {
      if (content) element.style.setProperty(property, content)
    }
  }
  const container = document.createElement('div')
  container.append(fragment)
  return container.innerHTML
}

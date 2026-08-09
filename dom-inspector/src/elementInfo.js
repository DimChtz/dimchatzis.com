import { COMPUTED_STYLE_KEYS } from './options.js'

export function parsePx(value) {
  if (value == null || value === '') return 0
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function getSelector(el) {
  if (!el || el === document.body) return ''
  const tag = el.tagName?.toLowerCase?.() || '?'
  const id = el.id ? `#${CSS.escape(el.id)}` : ''
  const classes = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).filter(Boolean).map((c) => CSS.escape(c)).join('.')
    : el.getAttribute?.('class')
      ? '.' + String(el.getAttribute('class')).trim().split(/\s+/).filter(Boolean).map((c) => CSS.escape(c)).join('.')
      : ''
  return tag + id + (classes || '')
}

export function getBoxModel(computedStyle) {
  return {
    margin: computedStyle.margin,
    padding: computedStyle.padding,
    border: `${computedStyle.borderWidth} ${computedStyle.borderStyle} ${computedStyle.borderColor}`,
  }
}

export function getBoxModelRects(el) {
  if (!el?.getBoundingClientRect) return null
  const rect = el.getBoundingClientRect()
  const cs = window.getComputedStyle(el)
  const mt = parsePx(cs.marginTop)
  const mr = parsePx(cs.marginRight)
  const mb = parsePx(cs.marginBottom)
  const ml = parsePx(cs.marginLeft)
  const pt = parsePx(cs.paddingTop)
  const pr = parsePx(cs.paddingRight)
  const pb = parsePx(cs.paddingBottom)
  const pl = parsePx(cs.paddingLeft)
  const bt = parsePx(cs.borderTopWidth)
  const br = parsePx(cs.borderRightWidth)
  const bb = parsePx(cs.borderBottomWidth)
  const bl = parsePx(cs.borderLeftWidth)
  return {
    margin: { left: rect.left - ml, top: rect.top - mt, width: rect.width + ml + mr, height: rect.height + mt + mb },
    border: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    padding: { left: rect.left + bl, top: rect.top + bt, width: rect.width - bl - br, height: rect.height - bt - bb },
    content: { left: rect.left + bl + pl, top: rect.top + bt + pt, width: rect.width - bl - br - pl - pr, height: rect.height - bt - bb - pt - pb },
  }
}

/** Returns box model values in px for visual diagram (margin, padding, border per side; content size). */
export function getBoxModelValues(el) {
  if (!el?.getBoundingClientRect) return null
  const cs = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const mt = parsePx(cs.marginTop)
  const mr = parsePx(cs.marginRight)
  const mb = parsePx(cs.marginBottom)
  const ml = parsePx(cs.marginLeft)
  const pt = parsePx(cs.paddingTop)
  const pr = parsePx(cs.paddingRight)
  const pb = parsePx(cs.paddingBottom)
  const pl = parsePx(cs.paddingLeft)
  const bt = parsePx(cs.borderTopWidth)
  const br = parsePx(cs.borderRightWidth)
  const bb = parsePx(cs.borderBottomWidth)
  const bl = parsePx(cs.borderLeftWidth)
  const contentW = rect.width - bl - br - pl - pr
  const contentH = rect.height - bt - bb - pt - pb
  return {
    marginTop: mt, marginRight: mr, marginBottom: mb, marginLeft: ml,
    paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl,
    borderTopWidth: bt, borderRightWidth: br, borderBottomWidth: bb, borderLeftWidth: bl,
    contentWidth: Math.max(0, contentW), contentHeight: Math.max(0, contentH),
    borderBoxWidth: rect.width, borderBoxHeight: rect.height,
  }
}

export function getExtraStyles(el, computedStyle) {
  const extra = {}
  extra['font-size'] = computedStyle.fontSize
  extra['line-height'] = computedStyle.lineHeight
  extra.overflow = computedStyle.overflow
  extra['z-index'] = computedStyle.zIndex
  extra.opacity = computedStyle.opacity
  if (computedStyle.transform !== 'none') extra.transform = computedStyle.transform
  if (computedStyle.display === 'flex' || computedStyle.display === 'inline-flex') {
    extra['flex-direction'] = computedStyle.flexDirection
    extra['align-items'] = computedStyle.alignItems
    extra['justify-content'] = computedStyle.justifyContent
    extra.gap = computedStyle.gap
  }
  if (computedStyle.display === 'grid' || computedStyle.display === 'inline-grid') {
    extra['grid-template-columns'] = computedStyle.gridTemplateColumns
    extra.gap = computedStyle.gap
  }
  return extra
}

export function getAllComputedStyles(el) {
  if (!el) return []
  const cs = window.getComputedStyle(el)
  return COMPUTED_STYLE_KEYS
    .map((key) => ({ key, value: cs.getPropertyValue(key) }))
    .filter(({ value }) => value && value !== 'none' && value !== 'normal' && value !== '0px')
}

export function getA11y(el) {
  const role = el.getAttribute?.('role')
  const ariaLabel = el.getAttribute?.('aria-label')
  const ariaLabelledby = el.getAttribute?.('aria-labelledby')
  const tabindex = el.getAttribute?.('tabindex')
  const attrs = []
  if (role) attrs.push(`role="${role}"`)
  if (ariaLabel) attrs.push('aria-label="…"')
  if (ariaLabelledby) attrs.push(`aria-labelledby="${ariaLabelledby}"`)
  if (tabindex != null) attrs.push(`tabindex="${tabindex}"`)
  if (attrs.length === 0) return null
  return attrs.join(' ')
}

export function getHierarchy(el) {
  const parent = el.parentElement
  const parentTag = parent ? parent.tagName.toLowerCase() : null
  const childCount = el.children ? el.children.length : 0
  return { parentTag, childCount }
}

export function getBreadcrumb(el) {
  if (!el || el === document.body) return []
  const path = []
  let node = el
  while (node && node !== document.body) {
    const tag = node.tagName?.toLowerCase?.() || '?'
    const id = node.id ? `#${node.id}` : ''
    const cls = node.className && typeof node.className === 'string'
      ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((c) => '.' + c).join('')
      : ''
    path.unshift({ tag, id, classes: cls, short: (tag + id + (cls || '')).slice(0, 20), element: node })
    node = node.parentElement
  }
  return path
}

/** Figma-style: distance between two elements (gap edge-to-edge). Positive = gap, negative = overlap. */
export function getDistanceBetween(fromEl, toEl) {
  if (!fromEl?.getBoundingClientRect || !toEl?.getBoundingClientRect) return null
  const from = fromEl.getBoundingClientRect()
  const to = toEl.getBoundingClientRect()
  let horizontal = 0
  let vertical = 0
  if (to.left >= from.right) horizontal = to.left - from.right
  else if (to.right <= from.left) horizontal = to.right - from.left
  if (to.top >= from.bottom) vertical = to.top - from.bottom
  else if (to.bottom <= from.top) vertical = to.bottom - from.top
  return {
    horizontal: Math.round(horizontal),
    vertical: Math.round(vertical),
    toSelector: getSelector(toEl),
  }
}

/** Returns line segments and labels for measuring between two rects. Handles gap, overlap, and containment. */
export function getMeasureLines(fromRect, toRect) {
  if (!fromRect || !toRect) return null
  const f = {
    left: fromRect.left,
    top: fromRect.top,
    right: fromRect.left + fromRect.width,
    bottom: fromRect.top + fromRect.height,
    midX: fromRect.left + fromRect.width / 2,
    midY: fromRect.top + fromRect.height / 2,
  }
  const t = {
    left: toRect.left,
    top: toRect.top,
    right: toRect.left + toRect.width,
    bottom: toRect.top + toRect.height,
    midX: toRect.left + toRect.width / 2,
    midY: toRect.top + toRect.height / 2,
  }

  const containment = (f.left >= t.left && f.right <= t.right && f.top >= t.top && f.bottom <= t.bottom)
    ? 'from-inside-to'
    : (t.left >= f.left && t.right <= f.right && t.top >= f.top && t.bottom <= f.bottom)
      ? 'to-inside-from'
      : null

  let hLine = null
  let vLine = null
  let hLabel = ''
  let vLabel = ''

  if (containment === 'from-inside-to') {
    const insetL = f.left - t.left
    const insetR = t.right - f.right
    const insetT = f.top - t.top
    const insetB = t.bottom - f.bottom
    hLine = { x1: t.left, y1: f.midY, x2: f.left, y2: f.midY, value: Math.round(insetL), label: `← ${Math.round(insetL)}px` }
    vLine = { x1: f.midX, y1: t.top, x2: f.midX, y2: f.top, value: Math.round(insetT), label: `↑ ${Math.round(insetT)}px` }
    hLabel = `inside: ←${Math.round(insetL)} →${Math.round(insetR)}`
    vLabel = `↑${Math.round(insetT)} ↓${Math.round(insetB)}px`
  } else if (containment === 'to-inside-from') {
    const insetL = t.left - f.left
    const insetR = f.right - t.right
    const insetT = t.top - f.top
    const insetB = f.bottom - t.bottom
    hLine = { x1: f.left, y1: t.midY, x2: t.left, y2: t.midY, value: Math.round(insetL), label: `← ${Math.round(insetL)}px` }
    vLine = { x1: t.midX, y1: f.top, x2: t.midX, y2: t.top, value: Math.round(insetT), label: `↑ ${Math.round(insetT)}px` }
    hLabel = `parent: ←${Math.round(insetL)} →${Math.round(insetR)}`
    vLabel = `↑${Math.round(insetT)} ↓${Math.round(insetB)}px`
  } else {
    const hGap = (t.left >= f.right) ? t.left - f.right : (t.right <= f.left) ? t.right - f.left : 0
    const vGap = (t.top >= f.bottom) ? t.top - f.bottom : (t.bottom <= f.top) ? t.bottom - f.top : 0
    const hAbs = Math.round(Math.abs(hGap))
    const vAbs = Math.round(Math.abs(vGap))
    if (t.left >= f.right) {
      hLine = { x1: f.right, y1: (f.midY + t.midY) / 2, x2: t.left, y2: (f.midY + t.midY) / 2, value: Math.round(hGap), label: `${hAbs}px` }
      hLabel = hGap >= 0 ? `→ ${hAbs}px` : `← ${hAbs}px`
    } else if (t.right <= f.left) {
      hLine = { x1: t.right, y1: (f.midY + t.midY) / 2, x2: f.left, y2: (f.midY + t.midY) / 2, value: Math.round(hGap), label: `${hAbs}px` }
      hLabel = `← ${hAbs}px`
    }
    if (t.top >= f.bottom) {
      vLine = { x1: (f.midX + t.midX) / 2, y1: f.bottom, x2: (f.midX + t.midX) / 2, y2: t.top, value: Math.round(vGap), label: `${vAbs}px` }
      vLabel = vGap >= 0 ? `↓ ${vAbs}px` : `↑ ${vAbs}px`
    } else if (t.bottom <= f.top) {
      vLine = { x1: (f.midX + t.midX) / 2, y1: t.bottom, x2: (f.midX + t.midX) / 2, y2: f.top, value: Math.round(vGap), label: `${vAbs}px` }
      vLabel = `↑ ${vAbs}px`
    }
  }

  return {
    containment,
    hLine,
    vLine,
    hLabel: hLabel || (hLine?.label ?? ''),
    vLabel: vLabel || (vLine?.label ?? ''),
  }
}

/** Distance from element edges to viewport. */
export function getDistanceToViewport(el) {
  if (!el?.getBoundingClientRect) return null
  const r = el.getBoundingClientRect()
  return {
    toTop: Math.round(r.top),
    toRight: Math.round(typeof window !== 'undefined' ? window.innerWidth - r.right : 0),
    toBottom: Math.round(typeof window !== 'undefined' ? window.innerHeight - r.bottom : 0),
    toLeft: Math.round(r.left),
  }
}

export function getElementInfo(el, opts = {}) {
  if (!el || !el.getBoundingClientRect) return null
  if (el === document.documentElement || el === document.body) return null
  const rect = el.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(el)
  const selector = getSelector(el)
  const tag = el.tagName?.toLowerCase?.() || '?'
  const info = {
    selector: selector || tag,
    tag,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    display: computedStyle.display,
    position: computedStyle.position,
  }
  if (opts.showBoxModel !== false) info.boxModel = getBoxModel(computedStyle)
  if (opts.showMoreStyles !== false) info.extra = getExtraStyles(el, computedStyle)
  if (opts.showA11y !== false) info.a11y = getA11y(el)
  if (opts.showHierarchy !== false) info.hierarchy = getHierarchy(el)
  info.breadcrumb = getBreadcrumb(el)
  return info
}

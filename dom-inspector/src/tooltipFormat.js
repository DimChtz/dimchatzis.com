import { getAllComputedStyles } from './elementInfo.js'

export function escapeHtml(str) {
  if (str == null) return ''
  const div = document.createElement('div')
  div.textContent = String(str)
  return div.innerHTML
}

export function formatTooltipHtml(info, opts = {}) {
  const { computedExpanded = false } = opts
  const lines = [
    `<div class="inspector-tooltip-line"><strong>${escapeHtml(info.selector)}</strong></div>`,
    `<div class="inspector-tooltip-line">${info.width} × ${info.height}px</div>`,
    `<div class="inspector-tooltip-line">display: ${escapeHtml(info.display)} · position: ${escapeHtml(info.position)}</div>`,
  ]
  if (info.hierarchy && (info.hierarchy.parentTag || info.hierarchy.childCount > 0)) {
    const parts = []
    if (info.hierarchy.parentTag) parts.push(`parent: &lt;${escapeHtml(info.hierarchy.parentTag)}&gt;`)
    if (info.hierarchy.childCount > 0) parts.push(`${info.hierarchy.childCount} child(ren)`)
    lines.push(`<div class="inspector-tooltip-line">${parts.join(' · ')}</div>`)
  }
  if (info.a11y) {
    lines.push(`<div class="inspector-tooltip-line inspector-tooltip-section">a11y: ${escapeHtml(info.a11y)}</div>`)
  }
  if (info.boxModel) {
    lines.push(
      `<div class="inspector-tooltip-line inspector-tooltip-section">margin: ${escapeHtml(info.boxModel.margin)}</div>`,
      `<div class="inspector-tooltip-line">padding: ${escapeHtml(info.boxModel.padding)}</div>`,
      `<div class="inspector-tooltip-line">border: ${escapeHtml(info.boxModel.border)}</div>`
    )
  }
  if (!opts.compact && info.extra && Object.keys(info.extra).length) {
    for (const [k, v] of Object.entries(info.extra)) {
      if (v) lines.push(`<div class="inspector-tooltip-line">${escapeHtml(k)}: ${escapeHtml(v)}</div>`)
    }
  }
  if (opts.showComputedExpandable && computedExpanded && info._el) {
    const all = getAllComputedStyles(info._el)
    if (all.length) {
      lines.push('<div class="inspector-tooltip-line inspector-tooltip-section">Computed:</div>')
      for (const { key, value } of all.slice(0, 35)) {
        lines.push(`<div class="inspector-tooltip-line inspector-computed">${escapeHtml(key)}: ${escapeHtml(value)}</div>`)
      }
      if (all.length > 35) lines.push(`<div class="inspector-tooltip-line inspector-computed-more">… ${all.length - 35} more</div>`)
    }
  }
  return lines.join('')
}

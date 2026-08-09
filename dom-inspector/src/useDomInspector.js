import { ref, computed, watch, onUnmounted } from 'vue'
import { DEFAULT_OPTIONS, STORAGE_KEY_BUTTON_COLLAPSED, SHORTCUT_MODIFIER, SHORTCUT_KEY, SHORTCUT_USE_ALT } from './options.js'
import {
  getSelector,
  getElementInfo,
  getBreadcrumb,
  getBoxModelRects,
  getBoxModelValues,
  getDistanceBetween,
  getDistanceToViewport,
  getMeasureLines,
} from './elementInfo.js'
import { formatTooltipHtml } from './tooltipFormat.js'

function getStoredButtonCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY_BUTTON_COLLAPSED) === 'true'
  } catch {
    return false
  }
}

function setStoredButtonCollapsed(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY_BUTTON_COLLAPSED, 'true')
    else localStorage.removeItem(STORAGE_KEY_BUTTON_COLLAPSED)
  } catch (_) {}
}

export function useDomInspector(activeRef, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const active = activeRef ?? ref(false)
  const hoveredEl = ref(null)
  const pinnedEl = ref(null)
  const overlayEl = ref(null)
  const tooltipEl = ref(null)
  const overlayLabelEl = ref(null)
  const boxModelLayersEl = ref(null)

  const historyStack = ref([])
  const showComputedExpanded = ref(false)
  const showMoreActions = ref(false)
  const showBoxModelLayersOverlay = ref(!!opts.showBoxModelLayers)

  const selectorTestQuery = ref('')
  const selectorTestMatches = ref([])
  const selectorTestRects = ref([])
  const quickActionState = ref({ hidden: new WeakSet(), outlined: new WeakSet() })

  const altKey = ref(false)
  const measureFrom = ref(null)
  const measureFromRect = ref(null)
  const measureTo = ref(null)
  const measureToRect = ref(null)
  const measureDistance = ref(null)
  const measureLines = ref(null)
  const measureViewport = ref(null)

  function rectToPlain(rect) {
    if (!rect) return null
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
  }

  const buttonCollapsed = ref(getStoredButtonCollapsed())
  function setButtonCollapsed(value) {
    buttonCollapsed.value = value
    setStoredButtonCollapsed(value)
  }
  function toggleButtonCollapsed() {
    setButtonCollapsed(!buttonCollapsed.value)
  }

  const currentElement = computed(() => pinnedEl.value || hoveredEl.value)

  let rafId = null
  let lastMouseX = 0
  let lastMouseY = 0

  function pushHistory(el) {
    if (!el || el === document.body) return
    const stack = historyStack.value.filter((e) => e !== el)
    stack.push(el)
    historyStack.value = stack.slice(-opts.historySize)
  }

  function updateOverlayOnly(el) {
    if (!el || !overlayEl.value) return
    const info = getElementInfo(el, opts)
    if (!info) return
    const rect = el.getBoundingClientRect()
    overlayEl.value.style.display = 'block'
    overlayEl.value.style.left = `${rect.left}px`
    overlayEl.value.style.top = `${rect.top}px`
    overlayEl.value.style.width = `${rect.width}px`
    overlayEl.value.style.height = `${rect.height}px`
    if (overlayLabelEl.value) {
      const box = getBoxModelValues(el)
      let line1 = `${info.selector}  ${info.width}×${info.height}px`
      let line2 = ''
      if (box && (box.marginTop || box.marginRight || box.marginBottom || box.marginLeft || box.paddingTop || box.paddingRight || box.paddingBottom || box.paddingLeft)) {
        const m = [box.marginTop, box.marginRight, box.marginBottom, box.marginLeft].join(' ')
        const p = [box.paddingTop, box.paddingRight, box.paddingBottom, box.paddingLeft].join(' ')
        line2 = `m: ${m}  p: ${p}`
      }
      overlayLabelEl.value.textContent = line2 ? `${line1}\n${line2}` : line1
    }
  }

  function updateOverlayAndTooltip(el) {
    if (!el || !overlayEl.value) return
    const info = getElementInfo(el, opts)
    if (!info) return
    info._el = el
    const rect = el.getBoundingClientRect()
    overlayEl.value.style.display = 'block'
    overlayEl.value.style.left = `${rect.left}px`
    overlayEl.value.style.top = `${rect.top}px`
    overlayEl.value.style.width = `${rect.width}px`
    overlayEl.value.style.height = `${rect.height}px`
    if (overlayLabelEl.value) {
      const box = getBoxModelValues(el)
      let line1 = `${info.selector}  ${info.width}×${info.height}px`
      let line2 = ''
      if (box && (box.marginTop || box.marginRight || box.marginBottom || box.marginLeft || box.paddingTop || box.paddingRight || box.paddingBottom || box.paddingLeft)) {
        const m = [box.marginTop, box.marginRight, box.marginBottom, box.marginLeft].join(' ')
        const p = [box.paddingTop, box.paddingRight, box.paddingBottom, box.paddingLeft].join(' ')
        line2 = `m: ${m}  p: ${p}`
      }
      overlayLabelEl.value.textContent = line2 ? `${line1}\n${line2}` : line1
    }
    if (tooltipEl.value && pinnedEl.value) {
      tooltipEl.value.innerHTML = formatTooltipHtml(info, {
        ...opts,
        computedExpanded: showComputedExpanded.value,
      })
    }
  }

  function isIgnored(el) {
    if (!el) return true
    if (el === overlayEl.value || el === tooltipEl.value) return true
    if (overlayEl.value?.contains(el) || tooltipEl.value?.contains(el)) return true
    if (opts.ignoreSelector && el.closest?.(opts.ignoreSelector)) return true
    if (el.closest?.('.vue-dom-inspector')) return true
    if (el === document.documentElement || el === document.body) return true
    return false
  }

  function onMouseMove(e) {
    if (!active.value) return
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    altKey.value = e.altKey
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      const inMeasureMode = !!measureFrom.value
      if (pinnedEl.value && !inMeasureMode) {
        updateOverlayAndTooltip(pinnedEl.value)
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
        return
      }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (isIgnored(el)) {
        if (!inMeasureMode && hoveredEl.value && overlayEl.value) {
          updateOverlayOnly(hoveredEl.value)
        } else if (inMeasureMode && measureFrom.value && overlayEl.value) {
          const fromRect = measureFrom.value.getBoundingClientRect()
          overlayEl.value.style.display = 'block'
          overlayEl.value.style.left = `${fromRect.left}px`
          overlayEl.value.style.top = `${fromRect.top}px`
          overlayEl.value.style.width = `${fromRect.width}px`
          overlayEl.value.style.height = `${fromRect.height}px`
        }
        return
      }
      if (inMeasureMode) {
        if (!measureFrom.value) {
          measureFrom.value = el
        }
        measureTo.value = el
        measureToRect.value = rectToPlain(el.getBoundingClientRect())
        measureFromRect.value = rectToPlain(measureFrom.value.getBoundingClientRect())
        measureViewport.value = null
        if (measureFrom.value === measureTo.value) {
          measureDistance.value = null
          measureLines.value = null
          measureViewport.value = getDistanceToViewport(measureFrom.value)
        } else {
          measureDistance.value = getDistanceBetween(measureFrom.value, measureTo.value)
          measureLines.value = getMeasureLines(measureFromRect.value, measureToRect.value)
        }
        overlayEl.value.style.display = 'block'
        const fromRect = measureFrom.value.getBoundingClientRect()
        overlayEl.value.style.left = `${fromRect.left}px`
        overlayEl.value.style.top = `${fromRect.top}px`
        overlayEl.value.style.width = `${fromRect.width}px`
        overlayEl.value.style.height = `${fromRect.height}px`
        if (overlayLabelEl.value) {
          if (measureFrom.value === measureTo.value && measureViewport.value) {
            const v = measureViewport.value
            overlayLabelEl.value.textContent = `Viewport: ←${v.toLeft} →${v.toRight} ↑${v.toTop} ↓${v.toBottom}px`
          } else if (measureLines.value && measureFrom.value !== measureTo.value) {
            const L = measureLines.value
            const parts = [L.containment ? `(${L.containment === 'to-inside-from' ? 'to is inside from' : 'from inside to'})` : '', L.hLabel, L.vLabel].filter(Boolean)
            overlayLabelEl.value.textContent = `${measureDistance.value?.toSelector ?? ''}\n${parts.join('  ')}`
          } else if (measureDistance.value) {
            const d = measureDistance.value
            const hDir = d.horizontal >= 0 ? '→' : '←'
            const vDir = d.vertical >= 0 ? '↓' : '↑'
            overlayLabelEl.value.textContent = `${d.toSelector}\n${hDir} ${Math.abs(d.horizontal)}px  ${vDir} ${Math.abs(d.vertical)}px`
          } else {
            overlayLabelEl.value.textContent = 'Alt+Click to set measure from · hover another'
          }
        }
      } else {
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
        hoveredEl.value = el
        updateOverlayOnly(el)
      }
    })
  }

  function onMouseClick(e) {
    if (!active.value) return
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (isIgnored(el)) return
    if (e.altKey) {
      e.preventDefault()
      e.stopPropagation()
      if (measureFrom.value === el) {
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
      } else {
        measureFrom.value = el
        measureFromRect.value = rectToPlain(el.getBoundingClientRect())
        measureTo.value = el
        measureToRect.value = rectToPlain(el.getBoundingClientRect())
        measureLines.value = null
        measureViewport.value = getDistanceToViewport(el)
        if (overlayEl.value && overlayLabelEl.value) {
          const rect = el.getBoundingClientRect()
          overlayEl.value.style.display = 'block'
          overlayEl.value.style.left = `${rect.left}px`
          overlayEl.value.style.top = `${rect.top}px`
          overlayEl.value.style.width = `${rect.width}px`
          overlayEl.value.style.height = `${rect.height}px`
          overlayLabelEl.value.textContent = `Measure from: ${getSelector(el)}\nHover another element. Esc to clear.`
        }
      }
      return
    }
    if (!opts.clickToPin) return
    e.preventDefault()
    e.stopPropagation()
    if (pinnedEl.value === el) {
      pinnedEl.value = null
    } else {
      pushHistory(el)
      pinnedEl.value = el
      updateOverlayAndTooltip(el)
    }
  }

  function unpin() {
    pinnedEl.value = null
  }

  function pinToElement(el) {
    if (!el || el === document.body) return
    if (opts.ignoreSelector && el.closest?.(opts.ignoreSelector)) return
    pushHistory(el)
    pinnedEl.value = el
    updateOverlayAndTooltip(el)
  }

  function copySelector() {
    const el = currentElement.value
    if (!el) return false
    const sel = getSelector(el)
    if (!sel) return false
    try {
      navigator.clipboard.writeText(sel)
      return true
    } catch (_) {
      return false
    }
  }

  function copyJsPath() {
    const el = currentElement.value
    if (!el) return false
    const sel = getSelector(el)
    if (!sel) return false
    try {
      navigator.clipboard.writeText(`document.querySelector('${sel.replace(/'/g, "\\'")}')`)
      return true
    } catch (_) {
      return false
    }
  }

  function copyOuterHtml() {
    const el = currentElement.value
    if (!el?.outerHTML) return false
    try {
      const html = el.outerHTML.length > 400 ? el.outerHTML.slice(0, 400) + '…' : el.outerHTML
      navigator.clipboard.writeText(html)
      return true
    } catch (_) {
      return false
    }
  }

  function scrollIntoView() {
    const el = currentElement.value
    if (!el?.scrollIntoView) return false
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    return true
  }

  function setInlineStyle(el, prop, value) {
    if (!el?.style) return false
    el.style.setProperty(prop, value)
    if (pinnedEl.value === el) updateOverlayAndTooltip(el)
    return true
  }

  function toggleHide() {
    const el = currentElement.value
    if (!el) return false
    const set = quickActionState.value.hidden
    if (set.has(el)) {
      el.style.removeProperty('visibility')
      set.delete(el)
    } else {
      el.style.setProperty('visibility', 'hidden')
      set.add(el)
    }
    return true
  }

  function toggleOutline() {
    const el = currentElement.value
    if (!el) return false
    const set = quickActionState.value.outlined
    if (set.has(el)) {
      el.style.removeProperty('outline')
      set.delete(el)
    } else {
      el.style.setProperty('outline', '2px solid #f44336')
      set.add(el)
    }
    return true
  }

  function logElement() {
    const el = currentElement.value
    if (!el) return false
    console.log('%cDOM Inspector: element', 'color: #00ff88; font-weight: bold', el)
    console.log('Selector:', getSelector(el))
    console.log('Computed styles:', window.getComputedStyle(el))
    return true
  }

  function updateSelectorTestRects() {
    selectorTestRects.value = selectorTestMatches.value.map((el) => {
      const r = el.getBoundingClientRect()
      return { left: r.left, top: r.top, width: r.width, height: r.height }
    })
  }

  function runSelectorTest(selector) {
    selectorTestQuery.value = selector
    if (!selector?.trim()) {
      selectorTestMatches.value = []
      selectorTestRects.value = []
      return []
    }
    try {
      const list = document.querySelectorAll(selector)
      selectorTestMatches.value = Array.from(list)
      updateSelectorTestRects()
      return selectorTestMatches.value
    } catch (_) {
      selectorTestMatches.value = []
      selectorTestRects.value = []
      return []
    }
  }

  function clearSelectorTest() {
    selectorTestQuery.value = ''
    selectorTestMatches.value = []
    selectorTestRects.value = []
  }

  function historyBack() {
    if (historyStack.value.length < 2) return false
    historyStack.value.pop()
    const prev = historyStack.value[historyStack.value.length - 1]
    if (prev && prev !== document.body) {
      pinnedEl.value = prev
      updateOverlayAndTooltip(prev)
      return true
    }
    return false
  }

  function pinParent() {
    if (!pinnedEl.value) return
    const parent = pinnedEl.value.parentElement
    if (!parent || parent === document.body) return
    if (opts.ignoreSelector && parent.closest?.(opts.ignoreSelector)) return
    pushHistory(parent)
    pinnedEl.value = parent
    updateOverlayAndTooltip(parent)
  }

  function pinFirstChild() {
    if (!pinnedEl.value) return
    const first = pinnedEl.value.firstElementChild
    if (!first) return
    if (opts.ignoreSelector && first.closest?.(opts.ignoreSelector)) return
    pushHistory(first)
    pinnedEl.value = first
    updateOverlayAndTooltip(first)
  }

  function pinPreviousSibling() {
    if (!pinnedEl.value) return
    const prev = pinnedEl.value.previousElementSibling
    if (!prev) return
    if (opts.ignoreSelector && prev.closest?.(opts.ignoreSelector)) return
    pushHistory(prev)
    pinnedEl.value = prev
    updateOverlayAndTooltip(prev)
  }

  function pinNextSibling() {
    if (!pinnedEl.value) return
    const next = pinnedEl.value.nextElementSibling
    if (!next) return
    if (opts.ignoreSelector && next.closest?.(opts.ignoreSelector)) return
    pushHistory(next)
    pinnedEl.value = next
    updateOverlayAndTooltip(next)
  }

  function toggleComputedExpanded() {
    showComputedExpanded.value = !showComputedExpanded.value
    const el = currentElement.value
    if (el && pinnedEl.value) updateOverlayAndTooltip(el)
  }

  function onShortcutKeydown(e) {
    const mod = SHORTCUT_MODIFIER === 'Meta' ? e.metaKey : e.ctrlKey
    const alt = SHORTCUT_USE_ALT ? e.altKey : true
    if (e.key === SHORTCUT_KEY && mod && alt) {
      active.value = !active.value
      if (!active.value) {
        hoveredEl.value = null
        pinnedEl.value = null
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
        historyStack.value = []
        clearSelectorTest()
        if (overlayEl.value) overlayEl.value.style.display = 'none'
      }
      e.preventDefault()
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (measureFrom.value) {
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
      } else if (pinnedEl.value) {
        pinnedEl.value = null
      } else {
        active.value = false
        if (overlayEl.value) overlayEl.value.style.display = 'none'
      }
      e.preventDefault()
      return
    }
    if (!pinnedEl.value) return
    if (e.key === 'ArrowUp') {
      pinParent()
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      pinFirstChild()
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      pinPreviousSibling()
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      pinNextSibling()
      e.preventDefault()
    }
  }

  function addKeydown() {
    document.addEventListener('keydown', onKeydown)
  }
  function removeKeydown() {
    document.removeEventListener('keydown', onKeydown)
  }

  watch(
    active,
    (v) => {
      if (v) addKeydown()
      else removeKeydown()
    },
    { immediate: true }
  )

  watch(showComputedExpanded, () => {
    const el = currentElement.value
    if (el && pinnedEl.value) updateOverlayAndTooltip(el)
  })

  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', onShortcutKeydown)
  }

  onUnmounted(() => {
    removeKeydown()
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', onShortcutKeydown)
    }
    cancelAnimationFrame(rafId)
  })

  return {
    active,
    hoveredEl,
    pinnedEl,
    currentElement,
    historyStack,
    showComputedExpanded,
    showMoreActions,
    altKey,
    measureFrom,
    measureFromRect,
    measureTo,
    measureToRect,
    measureDistance,
    measureLines,
    measureViewport,
    buttonCollapsed,
    setButtonCollapsed,
    toggleButtonCollapsed,
    selectorTestQuery,
    selectorTestMatches,
    selectorTestRects,
    quickActionState,
    overlayEl,
    overlayLabelEl,
    tooltipEl,
    toggle: () => {
      active.value = !active.value
      if (!active.value) {
        hoveredEl.value = null
        pinnedEl.value = null
        measureFrom.value = null
        measureFromRect.value = null
        measureTo.value = null
        measureToRect.value = null
        measureDistance.value = null
        measureLines.value = null
        measureViewport.value = null
        historyStack.value = []
        clearSelectorTest()
        if (overlayEl.value) overlayEl.value.style.display = 'none'
      }
    },
    unpin,
    copySelector,
    copyJsPath,
    copyOuterHtml,
    scrollIntoView,
    setInlineStyle,
    toggleHide,
    toggleOutline,
    logElement,
    runSelectorTest,
    clearSelectorTest,
    pinParent,
    pinFirstChild,
    pinPreviousSibling,
    pinNextSibling,
    pinToElement,
    historyBack,
    toggleComputedExpanded,
    onMouseMove,
    onMouseClick,
    updateOverlayAndTooltip,
    updateOverlayOnly,
    getElementInfo: (el) => getElementInfo(el || currentElement.value, opts),
    getBreadcrumb,
    getBoxModelRects,
    getBoxModelValues: (el) => getBoxModelValues(el || currentElement.value),
    getDistanceBetween,
    getDistanceToViewport,
    getSelector,
  }
}

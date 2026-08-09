<script setup>
import { watch, onMounted, onUnmounted, ref as vueRef, computed } from 'vue'
import { useDomInspector } from './useDomInspector.js'
import { SHORTCUT_MODIFIER, SHORTCUT_KEY, SHORTCUT_USE_ALT } from './options.js'

const active = defineModel('active', { type: Boolean, default: false })

const props = defineProps({
  ignoreSelector: { type: String, default: '.vue-dom-inspector' },
  showBoxModel: { type: Boolean, default: true },
  showMoreStyles: { type: Boolean, default: true },
  showA11y: { type: Boolean, default: true },
  showHierarchy: { type: Boolean, default: true },
  showBoxModelLayers: { type: Boolean, default: false },
  showComputedExpandable: { type: Boolean, default: true },
  clickToPin: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
  historySize: { type: Number, default: 30 },
  position: { type: String, default: 'bottom-right' },
})

const options = {
  ignoreSelector: props.ignoreSelector,
  showBoxModel: props.showBoxModel,
  showMoreStyles: props.showMoreStyles,
  showA11y: props.showA11y,
  showHierarchy: props.showHierarchy,
  showBoxModelLayers: props.showBoxModelLayers,
  showComputedExpandable: props.showComputedExpandable,
  clickToPin: props.clickToPin,
  compact: props.compact,
  historySize: props.historySize,
}

const {
  overlayEl,
  overlayLabelEl,
  tooltipEl,
  pinnedEl,
  currentElement,
  historyStack,
  showComputedExpanded,
  showMoreActions,
  altKey,
  measureFrom,
  measureTo,
  measureToRect,
  measureDistance,
  measureLines,
  measureViewport,
  buttonCollapsed,
  setButtonCollapsed,
  selectorTestQuery,
  selectorTestMatches,
  selectorTestRects,
  toggle,
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
  getElementInfo,
  getBoxModelValues,
  onMouseMove,
  onMouseClick,
} = useDomInspector(active, options)

const copyFeedback = vueRef('')
const pathExpanded = vueRef(true)

const shortcutHint = computed(() => {
  const mod = SHORTCUT_MODIFIER === 'Meta' ? '⌘' : 'Ctrl'
  return SHORTCUT_USE_ALT ? `${mod}+Alt+${SHORTCUT_KEY}` : `${mod}+Shift+${SHORTCUT_KEY}`
})

const inMeasureMode = computed(() => !!measureFrom.value)
const overlayElement = computed(() => (inMeasureMode.value && measureFrom.value ? measureFrom.value : currentElement.value))
const hoverBoxValues = computed(() => getBoxModelValues(overlayElement.value))
const boxValues = computed(() => getBoxModelValues(pinnedEl.value))

function copyAs(format) {
  let ok = false
  if (format === 'selector') ok = copySelector()
  else if (format === 'js') ok = copyJsPath()
  else if (format === 'html') ok = copyOuterHtml()
  if (ok) {
    copyFeedback.value = `Copied ${format}`
    setTimeout(() => { copyFeedback.value = '' }, 1200)
  }
}

function onSelectorTestInput(e) {
  runSelectorTest(e.target.value)
}

function setupListeners() {
  document.addEventListener('mousemove', onMouseMove)
  if (props.clickToPin) document.addEventListener('click', onMouseClick, true)
}
function removeListeners() {
  document.removeEventListener('mousemove', onMouseMove)
  if (props.clickToPin) document.removeEventListener('click', onMouseClick, true)
}

watch(active, (v) => {
  if (v) setupListeners()
  else removeListeners()
})

onMounted(() => {
  if (active.value) setupListeners()
})
onUnmounted(removeListeners)

defineExpose({
  active,
  toggle,
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
})
</script>

<template>
  <div class="vue-dom-inspector" :class="[`vue-dom-inspector--${position}`]">
    <!-- Collapsed: thin tab to expand button -->
    <button
      v-if="buttonCollapsed"
      type="button"
      class="inspector-tab"
      :class="{ active }"
      :aria-label="'Show inspector button (' + shortcutHint + ')'"
      :title="shortcutHint + ' to toggle'"
      @click="setButtonCollapsed(false)"
    >
      <span class="inspector-tab-text">Inspector</span>
    </button>

    <!-- Expanded: main toggle + collapse -->
    <div v-else class="inspector-toggle-wrap">
      <button
        type="button"
        class="inspector-toggle"
        :class="{ active }"
        :aria-label="active ? 'Disable DOM inspector' : 'Enable DOM inspector'"
        :title="active ? 'Esc to close · Click element to pin' : 'DOM Inspector · ' + shortcutHint"
        @click="toggle"
      >
        <span class="inspector-icon" aria-hidden="true">🔍</span>
      </button>
      <button
        type="button"
        class="inspector-collapse-btn"
        aria-label="Hide inspector button"
        title="Hide button (use {{ shortcutHint }} to show)"
        @click="setButtonCollapsed(true)"
      >
        <span aria-hidden="true">‹</span>
      </button>
    </div>

    <!-- Readout: fixed top-left so it never covers the target (works for tiny elements) -->
    <div
      v-show="active && overlayElement"
      ref="overlayLabelEl"
      class="inspector-overlay-label"
      aria-live="polite"
    />

    <div
      v-show="active && overlayElement"
      ref="overlayEl"
      class="inspector-overlay"
      style="display: none;"
      aria-hidden="true"
    >
      <template v-if="hoverBoxValues && !(inMeasureMode && measureFrom)">
        <span v-if="hoverBoxValues.marginTop" class="inspector-edge inspector-edge-mt" :style="{ marginTop: -hoverBoxValues.marginTop + 'px' }">m {{ hoverBoxValues.marginTop }}</span>
        <span v-if="hoverBoxValues.marginRight" class="inspector-edge inspector-edge-mr" :style="{ marginRight: -hoverBoxValues.marginRight + 'px' }">m {{ hoverBoxValues.marginRight }}</span>
        <span v-if="hoverBoxValues.marginBottom" class="inspector-edge inspector-edge-mb" :style="{ marginBottom: -hoverBoxValues.marginBottom + 'px' }">m {{ hoverBoxValues.marginBottom }}</span>
        <span v-if="hoverBoxValues.marginLeft" class="inspector-edge inspector-edge-ml" :style="{ marginLeft: -hoverBoxValues.marginLeft + 'px' }">m {{ hoverBoxValues.marginLeft }}</span>
        <span v-if="hoverBoxValues.paddingTop" class="inspector-edge inspector-edge-pt">p {{ hoverBoxValues.paddingTop }}</span>
        <span v-if="hoverBoxValues.paddingRight" class="inspector-edge inspector-edge-pr">p {{ hoverBoxValues.paddingRight }}</span>
        <span v-if="hoverBoxValues.paddingBottom" class="inspector-edge inspector-edge-pb">p {{ hoverBoxValues.paddingBottom }}</span>
        <span v-if="hoverBoxValues.paddingLeft" class="inspector-edge inspector-edge-pl">p {{ hoverBoxValues.paddingLeft }}</span>
      </template>
    </div>

    <!-- Measure-to overlay (Alt+Click: second element) -->
    <div
      v-show="active && inMeasureMode && measureToRect && measureFrom && measureTo && measureFrom !== measureTo"
      class="inspector-overlay inspector-overlay--measure-to"
      :style="measureToRect ? {
        left: measureToRect.left + 'px',
        top: measureToRect.top + 'px',
        width: measureToRect.width + 'px',
        height: measureToRect.height + 'px',
      } : {}"
      aria-hidden="true"
    />

    <!-- Measure distance lines (SVG overlay) -->
    <svg
      v-show="active && inMeasureMode && measureLines && (measureLines.hLine || measureLines.vLine)"
      class="inspector-measure-lines"
      aria-hidden="true"
    >
      <line
        v-if="measureLines?.hLine"
        :x1="measureLines.hLine.x1"
        :y1="measureLines.hLine.y1"
        :x2="measureLines.hLine.x2"
        :y2="measureLines.hLine.y2"
        class="inspector-measure-line inspector-measure-line--h"
      />
      <line
        v-if="measureLines?.vLine"
        :x1="measureLines.vLine.x1"
        :y1="measureLines.vLine.y1"
        :x2="measureLines.vLine.x2"
        :y2="measureLines.vLine.y2"
        class="inspector-measure-line inspector-measure-line--v"
      />
      <text
        v-if="measureLines?.hLine"
        :x="(measureLines.hLine.x1 + measureLines.hLine.x2) / 2"
        :y="measureLines.hLine.y1 - 4"
        class="inspector-measure-label inspector-measure-label--h"
        text-anchor="middle"
      >{{ measureLines.hLine.label }}</text>
      <text
        v-if="measureLines?.vLine"
        :x="measureLines.vLine.x1 + 6"
        :y="(measureLines.vLine.y1 + measureLines.vLine.y2) / 2"
        class="inspector-measure-label inspector-measure-label--v"
        text-anchor="start"
      >{{ measureLines.vLine.label }}</text>
    </svg>

    <template v-if="active && selectorTestRects.length > 0">
      <div
        v-for="(rect, i) in selectorTestRects"
        :key="i"
        class="inspector-selector-match"
        :style="{
          left: rect.left + 'px',
          top: rect.top + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
        }"
      />
    </template>

    <!-- Docked panel (right edge), only when pinned -->
    <aside
      v-show="active && pinnedEl"
      class="inspector-panel"
      :class="[`inspector-panel--${position}`]"
      role="complementary"
      aria-label="DOM Inspector panel"
    >
      <header class="inspector-panel-header">
        <h2 class="inspector-panel-title">DOM Inspector</h2>
        <span class="inspector-panel-shortcut" :title="'Toggle inspector: ' + shortcutHint">{{ shortcutHint }}</span>
        <div class="inspector-panel-header-actions">
          <button type="button" class="inspector-header-btn" title="Unpin element" @click="unpin">Unpin</button>
          <button type="button" class="inspector-header-btn inspector-header-btn--close" title="Close (Esc)" @click="active = false">Close</button>
        </div>
      </header>

      <div class="inspector-panel-body">
        <!-- Path -->
        <section class="inspector-section inspector-path-section">
          <button
            type="button"
            class="inspector-section-head"
            :aria-expanded="pathExpanded"
            @click="pathExpanded = !pathExpanded"
          >
            <span class="inspector-section-title">Path</span>
            <span class="inspector-section-chevron">{{ pathExpanded ? '▼' : '▶' }}</span>
          </button>
          <div v-show="pathExpanded" class="inspector-path-scroll" dir="ltr">
            <button
              v-for="(crumb, i) in (getElementInfo()?.breadcrumb ?? [])"
              :key="i"
              type="button"
              class="inspector-path-chip"
              :title="crumb.tag + crumb.id + crumb.classes"
              @click="pinToElement(crumb.element)"
            >
              {{ crumb.short || crumb.tag }}
            </button>
          </div>
        </section>

        <!-- Box model (simple list in advanced) -->
        <section v-if="boxValues" class="inspector-section inspector-box-section">
          <div class="inspector-section-head inspector-section-head--static">
            <span class="inspector-section-title">Box</span>
          </div>
          <div class="inspector-box-simple">
            m: {{ boxValues.marginTop }} {{ boxValues.marginRight }} {{ boxValues.marginBottom }} {{ boxValues.marginLeft }} ·
            p: {{ boxValues.paddingTop }} {{ boxValues.paddingRight }} {{ boxValues.paddingBottom }} {{ boxValues.paddingLeft }}
          </div>
        </section>

        <!-- Details (computed, a11y, etc.) -->
        <section class="inspector-section inspector-details-section">
          <div class="inspector-section-head inspector-section-head--static">
            <span class="inspector-section-title">Details</span>
          </div>
          <div ref="tooltipEl" class="inspector-tooltip-body" aria-live="polite" aria-atomic="true" />
        </section>

        <!-- Actions -->
        <section class="inspector-actions-section">
          <div class="inspector-actions inspector-actions--primary">
            <div class="inspector-copy">
              <button type="button" class="inspector-btn" title="Copy selector" @click="copyAs('selector')">Copy</button>
              <span v-if="copyFeedback" class="inspector-feedback">{{ copyFeedback }}</span>
            </div>
            <button type="button" class="inspector-btn" title="Scroll into view" @click="scrollIntoView">Scroll</button>
          </div>
          <div class="inspector-more">
            <button
              type="button"
              class="inspector-btn inspector-btn--more"
              :aria-expanded="showMoreActions"
              @click="showMoreActions = !showMoreActions"
            >
              {{ showMoreActions ? '− More' : '+ More' }}
            </button>
            <div v-show="showMoreActions" class="inspector-more-content">
              <div class="inspector-more-row">
                <span class="inspector-more-label">Copy as:</span>
                <button type="button" class="inspector-btn inspector-btn--small" @click="copyAs('selector')">Selector</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="copyAs('js')">JS</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="copyAs('html')">HTML</button>
              </div>
              <div class="inspector-more-row">
                <button v-if="showComputedExpandable" type="button" class="inspector-btn inspector-btn--small" @click="toggleComputedExpanded">
                  {{ showComputedExpanded ? '− Computed' : '+ Computed' }}
                </button>
                <button v-if="historyStack.length > 1" type="button" class="inspector-btn inspector-btn--small" @click="historyBack">← Back</button>
              </div>
              <div class="inspector-more-row">
                <span class="inspector-more-label">Nav:</span>
                <button type="button" class="inspector-btn inspector-btn--small" @click="pinParent">↑</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="pinFirstChild">↓</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="pinPreviousSibling">←</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="pinNextSibling">→</button>
              </div>
              <div class="inspector-more-row">
                <span class="inspector-more-label">Quick:</span>
                <button type="button" class="inspector-btn inspector-btn--small" @click="toggleHide">Hide</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="toggleOutline">Outline</button>
                <button type="button" class="inspector-btn inspector-btn--small" @click="logElement">Log $el</button>
              </div>
              <div class="inspector-more-row inspector-selector-test">
                <label class="inspector-more-label">Test selector:</label>
                <input
                  :value="selectorTestQuery"
                  type="text"
                  class="inspector-selector-input"
                  placeholder="e.g. .card"
                  @input="onSelectorTestInput"
                />
                <button v-if="selectorTestQuery" type="button" class="inspector-btn inspector-btn--small" @click="clearSelectorTest">Clear</button>
                <span v-if="selectorTestMatches.length > 0" class="inspector-match-count">{{ selectorTestMatches.length }} match(es)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.vue-dom-inspector {
  position: fixed;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}

.vue-dom-inspector--bottom-right {
  bottom: 1rem;
  right: 1rem;
}
.vue-dom-inspector--bottom-left {
  bottom: 1rem;
  left: 1rem;
  align-items: flex-start;
}
.vue-dom-inspector--top-right {
  top: 1rem;
  right: 1rem;
}
.vue-dom-inspector--top-left {
  top: 1rem;
  left: 1rem;
  align-items: flex-start;
}

/* Collapsed: thin tab */
.inspector-tab {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 0.5rem 0.35rem;
  background: var(--bg-card, #161b22);
  border: 1px solid var(--border, #30363d);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--text-muted, #8b949e);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.inspector-tab:hover,
.inspector-tab.active {
  color: var(--accent, #00ff88);
  border-color: var(--accent-dim, #00cc6a);
  background: var(--bg-card-hover, #21262d);
}
.inspector-tab-text {
  letter-spacing: 0.05em;
}

/* Expanded: toggle + collapse */
.inspector-toggle-wrap {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.inspector-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card, #161b22);
  border: 1px solid var(--border, #30363d);
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.inspector-toggle:hover {
  border-color: var(--accent-dim, #00cc6a);
  background: var(--bg-card-hover, #21262d);
}
.inspector-toggle.active {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--accent, #00ff88);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.3);
}
.inspector-collapse-btn {
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card, #161b22);
  border: 1px solid var(--border, #30363d);
  border-radius: 6px;
  color: var(--text-muted, #8b949e);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.inspector-collapse-btn:hover {
  color: var(--accent, #00ff88);
  border-color: var(--accent-dim, #00cc6a);
}

.inspector-overlay {
  position: fixed;
  pointer-events: none;
  border: 2px solid var(--accent, #00ff88);
  border-radius: 4px;
  box-sizing: border-box;
  z-index: 1003;
  overflow: visible;
}
.inspector-overlay--measure-to {
  border-color: rgba(255, 152, 0, 0.9);
  border-style: dashed;
  z-index: 1002;
}

.inspector-measure-lines {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1001;
}
.inspector-measure-line {
  stroke: var(--accent, #00ff88);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.inspector-measure-line--v {
  stroke: rgba(255, 152, 0, 0.95);
}
.inspector-measure-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 600;
  fill: var(--text, #e6edf3);
  paint-order: stroke;
  stroke: var(--bg-card, #161b22);
  stroke-width: 3px;
}
.inspector-overlay-label {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-card, #161b22);
  border: 1px solid var(--accent, #00ff88);
  color: var(--text, #e6edf3);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
  white-space: pre-line;
  word-break: break-word;
  max-width: min(420px, 90vw);
  line-height: 1.4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 1004;
  pointer-events: none;
}
.inspector-edge {
  position: absolute;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 2px rgba(0,0,0,0.9);
  background: rgba(0, 0, 0, 0.75);
  padding: 0.1rem 0.25rem;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
}
.inspector-edge-mt { top: 0; left: 50%; transform: translate(-50%, -100%); margin-top: -2px; }
.inspector-edge-mb { bottom: 0; left: 50%; transform: translate(-50%, 100%); margin-bottom: -2px; }
.inspector-edge-ml { left: 0; top: 50%; transform: translate(-100%, -50%); margin-left: -2px; }
.inspector-edge-mr { right: 0; top: 50%; transform: translate(100%, -50%); margin-right: -2px; }
.inspector-edge-pt { top: 2px; left: 50%; transform: translateX(-50%); }
.inspector-edge-pb { bottom: 2px; left: 50%; transform: translateX(-50%); }
.inspector-edge-pl { left: 2px; top: 50%; transform: translateY(-50%); }
.inspector-edge-pr { right: 2px; top: 50%; transform: translateY(-50%); }

.inspector-selector-match {
  position: fixed;
  pointer-events: none;
  border: 2px solid rgba(156, 39, 176, 0.9);
  background: rgba(156, 39, 176, 0.15);
  border-radius: 2px;
  box-sizing: border-box;
  z-index: 996;
}

/* Docked panel */
.inspector-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: min(380px, 95vw);
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #161b22);
  border-left: 1px solid var(--border, #30363d);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  color: var(--text, #e6edf3);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
  z-index: 1005;
  pointer-events: auto;
}
.inspector-panel--bottom-right,
.inspector-panel--top-right {
  right: 0;
}
.inspector-panel--bottom-left,
.inspector-panel--top-left {
  left: 0;
  border-left: none;
  border-right: 1px solid var(--border, #30363d);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.3);
}

.inspector-panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border, #30363d);
  background: var(--bg, rgba(0, 0, 0, 0.25));
}
.inspector-panel-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent, #00ff88);
}
.inspector-panel-shortcut {
  font-size: 0.65rem;
  color: var(--text-muted, #8b949e);
  padding: 0.15rem 0.35rem;
  background: var(--bg-card-hover, #21262d);
  border-radius: 4px;
}
.inspector-panel-header-actions {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
}
.inspector-header-btn {
  padding: 0.25rem 0.5rem;
  background: var(--bg-card-hover, #21262d);
  border: 1px solid var(--border, #30363d);
  border-radius: 6px;
  color: var(--text-muted, #8b949e);
  font: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.inspector-header-btn:hover {
  color: var(--accent, #00ff88);
  border-color: var(--accent-dim, #00cc6a);
}
.inspector-header-btn--close:hover {
  color: #f44336;
  border-color: #f44336;
}

.inspector-panel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
}

.inspector-section {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border, #30363d);
}
.inspector-section-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  background: var(--bg, rgba(0, 0, 0, 0.2));
  border: none;
  color: var(--text-muted, #8b949e);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.inspector-section-head:hover {
  color: var(--accent, #00ff88);
}
.inspector-section-head--static {
  cursor: default;
}
.inspector-section-head--static:hover {
  color: var(--text-muted, #8b949e);
}
.inspector-section-title {
  flex: 1;
}
.inspector-section-chevron {
  font-size: 0.6rem;
  opacity: 0.8;
}

.inspector-path-section .inspector-path-scroll {
  display: flex;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  max-height: 3.5rem;
  scrollbar-width: thin;
}
.inspector-path-scroll::-webkit-scrollbar {
  height: 6px;
}
.inspector-path-chip {
  flex-shrink: 0;
  padding: 0.35rem 0.6rem;
  background: var(--bg-card-hover, #21262d);
  border: 1px solid var(--border, #30363d);
  border-radius: 6px;
  color: var(--text-muted, #8b949e);
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inspector-path-chip:hover {
  color: var(--accent, #00ff88);
  border-color: var(--accent-dim, #00cc6a);
}

.inspector-box-section {
  padding: 0.5rem 0.75rem;
}
.inspector-box-simple {
  font-size: 0.7rem;
  color: var(--text-muted, #8b949e);
  padding: 0 0.75rem 0.5rem;
}

.inspector-details-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.inspector-details-section .inspector-section-head {
  flex-shrink: 0;
}
.inspector-tooltip-body {
  overflow-y: auto;
  padding: 0.5rem 0.75rem;
  flex: 1;
  min-height: 80px;
}
.inspector-tooltip-body :deep(.inspector-tooltip-line) {
  margin-bottom: 0.2rem;
}
.inspector-tooltip-body :deep(.inspector-tooltip-line:last-child) {
  margin-bottom: 0;
}
.inspector-tooltip-body :deep(.inspector-tooltip-line.inspector-tooltip-section) {
  margin-top: 0.35rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border, #30363d);
}
.inspector-tooltip-body :deep(.inspector-tooltip-line strong) {
  color: var(--accent, #00ff88);
}
.inspector-tooltip-body :deep(.inspector-computed) {
  font-size: 0.7rem;
  color: var(--text-muted, #8b949e);
}
.inspector-tooltip-body :deep(.inspector-computed-more) {
  font-size: 0.65rem;
  font-style: italic;
  color: var(--text-muted, #8b949e);
}

.inspector-actions-section {
  flex-shrink: 0;
  border-bottom: none;
}
.inspector-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--border, #30363d);
  background: var(--bg, rgba(0, 0, 0, 0.2));
}
.inspector-btn {
  padding: 0.3rem 0.55rem;
  background: var(--bg-card-hover, #21262d);
  border: 1px solid var(--border, #30363d);
  border-radius: 6px;
  color: var(--text-muted, #8b949e);
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
  transition: color 0.2s, border-color 0.2s;
}
.inspector-btn:hover {
  color: var(--accent, #00ff88);
  border-color: var(--accent-dim, #00cc6a);
}
.inspector-btn--small {
  padding: 0.2rem 0.4rem;
  font-size: 0.65rem;
}
.inspector-btn--more {
  margin-right: auto;
}
.inspector-copy {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.inspector-feedback {
  font-size: 0.6rem;
  color: var(--accent, #00ff88);
}

.inspector-more {
  border-top: 1px solid var(--border, #30363d);
  background: var(--bg, rgba(0, 0, 0, 0.15));
  padding: 0.5rem 0.75rem;
}
.inspector-more-content {
  padding: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.inspector-more-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.inspector-more-label {
  font-size: 0.65rem;
  color: var(--text-muted, #8b949e);
  min-width: 4rem;
}
.inspector-selector-test {
  flex-direction: column;
  align-items: stretch;
}
.inspector-selector-input {
  width: 100%;
  padding: 0.35rem 0.5rem;
  background: var(--bg-card, #161b22);
  border: 1px solid var(--border, #30363d);
  border-radius: 6px;
  color: var(--text, #e6edf3);
  font: inherit;
  font-size: 0.75rem;
}
.inspector-selector-input:focus {
  outline: none;
  border-color: var(--accent, #00ff88);
}
.inspector-match-count {
  font-size: 0.65rem;
  color: var(--accent, #00ff88);
}
</style>

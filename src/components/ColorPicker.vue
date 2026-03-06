<script setup>
import { ref, computed, watch } from 'vue'

const PALETTE_KEY = 'dimchatzis-color-palette'
const MAX_PALETTE = 10

const show = defineModel('show', { type: Boolean })
const hex = ref('#00ff88')
const rgb = ref({ r: 0, g: 255, b: 136 })
const copied = ref(false)
const copyFormat = ref('hex') // 'hex' | 'rgb' | 'hsl'

function hexToRgb(h) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const n = Math.max(0, Math.min(255, Math.round(x)))
    return n.toString(16).padStart(2, '0')
  }).join('').toLowerCase()
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      default: h = ((r - g) / d + 4) / 6
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1/6) return p + (q - p) * 6 * t
  if (t < 1/2) return q
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
  return p
}

const hsl = computed(() => rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b))

const hexNormalized = computed(() => {
  const h = (hex.value || '').trim()
  if (!/^#?[a-fA-F0-9]{6}$/.test(h)) return hex.value
  const norm = (h.startsWith('#') ? h : '#' + h).toLowerCase()
  return norm
})

function syncFromHex() {
  const h = (hex.value || '').trim()
  if (/^#?[a-fA-F0-9]{6}$/.test(h)) {
    const withHash = h.startsWith('#') ? h : '#' + h
    rgb.value = hexToRgb(withHash)
    hex.value = withHash.toLowerCase()
  }
}

function syncFromRgb() {
  hex.value = rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
}

watch(hex, syncFromHex, { immediate: true })
watch([() => rgb.value.r, () => rgb.value.g, () => rgb.value.b], syncFromRgb)

watch(show, (v) => { if (v) copied.value = false })

// Palette (saved colors)
const palette = ref(loadPalette())

function loadPalette() {
  try {
    const raw = localStorage.getItem(PALETTE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(s => /^#[a-f0-9]{6}$/i.test(s)).slice(0, MAX_PALETTE) : []
  } catch (_) {
    return []
  }
}

function savePalette() {
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(palette.value))
  } catch (_) {}
}

function addToPalette() {
  const h = (hex.value || '').trim()
  if (!/^#?[a-fA-F0-9]{6}$/.test(h)) return
  const norm = (h.startsWith('#') ? h : '#' + h).toLowerCase()
  palette.value = [norm, ...palette.value.filter(c => c !== norm)].slice(0, MAX_PALETTE)
  savePalette()
}

function removeFromPalette(color) {
  palette.value = palette.value.filter(c => c !== color)
  savePalette()
}

function setFromPalette(color) {
  hex.value = color
  syncFromHex()
}

// Copy formats
const copyText = computed(() => {
  const r = rgb.value.r, g = rgb.value.g, b = rgb.value.b
  const { h, s, l } = hsl.value
  const hx = hexNormalized.value
  switch (copyFormat.value) {
    case 'rgb': return `rgb(${r}, ${g}, ${b})`
    case 'hsl': return `hsl(${h}, ${s}%, ${l}%)`
    default: return hx
  }
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(copyText.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch (_) {}
}

// Contrast ratio (WCAG)
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const contrastWhite = computed(() => {
  const L1 = luminance(255, 255, 255)
  const L2 = luminance(rgb.value.r, rgb.value.g, rgb.value.b)
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
  return ratio.toFixed(1)
})

const contrastBlack = computed(() => {
  const L1 = luminance(0, 0, 0)
  const L2 = luminance(rgb.value.r, rgb.value.g, rgb.value.b)
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
  return ratio.toFixed(1)
})

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-color">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">color-picker.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <div class="color-preview-wrap">
              <div class="color-preview-bg color-preview-light">
                <div class="color-preview-fill" :style="{ background: hex }"></div>
              </div>
              <div class="color-preview-bg color-preview-dark">
                <div class="color-preview-fill" :style="{ background: hex }"></div>
              </div>
            </div>

            <div class="color-hex-row">
              <label class="color-label">Hex</label>
              <input v-model="hex" type="text" class="color-hex-input" maxlength="7" placeholder="#000000" />
            </div>

            <input v-model="hex" type="color" class="color-native" title="Pick color" />

            <div class="color-formats">
              <span class="color-label">Copy as</span>
              <div class="color-format-btns">
                <button type="button" class="format-btn" :class="{ active: copyFormat === 'hex' }" @click="copyFormat = 'hex'">Hex</button>
                <button type="button" class="format-btn" :class="{ active: copyFormat === 'rgb' }" @click="copyFormat = 'rgb'">RGB</button>
                <button type="button" class="format-btn" :class="{ active: copyFormat === 'hsl' }" @click="copyFormat = 'hsl'">HSL</button>
              </div>
              <button type="button" class="color-copy" @click="copyToClipboard">
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>

            <div class="color-rgb">
              <span class="color-label">RGB</span>
              <div class="color-rgb-inputs">
                <input v-model.number="rgb.r" type="number" min="0" max="255" class="color-rgb-num" />
                <input v-model.number="rgb.g" type="number" min="0" max="255" class="color-rgb-num" />
                <input v-model.number="rgb.b" type="number" min="0" max="255" class="color-rgb-num" />
              </div>
            </div>
            <div class="color-hsl">
              <span class="color-label">HSL</span>
              <span class="color-hsl-value">{{ hsl.h }}°, {{ hsl.s }}%, {{ hsl.l }}%</span>
            </div>

            <div class="color-contrast">
              <span class="color-label">Contrast</span>
              <div class="contrast-row">
                <span class="contrast-item" title="On white">⬜ {{ contrastWhite }}∶1</span>
                <span class="contrast-item" title="On black">⬛ {{ contrastBlack }}∶1</span>
              </div>
            </div>

            <div class="color-palette-section">
              <div class="palette-header">
                <span class="color-label">Palette</span>
                <button type="button" class="palette-save" @click="addToPalette">Save current</button>
              </div>
              <div v-if="palette.length" class="palette-swatches">
                <button
                  v-for="c in palette"
                  :key="c"
                  type="button"
                  class="palette-swatch"
                  :style="{ background: c }"
                  :title="c"
                  @click="setFromPalette(c)"
                  @contextmenu.prevent="removeFromPalette(c)"
                />
              </div>
              <p v-else class="palette-hint">Save colors for quick access. Right‑click a swatch to remove.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.app-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.app-modal-color {
  width: 100%;
  max-width: 340px;
  max-height: 90vh;
  overflow-y: auto;
}

.app-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card-hover);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.app-dot { width: 12px; height: 12px; border-radius: 50%; }
.app-dot.red { background: #ff5f56; }
.app-dot.yellow { background: #ffbd2e; }
.app-dot.green { background: var(--accent); }
.app-title { margin-left: 0.5rem; }
.app-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 4px;
}
.app-close:hover { color: var(--text); background: var(--border); }

.app-body { padding: 1.25rem 1.5rem 1.5rem; }

.color-preview-wrap {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-preview-bg {
  flex: 1;
  height: 56px;
  border-radius: 10px;
  border: 2px solid var(--border);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-preview-light { background: #fff; }
.color-preview-dark { background: #1a1a1a; }

.color-preview-fill {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.color-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.35rem;
}

.color-hex-row { margin-bottom: 0.5rem; }

.color-hex-input {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
}

.color-native {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  background: var(--bg);
}

.color-formats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-formats .color-label { margin-bottom: 0; margin-right: 0.25rem; }

.color-format-btns { display: flex; gap: 0.25rem; }
.format-btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg-card-hover);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}
.format-btn:hover { color: var(--text); border-color: var(--text-muted); }
.format-btn.active {
  background: var(--accent);
  color: var(--skip-link-text);
  border-color: var(--accent);
}

.color-copy {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  background: var(--accent);
  color: var(--skip-link-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.color-copy:hover { filter: brightness(1.1); }

.color-rgb { margin-bottom: 0.5rem; }
.color-rgb-inputs { display: flex; gap: 0.5rem; margin-top: 0.35rem; }
.color-rgb-num {
  width: 4rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.4rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
}

.color-hsl { margin-bottom: 1rem; }
.color-hsl-value {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
}

.color-contrast { margin-bottom: 1rem; }
.contrast-row { display: flex; gap: 1rem; margin-top: 0.35rem; }
.contrast-item {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.color-palette-section { border-top: 1px solid var(--border); padding-top: 1rem; }
.palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.palette-header .color-label { margin-bottom: 0; }
.palette-save {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-card-hover);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}
.palette-save:hover { color: var(--text); background: var(--border); }

.palette-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.palette-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid var(--border);
  cursor: pointer;
  padding: 0;
}
.palette-swatch:hover {
  border-color: var(--accent);
  transform: scale(1.05);
}

.palette-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>

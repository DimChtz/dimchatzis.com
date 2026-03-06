<script setup>
import { ref, computed } from 'vue'

const show = defineModel('show', { type: Boolean })

const display = ref('0')
const previous = ref(null)
const operation = ref(null)
const shouldResetDisplay = ref(false)

const displayFormatted = computed(() => {
  const s = display.value
  if (s === '' || s === '-') return s
  const n = parseFloat(s)
  if (isNaN(n)) return '0'
  if (n > 1e12 || (n < 1e-6 && n > -1e-6 && n !== 0)) return n.toExponential(4)
  const [int, dec] = s.split('.')
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec != null ? `${withCommas}.${dec}` : withCommas
})

function inputDigit(d) {
  if (shouldResetDisplay.value) {
    display.value = d
    shouldResetDisplay.value = false
  } else {
    if (display.value === '0' && d !== '.') display.value = d
    else if (d === '.' && display.value.includes('.')) return
    else display.value += d
  }
}

function inputOp(op) {
  const current = parseFloat(display.value) || 0
  if (previous.value != null && operation.value && !shouldResetDisplay.value) {
    const result = calculate(previous.value, current, operation.value)
    display.value = String(result)
    previous.value = result
  } else {
    previous.value = current
  }
  operation.value = op
  shouldResetDisplay.value = true
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    default: return b
  }
}

function equals() {
  if (previous.value == null || operation.value == null) return
  const current = parseFloat(display.value) || 0
  const result = calculate(previous.value, current, operation.value)
  display.value = isNaN(result) ? 'Error' : String(result)
  previous.value = null
  operation.value = null
  shouldResetDisplay.value = true
}

function clearEntry() {
  display.value = '0'
  shouldResetDisplay.value = false
}

function clearAll() {
  display.value = '0'
  previous.value = null
  operation.value = null
  shouldResetDisplay.value = false
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">calculator.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <div class="calc-display" aria-live="polite">{{ displayFormatted }}</div>
            <div class="calc-keys">
              <button type="button" class="calc-key calc-key-op" @click="clearAll">AC</button>
              <button type="button" class="calc-key calc-key-op" @click="clearEntry">C</button>
              <button type="button" class="calc-key calc-key-op" @click="inputOp('×')">×</button>
              <button type="button" class="calc-key calc-key-op" @click="inputOp('÷')">÷</button>
              <button type="button" class="calc-key" @click="inputDigit('7')">7</button>
              <button type="button" class="calc-key" @click="inputDigit('8')">8</button>
              <button type="button" class="calc-key" @click="inputDigit('9')">9</button>
              <button type="button" class="calc-key calc-key-op" @click="inputOp('−')">−</button>
              <button type="button" class="calc-key" @click="inputDigit('4')">4</button>
              <button type="button" class="calc-key" @click="inputDigit('5')">5</button>
              <button type="button" class="calc-key" @click="inputDigit('6')">6</button>
              <button type="button" class="calc-key calc-key-op" @click="inputOp('+')">+</button>
              <button type="button" class="calc-key" @click="inputDigit('1')">1</button>
              <button type="button" class="calc-key" @click="inputDigit('2')">2</button>
              <button type="button" class="calc-key" @click="inputDigit('3')">3</button>
              <button type="button" class="calc-key calc-key-eq" @click="equals">=</button>
              <button type="button" class="calc-key calc-key-wide" @click="inputDigit('0')">0</button>
              <button type="button" class="calc-key" @click="inputDigit('.')">.</button>
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

.app-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.app-dot.red { background: #ff5f56; }
.app-dot.yellow { background: #ffbd2e; }
.app-dot.green { background: var(--accent); }

.app-title {
  margin-left: 0.5rem;
}

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
.app-close:hover {
  color: var(--text);
  background: var(--border);
}

.app-body {
  padding: 1rem 1.5rem 1.5rem;
}

.calc-display {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  text-align: right;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: var(--accent);
  min-height: 2.5rem;
  word-break: break-all;
}

.calc-keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 260px;
}

.calc-key {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  padding: 0.75rem;
  background: var(--bg-card-hover);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.calc-key:hover {
  background: var(--border);
  border-color: var(--accent);
}
.calc-key:active {
  transform: scale(0.98);
}

.calc-key-op {
  color: var(--cyan);
}
.calc-key-eq {
  grid-row: span 2;
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent);
  border-color: var(--accent-dim);
}
.calc-key-eq:hover {
  background: rgba(0, 255, 136, 0.25);
}
.calc-key-wide {
  grid-column: span 2;
}

.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 0.2s ease;
}
.game-modal-enter-from,
.game-modal-leave-to {
  opacity: 0;
}
.game-modal-enter-active .app-modal,
.game-modal-leave-active .app-modal {
  transition: transform 0.2s ease;
}
.game-modal-enter-from .app-modal,
.game-modal-leave-to .app-modal {
  transform: scale(0.95);
}
</style>

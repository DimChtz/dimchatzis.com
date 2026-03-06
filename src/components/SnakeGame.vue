<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const GRID = 20
const CELL = 18
const SIZE = GRID * CELL
const SPEED = 120

const show = defineModel('show', { type: Boolean })
const score = ref(0)
const gameOver = ref(false)
const running = ref(false)
const canvasRef = ref(null)

let snake = []
let food = { x: 0, y: 0 }
let dir = { x: 1, y: 0 }
let nextDir = { x: 1, y: 0 }
let loopId = null

function randCell() {
  return { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
}

function placeFood() {
  do {
    food = randCell()
  } while (snake.some(s => s.x === food.x && s.y === food.y))
}

function reset() {
  snake = [
    { x: Math.floor(GRID / 2), y: Math.floor(GRID / 2) },
    { x: Math.floor(GRID / 2) - 1, y: Math.floor(GRID / 2) },
    { x: Math.floor(GRID / 2) - 2, y: Math.floor(GRID / 2) },
  ]
  dir = { x: 1, y: 0 }
  nextDir = { x: 1, y: 0 }
  score.value = 0
  gameOver.value = false
  placeFood()
  draw()
}

let canvasScaled = false

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!canvasScaled) {
    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = SIZE + 'px'
    canvas.style.height = SIZE + 'px'
    ctx.scale(dpr, dpr)
    canvasScaled = true
  }

  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, SIZE, SIZE)

  ctx.strokeStyle = '#30363d'
  ctx.lineWidth = 1
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath()
    ctx.moveTo(i * CELL, 0)
    ctx.lineTo(i * CELL, SIZE)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * CELL)
    ctx.lineTo(SIZE, i * CELL)
    ctx.stroke()
  }

  ctx.fillStyle = '#00ff88'
  ctx.beginPath()
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2)
  ctx.fill()

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#58d1e0' : '#00cc6a'
    ctx.fillRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4)
  })
}

function tick() {
  if (gameOver.value) return
  dir = { ...nextDir }
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver.value = true
    running.value = false
    if (loopId) clearInterval(loopId)
    return
  }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score.value++
    placeFood()
  } else {
    snake.pop()
  }
  draw()
}

function start() {
  reset()
  running.value = true
  if (loopId) clearInterval(loopId)
  loopId = setInterval(tick, SPEED)
}

function handleKey(e) {
  if (!show.value || !running.value) return
  const k = e.key
  if (k === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 }
  else if (k === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 }
  else if (k === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 }
  else if (k === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault()
}

watch(show, (v) => {
  if (v) {
    canvasScaled = false
    nextTick(() => start())
  } else {
    running.value = false
    if (loopId) clearInterval(loopId)
  }
})

function close() {
  show.value = false
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  if (loopId) clearInterval(loopId)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="game-overlay" @click.self="close">
        <div class="game-modal">
          <div class="game-bar">
            <span class="game-dot red"></span>
            <span class="game-dot yellow"></span>
            <span class="game-dot green"></span>
            <span class="game-title">snake.exe</span>
            <button type="button" class="game-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="game-body">
            <p class="game-hint">↑↓←→ to move · eat the green dots</p>
            <div class="game-canvas-wrap">
              <canvas ref="canvasRef" class="game-canvas" :width="SIZE" :height="SIZE"></canvas>
              <div v-if="gameOver" class="game-overlay-msg">
                <p class="game-over-title">Game Over</p>
                <p class="game-over-score">Score: {{ score }}</p>
                <button type="button" class="game-btn" @click="start">Play again</button>
              </div>
            </div>
            <p class="game-score">Score: <strong>{{ score }}</strong></p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.game-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.game-modal {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.game-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #21262d;
  border-bottom: 1px solid #30363d;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8b949e;
}

.game-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.game-dot.red { background: #ff5f56; }
.game-dot.yellow { background: #ffbd2e; }
.game-dot.green { background: #00ff88; }

.game-title {
  margin-left: 0.5rem;
}

.game-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #8b949e;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 4px;
}
.game-close:hover {
  color: #e6edf3;
  background: #30363d;
}

.game-body {
  padding: 1rem 1.5rem 1.5rem;
}

.game-hint {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8b949e;
  margin-bottom: 0.75rem;
}

.game-canvas-wrap {
  position: relative;
  display: inline-block;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
}

.game-canvas {
  display: block;
  vertical-align: top;
}

.game-overlay-msg {
  position: absolute;
  inset: 0;
  background: rgba(13, 17, 23, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.game-over-title {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  color: #00ff88;
}

.game-over-score {
  font-family: var(--font-mono);
  color: #8b949e;
}

.game-btn {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid #00cc6a;
  border-radius: 6px;
  cursor: pointer;
}
.game-btn:hover {
  background: rgba(0, 255, 136, 0.3);
}

.game-score {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: #8b949e;
  margin-top: 0.75rem;
}

.game-score strong {
  color: #00ff88;
}

.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 0.2s ease;
}
.game-modal-enter-from,
.game-modal-leave-to {
  opacity: 0;
}
.game-modal-enter-active .game-modal,
.game-modal-leave-active .game-modal {
  transition: transform 0.2s ease;
}
.game-modal-enter-from .game-modal,
.game-modal-leave-to .game-modal {
  transform: scale(0.95);
}
</style>

<script setup>
import { ref, computed } from 'vue'

const show = defineModel('show', { type: Boolean })

const builds = [
  { id: 'feature', label: 'A feature', emoji: '✨' },
  { id: 'fix', label: 'A fix', emoji: '🐛' },
  { id: 'side', label: 'A side project', emoji: '🚀' },
  { id: 'scale', label: 'Something that scales', emoji: '📈' },
]

const stackOptions = [
  'React', 'Vue', 'Rails', 'Node', 'Python', 'Postgres', 'MongoDB', 'Redis', 'TypeScript',
]

const selectedBuild = ref(null)
const selectedStack = ref([])
const shipped = ref(false)
const resultMessage = ref('')

const canShip = computed(() => selectedBuild.value && selectedStack.value.length > 0)

const outcomes = [
  "No regressions. You're hired.",
  "CI is green. Legend.",
  "Merged to main. The bug was a typo.",
  "Deployed to prod. Time for coffee.",
  "Ship it. Then ship the fix. Then ship the fix for the fix.",
  "Code review: LGTM. 🚀",
  "Tests passed. Users didn't. (Just kidding.)",
  "Pushed. Now go touch grass.",
]

function toggleStack(tech) {
  const i = selectedStack.value.indexOf(tech)
  if (i === -1) {
    if (selectedStack.value.length < 4) selectedStack.value = [...selectedStack.value, tech]
  } else {
    selectedStack.value = selectedStack.value.filter((_, j) => j !== i)
  }
}

function shipIt() {
  if (!canShip.value) return
  shipped.value = true
  resultMessage.value = outcomes[Math.floor(Math.random() * outcomes.length)]
}

function close() {
  show.value = false
  setTimeout(() => {
    selectedBuild.value = null
    selectedStack.value = []
    shipped.value = false
  }, 300)
}
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
            <span class="game-title">build-something.exe</span>
            <button type="button" class="game-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="game-body">
            <template v-if="!shipped">
              <p class="game-intro">Step into the dev world. Pick what you're building and your stack — then ship it.</p>

              <div class="game-step">
                <span class="game-step-label">1. What do you want to build?</span>
                <div class="game-options">
                  <button
                    v-for="b in builds"
                    :key="b.id"
                    type="button"
                    class="game-option"
                    :class="{ active: selectedBuild === b.id }"
                    @click="selectedBuild = b.id"
                  >
                    <span class="game-option-emoji">{{ b.emoji }}</span>
                    {{ b.label }}
                  </button>
                </div>
              </div>

              <div class="game-step">
                <span class="game-step-label">2. Pick your stack (1–4)</span>
                <div class="game-stack">
                  <button
                    v-for="tech in stackOptions"
                    :key="tech"
                    type="button"
                    class="game-stack-tag"
                    :class="{ active: selectedStack.includes(tech) }"
                    @click="toggleStack(tech)"
                  >
                    {{ tech }}
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="game-ship-btn"
                :disabled="!canShip"
                @click="shipIt"
              >
                Ship it 🚀
              </button>
            </template>

            <div v-else class="game-result">
              <div class="game-result-confetti" aria-hidden="true">
                <span v-for="i in 12" :key="i" class="confetti-dot" :style="{ '--i': i }"></span>
              </div>
              <p class="game-result-title">You shipped it.</p>
              <p class="game-result-build">
                <strong>{{ builds.find(b => b.id === selectedBuild)?.label }}</strong>
                <span v-if="selectedStack.length"> with {{ selectedStack.join(', ') }}</span>.
              </p>
              <p class="game-result-punch">{{ resultMessage }}</p>
              <button type="button" class="game-btn" @click="close">Close</button>
            </div>
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
  max-width: 480px;
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

.game-dot { width: 12px; height: 12px; border-radius: 50%; }
.game-dot.red { background: #ff5f56; }
.game-dot.yellow { background: #ffbd2e; }
.game-dot.green { background: #00ff88; }

.game-title { margin-left: 0.5rem; }

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
.game-close:hover { color: #e6edf3; background: #30363d; }

.game-body { padding: 1.25rem 1.5rem 1.5rem; }

.game-intro {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.game-step { margin-bottom: 1.25rem; }

.game-step-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.game-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.game-option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.game-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
.game-option.active {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--accent-dim);
  color: var(--accent);
}

.game-option-emoji { font-size: 1rem; }

.game-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.game-stack-tag {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.game-stack-tag:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
.game-stack-tag.active {
  background: rgba(88, 209, 224, 0.2);
  border-color: var(--cyan);
  color: var(--cyan);
}

.game-ship-btn {
  font-family: var(--font-mono);
  font-size: 1rem;
  padding: 0.6rem 1.25rem;
  margin-top: 0.5rem;
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
}
.game-ship-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.3);
  border-color: var(--accent);
}
.game-ship-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Result */
.game-result {
  position: relative;
  text-align: center;
  padding: 0.5rem 0;
}

.game-result-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  top: 50%;
  left: 50%;
  animation: confetti 1s ease-out forwards;
  opacity: 0;
}
.confetti-dot:nth-child(odd) { background: var(--cyan); }
.confetti-dot:nth-child(3n) { background: var(--purple); }
.confetti-dot:nth-child(5n) { background: var(--yellow); }
.confetti-dot:nth-child(1) { animation-delay: 0ms; --tx: 40px; --ty: -60px; }
.confetti-dot:nth-child(2) { animation-delay: 50ms; --tx: 70px; --ty: -30px; }
.confetti-dot:nth-child(3) { animation-delay: 100ms; --tx: 60px; --ty: 20px; }
.confetti-dot:nth-child(4) { animation-delay: 30ms; --tx: 0; --ty: -80px; }
.confetti-dot:nth-child(5) { animation-delay: 80ms; --tx: -50px; --ty: -50px; }
.confetti-dot:nth-child(6) { animation-delay: 120ms; --tx: -70px; --ty: 10px; }
.confetti-dot:nth-child(7) { animation-delay: 20ms; --tx: -40px; --ty: -60px; }
.confetti-dot:nth-child(8) { animation-delay: 90ms; --tx: 30px; --ty: -40px; }
.confetti-dot:nth-child(9) { animation-delay: 60ms; --tx: -60px; --ty: -20px; }
.confetti-dot:nth-child(10) { animation-delay: 110ms; --tx: 50px; --ty: -50px; }
.confetti-dot:nth-child(11) { animation-delay: 40ms; --tx: -30px; --ty: -70px; }
.confetti-dot:nth-child(12) { animation-delay: 70ms; --tx: 20px; --ty: -40px; }

@keyframes confetti {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
  }
}

.game-result-title {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 0.75rem;
}

.game-result-build {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.game-result-build strong { color: var(--text); }

.game-result-punch {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--cyan);
  margin-bottom: 1.25rem;
  font-style: italic;
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
.game-btn:hover { background: rgba(0, 255, 136, 0.3); }

.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 0.2s ease;
}
.game-modal-enter-from,
.game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .game-modal,
.game-modal-leave-active .game-modal {
  transition: transform 0.2s ease;
}
.game-modal-enter-from .game-modal,
.game-modal-leave-to .game-modal {
  transform: scale(0.95);
}
</style>

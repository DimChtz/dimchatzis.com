<script setup>
import { ref, watch } from 'vue'

const show = defineModel('show', { type: Boolean })

const problem = ref('')
const reply = ref('')
const replied = ref(false)
const duckBounce = ref(false)

const DUCK_RESPONSES = [
  "Have you tried turning it off and on again? *quack*",
  "That's a classic off-by-one. I've seen it a thousand times. *squeak*",
  "Explain it to me again, but slower. I'm a duck. *quack*",
  "So what you're saying is... you don't know what you're doing. Same. *quack*",
  "Did you check Stack Overflow? I would, but I don't have thumbs. *quack*",
  "Sounds like a race condition. Or you need more coffee. Both. *quack*",
  "The bug is in the code you didn't write. It's always in the code you didn't write. *wise quack*",
  "Have you tried console.log? Have you tried 47 console.logs? *quack*",
  "I'm just a duck. But even I know: restart the server. *quack*",
  "Null. Undefined. Same thing, right? *nervous quack*",
  "Your code works on my pond. *quack*",
  "Maybe the real bug was the friends we made along the way. *philosophical quack*",
  "Error: Cannot read property 'quack' of undefined. Wait, that's me. *quack*",
  "Have you tried rubber duck debugging? Oh. You are. Hi. *quack*",
  "The best debugging tool is explaining it to someone who can't help. You're welcome. *quack*",
  "I've been staring at this with you for 20 minutes. I still don't get it. *quack*",
  "Delete the code. Delete the code. Delete the code. — The Duck in the Hat *quack*",
  "It's not a bug, it's a feature. Said no duck ever. *quack*",
  "Try adding a comment that says FIXME. Future you will handle it. *quack*",
  "The variable is in scope. I can feel it. *mystical quack*",
  "Have you tried turning it off and on again? I know I said that already. *quack*",
  "Sounds like a caching issue. Clear everything. Burn the cache. *quack*",
  "I'm 80% rubber and 100% supportive. You've got this. *quack*",
  "The compiler is never wrong. It's never wrong. *traumatic quack*",
  "Just add more ducks. *quack* *quack* *quack*",
  "Have you tried explaining it to a different duck? *quack*",
  "I have no idea what you're talking about. But I believe in you. *quack*",
]

function getRandomResponse() {
  return DUCK_RESPONSES[Math.floor(Math.random() * DUCK_RESPONSES.length)]
}

// Generated WAV quack: ~500 Hz fundamental, harmonics, 10 Hz wobble, fast attack (real quack shape)
let quackBlobUrl = null
function getQuackBlobUrl() {
  if (quackBlobUrl) return quackBlobUrl
  const sampleRate = 22050
  const duration = 0.14
  const n = Math.floor(sampleRate * duration)
  const samples = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    const attack = Math.min(1, t / 0.012)
    const decay = Math.exp(-t / 0.04)
    const envelope = attack * decay
    const wobble = 0.92 + 0.08 * Math.sin(2 * Math.PI * 10 * t)
    const f = 520 - 80 * Math.min(1, t / 0.06)
    const fundamental = Math.sin(2 * Math.PI * f * t)
    const harmonic2 = 0.35 * Math.sin(2 * Math.PI * f * 2 * t)
    const harmonic3 = 0.15 * Math.sin(2 * Math.PI * f * 3 * t)
    const noise = (Math.random() * 2 - 1) * 0.12
    const s = envelope * wobble * (fundamental + harmonic2 + harmonic3 + noise)
    samples[i] = Math.max(-1, Math.min(1, s))
  }
  const pcm = new Int16Array(n)
  for (let i = 0; i < n; i++) pcm[i] = Math.max(-32768, Math.min(32767, samples[i] * 32767))
  const dataLen = pcm.byteLength
  const buf = new ArrayBuffer(44 + dataLen)
  const view = new DataView(buf)
  const write = (offset, val, little = true) => { view.setUint32(offset, val, little) }
  const write16 = (offset, val, little = true) => { view.setUint16(offset, val, little) }
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46)
  write(4, 36 + dataLen, true)
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45)
  view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20)
  write(16, 16, true)
  write16(20, 1, true)
  write16(22, 1, true)
  write(24, sampleRate, true)
  write(28, sampleRate * 2, true)
  write16(32, 2, true)
  write16(34, 16, true)
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61)
  write(40, dataLen, true)
  new Uint16Array(buf, 44).set(pcm)
  quackBlobUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
  return quackBlobUrl
}

function playQuack() {
  try {
    const url = getQuackBlobUrl()
    const audio = new Audio(url)
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (_) {}
}

function askDuck() {
  const text = problem.value.trim()
  if (!text) return
  duckBounce.value = true
  replied.value = true
  reply.value = getRandomResponse()
  playQuack()
  setTimeout(() => { duckBounce.value = false }, 400)
}

function close() {
  show.value = false
}

function reset() {
  problem.value = ''
  reply.value = ''
  replied.value = false
}

watch(show, (visible) => {
  if (!visible) reset()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal rubberduck-modal">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">rubberduck.exe — Debugging session</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body rubberduck-body">
            <div class="rubberduck-stage">
              <div class="duck-wrap" :class="{ bounce: duckBounce }">
                <!-- Cute cartoon rubber duck – curved wing lines, cheek blushes, smile, tongue -->
                <svg class="duck-svg" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="duck-body" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" style="stop-color:#FFF59D"/>
                      <stop offset="25%" style="stop-color:#FFEB3B"/>
                      <stop offset="60%" style="stop-color:#FDD835"/>
                      <stop offset="100%" style="stop-color:#F9A825"/>
                    </linearGradient>
                    <linearGradient id="duck-body-shadow" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" style="stop-color:#FDD835;stop-opacity:0"/>
                      <stop offset="100%" style="stop-color:#E65100;stop-opacity:0.2"/>
                    </linearGradient>
                    <linearGradient id="duck-bill" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" style="stop-color:#FFB74D"/>
                      <stop offset="100%" style="stop-color:#FF9800"/>
                    </linearGradient>
                    <linearGradient id="duck-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" style="stop-color:#FFFDE7;stop-opacity:0.85"/>
                      <stop offset="100%" style="stop-color:#FFFDE7;stop-opacity:0"/>
                    </linearGradient>
                    <filter id="duck-shadow" x="-20%" y="-10%" width="140%" height="130%">
                      <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.08"/>
                    </filter>
                  </defs>
                  <g filter="url(#duck-shadow)">
                    <!-- Body (plump, round) with subtle bottom shading -->
                    <ellipse cx="60" cy="58" rx="35" ry="28" fill="url(#duck-body)" stroke="#1a1a2e" stroke-width="2.2"/>
                    <ellipse cx="60" cy="72" rx="28" ry="12" fill="url(#duck-body-shadow)"/>
                    <!-- Head (proportionally large, round) -->
                    <circle cx="60" cy="30" r="24" fill="url(#duck-body)" stroke="#1a1a2e" stroke-width="2.2"/>
                    <!-- Bottom-of-head subtle shade -->
                    <ellipse cx="60" cy="48" rx="18" ry="8" fill="url(#duck-body-shadow)"/>
                    <!-- Top-of-head highlight (sparing) -->
                    <ellipse cx="52" cy="20" rx="11" ry="6" fill="url(#duck-highlight)" opacity="0.8"/>
                    <!-- Left wing – curved line tucked at side -->
                    <path fill="none" stroke="#1a1a2e" stroke-width="2.2" stroke-linecap="round"
                      d="M 32 52 Q 26 56 28 62 Q 30 58 34 54"/>
                    <!-- Right wing – curved line -->
                    <path fill="none" stroke="#1a1a2e" stroke-width="2.2" stroke-linecap="round"
                      d="M 88 52 Q 94 56 92 62 Q 90 58 86 54"/>
                    <!-- Beak (wide, orange) -->
                    <path fill="url(#duck-bill)" stroke="#1a1a2e" stroke-width="2.2" stroke-linejoin="round"
                      d="M 42 38 Q 60 44 78 38 Q 60 50 42 38 Z"/>
                    <!-- Open mouth with tongue (pink/reddish) -->
                    <path fill="#E57373" d="M 50 40 Q 60 44 70 40 Q 60 46 50 40 Z"/>
                    <!-- Smile lines (upward curves at corners) -->
                    <path fill="none" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"
                      d="M 48 42 Q 52 44 56 43"/>
                    <path fill="none" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"
                      d="M 64 43 Q 68 44 72 42"/>
                    <!-- Left eye -->
                    <circle cx="46" cy="26" r="5" fill="#1a1a1a" stroke="#1a1a2e" stroke-width="2"/>
                    <circle cx="47" cy="25" r="1.2" fill="#fff"/>
                    <!-- Right eye -->
                    <circle cx="74" cy="26" r="5" fill="#1a1a1a" stroke="#1a1a2e" stroke-width="2"/>
                    <circle cx="75" cy="25" r="1.2" fill="#fff"/>
                    <!-- Cheek blushes (faint light orange) -->
                    <ellipse cx="38" cy="34" rx="5" ry="4" fill="#FFAB91" opacity="0.45"/>
                    <ellipse cx="82" cy="34" rx="5" ry="4" fill="#FFAB91" opacity="0.45"/>
                  </g>
                </svg>
              </div>
              <p v-if="!replied" class="duck-prompt">Explain your bug to the duck. It won't judge. (It might quack.)</p>
              <div v-else class="duck-reply">
                <p class="duck-reply-label">The duck says:</p>
                <p class="duck-reply-text">{{ reply }}</p>
                <button type="button" class="duck-again" @click="replied = false; reply = ''">Ask again</button>
              </div>
            </div>
            <div class="rubberduck-input-wrap">
              <input
                v-model="problem"
                type="text"
                class="rubberduck-input"
                placeholder="e.g. My state is undefined but I set it in useEffect..."
                maxlength="500"
                @keydown.enter="askDuck"
              />
              <button type="button" class="rubberduck-btn" :disabled="!problem.trim()" @click="askDuck">
                Quack at duck
              </button>
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
}
.app-close:hover { color: var(--text); }

.rubberduck-body {
  padding: 1.5rem;
  min-width: 320px;
  max-width: 420px;
}

.rubberduck-stage {
  text-align: center;
  margin-bottom: 1.25rem;
}

.duck-wrap {
  display: inline-block;
  margin-bottom: 0.75rem;
}
.duck-wrap.bounce {
  animation: duck-bounce 0.4s ease;
}
@keyframes duck-bounce {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.08) translateY(-8px); }
}

.duck-svg {
  width: 100px;
  height: 84px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
}

.duck-prompt {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.duck-reply {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}
.duck-reply-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 0.35rem 0;
}
.duck-reply-text {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text);
  margin: 0 0 0.75rem 0;
  line-height: 1.45;
}
.duck-again {
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg-card-hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
}
.duck-again:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.rubberduck-input-wrap {
  display: flex;
  gap: 0.5rem;
}
.rubberduck-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
}
.rubberduck-input::placeholder {
  color: var(--text-muted);
  opacity: 0.8;
}
.rubberduck-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.rubberduck-btn {
  padding: 0.6rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--accent);
  color: var(--skip-link-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.rubberduck-btn:hover:not(:disabled) {
  filter: brightness(1.1);
}
.rubberduck-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  transform: scale(0.96);
}
</style>

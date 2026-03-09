<script setup>
import { dismissPlayPrompt } from '../utils/playPromptStorage'
import WindowDots from './WindowDots.vue'

const show = defineModel('show', { type: Boolean })
const emit = defineEmits(['play'])

function onYes() {
  dismissPlayPrompt(true)
  show.value = false
  emit('play')
}

function onNo() {
  dismissPlayPrompt(false)
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="prompt-modal">
      <div v-if="show" class="prompt-overlay" @click.self="onNo">
        <div class="prompt-box">
          <div class="prompt-bar">
            <WindowDots />
            <span class="prompt-bar-title">hey there</span>
          </div>
          <div class="prompt-body">
            <p class="prompt-question">Want to play a quick game and step into the dev world?</p>
            <p class="prompt-sub">Build something in 10 seconds — no install required.</p>
            <div class="prompt-actions">
              <button type="button" class="prompt-btn primary" @click="onYes">Yes, let's go</button>
              <button type="button" class="prompt-btn secondary" @click="onNo">Maybe later</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.prompt-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  max-width: 400px;
}

.prompt-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #21262d;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.prompt-bar-title {
  margin-left: 0.5rem;
}

.prompt-body {
  padding: 1.5rem;
}

.prompt-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.prompt-sub {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.prompt-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.prompt-btn {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}

.prompt-btn.primary {
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border-color: var(--accent-dim);
}
.prompt-btn.primary:hover {
  background: rgba(0, 255, 136, 0.3);
  border-color: var(--accent);
}

.prompt-btn.secondary {
  background: transparent;
  color: var(--text-muted);
  border-color: var(--border);
}
.prompt-btn.secondary:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.prompt-modal-enter-active,
.prompt-modal-leave-active {
  transition: opacity 0.2s ease;
}
.prompt-modal-enter-from,
.prompt-modal-leave-to {
  opacity: 0;
}
.prompt-modal-enter-active .prompt-box,
.prompt-modal-leave-active .prompt-box {
  transition: transform 0.2s ease;
}
.prompt-modal-enter-from .prompt-box,
.prompt-modal-leave-to .prompt-box {
  transform: scale(0.95);
}
</style>

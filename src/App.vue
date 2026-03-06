<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { cv } from './data/cv'
import { shouldShowPlayPrompt } from './utils/playPromptStorage'
import { useTheme, THEME_KEY } from './composables/useTheme'
import { useTerminal } from './composables/useTerminal'
import PlayPromptModal from './components/PlayPromptModal.vue'
import TerminalHero from './components/TerminalHero.vue'
import CvMain from './components/CvMain.vue'

const BuildSomethingGame = defineAsyncComponent(() => import('./components/BuildSomethingGame.vue'))
const SnakeGame = defineAsyncComponent(() => import('./components/SnakeGame.vue'))
const Calculator = defineAsyncComponent(() => import('./components/Calculator.vue'))
const Notepad = defineAsyncComponent(() => import('./components/Notepad.vue'))
const TypingSpeedTest = defineAsyncComponent(() => import('./components/TypingSpeedTest.vue'))
const Base64Url = defineAsyncComponent(() => import('./components/Base64Url.vue'))
const QrCode = defineAsyncComponent(() => import('./components/QrCode.vue'))
const Pomodoro = defineAsyncComponent(() => import('./components/Pomodoro.vue'))
const ColorPicker = defineAsyncComponent(() => import('./components/ColorPicker.vue'))
const Stopwatch = defineAsyncComponent(() => import('./components/Stopwatch.vue'))
const PasswordGenerator = defineAsyncComponent(() => import('./components/PasswordGenerator.vue'))
const RubberDuck = defineAsyncComponent(() => import('./components/RubberDuck.vue'))

const showPlayPrompt = ref(false)
const buildGameOpen = ref(false)
const gameOpen = ref(false)
const calculatorOpen = ref(false)
const notepadOpen = ref(false)
const typingTestOpen = ref(false)
const encoderOpen = ref(false)
const qrcodeOpen = ref(false)
const pomodoroOpen = ref(false)
const colorPickerOpen = ref(false)
const stopwatchOpen = ref(false)
const passwordOpen = ref(false)
const duckOpen = ref(false)

const appRefs = {
  showPlayPrompt,
  buildGameOpen,
  gameOpen,
  calculatorOpen,
  notepadOpen,
  typingTestOpen,
  encoderOpen,
  qrcodeOpen,
  pomodoroOpen,
  colorPickerOpen,
  stopwatchOpen,
  passwordOpen,
  duckOpen,
}

const { theme, applyTheme, toggleTheme } = useTheme()
const terminal = useTerminal(cv, appRefs, { theme, applyTheme, toggleTheme })

watch([terminal.terminalLines, terminal.commandHistory], () => terminal.scrollTerminalToBottom(), { deep: true })

const modalRefs = [
  showPlayPrompt,
  buildGameOpen,
  gameOpen,
  calculatorOpen,
  notepadOpen,
  typingTestOpen,
  encoderOpen,
  qrcodeOpen,
  pomodoroOpen,
  colorPickerOpen,
  stopwatchOpen,
  passwordOpen,
  duckOpen,
]
watch(
  () => modalRefs.map((r) => r.value),
  (open, prev) => {
    const wasOpen = prev && prev.some(Boolean)
    const isOpen = open && open.some(Boolean)
    if (wasOpen && !isOpen && terminal.inputReady.value) {
      nextTick(() => terminal.inputRef.value?.focus())
    }
  }
)

function focusMainContent() {
  const el = terminal.mainRef.value
  if (el) {
    el.focus()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onPlayPrompt() {
  appRefs.buildGameOpen.value = true
}

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') applyTheme(saved)
  else document.documentElement.setAttribute('data-theme', 'dark')
  if (shouldShowPlayPrompt()) {
    showPlayPrompt.value = true
  }
  setTimeout(terminal.typeNextChar, 500)
  document.addEventListener('fullscreenchange', terminal.onFullscreenChange)
})
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', terminal.onFullscreenChange)
})
</script>

<template>
  <div class="cv-page">
    <a href="#main-content" class="skip-link no-print" @click.prevent="focusMainContent">Skip to CV</a>
    <TerminalHero
      :cv="cv"
      :terminal="terminal"
      :theme="theme"
      @toggle-theme="toggleTheme"
    />
    <CvMain :cv="cv" :main-ref="terminal.mainRef" />

    <PlayPromptModal v-model:show="showPlayPrompt" @play="onPlayPrompt" />
    <BuildSomethingGame v-model:show="buildGameOpen" />
    <SnakeGame v-model:show="gameOpen" />
    <Calculator v-model:show="calculatorOpen" />
    <Notepad v-model:show="notepadOpen" />
    <TypingSpeedTest v-model:show="typingTestOpen" />
    <Base64Url v-model:show="encoderOpen" />
    <QrCode v-model:show="qrcodeOpen" />
    <Pomodoro v-model:show="pomodoroOpen" />
    <ColorPicker v-model:show="colorPickerOpen" />
    <Stopwatch v-model:show="stopwatchOpen" />
    <PasswordGenerator v-model:show="passwordOpen" />
    <RubberDuck v-model:show="duckOpen" />
  </div>
</template>

<style scoped>
.cv-page {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0.75rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: var(--skip-link-text);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  transition: left 0.2s, box-shadow 0.2s;
}
.skip-link:focus {
  left: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 255, 136, 0.4);
}
</style>

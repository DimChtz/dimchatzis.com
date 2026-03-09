<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { cv } from './data/cv'
import { siteConfig } from './config/site'
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
const projectFilter = ref('all')

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
  projectFilter,
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

const navItems = [
  { href: '#about', label: 'About', description: 'The human behind the code' },
  { href: '#experience', label: 'Experience', description: 'Where I\'ve been paid to think' },
  { href: '#education', label: 'Education', description: 'Formal proof I can read' },
  { href: '#skills', label: 'Skills', description: 'Things I can pretend to be good at' },
  { href: '#projects', label: 'Projects', description: 'Stuff I built instead of sleeping' },
  { href: '#research', label: 'Research', description: 'Papers and pain' },
]

const highlightedProjects = computed(() =>
  (cv.projects || []).filter((p) => p.highlighted === true)
)

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
    <aside class="cv-sidebar no-print" aria-label="Sidebar">
      <div class="cv-widgets">
        <div class="cv-widget">
          <nav class="cv-nav" aria-label="CV sections">
            <span class="cv-nav__title">On this page</span>
            <ul class="cv-nav__list">
              <li v-for="item in navItems" :key="item.href" class="cv-nav__item">
                <a :href="item.href" class="cv-nav__link">{{ item.label }}</a>
                <span v-if="item.description" class="cv-nav__desc">{{ item.description }}</span>
              </li>
            </ul>
          </nav>
        </div>
        <div class="cv-widget">
          <span class="cv-widget__label">Elsewhere</span>
          <div class="cv-widget__links">
            <a
              v-for="link in cv.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="cv-widget__social"
              :title="link.label"
              :aria-label="link.label"
            >
              <span class="cv-widget__social-icon" aria-hidden="true">
                <!-- Same as hero-link icons in TerminalHero -->
                <svg v-if="link.icon === 'linkedin'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <svg v-else-if="link.icon === 'github'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <svg v-else-if="link.icon === 'stackoverflow'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.24 19.399v-4.804h1.6V21H4.381v-6.405h1.598v4.804H17.24zM7.582 17.8h8.055v-1.604H7.582V17.8zm.195-3.64 7.859 1.641.34-1.552-7.861-1.642-.338 1.553zm1.018-3.794 7.281 3.398.678-1.463-7.281-3.399-.678 1.454v.01zm2.037-3.589 6.166 5.142 1.018-1.216-6.162-5.14-1.016 1.213-.006.001zm3.982-3.778-1.311.969 4.803 6.454 1.313-.971-4.807-6.452h.002z"/></svg>
                <svg v-else-if="link.icon === 'researchgate'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
              </span>
            </a>
          </div>
        </div>
        <div class="cv-widget">
          <span class="cv-widget__label">Projects</span>
          <ul class="cv-widget__project-list">
            <li v-for="p in highlightedProjects" :key="p.repo" class="cv-widget__project-item">
              <a :href="p.repo" target="_blank" rel="noopener noreferrer" class="cv-widget__project-link" :title="p.title">{{ p.title }}</a>
            </li>
          </ul>
          <a href="#projects" class="cv-widget__link cv-widget__link--see-all">
            See all
            <span class="cv-widget__arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="cv-widget">
          <a href="/cv/Dimitris-Chatzis-CV.pdf" download class="cv-widget__link">
            <span class="cv-widget__icon">📄</span>
            Download CV
          </a>
        </div>
      </div>
    </aside>
    <div class="cv-page__content">
      <TerminalHero
        :cv="cv"
        :terminal="terminal"
        :theme="theme"
        @toggle-theme="toggleTheme"
      />
      <CvMain :cv="cv" :main-ref="terminal.mainRef" v-model:project-filter="projectFilter" />
    </div>

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

.cv-nav__desc {
  font-size: 0.65rem;
  color: var(--text-muted);
  opacity: 0.75;
  line-height: 1.3;
}

@media (min-width: 1024px) {
  .cv-page {
    display: flex;
    gap: 2.5rem;
    max-width: 1040px;
    padding: 0 2rem 4rem;
    align-items: flex-start;
  }

  .cv-sidebar {
    flex-shrink: 0;
    width: 200px;
    position: sticky;
    top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-self: flex-start;
  }

  .cv-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cv-nav__title {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    opacity: 0.9;
  }

  .cv-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .cv-nav__item {
    display: flex;
    flex-direction: column;
  }

  .cv-nav__desc {
    padding-left: 0.1rem;
  }

  .cv-nav__link {
    display: block;
    padding: 0.125rem 0;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
    border-bottom: 1px solid transparent;
  }

  .cv-nav__link:hover {
    color: var(--accent);
  }

  .cv-nav__link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .cv-widgets {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .cv-widget {
    padding: 0.75rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .cv-widget__label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  .cv-widget--joke .cv-widget__quote {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
    line-height: 1.4;
  }

  .cv-widget--joke .cv-widget__code {
    display: block;
    margin: 0;
    padding: 0.35rem 0;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    background: none;
    border: none;
  }

  .cv-widget__link,
  .cv-widget__repo {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--accent);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    transition: color 0.2s, opacity 0.2s;
  }

  .cv-widget__link:hover,
  .cv-widget__repo:hover {
    color: var(--accent-dim);
    opacity: 0.9;
  }

  .cv-widget__icon {
    font-size: 0.95em;
  }

  .cv-widget__project-list {
    list-style: none;
    margin: 0 0 0.5rem;
    padding: 0;
  }

  .cv-widget__project-item {
    margin-bottom: 0.25rem;
  }

  .cv-widget__project-item:last-child {
    margin-bottom: 0;
  }

  .cv-widget__project-link {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--accent);
    text-decoration: none;
    transition: color 0.2s;
  }

  .cv-widget__project-link:hover {
    color: var(--accent-dim);
  }

  .cv-widget__link--see-all {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .cv-widget__arrow {
    font-size: 0.9em;
  }

  .cv-widget__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .cv-widget__social {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }

  .cv-widget__social:hover {
    color: var(--accent);
    border-color: var(--accent-dim);
    background: var(--bg-card);
  }

  .cv-widget__social:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .cv-widget__social-icon {
    display: inline-flex;
    line-height: 0;
  }

  .cv-widget__social-icon svg {
    flex-shrink: 0;
  }

  .cv-page__content {
    flex: 1;
    min-width: 0;
    max-width: 820px;
  }
}

@media (max-width: 1023px) {
  .cv-sidebar {
    display: none;
  }
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

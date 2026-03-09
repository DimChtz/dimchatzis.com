<script setup>
import { computed } from 'vue'
import SocialLinkIcon from './SocialLinkIcon.vue'

const props = defineProps({
  cv: { type: Object, required: true },
  navItems: { type: Array, required: true },
  highlightedProjects: { type: Array, default: () => [] },
})

const navItemsList = computed(() => props.navItems)
const projects = computed(() => props.highlightedProjects)
</script>

<template>
  <aside class="cv-sidebar no-print" aria-label="Sidebar">
    <div class="cv-widgets">
      <div class="cv-widget">
        <nav class="cv-nav" aria-label="CV sections">
          <span class="cv-nav__title">On this page</span>
          <ul class="cv-nav__list">
            <li v-for="item in navItemsList" :key="item.href" class="cv-nav__item">
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
              <SocialLinkIcon :icon="link.icon" :size="20" />
            </span>
          </a>
        </div>
      </div>
      <div class="cv-widget">
        <span class="cv-widget__label">Projects</span>
        <ul class="cv-widget__project-list">
          <li v-for="p in projects" :key="p.repo" class="cv-widget__project-item">
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
</template>

<style scoped>
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

@media (min-width: 1024px) {
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
    font-size: 0.65rem;
    color: var(--text-muted);
    opacity: 0.75;
    line-height: 1.3;
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
}

@media (max-width: 1023px) {
  .cv-sidebar {
    display: none;
  }
}
</style>

<script setup>
import { siteConfig } from '../config/site'

defineProps({
  /** 'inline' = single line link (hero), 'box' = label + link (footer) */
  variant: { type: String, default: 'inline' },
})
</script>

<template>
  <section
    :class="['use-this-theme', 'no-print', variant === 'box' ? 'use-this-theme--box' : 'use-this-theme--inline']"
    aria-label="Use this theme"
  >
    <template v-if="variant === 'box'">
      <p class="use-this-theme__label">Want this for your CV?</p>
      <a :href="siteConfig.repoUrl" target="_blank" rel="noopener noreferrer" class="use-this-theme__link">
        Get the theme on GitHub
        <span class="use-this-theme__arrow" aria-hidden="true">→</span>
      </a>
    </template>
    <a
      v-else
      :href="siteConfig.repoUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="use-this-theme__link use-this-theme__link--inline"
    >
      Want this for your CV? Get the theme on GitHub
      <span class="use-this-theme__arrow" aria-hidden="true">→</span>
    </a>
  </section>
</template>

<style scoped>
.use-this-theme--inline {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-mono);
  text-align: center;
}

.use-this-theme__link--inline {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s, opacity 0.2s;
}

.use-this-theme__link--inline:hover {
  color: var(--accent-dim);
  opacity: 0.9;
}

.use-this-theme--box {
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
}

.use-this-theme__label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.use-this-theme__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s, opacity 0.2s;
}

.use-this-theme__link:hover {
  color: var(--accent-dim);
  opacity: 0.9;
}

.use-this-theme__arrow {
  transition: transform 0.2s;
}

.use-this-theme__link:hover .use-this-theme__arrow {
  transform: translateX(2px);
}
</style>

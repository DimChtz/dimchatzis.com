<script setup>
import TerminalWindow from './TerminalWindow.vue'
import SocialLinkIcon from './SocialLinkIcon.vue'
import UseThisTheme from './UseThisTheme.vue'

defineProps({
  cv: { type: Object, required: true },
  terminal: { type: Object, required: true },
  theme: { type: String, required: true },
})
defineEmits(['toggleTheme'])
</script>

<template>
  <header class="hero">
    <div class="print-header" aria-hidden="true">
      <h1 class="print-name">{{ cv.name }}</h1>
      <p class="print-title">{{ cv.title }}</p>
      <p class="print-tagline">{{ cv.tagline }}</p>
    </div>
    <TerminalWindow :terminal="terminal" :theme="theme" @toggle-theme="$emit('toggleTheme')" />
    <div class="hero-info-box">
      <footer v-if="cv.currently" class="hero-info-status">
        <span class="hero-info-status-label">$ currently</span> reading {{ cv.currently.reading }} · building {{ cv.currently.building }} · debugging {{ cv.currently.debugging }}
      </footer>
      <div class="hero-contact">
      <a :href="`mailto:${cv.email}`" class="hero-contact-item" title="Email">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.email }}</span>
      </a>
      <a :href="`tel:${cv.phone.replace(/\s/g, '')}`" class="hero-contact-item" :title="`Call ${cv.phone}`">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.phone }}</span>
      </a>
      <span class="hero-contact-item hero-contact-item--text" title="Location">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.location }}</span>
      </span>
    </div>
    <div class="hero-links" role="navigation" aria-label="Social and professional links">
      <a
        v-for="link in cv.links"
        :key="link.label"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="hero-link"
        :aria-label="link.label"
        :title="link.label"
      >
        <span class="hero-link-icon" aria-hidden="true">
          <SocialLinkIcon :icon="link.icon" />
        </span>
        <span class="hero-link-label">{{ link.label }}</span>
      </a>
    </div>
    </div>
    <UseThisTheme variant="inline" />
  </header>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 0;
}

/* Print-only header: hidden on screen */
.print-header {
  display: none;
}
@media print {
  .print-header {
    display: block !important;
  }
}

/* Info box under terminal: currently + contact + links */
.hero-info-box {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-mono);
}

.hero-info-status {
  display: block;
  margin: 0 0 1rem;
  padding: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
}
.hero-info-status-label { color: var(--cyan); }
.hero-info-box .hero-contact {
  margin-top: 0;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
}
.hero-info-box .hero-links { margin-top: 1rem; }

/* Contact: email, phone, location */
.hero-contact {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
  padding: 0.875rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9rem;
}

.hero-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-contact-item:hover {
  color: var(--cyan);
}

.hero-contact-item--text {
  cursor: default;
}

.hero-contact-item--text:hover {
  color: var(--text-muted);
}

.hero-contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--cyan);
  opacity: 0.9;
}

.hero-contact-value {
  word-break: break-word;
}

/* Media / social links with icons */
.hero-links {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.hero-link:hover {
  color: var(--cyan);
  background: var(--bg-card-hover);
  border-color: var(--cyan);
}

.hero-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.hero-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}

.hero-link-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.hero-link-label {
  font-weight: 500;
}
</style>

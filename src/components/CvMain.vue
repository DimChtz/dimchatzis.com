<script setup>
import { getFancyVersion } from '../utils/version'
import { siteConfig } from '../config/site'

defineProps({
  cv: { type: Object, required: true },
  mainRef: { type: Object, default: null },
})

const base = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const version = getFancyVersion(base)
</script>

<template>
  <main :ref="el => { if (mainRef && el) mainRef.value = el }" class="main" tabindex="-1" id="main-content">
    <section class="section intro">
      <h2 class="section-title"><span class="symbol">//</span> about</h2>
      <p class="summary">{{ cv.summary }}</p>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="symbol">~</span> experience</h2>
      <div class="cards">
        <article
          v-for="(job, i) in cv.experience"
          :key="job.company"
          class="card"
          :class="{ 'card-current': job.current }"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div class="card-header">
            <div class="company-wrap">
              <h3 class="company">{{ job.company }}</h3>
              <span v-if="job.current" class="badge-current">current</span>
            </div>
            <span v-if="!job.roles" class="period">{{ job.period }}</span>
          </div>
          <template v-if="!job.roles">
            <p class="role">{{ job.role }}</p>
            <ul class="highlights">
              <li v-for="h in job.highlights" :key="h">{{ h }}</li>
            </ul>
          </template>
          <template v-else>
            <div v-for="r in job.roles" :key="r.role" class="role-block">
              <div class="role-header">
                <p class="role">{{ r.role }}</p>
                <span class="period">{{ r.period }}</span>
              </div>
              <ul class="highlights">
                <li v-for="h in r.highlights" :key="h">{{ h }}</li>
              </ul>
            </div>
          </template>
          <div v-if="job.tech && job.tech.length" class="tech-wrap">
            <span class="tech-label">Tech:</span>
            <div class="tech-tags">
              <span v-for="t in job.tech" :key="t" class="tech-tag">{{ t }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="symbol">🎓</span> education</h2>
      <div class="card education-card">
        <h3 class="degree">{{ cv.education.degree }}</h3>
        <p class="school">{{ cv.education.school }}</p>
        <p class="department">{{ cv.education.department }}</p>
        <span class="year">{{ cv.education.year }}</span>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="symbol">⚡</span> skills</h2>
      <div class="skills-grid">
        <div v-for="(skill, i) in cv.skills" :key="i" class="skill-item">
          <span class="skill-bullet">></span>
          <span>{{ skill }}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="symbol">📄</span> research & publications</h2>
      <p class="research-intro">{{ cv.research.intro }}</p>
      <ul class="publications">
        <li v-for="(pub, i) in cv.research.publications" :key="i" class="pub-item">{{ pub }}</li>
      </ul>
    </section>
  </main>

  <footer class="footer">
    <section class="use-this no-print" aria-label="Use this theme">
      <p class="use-this-label">Want this for your CV?</p>
      <a :href="siteConfig.repoUrl" target="_blank" rel="noopener noreferrer" class="use-this-link">
        Get the theme on GitHub
        <span class="use-this-arrow" aria-hidden="true">→</span>
      </a>
    </section>
    <p><code>echo "Thanks for reading! Let's build something."</code></p>
    <p class="muted">Dimitris Chatzis · {{ new Date().getFullYear() }} · v{{ version }}</p>
  </footer>
</template>

<style scoped>
.main {
  outline: none;
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title .symbol {
  color: var(--purple);
}

.summary {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  animation: cardIn 0.5s ease backwards;
}

.cards .card-current {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 8px 24px rgba(0, 255, 136, 0.08);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.company-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.company {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
}

.badge-current {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 4px;
}

.period {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.role {
  font-weight: 600;
  color: var(--cyan);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.role-block {
  margin-bottom: 1.25rem;
}

.role-block:last-child {
  margin-bottom: 0;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.role-block .period {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.highlights {
  list-style: none;
  margin: 0.75rem 0;
}

.highlights li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.4rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.highlights li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-family: var(--font-mono);
}

.tech-wrap {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.tech-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 0.5rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 255, 136, 0.12);
  color: var(--accent-dim);
  border-radius: 4px;
}

.education-card {
  max-width: 420px;
}

.education-card .degree {
  font-size: 1.1rem;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.education-card .school {
  font-weight: 600;
  color: var(--cyan);
}

.education-card .department {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.education-card .year {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--purple);
  margin-top: 0.5rem;
  display: inline-block;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-item {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-bullet {
  color: var(--accent);
}

.research-intro {
  color: var(--text-muted);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.publications {
  list-style: none;
}

.pub-item {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.pub-item::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--purple);
}

.footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
}

.footer code {
  color: var(--cyan);
}

.footer .muted {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.use-this {
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
}

.use-this-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.use-this-link {
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

.use-this-link:hover {
  color: var(--accent-dim);
  opacity: 0.9;
}

.use-this-arrow {
  transition: transform 0.2s;
}

.use-this-link:hover .use-this-arrow {
  transform: translateX(2px);
}
</style>

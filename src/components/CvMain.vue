<script setup>
import { computed } from 'vue'
import { getFancyVersion } from '../utils/version'
import CvFooter from './CvFooter.vue'

const props = defineProps({
  cv: { type: Object, required: true },
  mainRef: { type: Object, default: null },
  projectFilter: { type: String, default: 'all' },
})

const emit = defineEmits(['update:projectFilter'])

const base = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const version = getFancyVersion(base)

function setProjectFilter(value) {
  emit('update:projectFilter', value)
}
const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'npm', label: 'NPM' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'composer', label: 'Composer' },
  { value: 'rust', label: 'Rust' },
  { value: 'web', label: 'Web' },
]

const projectGroups = computed(() => {
  const groups = { npm: [], wordpress: [], composer: [], rust: [], web: [] }
  for (const p of props.cv.projects || []) {
    if (groups[p.type]) groups[p.type].push(p)
  }
  const all = [
    { key: 'npm', label: 'NPM packages', projects: groups.npm },
    { key: 'wordpress', label: 'WordPress plugins', projects: groups.wordpress },
    { key: 'composer', label: 'Composer packages', projects: groups.composer },
    { key: 'rust', label: 'Rust crates', projects: groups.rust },
    { key: 'web', label: 'Web projects', projects: groups.web },
  ].filter((g) => g.projects.length > 0)
  if (props.projectFilter === 'all') return all
  return all.filter((g) => g.key === props.projectFilter)
})

function copyInstall(project) {
  const text = project.installCommand ?? `npm i ${project.install}`
  const copyId = project.installCommand ?? project.install
  navigator.clipboard?.writeText(text).then(() => {
    const el = document.querySelector(`[data-copy-for="${copyId}"]`)
    if (el) {
      const prev = el.textContent
      el.textContent = 'Copied!'
      setTimeout(() => { el.textContent = prev }, 1500)
    }
  })
}
</script>

<template>
  <main :ref="el => { if (mainRef && el) mainRef.value = el }" class="main" tabindex="-1" id="main-content">
    <section id="about" class="section intro">
      <h2 class="section-title"><span class="symbol">//</span> about</h2>
      <p class="summary">{{ cv.summary }}</p>
    </section>

    <section id="experience" class="section">
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
            <ul class="highlights list-arrow">
              <li v-for="h in job.highlights" :key="h">{{ h }}</li>
            </ul>
          </template>
          <template v-else>
            <div v-for="r in job.roles" :key="r.role" class="role-block">
              <div class="role-header">
                <p class="role">{{ r.role }}</p>
                <span class="period">{{ r.period }}</span>
              </div>
              <ul class="highlights list-arrow">
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

    <section id="education" class="section">
      <h2 class="section-title"><span class="symbol">🎓</span> education</h2>
      <div class="card education-card">
        <h3 class="degree">{{ cv.education.degree }}</h3>
        <p class="school">{{ cv.education.school }}</p>
        <p class="department">{{ cv.education.department }}</p>
        <span class="year">{{ cv.education.year }}</span>
      </div>
    </section>

    <section id="skills" class="section">
      <h2 class="section-title"><span class="symbol">⚡</span> skills</h2>
      <div class="skills-grid">
        <div v-for="(skill, i) in cv.skills" :key="i" class="skill-item">
          <span class="skill-bullet">></span>
          <span>{{ skill }}</span>
        </div>
      </div>
    </section>

    <section id="projects" class="section">
      <h2 class="section-title"><span class="symbol">📦</span> projects</h2>
      <div class="project-tabs" role="tablist" aria-label="Filter projects">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="projectFilter === tab.value"
          :class="['project-tab', { 'project-tab--active': projectFilter === tab.value }]"
          @click="setProjectFilter(tab.value)"
        >{{ tab.label }}</button>
      </div>
      <div v-for="group in projectGroups" :key="group.key" class="project-group">
        <h3 class="project-group-title">{{ group.label }}</h3>
        <div class="project-cards">
          <article
            v-for="(project, i) in group.projects"
            :key="project.repo"
            class="project-card"
            :style="{ animationDelay: `${i * 0.08}s` }"
          >
            <div class="project-header">
              <h4 class="project-title">{{ project.title }}</h4>
              <div class="project-header-badges">
                <span v-if="project.license" class="project-license">{{ project.license }}</span>
                <span class="project-badge" :class="'project-badge--' + project.type">{{ project.type }}</span>
              </div>
            </div>
            <p class="project-desc">{{ project.description }}</p>
            <ul v-if="project.highlights && project.highlights.length" class="project-highlights list-arrow">
              <li v-for="h in project.highlights" :key="h">{{ h }}</li>
            </ul>
            <div v-if="project.tech && project.tech.length" class="project-tech">
              <span v-for="t in project.tech" :key="t" class="project-tech-tag">{{ t }}</span>
            </div>
            <div v-if="project.install || project.installCommand" class="project-install">
              <code class="project-install-code">{{ project.installCommand ?? `npm i ${project.install}` }}</code>
              <button
                type="button"
                class="project-install-copy"
                :data-copy-for="project.installCommand ?? project.install"
                @click="copyInstall(project)"
                aria-label="Copy install command"
              >Copy</button>
            </div>
            <div class="project-links">
              <a :href="project.repo" target="_blank" rel="noopener noreferrer" class="project-link">
                GitHub<span class="project-link-icon" aria-hidden="true">↗</span>
              </a>
              <a v-if="project.npm" :href="project.npm" target="_blank" rel="noopener noreferrer" class="project-link">
                npm<span class="project-link-icon" aria-hidden="true">↗</span>
              </a>
              <a v-else-if="project.packageUrl" :href="project.packageUrl" target="_blank" rel="noopener noreferrer" class="project-link">
                {{ project.packageLabel || 'Package' }}<span class="project-link-icon" aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="research" class="section">
      <h2 class="section-title"><span class="symbol">📄</span> research & publications</h2>
      <p class="research-intro">{{ cv.research.intro }}</p>
      <ul class="publications list-diamond">
        <li v-for="(pub, i) in cv.research.publications" :key="i" class="pub-item">{{ pub }}</li>
      </ul>
    </section>
  </main>

  <CvFooter :version="version" />
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

.list-arrow li::before {
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

.project-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.project-tab {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.project-tab:hover {
  color: var(--accent);
  border-color: var(--accent-dim);
}

.project-tab--active {
  background: rgba(0, 255, 136, 0.12);
  border-color: var(--accent-dim);
  color: var(--accent);
}

.project-group {
  margin-bottom: 2rem;
}

.project-group:last-child {
  margin-bottom: 0;
}

.project-group-title {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--border);
}

.project-cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  animation: cardIn 0.5s ease backwards;
}

.project-card:hover {
  border-color: var(--accent-dim);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.project-header-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.project-license {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  padding: 0.15rem 0.4rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.project-title {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.project-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.project-badge--npm {
  background: rgba(203, 56, 55, 0.2);
  color: #cb3837;
  border: 1px solid rgba(203, 56, 55, 0.4);
}

.project-badge--wordpress {
  background: rgba(33, 117, 155, 0.2);
  color: #21749b;
  border: 1px solid rgba(33, 117, 155, 0.4);
}

.project-badge--composer {
  background: rgba(255, 152, 0, 0.2);
  color: #f57c00;
  border: 1px solid rgba(255, 152, 0, 0.4);
}

.project-badge--rust {
  background: rgba(222, 165, 132, 0.25);
  color: #ce422b;
  border: 1px solid rgba(222, 165, 132, 0.5);
}

.project-badge--web {
  background: rgba(65, 184, 131, 0.2);
  color: #41b883;
  border: 1px solid rgba(65, 184, 131, 0.4);
}

.project-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 0.75rem;
}

.project-highlights {
  list-style: none;
  margin: 0 0 0.75rem;
  padding: 0;
}

.project-highlights li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.35rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.project-tech-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: rgba(0, 255, 136, 0.08);
  color: var(--accent-dim);
  border-radius: 4px;
}

.project-install {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.project-install-code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--cyan);
}

.project-install-copy {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.3rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.project-install-copy:hover {
  color: var(--accent);
  border-color: var(--accent-dim);
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s;
}

.project-link:hover {
  color: var(--accent-dim);
  border-color: var(--accent-dim);
}

.project-link-icon {
  font-size: 0.75em;
  opacity: 0.85;
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

.list-diamond li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--purple);
}
</style>

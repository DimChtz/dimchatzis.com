<script setup>
import UseThisTheme from './UseThisTheme.vue'

defineProps({
  version: { type: String, default: 'dev' },
})
</script>

<template>
  <footer class="footer">
    <UseThisTheme variant="box" />
    <p><code>echo "Thanks for reading! Let's build something."</code></p>
    <p class="footer__muted">Dimitris Chatzis · {{ new Date().getFullYear() }} · v{{ version }}</p>
  </footer>
</template>

<style scoped>
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

.footer__muted {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>

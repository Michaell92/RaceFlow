<template>
  <div v-if="error" class="app-error">
    <q-icon name="warning" size="2rem" color="negative" />
    <p>Something went wrong.</p>
    <q-btn flat label="Reload" color="primary" @click="reload" />
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref(false)

onErrorCaptured(() => {
  error.value = true
  return false
})

function reload() {
  error.value = false
  window.location.reload()
}
</script>

<style scoped lang="scss">
.app-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}
</style>

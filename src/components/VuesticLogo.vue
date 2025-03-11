<template>
  <svg width="200" :height="isLogin ? 100 : 50" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <text
      x="10"
      y="60"
      font-family="Arial, sans-serif"
      font-size="50"
      :fill="isLogin ? '#fff' : '#000'"
      font-weight="bold"
    >
      Stella
    </text>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const isLogin = computed(() => {
  return route.path.includes('auth')
})
</script>

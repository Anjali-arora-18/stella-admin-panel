<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ServicesTable from './widgets/ServicesTable.vue'
import { useServiceStore } from '../../stores/services'
const servicesStore = useServiceStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
servicesStore.getAll(route.params.id).then(() => {
  items.value = servicesStore.items
  isLoading.value = false
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <ServicesTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

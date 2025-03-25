<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicesTable from './widgets/ServicesTable.vue'
import { useServiceStore } from '../../stores/services'
const servicesStore = useServiceStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
const { push } = useRouter()
servicesStore.getAll().then(() => {
  items.value = servicesStore.items
  isLoading.value = false
})
</script>

<template>
  <div class="flex">
    <h1 class="page-title font-bold">Outlets</h1>
    <VaButton class="ml-auto h-fit" color="primary" @click="push({ name: 'create-outlet' })">Create</VaButton>
  </div>
  <VaCard>
    <VaCardContent>
      <ServicesTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

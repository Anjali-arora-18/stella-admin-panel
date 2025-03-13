<script setup lang="ts">
import { ref } from 'vue'
import CompanyTable from './widgets/CompanyTable.vue'
import { useCompanyStore } from '../../stores/companies'

const companyStore = useCompanyStore()
const items = ref([])
const isLoading = ref(true)
companyStore.getAll().then(() => {
  items.value = companyStore.items
  isLoading.value = false
})
</script>

<template>
  <h1 class="page-title font-bold">Companies</h1>
  <VaCard>
    <VaCardContent>
      <CompanyTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

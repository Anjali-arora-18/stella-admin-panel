<script setup lang="ts">
import { watchEffect } from 'vue'
import CompanyTable from './widgets/CompanyTable.vue'
import { useUsers } from './composables/useUsers'
import { useToast } from 'vuestic-ui'

const { users, isLoading, sorting, pagination, error } = useUsers()

const { init: notify } = useToast()

watchEffect(() => {
  if (error.value) {
    notify({
      message: error.value.message,
      color: 'danger',
    })
  }
})
</script>

<template>
  <h1 class="page-title font-bold">Companies</h1>
  <VaCard>
    <VaCardContent>
      <CompanyTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :loading="isLoading"
      />
    </VaCardContent>
  </VaCard>
</template>

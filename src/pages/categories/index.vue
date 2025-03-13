<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import CategoriesTable from './widgets/CategoriesTable.vue'
import { useCategoryStore } from '../../stores/categories'
const categoriesStore = useCategoryStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
categoriesStore.getAll(route.params.id).then(() => {
  console.log(categoriesStore.items)
  items.value = categoriesStore.items
  isLoading.value = false
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <CategoriesTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

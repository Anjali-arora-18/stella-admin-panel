<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SubCategoriesTable from './widgets/subCategoriesTable.vue'
import { useSubCategoriesStore } from '../../stores/subCategories'
const subCategoriesStore = useSubCategoriesStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
subCategoriesStore.getAll(route.params.id).then(() => {
  items.value = subCategoriesStore.items
  isLoading.value = false
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <SubCategoriesTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

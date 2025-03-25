<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import CategoriesTable from './widgets/CategoriesTable.vue'
import { useCategoryStore } from '../../stores/categories'
import EditCategoryModal from './modals/EditCategoryModal.vue'

const isEditCategoryModalOpen = ref(false)
const categoriesStore = useCategoryStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
categoriesStore.getAll(route.params.id).then(() => {
  items.value = categoriesStore.items
  isLoading.value = false
})
</script>

<template>
  <VaCard>
    <VaCardContent>
      <CategoriesTable :items="items" :loading="isLoading" @updateCategoryModal="isEditCategoryModalOpen = true" />
    </VaCardContent>
  </VaCard>

  <EditCategoryModal v-if="isEditCategoryModalOpen" @cancel="isEditCategoryModalOpen = false" />
</template>

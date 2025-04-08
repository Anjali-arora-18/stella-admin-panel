<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CategoriesTable from './widgets/CategoriesTable.vue'
import { useCategoryStore } from '../../stores/categories'
import { useServiceStore } from '@/stores/services'
import EditCategoryModal from './modals/EditCategoryModal.vue'
import ImportCategoryModal from './modals/ImportCategoryModal.vue'
const isEditCategoryModalOpen = ref(false)
const categoriesStore = useCategoryStore()

const serviceStore = useServiceStore()
const items = ref([])
const selectedCategory = ref('')
const isLoading = ref(true)
const route = useRoute()

const getCategories = (outletId) => {
  categoriesStore.getAll(outletId).then(() => {
    items.value = categoriesStore.items
    isLoading.value = false
  })
}

const updateCategory = (payload) => {
  isEditCategoryModalOpen.value = true
  selectedCategory.value = payload
}

watch(
  () => serviceStore.selectedRest,
  (newId) => {
    if (newId) {
      getCategories(serviceStore.selectedRest)
    }
  },
  { immediate: true },
)

const isImportCategoryModalOpen = ref(false)
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="page-title font-bold">Categories</h1>
    <div class="flex gap-2">
      <VaButton color="primary" size="small" @click="isImportCategoryModalOpen = true"> Import</VaButton>
      <VaButton size="small" color="primary" @click="isEditCategoryModalOpen = true"> Add Item </VaButton>
    </div>
  </div>

  <VaCard>
    <VaCardContent>
      <CategoriesTable :items="items" :loading="isLoading" @updateCategoryModal="updateCategory" />
    </VaCardContent>
  </VaCard>

  <EditCategoryModal
    v-if="isEditCategoryModalOpen"
    :selected-category="selectedCategory"
    @cancel="isEditCategoryModalOpen = false"
  />
  <ImportCategoryModal
    v-if="isImportCategoryModalOpen"
    @cancel="(isImportCategoryModalOpen = false), getCategories(serviceStore.selectedRest)"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useRoute } from 'vue-router'
import CategoriesTable from './widgets/CategoriesTable.vue'
import { useCategoryStore } from '../../stores/categories'
import { useServiceStore } from '@/stores/services'
import EditCategoryModal from './modals/EditCategoryModal.vue'
import ImportCategoryModal from './modals/ImportCategoryModal.vue'
const isEditCategoryModalOpen = ref(false)
const categoriesStore = useCategoryStore()
const { init } = useToast()
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

async function deleteCategory(payload) {
  const data = {
    id: payload._id,
  }
  categoriesStore
    .deleteCategory(data)
    .then((response) => {
      init({
        message: "You've successfully deleted Category",
        color: 'success',
      })
      getCategories(serviceStore.selectedRest)
    })
    .catch((err) => {
      init({
        message: err.response.data,
        color: 'error',
      })
    })
}

const closeImportCategoryModal = () => {
  isImportCategoryModalOpen.value = false
  getCategories(serviceStore.selectedRest)
}

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
      <CategoriesTable
        :items="items"
        :loading="isLoading"
        @deleteCategory="deleteCategory"
        @updateCategoryModal="updateCategory"
      />
    </VaCardContent>
  </VaCard>

  <EditCategoryModal
    v-if="isEditCategoryModalOpen"
    :selected-category="selectedCategory"
    @cancel="(isEditCategoryModalOpen = false), getCategories(serviceStore.selectedRest)"
  />
  <ImportCategoryModal v-if="isImportCategoryModalOpen" @cancel="closeImportCategoryModal" />
</template>

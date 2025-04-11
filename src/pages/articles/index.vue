<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useRoute } from 'vue-router'
import ArticlesTable from './widgets/ArticlesTable.vue'
import { useCategoryStore } from '../../stores/categories'
import { useServiceStore } from '@/stores/services'
import EditArticleModal from './modals/EditArticleModal.vue'
import ImportArticleModal from './modals/ImportArticleModal.vue'
import axios from 'axios'
const isEditArticleModalOpen = ref(false)
const categoriesStore = useCategoryStore()
const { init } = useToast()
const serviceStore = useServiceStore()
const items = ref([])
const selectedArticle = ref('')
const isLoading = ref(true)
const route = useRoute()

const getArticles = (outletId) => {
  const url = import.meta.env.VITE_API_BASE_URL
  axios.get(`${url}/menuItems?outletId=${outletId}`).then((response) => {
    items.value = response.data
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
      getArticles(serviceStore.selectedRest)
    }
  },
  { immediate: true },
)

async function deleteArticle(payload) {
  const data = {
    id: payload._id,
  }
  const url = import.meta.env.VITE_API_BASE_URL
  axios
    .delete(`${url}/menuItems/${payload._id}`)
    .then((response) => {
      items.value = response.data
      isLoading.value = false
    })
    .then((response) => {
      init({
        message: "You've successfully deleted Article",
        color: 'success',
      })
      getArticles(serviceStore.selectedRest)
    })
    .catch((err) => {
      init({
        message: err.response.data.error,
        color: 'danger',
      })
    })
}

const isImportArticleModalOpen = ref(false)
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="page-title font-bold">Articles</h1>
    <div class="flex gap-2">
      <VaButton color="primary" size="small" @click="isImportArticleModalOpen = true"> Import</VaButton>
      <VaButton size="small" color="primary" @click="isEditArticleModalOpen = true"> Add Article </VaButton>
    </div>
  </div>

  <VaCard>
    <VaCardContent>
      <ArticlesTable :items="items" :loading="isLoading" @deleteArticle="deleteArticle" />
    </VaCardContent>
  </VaCard>

  <EditArticleModal
    v-if="isEditArticleModalOpen"
    :selected-category="selectedCategory"
    @cancel="(isEditArticleModalOpen = false), getArticles(serviceStore.selectedRest)"
  />
  <ImportArticleModal v-if="isImportArticleModalOpen" @cancel="isImportArticleModalOpen = false" />
</template>

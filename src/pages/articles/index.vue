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
const originalItems = ref([])
const count = ref(0)
const pageNumber = ref(1)
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const selectedArticle = ref('')
const isLoading = ref(true)
const route = useRoute()
const categories = ref([])

const getArticles = (outletId) => {
  items.value = []
  originalItems.value = []
  isLoading.value = true
  const url = import.meta.env.VITE_API_BASE_URL
  axios
    .get(
      `${url}/menuItems?outletId=${outletId}&limit=50&page=${pageNumber.value}&search=${searchQuery.value}&sortKey=${sortBy.value}&sortValue=${sortOrder.value}`,
    )
    .then((response) => {
      items.value = response.data
      originalItems.value = JSON.parse(JSON.stringify(response.data))
      isLoading.value = false
    })
}

const getArticlesCount = (outletId) => {
  const url = import.meta.env.VITE_API_BASE_URL
  axios.get(`${url}/menuItems/count?outletId=${outletId}&search=${searchQuery.value}`).then((response) => {
    count.value = Number(response.data.totalNoRec)
  })
}

function updateSortBy(payload) {
  sortBy.value = payload
  getArticles(serviceStore.selectedRest)
}
function updateSortOrder(payload) {
  sortOrder.value = payload
  getArticles(serviceStore.selectedRest)
}

const updateArticleModal = (payload) => {
  isEditArticleModalOpen.value = true
  selectedArticle.value = payload
}

const updateArticleDirectly = (payload) => {
  const item = originalItems.value.find((e) => e._id === payload._id)
  const data = payload
  data.outletId = serviceStore.selectedRest
  delete data.createdAt
  delete data.updatedAt
  delete data.categories
  delete data.subCategories
  delete data.__v
  if (item && item.code === payload.code) {
    delete data.code
  }
  if (!payload.assetId) {
    delete payload.assetId
  }
  const url: any = import.meta.env.VITE_API_BASE_URL
  axios
    .patch(`${url}/menuItems/${payload._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated", color: 'success' })
      getArticles(serviceStore.selectedRest)
    })
    .catch((err) => {
      getArticles(serviceStore.selectedRest)
      init({ message: err.response.data.message, color: 'danger' })
    })
}

watch(
  () => serviceStore.selectedRest,
  (newId) => {
    if (newId) {
      getArticles(serviceStore.selectedRest)
      getArticlesCount(serviceStore.selectedRest)
      categoriesStore.getAll(serviceStore.selectedRest).then((response) => {
        categories.value = response.map((e) => {
          return {
            ...e,
            text: e.name,
            value: e.wCode,
          }
        })
      })
    }
  },
  { immediate: true },
)
watch(searchQuery, (search) => {
  getArticlesCount(serviceStore.selectedRest)
})

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

function getArticlesForPagination(payload) {
  pageNumber.value = payload.page
  searchQuery.value = payload.searchQuery
  getArticles(serviceStore.selectedRest)
}
const cloneArticle = (article) => {
  const clonedData = { ...article }
  delete clonedData._id
  delete clonedData.createdAt
  delete clonedData.updatedAt
  delete clonedData.__v
  selectedArticle.value = {
    ...clonedData,
    name: `${clonedData.name}`,
    imageUrl: '',
  }
  isEditArticleModalOpen.value = true
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
      <ArticlesTable
        :items="items"
        :loading="isLoading"
        :categories="categories"
        :count="count"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @sortBy="updateSortBy"
        @sortingOrder="updateSortOrder"
        @updateArticleModal="updateArticleModal"
        @deleteArticle="deleteArticle"
        @getArticlesForPagination="getArticlesForPagination"
        @updateArticle="updateArticleDirectly"
        @cloneArticle="cloneArticle"
      />
    </VaCardContent>
  </VaCard>

  <EditArticleModal
    v-if="isEditArticleModalOpen"
    :selected-category="selectedArticle"
    @cancel="(selectedArticle = ''), (isEditArticleModalOpen = false), getArticles(serviceStore.selectedRest)"
  />
  <ImportArticleModal v-if="isImportArticleModalOpen" @cancel="isImportArticleModalOpen = false" />
</template>

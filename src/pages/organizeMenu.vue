<script setup>
import { ref, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import { useCategoryStore } from '../stores/categories'
import { useServiceStore } from '@/stores/services'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
const serviceStore = useServiceStore()
const categoriesStore = useCategoryStore()
const isLoading = ref(true)
const categories = ref([])
const openedAccordian = ref([])
const { init } = useToast()

const getArticles = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  const selectedCategoryIndex = openedAccordian.value.indexOf(true)
  if (selectedCategoryIndex !== -1) {
    axios
      .get(`${url}/menuItemsvo`, {
        params: {
          outletId: serviceStore.selectedRest,
          categoryId: categories.value[selectedCategoryIndex]._id,
        },
      })
      .then((resp) => {
        categories.value[selectedCategoryIndex].subCategories = categories.value[
          selectedCategoryIndex
        ].subCategories.map((e) => {
          return {
            ...e,
            articles: resp.data
              .filter((a) => a.subCategories.includes(e._id))
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
          }
        })
      })
  }
}

const getCategories = async (outletId) => {
  isLoading.value = true

  await categoriesStore.getAll(outletId)
  const items = categoriesStore.items.map((item) => ({
    _id: item._id || '',
    name: item.name || '',
    subCategories: item.subCategories || [],
    ...item,
  }))
  if (!categories.value.length) {
    openedAccordian.value = Array(categories.value.length).fill(false)
  }
  categories.value = items
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((category) => ({
      ...category,
      subCategories: (category.subCategories || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }))
  getArticles()
  isLoading.value = false
}

const updateSortOrder = (payload) => {
  const url = import.meta.env.VITE_API_BASE_URL

  axios
    .post(`${url}/menuCategories-sort`, payload)
    .then((response) => {
      init({
        message: 'Order updated.',
        color: 'success',
      })
      getCategories(serviceStore.selectedRest)
    })
    .catch((err) => {
      init({
        message: err.response.data.error,
        color: 'danger',
      })
    })
}

const movedCategory = async ($event) => {
  let category = JSON.parse(JSON.stringify(categories.value))
  if ($event.moved) {
    category = category.map((e, index) => {
      return {
        ...e,
        sortOrder: index,
      }
    })
  }
  const data = {
    categories: category.map((e) => {
      return {
        id: e._id,
        sortOrder: e.sortOrder,
      }
    }),
  }
  await updateSortOrder(data)
}

const movedSubCategory = async ($event, category) => {
  const selectedCategory = JSON.parse(JSON.stringify(categories.value.find((a) => a._id === category._id)))
  const data = {
    categories: [
      {
        id: selectedCategory._id,
        sortOrder: selectedCategory.sortOrder,
        subOrder: selectedCategory.subCategories.map((e, index) => {
          return {
            id: e._id,
            sortOrder: index,
          }
        }),
      },
    ],
  }
  await updateSortOrder(data)
}

const movedArticle = async ($event, category, subcategory) => {
  const selectedCategory = JSON.parse(JSON.stringify(categories.value.find((a) => a._id === category._id)))
  const selectedSubCategory = selectedCategory.subCategories.find((a) => a._id === subcategory._id)
  const data = {
    categories: [
      {
        id: selectedCategory._id,
        sortOrder: selectedCategory.sortOrder,
        subOrder: {
          id: selectedSubCategory._id,
          sortOrder: selectedSubCategory.sortOrder,
          articles: selectedSubCategory.articles.map((e, index) => {
            return {
              id: e._id,
              sortOrder: index,
            }
          }),
        },
      },
    ],
  }
  await updateSortOrder(data)
}

watch(
  () => serviceStore.selectedRest,
  (newId) => {
    if (newId) getCategories(newId)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <h1 class="page-title font-bold">Organize Menu</h1>
    <VaAccordion v-model="openedAccordian" @update:modelValue="getArticles">
      <VueDraggableNext class="dragArea list-group w-full" :list="categories" @change="movedCategory">
        <VaCollapse
          v-for="category in categories"
          :key="category._id"
          :header="category.name"
          color="secondary"
          :class="[
            'list-group-item bg-gray-300 m-1 rounded-md text-center',
            { 'no-arrow': !(category.subCategories && category.subCategories.length) },
          ]"
          :disabled="!(category.subCategories && category.subCategories.length)"
        >
          <VaAccordion>
            <VueDraggableNext
              v-if="category.subCategories && category.subCategories.length"
              class="dragArea list-group w-full"
              :list="category.subCategories"
              @change="movedSubCategory($event, category)"
            >
              <VaCollapse
                v-for="subcategory in category.subCategories"
                :key="subcategory._id || subcategory.id"
                :header="subcategory.name"
                :class="{ 'no-arrow': !(subcategory.articles && subcategory.articles.length) }"
                color="#DEE5F2"
                solid
                class="list-group-item m-1 rounded-md text-center"
              >
                <VueDraggableNext
                  v-if="subcategory.articles && subcategory.articles.length"
                  class="dragArea list-group w-full"
                  :list="subcategory.articles"
                  :disabled="!subcategory.articles"
                  @change="movedArticle($event, category, subcategory)"
                >
                  <div
                    v-for="article in subcategory.articles"
                    :key="article._id || article.id"
                    class="list-group-item bg-gray-100 m-1 p-2 text-center"
                  >
                    {{ article.name }}
                  </div>
                </VueDraggableNext>
              </VaCollapse>
            </VueDraggableNext>
          </VaAccordion>
        </VaCollapse>
      </VueDraggableNext>
    </VaAccordion>
  </div>
</template>

<style scoped>
.category,
.subcategory,
.article {
  padding: 6px;
  margin: 4px 0;
  background: #f5f5f5;
  border: 1px solid #ccc;
}
.drag-header {
  cursor: grab;
  background: #ddd;
  padding: 4px;
  font-weight: bold;
}
.sortable-container {
  margin-left: 20px;
}
::v-deep(.va-collapse__body-wrapper--bordered) {
  border-bottom: 0px !important;
}
::v-deep(.no-arrow .va-icon) {
  display: none !important;
}
::v-deep(.no-arrow .va-collapse__header) {
  cursor: default !important;
}
</style>

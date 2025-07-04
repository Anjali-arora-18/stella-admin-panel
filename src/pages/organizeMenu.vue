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
const loading = ref(false)
const { init } = useToast()

const getArticles = async () => {
  loading.value = true
  const url = import.meta.env.VITE_API_BASE_URL
  const selectedCategoryIndex = openedAccordian.value.indexOf(true)
  if (selectedCategoryIndex !== -1) {
    axios
      .get(`${url}/menuItemsvo?limit=100000`, {
        params: {
          outletId: serviceStore.selectedRest,
          categoryId: categories.value[selectedCategoryIndex]._id,
        },
      })
      .then((resp) => {
        categories.value[selectedCategoryIndex].articles = resp.data.filter((a) => !a.subCategories.length)
        categories.value[selectedCategoryIndex].subCategories = categories.value[
          selectedCategoryIndex
        ].subCategories.map((e) => {
          return {
            ...e,
            articles: resp.data
              .filter((a) => a.subCategories.find((a) => a.id === e._id))
              .sort(
                (a, b) =>
                  (a.subCategories.find((a) => a.id === e._id).sortOrder || 0) -
                  (b.subCategories.find((a) => a.id === e._id).sortOrder || 0),
              ),
          }
        })
        loading.value = false
      })
      .catch((err) => {
        loading.value = false
      })
  } else {
    loading.value = false
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
    .post(`${url}/organize-menu`, payload)
    .then((response) => {
      init({
        message: 'Order updated.',
        color: 'success',
      })
    })
    .catch((err) => {
      init({
        message: err.response.data.error,
        color: 'danger',
      })
      getCategories(serviceStore.selectedRest)
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
    resourceType: 'categories',
    items: category.map((e) => {
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
  const subCategories = selectedCategory.subCategories.map((e, index) => {
    return {
      ...e,
      sortOrder: index,
    }
  })
  const data = {
    resourceType: 'subcategories',
    categoryId: selectedCategory._id,
    items: subCategories
      .filter((a) => !a.isArticle)
      .map((e) => {
        return {
          id: e._id,
          sortOrder: e.sortOrder,
        }
      }),
  }
  await updateSortOrder(data)
}

const movedArticle = async ($event, category, subcategory = null) => {
  const selectedCategory = JSON.parse(JSON.stringify(categories.value.find((a) => a._id === category._id)))
  let selectedSubCategory = []
  let articles = []
  if (subcategory) {
    selectedSubCategory = selectedCategory.subCategories.find((a) => a._id === subcategory._id)
    articles = selectedSubCategory.articles
  } else {
    articles = selectedCategory.articles
  }
  const data = {
    resourceType: 'menuitems',
    categoryId: selectedCategory._id,
    items: articles.map((e, index) => {
      return {
        id: e._id,
        sortOrder: index,
      }
    }),
  }

  if (subcategory) {
    data.subcategoryId = selectedSubCategory._id
  }
  await updateSortOrder(data)
}

const movedArticleGroup = async (payload) => {
  let data = {}
  const resourceType = 'articleoptionsgroups'

  if (payload.subCategory) {
    data.subcategoryId = payload.subCategory._id
  }
  if (payload.category) {
    data.categoryId = payload.category._id
  }
  if (payload.menuItems) {
    data.menuitemId = payload.menuItems._id
  }
  const selectedCategory = JSON.parse(JSON.stringify(categories.value.find((a) => a._id === payload.category._id)))
  let selectedSubCategory = []
  let articlesOptionsGroup = []
  if (payload.subCategory) {
    selectedSubCategory = selectedCategory.subCategories.find((a) => a._id === payload.subCategory._id)
    if (payload.menuItems) {
      articlesOptionsGroup = payload.menuItems.articlesOptionsGroup
    } else {
      articlesOptionsGroup = selectedSubCategory.articlesOptionsGroup
    }
    articlesOptionsGroup = selectedSubCategory.articlesOptionsGroup
  } else {
    if (payload.menuItems) {
      articlesOptionsGroup = payload.menuItems.articlesOptionsGroup
    } else {
      articlesOptionsGroup = selectedCategory.articlesOptionsGroup
    }
  }
  data = {
    ...data,
    resourceType: resourceType,
    items: articlesOptionsGroup.map((e, index) => {
      return {
        id: e.id,
        sortOrder: index,
      }
    }),
  }
  await updateSortOrder(data)
}

const movedArticleOption = async (payload) => {
  let data = {}

  if (payload.subCategory) {
    data.subcategoryId = payload.subCategory._id
  }
  if (payload.category) {
    data.categoryId = payload.category._id
  }
  if (payload.menuItems) {
    data.menuitemId = payload.menuItems._id
  }
  const resourceType = 'articleoptions'
  const selectedCategory = JSON.parse(JSON.stringify(categories.value.find((a) => a._id === payload.category._id)))
  let selectedSubCategory = []
  let articlesOptionsGroup = []
  if (payload.subCategory) {
    selectedSubCategory = selectedCategory.subCategories.find((a) => a._id === payload.subCategory._id)
    if (payload.menuItems) {
      articlesOptionsGroup = payload.menuItems.articlesOptionsGroup
    } else {
      articlesOptionsGroup = selectedSubCategory.articlesOptionsGroup
    }
    articlesOptionsGroup = selectedSubCategory.articlesOptionsGroup
  } else {
    if (payload.menuItems) {
      articlesOptionsGroup = payload.menuItems.articlesOptionsGroup
    } else {
      articlesOptionsGroup = selectedCategory.articlesOptionsGroup
    }
  }

  console.log('articlesOptionsGroup', articlesOptionsGroup, payload.articlesOptionsGroup)

  let articleOptions = []

  if (articlesOptionsGroup.length) {
    articleOptions = articlesOptionsGroup.find((a) => a.id === payload.articlesOptionsGroup.id).articlesOptions
  }
  data = {
    ...data,
    articlesOptionsGroupId: payload.articlesOptionsGroup.id,
    resourceType: resourceType,
    items: articleOptions.map((e, index) => {
      return {
        id: e.id,
        sortOrder: index,
      }
    }),
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
          :class="['list-group-item bg-gray-300 m-1 rounded-md text-center']"
        >
          <div
            v-if="
              loading &&
              !(category.subCategories && category.subCategories.length) &&
              !(category.articles && category.articles.length)
            "
            class="flex justitfy-content-center"
          >
            <VaSkeleton variant="text" :lines="5" />
          </div>
          <div
            v-else-if="
              !(category.subCategories && category.subCategories.length) &&
              !(category.articles && category.articles.length)
            "
          >
            No Item
          </div>

          <VaAccordion v-else>
            <VueDraggableNext
              v-if="category.subCategories && category.subCategories.length"
              class="dragArea list-group w-full"
              :list="category.subCategories"
              @change="movedSubCategory($event, category)"
            >
              <VaCollapse
                v-for="subcategory in category.subCategories"
                :key="subcategory._id || subcategory.id"
                :header="`${subcategory.name} - Sub Category`"
                :class="{
                  'no-arrow':
                    !(subcategory.articles && subcategory.articles.length) &&
                    !(subcategory.articlesOptionsGroup && subcategory.articlesOptionsGroup.length),
                }"
                color="#DEE5F2"
                solid
                class="list-group-item m-1 rounded-md text-center"
              >
                <VaAccordion v-if="subcategory.articles && subcategory.articles.length">
                  <VueDraggableNext
                    class="dragArea list-group w-full"
                    :list="subcategory.articles"
                    @change="movedArticle($event, category, subcategory)"
                  >
                    <VaCollapse
                      v-for="article in subcategory.articles"
                      :key="article._id || article.id"
                      :header="`${article.name} - Article`"
                      :class="{ 'no-arrow': !(article.articlesOptionsGroup && article.articlesOptionsGroup.length) }"
                      color="#DEE5F2"
                      solid
                      class="list-group-item m-1 rounded-md text-center"
                    >
                      <VaAccordion v-if="article.articlesOptionsGroup && article.articlesOptionsGroup.length">
                        <VueDraggableNext
                          v-if="article.articlesOptionsGroup && article.articlesOptionsGroup.length"
                          class="dragArea list-group w-full"
                          :list="article.articlesOptionsGroup"
                          @change="
                            movedArticleGroup({
                              is: 'articles',
                              $event: $event,
                              category: category,
                              subCategory: subcategory,
                              menuItems: article,
                            })
                          "
                        >
                          <VaCollapse
                            v-for="articlesOptionsGroup in article.articlesOptionsGroup"
                            :key="articlesOptionsGroup._id || articlesOptionsGroup.id"
                            :header="`${articlesOptionsGroup.name} - Articles Options Group`"
                            :class="{ 'no-arrow': !articlesOptionsGroup.articlesOptions.length }"
                            color="#DEE5F2"
                            solid
                            class="list-group-item m-1 rounded-md text-center"
                          >
                            <VueDraggableNext
                              v-if="articlesOptionsGroup.articlesOptions.length"
                              class="dragArea list-group w-full"
                              :list="articlesOptionsGroup.articlesOptions"
                              :disabled="!articlesOptionsGroup.articlesOptions.length"
                              @change="
                                movedArticleOption({
                                  is: 'articles',
                                  $event: $event,
                                  category: category,
                                  subCategory: subcategory,
                                  articlesOptionsGroup: articlesOptionsGroup,
                                  menuItems: article,
                                })
                              "
                            >
                              <div
                                v-for="articlesOptions in articlesOptionsGroup.articlesOptions"
                                :key="articlesOptions._id || articlesOptions.id"
                                class="list-group-item bg-gray-100 m-1 p-2 text-center"
                              >
                                {{ articlesOptions.name }} - Article Option
                              </div>
                            </VueDraggableNext>
                          </VaCollapse>
                        </VueDraggableNext>
                      </VaAccordion>
                    </VaCollapse>
                  </VueDraggableNext>
                </VaAccordion>

                <VaAccordion v-if="subcategory.articlesOptionsGroup && subcategory.articlesOptionsGroup.length">
                  <VueDraggableNext
                    v-if="subcategory.articlesOptionsGroup && subcategory.articlesOptionsGroup.length"
                    class="dragArea list-group w-full"
                    :list="subcategory.articlesOptionsGroup"
                    @change="
                      movedArticleGroup({
                        is: 'subCategory',
                        $event: $event,
                        category: category,
                        subCategory: subcategory,
                        menuItems: '',
                      })
                    "
                  >
                    <VaCollapse
                      v-for="articlesOptionsGroup in subcategory.articlesOptionsGroup"
                      :key="articlesOptionsGroup._id || articlesOptionsGroup.id"
                      :header="`${articlesOptionsGroup.name} - Articles Options Group`"
                      :class="{ 'no-arrow': !articlesOptionsGroup.articlesOptions.length }"
                      color="#DEE5F2"
                      solid
                      class="list-group-item m-1 rounded-md text-center"
                    >
                      <VueDraggableNext
                        v-if="articlesOptionsGroup.articlesOptions.length"
                        class="dragArea list-group w-full"
                        :list="articlesOptionsGroup.articlesOptions"
                        :disabled="!articlesOptionsGroup.articlesOptions.length"
                        @change="
                          movedArticleOption({
                            is: 'subCategory',
                            $event: $event,
                            category: category,
                            subCategory: subcategory,
                            menuItems: '',
                            articlesOptionsGroup: articlesOptionsGroup,
                          })
                        "
                      >
                        <div
                          v-for="articlesOptions in articlesOptionsGroup.articlesOptions"
                          :key="articlesOptions._id || articlesOptions.id"
                          class="list-group-item bg-gray-100 m-1 p-2 text-center"
                        >
                          {{ articlesOptions.name }} - Article Option
                        </div>
                      </VueDraggableNext>
                    </VaCollapse>
                  </VueDraggableNext>
                </VaAccordion>
              </VaCollapse>
            </VueDraggableNext>
          </VaAccordion>

          <VaAccordion v-if="category.articles && category.articles.length">
            <VueDraggableNext
              class="dragArea list-group w-full"
              :list="category.articles"
              @change="movedArticle($event, category)"
            >
              <VaCollapse
                v-for="article in category.articles"
                :key="article._id || article.id"
                :header="`${article.name} - Article`"
                :class="{ 'no-arrow': !(article.articlesOptionsGroup && article.articlesOptionsGroup.length) }"
                color="#DEE5F2"
                solid
                class="list-group-item m-1 rounded-md text-center"
              >
                <VaAccordion v-if="article.articlesOptionsGroup && article.articlesOptionsGroup.length">
                  <VueDraggableNext
                    v-if="article.articlesOptionsGroup && article.articlesOptionsGroup.length"
                    class="dragArea list-group w-full"
                    :list="article.articlesOptionsGroup"
                    @change="
                      movedArticleGroup({
                        is: 'articles',
                        $event: $event,
                        category: category,
                        subCategory: '',
                        menuItems: article,
                      })
                    "
                  >
                    <VaCollapse
                      v-for="articlesOptionsGroup in article.articlesOptionsGroup"
                      :key="articlesOptionsGroup._id || articlesOptionsGroup.id"
                      :header="`${articlesOptionsGroup.name} - Articles Options Group`"
                      :class="{ 'no-arrow': !articlesOptionsGroup.articlesOptions.length }"
                      color="#DEE5F2"
                      solid
                      class="list-group-item m-1 rounded-md text-center"
                    >
                      <VueDraggableNext
                        v-if="articlesOptionsGroup.articlesOptions.length"
                        class="dragArea list-group w-full"
                        :list="articlesOptionsGroup.articlesOptions"
                        :disabled="!articlesOptionsGroup.articlesOptions.length"
                        @change="
                          movedArticleOption({
                            is: 'articles',
                            $event: $event,
                            category: category,
                            subCategory: '',
                            articlesOptionsGroup: articlesOptionsGroup,
                            menuItems: article,
                          })
                        "
                      >
                        <div
                          v-for="articlesOptions in articlesOptionsGroup.articlesOptions"
                          :key="articlesOptions._id || articlesOptions.id"
                          class="list-group-item bg-gray-100 m-1 p-2 text-center"
                        >
                          {{ articlesOptions.name }} - Article Option
                        </div>
                      </VueDraggableNext>
                    </VaCollapse>
                  </VueDraggableNext>
                </VaAccordion>
              </VaCollapse>
            </VueDraggableNext>
          </VaAccordion>

          <VaAccordion v-if="category.articlesOptionsGroup && category.articlesOptionsGroup.length">
            <VueDraggableNext
              class="dragArea list-group w-full"
              :list="category.articlesOptionsGroup"
              @change="
                movedArticleGroup({
                  is: 'category',
                  $event: $event,
                  category: category,
                  subCategory: '',
                  menuItems: '',
                })
              "
            >
              <VaCollapse
                v-for="articlesOptionsGroup in category.articlesOptionsGroup"
                :key="articlesOptionsGroup._id || articlesOptionsGroup.id"
                :header="`${articlesOptionsGroup.name} - Articles Options Group`"
                :class="{ 'no-arrow': !articlesOptionsGroup.articlesOptions.length }"
                color="#DEE5F2"
                solid
                class="list-group-item m-1 rounded-md text-center"
              >
                <VueDraggableNext
                  v-if="articlesOptionsGroup.articlesOptions.length"
                  class="dragArea list-group w-full"
                  :list="articlesOptionsGroup.articlesOptions"
                  :disabled="!articlesOptionsGroup.articlesOptions.length"
                  @change="
                    movedArticleOption({
                      is: 'category',
                      $event: $event,
                      category: category,
                      subCategory: subCategory,
                      articlesOptionsGroup: articlesOptionsGroup,
                      menuItems: '',
                    })
                  "
                >
                  <div
                    v-for="articlesOptions in articlesOptionsGroup.articlesOptions"
                    :key="articlesOptions._id || articlesOptions.id"
                    class="list-group-item bg-gray-100 m-1 p-2 text-center"
                  >
                    {{ articlesOptions.name }} - Article Option
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

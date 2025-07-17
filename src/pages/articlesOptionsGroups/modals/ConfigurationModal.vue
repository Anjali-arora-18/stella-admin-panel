<script setup lang="ts">
import { ref, defineEmits, watch, computed } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
import { useCategoryStore } from '@/stores/categories'
const props = defineProps({
  optionGroupId: {
    type: String,
    default: () => '',
  },
  optionId: {
    type: String,
    default: () => '',
  },
})
const emits = defineEmits(['cancel'])
const servicesStore = useServiceStore()
const categoriesStore = useCategoryStore()
const items = ref([])
const { init } = useToast()
const isLoading = ref(false)
const isArticleLoading = ref(false)
const isArticleGroupLoading = ref(false)
const isSubmitting = ref(false)

const categories = ref([])
const selectedCategory = ref('')
const selectedMenuItems = ref('')
const articles = ref([])
const articlesGroup: any = ref([])
const articlesGroupOptions: any = ref([])
const fetchConfigurations: any = ref([])
const selectedItems: any = ref({})

const getCategories = () => {
  items.value = []
  categoriesStore.getAll(servicesStore.selectedRest, 'name', 'asc').then(() => {
    categories.value = categoriesStore.items.map((item) => ({
      ...item,
      selected: false,
      isAlreadyOpted: fetchConfigurations.value.find((a) => item._id === a.menuCategoryId),
    }))
  })
}

const getArticles = async () => {
  isArticleLoading.value = true
  const hasData = fetchConfigurations.value.filter((a) => a.menuCategoryId === selectedItems.value.menuCategoryId)

  const url = import.meta.env.VITE_API_BASE_URL
  await axios
    .get(
      `${url}/menuItemsvo?outletId=${servicesStore.selectedRest}&limit=1000&sortKey=name&sortValue=asc&categoryId=${selectedItems.value.menuCategoryId}`,
    )
    .then((response) => {
      articles.value = response.data.map((e) => {
        return {
          ...e,
          isAlreadyOpted: hasData.flatMap((a) => a.menuItemId).includes(e._id),
        }
      })
    })
  isArticleLoading.value = false
}

const getArticlesGroups = async () => {
  isArticleGroupLoading.value = true
  const url = import.meta.env.VITE_API_BASE_URL
  const hasData = fetchConfigurations.value.filter(
    (a) => a.menuCategoryId === selectedItems.value.menuCategoryId && a.menuItemId === selectedItems.value.menuItemId,
  )
  const hasConditionalData = hasData ? hasData.flatMap((a) => a.conditionalSelection) : null
  await axios.get(`${url}/menuItemvoById/${selectedItems.value.menuItemId}`).then((response) => {
    articlesGroup.value = response.data.articlesOptionsGroups
      .filter((a) => !a.options.flatMap((option) => option.type.toLowerCase()).includes('article'))
      .map((group) => {
        return {
          ...group,
          selected: hasConditionalData ? !!hasConditionalData.find((a) => a.optionsGroupId === group._id) : false,
          options: group.options.map((option) => {
            const groupSelected = hasConditionalData
              ? hasConditionalData.find((a) => a.optionsGroupId === group._id)
              : null
            return {
              ...option,
              selected: groupSelected ? groupSelected.optionsIds.includes(option._id) : false,
            }
          }),
        }
      })
  })
  isArticleGroupLoading.value = false
}

const getArticlesConfiguration = () => {
  const url = import.meta.env.VITE_API_BASE_URL
  axios
    .get(`${url}/articles-options-conditions?optionsGroupId=${props.optionGroupId}&optionId=${props.optionId}`)
    .then((response) => {
      fetchConfigurations.value = response.data.data
      getCategories()
    })
}

const setCategory = (cat) => {
  selectedItems.value = {
    menuCategoryId: cat._id,
    menuSubCategoryId: '',
    menuItemId: '',
    optionsGroupId: '',
    optionId: '',
    conditionalSelection: [],
  }
  articlesGroup.value = []
  getArticles()
}

const setArticle = (article) => {
  selectedItems.value.menuItemId = article._id
  getArticlesGroups()
}

const submit = () => {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    menuCategoryId: selectedItems.value.menuCategoryId,
    menuItemId: selectedItems.value.menuItemId,
    optionsGroupId: props.optionGroupId,
    optionId: props.optionId,
    conditionalSelection: articlesGroup.value
      .filter((a) => a.selected)
      .map((e) => {
        return {
          optionsGroupId: e._id,
          optionsIds: e.options.filter((a) => a.selected).flatMap((a) => a._id),
        }
      }),
  }

  const hasData = fetchConfigurations.value.find(
    (a) => a.menuCategoryId === selectedItems.value.menuCategoryId && a.menuItemId === selectedItems.value.menuItemId,
  )
  if (hasData) {
    data['_id'] = hasData._id
    axios
      .put(`${url}/articles-options-conditions/${data._id}`, data)
      .then(() => {
        init({
          color: 'success',
          message: 'Configuration updated',
        })
      })
      .catch((err) => {
        init({
          color: 'error',
          message: err,
        })
      })
  } else {
    axios
      .post(`${url}/articles-options-conditions`, data)
      .then(() => {
        init({
          color: 'success',
          message: 'Configuration saved',
        })
      })
      .catch((err) => {
        init({
          color: 'error',
          message: err,
        })
      })
  }
}
getArticlesConfiguration()
</script>
<template>
  <VaModal
    class="big-xl-modal"
    size="large"
    hide-default-actions
    :model-value="true"
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="va-h6 mb-4">Configuration</h1>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto px-1">
      <div class="row align-items-center mb-2">
        <div class="border rounded shadow-sm p-2">
          <h3 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Categories / SubCategories</h3>
          <div class="max-h-[400px] overflow-y-auto custom-scroll">
            <table class="w-full border-collapse border border-gray-200 text-sm">
              <tbody>
                <tr
                  v-for="cat in categories"
                  :key="'cat-' + i"
                  class="border-b hover:bg-gray-50"
                  :class="{
                    'text-blue-500': selectedItems.menuCategoryId === cat._id,
                    'bg-blue-100': selectedItems.menuCategoryId === cat._id,
                  }"
                >
                  <td class="p-2 cursor-pointer">
                    <div class="flex flex-row justify-between w-full" @click="setCategory(cat)">
                      <span>{{ cat.wCode }} - {{ cat.name }}</span>
                      <svg
                        v-if="cat.isAlreadyOpted"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 ml-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                        />
                      </svg>
                    </div>
                    <tr v-for="subCat in cat.subCategories" :key="'subCat-' + subCat.id">
                      <td>{{ subCat.name }}</td>
                    </tr>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="row align-items-center mb-2">
        <div class="border rounded shadow-sm p-2">
          <h3 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Articles</h3>
          <div class="max-h-[400px] overflow-y-auto custom-scroll">
            <table class="w-full border-collapse border border-gray-200 text-sm">
              <tbody v-if="!isArticleLoading">
                <tr
                  v-for="article in articles"
                  :key="'articles-' + i"
                  class="border-b hover:bg-gray-50"
                  :class="{
                    'text-blue-500': selectedItems.menuItemId === article._id,
                    'bg-blue-100': selectedItems.menuItemId === article._id,
                  }"
                >
                  <td class="p-2 cursor-pointer">
                    <div class="flex flex-row justify-between w-full" @click="setArticle(article)">
                      <span>{{ article.code }} - {{ article.name }}</span>
                      <svg
                        v-if="article.isAlreadyOpted"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 ml-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr v-if="!articles.length">
                  <td class="p-2">No Data.</td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td>
                    <VaProgressCircle indeterminate size="small" color="primary" class="mx-auto my-2" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="row align-items-center mb-2">
        <div class="border rounded shadow-sm p-2">
          <h3 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Article Options Group</h3>
          <div class="max-h-[400px] overflow-y-auto custom-scroll">
            <table class="w-full border-collapse border border-gray-200 text-sm">
              <tbody v-if="!isArticleGroupLoading">
                <tr
                  v-for="articleGroup in articlesGroup"
                  :key="'articlesGroups-' + i"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="p-2 cursor-pointer">
                    <div>
                      <VaCheckbox v-model="articleGroup.selected" :label="articleGroup.name" />
                    </div>
                  </td>
                </tr>
                <tr v-if="!articlesGroup.length">
                  <td class="p-2 text-center">No Data.</td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td>
                    <VaProgressCircle indeterminate size="small" color="primary" class="mx-auto my-2" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="row align-items-center mb-2">
        <div class="border rounded shadow-sm p-2">
          <h3 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Articles Options</h3>
          <div class="max-h-[400px] overflow-y-auto custom-scroll">
            <table class="w-full border-collapse border border-gray-200 text-sm">
              <tbody>
                <tr
                  v-for="(option, i) in articlesGroup.filter((a) => a.selected).flatMap((group) => group.options)"
                  :key="'option-' + i"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="p-2 cursor-pointer">
                    <div>
                      <VaCheckbox v-model="option.selected" :label="option.name" />
                    </div>
                  </td>
                </tr>
                <tr v-if="!articlesGroup.length">
                  <td class="p-2 text-center">No Data.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end mt-4">
        <VaButton :loading="isSubmitting || isLoading" :disabled="isSubmitting" type="button" @click="submit">
          Configure
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>
<style>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}
</style>

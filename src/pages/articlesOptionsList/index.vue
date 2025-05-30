<script setup lang="ts">
import { ref, watch } from 'vue'
import OptionsTable from '@/pages/articlesOptionsList/widgets/OptionsTable.vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
import { useToast } from 'vuestic-ui'

const servicesStore = useServiceStore()
const items = ref([])
const { init } = useToast()
const isLoading = ref(false)

const searchValue = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')

const getOptions = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(
      url +
        `/articles-options?search=${searchValue.value}&sortKey=${sortBy.value}&sortValue=${sortOrder.value}&outletId=${servicesStore.selectedRest}`,
    )
    const item = response.data.result
    items.value = item.map((e) => {
      return {
        ...e,
        editID: false,
        editName: false,
        editPOSName: false,
        editCode: false,
        editType: false,
        editPrice: false,
        editIsActive: false,
        editArticlesOptionsGroups: false,
        editIsDeleted: false,
        editImageUrl: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load Options', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getOptions()
  },
)

if (servicesStore.selectedRest) {
  getOptions()
}

function getOptionsForSearch(search) {
  searchValue.value = search || ''
  getOptions()
}

function updateSortBy(payload) {
  sortBy.value = payload
  getOptions()
}

function updateSortOrder(payload) {
  sortOrder.value = payload
  getOptions()
}
</script>

<template>
  <VaCard square>
    <VaCardContent>
      <OptionsTable
        :items="items"
        :loading="isLoading"
        @sortBy="updateSortBy"
        @sortingOrder="updateSortOrder"
        @getOptions="getOptionsForSearch"
      />
    </VaCardContent>
  </VaCard>
</template>
<style lang="scss">
.va-tabs {
  .va-tabs__content {
    width: 100% !important;
  }
}
</style>

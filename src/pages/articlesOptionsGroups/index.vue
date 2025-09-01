<script setup lang="ts">
import { ref, watch } from 'vue'
import OptionGroupsTable from '@/pages/articlesOptionsGroups/widgets/OptionGroupsTable.vue'
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

const getOptionGroups = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(
      url +
        `/articles-options-groups?limit=100000&search=${encodeURIComponent(
          searchValue.value,
        )}&sortKey=${encodeURIComponent(sortBy.value)}&sortValue=${encodeURIComponent(
          sortOrder.value,
        )}&outletId=${encodeURIComponent(servicesStore.selectedRest)}`,
    )
    const item = response.data.result
    items.value = item.map((e) => {
      return {
        ...e,
        editID: false,
        editName: false,
        editInternalName: false,
        editDescription: false,
        editOptions: false,
        editSingleChoice: false,
        editMultipleChoice: false,
        editMandatory: false,
        editMinimumChoices: false,
        editMaximumChoices: false,
        editIsActive: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load OptionGroups', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getOptionGroups()
  },
)

if (servicesStore.selectedRest) {
  getOptionGroups()
}

function getOptionGroupsForSearch(search) {
  searchValue.value = search || ''
  getOptionGroups()
}

function updateSortBy(payload) {
  sortBy.value = payload
  getOptionGroups()
}

function updateSortOrder(payload) {
  sortOrder.value = payload
  getOptionGroups()
}
</script>

<template>
  <VaCard square>
    <VaCardContent>
      <OptionGroupsTable
        :items="items"
        :loading="isLoading"
        :search-query="searchValue"
        @update:searchValue="(val) => (searchValue = val)"
        @sortBy="updateSortBy"
        @sortingOrder="updateSortOrder"
        @getOptionGroups="getOptionGroupsForSearch"
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

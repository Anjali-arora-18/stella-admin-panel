<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, watch, toRef, onMounted } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'

const { confirm } = useModal()
const { init } = useToast()
const router = useRouter()
const servicesStore = useServiceStore()

const items = ref([])
const loading = ref(false)

const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id', sortable: false },
  { label: 'Code', key: 'code', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Description', key: 'description', sortable: false },
  { label: 'Price', key: 'price', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

// Fetch deleted articles
const fetchDeletedArticles = async () => {
  try {
    loading.value = true
    const url = import.meta.env.VITE_API_BASE_URL
    const response = await axios.get(`${url}/menuItems?isDeleted=true&outletId=${servicesStore.selectedRest}&limit=500`)

    const result = response.data
    items.value = result
  } catch (error: any) {
    init({
      message: 'Failed to fetch deleted articles',
      color: 'danger',
    })
    items.value = []
  } finally {
    loading.value = false
  }
}

// Restore article
const onRestore = async (rowData: any) => {
  const confirmed = await confirm({
    title: 'Confirm Restore',
    message: `Are you sure you want to restore article "${rowData.name}"?`,
    okText: 'Yes',
    cancelText: 'Cancel',
  })

  if (!confirmed) return

  try {
    const url = import.meta.env.VITE_API_BASE_URL
    const response = await axios.patch(`${url}/menuItems/${rowData._id}`, {
      isDeleted: false,
    })
    if (response.status === 200) {
      init({
        message: 'Article restored successfully',
        color: 'success',
      })
      await fetchDeletedArticles()
    }
  } catch (error) {
    init({
      message: 'Failed to restore article',
      color: 'danger',
    })
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    fetchDeletedArticles()
  },
)

if (servicesStore.selectedRest) {
  onMounted(() => {
    fetchDeletedArticles()
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="page-title">Deleted Article</h1>
    </div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="loading"
      :style="{
        '--va-data-table-height': '710px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
    >
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton color="primary" size="small" @click="onRestore(rowData)"> Restore </VaButton>
        </div>
      </template>
    </VaDataTable>
  </div>
</template>

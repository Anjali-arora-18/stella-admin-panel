<script setup lang="ts">
import { defineVaDataTableColumns, useModal, VaCard } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'
import { useServiceStore } from '@/stores/services'
import { useSubCategoriesStore } from '@/stores/subCategories'
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Name', key: 'text' },
  { label: 'Icon', key: 'icon' },
])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})
const subCategoryStore = useSubCategoriesStore()
const allergenOptions = subCategoryStore.allergenOptions
const items = toRef(props, 'items')
</script>

<template>
  <div>
    <h1 class="page-title font-bold">Allergens</h1>
    <VaCard>
      <VaCardContent>
        <VaDataTable
          :columns="columns"
          :items="allergenOptions"
          sticky-header
          :style="{
            '--va-data-table-height': '710px',
            '--va-data-table-thead-background': 'var(--va-background-element)',
            '--va-data-table-thead-color': '#2C82E0',
          }"
        >
          <template #cell(icon)="{ rowData }">
            <img :src="`/allergens/${rowData.icon}.png`" alt="Allergen Icon" class="w-10 h-10" />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>
<style lang="scss" scoped></style>

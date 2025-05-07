<script setup lang="ts">
import { defineVaDataTableColumns, useModal, VaCard } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'
import { useServiceStore } from '@/stores/services'
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'numericId' },
  { label: 'Name', key: 'name' },
  { label: 'Actions', key: 'actions' },
])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})
const items = toRef(props, 'items')
</script>
<template>
  <div>
    <h1 class="page-title font-bold">Allergens</h1>
  </div>
  <VaCard>
    <VaCardContent>
      <VaDataTable
        :columns="columns"
        :items="items"
        :loading="$props.loading"
        :style="{
          '--va-data-table-height': '500px',
          '--va-data-table-thead-background': 'var(--va-background-element)',
          '--va-data-table-thead-color': '#2C82E0',
        }"
        sticky-header
      >
        <template #cell(numericId)="{ rowData }">
          <div class="max-w-[120px] ellipsis">1</div>
        </template>
        <template #cell(name)="{ rowData }">
          <div class="max-w-[120px] ellipsis">Allergens</div>
        </template>
        <template #cell(actions)="{ rowData }">
          <div class="flex gap-2 justify-end">
            <VaButton preset="primary" size="small" icon="mso-edit" />
          </div>
        </template>
      </VaDataTable>
    </VaCardContent>
  </VaCard>
</template>
<style lang="scss" scoped></style>

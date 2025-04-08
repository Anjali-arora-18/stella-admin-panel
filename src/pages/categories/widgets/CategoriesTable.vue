<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { toRef } from 'vue'

const emits = defineEmits(['updateCategoryModal'])

const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Sub-Categories', key: 'sub_categories', sortable: false },
  { label: 'Area', key: 'area', sortable: false },
  { label: 'Schedule', key: 'schedule', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
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
  <VaDataTable :columns="columns" :items="items" :loading="$props.loading">
    <template #cell(id)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData._id }}
      </div>
    </template>
    <template #cell(code)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.wCode }}
      </div>
    </template>
    <template #cell(sub_categories)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.subCategories ? rowData.subCategories.map((e) => e.wCode + ' - ' + e.name).join(', ') : '' }}
      </div>
    </template>
    <template #cell(schedule)="{ rowData }">
      <div class="uppercase ellipsis max-w-[230px]">
        {{ rowData.schedule ? (rowData.schedule.selected === 'is24h' ? '24 Hours' : rowData.schedule.selected) : '-' }}
      </div>
    </template>
    <template #cell(IsActive)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        <VaBadge :color="rowData.IsActive ? 'success' : 'danger'" :text="rowData.IsActive ? 'Yes' : 'No'" />
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('updateCategoryModal', rowData)" />
      <VaButton preset="primary" size="small" color="danger" icon="mso-delete" class="ml-2" />
    </template>
  </VaDataTable>
</template>

<style lang="scss" scoped>
.notification-dropdown {
  cursor: pointer;

  .notification-dropdown__icon {
    position: relative;
    display: flex;
    align-items: center;
  }
  .va-dropdown__anchor {
    display: inline-block;
  }
}
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>

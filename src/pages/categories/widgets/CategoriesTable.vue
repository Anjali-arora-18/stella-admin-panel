<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { toRef } from 'vue'

const emits = defineEmits(['updateCategoryModal'])

const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'Update Categories', key: 'actions', align: 'left' },
  { label: 'Code', key: 'Code', sortable: false },
  { label: 'Designation', key: 'Designation', sortable: false },
  { label: 'IsActive', key: 'IsActive', sortable: false },
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
    <template #cell(Code)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.Code }}
      </div>
    </template>

    <template #cell(Designation)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.Designation }}
      </div>
    </template>
    <template #cell(IsActive)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        <VaBadge :color="rowData.IsActive ? 'success' : 'danger'" :text="rowData.IsActive ? 'Yes' : 'No'" />
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton  class="w-fit h-fit" preset="primary" @click="emits('updateCategoryModal')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="inline-block"
        >
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      </VaButton>
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

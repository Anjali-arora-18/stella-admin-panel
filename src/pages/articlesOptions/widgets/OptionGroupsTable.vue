<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
const emits = defineEmits([])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  loading: { type: Boolean, default: false },
})
const { confirm } = useModal()
const { init } = useToast()
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id', sortable: false },
  { label: 'Name', key: 'firstName', sortable: false },
  { label: 'Internal Name', key: 'internalName', sortable: false },
  { label: 'Description', key: 'description', sortable: false },
  { label: 'Single Choice', key: 'singleChoice', sortable: false },
  { label: 'Multiple Choice', key: 'multipleChoice', sortable: false },
  { label: 'Mandatory', key: 'mandatory', sortable: false },
  { label: 'Minimum Choices', key: 'minimumChoices', sortable: false },
  { label: 'Maximum Choices', key: 'maximumChoices', sortable: false },
  { label: 'Options', key: 'options', sortable: false },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

const items = toRef(props, 'items')
const searchQuery = ref('')
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
      <VaInput v-model="searchQuery" placeholder="Search..." class="max-w-[400px] w-full" size="small" />
    </div>
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
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox size="small" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" icon="mso-edit" />
          <VaButton preset="primary" size="small" color="danger" icon="mso-delete" />
        </div>
      </template>
    </VaDataTable>
  </div>
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
::v-deep(.va-data-table__table thead th:last-child) {
  text-align: right !important;
}
</style>

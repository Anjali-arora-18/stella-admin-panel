<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
const emits = defineEmits(['updateStellaUserModal', 'editUser', 'deleteUser', 'sortBy', 'sortingOrder'])
const { confirm } = useModal()
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'First Name', key: 'firstName', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Last Name', key: 'lastName', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Type', key: 'role', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Outlets', key: 'outlets', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Username', key: 'username', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Email', key: 'email', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

const outlets = computed(() => servicesStore.items)

const onButtonUserDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this User?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete User',
  })
  if (result) {
    deleteUser(payload)
  }
}
function deleteUser(payload) {
  emits('deleteUser', payload)
}

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

const types = [
  { text: 'Super Admin', value: 'admin' },
  { text: 'Admin', value: 'user' },
  { text: 'Editor', value: 'editor' },
]

const getOutletName = (payload) => {
  return outlets.value.find((a) => a._id === payload) ? outlets.value.find((a) => a._id === payload).name : ''
}
const items = toRef(props, 'items')
const searchQuery = ref('')

function editUser(payload) {
  emits('editUser', payload)
}
</script>

<template>
  <div>
    <div class="mb-4">
      <VaInput
        v-model="searchQuery"
        placeholder="Search categories by name or outlet..."
        class="max-w-[400px]"
        size="small"
      />
    </div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="$props.loading"
      :disable-client-side-sorting="true"
      :style="{
        '--va-data-table-height': '500px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
      @update:sortBy="(sortBy) => $emit('sortBy', sortBy)"
      @update:sortingOrder="(sortDesc) => $emit('sortingOrder', sortDesc)"
    >
      <template #cell(role)="{ rowData }">
        <div class="table-cell-content">
          {{ rowData.role ? types.find((a) => a.value === rowData.role)?.text : '' }}
        </div>
      </template>
      <template #cell(outlets)="{ rowData }">
        <div v-if="rowData.outlets" class="table-cell-content">
          <span v-for="outlet in rowData.outlets" :key="outlet._id">
            <VaBadge v-if="outlet" :text="getOutletName(outlet)" color="primary" class="px-1" />
          </span>
        </div>
      </template>

      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            icon="mso-edit"
            @click="$emit('editUser', { ...rowData, updating: 'all' })"
          />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonUserDelete(rowData)"
          />
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

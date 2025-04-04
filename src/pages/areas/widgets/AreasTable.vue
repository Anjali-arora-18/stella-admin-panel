<script setup lang="ts">
import { defineVaDataTableColumns, useToast } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef } from 'vue'
import { useServiceStore } from '../../../stores/services'

const emits = defineEmits(['deleteArea', 'editArea', 'loadArea', 'editTable'])
const { init } = useToast()
const serviceStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'Id', key: 'id', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Tables', key: 'tables', sortable: false },
  { label: 'Disabled', key: 'disabled', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const tableColumns = defineVaDataTableColumns([
  { label: 'Id', key: 'id', sortable: false },
  { label: 'Type', key: 'type', sortable: false },
  { label: 'Number', key: 'number', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Discount', key: 'discount', sortable: false },
  { label: 'Active', key: 'active', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

function filterTableData($event, rowData) {
  const searchInput = $event.target.value
  const rowIndex = items.value.findIndex((item) => item._id === rowData._id)
  if (searchInput.length > 0) {
    items.value[rowIndex].filteredTables = rowData.tables.filter((item) => {
      console.log(item)
      return item.name.toLowerCase().includes(searchInput.toLowerCase()) || item.number.toString().includes(searchInput)
    })
  } else {
    items.value[rowIndex].filteredTables = rowData.tables
  }
}

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

function deleteArea(payload) {
  emits('deleteArea', payload)
}

function editArea(payload) {
  emits('editArea', payload)
}

async function deleteTable(payload) {
  await serviceStore
    .deleteTable({ id: payload })
    .then(() => {
      emits('loadArea')
      init({ message: 'Table deleted successfully.', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response.data, color: 'danger' })
    })
}

const items = toRef(props, 'items')
</script>

<template>
  <VaDataTable :columns="columns" :items="items" :loading="$props.loading">
    <template #cell(id)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.id }}
      </div>
    </template>

    <template #cell(name)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.name }}
      </div>
    </template>
    <template #cell(tables)="{ row, rowData, isExpanded }">
      <div class="ellipsis">
        <VaButton
          :icon="isExpanded ? 'va-arrow-up' : 'va-arrow-down'"
          preset="secondary"
          @click="row.toggleRowDetails()"
        >
          {{ rowData.tables.length }}
        </VaButton>
      </div>
    </template>

    <template #expandableRow="{ rowData }">
      <div class="expandable_table">
        <VaInput
          class="search-input"
          placeholder="Search..."
          type="text"
          size="small"
          @input="filterTableData($event, rowData)"
        />
        <VaDataTable
          style="flex-grow: 1; width: 100%"
          :items="rowData.filteredTables"
          :columns="tableColumns"
          :loading="$props.loading"
        >
          <template #cell(id)="{ rowData }">
            <div class="max-w-[120px] ellipsis">{{ rowData._id }}</div>
          </template>

          <template #cell(type)="{ rowData }">
            <div class="max-w-[120px] ellipsis">{{ rowData.type }}</div>
          </template>

          <template #cell(number)="{ rowData }">
            <div class="max-w-[120px] ellipsis">{{ rowData.number }}</div>
          </template>

          <template #cell(name)="{ rowData }">
            <div class="ellipsis max-w-[230px]">{{ rowData.name }}</div>
          </template>

          <template #cell(discount)="{ rowData }">
            <div class="max-w-[120px] ellipsis">{{ rowData.discount }}%</div>
          </template>

          <template #cell(active)="{ rowData }">
            <div class="max-w-[120px] ellipsis">
              <VaBadge
                :color="rowData.active ? 'success' : 'danger'"
                :text="rowData.active ? 'Active' : 'Inactive'"
              ></VaBadge>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton preset="plain" icon="edit" @click="emits('editTable', rowData)" />
            <VaButton preset="plain" icon="delete" class="ml-3" @click="deleteTable(rowData._id)" />
          </template>
        </VaDataTable>
      </div>
    </template>
    <template #cell(disabled)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        <VaBadge
          :color="!rowData.disabled ? 'success' : 'danger'"
          :text="rowData.disabled ? 'Disabled' : 'Enabled'"
        ></VaBadge>
      </div>
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-start">
        <VaButton preset="primary" size="small" icon="mso-edit" aria-label="Edit area" @click="editArea(rowData)" />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete area"
          @click="deleteArea(rowData)"
        />
      </div>
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

.expandable_table {
  background-color: var(--va-background-element);
  color: var(--va-on-background-element);
}
.search-input {
  width: 40%;
  padding: 6px;
  font-size: 0.8rem;
}
</style>

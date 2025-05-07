<script setup lang="ts">
import { defineVaDataTableColumns, useToast, useModal } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef, computed } from 'vue'
import { useServiceStore } from '../../../stores/services'
import { validators } from '../../../services/utils'
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

const emits = defineEmits(['deleteArea', 'editArea', 'loadArea', 'editTable', 'loadAreaTable', 'updateArea'])
const { init } = useToast()
const { confirm } = useModal()
const serviceStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'Id', key: 'numericId', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Tables', key: 'tables', sortable: false },
  { label: 'Disabled', key: 'disabled', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const tableColumns = defineVaDataTableColumns([
  { label: 'Id', key: 'numericId', sortable: false },
  { label: 'Type', key: 'type', sortable: true },
  { label: 'Area', key: 'area', sortable: true },
  { label: 'Number', key: 'number', sortable: true },
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Discount', key: 'discount', sortable: true },
  { label: 'Active', key: 'active', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

function filterTableData($event, rowData) {
  const searchInput = $event.target.value
  const rowIndex = items.value.findIndex((item) => item._id === rowData._id)
  if (searchInput.length > 0) {
    items.value[rowIndex].filteredTables = rowData.tables.filter((item) => {
      return item.name.toLowerCase().includes(searchInput.toLowerCase()) || item.number.toString().includes(searchInput)
    })
  } else {
    items.value[rowIndex].filteredTables = rowData.tables
  }
}

const onButtonAreaDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Area?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Area',
  })
  if (result) {
    deleteArea(payload)
  }
}
function deleteArea(payload) {
  emits('deleteArea', payload)
}

function editArea(payload) {
  emits('editArea', payload)
}

const onButtonClick = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this table?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Table',
  })
  if (result) {
    deleteTable(payload)
  } else {
    // init({ message: 'Table deletion cancelled.', color: 'info' })
  }
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

function updateTable(rowData, areaId) {
  const payload = {
    id: rowData._id,
    data: {
      ...rowData,
      number: rowData.number,
      name: rowData.name,
      discount: rowData.discount,
      active: rowData.active,
    },
  }
  delete payload.data.code
  delete payload.data.createdAt
  delete payload.data.updatedAt
  delete payload.data.__v
  serviceStore
    .updateTable(payload)
    .then(() => {
      init({ message: 'Table updated successfully.', color: 'success' })
      emits('loadAreaTable', areaId)
    })
    .catch((err) => {
      init({ message: err.response.data, color: 'danger' })
    })
}

const items = toRef(props, 'items')

const areas = computed(() =>
  items.value.map((e: any) => {
    return { text: e.name, value: e._id }
  }),
)
</script>

<template>
  <VaDataTable
    :columns="columns"
    :items="items"
    :loading="$props.loading"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-thead-color': '#2C82E0',
    }"
    sticky-header
  >
    <template #cell(numericId)="{ rowData }">
      <div class="ellipsis">
        {{ rowData.numericId }}
      </div>
    </template>
    <template #cell(name)="{ rowData }">
      <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'name'">
        <input
          v-if="rowData.editing === 'name'"
          v-model="rowData.name"
          class="w-full p-1 border rounded"
          autofocus
          @keyup.enter="$emit('updateArea', rowData), (rowData.editing = '')"
        />
        <span v-else>{{ rowData.name }}</span>
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

    <template #expandableRow="{ rowData, itemKey }">
      <div class="expandable_table rounded p-5">
        <VaInput
          class="search-input h-12"
          placeholder="Search..."
          type="text"
          size="small"
          @input="filterTableData($event, rowData)"
        />
        <VaDataTable
          style="flex-grow: 1; width: 100%"
          :items="rowData.filteredTables"
          :columns="tableColumns"
          :style="{
            '--va-data-table-thead-background': 'var(--va-background-element)',
            '--va-data-table-thead-color': '#2C82E0',
          }"
          sticky-header
        >
          <template #cell(numericId)="{ rowData }">
            <div class="ellipsis">{{ rowData.numericId }}</div>
          </template>

          <template #cell(type)="{ rowData }">
            <div v-if="!rowData.isEdit" class="ellipsis" @click="rowData.isEdit = true">
              {{ rowData.type }}
            </div>
            <VaSelect
              v-else
              id="type"
              v-model="rowData.type"
              size="small"
              :rules="[validators.required]"
              :options="['Table', 'Delivery', 'Takeaway', 'Umbrella', 'Sunbed', 'Office']"
              class="mb-1"
            />
          </template>
          <template #cell(area)="{ rowData }">
            <div v-if="!rowData.isEdit" class="ellipsis" @click="rowData.isEdit = true">
              {{ areas.find((area) => area.value === rowData.areaId)?.text }}
            </div>
            <VaSelect
              v-else
              id="area"
              v-model="rowData.areaId"
              :options="areas"
              :track-by="(option) => option.value"
              :value-by="(option) => option.value"
              :rules="[validators.required]"
              required-mark
              class="mb-1"
            />
          </template>

          <template #cell(number)="{ rowData }">
            <div v-if="!rowData.isEdit" class="ellipsis" @click="rowData.isEdit = true">
              {{ rowData.number }}
            </div>
            <VaInput v-else v-model="rowData.number" type="text" size="small" class="no-border-input" />
          </template>

          <template #cell(name)="{ rowData }">
            <div v-if="!rowData.isEdit" class="ellipsis" @click="rowData.isEdit = true">
              {{ rowData.name }}
            </div>
            <VaInput v-else v-model="rowData.name" type="text" size="small" class="" />
          </template>

          <template #cell(discount)="{ rowData }">
            <div v-if="!rowData.isEdit" class="ellipsis" @click="rowData.isEdit = true">{{ rowData.discount }}%</div>
            <VaInput v-else v-model="rowData.discount" type="number" size="small" suffix="%" class="" />
          </template>

          <template #cell(active)="{ rowData }">
            <div class="ellipsis">
              <VaBadge
                :color="rowData.active ? 'success' : 'danger'"
                :text="rowData.active ? 'Active' : 'Inactive'"
              ></VaBadge>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex justify-center">
              <VaButton
                preset="primary"
                size="small"
                icon="mso-edit"
                aria-label="Edit table"
                @click="$emit('editTable', rowData)"
              />
              <VaButton
                :disabled="!rowData.isEdit"
                preset="primary"
                size="small"
                icon="save"
                class="ml-2"
                @click="updateTable(rowData, itemKey._id)"
              />
              <VaButton
                preset="primary"
                size="small"
                icon="mso-delete"
                color="danger"
                class="ml-2"
                @click="onButtonClick(rowData._id)"
              />
            </div>
          </template>
        </VaDataTable>
      </div>
    </template>
    <template #cell(disabled)="{ rowData }">
      <div class="ellipsis">
        <VaBadge
          :color="!rowData.disabled ? 'success' : 'danger'"
          :text="rowData.disabled ? 'Disabled' : 'Enabled'"
        ></VaBadge>
      </div>
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-center">
        <VaButton preset="primary" size="small" icon="mso-edit" aria-label="Edit area" @click="editArea(rowData)" />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete area"
          @click="onButtonAreaDelete(rowData)"
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
.inline-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 0.875rem;
}
::v-deep(.va-data-table__table thead th:last-child) {
  text-align: center !important;
}
</style>

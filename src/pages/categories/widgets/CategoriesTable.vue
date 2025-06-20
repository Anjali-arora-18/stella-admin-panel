<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
const emits = defineEmits(['updateCategoryModal', 'updateCategory', 'sortBy', 'sortingOrder'])
const { confirm } = useModal()
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'numericId', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Code', key: 'wCode', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Sub-Categories', key: 'sub_categories', sortable: false },
  { label: 'Area', key: 'area', sortable: false },
  { label: 'Schedule', key: 'schedule', sortable: false },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

const onButtonCategoryDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Category?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Category',
  })
  if (result) {
    deleteCategory(payload)
  }
}
function deleteCategory(payload) {
  emits('deleteCategory', payload)
}

const areas = ref([])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})
watch(
  () => props.items,
  (newValue) => {
    if (newValue.length > 0) {
      servicesStore.getAreas().then((response) => {
        areas.value = response.data.map((e) => {
          return {
            text: e.name,
            value: e._id,
          }
        })
      })
    }
  },
)

const items = toRef(props, 'items')

const searchQuery = ref('')

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(
    (item) => item.wCode?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query),
  )
})
</script>

<template>
  <div>
    <div class="mb-4">
      <VaInput
        v-model="searchQuery"
        placeholder="Search categories by code or name..."
        class="max-w-[400px]"
        size="small"
      />
    </div>
    <VaDataTable
      :columns="columns"
      :items="filteredItems"
      :loading="$props.loading"
      :disable-client-side-sorting="true"
      :style="{
        '--va-data-table-height': '650px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
      @update:sortBy="(sortBy) => $emit('sortBy', sortBy)"
      @update:sortingOrder="(sortDesc) => $emit('sortingOrder', sortDesc)"
    >
      <template #cell(numericId)="{ rowData }">
        <div class="max-w-[120px] ellipsis">
          {{ rowData.numericId }}
        </div>
      </template>
      <template #cell(wCode)="{ rowData }">
        <div v-if="!rowData.editCode" class="table-cell-content" @click="rowData.editCode = true">
          {{ rowData.wCode }}
        </div>
        <VaInput
          v-else
          v-model="rowData.wCode"
          v-focus
          class="editable-cell w-full"
          size="small"
          @blur="(rowData.editCode = false), emits('updateCategory', { wCode: rowData.wCode, _id: rowData._id })"
        />
      </template>
      <template #cell(name)="{ rowData }">
        <div v-if="!rowData.editName" class="table-cell-content" @click="rowData.editName = true">
          {{ rowData.name }}
        </div>
        <VaInput
          v-else
          v-model="rowData.name"
          v-focus
          class="editable-cell w-full"
          size="small"
          @blur="(rowData.editName = false), emits('updateCategory', { name: rowData.name, _id: rowData._id })"
        />
      </template>
      <template #cell(sub_categories)="{ rowData }">
        <div class="flex flex-col flex-wrap gap-1">
          <template v-if="rowData.subCategories.length <= 2">
            <VaBadge
              v-for="sub in rowData.subCategories"
              :key="sub.wCode"
              :text="` ${sub.wCode} - ${sub.name}`"
              color="secondary"
              class="px-2"
              @click="emits('updateCategoryModal', { ...rowData, updating: 'subCategory' })"
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="sub in rowData.subCategories.slice(0, 2)"
              :key="sub.wCode"
              :text="` ${sub.wCode} - ${sub.name}`"
              color="secondary"
              class="px-2"
              @click="emits('updateCategoryModal', { ...rowData, updating: 'subCategory' })"
            />
            <VaBadge
              :text="`+${rowData.subCategories.length - 2} more`"
              color="secondary"
              class="px-2"
              @click="emits('updateCategoryModal', { ...rowData, updating: 'subCategory' })"
            />
          </template>
        </div>
      </template>
      <template #cell(area)="{ rowData }">
        <div
          v-if="!rowData.editArea && !rowData.areaId.length"
          class="min-h-[24px] cursor-pointer"
          @click="rowData.editArea = true"
        ></div>
        <div
          v-if="!rowData.editArea"
          class="uppercase ellipsis min-w-[100px] max-w-[230px]"
          @click="rowData.editArea = true"
        >
          <div v-for="area in rowData.areaId" :key="area">
            <VaBadge
              color="secondary"
              :text="areas.find((a) => a.value === area) ? areas.find((a) => a.value === area).text : ''"
            >
            </VaBadge>
          </div>
        </div>
        <VaSelect
          v-else
          v-model="rowData.areaId"
          class="w-full p-1 border rounded"
          autofocus
          :multiple="true"
          value-by="value"
          :options="areas"
          @update:modelValue="
            (rowData.editCode = false), emits('updateCategory', { areaId: rowData.areaId, _id: rowData._id })
          "
        />
      </template>
      <template #cell(schedule)="{ rowData }">
        <div
          class="uppercase ellipsis max-w-[230px]"
          @click="emits('updateCategoryModal', { ...rowData, updating: 'schedule' })"
        >
          {{
            rowData.schedule ? (rowData.schedule.selected === 'is24h' ? '24 Hours' : rowData.schedule.selected) : '-'
          }}
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.isActive"
            size="small"
            @click="emits('updateCategory', { isActive: rowData.isActive, _id: rowData._id })"
          />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            icon="mso-edit"
            @click="emits('updateCategoryModal', { ...rowData, updating: 'all' })"
          />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonCategoryDelete(rowData)"
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

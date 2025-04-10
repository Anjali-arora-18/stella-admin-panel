<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'

const emits = defineEmits(['updateCategoryModal', 'updateCategory'])
const { confirm } = useModal()
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Sub-Categories', key: 'sub_categories', sortable: false },
  { label: 'Area', key: 'area', sortable: false },
  { label: 'Schedule', key: 'schedule', sortable: false },
  { label: 'Active', key: 'IsActive', sortable: false },
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
      <div v-if="!rowData.editCode" class="table-cell-content" @click="rowData.editCode = true">
        {{ rowData.wCode }}
      </div>
      <VaInput
        v-else
        v-model="rowData.wCode"
        v-focus
        class="editable-cell w-full"
        size="small"
        @blur="(rowData.editCode = false), emits('updateCategory', rowData)"
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
        @blur="(rowData.editName = false), emits('updateCategory', rowData)"
      />
    </template>
    <template #cell(sub_categories)="{ rowData }">
      <div class="flex flex-col flex-wrap gap-1">
        <VaBadge
          v-for="sub in rowData.subCategories"
          :key="sub.wCode"
          :text="` ${sub.wCode} - ${sub.name}`"
          color="secondary"
          class="px-2"
        >
        </VaBadge>
      </div>
    </template>
    <template #cell(schedule)="{ rowData }">
      <div v-if="!rowData.editSchedule" class="table-cell-content" @click="rowData.editSchedule = true">
        {{ rowData.schedule.selected }}
      </div>
      <VaSelect
        v-else
        v-model="rowData.schedule.selected"
        v-focus
        :options="['is24h', 'daily', 'byDay']"
        class="editable-cell w-full"
        size="small"
        @update:modelValue="emits('updateCategory', rowData)"
        @blur="rowData.editSchedule = false"
      />
    </template>
    <template #cell(IsActive)="{ rowData }">
      <div class="table-cell-content">
        <VaCheckbox v-model="rowData.isActive" size="small" @click="emits('updateCategory', rowData)" />
      </div>
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2">
        <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('updateCategoryModal', rowData)" />
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

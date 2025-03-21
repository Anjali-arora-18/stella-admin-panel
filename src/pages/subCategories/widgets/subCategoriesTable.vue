<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { toRef } from 'vue'

const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'id', key: 'ID', sortable: false },
  { label: 'Code', key: 'Code', sortable: false },
  { label: 'Designation', key: 'Designation', sortable: false },
  { label: 'IsActive', key: 'IsActive', sortable: false },
  { label: 'Family Code', key: 'FamilyCode', sortable: false },
  { label: 'Sub Family Code', key: 'SubFamilyCode', sortable: false },
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
    <template #cell(ID)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.ID }}
      </div>
    </template>

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
    <template #cell(FamilyCode)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.FamilyCode }}
      </div>
    </template>
    <template #cell(SubFamilyCode)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.SubFamilyCode }}
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton
        preset="primary"
        size="small"
        icon="material-icons-visibility"
        @click="router.push('subCategories/' + rowData['_id'])"
      />
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

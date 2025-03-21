<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef } from 'vue'

const router = useRouter()
const route = useRoute()
const columns = defineVaDataTableColumns([
  { label: 'Code', key: 'Code', sortable: false },
  { label: 'Designation', key: 'Designation', sortable: false },
  { label: 'IsActive', key: 'IsActive', sortable: false },
  { label: 'Warehouse', key: 'WarehouseCode', sortable: false },
  {
    label: 'Articles/Sub Families/Tables/Table Splits/Documents Header',
    key: 'AllowArticlesWithoutCategory',
    sortable: false,
  },
  { label: '', key: 'POSSaleDocumentTypeCode', sortable: false },
  { label: '', key: 'RetailSaleDocumentTypeCode', sortable: false },
  { label: '', key: 'SupplierPurchaseDocumentTypeCode', sortable: false },
  { label: '', key: 'SupplierOrderDocumentTypeCode', sortable: false },
  { label: '', key: 'FabricationDocumentTypeCode', sortable: false },
  { label: '', key: 'POSCompanyLogoURL', sortable: false },
  { label: '', key: 'RequestPax', sortable: false },
  { label: '', key: 'POSFamiliesSortOrder', sortable: false },
  { label: '', key: 'POSArticlesSortOrder', sortable: false },
  { label: '', key: 'POSArticleHoldsSortOrder', sortable: false },
  { label: '', key: 'POSArticleDescriptivesSortOrder', sortable: false },
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
        {{ rowData.IsActive }}
      </div>
    </template>
    <template #cell(WarehouseCode)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.WarehouseCode }}
      </div>
    </template>
    <template #cell(AllowArticlesWithoutCategory)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        <VaBadge
          :color="rowData.AllowArticlesWithoutCategory ? 'success' : 'danger'"
          :text="rowData.AllowArticlesWithoutCategory ? 'Yes' : 'No'"
        />
      </div>
      <div class="ellipsis max-w-[230px]">
        <VaBadge
          :color="rowData.UseSubFamiliesOrSubCategories ? 'success' : 'danger'"
          :text="rowData.UseSubFamiliesOrSubCategories ? 'Yes' : 'No'"
        />
      </div>
      <div class="ellipsis max-w-[230px]">
        <VaBadge :color="rowData.WorkWithTables ? 'success' : 'danger'" :text="rowData.WorkWithTables ? 'Yes' : 'No'" />
      </div>
      <div class="ellipsis max-w-[230px]">
        <VaBadge
          :color="rowData.CanUseTableSplits ? 'success' : 'danger'"
          :text="rowData.CanUseTableSplits ? 'Yes' : 'No'"
        />
      </div>
      <div class="ellipsis max-w-[230px]">
        <VaBadge
          :color="rowData.DocumentsHeader ? 'success' : 'danger'"
          :text="rowData.DocumentsHeader ? 'Yes' : 'No'"
        />
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton
        preset="primary"
        size="small"
        icon="material-icons-visibility"
        @click="router.push('/company/' + route.params.id + '/restaurant/' + rowData.Code)"
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

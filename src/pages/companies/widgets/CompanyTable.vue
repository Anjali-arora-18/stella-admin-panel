<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { toRef } from 'vue'
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'id', key: '_id', sortable: false },
  { label: 'Code', key: 'Code', sortable: false },
  { label: 'Comercial Designation', key: 'ComercialDesignation', sortable: false },
  { label: 'Register Designation', key: 'RegisterDesignation', sortable: false },
  { label: 'Comercial Registration', key: 'ComercialRegistration', sortable: false },
  { label: 'Serial Number', key: 'SerialNumber', sortable: false },
  { label: 'Action', key: 'actions', align: 'justify-center' },
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
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        {{ rowData.id }}
      </div>
    </template>

    <template #cell(code)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.code }}
      </div>
    </template>

    <template #cell(ComercialDesignation)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.ComercialDesignation }}
      </div>
    </template>
    <template #cell(RegisterDesignation)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.RegisterDesignation }}
      </div>
    </template>
    <template #cell(ComercialRegistration)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.ComercialRegistration }}
      </div>
    </template>
    <template #cell(SerialNumber)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.SerialNumber }}
      </div>
    </template>
    <template #cell(actions)="{ rowData }">
      <VaButton
        preset="primary"
        size="small"
        icon="material-icons-visibility"
        @click="router.push('company/' + rowData['Code'] + '/view')"
      />
    </template>
  </VaDataTable>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
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
</style>

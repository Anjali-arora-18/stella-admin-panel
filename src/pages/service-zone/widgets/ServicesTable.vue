<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef } from 'vue'

const router = useRouter()
const route = useRoute()
const columns = defineVaDataTableColumns([
  { label: 'Id', key: 'id', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Email', key: 'email', sortable: false },
  { label: 'Address', key: 'address', sortable: false },
  { label: 'active', key: 'active', sortable: false },
  { label: 'Created at', key: 'created_at', sortable: false },
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
    <template #cell(id)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData._id }}
      </div>
    </template>

    <template #cell(name)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.name }}
      </div>
    </template>
    <template #cell(email)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.email }}
      </div>
    </template>
    <template #cell(address)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.address }}
      </div>
    </template>
    <template #cell(created_at)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.createdAt }}
      </div>
    </template>
    <template #cell(active)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        <VaBadge :color="rowData.active ? 'success' : 'danger'" :text="rowData.active ? 'Yes' : 'No'" />
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton
        preset="primary"
        size="small"
        icon="material-icons-edit"
        @click="router.push('/outlets/update/' + rowData._id)"
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

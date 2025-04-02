<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef } from 'vue'
import { useServiceStore } from '../../../stores/services'

const emits = defineEmits(['openTableModal', 'loadData'])

const activeCheck = toRef(true)
const serviceStore = useServiceStore()
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'Id', key: 'id', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Email', key: 'email', sortable: false },
  { label: 'Address', key: 'address', sortable: false },
  { label: 'Active', key: 'active', sortable: false },
  { label: 'Created at', key: 'created_at', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
  { label: 'Select', key: 'select', sortable: false },
])

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  selectedRest: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const items = toRef(props, 'items')

function deleteOutlet(id) {
  serviceStore.deleteOutlet(id).then((response) => {
    emits('loadData')
  })
}
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
      <VaButton preset="plain" icon="edit" @click="router.push('/outlets/update/' + rowData._id)" />
      <VaButton preset="plain" icon="delete" class="ml-3" @click="deleteOutlet(rowData._id)" />
    </template>
    <template #cell(select)="{ rowData }">
      <VaBadge v-if="$props.selectedRest === rowData._id" color="success" class="mr-2" text="Selected"></VaBadge>
      <VaButton v-else :preset="'primary'" @click.prevent="serviceStore.setRest(rowData._id)"> Select </VaButton>
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
</style>

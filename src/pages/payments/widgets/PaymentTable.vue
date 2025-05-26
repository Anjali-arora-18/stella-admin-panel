<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
const emits = defineEmits([])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },

  loading: { type: Boolean, default: false },
})
const { confirm } = useModal()
const { init } = useToast()
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Payment Gateway', key: 'paymentGateway', sortable: false },
  { label: 'Payment Type ID', key: 'paymentTypeID', sortable: false },
  { label: 'Dine-in', key: 'dineIn', sortable: false },
  { label: 'Delivery', key: 'delivery', sortable: false },
  { label: 'Takeaway', key: 'takeaway', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

// const onButtonPaymentDelete = async (payload) => {
//   const result = await confirm({
//     message: 'Are you sure you want to see delete this payment?',
//     okText: 'Yes',
//     cancelText: 'No',
//     size: 'medium',
//     title: 'Delete Payment',
//   })
//   if (result) {
//     deletepayment(payload)
//   }
// }
// function deletepayment(payload) {
//   emits('deletepayment', payload)
// }

const items = toRef(props, 'items')
</script>

<template>
  <div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="$props.loading"
      :style="{
        '--va-data-table-height': '500px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
    >
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" color="danger" icon="mso-delete" />
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

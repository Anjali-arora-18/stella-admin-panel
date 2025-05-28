<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
const emits = defineEmits(['getPayments', 'editPayment'])
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
  { label: 'ID', key: 'ID', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Payment Gateway', key: 'paymentGateway', sortable: false },
  { label: 'Payment Type ID', key: 'paymentTypeId', sortable: false },
  { label: 'Dine-in', key: 'dineIn', sortable: false },
  { label: 'Delivery', key: 'delivery', sortable: false },
  { label: 'Takeaway', key: 'takeaway', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

// const dineIn = ref(true)
// const delivery = ref(true)
// const takeaway = ref(true)

async function updateData(rowData) {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    _id: rowData._id,
    outletId: servicesStore.selectedRest,
    name: rowData.name,
    paymentGateway: rowData.paymentGateway,
    paymentGatewayConfig: rowData.paymentGatewayConfig || {},
    paymentTypeId: rowData.paymentTypeId,
    dineIn: rowData.dineIn,
    delivery: rowData.delivery,
    takeaway: rowData.takeaway,
    isDeleted: rowData.isDeleted,
  }
  await axios
    .patch(`${url}/payments/${rowData._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated a payment", color: 'success' })
      emits('getPayments')
    })
    .catch((err) => {
      init({ message: err.response.data.message, color: 'danger' })
    })
}

const onButtonPaymentDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this payment?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Payment',
  })
  if (result) {
    deletePayment(payload)
  }
}
async function deletePayment(payload) {
  await updateData({ ...payload, isDeleted: true })
}

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
      <template #cell(name)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editName" @click="rowData.editName = true">{{ rowData.name }}</div>
          <input
            v-else
            v-model="rowData.name"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(paymentTypeId)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editPaymentTypeId" @click="rowData.editPaymentTypeId = true">
            {{ rowData.paymentTypeId }}
          </div>
          <input
            v-else
            v-model="rowData.paymentTypeId"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(dineIn)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.dineIn" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(delivery)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.delivery" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(takeaway)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.takeaway" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('editPayment', rowData)" />

          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonPaymentDelete(rowData)"
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

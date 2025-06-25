<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
const emits = defineEmits(['getOffers'])
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
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description' },
  { label: 'Price', key: 'price' },
  { label: 'Image', key: 'image' },
  { label: 'Start-End Date', key: 'startDate' },
  { label: 'Week Days', key: 'weeklyOffer' },
  { label: 'Time From-To', key: 'startTime' },
  { label: 'Order Type', key: 'orderType' },
  { label: 'Selections', key: 'selection' },
  { label: 'Actions', key: 'actions' },
])

const IsActive = ref(true)

async function updateData(rowData) {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    isActive: rowData.isActive,
    name: rowData.name,
    description: rowData.description,
    price: rowData.price,
    imageUrl: rowData.imageUrl,
    startDate: rowData.startDate,
    endDate: rowData.endDate,
    weeklyOffer: rowData.weeklyOffer,
    startTime: rowData.startTime,
    endTime: rowData.endTime,
    orderType: rowData.orderType,
    selections: rowData.selections,
  }
  await axios
    .patch(`${url}/offers/${rowData._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated a Offer", color: 'success' })
      emits('getOffers')
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
}

const onButtonOfferDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Offer?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Offer',
  })
  if (result) {
    deleteOffer(payload)
  }
}

async function deleteOffer(payload) {
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
        '--va-data-table-height': '710px',
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

      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonOfferDelete(rowData)"
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

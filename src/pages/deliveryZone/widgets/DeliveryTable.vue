<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'
import { useServiceStore } from '@/stores/services'
import PostCodeModal from '../modals/PostCodeModal.vue'
import axios from 'axios'
const emits = defineEmits(['getDeliveryZones'])
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
  { label: 'Service Zone', key: 'serviceZoneId', sortable: false },
  { label: 'Delivery Zone', key: 'name', sortable: false },
  { label: 'Postcode', key: 'postalCodes', sortable: false },
  { label: 'Delivery Charges', key: 'deliveryCharge', sortable: false },
  { label: 'Terminal Number', key: 'terminalNumber' },
  { label: 'CC From - To', key: 'ccFromTable' },
  { label: 'Web From - To', key: 'webFromTable' },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

const showPostcodeModal = ref(false)
const selectedRowData = ref('')

function openPostcodeModal(rowData) {
  selectedRowData.value = rowData
  showPostcodeModal.value = true
}

async function updateData(rowData) {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    isActive: rowData.isActive,
    serviceZoneId: rowData.serviceZoneId,
    name: rowData.name,
    isDeleted: rowData.isDeleted,
    deliveryCharge: rowData.deliveryCharge,
    terminalNumber: rowData.terminalNumber,
    ccFromTable: rowData.ccFromTable,
    ccToTable: rowData.ccToTable,
    webFromTable: rowData.webFromTable,
    webToTable: rowData.webToTable,
  }
  await axios
    .patch(`${url}/deliveryZones/${rowData._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated a delivery zone", color: 'success' })
      emits('getDeliveryZones')
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
}

async function validateAndUpdateCC(rowData) {
  if (rowData._ccUpdating) return
  rowData._ccUpdating = true

  const from = Number(rowData.ccFromTable)
  const to = Number(rowData.ccToTable)

  if (!rowData.ccFromTable || rowData.ccToTable === '' || to > from) {
    rowData.ccError = ''
    await updateData(rowData)
    rowData.editCC = false
  } else {
    rowData.ccError = 'CC To must be greater than CC From'
  }

  setTimeout(() => {
    rowData._ccUpdating = false
  }, 300)
}

async function validateAndUpdateWeb(rowData) {
  if (rowData._webUpdating) return
  rowData._webUpdating = true

  const from = Number(rowData.webFromTable)
  const to = Number(rowData.webToTable)

  if (!rowData.webFromTable || rowData.webToTable === '' || to > from) {
    rowData.webError = ''
    await updateData(rowData)
    rowData.editWeb = false
  } else {
    rowData.webError = 'Web To must be greater than Web From'
  }

  setTimeout(() => {
    rowData._webUpdating = false
  }, 300)
}

const onButtonDeliveryDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Delivery zone?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Zone',
  })
  if (result) {
    deleteDelivery(payload)
  }
}

function hidePostalCodeModal() {
  showPostcodeModal.value = false
  selectedRowData.value = ''
  setTimeout(() => {
    emits('getDeliveryZones')
  }, 1000)
}

async function deleteDelivery(payload) {
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
      <template #cell(postalCodes)="{ rowData }">
        <div
          v-if="!rowData.postalCodes.length"
          class="min-h-[24px] cursor-pointer"
          @click="openPostcodeModal(rowData)"
        ></div>
        <div class="flex gap-1 flex-wrap">
          <template v-if="rowData.postalCodes.length <= 2">
            <VaBadge
              v-for="postCode in rowData.postalCodes"
              :key="postCode"
              color="#B3D943"
              size="small"
              class="cursor-pointer"
              :text="postCode"
              @click="openPostcodeModal(rowData)"
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="postCode in rowData.postalCodes.slice(0, 2)"
              :key="postCode"
              color="#B3D943"
              size="small"
              class="cursor-pointer"
              :text="postCode"
              @click="openPostcodeModal(rowData)"
            />
            <VaBadge
              :text="`+${rowData.postalCodes.length - 2} more`"
              color="#B3D943"
              class="cursor-pointer"
              @click="openPostcodeModal(rowData)"
            />
          </template>
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(serviceZoneId)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editServiceZoneId" @click="rowData.editServiceZoneId = true">
            {{ rowData.serviceZoneId }}
          </div>
          <input
            v-else
            v-model="rowData.serviceZoneId"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
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
      <template #cell(deliveryCharge)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editDeliveryCharge = true">
          <input
            v-if="rowData.editDeliveryCharge"
            v-model="rowData.deliveryCharge"
            class="w-full p-1 border rounded"
            type="number"
            @change="updateData(rowData), (rowData.editDeliveryCharge = false)"
          />
          <span v-else-if="parseFloat(rowData.deliveryCharge)">
            €{{ parseFloat(rowData.deliveryCharge).toFixed(2) }}
          </span>
          <span v-else>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </template>
      <template #cell(terminalNumber)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editTerminalNumber" @click="rowData.editTerminalNumber = true">
            {{ rowData.terminalNumber }}
          </div>
          <input
            v-else
            v-model="rowData.terminalNumber"
            class="w-1/2 p-1 border rounded"
            type="number"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(ccFromTable)="{ rowData }">
        <div class="table-cell-content">
          <template v-if="rowData.editCC">
            <input
              v-model="rowData.ccFromTable"
              class="w-[60px] p-1 border rounded mr-1"
              type="number"
              @blur="validateAndUpdateCC(rowData)"
              @keyup.enter="validateAndUpdateCC(rowData)"
            />
            <span>-</span>
            <input
              v-model="rowData.ccToTable"
              class="w-[60px] p-1 border rounded mx-1"
              type="number"
              @blur="validateAndUpdateCC(rowData)"
              @keyup.enter="validateAndUpdateCC(rowData)"
            />

            <div v-if="rowData.ccError" class="text-red-500 text-sm mt-1">
              {{ rowData.ccError }}
            </div>
          </template>
          <div v-else @click="rowData.editCC = true">{{ rowData.ccFromTable }} - {{ rowData.ccToTable }}</div>
        </div>
      </template>

      <template #cell(webFromTable)="{ rowData }">
        <div class="table-cell-content">
          <template v-if="rowData.editWeb">
            <input
              v-model="rowData.webFromTable"
              class="w-[60px] p-1 border rounded mr-1"
              type="number"
              @blur="validateAndUpdateWeb(rowData)"
              @keyup.enter="validateAndUpdateWeb(rowData)"
            />
            <span>-</span>
            <input
              v-model="rowData.webToTable"
              class="w-[60px] p-1 border rounded mx-1"
              type="number"
              @blur="validateAndUpdateWeb(rowData)"
              @keyup.enter="validateAndUpdateWeb(rowData)"
            />
            <div v-if="rowData.webError" class="text-red-500 text-sm mt-1">
              {{ rowData.webError }}
            </div>
          </template>
          <div v-else @click="rowData.editWeb = true">{{ rowData.webFromTable }} - {{ rowData.webToTable }}</div>
        </div>
      </template>

      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonDeliveryDelete(rowData)"
          />
        </div>
      </template>
    </VaDataTable>
  </div>
  <PostCodeModal v-if="showPostcodeModal" :row-data="selectedRowData" @cancel="hidePostalCodeModal" />
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

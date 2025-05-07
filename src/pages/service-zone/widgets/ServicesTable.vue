<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { toRef } from 'vue'
import { useServiceStore } from '../../../stores/services'
import axios from 'axios'
const emits = defineEmits(['openTableModal', 'loadData'])
const { confirm } = useModal()
const { init } = useToast()
const activeCheck = toRef(true)
const serviceStore = useServiceStore()
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'Id', key: 'numericId', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Email', key: 'email', sortable: false },
  { label: 'Address', key: 'address', sortable: false },
  { label: 'Active', key: 'active', sortable: false },
  // { label: 'Created at', key: 'created_at', sortable: false },
  { label: 'Download QR', key: 'download_qr', sortable: false },
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
  serviceStore.deleteOutlet(id).then(() => {
    init({
      message: "You've successfully deleted Outlet",
      color: 'success',
    })
    emits('loadData')
  })
}
const onButtonOutletDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Outlet?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Outlet',
  })
  if (result) {
    deleteOutlet(payload._id)
  }
}

function downloadQrCode(rowData) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  const data = 'https://' + rowData.name + '.' + import.meta.env.VITE_REST_APP_URL
  axios.get(`${apiBaseUrl}/qrcode?data=${data}`).then((response) => {
    const base64Data = response.data.qrCode
    const a = document.createElement('a')
    a.href = base64Data
    a.download = `${rowData.name}`
    a.click()
  })
}
</script>

<template>
  <VaDataTable
    :columns="columns"
    :items="items"
    :loading="$props.loading"
    :style="{
      '--va-data-table-thead-background': 'var(--va-background-element)',
      '--va-data-table-thead-color': '#2C82E0',
    }"
    sticky-header
  >
    <template #cell(numericId)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.numericId }}
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

    <!-- <template #cell(created_at)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.createdAt }}
      </div>
    </template> -->
    <template #cell(download_qr)="{ rowData }">
      <div class="text-center">
        <VaButton preset="plain" size="small" class="underline text-light text-center" @click="downloadQrCode(rowData)"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </VaButton>
      </div>
    </template>
    <template #cell(active)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        <VaBadge :color="rowData.active ? 'success' : 'danger'" :text="rowData.active ? 'Yes' : 'No'" />
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaButton preset="primary" size="small" icon="mso-edit" @click="router.push('/outlets/update/' + rowData._id)" />
      <VaButton
        preset="primary"
        size="small"
        color="danger"
        icon="mso-delete"
        class="ml-2"
        @click="onButtonOutletDelete(rowData)"
      />
    </template>
    <template #cell(select)="{ rowData }">
      <VaBadge v-if="$props.selectedRest === rowData._id" color="primary" class="mr-2" text="Selected"></VaBadge>
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

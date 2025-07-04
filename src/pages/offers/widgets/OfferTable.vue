<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import AddSelectionModal from '../modals/AddSelectionModal.vue'
import axios from 'axios'
const emits = defineEmits(['getOffers', 'editOffers'])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

const isAddSelectionModalOpen = ref(false)

const { confirm } = useModal()
const { init } = useToast()
const offerData = ref('')
const offerSelection = ref('')
const isEditSelection = ref(false)
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description', width: '150px' },
  { label: 'Price', key: 'price' },
  { label: 'Image', key: 'imageUrl' },
  { label: 'Start-End Date', key: 'startDate' },
  { label: 'Week Days', key: 'weeklyOffer', width: '150px' },
  { label: 'Time From-To', key: 'timeRange' },
  { label: 'Order Type', key: 'orderType' },
  { label: 'Selections', key: 'selections' },
  { label: 'Actions', key: 'actions' },
])

const selectionColumns = defineVaDataTableColumns([
  { label: 'Name', key: 'name' },
  { label: 'Options', key: 'menuItems' },
  { label: 'Min Choice', key: 'min' },
  { label: 'Max Choice', key: 'max' },
  { label: 'Actions', key: 'actions' },
])

const IsActive = ref(true)

const weekdayShortMap = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

function isValidDateString(dateStr) {
  return !!dateStr && !isNaN(new Date(dateStr).getTime())
}

async function updateData(rowData) {
  if (!rowData._id) {
    console.error('Missing _id for offer update:', rowData)
    init({ message: 'Offer ID missing, cannot update.', color: 'danger' })
    return
  }

  const url = import.meta.env.VITE_API_BASE_URL

  const startDate = rowData.dateOffer?.startDate
  const endDate = rowData.dateOffer?.endDate

  const data = {
    isActive: rowData.isActive,
    name: rowData.name,
    description: rowData.description,
    price: rowData.price,
    imageUrl: rowData.imageUrl,
    dateOffer: {
      startDate: isValidDateString(startDate) ? new Date(startDate).toISOString() : '',
      endDate: isValidDateString(endDate) ? new Date(endDate).toISOString() : '',
    },
    timeOffer: {
      startTime: rowData.timeOffer?.startTime || '',
      endTime: rowData.timeOffer?.endTime || '',
    },
    weeklyOffer: rowData.weeklyOffer || [],
    orderType: rowData.orderType,
    selections: rowData.selections,
  }

  try {
    await axios.put(`${url}/offers/${rowData._id}`, data)
    init({ message: "You've successfully updated", color: 'success' })
    if (!rowData.fromInlineEdit) {
      emits('getOffers')
    }
  } catch (err) {
    init({ message: err.response?.data?.error || 'Update failed', color: 'danger' })
  }
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

const onDeleteSelection = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Offer selection?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Offer Selection',
  })
  if (result) {
    deleteSelection(payload)
  }
}

async function deleteOffer(payload) {
  await axios
    .delete(`${import.meta.env.VITE_API_BASE_URL}/offers/${payload._id}`)
    .then(() => {
      init({ message: 'Offer deleted successfully', color: 'success' })
      emits('getOffers')
    })
    .catch((err) => {
      init({ message: err.response?.data?.error || 'Delete failed', color: 'danger' })
    })
}

async function deleteSelection(payload) {
  const updatedSelections = payload.selections.filter((selection) => selection._id !== payload.selectionId)

  await axios
    .put(`${import.meta.env.VITE_API_BASE_URL}/offers/${payload.offerId}/selections`, {
      selections: updatedSelections,
    })
    .then(() => {
      payload.selections.length = 0
      payload.selections.push(...updatedSelections)

      init({ message: 'Selection deleted successfully', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response?.data?.error || 'Delete failed', color: 'danger' })
    })
}

const items = toRef(props, 'items')
watch(
  () => props.items,
  (newItems) => {
    items.value = newItems.map((item) => ({ ...item }))
  },
)

const selectedRest = toRef(servicesStore, 'selectedRest')

function openFileModal(data) {
  console.log(data)
  document.getElementById('file-upload-' + data._id).click()
}
const deleteAsset = async (assetId) => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  await axios
    .delete(`${url}/assets/${assetId}`)
    .then(() => {
      init({ message: 'Asset deleted successfully', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
}
const onButtonOptionImageDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to delete this image?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Image',
  })

  if (!result) return

  try {
    if (payload.assetId && payload.assetId._id) {
      await deleteAsset(payload.assetId._id)
    }

    payload.imageUrl = ''
    payload.assetId = ''
    await updateData(payload)
  } catch (err) {
    init({ message: err?.response?.data?.message || 'Failed to delete image', color: 'danger' })
  }
}
function formatReadableDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)

  return `${day}/${month}/${year}`
}
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
            @change="
              () => {
                updateData(rowData)
                rowData.editName = false
              }
            "
          />
        </div>
      </template>
      <template #cell(description)="{ rowData }">
        <div v-if="!rowData.editDescription" class="description-ellipsis" @click="rowData.editDescription = true">
          {{ rowData.description }}
        </div>
        <textarea
          v-else
          v-model="rowData.description"
          class="description-edit"
          rows="2"
          @blur="
            () => {
              updateData(rowData)
              rowData.editDescription = false
            }
          "
        />
      </template>
      <template #cell(price)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editPrice" @click="rowData.editPrice = true">{{ rowData.price }}</div>
          <input
            v-else
            v-model="rowData.price"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="
              () => {
                updateData(rowData)
                rowData.editPrice = false
              }
            "
          />
        </div>
      </template>
      <template #cell(imageUrl)="{ rowData }">
        <div class="relative group w-10 h-10 overflow-hidden rounded">
          <img
            :src="rowData.imageUrl || '/missing-image.png'"
            alt="Article Image"
            class="w-full h-full object-cover cursor-pointer"
            @click="openFileModal(rowData)"
            @error="
              (e) => {
                e.target.src = '/missing-image.png'
              }
            "
          />

          <VaButton
            v-if="rowData.imageUrl"
            preset="plain"
            size="small"
            icon="mso-delete"
            color="danger"
            class="!absolute !top-0 !right-0 !p-0 !w-5 !h-5 !rounded-full hidden group-hover:flex items-center justify-center z-10"
            @click.prevent="onButtonOptionImageDelete(rowData)"
          />

          <FileUpload
            :attr-id="'file-upload-' + rowData._id"
            class="hidden"
            :selected-rest="selectedRest"
            @uploadSuccess="
              (data) => {
                rowData.imageUrl = data.url
                rowData.assetId = data._id
                updateData(rowData)
                rowData.editing = ''
              }
            "
          />
        </div>
      </template>
      <template #cell(startDate)="{ rowData }">
        <div>
          {{ formatReadableDate(rowData.dateOffer?.startDate) }}
          <span v-if="rowData.dateOffer?.startDate && rowData.dateOffer?.endDate" class="mx-1 font-bold"> - </span>
          {{ formatReadableDate(rowData.dateOffer?.endDate) }}
        </div>
      </template>

      <template #cell(timeRange)="{ rowData }">
        <div>
          {{ rowData.timeOffer?.startTime || '' }}
          <span v-if="rowData.timeOffer?.startTime && rowData.timeOffer?.endTime" class="mx-1 font-bold"> - </span>
          {{ rowData.timeOffer?.endTime || '' }}
        </div>
      </template>
      <template #cell(weeklyOffer)="{ rowData }">
        <div class="weekdays-ellipsis">
          {{
            (rowData.weeklyOffer || [])
              .filter((day) => typeof day === 'string')
              .map((day) => weekdayShortMap[day.toLowerCase()] || '')
              .join(', ')
          }}
        </div>
      </template>
      <template #cell(orderType)="{ rowData }">
        <div>
          {{ (rowData.orderType || []).map((type) => type.charAt(0).toUpperCase() + type.slice(1)).join(', ') }}
        </div>
      </template>
      <template #cell(selections)="{ row, rowData, isExpanded }">
        <div class="ellipsis">
          <VaButton
            :icon="isExpanded ? 'va-arrow-up' : 'va-arrow-down'"
            preset="secondary"
            @click="row.toggleRowDetails()"
          >
            {{ rowData.selections?.length || 0 }} Selections
          </VaButton>
        </div>
      </template>
      <template #expandableRow="{ rowData }">
        <div class="expandable_table rounded p-5">
          <div class="flex justify-end mb-4">
            <VaButton color="primary" icon="mso-add" @click="(isAddSelectionModalOpen = true), (offerData = rowData)">
              Add Selection
            </VaButton>
          </div>

          <table class="w-full table-fixed border-collapse">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2 px-3 w-[25%]">Name</th>
                <th class="py-2 px-3 w-[20%]">Options</th>
                <th class="py-2 px-3 w-[15%]">Min Choice</th>
                <th class="py-2 px-3 w-[15%]">Max Choice</th>
                <th class="py-2 px-3 w-[25%] text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="selection in rowData.selections" :key="selection._id" class="border-b hover:bg-gray-50">
                <td class="py-2 px-3">
                  <div v-if="!selection.editName" @click="selection.editName = true">{{ selection.name }}</div>
                  <input
                    v-else
                    v-model="selection.name"
                    class="w-full p-1 border rounded"
                    type="text"
                    @change="
                      () => {
                        updateData({ ...rowData, fromInlineEdit: true })
                        selection.editName = false
                      }
                    "
                  />
                </td>

                <td class="py-2 px-3">{{ selection.menuItems?.length || 0 }} Article</td>

                <td class="py-2 px-3">
                  <div v-if="!selection.editMinChoice" @click="selection.editMinChoice = true">
                    {{ selection.min }}
                  </div>
                  <input
                    v-else
                    v-model="selection.min"
                    class="w-full p-1 border rounded"
                    type="number"
                    @change="
                      () => {
                        updateData({ ...rowData, fromInlineEdit: true })
                        selection.editMinChoice = false
                      }
                    "
                  />
                </td>

                <td class="py-2 px-3">
                  <div v-if="!selection.editMaxChoice" @click="selection.editMaxChoice = true">
                    {{ selection.max }}
                  </div>
                  <input
                    v-else
                    v-model="selection.max"
                    class="w-full p-1 border rounded"
                    type="number"
                    @change="
                      () => {
                        updateData({ ...rowData, fromInlineEdit: true })
                        selection.editMaxChoice = false
                      }
                    "
                  />
                </td>

                <td class="py-2 px-3 text-right">
                  <div class="flex justify-end gap-2">
                    <VaButton
                      preset="primary"
                      size="small"
                      icon="mso-edit"
                      @click="
                        () => {
                          isAddSelectionModalOpen = true
                          offerData = rowData
                          isEditSelection = true
                          offerSelection = selection
                        }
                      "
                    />
                    <VaButton
                      preset="primary"
                      size="small"
                      icon="mso-delete"
                      color="danger"
                      @click="onDeleteSelection({ ...rowData, selectionId: selection._id, offerId: rowData._id })"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('editOffers', rowData)" />
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
    <AddSelectionModal
      v-if="isAddSelectionModalOpen"
      :is-edit-selection="isEditSelection"
      :offer-selection="offerSelection"
      :offer-data="offerData"
      @cancel="(isAddSelectionModalOpen = false), (offerSelection = ''), (isEditSelection = false), emits('getOffers')"
    />
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

.expandable_table {
  background-color: var(--va-background-element);
  color: var(--va-on-background-element);
}

.inline-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 0.875rem;
}

.description-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4em;
  max-height: 2.8em;
  white-space: normal;
  word-break: break-word;
  cursor: pointer;
}

.weekdays-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4em;
  max-height: 2.8em;
  white-space: normal;
  word-break: break-word;
  font-weight: bold;
}
.expandable_table table {
  width: 100%;
  border-spacing: 0;
}

.expandable_table th {
  font-weight: 600;
  background-color: var(--va-background-primary);
  color: var(--va-primary);
  border-bottom: 1px solid var(--va-background-border);
}

.expandable_table td {
  vertical-align: middle;
  padding: 0.75rem;
}

.expandable_table tr:hover {
  background-color: var(--va-background-secondary);
}
</style>

<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import AddSelectionModal from '../modals/AddSelectionModal.vue'
import axios from 'axios'

const emits = defineEmits(['getPromotions', 'editPromotions'])
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
const promotionData = ref('')
const promotionSelection = ref('')
const isEditSelection = ref(false)
const router = useRouter()
const servicesStore = useServiceStore()
const columns = defineVaDataTableColumns([
  { label: 'Name', key: 'name' },
  { label: 'Description', key: 'description', width: '150px' },
  { label: 'Price', key: 'price' },
  { label: 'Image', key: 'imageUrl' },
  { label: 'Start-End Date', key: 'startDate' },
  { label: 'Week Days', key: 'weeklyPromotion', width: '150px' },
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
    console.error('Missing _id for promotion update:', rowData)
    init({ message: 'Promotion ID missing, cannot update.', color: 'danger' })
    return
  }

  const url = import.meta.env.VITE_API_BASE_URL

  const startDate = rowData.datePromotion?.startDate
  const endDate = rowData.datePromotion?.endDate

  const data = {
    isActive: rowData.isActive,
    name: rowData.name,
    description: rowData.description,
    price: rowData.price,
    imageUrl: rowData.imageUrl,
    datePromotion: {
      startDate: isValidDateString(startDate) ? new Date(startDate).toISOString() : '',
      endDate: isValidDateString(endDate) ? new Date(endDate).toISOString() : '',
    },
    timePromotion: {
      startTime: rowData.timePromotion?.startTime || '',
      endTime: rowData.timePromotion?.endTime || '',
    },
    weeklyPromotion: rowData.weeklyPromotion || [],
    orderType: rowData.orderType,
    selections: rowData.selections,
  }

  try {
    await axios.put(`${url}/promotions/${rowData._id}`, data)
    init({ message: "You've successfully updated", color: 'success' })
    if (!rowData.fromInlineEdit) {
      emits('getPromotions')
    }
  } catch (err) {
    init({ message: err.response?.data?.error || 'Update failed', color: 'danger' })
  }
}

const onButtonPromotionDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to delete this Promotion?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Promotion',
  })
  if (result) {
    deletePromotion(payload)
  }
}

const onDeleteSelection = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to delete this Promotion selection?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Promotion Selection',
  })
  if (result) {
    deleteSelection(payload)
  }
}

async function deletePromotion(payload) {
  await axios
    .delete(`${import.meta.env.VITE_API_BASE_URL}/promotions/${payload._id}`)
    .then(() => {
      init({ message: 'Promotion deleted successfully', color: 'success' })
      emits('getPromotions')
    })
    .catch((err) => {
      init({ message: err.response?.data?.error || 'Delete failed', color: 'danger' })
    })
}

async function deleteSelection(payload) {
  const updatedSelections = payload.selections.filter((selection) => selection._id !== payload.selectionId)

  await axios
    .put(`${import.meta.env.VITE_API_BASE_URL}/promotions/${payload.promotionId}/selections`, {
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
      <!-- ... keep all your existing table cell templates but replace 'offer'/'offers' with 'promotion'/'promotions' everywhere ... -->
      <!-- Examples: -->

      <template #cell(weeklyPromotion)="{ rowData }">
        <div class="weekdays-ellipsis">
          {{
            (rowData.weeklyPromotion || [])
              .filter((day) => typeof day === 'string')
              .map((day) => weekdayShortMap[day.toLowerCase()] || '')
              .join(', ')
          }}
        </div>
      </template>

      <template #cell(startDate)="{ rowData }">
        <div>
          {{ formatReadableDate(rowData.datePromotion?.startDate) }}
          <span v-if="rowData.datePromotion?.startDate && rowData.datePromotion?.endDate" class="mx-1 font-bold"> - </span>
          {{ formatReadableDate(rowData.datePromotion?.endDate) }}
        </div>
      </template>
      
      <template #cell(timeRange)="{ rowData }">
        <div>
          {{ rowData.timePromotion?.startTime || '' }}
          <span v-if="rowData.timePromotion?.startTime && rowData.timePromotion?.endTime" class="mx-1 font-bold"> - </span>
          {{ rowData.timePromotion?.endTime || '' }}
        </div>
      </template>
      
      <!-- ...etc... -->

      <template #expandableRow="{ rowData }">
        <div class="expandable_table rounded p-5">
          <div class="flex justify-end mb-4">
            <VaButton color="primary" icon="mso-add" @click="(isAddSelectionModalOpen = true), (promotionData = rowData)">
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
                <!-- same as before; just use 'promotionSelection', 'promotionData' for modal props, etc. -->
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
                          promotionData = rowData
                          isEditSelection = true
                          promotionSelection = selection
                        }
                      "
                    />
                    <VaButton
                      preset="primary"
                      size="small"
                      icon="mso-delete"
                      color="danger"
                      @click="onDeleteSelection({ ...rowData, selectionId: selection._id, promotionId: rowData._id })"
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
          <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('editPromotions', rowData)" />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonPromotionDelete(rowData)"
          />
        </div>
      </template>
    </VaDataTable>

    <AddSelectionModal
      v-if="isAddSelectionModalOpen"
      :is-edit-selection="isEditSelection"
      :promotion-selection="promotionSelection"
      :promotion-data="promotionData"
      @cancel="(isAddSelectionModalOpen = false), (promotionSelection = ''), (isEditSelection = false), emits('getPromotions')"
    />
  </div>
</template>

<!-- Your styles section remains the same -->

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

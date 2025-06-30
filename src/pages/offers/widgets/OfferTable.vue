<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef } from 'vue'
import { useServiceStore } from '@/stores/services'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import AddSelectionModal from '../modals/AddSelectionModal.vue'
import axios from 'axios'
const emits = defineEmits(['getOffers', 'editOffers', 'addSelection', 'editSelection'])
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
const offerId = ref('')
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
  { label: 'Articles', key: 'menuItems' },
  { label: 'Max Choice', key: 'max' },
  { label: 'Min Choice', key: 'min' },
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
    init({ message: "You've successfully updated an Offer", color: 'success' })
    emits('getOffers')
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

const items = ref(props.items.map((item) => ({ ...item })))

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
                rowData.editName = false
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
      <template #expandableRow="{ rowData, itemKey }">
        <div class="expandable_table rounded p-5">
          <div class="flex justify-end mb-4">
            <VaButton color="primary" icon="mso-add" @click="(isAddSelectionModalOpen = true), (offerId = rowData._id)">
              Add Selection
            </VaButton>
          </div>
          <VaDataTable
            style="flex-grow: 1; width: 100%"
            :items="rowData.selections || []"
            :columns="selectionColumns"
            :style="{
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
            <template #cell(menuItems)="{ rowData }">
              <div class="table-cell-content">{{ rowData.menuItems?.length || 0 }} Article</div>
            </template>
            <template #cell(min)="{ rowData }">
              <div class="table-cell-content">
                <div v-if="!rowData.editMinChoice" @click="rowData.editMinChoice = true">
                  {{ rowData.min }}
                </div>
                <input
                  v-else
                  v-model="rowData.min"
                  class="w-1/2 p-1 border rounded"
                  type="text"
                  @change="
                    () => {
                      updateData(rowData)
                      rowData.editMinChoice = false
                    }
                  "
                />
              </div>
            </template>
            <template #cell(max)="{ rowData }">
              <div class="table-cell-content">
                <div v-if="!rowData.editMaxChoice" @click="rowData.editMaxChoice = true">
                  {{ rowData.max }}
                </div>
                <input
                  v-else
                  v-model="rowData.max"
                  class="w-1/2 p-1 border rounded"
                  type="text"
                  @change="
                    () => {
                      updateData(rowData)
                      rowData.editMaxChoice = false
                    }
                  "
                />
              </div>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="flex justify-center">
                <VaButton
                  preset="primary"
                  size="small"
                  icon="mso-edit"
                  aria-label="Edit table"
                  @click="$emit('editSelection', rowData)"
                />

                <VaButton
                  preset="primary"
                  size="small"
                  icon="mso-delete"
                  color="danger"
                  class="ml-2"
                  @click="onButtonClick(rowData._id)"
                />
              </div>
            </template>
          </VaDataTable>
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
      :selected-option="selectedOffers"
      :offer-id="offerId"
      @cancel="(isAddSelectionModalOpen = false), (selectedOffers = '')"
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
</style>

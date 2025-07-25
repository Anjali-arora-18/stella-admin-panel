<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import AddSelectionModal from '../modals/AddSelectionModal.vue'
import axios from 'axios'
import { updatePromotion, getMenuItemsByOutlet } from '../services/promotionService'

const emits = defineEmits(['getPromotions', 'editPromotions', 'openSelectionModal'])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

let cachedMenuItems = {}
let originalRowData = null
const menuItems = ref([])
const { confirm } = useModal()
const { init } = useToast()
const router = useRouter()
const servicesStore = useServiceStore()

/** Map IDs in menuItem to full menu item objects */
function getMenuItemDetails(ids) {
  if (!ids || !ids.length) return []
  return ids.map(id => menuItems.value.find(item => item._id === id)).filter(Boolean)
}

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

watch(
  () => servicesStore.selectedRest,
  async (newOutlet) => {
    if (!newOutlet) return
    await loadMenuItems(newOutlet)
  },
  { immediate: true }
)

async function loadMenuItems(outletId) {
  try {
    const res = await getMenuItemsByOutlet(outletId)
    menuItems.value = res.data || []
  } catch (err) {
    console.error('Failed to fetch menu items', err)
  }
}

function isValidDateString(dateStr) {
  return !!dateStr && !isNaN(new Date(dateStr).getTime())
}

function getChangedFields(original, updated) {
  const changed = {}
  for (const key in updated) {
    if (!Object.prototype.hasOwnProperty.call(updated, key)) continue
    if (typeof updated[key] === 'function') continue

    if (typeof updated[key] === 'object' && updated[key] !== null && original[key] !== null) {
      if (JSON.stringify(updated[key]) !== JSON.stringify(original[key])) {
        changed[key] = updated[key]
      }
    } else if (updated[key] !== original[key]) {
      changed[key] = updated[key]
    }
  }
  return changed
}

async function updateData(rowData) {
  if (!rowData._id) {
    init({ message: 'Promotion ID missing, cannot update.', color: 'danger' })
    return
  }

  const changedFields = originalRowData ? getChangedFields(originalRowData, rowData) : rowData
  if (Object.keys(changedFields).length === 0) {
    init({ message: 'No changes detected.', color: 'info' })
    return
  }

  try {
    await updatePromotion(rowData._id, changedFields)
    init({ message: "You've successfully updated", color: 'success' })
    emits('getPromotions')
  } catch (err) {
    console.error('[updateData] Update error:', err?.response?.data || err)
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

const items = toRef(props, 'items')
watch(
  () => props.items,
  (newItems) => {
    items.value = newItems.map((item) => ({ ...item }))
  }
)

function formatReadableDate(dateStr) {
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
      <!-- Weekdays Display -->
      <template #cell(weeklyPromotion)="{ rowData }">
        <div class="weekdays-ellipsis">
          {{ (rowData.weeklyPromotion || []).join(', ') }}
        </div>
      </template>

      <!-- Date Range -->
      <template #cell(startDate)="{ rowData }">
        <div>
          {{ formatReadableDate(rowData.startDate) }}
          <span v-if="rowData.startDate && rowData.endDate" class="mx-1 font-bold"> - </span>
          {{ formatReadableDate(rowData.endDate) }}
        </div>
      </template>

      <!-- Time Range -->
      <template #cell(timeRange)="{ rowData }">
        <div>
          {{ rowData.timeRange }}
        </div>
      </template>

      <!-- Selections (Menu Items) -->
      <template #cell(selections)="{ rowData }">
        <div class="flex flex-col gap-1">
          <div v-if="getMenuItemDetails(rowData.menuItem)?.length">
            <div
              v-for="item in getMenuItemDetails(rowData.menuItem)"
              :key="item._id"
              class="text-blue-600 cursor-pointer hover:underline truncate"
              @click="
                emits('openSelectionModal', {
                  promotion: rowData,
                  selection: item,
                  isEdit: true
                })
              "
            >
              • {{ item.name }}
            </div>
          </div>

          <VaButton
            v-else
            size="small"
            color="primary"
            icon="mso-add"
            @click="
              emits('openSelectionModal', {
                promotion: rowData,
                selection: null,
                isEdit: false
              })
            "
          >
            Add
          </VaButton>
        </div>
      </template>

      <!-- Expandable Row -->
      <template #expandableRow="{ rowData }">
        <div class="expandable_table rounded p-5">
          <!-- Linked Menu Items -->
          <div class="mb-4">
            <p class="font-semibold">Menu Items linked:</p>
            <div v-if="getMenuItemDetails(rowData.menuItem).length">
              <ul class="list-disc pl-4">
                <li
                  v-for="item in getMenuItemDetails(rowData.menuItem)"
                  :key="item._id"
                  class="flex items-center gap-2"
                >
                  <img v-if="item.imageUrl" :src="item.imageUrl" class="w-6 h-6 rounded" alt="menu item" />
                  <span>{{ item.name }}</span>
                </li>
              </ul>
            </div>
            <div v-else class="text-gray-400">No menu items linked</div>
          </div>

          <!-- Add Menu Item Button -->
          <div class="flex justify-end mb-4">
            <VaButton
              color="primary"
              icon="mso-add"
              @click="
                emits('openSelectionModal', {
                  promotion: rowData,
                  selection: null,
                  isEdit: false
                })
              "
            >
              Add Menu Item
            </VaButton>
          </div>
        </div>
      </template>

      <!-- Actions Column -->
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

    <!-- Add Selection Modal -->
    <AddSelectionModal
      v-if="isAddSelectionModalOpen"
      :promotion-id="promotionData._id"
      :outlet-id="servicesStore.selectedRest"
      :pending-selections="promotionData.menuItem || []"
      :is-edit-selection="isEditSelection"
      :promotion-selection="promotionSelection"
      @cancel="
        isAddSelectionModalOpen = false;
        promotionSelection = '';
        isEditSelection = false;
        emits('getPromotions');
      "
      @submitted="
        isAddSelectionModalOpen = false;
        promotionSelection = '';
        isEditSelection = false;
        emits('getPromotions');
      "
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

.text-blue-600 {
  font-size: 0.85rem;
  line-height: 1.2rem;
  display: block;
}
</style>

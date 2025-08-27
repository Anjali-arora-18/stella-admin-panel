<script setup lang="ts">
import { ref, watch } from 'vue'
import PromotionTable from './widgets/PromotionsTable.vue'
import PromotionsModal from './modals/PromotionsModal.vue'
import AddSelectionModal from './modals/AddSelectionModal.vue'
import { useServiceStore } from '../../stores/services'
import { useToast } from 'vuestic-ui'
import { getPromotionsByOutlet } from './services/promotionService'
import axios from 'axios'

/* ---------- State ---------- */
const isAddSelectionModalOpen = ref(false)
const promotionSelection = ref<{ promotion: any; selection: any; isEdit: boolean } | null>(null)

const isPromotionModalOpen = ref(false)
const selectedPromotion = ref(null)
const items = ref([])
const isLoading = ref(false)
const deliveryZones = ref([])
const isLoadingZones = ref(false)
const promotionData = ref(null)
const isEditSelection = ref(false)

const servicesStore = useServiceStore()
const { init } = useToast()
const selectionModalMode = ref('menuItems')

/* ---------- Handlers for Selection Modal ---------- */
function handleOpenSelectionModal({ promotion, selection = null, isEdit = false }) {
  promotionData.value = promotion
  promotionSelection.value = selection
  isEditSelection.value = isEdit
  if (type === 'options') {
    selectionModalMode.value = 'options'
  } else {
    selectionModalMode.value = 'menuItems'
  }
  isAddSelectionModalOpen.value = true
}

function handleSelectionCancel() {
  isAddSelectionModalOpen.value = false
  promotionSelection.value = null
  getPromotions()
}

function handleSelectionSubmit() {
  isAddSelectionModalOpen.value = false
  promotionSelection.value = null
  getPromotions()
}

/* ---------- Promotion Modal Handlers ---------- */
async function editPromotions(rowData) {
  await fetchDeliveryZones()
  selectedPromotion.value = rowData
  isPromotionModalOpen.value = true
}

function handlePromotionModalCancel() {
  isPromotionModalOpen.value = false
  selectedPromotion.value = null
  getPromotions()
}

async function handleAddPromotionClick() {
  await fetchDeliveryZones()
  selectedPromotion.value = {}
  isPromotionModalOpen.value = true
}

/* ---------- Fetch Delivery Zones ---------- */
const fetchDeliveryZones = async () => {
  isLoadingZones.value = true
  try {
    const url = import.meta.env.VITE_API_BASE_URL
    const res = await axios.get(`${url}/deliveryZones/${servicesStore.selectedRest}`)
    deliveryZones.value = (res.data.data || [])
      .filter((zone) => typeof zone.name === 'string' && typeof zone._id === 'string')
      .map((zone) => ({
        label: zone.name.trim(),
        value: zone._id.trim(),
      }))
  } catch (error) {
    init({ message: 'Failed to fetch delivery zones', color: 'danger' })
  } finally {
    isLoadingZones.value = false
  }
}
function closeSelectionModal() {
  isAddSelectionModalOpen.value = false
  promotionData.value = null
  promotionSelection.value = null
  isEditSelection.value = false
  getPromotions() // refresh table after changes
}

/* ---------- Fetch Promotions ---------- */
const getPromotions = async () => {
  const outletId = servicesStore.selectedRest
  isLoading.value = true

  try {
    // Updated: safeRequest already returns the raw data
    const response = await getPromotionsByOutlet(outletId)

    // Guard in case response is not an array
    const item = Array.isArray(response.data) ? response.data : response

    items.value = item.map((e) => {
      const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const weeklyPromotion = (e.validDays || []).map((n) => dayShort[n])

      const startDate = e.dateRange?.startDate || ''
      const endDate = e.dateRange?.endDate || ''
      const startTime = e.timeRange?.startTime || ''
      const endTime = e.timeRange?.endTime || ''
      const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : ''

      const price = e.discountValue ?? e.fixedPrice ?? ''
      const orderType = (e.orderTypes || []).join(', ')

      return {
        ...e,
        description: e.description || '',
        price,
        imageUrl: e.imageUrl || '',
        startDate,
        endDate,
        weeklyPromotion,
        timeRange,
        orderType,
        selections: e.selections || [],
      }
    })
  } catch (error) {
    init({ message: error.message || 'Failed to load promotions', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

/* ---------- Watchers ---------- */
watch(
  () => servicesStore.selectedRest,
  () => {
    getPromotions()
  },
)
watch(isAddSelectionModalOpen, (val) => {})

if (servicesStore.selectedRest) {
  getPromotions()
}
</script>

<template>
  <div>
    <!-- Table -->
    <VaCard class="mt-4">
      <VaCardContent>
        <PromotionTable
          :items="items"
          :loading="isLoading"
          @editPromotions="editPromotions"
          @getPromotions="getPromotions"
          @openSelectionModal="handleOpenSelectionModal"
          @openPromotionModal="handleAddPromotionClick"
        />

        <!-- Add Selection Modal -->
        <AddSelectionModal
          v-if="isAddSelectionModalOpen"
          :is-visible="isAddSelectionModalOpen"
          :promotion-id="promotionData._id"
          :outlet-id="servicesStore.selectedRest"
          :pending-selections="promotionData.menuItem || []"
          :is-edit-selection="isEditSelection"
          :promotion-selection="promotionSelection"
          :type="selectionModalMode"
          @cancel="closeSelectionModal"
          @promotionUpdated="closeSelectionModal"
        />
      </VaCardContent>
    </VaCard>

    <!-- Promotion Modal -->
    <PromotionsModal
      :is-visible="isPromotionModalOpen"
      :delivery-zones="deliveryZones"
      :is-edit="!!(selectedPromotion && selectedPromotion._id)"
      :is-loading-zones="isLoadingZones"
      :promotion="selectedPromotion"
      @update:isVisible="isPromotionModalOpen = $event"
      @submitted="handlePromotionModalCancel"
      @openSelectionModal="handleOpenSelectionModal"
    />
  </div>
</template>

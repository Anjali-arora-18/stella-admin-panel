<template>
  <div>
    <VaModal
      :model-value="isVisible"
      class="promotion-modal big-xl-modal !p-0"
      :mobile-fullscreen="false"
      size="large"
      hide-default-actions
      close-button
      @update:modelValue="$emit('update:isVisible', $event)"
    >
      <!-- HEADER -->
      <template #header>
        <div class="py-4 px-6 border-b font-bold text-xl gradient-header">
          {{ isUpdating ? 'Edit Promotion' : 'Add New Promotion' }}
        </div>
      </template>

      <!-- FORM -->
      <VaForm ref="form" @submit.prevent="submit">
        <div class="p-6 space-y-6">
          <!-- BASIC INFO -->
          <section>
            <h2 class="text-md font-semibold mb-2">Basic Information</h2>
            <div class="grid md:grid-cols-3 gap-4">
              <VaInput
                v-model="formData.name"
                label="Promotion Name"
                required-mark
                :rules="[validators.required]"
                placeholder="Enter promotion name"
              />
              <VaSelect
                v-model="formData.promotionType"
                :options="promotionTypes"
                label="Promotion Type"
                required-mark
                :rules="[validators.required]"
                placeholder="Select promotion type"
              />
              <VaSelect
                v-model="formData.usageType"
                :options="usageTypes"
                label="Usage Type"
                required-mark
                :rules="[validators.required]"
                placeholder="Single/Unlimited"
              />
            </div>
          </section>

          <!-- Value Discount -->
          <section v-if="formData.promotionType === 'Value Discount'">
            <h2 class="text-md font-semibold mb-2">Value Discount Configuration</h2>
            <div class="grid md:grid-cols-2 gap-4">
              <VaInput
                v-model="formData.discountValue"
                label="Discount Value"
                type="number"
                min="0"
                step="0.01"
                required-mark
                :rules="[validators.required]"
                placeholder="e.g. 2.50"
              />
              <VaSelect
                v-model="formData.affect"
                :options="affectOptions"
                label="Affect"
                required-mark
                placeholder="Where to apply"
              />
            </div>
            <div v-if="formData.affect === 'Selected Items'" class="flex gap-2 mt-2">
              <VaButton @click="openArticlesModal">Articles</VaButton>
              <VaButton @click="openOptionsModal">Options</VaButton>
            </div>
          </section>

          <!-- Percentage Discount -->
          <section v-if="formData.promotionType === 'Percentage Discount'">
            <h2 class="text-md font-semibold mb-2">Percentage Discount Configuration</h2>
            <div class="grid md:grid-cols-2 gap-4">
              <VaInput
                v-model="formData.discountPercent"
                label="Discount %"
                type="number"
                min="1"
                max="100"
                required-mark
                :rules="[validators.required]"
                placeholder="e.g. 10"
              />
              <VaSelect
                v-model="formData.affect"
                :options="affectOptions"
                label="Affect"
                required-mark
                placeholder="Where to apply"
              />
            </div>
            <div v-if="formData.affect === 'Selected Items'" class="flex gap-2 mt-2">
              <VaButton @click="openArticlesModal">Articles</VaButton>
              <VaButton @click="openOptionsModal">Options</VaButton>
            </div>
          </section>

          <!-- Fixed Price -->
          <section v-if="formData.promotionType === 'Fixed Price'">
            <h2 class="text-md font-semibold mb-2">Fixed Price Configuration</h2>

            <div class="grid md:grid-cols-2 gap-4 items-end">
              <!-- Price Input -->
              <VaInput
                v-model="formData.fixedPrice"
                label="Price"
                type="number"
                min="0"
                step="0.01"
                required-mark
                :rules="[validators.required]"
                placeholder="e.g. 2.50"
              />

              <!-- Buttons aligned properly -->
              <div class="flex gap-2">
                <VaButton @click="openArticlesModal">Articles</VaButton>
                <VaButton @click="openOptionsModal">Options</VaButton>
              </div>
            </div>
          </section>

          <!-- Free Delivery -->
          <section v-if="formData.promotionType === 'Free Delivery'">
            <h2 class="text-md font-semibold mb-2">Free Delivery Configuration</h2>
            <VaAlert color="primary">Order Type will be automatically set to Delivery.</VaAlert>
          </section>

          <!-- Take X Pay Y -->
          <section v-if="formData.promotionType === 'Take X pay Y'">
            <h2 class="text-md font-semibold mb-2">Take X pay Y Configuration</h2>
            <div class="grid md:grid-cols-3 gap-4">
              <VaInput
                v-model="formData.take"
                label="Take"
                type="number"
                min="1"
                required-mark
                :rules="[validators.required]"
              />
              <VaInput
                v-model="formData.pay"
                label="Pay"
                type="number"
                min="1"
                required-mark
                :rules="[validators.required]"
              />
              <div class="flex gap-2 mt-2">
                <VaButton @click="openArticlesModal">Articles</VaButton>
                <VaButton @click="openOptionsModal">Options</VaButton>
              </div>
            </div>
          </section>

          <!-- Code Generation -->
          <section>
            <h2 class="text-md font-semibold mb-2">Code Generation</h2>
            <VaOptionList
              v-model="formData.codeType"
              :options="[
                { label: 'Single', value: 'single' },
                { label: 'Multi', value: 'multi' },
                { label: 'Auto', value: 'auto' },
              ]"
              type="radio"
              text-by="label"
              value-by="value"
            />
            <div v-if="formData.codeType === 'single'" class="grid md:grid-cols-2 gap-4 mt-4">
              <VaInput
                v-model="formData.manualCode"
                label="Code"
                placeholder="Enter promotion code"
                required-mark
                :rules="[validators.required]"
              />
            </div>
            <div v-if="formData.codeType === 'multi'" class="grid md:grid-cols-2 gap-4 mt-4">
              <VaInput
                v-model="formData.quantity"
                label="Quantity"
                type="number"
                min="1"
                max="50000"
                required-mark
                placeholder="Number of codes to generate"
              />
              <VaInput v-model="formData.prefix" label="Code Prefix (Optional)" placeholder="e.g. LUNCH" />
            </div>
            <!-- <div class="grid md:grid-cols-3 gap-4">
              <VaCheckbox v-model="formData.automatic" label="Automatic Promotion" />
              <VaInput
                v-model="formData.quantity"
                label="Quantity"
                type="number"
                min="1"
                max="50000"
                :disabled="formData.automatic"
                :required-mark="!formData.automatic"
                placeholder="Number of codes to generate"
              />
              <VaInput v-model="formData.prefix" label="Code Prefix (Optional)" placeholder="e.g. LUNCH" />
            </div> -->
          </section>

          <!-- Validity & Availability -->
          <section>
            <h2 class="text-md font-semibold mb-2">Validity & Availability</h2>
            <div class="grid md:grid-cols-4 gap-3 mb-3">
              <VaInput v-model="formData.startDate" label="Start Date" type="date" required-mark />
              <VaInput v-model="formData.endDate" label="End Date" type="date" required-mark />
              <VaInput v-model="formData.startTime" label="Time From" type="time" required-mark />
              <VaInput v-model="formData.endTime" label="Time To" type="time" required-mark />
            </div>
            <div class="grid md:grid-cols-2 gap-2">
              <VaSelect
                v-model="formData.days"
                label="Available Days"
                placeholder="Select days"
                multiple
                required-mark
                :options="daysOfWeek"
              />
            </div>
          </section>

          <!-- Other Configuration -->
          <section>
            <h2 class="text-md font-semibold mb-2">Other Configuration</h2>
            <div class="grid md:grid-cols-3 gap-4">
              <VaSelect
                v-model="formData.orderType"
                :options="orderTypes"
                label="Order Type"
                required-mark
                multiple
                placeholder="Delivery, Takeaway, Dine-in"
                :disabled="formData.promotionType === 'Free Delivery'"
              />
              <VaSelect
                v-model="formData.deliveryZones"
                :options="safeDeliveryZones"
                text-by="label"
                value-by="value"
                label="Delivery Zones"
                required-mark
                multiple
                :loading="!safeDeliveryZones.length"
                placeholder="Select Delivery Zones"
                :max-visible-options="5"
              />
              <VaInput v-model="formData.minimumOrder" label="Minimum Order (€)" type="number" min="0" step="0.01" />
            </div>
            <div class="flex items-center gap-6 mt-2">
              <VaCheckbox v-model="formData.availableAtCC" label="Available at CC" />
              <VaCheckbox v-model="formData.affectOffers" label="Affect Offers" />
            </div>
          </section>
        </div>
      </VaForm>

      <!-- FOOTER -->
      <template #footer>
        <div class="flex justify-end gap-2 p-4 border-t">
          <VaButton color="secondary" @click="onCancel">Cancel</VaButton>
          <VaButton color="primary" @click="submit">
            {{ isUpdating ? 'Update' : 'Add' }}
          </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- MENU ITEMS MODAL (Articles) -->
    <AddSelectionModal
      v-if="isMenuItemsModalOpen"
      :is-visible="isMenuItemsModalOpen"
      :promotion-id="formData._id"
      :outlet-id="servicesStore.selectedRest"
      :pending-selections="promotionsArticles"
      :type="'menuItems'"
      @cancel="isMenuItemsModalOpen = false"
      @promotionUpdated="emits('getPromotions')"
      @savePendingSelections="handleMenuItemsUpdated"
    />

    <!-- OPTIONS MODAL -->
    <AddSelectionModal
      v-if="isOptionsModalOpen"
      :is-visible="isOptionsModalOpen"
      :promotion-id="formData._id"
      :outlet-id="servicesStore.selectedRest"
      :pending-selections="promotionOptions"
      :type="'options'"
      @cancel="isOptionsModalOpen = false"
      @savePendingSelections="handleMenuItemsOptionsUpdated"
      @promotionUpdated="emits('getPromotions')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import { createPromotion, updatePromotion, getPromotionById, getMenuItemsByOutlet } from '../services/promotionService'
import AddSelectionModal from './AddSelectionModal.vue'

const emits = defineEmits(['update:isVisible', 'submitted', 'open-selection-modal'])

const props = defineProps({
  isVisible: Boolean,
  promotion: {
    type: Object,
    default: () => ({}),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  deliveryZones: {
    type: Array,
    default: () => [],
  },
  isLoadingZones: Boolean,
  pendingSelections: {
    type: Object,
    required: true,
  },
})

const servicesStore = useServiceStore()
const { validate } = useForm('form')
const { init } = useToast()
const isLoadingZones = computed(() => props.deliveryZones.length === 0)
const articles = ref([])
const isArticlesLoading = ref(false)
const articlesSearchQuery = ref('')
const showArticlesSection = ref(false)
const isOptionsModalOpen = ref(false)

const promotionOptions = ref([])

const promotionsArticles = ref([])

// Toggle Articles Section
const fetchArticles = async () => {
  isArticlesLoading.value = true
  try {
    console.log('[fetchArticles] Fetching for outlet:', servicesStore.selectedRest)

    const res = await getMenuItemsByOutlet(servicesStore.selectedRest)

    // Log full API response
    console.log('[fetchArticles] API raw response:', res)

    // Handle different response shapes
    const items = res.data?.data || res.data || []

    console.log('[fetchArticles] Items before mapping:', items)

    // Map to article structure
    articles.value = items.map((item) => ({
      _id: item._id,
      code: item.code || '',
      name: item.name || '',
      selected: false,
    }))

    console.log('[fetchArticles] Mapped articles:', articles.value)
  } catch (e) {
    console.error('[fetchArticles] Failed to load menu items', e)
  } finally {
    isArticlesLoading.value = false
  }
}

const promotionTypeMap = {
  'Value Discount': 'VALUE_DISCOUNT',
  'Percentage Discount': 'PERCENTAGE_DISCOUNT',
  'Fixed Price': 'FIXED_PRICE',
  'Free Delivery': 'FREE_DELIVERY',
  'Take X pay Y': 'TAKE_X_PAY_Y',
}

const affectMap = {
  'Entire Order': 'ENTIRE_ORDER',
  'Selected Items': 'SELECTED_ITEMS',
}

const orderTypeMap = {
  Delivery: 'DELIVERY',
  Takeaway: 'TAKEAWAY',
  'Dine-in': 'DINE_IN',
}

const usageTypeMap = {
  'Single Use': 'SINGLE_USE',
  Unlimited: 'UNLIMITED',
}

const dayToNum = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const reversePromotionTypeMap = Object.fromEntries(Object.entries(promotionTypeMap).map(([label, key]) => [key, label]))

const reverseAffectMap = Object.fromEntries(Object.entries(affectMap).map(([label, key]) => [key, label]))

const reverseOrderTypeMap = Object.fromEntries(Object.entries(orderTypeMap).map(([label, key]) => [key, label]))

const reverseUsageTypeMap = Object.fromEntries(Object.entries(usageTypeMap).map(([label, key]) => [key, label]))

const formData = ref({
  _id: '',
  name: '',
  promotionType: '',
  usageType: '',
  discountValue: null,
  discountPercent: null,
  fixedPrice: null,
  affect: '',
  // automatic: false,
  codeType: 'multi', // 'single' | 'multi' | 'auto'
  manualCode: '', // For Single Code input
  quantity: 1,
  prefix: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  days: [],
  orderType: [],
  deliveryZones: [],
  availableAtCC: false,
  affectOffers: false,
  minimumOrder: null,
  take: null,
  pay: null,
  assetId: '',
  isActive: true,
})

const resetForm = () => {
  formData.value = {
    _id: '',
    name: '',
    promotionType: '',
    usageType: '',
    discountValue: null,
    discountPercent: null,
    fixedPrice: null,
    affect: '',
    // automatic: false,
    codeType: 'multi', // 'single' | 'multi' | 'auto'
    manualCode: '', // For Single Code input
    quantity: 1,
    prefix: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    days: [],
    orderType: [],
    deliveryZones: [],
    availableAtCC: false,
    affectOffers: false,
    minimumOrder: null,
    take: null,
    pay: null,
    assetId: '',
    isActive: true,
  }
}
const numToDay = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

const promotionTypes = ['Value Discount', 'Percentage Discount', 'Fixed Price', 'Free Delivery', 'Take X pay Y']

const usageTypes = ['Single Use', 'Unlimited']
const affectOptions = ['Entire Order', 'Selected Items']
// const daysOfWeek = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const orderTypes = ['Delivery', 'Takeaway', 'Dine-in']

const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const daysOfWeek = ['All Days', ...allDays]

let isAutoSelecting = false

watch(
  () => formData.value.days,
  (newVal) => {
    if (isAutoSelecting) return

    if (newVal.includes('All Days')) {
      isAutoSelecting = true
      formData.value.days = [...allDays]
      nextTick(() => (isAutoSelecting = false))
    } else {
      const isPartial = allDays.some((day) => !newVal.includes(day))

      if (!isPartial && newVal.length === allDays.length + 1) {
        formData.value.days = newVal.filter((d) => d !== 'All Days')
      }
    }
  },
  { deep: true },
)

watch(
  () => formData.value.promotionType,
  (newVal) => {
    if (newVal === 'Free Delivery') {
      formData.value.orderType = ['Delivery']
    }
  },
)

function populateFormData(promotion) {
  // Parse timeRange "HH:MM - HH:MM"
  let startTime = ''
  let endTime = ''
  if (promotion.timeRange && typeof promotion.timeRange === 'string') {
    const [start, end] = promotion.timeRange.split('-').map((t) => t.trim())
    startTime = start || ''
    endTime = end || ''
  }

  formData.value = {
    _id: promotion._id || '',
    name: promotion.name || '',
    promotionType: reversePromotionTypeMap[promotion.promotionType] || '',
    usageType: reverseUsageTypeMap[promotion.usage] || '',
    discountValue: promotion.discountValue ?? null,
    discountPercent: promotion.discountPercentage ?? promotion.discountPercent ?? null, // FIX HERE
    fixedPrice: promotion.fixedPrice ?? null,
    affect: reverseAffectMap[promotion.affect] || '',
    // automatic: !!promotion.automatic,
    codeType: promotion.automatic ? 'auto' : promotion.quantity > 1 ? 'multi' : 'single',
    manualCode: promotion.manualCode || '', // if supported
    quantity: promotion.quantity ?? 1,
    prefix: promotion.prefix || '',
    startDate: toInputDate(promotion.dateRange?.startDate),
    endDate: toInputDate(promotion.dateRange?.endDate),
    startTime,
    endTime,
    days: Array.isArray(promotion.validDays) ? promotion.validDays.map((num) => numToDay[num]) : [],
    orderType: Array.isArray(promotion.orderTypes) ? promotion.orderTypes.map((type) => reverseOrderTypeMap[type]) : [],
    deliveryZones: (Array.isArray(promotion.deliveryZoneId) ? promotion.deliveryZoneId : [])
      .map((id) => props.deliveryZones.find((z) => z.value === id))
      .filter(Boolean),
    availableAtCC: !!promotion.availableAtCC,
    affectOffers: !!promotion.availableWithOffers,
    minimumOrder: promotion.minimumOrder ?? null,
    take: promotion.takeQuantity ?? promotion.take ?? null, // handle TAKE_X_PAY_Y
    pay: promotion.payQuantity ?? promotion.pay ?? null,
    assetId: promotion.assetId || '',
    isActive: promotion.isActive ?? true,
  }
}

watch(
  () => props.isVisible,
  (val) => {
    if (!val) {
      resetForm()
    }
  },
)
watch(
  () => props.isVisible,
  async (visible) => {
    console.log('[watch:isVisible] Changed to:', visible)
    console.log('[watch:isVisible] Current props:', {
      isEdit: props.isEdit,
      promotion: props.promotion,
    })

    if (visible && props.isEdit && props.promotion) {
      console.log('[watch:isVisible] Populating formData from props.promotion:', props.promotion)
      populateFormData(props.promotion) // new function to map directly
    }

    if (!visible) {
      console.log('[watch:isVisible] Modal closed, resetting form.')
      resetForm()
    }
  },
)

watch(
  () => props.promotion,
  (newVal) => {
    console.log('[watch:promotion] Prop changed to:', newVal)
  },
)

function onCancel() {
  console.log('[Modal] Cancel clicked')
  emits('update:isVisible', false)
}

const isMenuItemsModalOpen = ref(false)

const openMenuItemsModal = () => {
  isMenuItemsModalOpen.value = true
}

const handleMenuItemsUpdated = (value) => {
  promotionsArticles.value = value
}

const handleMenuItemsOptionsUpdated = (value) => {
  promotionOptions.value = value
}

const safeDeliveryZones = computed(() => {
  const raw = props.deliveryZones || []
  const mapped = raw.map((z: any) => ({
    label: z?.label ?? '',
    value: z?.value ?? '',
  }))
  mapped.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  return [{ label: 'All Zones', value: 'ALL' }, ...mapped]
})

let isAutoSelectingZones = false

watch(
  () => formData.value.deliveryZones,
  (newVal) => {
    if (isAutoSelectingZones) return

    const allZones = safeDeliveryZones.value.filter((z) => z.value !== 'ALL')
    const allZoneValues = allZones.map((z) => z.value)

    const isAllSelected = newVal.some((zone) => zone === 'ALL')

    if (isAllSelected) {
      isAutoSelectingZones = true
      formData.value.deliveryZones = allZoneValues
      nextTick(() => {
        isAutoSelectingZones = false
      })
    } else if (newVal.length === allZoneValues.length) {
      // Prevent having ALL + all values selected at once
      formData.value.deliveryZones = newVal.filter((val) => val !== 'ALL')
    }
  },
  { deep: true },
)

const isUpdating = computed(() => !!(props.promotion && Object.keys(props.promotion).length))
const getDeliveryZones = async () => {
  try {
    const url = import.meta.env.VITE_API_BASE_URL
    const res = await axios.get(`${url}/deliveryZones`, {
      params: {
        outletId: servicesStore.selectedRest,
      },
    })

    return (
      res.data?.data.map((zone: any) => ({
        label: zone.name,
        value: zone._id,
      })) || []
    )
  } catch (e) {
    console.error('[getDeliveryZones] Failed to fetch zones', e)
    return []
  }
}

const loadPromotionData = async (id: string) => {
  console.log('[loadPromotionData] Called with ID:', id)

  try {
    // Ensure delivery zones are loaded
    if (props.deliveryZones.length === 0) {
      await getDeliveryZones()
    }

    const response = await getPromotionById(id)
    console.log('[loadPromotionData] Raw API response:', response.data)

    // Extract the promotion object
    const promotion = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data

    if (!promotion) {
      console.warn('[loadPromotionData] No promotion found for ID:', id)
      return
    }

    // Map API data to formData
    formData.value = {
      _id: promotion._id || '',
      name: promotion.name || '',
      promotionType: reversePromotionTypeMap[promotion.promotionType] || '',
      usageType: reverseUsageTypeMap[promotion.usage] || '',
      discountValue: promotion.discountValue ?? null,
      discountPercent: promotion.discountPercent ?? null,
      fixedPrice: promotion.fixedPrice ?? null,
      affect: reverseAffectMap[promotion.affect] || '',
      // automatic: !!promotion.automatic,
      quantity: promotion.quantity ?? 1,
      prefix: promotion.prefix || '',
      startDate: toInputDate(promotion.dateRange?.startDate),
      endDate: toInputDate(promotion.dateRange?.endDate),
      startTime: promotion.timeRange?.startTime || '',
      endTime: promotion.timeRange?.endTime || '',
      days: Array.isArray(promotion.validDays) ? promotion.validDays.map((num) => numToDay[num]) : [],
      orderType: Array.isArray(promotion.orderTypes)
        ? promotion.orderTypes.map((type) => reverseOrderTypeMap[type])
        : [],
      deliveryZones: (Array.isArray(promotion.deliveryZoneId) ? promotion.deliveryZoneId : [])
        .map((id) => props.deliveryZones.find((z) => z.value === id))
        .filter(Boolean),
      availableAtCC: !!promotion.availableAtCC,
      affectOffers: !!promotion.availableWithOffers,
      minimumOrder: promotion.minimumOrder ?? null,
      take: promotion.take ?? null,
      pay: promotion.pay ?? null,
      assetId: promotion.assetId || '',
      isActive: promotion.isActive ?? true,
    }

    console.log('[loadPromotionData] Populated formData:', JSON.parse(JSON.stringify(formData.value)))
  } catch (error) {
    init({ message: error.response?.data?.message || 'Failed to load promotion', color: 'danger' })
  }
}

const toInputDate = (val: string) => {
  if (!val) return ''
  const d = new Date(val)
  return isNaN(d.getTime()) ? val : d.toISOString().slice(0, 10)
}
const submit = async () => {
  console.log('[SUBMIT] Triggered')

  if (!validate()) {
    console.warn('[SUBMIT] Validation failed')
    return
  }

  console.log('[SUBMIT] Validation passed')

  const raw = { ...formData.value }
  console.log('[SUBMIT] Raw formData:', raw)
  const data: any = {
    name: raw.name,
    isActive: raw.isActive,
    discountValue: raw.discountValue,
    discountPercent: raw.discountPercent,
    fixedPrice: raw.fixedPrice,
    // automatic: raw.automatic,
    automatic: raw.codeType === 'auto',
    quantity: raw.quantity,
    prefix: raw.prefix,
    availableAtCC: raw.availableAtCC,
    availableWithOffers: raw.affectOffers, // FIXED key name
    minimumOrder: raw.minimumOrder,
    take: raw.take,
    pay: raw.pay,
    promotionType: promotionTypeMap[raw.promotionType],
    affect: affectMap[raw.affect],
    usage: usageTypeMap[raw.usageType],
    orderTypes: (raw.orderType || []).map((t) => orderTypeMap[t]),
    dateRange: {
      startDate: raw.startDate ? new Date(raw.startDate + 'T00:00:00Z').toISOString() : null,
      endDate: raw.endDate ? new Date(raw.endDate + 'T00:00:00Z').toISOString() : null,
    },
    timeRange: {
      startTime: raw.startTime,
      endTime: raw.endTime,
    },
    validDays: raw.days.includes('All Days') ? [0, 1, 2, 3, 4, 5, 6] : (raw.days || []).map((d) => dayToNum[d]),
    deliveryZoneId: (raw.deliveryZones || [])
      .map((z) => (typeof z === 'object' ? z.value : z))
      .filter((id) => id && id !== 'string'), // clean placeholder
    createdBy: servicesStore.currentUser?._id || '65edc27fa8c3e330d7db0a23',
    outletId: servicesStore.selectedRest,
    menuItem: articles.value
      .filter((a) => a.selected)
      .map((a) => a._id)
      .filter((id) => id && id !== 'string'), // clean
    option: [], // Will be managed by AddSelectionModal, default to []
  }

  if (raw.codeType === 'single') {
    data.manualCode = raw.manualCode
  } else if (raw.codeType === 'multi') {
    data.quantity = raw.quantity
    data.prefix = raw.prefix
  }

  if (raw.assetId) data.assetId = raw.assetId
  if (props.isEdit && raw._id?.trim()) {
    data._id = raw._id
    console.log('[SUBMIT] Edit mode detected, updating promotion with ID:', raw._id)
  } else {
    delete data._id
    console.log('[SUBMIT] Create mode detected')
  }

  console.log('[SUBMIT] Final payload ready to send:', data)

  // Collect selected menu items
  const selectedMenuItems = articles.value.filter((a) => a.selected).map((a) => a._id)

  console.log('[SUBMIT] Selected Menu Items:', selectedMenuItems)

  data.menuItem = selectedMenuItems

  try {
    if (data._id) {
      delete data.menuItem
      delete data.option
      console.log('[SUBMIT] Calling updatePromotion...')
      await updatePromotion(data._id, data)
      init({ message: 'Promotion updated successfully!', color: 'success' })
      console.log('[SUBMIT] Update successful')
      emits('submitted')
    } else {
      data.option = promotionsArticles.value
      data.menuItem = promotionOptions.value
      console.log('[SUBMIT] Calling createPromotion...')
      const created = await createPromotion(data) // returns promotion object directly
      init({ message: 'Promotion created successfully!', color: 'success' })
      console.log('[SUBMIT] Creation successful, new ID:', created._id)
      emits('submitted')
      // Apply pending selections if any
      // if (props.pendingSelections.value.length) {
      //   console.log('[SUBMIT] Pending selections found:', props.pendingSelections.value)
      //   try {
      //     await updatePromotion(created._id, {
      //       menuItem: props.pendingSelections.value,
      //     })
      //     init({ message: 'Pending selections applied!', color: 'success' })
      //     props.pendingSelections.value = []
      //     emits('cancel')
      //     console.log('[SUBMIT] Pending selections applied successfully')
      //   } catch (err) {
      //     console.error('[SUBMIT] Failed to apply pending selections:', err)
      //     init({ message: err.message || 'Failed to apply pending selections', color: 'danger' })
      //   }
      // }
    }
  } catch (err) {
    console.error('[SUBMIT] Error during API call:', err)
    init({
      message: err.message || 'Error occurred while saving promotion',
      color: 'danger',
    })
  }
}

const selectedRest = toRef(servicesStore.selectedRest)

function openArticlesModal() {
  isMenuItemsModalOpen.value = true
}

function openOptionsModal() {
  isOptionsModalOpen.value = true
}
</script>

<style scoped>
.gradient-header {
  background: linear-gradient(90deg, #6a8dfa, #b76fdc 60%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.promotion-modal {
  border-radius: 16px;
}
</style>

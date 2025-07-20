<template>
  <VaModal
    v-model="isVisible"
    class="promotion-modal"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <template #header>
      <div class="py-4 px-6 border-b font-bold text-xl gradient-header">Add New Promotion</div>
    </template>
    <VaForm ref="form" @submit.prevent="submit">
      <div class="p-6 space-y-6">

        <!-- Basic Information -->
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

        <!-- Discount/Config (conditional fields) -->
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
          <div class="flex gap-2 mt-2" v-if="formData.affect === 'Selected Items'">
            <VaButton @click="openArticlesModal">Articles</VaButton>
            <VaButton @click="openOptionsModal">Options</VaButton>
          </div>
        </section>

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
          <div class="flex gap-2 mt-2" v-if="formData.affect === 'Selected Items'">
            <VaButton @click="openArticlesModal">Articles</VaButton>
            <VaButton @click="openOptionsModal">Options</VaButton>
          </div>
        </section>

        <section v-if="formData.promotionType === 'Fixed Price'">
          <h2 class="text-md font-semibold mb-2">Fixed Price Configuration</h2>
          <div class="grid md:grid-cols-2 gap-4">
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
            <div class="flex gap-2 mt-2">
              <VaButton @click="openArticlesModal">Articles</VaButton>
              <VaButton @click="openOptionsModal">Options</VaButton>
            </div>
          </div>
        </section>

        <section v-if="formData.promotionType === 'Free Delivery'">
          <h2 class="text-md font-semibold mb-2">Free Delivery Configuration</h2>
          <VaAlert color="primary">Order Type will be automatically set to Delivery.</VaAlert>
        </section>

        <section v-if="formData.promotionType === 'Take X pay Y'">
          <h2 class="text-md font-semibold mb-2">Take X pay Y Configuration</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <VaInput v-model="formData.take" label="Take" type="number" min="1" required-mark :rules="[validators.required]" />
            <VaInput v-model="formData.pay" label="Pay" type="number" min="1" required-mark :rules="[validators.required]" />
            <div class="flex gap-2 mt-2">
              <VaButton @click="openArticlesModal">Articles</VaButton>
              <VaButton @click="openOptionsModal">Options</VaButton>
            </div>
          </div>
        </section>

        <!-- Code Generation -->
        <section>
          <h2 class="text-md font-semibold mb-2">Code Generation</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <VaCheckbox v-model="formData.automatic" label="Automatic Promotion" />
            <VaInput
              v-model="formData.quantity"
              label="Quantity"
              type="number"
              min="1"
              max="50000"
              :disabled="formData.automatic"
              required-mark="!formData.automatic"
              placeholder="Number of codes to generate"
            />
            <VaInput
              v-model="formData.prefix"
              label="Code Prefix (Optional)"
              placeholder="e.g. LUNCH"
            />
          </div>
        </section>

        <!-- Validity & Availability -->
        <section>
          <h2 class="text-md font-semibold mb-2">Validity & Availability</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <VaInput v-model="formData.startDate" label="Start Date" type="date" required-mark :rules="[validators.required]" />
            <VaInput v-model="formData.endDate" label="End Date" type="date" required-mark :rules="[validators.required]" />
            <VaInput v-model="formData.startTime" label="Time From" type="time" required-mark />
            <VaInput v-model="formData.endTime" label="Time To" type="time" required-mark />
            <VaSelect
              v-model="formData.days"
              :options="daysOfWeek"
              label="Available Days"
              required-mark
              multiple
              placeholder="Select days"
            />
          </div>
        </section>

        <!-- Other config -->
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
              :options="deliveryZones"
              label="Delivery Zones"
              required-mark
              multiple
              placeholder="Select Delivery Zones"
            />
            <VaInput v-model="formData.minimumOrder" label="Minimum Order (€)" type="number" min="0" step="0.01" />
          </div>
          <div class="flex items-center gap-6 mt-2">
            <VaCheckbox v-model="formData.availableAtCC" label="Available at CC" />
            <VaCheckbox v-model="formData.affectOffers" label="Affect Offers" />
          </div>
        </section>

        <!-- Image Upload -->
        <section>
          <h2 class="text-md font-semibold mb-2">Image</h2>
          <FileUpload
            :selected-rest="selectedRest"
            @uploadSuccess="(data) => ((formData.imageUrl = data.url), (formData.assetId = data._id))"
          />
          <div class="flex items-start gap-4 mt-2">
            <img
              v-if="formData.imageUrl"
              :src="formData.imageUrl"
              alt="Image"
              class="w-32 h-32 rounded-lg object-cover border"
            />
            <VaButton
              v-if="formData.assetId"
              preset="primary"
              color="danger"
              icon="mso-delete"
              size="small"
              class="mt-2"
              @click="deleteAsset"
            />
          </div>
        </section>

      </div>
    </VaForm>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 border-t">
        <VaButton @click="onCancel" color="secondary">Cancel</VaButton>
        <VaButton @click="submit" color="primary">{{ isUpdating ? 'Update' : 'Add' }}</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef } from 'vue'
import axios from 'axios'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import FileUpload from '@/components/file-uploader/FileUpload.vue'

const emits = defineEmits(['cancel'])

const props = defineProps({
  selectedOption: {
    type: Object,
    default: () => null,
  },
})

const isVisible = ref(true)
watch(isVisible, (val) => {
  if (!val) emits('cancel')
})

const servicesStore = useServiceStore()
const { validate } = useForm('form')
const { init } = useToast()

const formData = ref({
  _id: '',
  name: '',
  promotionType: '',
  usageType: '',
  discountValue: null,
  discountPercent: null,
  fixedPrice: null,
  affect: '',
  automatic: false,
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
  imageUrl: '',
  assetId: '',
  isActive: true,
})

const isUpdating = computed(() => props.selectedOption && Object.keys(props.selectedOption).length)

const promotionTypes = [
  'Value Discount',
  'Percentage Discount',
  'Fixed Price',
  'Free Delivery',
  'Take X pay Y',
]
const usageTypes = ['Single Use', 'Unlimited']
const affectOptions = ['Entire Order', 'Selected Items']
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All Days'
]
const orderTypes = ['Delivery', 'Takeaway', 'Dine-in']
const deliveryZones = [] // Load from your store or API

function openArticlesModal() {}
function openOptionsModal() {}
function onCancel() {
  isVisible.value = false
  emits('cancel')
}

// Load promotion for edit
watch(
  () => props.selectedOption,
  async (val) => {
    if (!val) return
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotions/${val._id}`)
      const data = response.data.data

      formData.value = {
        _id: data._id || '',
        name: data.name || '',
        promotionType: data.promotionType || '',
        usageType: data.usageType || '',
        discountValue: data.discountValue ?? null,
        discountPercent: data.discountPercent ?? null,
        fixedPrice: data.fixedPrice ?? null,
        affect: data.affect || '',
        automatic: !!data.automatic,
        quantity: data.quantity ?? 1,
        prefix: data.prefix || '',
        startDate: data.startDate ? data.startDate.slice(0,10) : '',
        endDate: data.endDate ? data.endDate.slice(0,10) : '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        days: data.days || [],
        orderType: Array.isArray(data.orderType) ? data.orderType : [],
        deliveryZones: Array.isArray(data.deliveryZones) ? data.deliveryZones : [],
        availableAtCC: !!data.availableAtCC,
        affectOffers: !!data.affectOffers,
        minimumOrder: data.minimumOrder ?? null,
        take: data.take ?? null,
        pay: data.pay ?? null,
        imageUrl: data.imageUrl || '',
        assetId: data.assetId || '',
        isActive: data.isActive ?? true,
      }
    } catch (error) {
      init({ message: error.response?.data?.message || 'Failed to load promotion', color: 'danger' })
    }
  },
  { immediate: true }
)

const submit = async () => {
  if (validate()) {
    // Build payload from only the needed fields (could add further filtering/cleanup if you want)
    const data = { ...formData.value }

    // Optional: remove blank fields, etc. (backend should also handle)
    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    if (!data.assetId) delete data.assetId

    // Dates to ISO for backend
    if (data.startDate) data.startDate = new Date(data.startDate + 'T00:00:00Z').toISOString()
    if (data.endDate) data.endDate = new Date(data.endDate + 'T00:00:00Z').toISOString()

    // Attach outlet if required
    data.outletId = servicesStore.selectedRest

    const url = import.meta.env.VITE_API_BASE_URL

    try {
      if (data._id) {
        await axios.put(`${url}/promotions/${data._id}`, data)
        init({ message: 'Promotion updated successfully!', color: 'success' })
      } else {
        delete data._id
        await axios.post(`${url}/promotions`, data)
        init({ message: 'Promotion created successfully!', color: 'success' })
      }
      emits('cancel')
    } catch (err) {
      init({ message: err?.response?.data?.message || 'Error occurred', color: 'danger' })
    }
  }
}

const selectedRest = toRef(servicesStore.selectedRest)

const deleteAsset = () => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  axios
    .delete(`${url}/assets/${formData.value.assetId}`)
    .then(() => {
      formData.value.imageUrl = ''
      formData.value.assetId = ''
      init({ message: 'Asset deleted successfully', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
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

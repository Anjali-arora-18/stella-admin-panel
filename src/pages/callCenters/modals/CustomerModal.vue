<template>
  <VaModal
    v-model="showCustomerModal"
    class="big-modal"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <div class="bg-[#f8f9fa] px-4 py-6 flex justify-between items-center mb-4">
      <h1 class="va-h6 my-0 text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Customer</h1>
    </div>

    <div class="bg-white p-4 pb-0">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Customer Info -->
          <div>
            <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Customer Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Mobile Number *</label>
                <VaInput v-model="phoneNumber" placeholder="Enter mobile number" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Customer Name *</label>
                <VaInput v-model="name" placeholder="Enter full name" class="mt-1" />
              </div>
            </div>

            <div class="flex flex-col gap-1 mt-4">
              <label class="text-sm font-medium text-gray-500">Customer Notes</label>
              <VaTextarea disabled placeholder="Special instructions, allergies, preferences..." rows="3" />
            </div>

            <div class="mt-4">
              <label class="text-sm font-medium text-gray-500">Saved Addresses (Not Implmented yet)</label>
              <div class="flex items-center justify-between mt-1 px-4 py-2 bg-[#f8f9fa] rounded border text-gray-500">
                <span>123 Main St, Apt 4B, Limassol 3036</span>
                <VaButton preset="secondary" size="small" class="bg-green-800 hover:bg-green-900 text-white">
                  Edit
                </VaButton>
              </div>
            </div>
          </div>

          <!-- Address Info -->
          <div>
            <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Address Information</h3>

            <p class="mb-2 text-sm font-medium text-gray-500">Search Postcode or Street Name</p>
            <div class="relative">
              <div class="flex flex-col sm:flex-row gap-4 mb-4">
                <VaInput v-model="searchAdd.postalCode" placeholder="Postcode" class="w-full sm:w-1/3" />
                <VaInput v-model="searchAdd.street" placeholder="Street Name" class="w-full sm:w-1/2" />
                <VaButton
                  :disabled="!searchAdd.postalCode && !searchAdd.street"
                  class="w-full sm:w-auto bg-green-800 hover:bg-green-900 text-white"
                  @click="fetchStreetName"
                >
                  🔍
                </VaButton>
              </div>
              <div v-if="streetList.length" id="userResults" class="customer-results">
                <ul class="divide divide-y-2">
                  <li
                    v-for="street in streetList"
                    :key="street"
                    class="p-2 cursor-pointer hover:bg-primary-500"
                    @click="setAddress(street)"
                  >
                    {{ street['Postal Code'] }} &nbsp; - &nbsp;{{ street['Street Name'] }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label class="text-sm font-small text-gray-500">Post Code</label>
                <VaInput v-model="postCode" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-small text-gray-500">Street Number</label>
                <VaInput v-model="streetNumber" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Apt. Number</label>
                <VaInput v-model="aptNumber" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Floor</label>
                <VaInput v-model="floor" class="mt-1" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="text-sm font-small text-gray-500">Street Name</label>
                <VaInput v-model="streetAddress" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-small text-gray-500">District</label>
                <VaInput v-model="district" class="mt-1" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">City</label>
                <VaInput v-model="muncipality" class="mt-1" />
              </div>
            </div>
            <div class="flex flex-col gap-1 mb-4">
              <label class="text-sm font-medium text-gray-500">Address Notes</label>
              <VaTextarea disabled placeholder="Delivery instructions, building access..." rows="3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-[#f8f9fa] px-4 py-6 w-full">
      <div class="flex flex-wrap sm:justify-end items-center gap-4">
        <label
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-600 cursor-pointer hover:bg-gray-100"
        >
          <input v-model="entity" type="checkbox" class="hidden peer" />
          <div
            class="w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center peer-checked:bg-green-600 peer-checked:border-green-600"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-sm font-medium">Save Data</span>
        </label>

        <VaButton
          preset="secondary"
          class="text-gray-600 border border-gray-300 hover:bg-gray-100 text-sm font-medium"
          @click="emits('cancel')"
        >
          Cancel
        </VaButton>

        <VaButton
          type="submit"
          class="bg-green-800 text-white hover:bg-green-900 text-sm font-semibold"
          @click="addOrUpdateCustomerDetails"
        >
          {{ isEdit ? 'Save' : 'Add Customer' }}
        </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'

const { init } = useToast()

const emits = defineEmits(['cancel', 'setUser'])

const props = defineProps<{
  selectedUser?: Record<string, string>
}>()

const showCustomerModal = ref(true)
const searchAdd = reactive({
  street: '',
  postalCode: '',
})
const name = ref('')
const phoneNumber = ref('')
const postCode = ref('')
const streetAddress = ref('')
const floor = ref('')
const muncipality = ref('')
const district = ref('')
const streetNumber = ref('')
const aptNumber = ref('')
const entity = ref(false)
const streetList = ref([])

watch(showCustomerModal, (val) => {
  if (!val) emits('cancel')
})

if (props.selectedUser) {
  name.value = props.selectedUser['Name']
  postCode.value = props.selectedUser['ZipCode']
  const add = props.selectedUser['Address'].split(',')
  if (add.length > 0) {
    aptNumber.value = add[0]
  }
  if (add.length > 1) {
    floor.value = add[1]
  }
  if (add.length > 2) {
    streetNumber.value = add[2]
  }
  if (add.length > 3) {
    streetAddress.value = add[3]
  }
  if (add.length > 4) {
    district.value = add[4]
  }
  muncipality.value = props.selectedUser['Fax']
  phoneNumber.value = props.selectedUser['MobilePhone']
}

const isEdit = computed(() => {
  return props.selectedUser
})

function setAddress(address) {
  postCode.value = address['Postal Code']
  streetAddress.value = address['Street Name']
  district.value = address['District']
  muncipality.value = address['Municipality / Community']
  streetList.value = []
}

async function fetchStreetName() {
  streetList.value = []
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/postalcodes/streets`, {
    params: {
      postalCode: searchAdd.postalCode,
      streetName: searchAdd.street,
    },
  })
  if (response.status === 200) {
    streetList.value = response.data.data
  } else {
    init({
      color: 'danger',
      message: response.data.error,
    })
  }
}

async function addOrUpdateCustomerDetails() {
  const servicesStore = useServiceStore()
  const payload = {
    Name: name.value,
    Phone: phoneNumber.value,
    streetNo: streetNumber.value,
    postCode: postCode.value,
    AptNo: aptNumber.value,
    floor: floor.value,
    streetName: streetAddress.value,
    District: district.value,
    city: muncipality.value,
    entity: entity.value ? '' : 0,
  }
  let response = ''
  if (props.selectedUser) {
    response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/winmax/entites?outletId=${servicesStore.selectedRest}/${
        props.selectedUser.ID
      }`,
      payload,
    )
  } else {
    response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/winmax/entites?outletId=${servicesStore.selectedRest}`,
      payload,
    )
  }
  if (response.status === 200) {
    console.log(response)
  } else {
    init({
      color: 'danger',
      message: response.data.message,
    })
  }
  emits('setUser', { phoneNumber: phoneNumber.value, name: name.value })
  emits('cancel')
}
</script>
<style>
.customer-results {
  max-height: 200px;
  width: 100%;
  position: absolute;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 0px;
  top: 80%;
  margin-bottom: 16px;
  background: white;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

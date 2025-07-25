<template>
  <VaModal
    v-model="showCustomerModal"
    class="big-xl-modal"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <h3 class="va-h3 ml-3">{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</h3>
    <div class="bg-white p-4 pb-0">
      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Customer Info -->
          <div>
            <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Customer Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div v-if="address.length" class="mt-4">
              <label class="text-sm font-medium text-gray-500">Saved Addresses</label>
              <div ref="addressListRef" class="overflow-y-auto max-h-[200px] pr-1 custom-scroll">
                <div
                  v-for="(addr, index) in address"
                  :key="index"
                  ref="addressItems"
                  :ref="(el) => (addressItems.value[index] = el)"
                  :class="[
                    'flex items-center justify-between mt-1 px-4 py-2 rounded border text-gray-500',
                    editAddress === index ? 'bg-yellow-100 border-yellow-500' : 'bg-[#f8f9fa]',
                  ]"
                >
                  <div>
                    <span v-if="addr.designation">
                      <strong>{{ addr.designation }}</strong> -
                    </span>
                    <span v-if="addr.aptNo">{{ addr.aptNo }},</span>
                    <span v-if="addr.floor">{{ addr.floor }},</span>
                    <span v-if="addr.streetName || addr.streetNo">{{ addr.streetName }} {{ addr.streetNo }},</span>
                    <span v-if="addr.district">{{ addr.district }}</span>
                    <span v-if="addr.city">,{{ addr.city }}</span>
                    <span v-if="addr.postCode">,{{ addr.postCode }}</span>
                  </div>
                  <VaButton
                    preset="secondary"
                    size="small"
                    icon="mso-edit"
                    aria-label="Edit Address"
                    @click="editAddressFields(addr, index)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Address Info -->
          <div>
            <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Address Information</h3>

            <p class="mb-2 text-sm font-medium text-gray-500">Search Postcode or Street Name</p>
            <div ref="dropdownContainer" class="relative">
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
              <div v-if="streetList.length" id="userResults" ref="dropdownRef" class="customer-results">
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
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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
            <div class="flex flex-col gap-1 mb-2">
              <label class="text-sm font-medium text-gray-500">Designation *</label>
              <VaInput
                v-model="designation"
                type="text"
                :readonly="editAddress !== -1"
                :class="editAddress !== -1 ? 'bg-gray-100 cursor-not-allowed' : ''"
              />
            </div>
            <div class="flex flex-col gap-1 mb-4">
              <label class="text-sm font-medium text-gray-500">Address Notes</label>

              <VaTextarea placeholder="Delivery instructions, building access..." rows="3" />

              <div class="mt-2 flex justify-end">
                <VaButton
                  size="small"
                  class="!text-xs !px-1 !py-1 text-white rounded"
                  style="background-color: #154ec1"
                  :disabled="!isAddressValid"
                  @click="addAddress"
                >
                  {{ editAddress !== -1 ? 'Edit' : 'Add' }} Address
                </VaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-[#f8f9fa] px-3 py-4 w-full">
      <div class="flex flex-wrap sm:justify-end items-center gap-4">
        <VaButtonToggle
          v-model="isTick"
          toggle-color="textSecondary"
          color="#65667c"
          :options="[
            {
              label: 'Save Data',
              value: true,
              icon: 'va-check',
            },
            {
              label: `Don't Save`,
              value: false,
              icon: 'va-close',
            },
          ]"
          icon-color="warning"
        />

        <VaButton
          preset="secondary"
          class="text-gray-600 border border-gray-300 hover:bg-gray-100 text-sm font-medium"
          @click="emits('cancel')"
        >
          Cancel
        </VaButton>

        <VaButton
          type="submit"
          :disabled="isSubmitting || isTick === null"
          class="bg-green-800 text-white hover:bg-green-900 text-sm font-semibold"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Save' : 'Add Customer' }}
        </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'

const { init } = useToast()

const emits = defineEmits(['cancel', 'setUser'])

const props = defineProps<{
  selectedUser?: Record<string, string>
  userName: string
  userNumber: number
}>()
const addressListRef = ref(null)
const addressItems = ref([])
const dropdownRef = ref(null)
const dropdownContainer = ref(null)

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
const designation = ref('')
const isTick = ref(null)
const streetList = ref([])
const address = ref([])
const isSubmitting = ref(false)
const editAddress = ref(-1)

watch(showCustomerModal, (val) => {
  if (!val) emits('cancel')
})

const isAddressValid = computed(() => {
  return (
    postCode.value.trim() !== '' &&
    streetAddress.value.trim() !== '' &&
    district.value.trim() !== '' &&
    muncipality.value.trim() !== '' &&
    designation.value.trim() !== ''
  )
})

if (props.selectedUser) {
  name.value = props.selectedUser['Name']
  phoneNumber.value = props.selectedUser['MobilePhone'] || props.selectedUser['Phone']
  if (typeof props.selectedUser['isTick'] !== 'undefined') {
    isTick.value = props.selectedUser['isTick']
  } else {
    isTick.value = true
  }

  if (props.selectedUser['OtherAddresses']) {
    props.selectedUser['OtherAddresses'].map((e: any) => {
      const add = e.Address.split(',')
      address.value.push({
        designation: e.Designation,
        floor: add[1] || '',
        aptNo: add[0] || '',
        streetName: add[3] || '',
        streetNo: add[2] || '',
        district: add[4] || '',
        city: add[5] || '',
        postCode: add[6] || '',
      })
    })
  }
} else {
  name.value = props.userName
  phoneNumber.value = props.userNumber
  isTick.value = null
}

const isEdit = computed(() => {
  return props.selectedUser
})

function handleClickOutside(event: MouseEvent) {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    dropdownContainer.value &&
    !dropdownContainer.value.contains(event.target as Node)
  ) {
    streetList.value = []
  }
}

function setAddress(address) {
  streetAddress.value = address['Street Name']
  district.value = address['District']
  postCode.value = address['Postal Code']
  muncipality.value = address['Municipality / Community']
  streetList.value = []
}

function addAddress() {
  if (!isAddressValid.value) {
    init({ color: 'danger', message: 'Please fill all required address fields.' })
    return
  }
  const payload = {
    designation: designation.value,
    floor: floor.value,
    aptNo: aptNumber.value,
    streetName: streetAddress.value,
    streetNo: streetNumber.value,
    district: district.value,
    postCode: postCode.value,
    city: muncipality.value,
  }
  if (editAddress.value !== -1) {
    address.value[editAddress.value] = payload
  } else {
    address.value.push(payload)
  }
  floor.value = ''
  aptNumber.value = ''
  designation.value = ''
  streetAddress.value = ''
  streetNumber.value = ''
  district.value = ''
  postCode.value = ''
  muncipality.value = ''

  // Clear search fields too
  searchAdd.postalCode = ''
  searchAdd.street = ''

  editAddress.value = -1
}

function editAddressFields(addr, index) {
  postCode.value = addr.postCode || ''
  muncipality.value = addr.city || ''
  streetAddress.value = addr.streetName || ''
  streetNumber.value = addr.streetNo || ''
  aptNumber.value = addr.aptNo || ''
  floor.value = addr.floor || ''
  district.value = addr.district || ''
  designation.value = addr.designation || ''

  editAddress.value = index

  nextTick(() => {
    const el = addressItems.value[index]
    if (el && addressListRef.value) {
      const parent = addressListRef.value
      parent.scrollTop = el.offsetTop - parent.offsetTop
    }
  })
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
    name: name.value,
    phone: phoneNumber.value,
    address: address.value,
    isTick: isTick.value,
    customerNote: '',
    addressNote: '',
  }
  try {
    let response
    if (props.selectedUser) {
      payload['id'] = props.selectedUser._id
      response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/winmax/entities/${props.selectedUser['ID']}?outletId=${
          servicesStore.selectedRest
        }`,
        payload,
      )
    } else {
      response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/winmax/entities?outletId=${servicesStore.selectedRest}`,
        payload,
      )
    }

    emits('setUser', { phoneNumber: phoneNumber.value, name: name.value })
  } catch (error) {
    let message = 'Something went wrong.'

    if (error.response && error.response.data && error.response.data.error) {
      message = error.response.data.error
    }
    init({
      color: 'danger',
      message,
    })
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await addOrUpdateCustomerDetails()
    showCustomerModal.value = false
  } finally {
    isSubmitting.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
<style>
.customer-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 440px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-lg text-gray-800 border-b border-blue-500">Customer Details</h2>
      <button
        class="border rounded p-1 hover:bg-gray-100 text-sm"
        @click="(isOpen = !isOpen), $emit('setOpen', isOpen)"
      >
        <span :class="isOpen ? 'rotate-45' : ''" class="transition-transform p-2">{{ isOpen ? '-' : '+' }}</span>
      </button>
    </div>

    <!-- Collapsible Content -->
    <Transition name="fade">
      <div v-show="isOpen" class="space-y-3 mt-2">
        <!-- Toggle Buttons -->
        <div class="flex bg-gray-100 rounded overflow-hidden text-sm">
          <button
            :class="
              selectedTab == 'takeaway' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-200'
            "
            class="flex-1 py-1 transition-colors"
            @click="selectedTab = 'takeaway'"
          >
            Takeaway
          </button>
          <button
            :class="
              selectedTab == 'delivery' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-200'
            "
            class="flex-1 py-1 transition-colors"
            @click="selectedTab = 'delivery'"
          >
            Delivery
          </button>
        </div>

        <!-- Phone & Name -->
        <div v-if="selectedTab" class="flex items-center gap-2 relative">
          <input
            v-model="phoneNumber"
            :disable="selectedUser"
            type="number"
            placeholder="Mobile Number"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="fetchCustomerDetails(false)"
          />
          <input
            v-model="name"
            type="text"
            :disable="selectedUser"
            placeholder="Customer Name"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="fetchCustomerDetails(false)"
          />
          <button
            v-if="!selectedUser"
            class="text-blue-600 bg-blue-600 px-2 py-1 rounded-lg hover:text-blue-800"
            @click.prevent="fetchCustomerDetails(false)"
          >
            <span v-if="!isUserLoading">🔍</span>
            <span v-else class="loading-spinner">⌛</span>
          </button>
          <button
            v-else
            class="text-gray-600 px-2 py-1 rounded-lg hover:text-gray-800"
            @click.prevent="(selectedUser = ''), (phoneNumber = ''), (name = '')"
          >
            ✕
          </button>
          <div v-if="userResults.length" id="userResults" class="user-results">
            <ul ref="userList" class="divide divide-y-2">
              <li
                v-for="user in userResults"
                :key="user.ID"
                class="p-2 cursor-pointer hover:bg-blue-100"
                @click="selectUser(user)"
              >
                {{ user['Name'] }}
              </li>
            </ul>
          </div>
        </div>

        <div v-if="selectedTab && !selectedUser" class="flex items-center justify-between text-sm gap-2">
          <div class="datetime-display" onclick="toggleDateTime()">Fri - 30/05/2025 - 19:30</div>
          <button
            class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
            @click="openCustomerModal"
          >
            + Add New
          </button>
        </div>
        <div v-if="selectedTab && selectedUser" class="flex items-center justify-between text-sm gap-2">
          <div class="datetime-display" onclick="toggleDateTime()">Fri - 30/05/2025 - 19:30</div>
          <VaButton class="rounded" color="#B3D943" size="small" icon="mso-edit" @click="openCustomerModal" />
        </div>

        <!-- Address -->
        <div v-if="selectedTab && selectedUser">
          <label class="text-sm text-gray-600 font-medium block mb-1">
            {{ selectedTab === 'takeaway' ? 'Delivery Zone' : 'Address' }}
          </label>

          <div class="flex items-center gap-2 relative">
            <template v-if="selectedTab === 'takeaway'">
              <input
                type="text"
                :value="selectedZone || 'No Zone Selected'"
                disabled
                class="border rounded w-full px-2 py-1 text-sm bg-gray-100"
              />
              <button class="bg-blue-500 text-white px-2 py-1 rounded" @click="showDeliveryDropdown = true">12</button>
            </template>

            <template v-else>
              <VaSelect
                v-model="selectedAddress"
                close-on-change
                :options="filteredAddresses"
                track-by="value"
                searchable
                highlight-matched-text
              />
              <button
                :disable="!selectedAddress"
                class="bg-blue-500 text-white px-2 py-1 rounded"
                @click="showDeliveryDropdown = true"
              >
                12
              </button>
            </template>

            <!-- Delivery dropdown (shared) -->
            <div
              v-if="showDeliveryDropdown"
              class="absolute right-0 top-full mt-1 w-full text-left bg-white border rounded shadow z-10"
            >
              <ul ref="deliveryList" class="text-sm">
                <li
                  v-for="(zone, index) in deliveryZoneOptions"
                  :key="index"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border border-b-1"
                  :class="{
                    'bg-gray-100 !cursor-not-allowed': selectedTab === 'delivery',
                    'text-primary font-bold': selectedZone === zone.name,
                  }"
                  @click="selectedTab === 'takeaway' ? selectDeliveryZone(zone) : ''"
                >
                  {{ zone.name }} - {{ zone.district }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedTab">
          <label class="text-sm text-gray-600 font-medium block mb-1">Notes</label>
          <textarea
            rows="3"
            disabled
            placeholder="Special instructions, allergies, delivery notes..."
            class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
      </div>
    </Transition>
  </div>
  <CustomerModal
    v-if="showCustomerModal"
    :selected-user="selectedUser"
    :user-name="name"
    :user-number="phoneNumber"
    @setUser="setNewUser"
    @cancel="closeCustomerModal"
  />
</template>

<script setup>
import { ref, watch, defineEmits, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'
import CustomerModal from '../modals/CustomerModal.vue'
import { useOrderStore } from '@/stores/order-store'
import { onClickOutside } from '@vueuse/core'
const props = defineProps(['forceRemount'])
const emits = defineEmits(['setOpen', 'setOrderType', 'setCustomerDetailsId', 'setDeliveryFee', 'setDeliveryZone'])
const target = ref('userList')
const deliveryTarget = ref('deliveryList')
const isOpen = ref(true)
const selectedTab = ref('')
const isUserLoading = ref(false)
const selectedAddress = ref('')
const { init } = useToast()
const orderStore = useOrderStore()
const showCustomerModal = ref(false)

const phoneNumber = ref('')
const name = ref('')
const userResults = ref([])
const selectedUser = ref('')
const selectedZone = ref('')
const showDeliveryDropdown = ref(false)
onClickOutside(target, (event) => (userResults.value = []), { ignore: [deliveryTarget] })
onClickOutside(deliveryTarget, (event) => (showDeliveryDropdown.value = false), { ignore: [target] })

// Set current date & time by default
const selectedDate = ref(new Date())
const selectedTime = ref(new Date().toTimeString().slice(0, 5)) // 'HH:mm'

function openCustomerModal() {
  showCustomerModal.value = true
}
function closeCustomerModal() {
  showCustomerModal.value = false
}

async function fetchCustomerDetails(setUser = false) {
  userResults.value = []
  isUserLoading.value = true
  if (!phoneNumber.value && !name.value) {
    init({
      color: 'danger',
      message: 'Please provide name or phone number',
    })
    isUserLoading.value = false
    return
  } else {
    const servicesStore = useServiceStore()
    await axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/winmax/entites`, {
        params: {
          outletId: servicesStore.selectedRest,
          ...(phoneNumber.value && { Phone: phoneNumber.value }),
          ...(name.value && { Name: name.value }),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          if (!setUser) {
            userResults.value = response.data.data
          } else {
            selectUser(response.data.data[0])
          }
        }
      })
      .catch(() => {
        openCustomerModal()
      })

    isUserLoading.value = false
  }
}

function setNewUser(payload) {
  phoneNumber.value = payload.phoneNumber
  name.value = payload.name
  fetchCustomerDetails(true)
}

function selectUser(user) {
  selectedUser.value = user
  name.value = user['Name']
  phoneNumber.value = user['MobilePhone']

  userResults.value = []
}

const deliveryZoneOptions = ref([])

function selectDeliveryZone(zone) {
  emits('setDeliveryFee', zone.deliveryCharge)
  emits('setDeliveryZone', true)
  orderStore.setDeliveryZone(zone._id)
  selectedZone.value = zone.name
  showDeliveryDropdown.value = false
}

async function handleDeliveryZoneFetch() {
  const addressArray = selectedAddress.value.text
  if (!selectedAddress.value) return
  const addressSplit = addressArray.split(',')
  let postalCode = ''
  if (addressSplit.length) {
    postalCode = addressSplit[addressSplit.length - 1].trim()
  } else {
    init({
      color: 'danger',
      message: 'No zipcode to find postal code',
    })
    return
  }

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliveryZones/postcode/${postalCode}`)

    deliveryZoneOptions.value = response.data.data

    if (!response.data.data.length) {
      init({
        color: 'danger',
        message: 'No delivery zones.',
      })
    } else {
      // const firstZone = response.data.data[0]
      // selectDeliveryZone(firstZone)
      if (!selectedZone.value && response.data.data.length) {
        const firstZone = response.data.data[0]
        selectDeliveryZone(firstZone)
      }
    }
  } catch (err) {
    init({
      color: 'danger',
      message: err?.response?.data?.message || 'Failed to fetch delivery zones.',
    })
  }
}

function getParsedAddress(payload) {
  const add = payload.split(',')

  let address = ''
  if (add[0]) {
    address += add[0] + (add[1] ? ',' : '')
  }
  if (add[1]) {
    address += add[1] + (add[2] ? ',' : '')
  }
  if (add[2]) {
    address += add[2] + (!add[3] && add[4] ? ',' : ' ')
  }
  if (add[3]) {
    address += add[3] + (add[4] ? ',' : ' ')
  }
  if (add[4]) {
    address += add[4] + (add[5] ? ',' : '')
  }
  if (add[5]) {
    address += add[5] + (add[6] ? ',' : '')
  }
  if (add[6]) {
    address += add[6]
  }

  return address
}

const filteredAddresses = computed(() => {
  if (selectedUser.value) {
    return selectedUser.value['OtherAddresses'].map((e, index) => {
      return {
        text: `${e.Designation ? e.Designation + ' - ' : ''}${getParsedAddress(e.Address)}`,
        value: index,
      }
    })
  } else {
    return []
  }
})

watch(
  () => selectedUser.value,
  () => {
    if (selectedUser.value) {
      const firstAddress = selectedUser.value['OtherAddresses'][0]

      selectedAddress.value = {
        text: `${firstAddress.Designation ? firstAddress.Designation + ' - ' : ''}${getParsedAddress(
          firstAddress.Address,
        )}`,
        value: 0,
      }
    }
    emits('setOrderType', selectedTab.value)
    emits('setCustomerDetailsId', selectedUser.value._id)
    userResults.value = []
  },
)

watch(
  () => selectedTab.value,
  () => {
    emits('setOrderType', selectedTab.value)
    emits('setDeliveryFee', 0)
    emits('setDeliveryZone', false)
    selectedZone.value = ''
    if (selectedUser.value) {
      handleDeliveryZoneFetch()
    }
    emits('setCustomerDetailsId', selectedUser.value._id)
  },
)

watch(
  () => selectedAddress.value,
  () => {
    emits('setDeliveryFee', 0)
    emits('setDeliveryZone', false)
    selectedZone.value = ''
    if (selectedUser.value) {
      handleDeliveryZoneFetch()
    }
    orderStore.setAddress(selectedAddress.value.text)
  },
)

watch(
  () => props.forceRemount,
  () => {
    isOpen.value = true
    selectedTab.value = ''
    isUserLoading.value = false
    selectedAddress.value = ''
    phoneNumber.value = ''
    name.value = ''
    userResults.value = []
    selectedUser.value = ''
    selectedZone.value = ''
    showDeliveryDropdown.value = false
    selectedDate.value = new Date()
    selectedTime.value = new Date().toTimeString().slice(0, 5)
    showCustomerModal.value = false
    deliveryZoneOptions.value = []
  },
)

watch(name, (newVal) => {
  if (!newVal.trim()) {
    userResults.value = []
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}

.user-results {
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  top: 80%;
  position: absolute;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 16px;
  background: white;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.datetime-display {
  background: #f1f5f9;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  color: #475569;
  font-size: 12px;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}
</style>

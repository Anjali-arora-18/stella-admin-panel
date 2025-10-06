<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-md text-gray-800">Customer Details</h2>
      <button
        class="border rounded p-1 hover:bg-gray-100 text-xs"
        @click="(isOpen = !isOpen), $emit('setOpen', isOpen)"
      >
        <span :class="isOpen ? 'rotate-45' : ''" class="transition-transform p-2">{{ isOpen ? '-' : '+' }}</span>
      </button>
    </div>

    <!-- Collapsible Content -->
    <Transition name="fade">
      <div v-show="isOpen" class="space-y-3 mt-2">
        <div class="flex bg-gray-100 rounded overflow-hidden text-sm">
          <button
            :class="selectedTab == 'takeaway' ? ` text-white font-semibold` : 'text-gray-600 hover:bg-gray-200'"
            class="flex-1 py-1 transition-colors"
            :style="{ backgroundColor: selectedTab == 'takeaway' ? outlet.primaryColor : '' }"
            @click="selectedTab = 'takeaway'"
          >
            Takeaway
            <span v-if="(selectedZoneDetails?.takeawayPromiseTime ?? 0) > 0">
              ({{ selectedZoneDetails.takeawayPromiseTime }} mins)
            </span>
          </button>
          <button
            :class="selectedTab == 'delivery' ? `text-white font-semibold` : 'text-gray-600 hover:bg-gray-200'"
            class="flex-1 py-1 transition-colors"
            :style="{ backgroundColor: selectedTab == 'delivery' ? outlet.primaryColor : '' }"
            @click="selectedTab = 'delivery'"
          >
            Delivery
            <span v-if="(selectedZoneDetails?.deliveryPromiseTime ?? 0) > 0">
              ({{ selectedZoneDetails.deliveryPromiseTime }} mins)
            </span>
          </button>
        </div>

        <!-- Phone & Name Row -->
        <div v-if="selectedTab" class="flex flex-wrap md:flex-nowrap items-center gap-1 relative w-full">
          <!-- Mobile Number -->
          <input
            v-model="phoneNumber"
            :disabled="selectedUser !== ''"
            type="tel"
            placeholder="Mobile No."
            pattern="[0-9]*"
            inputmode="numeric"
            class="border rounded px-2 py-1 text-xs outline-none focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 w-full md:w-[120px]"
            @input="phoneNumber = phoneNumber.replace(/\D/g, '')"
            @keyup.enter="fetchCustomerDetails(false)"
          />

          <!-- Customer Name -->
          <input
            v-model="name"
            type="text"
            :disabled="selectedUser !== ''"
            placeholder="Customer Name"
            class="border rounded px-2 py-1 text-xs outline-none focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 flex-1 min-w-0"
            @keyup.enter="fetchCustomerDetails(false)"
          />

          <!-- Search Button -->
          <VaButton
            v-if="!selectedUser"
            :style="{ '--va-background-color': outlet.primaryColor }"
            class="h-[24px] w-[24px] rounded-md flex items-center justify-center"
            size="small"
            icon="mso-search"
            @click.prevent="fetchCustomerDetails(false)"
          />
          <VaButton
            v-else
            color="danger"
            size="small"
            icon="mso-close"
            class="h-[24px] w-[24px] rounded-md flex items-center justify-center"
            @click.prevent="showConfirmRemove = true"
          />

          <!-- Add / Edit Button -->
          <template v-if="!selectedUser">
            <VaTooltip text="Add Customer" placement="top">
              <VaButton
                class="text-white h-[24px] w-[24px] rounded-md flex items-center justify-center"
                size="small"
                icon="mso-add"
                :style="{ '--va-background-color': outlet.primaryColor }"
                @click="openCustomerModal"
              />
            </VaTooltip>
          </template>

          <template v-else>
            <div class="flex items-center gap-1">
              <VaTooltip text="Edit Customer" placement="top">
                <VaButton
                  class="hover:bg-blue-600 text-white h-[24px] w-[24px] rounded-md flex items-center justify-center"
                  size="small"
                  icon="mso-edit"
                  :style="{ '--va-background-color': outlet.primaryColor }"
                  @click="openCustomerModal"
                />
              </VaTooltip>

              <!-- Order History Button -->
              <VaTooltip text="View Order History" placement="top">
                <VaButton
                  class="hover:bg-green-600 text-white h-[24px] w-[24px] rounded-md flex items-center justify-center"
                  size="small"
                  icon="mso-history"
                  :style="{ '--va-background-color': outlet.primaryColor }"
                  @click="showHistoryModal = true"
                />
              </VaTooltip>
            </div>
          </template>

          <!-- Suggestions -->
          <div v-if="userResults.length" id="userResults" class="user-results w-full absolute top-full left-0 mt-2">
            <ul ref="userList" class="divide divide-y-2 bg-white border rounded shadow w-full z-10">
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

        <div v-if="selectedTab && selectedUser" class="flex items-center gap-1 w-full">
          <div class="flex bg-gray-100 rounded overflow-hidden text-xs w-[60%]">
            <button
              :class="orderFor === 'current' ? ` text-white font-semibold` : 'text-gray-600 hover:bg-gray-200'"
              :style="{ backgroundColor: orderFor == 'current' ? outlet.primaryColor : '' }"
              class="w-1/2 py-1 px-1 transition-colors text-xs"
              @click="orderFor = 'current'"
            >
              Order Now
            </button>
            <button
              :class="orderFor === 'future' ? `text-white font-semibold` : 'text-gray-600 hover:bg-gray-200'"
              class="w-1/2 py-1 px-1 transition-colors text-xs"
              :style="{ backgroundColor: orderFor == 'future' ? outlet.primaryColor : '' }"
              @click="orderFor = 'future'"
            >
              Future Order
            </button>
          </div>

          <input
            v-model="localDateTime"
            type="datetime-local"
            class="text-xs border rounded px-1 py-1 w-[40%]"
            :disabled="orderFor === 'current'"
          />
        </div>

        <!-- Address -->
        <div v-if="selectedTab && selectedUser">
          <label class="text-xs text-gray-600 font-medium block mb-1">
            {{ selectedTab === 'takeaway' ? 'Location' : 'Address' }}
          </label>

          <div class="flex flex-wrap md:flex-nowrap items-center gap-1 relative w-full">
            <template v-if="selectedTab === 'takeaway'">
              <input
                type="text"
                :value="selectedZone || 'No Zone Selected'"
                disabled
                class="border rounded w-full px-1 py-1 text-xs bg-gray-100"
              />
              <VaButton
                class="hover:bg-blue-600 text-white h-[24px] w-[24px] rounded-md flex items-center justify-center"
                size="small"
                :style="{ '--va-background-color': outlet.primaryColor }"
                @click="showDeliveryDropdown = true"
              >
                {{ serviceZoneId || 'N/A' }}
              </VaButton>
            </template>

            <template v-else>
              <VaSelect
                v-model="selectedAddress"
                close-on-change
                :options="filteredAddresses"
                track-by="value"
                searchable
                highlight-matched-text
                class="h-[24px] w-[24px] min-w-[32px] flex items-center justify-center rounded-md p-0 text-xs mt-1"
                style="--va-select-dropdown-max-height: 100px"
              />

              <VaButton
                class="hover:bg-blue-600 text-white h-[24px] w-[24px] rounded-md flex items-center justify-center"
                size="small"
                :style="{ '--va-background-color': outlet.primaryColor }"
                @click="showDeliveryDropdown = true"
              >
                {{ serviceZoneId || 'N/A' }}
              </VaButton>
            </template>

            <!-- Delivery dropdown (shared) -->
            <div
              v-if="showDeliveryDropdown"
              class="absolute right-0 top-full max-h-[300px] overflow-y-auto mt-1 w-full text-left bg-white border rounded shadow z-10"
            >
              <ul ref="deliveryList" class="text-xs">
                <li
                  v-for="(zone, index) in deliveryZoneOptions"
                  :key="index"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer border border-b-1"
                  :class="{
                    'text-primary font-bold': selectedZone === zone.name,
                  }"
                  @click="selectDeliveryZone(zone)"
                >
                  {{ zone.serviceZoneId }} - {{ zone.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedTab">
          <label class="text-xs text-gray-600 font-medium block mb-1">Notes</label>
          <textarea
            rows="1"
            disabled
            placeholder="Special instructions, allergies, delivery notes..."
            class="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
      </div>
    </Transition>
    <CustomerModal
      v-if="showCustomerModal"
      :selected-user="selectedUser"
      :user-name="name"
      :user-number="phoneNumber"
      :outlet="outlet"
      @setUser="setNewUser"
      @cancel="closeCustomerModal"
    />
    <ConfirmRemoveCustomerDetails
      v-model="showConfirmRemove"
      @confirm="onConfirmRemove"
      @close="closeConfirmRemoveModal"
    />
    <CustomerHistoryModal
      v-if="showHistoryModal"
      :customer="selectedUser"
      :outlet="outlet"
      :selected-user="selectedUser"
      :delivery-zone-options="deliveryZoneOptions"
      :takeaway-promise-time="selectedZoneDetails?.takeawayPromiseTime || 0"
      :delivery-promise-time="selectedZoneDetails?.deliveryPromiseTime || 0"
      :delivery-fee="selectedZoneDetails?.deliveryCharge || 0"
      :selected-tab="selectedTab"
      @close="showHistoryModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, computed, defineExpose, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useToast, useColors } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'
import CustomerModal from '../modals/CustomerModal.vue'
import ConfirmRemoveCustomerDetails from '../modals/ConfirmRemoveCustomerDetails.vue'
import CustomerHistoryModal from '../modals/CustomerHistoryModal.vue'
import { useOrderStore } from '@/stores/order-store'
import { onClickOutside } from '@vueuse/core'
const props = defineProps(['forceRemount'])
const emits = defineEmits([
  'setTab',
  'setOpen',
  'setOrderType',
  'setCustomerDetailsId',
  'setDeliveryFee',
  'setDeliveryZone',
])
const target = ref('userList')
const deliveryTarget = ref('deliveryList')
const isOpen = ref(true)
const selectedTab = ref('')
const isUserLoading = ref(false)
const selectedAddress = ref('')
const { init } = useToast()
const orderStore = useOrderStore()
const showCustomerModal = ref(false)
const serviceZoneId = ref('')
const phoneNumber = ref('')
const name = ref('')
const userResults = ref([])
const selectedUser = ref('')
const selectedZone = ref('')
const showDeliveryDropdown = ref(false)
const selectedZoneDetails = ref(null)
const orderFor = ref('current')
const showConfirmRemove = ref(false)
const showHistoryModal = ref(false)

function handleRemoveCustomer() {
  // Check if order has items
  if (orderStore.items && orderStore.items.length > 0) {
    showConfirmRemove.value = true
  } else {
    clearCustomerDetails()
  }
}

function clearCustomerDetails() {
  selectedUser.value = ''
  phoneNumber.value = ''
  name.value = ''
  userResults.value = []
  selectedAddress.value = ''
  selectedZone.value = ''
  serviceZoneId.value = ''
  selectedZoneDetails.value = null
  showDeliveryDropdown.value = false
  emits('setCustomerDetailsId', '')
  emits('setDeliveryZone', false)
  emits('setOrderType', '')
}

function onConfirmRemove() {
  clearCustomerDetails()
}
function closeConfirmRemoveModal() {
  showConfirmRemove.value = false
}

onClickOutside(target, (event) => (userResults.value = []), { ignore: [deliveryTarget] })
onClickOutside(deliveryTarget, (event) => (showDeliveryDropdown.value = false), { ignore: [target] })

const localDateTime = ref('')
const selectedDate = ref(new Date())

const getLocalDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const updateTimeOnly = () => {
  localDateTime.value = getLocalDateTime()
}

watch(
  localDateTime,
  (newVal) => {
    if (newVal && newVal.length >= 16) {
      const [datePart, timePart] = newVal.split('T')
      if (datePart && timePart) {
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute] = timePart.split(':').map(Number)
        selectedDate.value = new Date(year, month - 1, day, hour, minute)
        emits('setDateSelected', selectedDate.value)
      }
    }
  },
  { immediate: true },
)
let timeInterval = null

const startAutoUpdateTime = () => {
  stopAutoUpdateTime()
  updateTimeOnly()
  timeInterval = setInterval(() => {
    if (orderFor.value === 'current') {
      updateTimeOnly()
    }
  }, 1000)
}

const stopAutoUpdateTime = () => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
}
watch(orderFor, (newVal) => {
  if (newVal === 'current') {
    startAutoUpdateTime()
  } else {
    stopAutoUpdateTime()
  }
})
onMounted(() => {
  if (orderFor.value === 'current') {
    startAutoUpdateTime()
  }
})
onBeforeUnmount(() => {
  stopAutoUpdateTime()
})

// onUnmounted(() => {
//   stopAutoUpdateTime()
// })

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
      .get(`${import.meta.env.VITE_API_BASE_URL}/winmax/entities`, {
        params: {
          outletId: servicesStore.selectedRest,
          ...(phoneNumber.value && { Phone: phoneNumber.value }),
          ...(name.value && { Name: name.value }),
        },
      })
      .then(async (response) => {
        if (response.status === 200) {
          if (!setUser) {
            userResults.value = response.data.data
          } else {
            selectUser(response.data.data[0])
          }
        }
      })
      .catch(async () => {
        await axios
          .get(`${import.meta.env.VITE_API_BASE_URL}/customers/search`, {
            params: {
              outletId: servicesStore.selectedRest,
              ...(phoneNumber.value && { phoneNo: phoneNumber.value }),
              ...(name.value && { customerName: name.value }),
            },
          })
          .then((response) => {
            userResults.value = response.data.data.map((e) => {
              return {
                ...e,
                Name: e.customerName,
                MobilePhone: e.phoneNo,
                OtherAddresses: e.address.map((address) => {
                  return {
                    Designation: address.designation,
                    Address: [
                      address.aptNo,
                      address.floor,
                      address.streetName,
                      address.streetNo,
                      address.district,
                      address.city,
                      address.postalCode,
                    ].join(','),
                    ZipCode: address.postalCode,
                    Phone: '',
                    Fax: '',
                    Location: '',
                    CountryCode: '',
                  }
                }),
              }
            })
          })
        if (!userResults.value.length) {
          openCustomerModal()
        } else {
          if (setUser) {
            selectUser(userResults.value[0])
          }
        }
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
  phoneNumber.value = user['MobilePhone'] || user['Phone']

  userResults.value = []
}

const deliveryZoneOptions = ref([])

function selectDeliveryZone(zone) {
  console.log(zone)
  if (zone) {
    emits('setDeliveryFee', selectedTab.value === 'takeaway' ? 0 : zone.deliveryCharge)
    emits('setDeliveryZone', true)
    orderStore.setDeliveryZone(zone)
    selectedZone.value = zone.name
    serviceZoneId.value = zone.serviceZoneId
    selectedZoneDetails.value = zone
    showDeliveryDropdown.value = false
  }
}

async function handleDeliveryZoneFetch() {
  deliveryZoneOptions.value = []
  let postalCode = ''
  const servicesStore = useServiceStore()
  // let payloadPostCode = postalCode
  // if (selectedTab.value === 'takeaway') {
  //   payloadPostCode = ''
  // }
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliveryZones/${servicesStore.selectedRest}`)

    deliveryZoneOptions.value = response.data.data.sort((a, b) => {
      return Number(a.serviceZoneId) - Number(b.serviceZoneId)
    })

    if (!response.data.data.length) {
      selectedZone.value = ''
      if (selectedTab.value === 'delivery') {
        serviceZoneId.value = ''
      }
      init({
        color: 'danger',
        message: 'No delivery zones found for selected address.',
      })
    } else {
      if (selectedAddress.value && !selectedAddress.value.text.includes('Meeting Point')) {
        const addressArray = selectedAddress.value?.text
        const addressSplit = addressArray.split(',')
        if (addressSplit.length) {
          postalCode = addressSplit[addressSplit.length - 1].trim()
          const firstZone = response.data.data.find((a) => a.postalCodes.includes(postalCode))
          serviceZoneId.value = firstZone.serviceZoneId
          if (firstZone) {
            selectDeliveryZone(firstZone)
          } else {
            init({
              color: 'danger',
              message: 'No delivery zones mapped with this postal code.',
            })
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
    selectedZone.value = ''
    if (selectedTab.value === 'delivery') {
      serviceZoneId.value = ''
    }
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
  if (add[3]) {
    address += add[3] + (!add[2] && add[4] ? ',' : ' ')
  }
  if (add[2]) {
    address += add[2] + (add[4] ? ',' : ' ')
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

const outlet = computed(() => {
  const servicesStore = useServiceStore()
  return servicesStore.restDetails || {}
})

const filteredAddresses = computed(() => {
  let OtherAddresses = []
  let addresses = []
  if (selectedZoneDetails.value) {
    if (selectedUser.value['OtherAddresses'] && selectedUser.value['OtherAddresses'].length) {
      OtherAddresses = selectedUser.value['OtherAddresses'].filter((address) => {
        const adrs = address.Address.split(',')
        const postalCode = adrs[adrs.length - 1].trim().toString()

        return selectedZoneDetails.value.postalCodes.includes(postalCode)
      })
      addresses = OtherAddresses.map((e) => {
        return {
          text: `${e.Designation ? e.Designation + ' - ' : ''}${getParsedAddress(e.Address)}`,
          value: `${e.Designation ? e.Designation + ' - ' : ''}${getParsedAddress(e.Address)}`,
        }
      })
    }
    // commmented the metting point zone for now.
    // selectedZoneDetails.value.meetingPointAddress
    //   .filter((a) => a !== '')
    //   .forEach((meetingPoint) => {
    //     addresses.push({
    //       text: `Meeting Point - ${meetingPoint}`,
    //       value: meetingPoint,
    //     })
    //   })
    return addresses
  } else {
    return []
  }
})

watch(
  () => selectedZoneDetails.value,
  (newVal, oldVal) => {
    if (newVal && oldVal) {
      selectedAddress.value = filteredAddresses.value.length ? filteredAddresses.value[0] : ''
    }
  },
)

watch(
  () => selectedUser.value,
  () => {
    if (selectedUser.value) {
      const otherAddresses = selectedUser.value['OtherAddresses']
      if (Array.isArray(otherAddresses) && otherAddresses.length > 0) {
        const firstAddress = otherAddresses[0]
        selectedAddress.value = {
          text: `${firstAddress.Designation ? firstAddress.Designation + ' - ' : ''}${getParsedAddress(
            firstAddress.Address,
          )}`,
          value: `${firstAddress.Designation ? firstAddress.Designation + ' - ' : ''}${getParsedAddress(
            firstAddress.Address,
          )}`,
        }
      } else {
        selectedAddress.value = ''
      }

      emits('setOrderType', selectedTab.value)
      handleDeliveryZoneFetch()
      emits('setCustomerDetailsId', selectedUser.value._id)
      userResults.value = []
    }
  },
)

watch(
  () => selectedTab.value,
  () => {
    emits('setOrderType', selectedTab.value)
    emits('setTab', selectedTab.value)

    if (selectedUser.value) {
      handleDeliveryZoneFetch()
    }
    emits('setCustomerDetailsId', selectedUser.value._id)
  },
)

watch(
  () => selectedAddress.value,
  () => {
    if (selectedZoneDetails.value) {
      selectDeliveryZone(selectedZoneDetails.value)
      orderStore.setDeliveryZone(selectedZoneDetails.value)
      emits('setDeliveryZone', true)
      orderStore.setAddress(selectedAddress.value.text)
    }
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
    showCustomerModal.value = false
    deliveryZoneOptions.value = []
  },
)

watch(name, (newVal) => {
  if (!newVal.trim()) {
    userResults.value = []
  }
})

watch(orderFor, (newVal) => {
  orderStore.setOrderFor(newVal)
})

defineExpose({
  isOpen,
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
  z-index: 50;
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
.va-input-wrapper .va-input-wrapper__fieldset .va-input-wrapper__container .va-input-wrapper__field {
  padding: 6px;
}
</style>

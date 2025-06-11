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
            type="text"
            placeholder="Mobile Number"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            v-model="name"
            type="text"
            :disable="selectedUser"
            placeholder="Customer Name"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
        <div v-if="selectedTab">
          <label class="text-sm text-gray-600 font-medium block mb-1">Address</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              disabled
              :value="selectedUser['Address']"
              class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button class="bg-blue-500 text-white px-2 py-1 rounded">12</button>
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
    @setUser="setNewUser"
    @cancel="closeCustomerModal"
  />
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'
import CustomerModal from '../modals/CustomerModal.vue'
import { onClickOutside } from '@vueuse/core'
import { useTemplateRef } from 'vue'
const emits = defineEmits(['setOpen'])
const target = useTemplateRef('userList')
const isOpen = ref(true)
const selectedTab = ref('')
const isUserLoading = ref(false)
const { init } = useToast()

const showCustomerModal = ref(false)

const phoneNumber = ref('')
const name = ref('')
const userResults = ref([])
const selectedUser = ref('')
onClickOutside(target, (event) => (userResults.value = []))
watch(
  () => selectedUser,
  () => {
    userResults.value = []
  },
)

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
      .catch((err) => {
        init({
          color: 'danger',
          message: err.response.data.message,
        })
      })

    isUserLoading.value = false
  }
}

function setNewUser(payload) {
  phoneNumber.value = payload.phoneNumber
  fetchCustomerDetails(true)
}

function selectUser(user) {
  selectedUser.value = user
  name.value = user['Name']
  phoneNumber.value = user['MobilePhone']

  userResults.value = []
}
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

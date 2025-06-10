<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-lg text-gray-800 border-b-2 border-blue-500 pb-2">Customer Details</h2>
      <button class="border rounded p-1 hover:bg-gray-100 text-sm" @click="isOpen = !isOpen">
        <span :class="isOpen ? 'rotate-45' : ''" class="transition-transform">{{ isOpen ? '-' : '+' }}</span>
      </button>
    </div>

    <!-- Collapsible Content -->
    <Transition name="fade">
      <div v-show="isOpen" class="space-y-3">
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
        <div v-if="selectedTab" class="flex items-center gap-2">
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
            @click.prevent="fetchCustomerDetails"
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
        </div>

        <div v-if="userResults.length" id="userResults" class="user-results">
          <ul class="divide divide-y-2">
            <li
              v-for="user in userResults"
              :key="user.ID"
              class="p-2 cursor-pointer hover:bg-primary-500"
              @click="selectUser(user)"
            >
              {{ user['Name'] }}
            </li>
          </ul>
        </div>

        <!-- Points & Add New -->
        <div v-if="selectedTab && !selectedUser" class="flex items-center justify-between text-sm">
          <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">Today Date</div>
          <button
            class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
            @click="openCustomerModal"
          >
            + Add New
          </button>
        </div>
        <div v-if="selectedTab && selectedUser" class="flex items-center justify-between text-sm">
          <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">Today Date</div>
          <button
            class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
            @click="openCustomerModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
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
  <CustomerModal v-model="showCustomerModal" :selected-user="selectedUser" @cancel="closeCustomerModal" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast, VaDateInput, VaTimeInput } from 'vuestic-ui'
import axios from 'axios'
import { useServiceStore } from '@/stores/services.ts'
import CustomerModal from '../modals/CustomerModal.vue'

const isOpen = ref(true)
const selectedTab = ref('')
const isUserLoading = ref(false)
const { init } = useToast()

const showCustomerModal = ref(false)

const phoneNumber = ref('')
const name = ref('')
const userResults = ref([])
const selectedUser = ref('')

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

async function fetchCustomerDetails() {
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/winmax/entites`, {
      params: {
        outletId: servicesStore.selectedRest,
        ...(phoneNumber.value && { Phone: phoneNumber.value }),
        ...(name.value && { Name: name.value }),
      },
    })
    if (response.status === 200) {
      userResults.value = response.data.data
    } else {
      init({
        color: 'danger',
        message: response.data.message,
      })
    }
    isUserLoading.value = false
  }
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 16px;
  background: white;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

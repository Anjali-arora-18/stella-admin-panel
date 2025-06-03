<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-lg text-gray-800 border-b-2 border-blue-500 pb-2">Customer Details</h2>
      <button @click="isOpen = !isOpen" class="border rounded p-1 hover:bg-gray-100 text-sm">
        <span :class="isOpen ? 'rotate-45' : ''" class="transition-transform">{{ isOpen ? '-' : '+' }}</span>
      </button>
    </div>

    <!-- Collapsible Content -->
    <transition name="fade">
      <div v-show="isOpen" class="space-y-3">
        <!-- Toggle Buttons -->
        <div class="flex bg-gray-100 rounded overflow-hidden text-sm">
          <button @click="selectedTab = 'takeaway'" :class="selectedTab == 'takeaway' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-200'" class="flex-1 py-1 transition-colors">
            Takeaway
          </button>
          <button @click="selectedTab = 'delivery'" :class="selectedTab == 'delivery' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-200'" class="flex-1 py-1 transition-colors">
            Delivery
          </button>
          
        </div>

        <!-- Phone & Name -->
        <div class="flex items-center gap-2">
          <input
            type="text"
            value="99123456"
            placeholder="Mobile Number"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            value="John Doe"
            placeholder="Customer Name"
            class="border rounded w-1/2 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button class="text-blue-600 bg-blue-600 px-2 py-1 rounded-lg hover:text-blue-800">
            🔍
          </button>
        </div>

        <!-- Show Postcode if Delivery -->
        <div v-if="selectedTab === 'delivery'">
          <input
            type="text"
            placeholder="Postcode"
            class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Points & Add New -->
        <div class="flex items-center justify-between text-sm">
          <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
            Points: 250 – €2.50
          </div>
          <button class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
            + Add New
          </button>
        </div>

        <!-- Address -->
        <div>
          <label class="text-sm text-gray-600 font-medium block mb-1">Address</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              value="123 Main Street, Limassol"
              class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button class="bg-blue-500 text-white px-2 py-1 rounded">12</button>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="text-sm text-gray-600 font-medium block mb-1">Notes</label>
          <textarea
            rows="3"
            placeholder="Special instructions, allergies, delivery notes..."
            class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(true)
const selectedTab = ref('takeaway');
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}
</style>

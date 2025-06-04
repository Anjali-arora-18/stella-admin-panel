<template>
    <VaModal v-model="showCustomerModal" class="big-modal" :mobile-fullscreen="false" size="large" hide-default-actions
        close-button>
        <div class="bg-[#f8f9fa] p-6 rounded-lg shadow">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800">Add New Customer</h2>
                <button
                    class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-200 text-gray-500">
                    ✕
                </button>
            </div>

            <!-- Form -->
            <form class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Left Column -->
                    <div>
                        <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Customer Information
                        </h3>

                        <!-- Mobile Number & Name -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm font-medium text-gray-700">Mobile Number *</label>
                                <input type="text" placeholder="Enter mobile number"
                                    class="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-700">
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-700">Customer Name *</label>
                                <input type="text" placeholder="Enter full name"
                                    class="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-700">
                            </div>
                        </div>

                        <!-- Notes -->
                        <div class="mt-4">
                            <label class="text-sm font-medium text-gray-700">Customer Notes</label>
                            <textarea rows="3" placeholder="Special instructions, allergies, preferences..."
                                class="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-700"></textarea>
                        </div>

                        <!-- Saved Addresses -->
                        <div class="mt-4">
                            <label class="text-sm font-medium text-gray-700">Saved Addresses</label>
                            <div
                                class="flex items-center justify-between mt-1 px-4 py-2 bg-white rounded border text-gray-700">
                                <span>123 Main St, Apt 4B, Limassol 3036</span>
                                <button
                                    class="text-sm bg-green-800 text-white px-3 py-1 rounded hover:bg-green-900">Edit</button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div>
                        <h3 class="font-semibold text-gray-700 border-b border-green-800 pb-1 mb-4">Address Information
                        </h3>

                        <!-- Search Inputs -->
                        <div class="flex gap-4">
                            <input type="text" placeholder="Postcode"
                                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-700">
                            <input type="text" placeholder="Street Name"
                                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-700">
                            <button
                                class="bg-green-800 hover:bg-green-900 text-white p-2 rounded flex items-center justify-center">
                                🔍
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end items-center gap-4 mt-6">
                    <!-- Checkbox Button -->
                    <label
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-600 cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" class="hidden peer" />
                        <div
                            class="w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center peer-checked:bg-green-600 peer-checked:border-green-600">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3"
                                viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span class="text-sm font-medium">Save Data</span>
                    </label>

                    <!-- Cancel -->
                    <button type="button"
                        class="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium">
                        Cancel
                    </button>

                    <!-- Save Customer -->
                    <button type="submit"
                        class="px-5 py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm font-semibold">
                        Save Customer
                    </button>
                </div>
            </form>
        </div>

    </VaModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const emits = defineEmits(['cancel'])

const showCustomerModal = ref(true)

// Watch for closing the modal
watch(showCustomerModal, (val) => {
    if (!val) emits('cancel')
})
</script>
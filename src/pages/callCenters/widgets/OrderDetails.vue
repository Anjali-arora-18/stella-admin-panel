<template>
    <div class="w-full mx-auto overflow-x-auto">
        <!-- Title -->
        <h2 class="font-semibold text-lg text-gray-800 border-b pb-2">Order Details</h2>

        <!-- Promo Code -->
        <va-input v-model="promoCode" class="my-4" placeholder="Promotion Code" size="small" input-class="text-sm" />

        <!-- Order Items -->
        <div v-for="item in items" :key="item.id" class="mb-4 border-b pb-3 last:border-none">
            <div class="flex items-start justify-between">
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                    <va-button icon="remove" color="success" size="small" class="rounded" @click="decreaseQty(item)" />
                    <va-badge :text="item.quantity" color="secondary" size="large" class="!py-1 !h-[2rem]" />
                    <va-button icon="add" color="success" size="small" class="rounded" @click="increaseQty(item)" />

                </div>

                <!-- Item Info -->
                <div class="flex-1 px-2">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-800">{{ item.name }}</span>
                        <va-icon name="edit" size="small" class="text-yellow-600 cursor-pointer" />
                    </div>

                    <!-- Options -->
                    <div class="flex flex-wrap gap-1 mt-1 text-xs">
                        <span v-for="option in item.additions" :key="option"
                            class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {{ option }}
                        </span>
                        <span v-for="removal in item.removals" :key="removal"
                            class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            -{{ removal }}
                        </span>
                    </div>

                    <!-- Base Info -->
                    <p class="text-[11px] text-gray-500 mt-1 italic">
                        Base: €{{ item.basePrice.toFixed(2) }} + Add-ons = €{{ item.unitTotal.toFixed(2) }} each
                    </p>
                </div>

                <!-- Item Total -->
                <span class="font-semibold text-green-800">€{{ item.total.toFixed(2) }}</span>
            </div>
        </div>

        <!-- Summary -->
        <div class="text-sm mt-4 space-y-1 p-2 bg-slate-50">
            <div class="flex justify-between">
                <span class="text-gray-600">Subtotal:</span>
                <span>€{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Delivery Fee:</span>
                <span>€{{ deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>€{{ total.toFixed(2) }}</span>
            </div>
        </div>

        <!-- Checkout -->
        <va-button class="mt-4 w-full" color="success" size="large">
            Checkout Order
        </va-button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const promoCode = ref('')

const items = ref([
    {
        id: 1,
        name: 'Margherita Pizza',
        quantity: 2,
        basePrice: 15.2,
        additions: ['Cheese (+€1.00)', 'Chicken (+€2.00)'],
        removals: ['Tomato'],
        unitTotal: 18.2,
        total: 36.4,
    },
    {
        id: 2,
        name: 'Caesar Salad',
        quantity: 1,
        basePrice: 8.9,
        additions: [],
        removals: [],
        unitTotal: 8.9,
        total: 8.9,
    },
    {
        id: 3,
        name: 'Grilled Shrimp',
        quantity: 3,
        basePrice: 12.5,
        additions: [],
        removals: [],
        unitTotal: 12.5,
        total: 37.5,
    },
])

const deliveryFee = ref(2.5)

const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.total, 0)
)

const total = computed(() => subtotal.value + deliveryFee.value)

const increaseQty = (item) => {
  item.quantity++
  item.total = item.unitTotal * item.quantity
}

const decreaseQty = (item) => {
  if (item.quantity > 1) {
    item.quantity--
    item.total = item.unitTotal * item.quantity
  }
}
</script>

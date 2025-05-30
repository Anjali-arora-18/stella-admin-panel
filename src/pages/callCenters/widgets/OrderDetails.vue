<template>
    <div class="w-full">
        <h3 class="font-bold text-lg border-b-2 border-blue-500 pb-2">Order Details</h3>
        <div>
            <input type="text" placeholder="Promotion Code"
                class="w-full px-3 py-2 mb-4 border mt-4 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

            <div v-for="item in cartItems" :key="item.id"
                class="flex items-center justify-between py-2 border-t first:border-t-0">
                <!-- Quantity circle -->
                <div class="flex items-center gap-2">
                    <div
                        class="w-6 h-6 flex items-center justify-center text-white bg-blue-500 rounded-full text-xs font-bold">
                        {{ item.qty }}
                    </div>
                    <span class="text-sm text-gray-800 font-medium">{{ item.name }}</span>
                </div>

                <!-- Price -->
                <span class="text-blue-600 font-semibold text-sm">{{ item.price }}</span>
            </div>
        </div>

        <div class="mt-3">
            <!-- Price breakdown -->
            <div class="bg-gray-50 rounded-md p-4 text-xs space-y-2">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€76.80</span>
                </div>
                <div class="flex justify-between">
                    <span>Tax (19%):</span>
                    <span>€14.59</span>
                </div>
                <div class="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>€2.50</span>
                </div>
                <div class="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>€93.89</span>
                </div>
            </div>

            <!-- Checkout button -->
            <button class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition">
                Checkout Order
            </button>
        </div>

    </div>
</template>

<script setup>
const cartItems = [
    { id: 1, name: 'Margherita Pizza', qty: 2, price: '€30.40' },
    { id: 2, name: 'Caesar Salad', qty: 1, price: '€8.90' },
    { id: 3, name: 'Grilled Shrimp', qty: 3, price: '€37.50' }
];
</script>

<template>
  <div class="w-full mx-auto order-details">
    <!-- Title -->
    <!-- <h2 class="font-semibold text-lg text-gray-800 border-b pb-2">Order Details</h2> -->

    <template v-if="items.length">
      <!-- Promo Code -->
      <VaInput v-model="promoCode" class="my-4" placeholder="Promotion Code" size="small" input-class="text-sm" />

      <!-- Order Items -->
      <div :class="isCustomerOpen ? 'order-items-min-height' : 'order-items-height'">
        <div v-for="item in items" :key="item.id" class="mb-4 border-b pb-3 last:border-none">
          <div class="flex items-start justify-between">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <VaButton icon="remove" color="success" size="small" class="rounded" @click="decreaseQty(item)" />
              <VaBadge :text="item.quantity" color="secondary" size="large" class="!py-1 !h-[2rem]" />
              <VaButton icon="add" color="success" size="small" class="rounded" @click="increaseQty(item)" />
            </div>

            <!-- Item Info -->
            <div class="flex-1 px-2">
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">{{ item.name }}</span>
                <VaIcon
                  name="edit"
                  size="small"
                  class="text-yellow-600 cursor-pointer"
                  @click="getMenuOptions(item.fullItem)"
                />
              </div>

              <!-- Options -->
              <div class="flex flex-wrap gap-1 mt-1 text-xs">
                <span
                  v-for="option in item.additions"
                  :key="option"
                  class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                >
                  {{ option }}
                </span>
                <span
                  v-for="removal in item.removals"
                  :key="removal"
                  class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                >
                  -{{ removal }}
                </span>
                <span
                  v-for="modifier in item.modifierType"
                  :key="modifier"
                  class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
                >
                  *{{ modifier }}
                </span>
                <span
                  v-for="article in item.articleType"
                  :key="article"
                  class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {{ article }}
                </span>
              </div>

              <!-- Base Info -->
              <p class="text-[11px] text-gray-500 mt-1 italic">
                Base: €{{ item.basePrice.toFixed(2) }} + €{{ item.selectionTotalPrice.toFixed(2) }} = €{{
                  item.unitTotal.toFixed(2)
                }}
                each
              </p>
            </div>

            <!-- Item Total -->
            <span class="font-semibold text-green-800">€{{ item.total.toFixed(2) }}</span>
          </div>
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
      <VaButton class="mt-4 w-full" color="success" size="large" @click="openCheckoutModal"> Checkout Order </VaButton>
    </template>
    <template v-else>
      <div class="mt-4 w-full">No Orders Selected</div>
    </template>
  </div>
  <MenuModal
    v-model="showMenuModal"
    :item="selectedItemWithArticlesOptionsGroups"
    :is-edit="isEdit"
    @cancel="closeMenuModal"
    @cancelEdit="isEdit = false"
  />
  <CheckOutModal v-model="showCheckoutModal" @cancel="closeCheckoutModal" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order-store' // adjust path as needed
import MenuModal from '../modals/MenuModal.vue'
import CheckOutModal from '../modals/CheckOutModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'

const props = defineProps(['isCustomerOpen'])

const promoCode = ref('')

const orderStore = useOrderStore()
const { cartItems } = storeToRefs(orderStore)

const items = computed(() =>
  cartItems.value.map((item, index) => {
    const additions = []
    const removals = []
    const modifierType = []
    const articleType = []

    item.selectedOptions.forEach((group) => {
      group.selected.forEach((sel) => {
        if (sel.type == 'hold') {
          removals.push(`${sel.name} (+€${sel.price.toFixed(2) * sel.quantity})`)
        } else if (sel.type == 'extra') {
          additions.push(`${sel.name} (+€${sel.price.toFixed(2) * sel.quantity})`)
        } else if (sel.type == 'modifier') {
          modifierType.push(`${sel.name} (+€${sel.price.toFixed(2) * sel.quantity})`)
        } else if (sel.type == 'article') {
          articleType.push(`${sel.name} (+€${sel.price.toFixed(2) * sel.quantity})`)
        }
      })
    })

    const unitTotal = item.totalPrice / item.quantity

    return {
      id: item.itemId || index, // fallback to index if no ID
      name: item.itemName,
      quantity: item.quantity,
      basePrice: item.basePrice,
      selectionTotalPrice: item.selectionTotalPrice,
      additions,
      removals,
      modifierType,
      articleType,
      unitTotal,
      total: item.totalPrice,
      fullItem: item,
    }
  }),
)

const deliveryFee = ref(2.5)

const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.total, 0))

const total = computed(() => subtotal.value + deliveryFee.value)

const increaseQty = (item) => {
  const index = cartItems.value.findIndex((i) => i.itemId === item.id)
  if (index !== -1) {
    orderStore.cartItems[index].quantity++
    orderStore.calculateItemTotal(index)
  }
}

const decreaseQty = (item) => {
  const index = cartItems.value.findIndex((i) => i.itemId === item.id)
  if (index !== -1 && orderStore.cartItems[index].quantity > 1) {
    orderStore.cartItems[index].quantity--
    orderStore.calculateItemTotal(index)
  }
}

// -----------------TO OPEN THE CHECKOUT MODAL---------------------
const showCheckoutModal = ref(false)

function openCheckoutModal() {
  showCheckoutModal.value = true
}

function closeCheckoutModal() {
  showCheckoutModal.value = false
}

// -----------------TO OPEN THE EDIT MODAL-------------------------

const selectedItemWithArticlesOptionsGroups = ref({})
const showMenuModal = ref(false)
const isEdit = ref(false)
const isLoading = ref(false)
const { init } = useToast()

const getMenuOptions = async (selectedItem) => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  isEdit.value = true
  try {
    console.log('edit response', selectedItem)
    const response = await axios.get(`${url}/menuItemvoById/${selectedItem.itemId}`)

    const articlesOptionsGroups = response.data.articlesOptionsGroups

    // Assign item with groups only if data is returned
    selectedItemWithArticlesOptionsGroups.value = {
      ...selectedItem,
      articlesOptionsGroups: articlesOptionsGroups || [],
    }

    console.log('selectedItemWithArticlesOptionsGroups', selectedItemWithArticlesOptionsGroups.value)

    // Open modal if there are any groups
    if (articlesOptionsGroups && articlesOptionsGroups.length) {
      openMenuModal()
    }
  } catch (error) {
    init({ message: 'Something went wrong', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}
function openMenuModal() {
  showMenuModal.value = true
}
function closeMenuModal() {
  showMenuModal.value = false
  isEdit.value = false
}
</script>
<style>
.order-items-height {
  overflow-y: auto;
  height: calc(100vh - 480px);
}
.order-items-min-height {
  overflow-y: auto;
  height: calc(100vh - 790px);
}
</style>

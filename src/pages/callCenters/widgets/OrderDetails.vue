<template>
  <div class="w-full mx-auto order-details bg-white p-4">
    <!-- Title -->
    <h2 class="font-semibold text-lg text-gray-800 border-b pb-2">Order Details</h2>

    <template v-if="items.length || offersItems.length">
      <!-- Promo Code -->
      <VaInput v-model="promoCode" class="my-4" placeholder="Promotion Code" size="small" input-class="text-sm" />

      <!-- Order Items -->
      <div :class="isCustomerOpen ? 'order-items-min-height' : 'order-items-height'">
        <div v-for="item in items" :key="item.id" class="mb-4 border-b pb-3 last:border-none">
          <div class="flex items-start justify-between">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <VaButton icon="mso-close" color="danger" size="small" class="rounded" @click="deleteItem(item)" />
              <VaButton
                icon="remove"
                :disabled="item.quantity === 1"
                color="success"
                size="small"
                class="rounded"
                @click="decreaseQty(item)"
              />
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
                  v-for="article in item.articleType"
                  :key="article"
                  class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {{ article }}
                </span>
                <span
                  v-for="option in item.subItems"
                  :key="option"
                  class="px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700': option.type === 'extra',
                    'bg-blue-100 text-blue-700': option.type === 'article',
                    'bg-red-100 text-red-700': option.type === 'hold',
                    'bg-amber-100 text-amber-700': option.type === 'modifier',
                  }"
                >
                  {{ option.text }}
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
        <div v-for="item in offersItems" :key="item.id" class="mb-4 border-b pb-3 last:border-none">
          <div class="flex items-start justify-between">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <VaButton icon="mso-close" color="danger" size="small" class="rounded" @click="deleteOffer(item)" />
            </div>

            <!-- Item Info -->
            <div class="flex-1 px-2">
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">{{ item.name }}</span>
                <VaIcon
                  name="edit"
                  size="small"
                  class="text-yellow-600 cursor-pointer"
                  @click="getOfferItems(item.fullItem)"
                />
              </div>

              <!-- Offer Options -->
              <div class="divide-y">
                <div v-for="selectedArticle in item.items" :key="selectedArticle.itemName" class="mt-2 text-xs">
                  <p class="font-semibold text-gray-700 mb-1 mt-2">{{ selectedArticle.itemName }}</p>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="option in selectedArticle.selectedOptions.flatMap((a) => a.selected)"
                      :key="option.name + option.type"
                      class="px-2 py-0.5 rounded-full text-[0.75rem]"
                      :class="{
                        'bg-green-100 text-green-700': option.type.toLowerCase() === 'extra',
                        'bg-blue-100 text-blue-700': option.type.toLowerCase() === 'article',
                        'bg-red-100 text-red-700': option.type.toLowerCase() === 'hold',
                        'bg-amber-100 text-amber-700': option.type.toLowerCase() === 'modifier',
                      }"
                    >
                      {{ formattedLabel(option) }}
                    </span>
                  </div>
                </div>
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
      <div class="text-sm mt-4 space-y-1 p-2 bg-slate-50 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-600">Subtotal:</span>
          <span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="orderType === 'delivery'" class="flex justify-between">
          <span class="text-gray-600">Delivery Fee:</span>
          <span>€{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total:</span>
          <span>€{{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Checkout -->
      <VaButton
        :disabled="!customerDetailsId || !orderType || !props.isDeliveryZoneSelected || total === 0"
        class="mt-4 w-full"
        color="success"
        size="large"
        @click="openCheckoutModal"
      >
        Checkout Order
      </VaButton>
    </template>
    <template v-else>
      <div class="mt-4 w-full">No Orders Selected</div>
    </template>
    <MenuModal
      v-model="showMenuModal"
      :item="selectedItemWithArticlesOptionsGroups"
      :category-id="selectedItemWithArticlesOptionsGroups.categoryId"
      :menu-item-id="selectedItemWithArticlesOptionsGroups.menuItemId"
      :is-edit="isEdit"
      @cancel="closeMenuModal"
      @cancelEdit="isEdit = false"
    />
    <OfferModal
      v-if="showOfferModal"
      :item="selectedItemWithArticlesOptionsGroups"
      :is-edit="isEdit"
      @cancel="closeOfferModal"
      @cancelEdit="isEdit = false"
    />
    <CheckOutModal
      v-model="showCheckoutModal"
      :delivery-fee="deliveryFee"
      :customer-details-id="customerDetailsId"
      :order-type="orderType"
      @cancel="closeCheckoutModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import MenuModal from '../modals/MenuModal.vue'
import CheckOutModal from '../modals/CheckOutModal.vue'
import OfferModal from '../modals/OfferModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'

const props = defineProps({
  isCustomerOpen: Boolean,
  customerDetailsId: [String, Number],
  orderType: String,
  deliveryFee: Number,
  isDeliveryZoneSelected: Boolean,
})

const promoCode = ref('')
const showOfferModal = ref(false)
const orderStore = useOrderStore()
const { cartItems, offerItems } = storeToRefs(orderStore)

const formattedLabel = (sel) => {
  const totalPrice = sel.price * sel.quantity
  return totalPrice > 0 ? `${sel.name} (+€${totalPrice.toFixed(2)})` : sel.name
}

const items = computed(() =>
  cartItems.value.map((item, index) => {
    const subItems = []
    let categoryId = ''
    let menuItemId = ''
    item.selectedOptions.forEach((group) => {
      menuItemId = group.menuItemId
      categoryId = group.categoryId
      group.selected.forEach((sel) => {
        subItems.push({ text: formattedLabel(sel), type: sel.type })
      })
    })

    const unitTotal = item.totalPrice / item.quantity

    return {
      id: item.itemId || index, // fallback to index if no ID
      name: item.itemName,
      quantity: item.quantity,
      basePrice: item.basePrice,
      selectionTotalPrice: item.selectionTotalPrice,
      subItems,
      unitTotal,
      total: item.totalPrice,
      fullItem: { ...item, menuItemId, categoryId },
    }
  }),
)

const offersItems = computed(() =>
  offerItems.value.map((item, index) => {
    const items = []
    const subItems = []
    item.selections.map((selection) => {
      selection.addedItems.map((addedItems) => {
        addedItems.selectedOptions.forEach((group) => {
          group.selected.forEach((sel) => {
            subItems.push({ text: formattedLabel(sel), type: sel.type })
          })
        })
      })
      items.push(...selection.addedItems)
    })
    const totalPrice = item.selectionTotalPrice ? item.price + item.selectionTotalPrice : item.price

    return {
      id: item.itemId || index,
      name: item.name,
      quantity: item.quantity,
      basePrice: item.price,
      selectionTotalPrice: item.selectionTotalPrice,
      items,
      unitTotal: totalPrice,
      total: totalPrice * item.quantity,
      fullItem: item,
    }
  }),
)

const subtotal = computed(
  () =>
    items.value.reduce((sum, item) => sum + item.total, 0) +
    offersItems.value.reduce((sum, item) => sum + item.total, 0),
)

const total = computed(() => {
  if (props.orderType === 'delivery') {
    return subtotal.value + props.deliveryFee
  } else {
    return subtotal.value
  }
})

const increaseQty = (item) => {
  const index = cartItems.value.findIndex((i) => i.itemId === item.id)
  if (index !== -1) {
    orderStore.cartItems[index].quantity++
    orderStore.calculateItemTotal(index)
  }
}

const deleteItem = (item) => {
  const index = cartItems.value.findIndex((i) => i.itemId === item.id)
  orderStore.cartItems.splice(index, 1)
  orderStore.calculateItemTotal(index)
}

const deleteOffer = (item) => {
  const index = offerItems.value.findIndex((i) => i.itemId === item.id)
  orderStore.offerItems.splice(index, 1)
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
    const response = await axios.get(`${url}/menuItemvoById/${selectedItem.itemId}`)

    const articlesOptionsGroups = response.data.articlesOptionsGroups

    // Assign item with groups only if data is returned
    selectedItemWithArticlesOptionsGroups.value = {
      ...selectedItem,
      articlesOptionsGroups: articlesOptionsGroups || [],
    }

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

const getOfferItems = async (selectedItem) => {
  selectedItemWithArticlesOptionsGroups.value = selectedItem
  openOfferModal(selectedItem)
}
function openMenuModal() {
  showMenuModal.value = true
  isEdit.value = true
}
function openOfferModal() {
  isEdit.value = true
  showOfferModal.value = true
}
function closeMenuModal() {
  showMenuModal.value = false
  isEdit.value = false
}
function closeOfferModal() {
  showOfferModal.value = false
  isEdit.value = false
}
</script>
<style>
.order-items-height {
  overflow-y: auto;
  height: calc(100vh - 500px);
}
.order-items-min-height {
  overflow-y: auto;
  height: calc(100vh - 800px);
}
</style>

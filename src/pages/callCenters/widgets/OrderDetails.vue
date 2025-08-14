<template>
  <div class="w-full">
    <h2 class="font-semibold text-md text-gray-800 border-b pb-1">Order Details</h2>
    <template v-if="items.length || offersItems.length">
      <!-- Promo Code with Button -->
      <div class="flex flex-wrap items-center gap-1 mt-3 mb-3 w-full">
        <!-- Promo Code Field -->
        <VaInput
          v-model="promoCode"
          placeholder="Promotion Code"
          size="small"
          class="flex-1 min-w-[200px]"
          input-class="text-xs pr-6"
        >
          <template #appendInner>
            <VaIcon v-if="promoCode" name="close" color="danger" class="cursor-pointer" @click="clearPromoCode" />
          </template>
        </VaInput>

        <!-- Select Button -->
        <VaButton
          size="small"
          :style="{ '--va-background-color': outlet.primaryColor }"
          class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs shadow-md"
          @click="openPromotionModal"
        >
          Select
        </VaButton>
      </div>

      <!-- Order Items -->
      <!-- <div :class="isCustomerOpen ? 'order-items-min-height' : 'order-items-height'"> -->
      <div :style="orderItemsStyle">
        <div v-for="item in items" :key="item.id" class="mb-2 border-b pb-2 last:border-none">
          <div class="flex items-start justify-between">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <VaButton icon="mso-close" color="danger" size="small" class="rounded" @click="deleteItem(item)" />
              <VaButton
                icon="remove"
                :disabled="item.quantity === 1"
                :style="{ '--va-background-color': outlet.primaryColor }"
                size="small"
                class="rounded"
                @click="decreaseQty(item)"
              />
              <VaBadge :text="item.quantity" color="secondary" size="large" class="!py-1 !h-[2rem]" />
              <VaButton
                icon="add"
                :style="{ '--va-background-color': outlet.primaryColor }"
                size="small"
                class="rounded"
                @click="increaseQty(item)"
              />
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
                    'bg-green-100 text-green-700': option.type.toLowerCase() === 'extra',
                    'bg-blue-100 text-blue-700': option.type.toLowerCase() === 'article',
                    'bg-red-100 text-red-700': option.type.toLowerCase() === 'hold',
                    'bg-amber-100 text-amber-700': option.type.toLowerCase() === 'modifier',
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
        <div v-for="item in offersItems" :key="item.id" class="mb-3 border-b pb-2 last:border-none">
          <div class="flex items-start justify-between">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <VaButton icon="mso-close" color="danger" size="small" class="rounded" @click="deleteOffer(item)" />
            </div>

            <!-- Item Info -->
            <div class="flex-1 px-2">
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800"
                  >{{ item.name }}
                  <span class="font-semibold text-gray-700 mb-1 mt-2">
                    <span v-if="Number(item.basePrice) > 0" class="text-xs font-normal text-gray-500">
                      (€{{ Number(item.basePrice).toFixed(2) }})
                    </span>
                  </span>
                </span>

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
                  <p class="font-semibold text-gray-800 mt-1 flex items-center gap-2">
                    <span class="mb-1">{{ selectedArticle.itemName }}</span>
                    <span v-if="Number(selectedArticle.basePrice) > 0" class="text-xs font-normal text-gray-500">
                      (€{{ Number(selectedArticle.basePrice).toFixed(2) }})
                    </span>
                  </p>

                  <div class="flex flex-wrap gap-1">
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
      <div class="text-xs space-y-1 p-1 bg-slate-50 mb-0">
        <div class="flex justify-between">
          <span class="text-gray-600 text-md">Subtotal:</span>
          <span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="orderType === 'delivery'" class="flex justify-between">
          <span class="text-gray-600">Delivery Fee:</span>
          <span>€{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-md pt-1 border-t">
          <span>Total:</span>
          <span>€{{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Checkout -->
      <VaButton
        :disabled="!customerDetailsId || !orderType || !props.isDeliveryZoneSelected || total === 0"
        class="mt-1 w-full"
        color="success"
        :style="{ '--va-background-color': outlet.primaryColor }"
        size="medium"
        @click="openCheckoutModal"
      >
        Checkout Order
      </VaButton>
    </template>
    <template v-else>
      <div class="mt-4 w-full">No Orders Selected</div>
    </template>
    <MenuModal
      v-if="showMenuModal"
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
      :date-selected="dateSelected"
      :delivery-fee="deliveryFee"
      :customer-details-id="customerDetailsId"
      :order-type="orderType"
      :promo-code="promoCode"
      @cancel="closeCheckoutModal"
    />
    <PromotionModal
      v-if="showPromotionModal"
      :promotion="promotionData"
      @cancel="closePromotionModal"
      @selectCode="onCodeSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useServiceStore } from '@/stores/services.ts'
import MenuModal from '../modals/MenuModal.vue'
import CheckOutModal from '../modals/CheckOutModal.vue'
import OfferModal from '../modals/OfferModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
import PromotionModal from '../modals/PromotionModal.vue'

const props = defineProps({
  isCustomerOpen: Boolean,
  customerDetailsId: [String, Number],
  orderType: String,
  deliveryFee: Number,
  isDeliveryZoneSelected: Boolean,
  dateSelected: String,
})
const serviceStore = useServiceStore()

const promoCode = ref('')
const promotionData = ref(null)
const showPromotionModal = ref(false)
const showOfferModal = ref(false)
const orderStore = useOrderStore()
const { cartItems, offerItems } = storeToRefs(orderStore)

const formattedLabel = (sel) => {
  const totalPrice = sel.price * sel.quantity
  return totalPrice > 0 ? `${sel.name} (+€${totalPrice.toFixed(2)})` : sel.name
}

const orderItemsStyle = computed(() => {
  if (props.isCustomerOpen) {
    if (props.orderType === 'delivery') {
      return { height: 'calc(100vh - 630px)', overflowY: 'auto' }
    } else if (props.orderType === 'takeaway') {
      return { height: 'calc(100vh - 610px)', overflowY: 'auto' }
    }
  } else {
    if (props.orderType === 'delivery') {
      return { height: 'calc(100vh - 398px)', overflowY: 'auto' }
    } else if (props.orderType === 'takeaway') {
      return { height: 'calc(100vh - 380px)', overflowY: 'auto' }
    }
  }
  return {}
})

const outlet = computed(() => {
  const servicesStore = useServiceStore()
  return servicesStore.restDetails || {}
})

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
      id: item.itemId || index,
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

async function openPromotionModal() {
  const url = import.meta.env.VITE_API_BASE_URL
  try {
    const { data } = await axios.get(`${url}/promotions?outletId=${serviceStore.selectedRest}`)
    console.log('Promotion Data:', data)

    const validPromotions = data.data.filter((promo) => promo.availableAtCC)

    if (validPromotions.length > 0) {
      promotionData.value = validPromotions
      showPromotionModal.value = true
    } else {
      init({ message: 'No valid promotions available at Call Center.', color: 'danger' })
    }
  } catch (error) {
    init({ message: 'Invalid or expired promotion code.', color: 'danger' })
  }
}
function onCodeSelected(code) {
  promoCode.value = code
  showPromotionModal.value = false
}
function clearPromoCode() {
  promoCode.value = ''
}

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
// function openPromotionModal() {
//   showPromotionModal.value = true
// }
function closeMenuModal() {
  showMenuModal.value = false
  isEdit.value = false
}
function closeOfferModal() {
  showOfferModal.value = false
  isEdit.value = false
}
function closePromotionModal() {
  showPromotionModal.value = false
}
</script>
<style>
/* .order-items-height,
.order-items-min-height {
  overflow-y: auto;
  background: #fff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.order-items-height {
  overflow-y: auto;
  height: calc(100vh - 380px);
}
.order-items-min-height {
  overflow-y: auto;
  height: calc(100vh - 610px);
} */
</style>

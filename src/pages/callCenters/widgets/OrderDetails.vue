<template>
  <div class="w-full">
    <h2 class="font-semibold text-md text-gray-800 border-b pb-1">
      Order Details {{ orderStore.editOrder ? '(Edit - ' + orderStore.editOrder.tableNumber + ')' : '' }}
      <VaButton
        v-if="orderStore.editOrder"
        size="small"
        color="danger"
        class="text-white px-1 rounded-md text-xs shadow-md"
        @click="orderStore.resetEditOrder(), orderStore.setCartItems([])"
      >
        Remove Edit Order
      </VaButton>
    </h2>
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
          @keypress.enter="applyPromoCode"
        >
          <template #appendInner>
            <VaIcon v-if="isPromoValid" name="close" color="danger" class="cursor-pointer" @click="clearPromoCode" />
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
            <div class="flex flex-col items-end">
              <!-- Show both prices if promo applied -->
              <template v-if="promoTotal && promoMenuItemPrice(item) !== item.total.toFixed(2)">
                <span class="original-price"> €{{ item.total.toFixed(2) }} </span>
                <span v-if="promoMenuItemPrice(item) >= 0" class="updated-price">
                  €{{ promoMenuItemPrice(item) ? promoMenuItemPrice(item) : 0 }}
                </span>
              </template>
              <template v-else>
                <span class="font-semibold text-green-800"> €{{ item.total.toFixed(2) }} </span>
              </template>
            </div>
          </div>
        </div>
        <div v-for="(item, index) in offersItems" :key="item.id" class="mb-3 border-b pb-2 last:border-none">
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
                  @click="getOfferItems({ ...item.fullItem, index: index })"
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

                  <div class="flex flex-wrap gap-1 text-xs">
                    <span
                      v-for="option in [...selectedArticle.selectedOptions]
                        .sort((a, b) => {
                          if (a.groupName === 'SIZE') return -1
                          if (b.groupName === 'SIZE') return 1
                          if (a.groupName === 'CRUST') return b.groupName === 'SIZE' ? 1 : -1
                          if (b.groupName === 'CRUST') return a.groupName === 'SIZE' ? -1 : 1
                          return 0
                        })
                        .flatMap((a) => a.selected)"
                      :key="option.name + option.type"
                      class="px-2 py-0.5 rounded-full"
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

            <div class="flex flex-col items-end">
              <template v-if="promoOfferItemPrice(item) !== null">
                <span class="original-price">€{{ item.total.toFixed(2) }}</span>
                <span v-if="promoOfferItemPrice(item) >= 0" class="updated-price"
                  >€{{ promoOfferItemPrice(item).toFixed(2) }}</span
                >
              </template>
              <template v-else>
                <span class="font-semibold text-green-800">€{{ item.total.toFixed(2) }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- Summary -->
      <div class="text-xs space-y-1 bg-slate-50 mb-0 pl-1 pr-1">
        <div class="flex justify-between">
          <span class="text-gray-600">Subtotal:</span>
          <span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="orderType === 'delivery'" class="flex justify-between">
          <span class="text-gray-600">Delivery Fee:</span>
          <span>€{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div v-if="promoTotal" class="flex justify-between">
          <span class="text-gray-600">Total Discount:</span>
          <span>- €{{ (promoTotal.originalTotal - promoTotal.updatedTotal).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-xs pt-1 border-t">
          <span v-if="orderStore.editOrder"
            >Total:
            <span class="text-green-600">PAID AMOUNT: €{{ orderStore.editOrder.editOrderTotal.toFixed(2) }}</span>
          </span>
          <span v-else>Total:</span>
          <span v-if="orderStore.editOrder">Balance €{{ getTotalPrice }}</span>
          <span v-else-if="!promoTotal">€{{ total.toFixed(2) }}</span>
          <span v-else>€{{ promoTotal.updatedTotal.toFixed(2) }}</span>
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
      :category-id="selectedItemCategoryId"
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
      ref="promotionModal"
      v-model="showPromotionModal"
      :promotion="promotionData"
      :date-selected="dateSelected"
      :order-type="orderType"
      :delivery-fee="deliveryFee"
      :customer-details-id="customerDetailsId"
      @cancel="closePromotionModal"
      @selectCode="onCodeSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, useTemplateRef } from 'vue'
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

const promotionRef = useTemplateRef('promotionModal')
const serviceStore = useServiceStore()

const promoCode = ref('')
const promotionData = ref(null)
const showPromotionModal = ref(false)
const showOfferModal = ref(false)
const isPromoValid = ref(false)
const orderStore = useOrderStore()
const { cartItems, offerItems } = storeToRefs(orderStore)

const formattedLabel = (sel) => {
  const totalPrice = sel.price * sel.quantity
  return totalPrice > 0 ? `${sel.name} (+€${totalPrice.toFixed(2)})` : sel.name
}
function isBetween11to23(dt) {
  // 11:00 inclusive, 23:00 exclusive
  const mins = dt.getHours() * 60 + dt.getMinutes()
  return mins >= 11 * 60 && mins < 23 * 60
}

const selectedDt = computed(() => parseSelectedDate(props.dateSelected))

const isFutureTimeAllowed = computed(() => {
  if (orderFor.value !== 'future') return true
  if (!selectedDt.value) return false
  return isBetween11to23(selectedDt.value)
})

function openCheckoutModal() {
  if (!isFutureTimeAllowed.value) {
    const msg = 'Future orders must be between 11:00–23:00.'
    init({ color: 'danger', message: msg })
    return
  }
  showCheckoutModal.value = true
}

function parseSelectedDate(v) {
  // Pass-through if it’s already a Date
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v
  if (typeof v !== 'string' || !v) return null

  // Accept: 2025-10-08T16:54, 2025-10-08T16:54:00, 2025-10-08T16:54:00.000, with/without trailing Z
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?(Z)?$/)
  if (m) {
    const [, Y, M, D, h, m2, s = '0', ms = '0'] = m
    // Build as **local** time (ignore trailing Z so we don’t shift)
    return new Date(Number(Y), Number(M) - 1, Number(D), Number(h), Number(m2), Number(s), Number(ms))
  }

  // Fallback: try native, but this may shift or be invalid if timezone suffixes exist
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

const getTotalPrice = computed(() => {
  if (orderStore.editOrder) {
    if (promoTotal.value) {
      return (promoTotal.value.updatedTotal - orderStore.editOrder.editOrderTotal).toFixed(2) || 0
    } else {
      return (total.value - orderStore.editOrder.editOrderTotal).toFixed(2) || 0
    }
  }
  return total.value.toFixed(2)
})

const orderItemsStyle = computed(() => {
  let height = {}
  if (props.isCustomerOpen) {
    if (props.orderType === 'delivery') {
      height = { height: 'calc(100vh - 635px)', overflowY: 'auto' }
    } else if (props.orderType === 'takeaway') {
      height = { height: 'calc(100vh - 615px)', overflowY: 'auto' }
    }
  } else {
    if (props.orderType === 'delivery') {
      height = { height: 'calc(100vh - 395px)', overflowY: 'auto' }
    } else if (props.orderType === 'takeaway') {
      height = { height: 'calc(100vh - 375px)', overflowY: 'auto' }
    }
  }
  if (promoTotal.value) {
    height.height = `calc(${height.height} - 20px)`
  }
  return height
})

const selectedItemCategoryId = computed(() => {
  if (!selectedItemWithArticlesOptionsGroups.value) return ''
  else {
    const categoryIds = selectedItemWithArticlesOptionsGroups.value.selectedOptions
      .flatMap((a) => a.categoryId)
      .filter((a) => a)
    if (categoryIds.length) {
      return categoryIds[0]
    } else {
      return ''
    }
  }
  return selectedItemWithArticlesOptionsGroups.value.categoryId || ''
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
      menuItemId: menuItemId || item.itemId,
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
      offerId: item.offerId,
      name: item.name,
      quantity: item.quantity,
      basePrice: item.price,
      selectionTotalPrice: item.selectionTotalPrice,
      items,
      unitTotal: totalPrice,
      total: totalPrice * item.quantity,
      fullItem: { ...item, offerId: item.offerId },
      // fullItem: item,
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

const promoTotal = computed(() => {
  return orderStore.cartTotal !== null ? orderStore.cartTotal : null
})

const orderFor = computed(() => orderStore.orderFor)

const promoMenuItemPrice = function (item) {
  if (!promoTotal.value || !item) return 0
  const promoMenuItem = promoTotal.value.menuItems.filter((a) => a.menuItemId === item.id)
  if (!promoMenuItem.length) return item.total
  else {
    const miniMumPrice = Math.min(...items.value.map((p) => Number(p.total)))
    if (item.total === miniMumPrice) {
      return promoMenuItem[0].updatedPrice ? promoMenuItem[0].updatedPrice.toFixed(2) : promoMenuItem[0].updatedPrice
    } else {
      return item.total.toFixed(2)
    }
  }
}

const promoOfferItemPrice = (item) => {
  if (!promoTotal.value || !item) return null

  const promoOffers = promoTotal.value.offerDetails || []

  const offerId = item.offerId || item.fullItem?.offerId

  const promo = promoOffers.filter((a) => a.offerId === offerId)
  // Get the minimum totalPrice from the list of promo
  const miniMumPrice = Math.min(...offerItems.value.map((p) => Number(p.totalPrice)))
  if (!promo.length) return null
  const updated = Number(promo[0].totalPrice)
  if (item.totalPrice === miniMumPrice) {
    return Number(updated.toFixed(2))
  }
  return null
}

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
    const { data } = await axios.get(`${url}/cc/promotions?outletId=${serviceStore.selectedRest}`)
    console.log('Promotion Data:', data)

    const validPromotions = data.data.filter((promo) => promo.availableAtCC)

    if (validPromotions.length > 0) {
      promotionData.value = validPromotions
      showPromotionModal.value = true
    } else {
      init({ message: 'No promotions available at Call Center.', color: 'danger' })
    }
  } catch (error) {
    init({ message: 'Invalid or expired promotion code.', color: 'danger' })
  }
}

async function applyPromoCode() {
  if (!promoCode.value) {
    init({ message: 'Please enter a promotion code.', color: 'warning' })
    return
  }
  if (props.orderType === 'takeaway' && !props.isDeliveryZoneSelected) {
    init({ message: 'Please select a delivery zone first.', color: 'warning' })
    return
  }
  if (!props.customerDetailsId) {
    init({ message: 'Please select a customer first.', color: 'warning' })
    return
  }
  if (total.value === 0) {
    init({ message: 'Cart is empty. Please add items to the cart.', color: 'warning' })
    return
  }

  let menuItems = []
  menuItems = orderStore.cartItems.map((e) => {
    return {
      menuItem: e.itemId,
      quantity: e.quantity,
      options: e.selectedOptions.flatMap((group) =>
        group.selected.map((option) => ({
          option: option.optionId,
          quantity: option.quantity,
        })),
      ),
    }
  })

  const offerMenuItems = orderStore.offerItems.map((offer) => ({
    offerId: offer.offerId,
    menuItems: offer.selections.flatMap((selection) =>
      selection.addedItems.map((item) => ({
        menuItem: item.itemId,
        quantity: item.quantity || 1,
        options:
          item.selectedOptions?.flatMap((group) =>
            group.selected.map((option) => ({
              option: option.optionId,
              quantity: option.quantity,
            })),
          ) || [],
      })),
    ),
  }))

  try {
    const payload = {
      orderFor: orderFor.value,
      customerDetailId: props.customerDetailsId,
      orderType: props.orderType === 'takeaway' ? 'Takeaway' : 'Delivery',
      deliveryZoneId: orderStore.deliveryZone?._id,
      address: orderStore.address,
      menuItems,
      offerMenuItems,
      orderNotes: '',
      deliveryFee: props.deliveryFee,
      outletId: serviceStore.selectedRest,
      orderDateTime: new Date(props.dateSelected).toISOString(),
      paymentMode: '',
      promoCode: promoCode.value || '',
      hasOtherOffers: offerMenuItems.length,
    }

    const response = await orderStore.validatePromoCode(payload)

    if (response.data.success) {
      init({ message: `PromoCode selected`, color: 'success' })
      orderStore.setOrderTotal(response.data.data)
      isPromoValid.value = true
    } else {
      orderStore.setOrderTotal(null)
      init({ message: `PromoCode invalid`, color: 'danger' })
    }
  } catch (err) {
    init({ message: `PromoCode invalid`, color: 'danger' })
  }
}
function onCodeSelected(code) {
  promoCode.value = code
  isPromoValid.value = true
  showPromotionModal.value = false
}
function clearPromoCode() {
  promoCode.value = ''
  isPromoValid.value = false
  if (promotionRef.value) {
    promotionRef.value.selectedCode = ''
  }
  orderStore.setOrderTotal(null)
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
      menuItemId: selectedItem.menuItemId || selectedItem.itemId,
      categoryId: selectedItem.categoryId || response.data.categoryId,
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
.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.8rem;
}

.updated-price {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 2px;
}
</style>

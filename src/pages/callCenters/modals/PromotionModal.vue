<template>
  <VaModal
    class="big-xl-modal !p-0"
    :model-value="true"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
    @update:modelValue="emits('cancel')"
  >
    <div class="p-2">
      <h4 class="va-h4 mb-4 text-gray-800">Available Codes</h4>

      <div v-if="sortedPromotions.length" class="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        <template v-for="(promo, i) in sortedPromotions" :key="i">
          <template v-for="(code, j) in promo.codes" :key="`${i}-${j}`">
            <div
              class="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-full shadow-sm cursor-pointer"
              @click="selectCode(code)"
            >
              <span class="text-sm text-gray-800 truncate">
                <strong>{{ promo.name }}</strong> - {{ code }}
              </span>
              <VaIcon
                name="copy"
                class="ml-2 cursor-pointer text-gray-500 hover:text-primary transition"
                @click.stop="copyToClipboard(code)"
              />
            </div>
          </template>
        </template>
      </div>

      <div v-else class="text-center text-gray-500 py-6">No promotion codes available.</div>
    </div>
  </VaModal>
</template>

<script setup>
import { useToast } from 'vuestic-ui'
import { computed, ref, watch } from 'vue'
import { useOrderStore } from '@/stores/order-store'
import { useServiceStore } from '@/stores/services'

const emits = defineEmits(['cancel', 'select-code'])
const { init } = useToast()

const props = defineProps({
  promotion: {
    type: Array,
    default: () => [],
  },
  customerDetailsId: {
    type: String,
    default: '',
  },
  orderType: {
    type: String,
    default: 'delivery',
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  dateSelected: {
    type: String,
    default: new Date().toISOString(),
  },
})

const apiLoading = ref(false)
const orderStore = useOrderStore()
const serviceStore = useServiceStore()
const orderFor = computed(() => orderStore.orderFor)
const selectedCode = ref('')

const sortedPromotions = computed(() =>
  [...props.promotion].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
)

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      init({ message: 'Copied', color: 'success' })
    })
    .catch(() => {
      init({ message: 'Copy failed.', color: 'danger' })
    })
}

async function selectCode(code, hideToast = false) {
  selectedCode.value = code
  apiLoading.value = true
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
      promoCode: code || '',
      hasOtherOffers: offerMenuItems.length,
    }

    const response = await orderStore.validatePromoCode(payload)

    if (response.data.success) {
      if (!hideToast) {
        init({ message: `PromoCode selected`, color: 'success' })
      }
      orderStore.setOrderTotal(response.data.data)
      emits('select-code', code)
      emits('cancel')
    } else {
      orderStore.setOrderTotal(null)
      init({ message: `PromoCode invalid`, color: 'danger' })
    }
  } catch (err) {
    init({ message: err.response.data.message, color: 'danger' })
    console.log(err)
  } finally {
    apiLoading.value = false
  }
}

watch(
  () => orderStore.cartItems,
  () => {
    if (selectedCode.value) {
      orderStore.setOrderTotal(null) // Reset total when cart items change
      selectCode(selectedCode.value, true) // Re-validate promo code on cart change
    }
  },
  { deep: true },
)
watch(
  () => props.offerItems,
  () => {
    if (selectedCode.value) {
      orderStore.setOrderTotal(null) // Reset total when order type changes
      selectCode(selectedCode.value, true) // Re-validate promo code on order type change
    }
  },
  { deep: true },
)
watch(
  () => props.orderType,
  () => {
    if (selectedCode.value) {
      orderStore.setOrderTotal(null) // Reset total when order type changes
      selectCode(selectedCode.value, true) // Re-validate promo code on order type change
    }
  },
)
defineExpose({ selectedCode, selectCode })
</script>

<template>
  <VaModal
    v-model="showCheckoutModal"
    no-dismiss
    class="big-xl-modal"
    size="large"
    :mobile-fullscreen="false"
    hide-default-actions
    :close-button="!redirectUrl"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 min-h-screen">
      <!-- Order Summary -->
      <div class="md:col-span-1">
        <div class="p-6">
          <h3 class="summary-title">Order Summary</h3>

          <div class="order-items">
            <div v-for="(item, index) in orderStore.cartItems" :key="item.itemId" class="order-item">
              <div class="item-main">
                <div class="item-details">
                  <div class="item-qty-name">{{ item.quantity }}x {{ item.itemName }}</div>
                  <div class="item-base-price">Base price: €{{ item.basePrice.toFixed(2) }} each</div>
                </div>
                <div class="item-total-price">€{{ item.totalPrice.toFixed(2) }}</div>
              </div>

              <div v-if="item.selectedOptions.length" class="item-extras">
                <div v-for="group in item.selectedOptions" :key="group.groupId">
                  <span v-for="extra in group.selected" :key="extra.optionId">
                    <div class="extra-item">
                      <span class="extra-name">+ {{ extra.name }}</span>
                      <span class="extra-price">+€{{ (extra.price * extra.quantity).toFixed(2) }}</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>

            <div v-for="(item, index) in orderStore.offerItems" :key="item.itemId" class="order-item">
              <div class="item-main">
                <div class="item-details">
                  <div class="item-qty-name">{{ item.name }}</div>
                  <div class="item-base-price">
                    Base price: €{{ item.price.toFixed(2) }} + €{{ item.selectionTotalPrice.toFixed(2) }} for addons
                  </div>
                </div>
                <div class="item-total-price">€{{ item.totalPrice.toFixed(2) }}</div>
              </div>

              <!-- Show selected items inside each offer -->
              <div v-if="item.selections?.length" class="item-extras">
                <div v-for="(selection, sIndex) in item.selections" :key="sIndex" class="selection-group">
                  <div
                    v-for="(addedItem, aIndex) in selection.addedItems"
                    :key="`${addedItem.itemId}-${aIndex}`"
                    class="extra-item"
                  >
                    <div class="extra-name font-medium text-gray-800">+ {{ addedItem.itemName }}</div>
                    <div v-if="addedItem.selectedOptions?.length" class="pl-4 pt-1 text-sm text-gray-600">
                      <div v-for="group in addedItem.selectedOptions" :key="group.groupId">
                        <div
                          v-for="option in group.selected"
                          :key="option.optionId"
                          class="flex justify-between text-sm"
                        >
                          <span>↳ {{ option.name }}</span>
                          <span>+€{{ (option.price * option.quantity).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>€{{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="orderType === 'delivery'" class="total-row">
              <span>Delivery Fee:</span>
              <span>€{{ deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="total-row total-final">
              <span>Total Amount:</span>
              <span>€{{ (totalAmount + deliveryFee).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Payment Section -->
      <div v-if="!redirectUrl" class="md:col-span-2">
        <div class="bg-white shadow-md">
          <div class="header-container">
            <h3 class="payment-header">Complete Order</h3>
          </div>

          <div class="payment-content">
            <div class="payment-section">
              <div
                class="payment-options flex flex-col sm:flex-row sm:justify-center min-[640px]:grid min-[640px]:grid-cols-2"
              >
                <div
                  v-for="payment in paymentTypes.filter((a) => userDetails.paymentType.includes(a.paymentTypeId))"
                  :key="payment.paymentTypeId"
                  class="payment-option"
                  :class="selectedPayment == payment ? 'selected' : ''"
                  @click="selectedPayment = payment"
                >
                  <div v-if="payment.name === 'Cash'" class="payment-icon">💵</div>
                  <div v-else class="payment-icon">💳</div>
                  <div class="payment-label">{{ payment.name }}</div>
                  <div v-if="payment.name === 'Cash'" class="payment-desc">Pay with cash on delivery or pickup</div>
                  <div v-else class="payment-desc">Secure payment with Visa/Mastercard</div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-container">
            <button
              id="confirmBtn"
              :disabled="apiLoading || !selectedPayment"
              class="btn btn-primary"
              @click="createOrder"
            >
              <span v-if="!apiLoading" id="btnText">
                {{ orderId && selectedPayment === 'Card' ? 'Retry Payment' : '   Payment' }}</span
              >
              <div v-if="apiLoading" id="loadingSpinner" class="loading-spinner animate-spin"></div>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="col-span-2 px-5 flex items-center px-10 py-10 bg-white">
        <iframe :src="redirectUrl" width="100%" height="100%" />
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { useOrderStore } from '@/stores/order-store'
import { useUsersStore } from '@/stores/users'
import { useServiceStore } from '@/stores/services'
import { storeToRefs } from 'pinia'
import { elements } from 'chart.js'
import axios from 'axios'
const showCheckoutModal = ref(true)
const selectedPayment: any = ref(null)
const apiLoading = ref(false)
const emits = defineEmits(['cancel'])
const { init } = useToast()
const props = defineProps<{
  deliveryFee: number
  customerDetailsId: string
  orderType: string
}>()
const orderStore = useOrderStore()
const serviceStore = useServiceStore()
const userStore = useUsersStore()
const orderId: any = ref('')
const orderResponse: any = ref('')
const redirectUrl = computed(() => orderStore.redirectUrl)
const userDetails = computed(() => userStore.userDetails)
const checkInterval: any = ref('')
const paymentTypes: any = ref([])

const getPaymentOptions = () => {
  const url = import.meta.env.VITE_API_BASE_URL
  axios.get(`${url}/payments?outletId=${serviceStore.selectedRest}`).then((response) => {
    paymentTypes.value = response.data.data.filter((a) => a.callCenter)
  })
}

watch(
  () => showCheckoutModal.value,
  (val) => {
    if (!val) emits('cancel')
  },
  { immediate: true },
)

watch(
  () => serviceStore.selectedRest,
  (val) => {
    if (val) {
      getPaymentOptions()
    }
  },
  { immediate: true },
)
function setInter() {
  checkInterval.value = setInterval(() => {
    const iframe = document.querySelector('iframe')
    if (iframe && iframe.contentWindow) {
      try {
        const currentUrl = iframe.contentWindow.location.href
        if (currentUrl.includes('loader')) {
          checkPaymentStatus(orderId.value, selectedPayment.value.paymentTypeId)
          resetInter()
          apiLoading.value = false
        }
      } catch (e) {
        // Handle cross-origin errors silently
      }
    }
  }, 2000)
}
function resetInter() {
  // Clear interval when component unmounts
  clearInterval(checkInterval.value)
}
// Computed total values
const subtotal = computed(() => {
  return (
    orderStore.cartItems.reduce((acc, item) => acc + item.totalPrice, 0) +
    orderStore.offerItems.reduce((acc, item) => acc + item.price + item.selectionTotalPrice, 0)
  )
})

const totalAmount = computed(() => {
  return subtotal.value
})

async function checkPaymentStatus(requestId, paymentId) {
  const response = await orderStore.checkPaymentStatus(requestId, paymentId)
  if (response.data.data.status === 'Completed') {
    init({
      color: 'success',
      message: 'Payment Success',
    })
    try {
      await orderStore.sendOrderToWinmax(requestId)
      init({
        color: 'success',
        message: 'Order sent to Winmax',
      })
      setTimeout(() => {
        orderStore.cartItems = []
        window.location.reload()
      }, 800)
    } catch (err) {
      init({
        color: 'danger',
        message: err.response.data.error,
      })
      orderStore.setPaymentLink('')
      orderResponse.value = ''
      orderId.value = ''
    }
  } else {
    init({
      color: 'danger',
      message: response.data.message,
    })
    orderStore.setPaymentLink('')
  }
}

async function createOrder() {
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

  orderStore.offerItems.forEach(({ ...element }) => {
    console.log(element)
    element.selections.forEach((selectedItems) => {
      selectedItems.addedItems.forEach((addedItems) => {
        menuItems.push({
          menuItem: addedItems.itemId,
          quantity: 1,
          options: addedItems.selectedOptions.flatMap((group) =>
            group.selected.map((option) => ({
              option: option.optionId,
              quantity: option.quantity,
            })),
          ),
        })
      })
    })
  })
  try {
    const payload = {
      customerDetailId: props.customerDetailsId,
      orderType: props.orderType === 'takeaway' ? 'Takeaway' : 'Delivery',
      deliveryZoneId: orderStore.deliveryZone,
      address: orderStore.address,
      menuItems: menuItems,
      orderNotes: '',
      deliveryFee: props.deliveryFee,
      outletId: serviceStore.selectedRest,
      orderDateTime: new Date(Date.now() + 2 * 60 * 1000).toLocaleString('en-US', { timeZone: 'UTC' }),
      paymentMode: selectedPayment.value,
    }

    let response: any = ''
    if (orderId.value) {
      response = await orderStore.retryPayment(orderId.value)
    } else {
      orderResponse.value = await orderStore.createOrder(payload)
      console.log(selectedPayment.value)
      response = await orderStore.createPayment({
        orderId: orderResponse.value.data.data._id,
        paymentTypeId: selectedPayment.value?.paymentTypeId,
      })
    }

    if (response.status === 201 || response.status === 200) {
      if (!orderId.value) {
        init({ color: 'success', message: 'Order created.' })
      }

      if (selectedPayment.value.paymentGateway) {
        orderStore.setPaymentLink(response.data.data.redirectUrl)
        orderId.value = response.data.data.requestId
        setInter()
      } else {
        try {
          await orderStore.sendOrderToWinmax(orderResponse.value.data.data._id)
          init({
            color: 'success',
            message: 'Order sent to Winmax',
          })
          setTimeout(() => {
            orderStore.cartItems = []
            window.location.reload()
          }, 800)
        } catch (err) {
          init({
            color: 'danger',
            message: err.response.data.error,
          })
          orderStore.setPaymentLink('')
          orderResponse.value = ''
          orderId.value = ''
        }
      }
    } else {
      throw new Error(response.data?.message || 'Something went wrong')
    }
  } catch (err: any) {
    // Handle error — show toast
    init({
      color: 'danger',
      message: err?.message || 'Order failed, please try again.',
    })

    // If backend returns partial data like requestId, save it for retry
    if (err?.response?.data?.data?.requestId) {
      orderId.value = err.response.data.data.requestId
    }

    orderStore.setPaymentLink('')
  } finally {
    apiLoading.value = false
  }
}
</script>

<style scoped>
.order-items {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-item {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.item-extras {
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
}

.item-details {
  flex: 1;
}

.item-qty-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.item-base-price {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.item-total-price {
  font-size: 18px;
  font-weight: 700;
  color: #2d5d2a;
}

.extra-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
}

.extra-name {
  color: #374151;
}

.extra-price {
  color: #2d5d2a;
  font-weight: 500;
}

.summary-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d5d2a;
  margin-bottom: 20px;
}

.summary-totals {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 15px;
}

.total-row:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.total-final {
  font-weight: 700;
  font-size: 20px;
  color: #2d5d2a;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #2d5d2a;
}

/* payment section styling */
.payment-header {
  font-size: 22px;
  font-weight: 600;
  color: #2d5d2a;
  margin-bottom: 24px;
  text-align: left;
  /* margin-left: 396px; */
}

.header-container {
  background: #ffffff;
  border-bottom: 2px solid #e5e7eb;
  padding: 24px 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.payment-content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  /* margin-left: 380px; */
}

.payment-section {
  flex: 1;
}

.payment-options {
  /* display: grid;
    grid-template-columns: 1fr 1fr; */
  gap: 20px;
  margin-bottom: 32px;
  margin-top: 0;
}

.card-form {
  /* display: none; */
  animation: slideDown 0.3s ease-out;
}

.payment-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  background: white;
}

.payment-icon {
  font-size: 36px;
  margin-bottom: 16px;
  display: block;
}

.payment-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.payment-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.security-note {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  font-size: 14px;
  color: #0369a1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group.card-number {
  flex: 2;
}

.form-group.quarter {
  flex: 1;
}

.form-group.half {
  flex: 4;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #2d5d2a;
  box-shadow: 0 0 0 3px rgba(45, 93, 42, 0.1);
}

.form-group {
  flex: 1;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
}

.checkbox.checked {
  background: #2d5d2a;
  border-color: #2d5d2a;
  color: white;
}

.checkbox-label {
  font-size: 15px;
  color: #374151;
  cursor: pointer;
}

.payment-option.selected {
  border-color: #2d5d2a;
  background: #f0f7f0;
  box-shadow: 0 4px 16px rgba(45, 93, 42, 0.2);
}

.payment-option.selected::after {
  content: '✓';
  position: absolute;
  top: 16px;
  right: 16px;
  background: #2d5d2a;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.payment-option:hover {
  border-color: #2d5d2a;
  box-shadow: 0 4px 12px rgba(45, 93, 42, 0.1);
  transform: translateY(-2px);
}

/* .action-container {
    background: #f9fafb;
    padding: 24px 32px;
    border-top: 2px solid #e5e7eb;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
} */

.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  min-width: 200px;
}

.btn-primary {
  background: linear-gradient(135deg, #2d5d2a 0%, #1f4a1d 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(45, 93, 42, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 93, 42, 0.4);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modal-body-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  /* ensure modal does not exceed viewport */
}

.action-container {
  position: sticky;
  bottom: 0;
  background: #f9fafb;
  padding: 24px 32px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
}

/* .form-input {
    @apply border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500;
} */

.va-modal__close {
  background: #f8f9fa;
  padding: 7px 10px;
  border-radius: 240px;
  font-size: 13px !important;
  height: 32px !important;

  margin-right: 10px;
  margin-top: 10px;

  @media (min-width: 640px) {
    margin-right: 20px;
    margin-top: 10px;
  }
}

:root {
  --va-modal-padding-top: 0rem;
  --va-modal-padding-right: 0rem;
  --va-modal-padding-bottom: 0rem;
  --va-modal-padding-left: 0rem;
}

:root .va-modal__message {
  margin-bottom: 0px !important;
}
</style>

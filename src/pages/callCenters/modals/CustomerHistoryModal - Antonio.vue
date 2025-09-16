<template>
  <VaModal
    :model-value="true"
    size="large"
    close-button
    hide-default-actions
    :mobile-fullscreen="false"
    class="big-xl-xl-modal"
    @update:modelValue="$emit('close')"
  >
    <!-- HEADER -->
    <h3 class="w-full bg-gray-900 text-white p-6">
  <div class="flex flex-col md:flex-row md:items-center gap-8 w-full">
    <!-- LEFT: Title + Customer -->
    <div class="flex flex-col flex-shrink-0">
      <span class="text-sm uppercase tracking-wider text-gray-400 pb-1 border-b-2 border-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
        Order History
      </span>

      <span class="text-4xl font-extrabold text-white mt-2 tracking-tight drop-shadow-lg">
        {{ customer?.Name || 'Unknown' }}
      </span>

      <span
        v-if="customer?.Phone"
        class="text-2xl text-gray-300 font-bold mt-1">
        {{ customer.Phone }}
      </span>
    </div>

    <!-- CENTER: buttons & stats -->
    <div class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-16 w-full">
        <!-- Time Period Buttons (4x1) -->
        <div class="grid grid-cols-2 gap-3">
          <button
  v-for="period in ['1 Month', '3 Months', '6 Months', '12 Months']"
  :key="period"
  @click="selectedPeriod = period"
  :class="[
    'px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300',
    selectedPeriod === period
      ? 'bg-gray-300 text-black'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
  ]"
>
  {{ period }}
</button>

        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-gray-300 w-full">
          <div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
  <span class="text-sm font-bold mb-1 text-blue-400">Last Ordered:</span>
  <span class="text-lg font-semibold">
    {{ lastOrdered.daysAgo }}
    <span class="text-xs text-gray-400">{{ lastOrdered.fullDate }}</span>
  </span>
</div>  
<div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
  <span class="text-sm font-bold mb-1 text-purple-400">Total:</span>
  <span class="text-lg font-semibold">
    € {{ totalStats.total.toFixed(2) }}
    <span class="text-xs text-gray-400">({{ totalStats.count }} Orders)</span>
  </span>
</div>

          <div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
            <span class="text-sm font-bold mb-1 text-pink-400">Average Order:</span>
            <span class="text-lg font-semibold">€45.90 <span class="text-xs text-gray-400">(6 Items)</span></span>
          </div>
          <div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
            <span class="text-sm font-bold mb-1 text-green-400">Type:</span>
            <span class="text-lg font-semibold">Takeaway: 7 <span class="text-xs text-gray-400 ml-1">(70%)</span> / Delivery: 3 <span class="text-xs text-gray-400 ml-1">(30%)</span></span>
          </div>
          <div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
            <span class="text-sm font-bold mb-1 text-yellow-400">Promo Codes:</span>
            <span class="text-lg font-semibold">4 <span class="text-xs text-gray-400">(40%)</span></span>
          </div>
          <div class="bg-gray-800 bg-opacity-30 rounded-xl p-3 flex flex-col items-start hover:shadow-neon transition">
            <span class="text-sm font-bold mb-1 text-red-500">Complaints:</span>
            <span class="text-lg font-semibold">2 <span class="text-xs text-gray-400">(20%)</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</h3>

    <!-- LOADING -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <VaSpinner size="large" color="primary" />
    </div>

    <!-- NO ORDERS -->
    <div v-else-if="orders && orders.length === 0" class="text-center text-gray-500 py-4">
      No previous orders found for this customer.
    </div>


    <!-- Orders List -->
    <div v-else class="p-3 bg-white">
      <div
        v-for="(order, index) in orders"
        :key="order._id"
        class="order-card border rounded-lg mb-3 shadow-sm relative"
        :style="{ paddingLeft: order.orderFor === 'future' ? '65px' : '0px' }"
      >
        <!-- GREEN RIBBON FOR FUTURE ORDER -->
        <div v-if="order.orderFor === 'future'" class="future-ribbon">
          <span>Future</span>
          <span>Order</span>
        </div>
        <div
          class="flex justify-between items-center p-4 cursor-pointer transition"
          :class="{
            'bg-gray-100': expandedIndex === index,
          }"
          @click="toggleOrder(index)"
        >
          <!-- LEFT DETAILS -->
          <div class="flex items-center gap-8 font-semibold">
            <div>
              <span class="block"
                >Order Number: <span class="font-bold">{{ order.tableNumber }}</span>
              </span>
              <span class="text-xs text-gray-500"
                >{{ formatDateTime(order.createdAt) }} •
                <template v-if="order.orderFor === 'future'">
                  {{ formatDateTime(order.orderDateTime) }}
                </template>
                <template v-else>
                  {{ getPromisedTime(order.createdAt, order.orderType) }}
                </template>
              </span>
            </div>
            <div class="border-l border-gray-300 h-6"></div>

            <div>
              <span class="block"
                >Total: <span class="font-bold">€ {{ order.total.toFixed(2) }}</span></span
              >
              <span class="text-xs text-gray-500">{{ order.paymentMode }} • {{ order.menuItems.length }} items</span>
            </div>
            <div class="border-l border-gray-300 h-6"></div>

            <div>
              <span class="block"
                >Outlet: <span class="font-bold">{{ getDeliveryZoneName(order.deliveryZoneId) }}</span></span
              >
              <span class="text-xs text-gray-500">
                {{ order.orderType }}
                <template v-if="order.orderType === 'Delivery' && order.address"> • {{ order.address }} </template>
              </span>
            </div>
            <div class="border-l border-gray-300 h-6"></div>

            <div>
              <span class="block"
                >Origin: <span class="font-bold">{{ getOrderSource(order.orderSource) }}</span></span
              >
              <span class="text-xs text-gray-500">{{ getTheEmployeeName(order.outletEmployee) }}</span>
            </div>
          </div>

          <span
            class="px-2 py-1 rounded shadow font-semibold"
            :class="{
              'bg-green-100 text-green-700': order.status === 'Completed',
              'bg-yellow-100 text-yellow-700': order.status === 'In Progress',
              'bg-red-100 text-red-700': order.status === 'Cancelled',
            }"
          >
            {{ order.status }}
          </span>
        </div>

        <!-- EXPANDABLE ARTICLE LIST -->
        <div v-if="expandedIndex === index" class="bg-white px-6 pb-4 border-t border-gray-200">
          <div
            v-for="(item, idx) in order.menuItems || []"
            :key="idx"
            class="flex justify-between items-start py-2 border-b last:border-none cursor-pointer relative"
            :class="{
              'bg-gray-50': isItemSelected(order._id, idx),
              'hover:bg-gray-50': true,
            }"
            @click="toggleItemSelect(order._id, idx)"
          >
            <!-- Checkbox only when selected -->
            <div v-if="isItemSelected(order._id, idx)" class="absolute left-2 top-1/2 -translate-y-1/2">
              <VaCheckbox
                :model-value="true"
                color="primary"
                :readonly="true"
                class="pointer-events-none"
                @click.stop
              />
            </div>

            <div
              class="flex flex-wrap items-center gap-2 pl-8"
              :class="isItemSelected(order._id, idx) ? 'pl-8' : 'pl-0'"
            >
              <p class="font-semibold text-xs">
                {{ item.quantity }} x {{ item.menuItem }}
                <span
                  v-if="item.extra"
                  class="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-normal"
                >
                  {{ item.extra }}</span
                >
              </p>

              <div class="flex flex-wrap gap-1 text-xs">
                <span
                  v-for="addon in item.options || []"
                  :key="addon.name"
                  class="px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700': addon.type.toLowerCase() === 'extra',
                    'bg-blue-100 text-blue-700': addon.type.toLowerCase() === 'article',
                    'bg-red-100 text-red-700': addon.type.toLowerCase() === 'hold',
                    'bg-amber-100 text-amber-700': addon.type.toLowerCase() === 'modifier',
                  }"
                >
                  {{ addon.name }}
                  <span v-if="addon.price > 0">(€{{ addon.price.toFixed(2) }})</span>
                </span>
              </div>
            </div>

            <span class="font-bold">€ {{ getTotalPrice(item) }}</span>
          </div>

          <!-- Totals -->
          <div class="mt-2 space-y-1 text-xs">
            <div v-if="order.discount > 0" class="border-b pb-1">
              <div class="flex justify-end gap-16">
                <span class="font-semibold">SubTotal:</span>
                <span class="font-bold">€ {{ order.subtotal.toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="order.discount > 0" class="border-b pb-1">
              <div class="flex justify-end gap-16">
                <span class="font-semibold">Discount Amount:</span>
                <span class="font-bold">-€ {{ order.discount.toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="order.orderType === 'Delivery' && order.deliveryFee > 0" class="border-b pb-1">
              <div class="flex justify-end gap-16">
                <span class="font-semibold">Delivery Fee:</span>
                <span class="font-bold">€ {{ order.deliveryFee.toFixed(2) }}</span>
              </div>
            </div>

            <div>
              <div class="flex justify-end gap-16">
                <span class="font-semibold">Total:</span>
                <span class="font-bold">€ {{ order.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              class="px-3 py-1 rounded-full bg-red-500 text-white font-semibold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!hasSelectedForOrder(order._id)"
              @click="openConfirm('remove', order._id)"
            >
              Remove
            </button>

            <button
              class="px-3 py-1 rounded-full bg-yellow-400 text-xs text-white font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!hasSelectedForOrder(order._id)"
              @click="openConfirm('edit', order._id)"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </VaModal>

  <!-- Confirmation Modal -->

  <VaModal
    v-model="isConfirmOpen"
    size="small"
    hide-default-actions
    close-button
    @update:modelValue="isConfirmOpen = $event"
  >
    <div class="text-sm text-gray-700 py-1">
      Are you sure you want to
      <span class="font-bold capitalize">{{ confirmAction }}</span>
      the selected Items?
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <VaButton class="px-2 rounded-full" preset="secondary" size="small" @click="isConfirmOpen = false"
          >Cancel</VaButton
        >
        <VaButton
          class="px-2 rounded-full"
          :color="confirmAction === 'remove' ? 'danger' : 'warning'"
          size="small"
          @click="confirmYes"
        >
          Yes
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { useUsersStore } from '@/stores/users.ts'
import { useMenuStore } from '@/stores/getMenu'

const props = defineProps({
  customer: { type: Object, required: true },
  outlet: { type: Object, required: true },
  deliveryZoneOptions: {
    type: Array,
    default: () => [],
  },
  takeawayPromiseTime: { type: Number, default: 0 },
  deliveryPromiseTime: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  selectedTab: { type: String, default: '' },
})

const emits = defineEmits(['close'])

const orders = ref([])
const users = ref([])
const expandedIndex = ref(null)
const isLoading = ref(true)
const selectedItems = reactive({})

const isConfirmOpen = ref(false)
const confirmAction = ref(null)
const confirmOrderId = ref(null)

const openConfirm = (action, orderId) => {
  confirmAction.value = action
  confirmOrderId.value = orderId
  isConfirmOpen.value = true
}

const confirmYes = () => {
  if (confirmAction.value === 'remove') {
    removeSelected(confirmOrderId.value)
  } else if (confirmAction.value === 'edit') {
    editSelected(confirmOrderId.value)
  }
  isConfirmOpen.value = false
}

const toggleItemSelect = (orderId, idx) => {
  if (!selectedItems[orderId]) {
    selectedItems[orderId] = []
  }
  const pos = selectedItems[orderId].indexOf(idx)
  if (pos > -1) {
    selectedItems[orderId].splice(pos, 1)
  } else {
    selectedItems[orderId].push(idx)
  }
}

const isItemSelected = (orderId, idx) => {
  return Array.isArray(selectedItems[orderId]) && selectedItems[orderId].includes(idx)
}

const hasSelectedForOrder = (orderId) => {
  return Array.isArray(selectedItems[orderId]) && selectedItems[orderId].length > 0
}

const removeSelected = (orderId) => {
  if (!hasSelectedForOrder(orderId)) return
  const orderIndex = orders.value.findIndex((o) => o._id === orderId)
  if (orderIndex === -1) return

  const idxs = [...selectedItems[orderId]].sort((a, b) => b - a)
  idxs.forEach((i) => {
    if (orders.value[orderIndex].menuItems && orders.value[orderIndex].menuItems[i] !== undefined) {
      orders.value[orderIndex].menuItems.splice(i, 1)
    }
  })

  selectedItems[orderId] = []
}

const editSelected = (orderId) => {
  if (!hasSelectedForOrder(orderId)) return
  const order = orders.value.find((o) => o._id === orderId)
  const items = (selectedItems[orderId] || []).map((i) => order?.menuItems?.[i]).filter(Boolean)
  console.log('Edit items for order', orderId, items)
}

const toggleOrder = (index) => {
  if (expandedIndex.value === index) {
    expandedIndex.value = null
    for (const key in selectedItems) {
      delete selectedItems[key]
    }
  } else {
    expandedIndex.value = index
    for (const key in selectedItems) {
      delete selectedItems[key]
    }
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPromisedTime = (createdAt, orderType) => {
  if (!createdAt) return 'N/A'

  const date = new Date(createdAt)

  if (orderType?.toLowerCase() === 'takeaway') {
    date.setMinutes(date.getMinutes() + (props.takeawayPromiseTime || 0))
  } else if (orderType?.toLowerCase() === 'delivery') {
    date.setMinutes(date.getMinutes() + (props.deliveryPromiseTime || 0))
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getOrderSource = (source) => {
  if (!source) return ''
  return source === 'CC' ? 'Call Center' : source
}

const getDeliveryZoneName = (deliveryZoneId) => {
  if (!deliveryZoneId || !Array.isArray(props.deliveryZoneOptions)) {
    return ''
  }
  const zone = props.deliveryZoneOptions.find((z) => z._id === deliveryZoneId)
  return zone ? zone.name : ''
}

const url = import.meta.env.VITE_API_BASE_URL

const fetchOrders = async () => {
  const menuItems = useMenuStore()
  try {
    const res = await axios.get(
      `${url}/orders/history?phone=${props.customer?.Phone}&page=1&limit=50&from=2025-01-01&status=Completed`,
    )
    if (res.data?.status === 'Success') {
      orders.value = res.data.data.items.map((order) => {
        // Map menu item IDs to names
        const detailedItems = (order.menuItems || []).map((item) => {
          const menuItem = menuItems.unFilteredMenuItems.find((mi) => mi._id === item.menuItem)
          const options = menuItem.articlesOptionsGroup.flatMap((group) => group.articlesOptions)

          return {
            ...item,
            menuItem: menuItem ? menuItem.name : 'Unknown Item',
            ...menuItem,
            options:
              item.options.map((opt) => {
                const optionDetails = options?.find((o) => o._id === opt.option)
                return {
                  ...opt,
                  ...optionDetails,
                  name: optionDetails ? optionDetails.name : 'Unknown Option',
                }
              }) || [],
          }
        })
        return {
          ...order,
          menuItems: detailedItems,
        }
      })
    } else {
      orders.value = []
    }
  } catch (error) {
    console.error('Error fetching order history:', error)
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const userStore = useUsersStore()
    const { data } = await userStore.getAll({
      page: 1,
      limit: 1000,
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
    })
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const getTheEmployeeName = (employeeId) => {
  const user = users.value.find((user) => user._id === employeeId)
  if (!user) return ''
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
}
const getTotalPrice = (item) => {
  if (!item.options.length) return item.price.toFixed(2)
  const total = item.options.reduce((sum, opt) => sum + (opt.price || 0), 0)
  console.log(total, item.price, item)
  return (total + item.price).toFixed(2)
}

const lastOrdered = computed(() => {
  if (!orders.value || !orders.value.length) return { daysAgo: 'N/A', fullDate: '' }

  const completed = orders.value.filter(o => o.status === 'Completed' && o.createdAt)
  if (!completed.length) return { daysAgo: 'N/A', fullDate: '' }

  const sorted = [...completed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const last = sorted[0]

  // compare only the calendar date part
  const lastDate = new Date(last.createdAt)
  const today = new Date()
  lastDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24))

  const daysAgoText =
    diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`

  return {
    daysAgo: daysAgoText,
    fullDate: formatDateTime(last.createdAt), // keep your existing date+time format
  }
})

const totalStats = computed(() => {
  if (!orders.value || !orders.value.length) {
    return { total: 0, count: 0 }
  }

  // include only completed orders
  const completed = orders.value.filter(o => o.status === 'Completed')

  const total = completed.reduce((sum, order) => sum + (order.total || 0), 0)
  const count = completed.length

  return { total, count }
})


onMounted(() => {
  fetchUsers()
  fetchOrders()
})
</script>
<style scoped>
.order-card {
  background: #fff;
  border: 1px solid #eee;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.opt {
  font-size: 11px;
}
.future-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 65px;
  background-color: #16a34a;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  z-index: 20;
  pointer-events: none;
}

.future-ribbon span {
  display: block;
  text-align: center;
  line-height: 18px;
}
.hover\:bg-gray-50:hover {
  background-color: #f9f9f9;
}
</style>

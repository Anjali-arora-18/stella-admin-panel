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
    <h3 class="va-h3 p-3 flex items-center gap-2">
      Order History:
      <span>
        {{ customer?.Name || 'Unknown' }}
        <span v-if="customer?.Phone">- {{ customer.Phone }} </span>
      </span>
    </h3>

    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <VaSpinner size="large" color="primary" />
    </div>

    <!-- No Orders -->
    <div v-else-if="orders && orders.length === 0" class="text-center text-gray-500 py-4">
      No previous orders found for this customer.
    </div>

    <!-- Orders List -->
    <div v-else class="p-3 bg-white">
      <div v-for="(order, index) in orders" :key="order._id" class="order-card border rounded-lg mb-3 shadow-sm">
        <div
          class="flex justify-between items-center p-4 cursor-pointer hover:bg-red-50 transition"
          @click="toggleOrder(index)"
        >
          <!-- LEFT DETAILS -->
          <div class="flex items-center gap-8 font-semibold">
            <div>
              <span class="block"
                >Order Number: <span class="font-bold">{{ order.tableNumber }}</span>
              </span>
              <span class="text-xs text-gray-500"
                >{{ formatDateTime(order.orderDateTime) }} • {{ formatOnlyTime(order.orderDispatchToWinmaxTime) }}</span
              >
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
            class="flex justify-between items-start py-2 border-b last:border-none"
          >
            <div class="flex flex-wrap items-center gap-2">
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

            <span class="font-bold">€ {{ getTotalPrice(item.options) }}</span>
          </div>
          <div class="flex justify-between items-start py-2 border-b last:border-none">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-xs">SubTotal</p>
            </div>

            <span class="font-bold">€ {{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-start py-2 border-b last:border-none">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-xs">Discount Amount</p>
            </div>

            <span class="font-bold">- € {{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-start py-2 border-b last:border-none">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-xs">Total</p>
            </div>

            <span class="font-bold">€ {{ order.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
})

const emits = defineEmits(['close'])

const orders = ref([])
const users = ref([])
const expandedIndex = ref(null)
const isLoading = ref(true)

const toggleOrder = (index) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
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

const formatOnlyTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
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

const getTheEmployeeName = (employee) => {
  return users.value.find((user) => user._id === employee)?.username
}

const getTotalPrice = (options) => {
  if (!options || !Array.isArray(options)) return '0.00'
  const total = options.reduce((sum, opt) => sum + (opt.price || 0), 0)
  return total.toFixed(2)
}

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
}

.order-card:hover {
  /* box-shadow: 0 2px 8px rgba(255, 0, 0, 0.1); */
}
.opt {
  font-size: 11px;
}
</style>

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
      <div
        v-for="(order, index) in ordersToShow"
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
          class="flex justify-between items-center p-4 cursor-pointer transition group"
          :class="{
            'bg-gray-200': expandedIndex === index,
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

          <!-- Complaints list -->
          <div v-if="order.complaint" class="ml-5 space-y-1">
            <div
              class="flex flex-col items-center text-sm text-center cursor-pointer"
              @click.stop="editComplaint(order._id, order.complaint)"
            >
              <span class="flex items-center justify-center" style="color: #de1a22">
                <VaIcon name="warning" size="24px" class="rounded-full" />
              </span>
              <span
                class="font-semibold truncate"
                style="
                  max-width: 150px;
                  display: inline-block;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                >Complaint</span
              >
            </div>
          </div>

          <div class="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition mr-5">
            <span
              v-if="!order.complaint || order.complaint === ''"
              class="flex items-center gap-1 rounded-full text-black px-2 py-1.5 font-semibold text-xs cursor-pointer"
              style="background-color: #f4f4f6"
              @click.stop="openComplaint(order._id)"
            >
              <VaIcon name="warning" color="danger" size="small" /> Add Complaint
            </span>

            <span
              size="small"
              class="flex items-center gap-1 rounded-full text-black px-2 py-1.5 font-semibold text-xs cursor-pointer"
              style="background-color: #f4f4f6"
              @click.stop="openNote(order._id, order.note)"
            >
              <VaIcon name="note" size="small" /> Add Note
            </span>

            <span
              size="small"
              class="flex items-center gap-1 rounded-full text-black px-2 py-1.5 font-semibold text-xs cursor-pointer"
              style="background-color: #f4f4f6"
              @click.stop="openConfirm('repeat', order._id)"
            >
              <VaIcon name="notes" size="small" /> Repeat Order
            </span>

            <span
              size="small"
              class="flex items-center gap-1 rounded-full text-white px-2 py-1.5 font-semibold text-xs cursor-pointer"
              style="background-color: #2d5d2a"
              @click.stop="openConfirm('add', order._id)"
            >
              <VaIcon name="add" size="small" /> Add Items
            </span>

            <span
              size="small"
              class="flex items-center gap-1 rounded-full text-white px-2 py-1.5 font-semibold text-xs cursor-pointer"
              style="background-color: #de1a22"
              @click.stop="openConfirm('cancel', order._id)"
            >
              <VaIcon name="cancel" size="small" /> Cancel Order
            </span>
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
                  v-for="addon in item.articlesOptionsGroup
                    .flatMap((a) => a.articlesOptions)
                    .filter((a) => a.selected) || []"
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
      <div v-if="orders.length > 7" class="text-center mt-5">
        <VaButton color="#2D5D2A" class="px-3 rounded-full" @click="showAll = !showAll">
          {{ showAll ? 'Show Less' : 'Load More' }}
        </VaButton>
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
    <div class="text-sm text-gray-700 py-1 pb-5">
      Are you sure you want to
      <span class="font-bold capitalize">
        {{
          confirmAction === 'repeat'
            ? 'repeat this order'
            : confirmAction === 'add'
              ? 'add items to this order'
              : confirmAction === 'cancel'
                ? 'cancel this order'
                : confirmAction === 'edit'
                  ? 'edit the selected Items'
                  : confirmAction === 'remove'
                    ? 'remove the selected Items'
                    : ''
        }}</span
      >
      ?
    </div>

    <template #footer>
      <div class="flex justify-end gap-1 mt-3">
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

  <HistoryAddNoteModal
    :is-open="showAddNoteModal"
    :order-id="selectedOrderId"
    :note="noteToEdit"
    @update:isOpen="showAddNoteModal = $event"
    @saved="handleNoteSaved"
    @updated="handleNoteUpdated"
    @removed="handleNoteRemoved"
  />
  <HistoryComplaintModal
    :is-open="showComplaintModal"
    :order-id="selectedOrderId"
    :complaint="complaintToEdit"
    @update:isOpen="
      (val) => {
        showComplaintModal = val
        if (!val) complaintToEdit = null
      }
    "
    @saved="handleComplaintSaved"
    @updated="handleComplaintUpdated"
    @removed="handleComplaintRemoved"
  />
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { useUsersStore } from '@/stores/users.ts'
import { useMenuStore } from '@/stores/getMenu'
import { useOrderStore } from '@/stores/order-store.ts'
import HistoryAddNoteModal from './HistoryAddNoteModal.vue'
import HistoryComplaintModal from './HistoryComplaintModal.vue'
import { useToast } from 'vuestic-ui'
const { init } = useToast()
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

const showAddNoteModal = ref(false)
const showComplaintModal = ref(false)
const selectedOrderId = ref(null)

const noteToEdit = ref(null)
const complaintToEdit = ref(null)

const editComplaint = (orderId, text) => {
  // Close and reset first
  showComplaintModal.value = false
  complaintToEdit.value = null

  // Reopen with fresh data
  setTimeout(() => {
    selectedOrderId.value = orderId
    complaintToEdit.value = { orderId, text }
    showComplaintModal.value = true
  }, 0)
}

const openComplaint = (orderId) => {
  selectedOrderId.value = orderId
  complaintToEdit.value = null
  showComplaintModal.value = true
}

const openNote = (orderId, note) => {
  selectedOrderId.value = orderId
  noteToEdit.value = note ? { orderId, text: note } : null
  showAddNoteModal.value = true
}

const orders = ref([])
const users = ref([])
const expandedIndex = ref(null)
const isLoading = ref(true)
const selectedItems = reactive({})

const isConfirmOpen = ref(false)
const confirmAction = ref(null)
const confirmOrderId = ref(null)

const handleComplaintSaved = async ({ orderId, text }) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (order) {
    await axios.patch(`${url}/orders/${orderId}/complaint`, { complaint: text })
    init({ message: 'Complaint updated successfully', color: 'success' })
    fetchOrders()
  }
}

const handleComplaintUpdated = async ({ orderId, text }) => {
  const order = orders.value.find((o) => o._id === orderId)

  if (order) {
    await axios.patch(`${url}/orders/${orderId}/complaint`, { complaint: text })
    init({ message: 'Complaint updated successfully', color: 'success' })
    fetchOrders()
  }
}

const handleComplaintRemoved = async ({ orderId }) => {
  const order = orders.value.find((o) => o._id === orderId)

  if (order) {
    await axios.patch(`${url}/orders/${orderId}/complaint`, { complaint: '' })
    init({ message: 'Complaint removed successfully', color: 'success' })
    fetchOrders()
  }
}

const handleNoteSaved = async ({ orderId, text }) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (order) {
    await axios.patch(`${url}/orders/${orderId}/note`, { note: text })
    init({ message: 'Note added successfully', color: 'success' })
    fetchOrders()
  }
}

const handleNoteUpdated = async ({ orderId, text }) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (order) {
    await axios.patch(`${url}/orders/${orderId}/note`, { note: text })
    init({ message: 'Note updated successfully', color: 'success' })
    fetchOrders()
  }
}

const handleNoteRemoved = async ({ orderId }) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (order) {
    await axios.patch(`${url}/orders/${orderId}/note`, { note: '' })
    init({ message: 'Note removed successfully', color: 'success' })
    fetchOrders()
  }
}

const openConfirm = (action, orderId) => {
  confirmAction.value = action
  confirmOrderId.value = orderId
  isConfirmOpen.value = true
}

const confirmYes = () => {
  if (!confirmAction.value || !confirmOrderId.value) return

  switch (confirmAction.value) {
  case 'remove':
    removeSelected(confirmOrderId.value)
    break
  case 'edit':
    editSelected(confirmOrderId.value)
    break
  case 'repeat':
    repeatOrder(confirmOrderId.value)
    break
  case 'add':
    addItemsToOrder(confirmOrderId.value)
    break
  case 'cancel':
    cancelOrder(confirmOrderId.value)
    break
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

const removeSelected = async (orderId) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (!order) return

  const items = (selectedItems[orderId] || []).map((i) => order.menuItems[i])
  if (!items.length) return

  const payload = buildOfferMenuItemsPayload(items)

  await applyOrderEdit(orderId, 'remove', order.tableNumber, payload)
  fetchOrders()
}

const editSelected = async (orderId) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (!order) return

  const items = (selectedItems[orderId] || []).map((i) => order.menuItems[i])
  if (!items.length) return

  const payload = buildOfferMenuItemsPayload(items)

  await applyOrderEdit(orderId, 'edit', order.tableNumber, payload)
  fetchOrders()
}

const repeatOrder = async (orderId) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (!order) return
  const data = order.menuItems.map((menuItem) => {
    return {
      itemId: menuItem._id,
      itemName: menuItem.menuItem,
      basePrice: parseFloat(menuItem.price) || 0,
      totalPrice: 0,
      imageUrl: menuItem.imageUrl || '',
      promotionCode: menuItem.promotionCode || '',
      isRepeatedOrder: true,
      quantity: menuItem.quantity,
      isFree: !!menuItem.isFree,
      selectedOptions: menuItem.articlesOptionsGroup
        .filter((group) => {
          const doesGroupHasOptions = group.articlesOptions.filter((opt) => opt.selected)
          return doesGroupHasOptions.length > 0
        })
        .map((group) => {
          return {
            groupId: group._id,
            groupName: group.name,
            categoryId: menuItem.categories.length > 0 ? menuItem.categories[0]._id : null,
            menuItemId: menuItem._id,
            selected: group.articlesOptions
              .filter((opt) => opt.selected)
              .map((opt) => ({
                ...opt,
                optionId: opt._id,
                optionName: opt.name,
                price: opt.price || 0,
                type: opt.type,
                quantity: opt.quantity || 1,
              })),
          }
        }),
    }
  })
  const orderStore = useOrderStore()
  data.map((e) => {
    orderStore.addItemToCart(e)
    const newIndex = orderStore.cartItems.length - 1
    orderStore.calculateItemTotal(newIndex)
  })

  emits('close')
}

const addItemsToOrder = async (orderId) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (!order) return

  const items = (selectedItems[orderId] || []).map((i) => order.menuItems[i])
  if (!items.length) return

  const payload = buildOfferMenuItemsPayload(items, '687e0a484e996f117b336b39') // pass actual offerId

  await applyOrderEdit(orderId, 'add', order.tableNumber, payload)
  fetchOrders()
}

const cancelOrder = async (orderId) => {
  const order = orders.value.find((o) => o._id === orderId)
  if (!order) return

  await applyOrderEdit(orderId, 'cancel', order.tableNumber)
  fetchOrders()
}
const buildOfferMenuItemsPayload = (items) => {
  // Group items by offerId (because one order can have multiple offers)
  const menuItems = []

  items.forEach((item) => {
    menuItems.push({
      menuItem: item._id,
      quantity: item.quantity,
      isFree: !!item.isFree,
      options: (item.options || []).map((opt) => ({
        option: opt._id,
        quantity: opt.quantity || 1,
      })),
    })
  })

  // Transform into offerMenuItems array
  return {
    menuItems,
  }
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

const showAll = ref(false)

const ordersToShow = computed(() => {
  return showAll.value ? orders.value : orders.value.slice(0, 7)
})

const url = import.meta.env.VITE_API_BASE_URL

const fetchOrders = async () => {
  const menuItems = useMenuStore()
  try {
    const res = await axios.get(
      `${url}/orders/history?phone=${props.customer?.Phone}&page=1&limit=500&from=2025-01-01&status=Completed`,
    )
    if (res.data?.status === 'Success') {
      orders.value = res.data.data.items.map((order) => {
        const detailedItems = (order.menuItems || []).map((item) => {
          const menuItem = menuItems.unFilteredMenuItems.find((mi) => mi._id === item.menuItem)

          return {
            ...item,
            menuItem: menuItem ? menuItem.name : 'Unknown Item',
            ...menuItem,
            articlesOptionsGroup: menuItem.articlesOptionsGroup.map((group) => ({
              ...group,
              articlesOptions:
                group.articlesOptions.map((opt) => {
                  const optionDetails = item.options?.find((o) => o.option === opt._id)
                  return {
                    ...opt,
                    ...optionDetails,
                    selected: !!optionDetails,
                  }
                }) || [],
            })),
          }
        })
        return {
          ...order,
          menuItems: detailedItems,
        }
      })
      console.log('Fetched orders:', orders.value)
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

const applyOrderEdit = async (orderId, action, tableNumber, payload = {}) => {
  try {
    const res = await axios.post(
      `${url}/order-edits/${orderId}/apply`,
      {
        action,
        tableNumber,
        ...payload,
      },
      {
        params: {
          orderId,
          tableNumber,
          posUser: 'STELLA',
          posPass: 'St3ll@',
        },
      },
    )
    init({
      message: res.data.message,
      color: res.data.status !== 'Failed' ? 'success' : 'danger',
    })
    return res.data
  } catch (err) {
    console.error('Order edit failed:', err)
    throw err
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

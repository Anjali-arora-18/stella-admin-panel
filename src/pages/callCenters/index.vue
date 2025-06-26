<template>
  <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
    <!-- LEFT SECTION -->
    <div class="md:col-span-5 bg-slate-100 py-4">
      <VaCard>
        <VaCardContent class="menu-section">
          <div class="top-bar flex items-start border-b pb-4 sm:flex-row sm:justify-between gap-4">
            <div class="flex flex-wrap gap-2">
              <a
                v-if="offers.length"
                :class="['text-white px-4 py-2 rounded-2xl', selectedItem === 'offers' ? 'bg-blue-500' : 'bg-gray-300']"
                href="#offers"
                @click="selectedItem = 'offers'"
              >
                Offers
              </a>
              <a
                v-for="item in filteredCategories"
                :key="item._id"
                :href="`#${item._id}`"
                class="text-white px-4 py-2 rounded-2xl"
                :class="{
                  'bg-blue-500': selectedItem === item._id,
                  'bg-gray-300': selectedItem !== item._id,
                }"
                @click="selectedItem = item._id"
              >
                {{ toTitleCase(item.name) }}
              </a>
            </div>
            <div class="flex">
              <span class="bg-black px-4 py-4 text-white text-2xl rounded">
                {{ currentTime }}
              </span>
            </div>
          </div>
          <div class="menu-scroll">
            <MenuSection v-if="offers.length" id="offers" title="OFFERS" :items="offers" />
            <MenuSection
              v-for="cat in filteredCategories"
              :id="cat._id"
              :key="cat.name"
              :title="cat.name"
              :items="cat.menuItems"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- RIGHT SECTION -->
    <div class="md:col-span-2 bg-slate-100 pt-4" style="height: calc(100vh - 98px); overflow-y: hidden">
      <div class="flex flex-col gap-2">
        <VaCard>
          <VaCardContent>
            <CustomerDetails
              :force-remount="forceRemount"
              @setDeliveryFee="(val) => (deliveryFee = val)"
              @setCustomerDetailsId="(val) => (customerDetailsId = val)"
              @setDeliveryZone="(val) => (isDeliveryZoneSelected = val)"
              @setOrderType="(val) => (orderType = val)"
              @setOpen="(val) => (accordian[0] = val)"
            />
          </VaCardContent>
        </VaCard>
        <OrderDetails
          :delivery-fee="deliveryFee"
          :is-delivery-zone-selected="isDeliveryZoneSelected"
          :customer-details-id="customerDetailsId"
          :order-type="orderType"
          :is-customer-open="accordian[0]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '@/stores/getMenu.js'
import { useServiceStore } from '@/stores/services.ts'
import { useOrderStore } from '@/stores/order-store'
import { useRoute } from 'vue-router'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
const { init } = useToast()
const route = useRoute()
const serviceStore = useServiceStore()

import MenuSection from '@/pages/callCenters/widgets/MenuSections.vue'
import CustomerDetails from '@/pages/callCenters/widgets/CustomerDetails.vue'
import OrderDetails from '@/pages/callCenters/widgets/OrderDetails.vue'

const props = defineProps({
  categories: Array,
  restDetails: Object,
})

const customerDetailsId = ref('')
const orderType = ref('')
const isDeliveryZoneSelected = ref('')
const categories = computed(() => menuStore.categories)
const restDetails = computed(() => menuStore.restDetails)
const isLoading = ref(false)
const menuStore = useMenuStore()
const accordian = ref([true, true])
const deliveryFee = ref(0)
const orderStore = useOrderStore()
const toTitleCase = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const selectedItem = ref(null)
const currentTime = ref('')
const forceRemount = ref(0)
const offers = ref([])

const getOffers = async () => {
  const url = import.meta.env.VITE_API_BASE_URL

  const response = await axios.get(url + '/offers/?outletId=' + serviceStore.selectedRest)
  offers.value = response.data.data
}

const menuItems = computed(() => {
  return (props.categories || []).map((category) => ({
    id: category._id,
    _id: category._id,
    name: category.name,
    label: category.name,
  }))
})

onMounted(() => {
  currentTime.value = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }, 3000)
})

onUnmounted(() => {
  orderStore.cartItems = []
  orderStore.paymentId = ''
  orderStore.redirectUrl = ''
  orderStore.setAddress('')
  orderStore.setDeliveryZone('')
})

watch(
  () => serviceStore.selectedRest,
  (newVal) => {
    if (newVal) {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      isLoading.value = true
      getMenu()
      getOffers()
      orderStore.cartItems = []
      orderStore.paymentId = ''
      orderStore.redirectUrl = ''
      forceRemount.value++
      isLoading.value = false
    }
  },
  { immediate: true },
)

const filteredCategories = computed(() => {
  const validCategories = categories.value.filter(
    (category) =>
      category.menuItems.length > 0 ||
      (category.subCategories.length && category.subCategories.some((a) => a.menuItems.length)),
  )

  return [...validCategories]
})

// watch(
//   filteredCategories,
//   (newVal) => {
//     if (newVal.length && !selectedItem.value) {
//       selectedItem.value = newVal[0]._id
//     }
//   },
//   { immediate: true },
// )

// Watch route hash and scroll to section if present
watch(
  () => route.hash,
  (hash) => {
    if (hash && !selectedItem.value) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          selectedItem.value = hash.replace('#', '')
        }
      }, 3000)
    }
  },
  { immediate: true },
)

async function getMenu() {
  isLoading.value = true
  menuStore.resetUnFilteredMenuItems()
  const payload = serviceStore.items.find((item) => item._id === serviceStore.selectedRest).slug
  await menuStore.getOutletDetails(payload)
  await menuStore.getCategories()
  isLoading.value = false
}
</script>

<style lang="scss">
.menu-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 115px);
}

.menu-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  padding-right: 0.25rem;
}
</style>

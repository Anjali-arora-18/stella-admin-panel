<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeliveryTable from '@/pages/deliveryZone/widgets/DeliveryTable.vue'
import { useServiceStore } from '../../stores/services'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
const isDeliveryZoneModalOpen = ref(false)
const servicesStore = useServiceStore()
const items = ref([])
const forceReMount = ref(0)
const isLoading = ref(false)
const { init } = useToast()

const getDeliveryZones = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(url + '/deliveryZones?outletId=' + servicesStore.selectedRest)
    const item = response.data.data
    forceReMount.value++
    items.value = item.map((e) => {
      return {
        ...e,
        editName: false,
        editDeliveryCharge: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load delivery zones', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getDeliveryZones()
  },
)

if (servicesStore.selectedRest) {
  getDeliveryZones()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="page-title font-bold">Delivery Zones</h1>
    </div>

    <VaCard>
      <VaCardContent>
        <DeliveryTable :key="forceReMount" :items="items" :loading="isLoading" @getDeliveryZones="getDeliveryZones" />
      </VaCardContent>
    </VaCard>
  </div>
</template>

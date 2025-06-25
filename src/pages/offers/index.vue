<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OfferTable from '@/pages/offers/widgets/OfferTable.vue'
import OfferModal from './modals/OfferModal.vue'
import { useServiceStore } from '../../stores/services'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
const isOfferModalOpen = ref(false)
const servicesStore = useServiceStore()
const items = ref([])
const forceReMount = ref(0)
const isLoading = ref(false)
const { init } = useToast()

const getOffers = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(url + '/offers/?outletId=' + servicesStore.selectedRest)
    const item = response.data.data
    forceReMount.value++
    items.value = item.map((e) => {
      return {
        ...e,
        editName: false,
        editDescription: false,
        editPrice: false,
        editImage: false,
        editStartDate: false,
        editEndDate: false,
        editWeekDays: false,
        editTimeFrom: false,
        editTimeTo: false,
        editOrderType: false,
        editSelections: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load offers', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getOffers()
  },
)

if (servicesStore.selectedRest) {
  getOffers()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="page-title font-bold">Offers</h1>
      <div class="flex gap-2">
        <VaButton size="small" color="primary" @click="isOfferModalOpen = true">Add Offers</VaButton>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <OfferTable :key="forceReMount" :items="items" :loading="isLoading" @getOffers="getOffers" />
      </VaCardContent>
    </VaCard>
    <OfferModal v-if="isOfferModalOpen" @cancel="(isOfferModalOpen = false), getOffers()" />
  </div>
</template>

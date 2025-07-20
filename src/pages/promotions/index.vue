<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PromotionTable from './widgets/PromotionsTable.vue'
import PromotionsModal from './modals/PromotionsModal.vue'
import { useServiceStore } from '../../stores/services'
import { useToast } from 'vuestic-ui'
import axios from 'axios'

const isPromotionModalOpen = ref(false)
const servicesStore = useServiceStore()
const items = ref([])
const forceReMount = ref(0)
const selectedPromotion = ref('')
const isLoading = ref(false)
const { init } = useToast()

function editPromotions(payload) {
  isPromotionModalOpen.value = true
  selectedPromotion.value = payload
}

const getPromotions = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(url + '/promotions/?outletId=' + servicesStore.selectedRest)
    const item = response.data.data
    forceReMount.value++
    items.value = item.map((e) => {
      return {
        ...e,
        editName: false,
        editDescription: false,
        editPrice: false,
        editImage: false,
        editDate: false,
        editWeekDays: false,
        editTime: false,
        editOrderType: false,
        editSelections: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load promotions', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getPromotions()
  },
)

if (servicesStore.selectedRest) {
  getPromotions()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="page-title font-bold">Promotions</h1>
      <div class="flex gap-2">
        <VaButton size="small" color="primary" @click="isPromotionModalOpen = true">Add Promotion</VaButton>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <PromotionTable
          :key="forceReMount"
          :items="items"
          :loading="isLoading"
          @editPromotions="editPromotions"
          @getPromotions="getPromotions"
        />
      </VaCardContent>
    </VaCard>
    <PromotionsModal
      v-if="isPromotionModalOpen"
      :selected-option="selectedPromotion"
      @cancel="(isPromotionModalOpen = false), (selectedPromotion = ''), getPromotions(servicesStore.selectedRest)"
    />
  </div>
</template>

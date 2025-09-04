<script setup lang="ts">
import { ref, watch } from 'vue'
import PaymentTable from '@/pages/payments/widgets/PaymentTable.vue'
import { useServiceStore } from '@/stores/services'
import EditPaymentModal from './modals/EditPaymentModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
const isEditPaymentModalOpen = ref(false)
const servicesStore = useServiceStore()
const items = ref([])
const { init } = useToast()
const forceReMount = ref(0)
const selectedPayments = ref('')
const isLoading = ref(false)

function editPayment(payload) {
  isEditPaymentModalOpen.value = true
  selectedPayments.value = payload
}

const getPayments = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(url + '/payments?outletId=' + servicesStore.selectedRest)
    const item = response.data.data
    forceReMount.value++
    items.value = item.map((e) => {
      return {
        ...e,
        editID: false,
        editName: false,
        editPaymentGateway: false,
        editPaymentTypeId: false,
        editDineIn: false,
        editDelivery: false,
        editTakeaway: false,
      }
    })
  } catch (error) {
    init({ message: 'Failed to load Payment', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => servicesStore.selectedRest,
  () => {
    getPayments()
  },
)

if (servicesStore.selectedRest) {
  getPayments()
}
</script>

<template>
  <div>
    <VaCard class="mt-4">
      <VaCardContent>
        <PaymentTable
          :key="forceReMount"
          :items="items"
          :loading="isLoading"
          @editPayment="editPayment"
          @getPayments="getPayments"
          @addPayment="isEditPaymentModalOpen = true"
        />
      </VaCardContent>
    </VaCard>

    <EditPaymentModal
      v-if="isEditPaymentModalOpen"
      :selected-payment="selectedPayments"
      @cancel="(isEditPaymentModalOpen = false), (selectedPayments = ''), getPayments(servicesStore.selectedRest)"
    />
  </div>
</template>

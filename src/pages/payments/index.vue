<script setup lang="ts">
import { ref, watch } from 'vue'
import PaymentTable from '@/pages/payments/widgets/PaymentTable.vue'
import { useServiceStore } from '@/stores/services'
import EditPaymentModal from './modals/EditPaymentModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
const isEditPaymentModalOpen = ref(false)
const serviceStore = useServiceStore()
const items = ref([])
const { init } = useToast()
const isLoading = ref(false)
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="page-title font-bold">Payments</h1>
    <div class="flex gap-2">
      <VaButton size="small" color="primary" @click="isEditPaymentModalOpen = true"> Add Payment </VaButton>
    </div>
  </div>

  <VaCard>
    <VaCardContent>
      <PaymentTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>

  <EditPaymentModal v-if="isEditPaymentModalOpen" @cancel="isEditPaymentModalOpen = false" />
</template>

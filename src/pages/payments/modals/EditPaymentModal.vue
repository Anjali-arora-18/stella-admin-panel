<template>
  <VaModal
    v-model="isVisible"
    class="big-form"
    :mobile-fullscreen="false"
    size="small"
    hide-default-actions
    close-button
  >
    <template #header>
      <h1 class="va-h6 mb-2">Add Payment</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <VaInput v-model="formData.name" label="Name" placeholder="Name" type="text" />

        <VaSelect
          v-model="formData.paymentGateway"
          value-by="value"
          label="Payment Gateway"
          :options="paymentGateway"
        />

        <VaInput v-model="formData.paymentTypeId" label="Payment Type ID" placeholder="Payment Type ID" type="number" />

        <VaSelect v-model="formData.type" label="Type" :options="typeOptions" :multiple="true" value-by="value" />
      </div>
    </VaForm>
    <template #footer>
      <div class="flex justify-end mt-4">
        <VaButton type="submit" @click="submit">Add</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm, useToast } from 'vuestic-ui'

const emits = defineEmits(['cancel'])

const isVisible = ref(true)

// Watch for closing the modal
watch(isVisible, (val) => {
  if (!val) emits('cancel')
})

const { validate } = useForm('form')
const { init } = useToast()

const formData = ref({
  name: '',
  paymentGateway: '',
  paymentTypeId: '',
  type: [],
})

const paymentGateway = [
  { text: 'JCC', value: 'JCC' },
  { text: 'GAP', value: 'GAP' },
  { text: 'VivaWallet', value: 'VivaWallet' },
]

const typeOptions = [
  { text: 'Dine-in', value: 'Dine-in' },
  { text: 'Delivery', value: 'Delivery' },
  { text: 'Takeaway', value: 'Takeaway' },
]

const submit = async () => {
  const { isValid } = await validate()
  if (!isValid) return
  init({ message: 'Submitted successfully', color: 'success' })
  // Close modal
  isVisible.value = false
}
</script>

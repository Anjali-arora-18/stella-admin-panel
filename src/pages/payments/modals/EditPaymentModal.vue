<template>
  <VaModal
    class="big-form"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    :model-value="true"
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="va-h6 mb-5">{{ isUpdating ? 'Update' : 'Add' }} Payment</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit()">
      <div class="grid grid-cols-2 md:grid-cols-1 gap-4 justify-between">
        <VaInput
          v-model="formData.name"
          label="Name"
          placeholder="Name"
          type="text"
          required-mark
          :rules="[validators.required]"
        />
        <VaSelect
          v-model="formData.paymentGateway"
          value-by="value"
          label="Payment Gateway"
          :options="paymentGateway"
          required-mark
          :rules="[validators.required]"
        />
        <div v-if="formData.paymentGateway" class="grid md:grid-cols-1 gap-4">
          <VaInput
            v-if="formData.paymentGateway !== 'JCC'"
            v-model="formData.paymentGatewayConfig.url"
            label="Payment Gateway URL"
            placeholder="Enter URL"
            type="url"
            required-mark
            :rules="[validators.required]"
          />
          <VaInput
            v-model="formData.paymentGatewayConfig.username"
            label="Payment Gateway Username"
            placeholder="Enter Username"
            type="text"
            required-mark
            :rules="[validators.required]"
          />
          <VaInput
            v-model="formData.paymentGatewayConfig.password"
            label="Payment Gateway Password"
            placeholder="Enter Password"
            type="password"
            required-mark
            :rules="[validators.required]"
          />
        </div>
        <VaInput v-model="formData.paymentTypeId" label="Payment Type ID" placeholder="Payment Type ID" type="text" />
        <div class="grid md:grid-cols-3 gap-4">
          <VaCheckbox v-model="formData.dineIn" label="Dine-in" />
          <VaCheckbox v-model="formData.delivery" label="Delivery" />
          <VaCheckbox v-model="formData.takeaway" label="Takeaway" />
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <VaButton type="submit">{{ isUpdating ? 'Update' : 'Add' }}</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useForm, useToast } from 'vuestic-ui'
import { useServiceStore } from '@/stores/services'
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedPayment: {
    type: Object,
    default: () => ({}),
  },
})

const { validate } = useForm('form')
const { init } = useToast()
const serviceStore = useServiceStore()
const formData = ref({
  _id: '',
  name: '',
  paymentGateway: '',
  paymentGatewayConfig: {
    username: '',
    password: '',
    url: '',
  },
  paymentTypeId: '',
  dineIn: false,
  delivery: false,
  takeaway: false,
})

const isUpdating = computed(() => !!Object.keys(props.selectedPayment).length)

const paymentGateway = [
  { text: 'JCC', value: 'JCC' },
  { text: 'GAP', value: 'GAP' },
  { text: 'VivaWallet', value: 'VivaWallet' },
]

if (props.selectedPayment) {
  axios
    .get(`${import.meta.env.VITE_API_BASE_URL}/payments/${props.selectedPayment._id}`)
    .then((response) => {
      formData.value = response.data.data
    })
    .catch((error) => {
      init({ message: error.response.data.message, color: 'danger' })
    })
}

const submit = async () => {
  if (validate()) {
    const data = JSON.parse(JSON.stringify(formData.value))

    data.outletId = serviceStore.selectedRest

    // Remove unused metadata
    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    delete data.updating

    const url: any = import.meta.env.VITE_API_BASE_URL

    try {
      if (props.selectedPayment && data._id) {
        await axios.patch(`${url}/payments/${data._id}`, data)
        init({ message: "You've successfully updated a payment", color: 'success' })
      } else {
        delete data._id
        await axios.post(`${url}/payments`, data)
        init({ message: "You've successfully created a payment", color: 'success' })
      }

      emits('cancel') // Close modal
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong'
      init({ message, color: 'danger' })
    }
  }
}
</script>

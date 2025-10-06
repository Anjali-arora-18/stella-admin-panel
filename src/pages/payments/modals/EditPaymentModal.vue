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
      <div class="grid grid-cols-2 md:grid-cols-1 gap-3 justify-between">
        <VaInput v-model="formData.name" label="Name" placeholder="Name" type="text" :rules="[validators.required]" />
        <VaSelect
          v-model="formData.paymentGateway"
          value-by="value"
          label="Payment Gateway"
          :options="paymentGateway"
        />
        <div v-if="formData.paymentGateway" class="grid md:grid-cols-1 gap-3">
          <div
            v-for="e in paymentOptions.find((a) => a.paymentMethodName === formData.paymentGateway)?.inputConfig || []"
            :key="e.label"
          >
            <VaInput v-model="e.value" :type="e.type" :rules="e.required ? [validators.required] : []">
              <template #label>
                <span>
                  {{ e.label }}
                  <span v-if="e.required" class="required-asterisk">*</span>
                </span>
              </template>
            </VaInput>
          </div>
        </div>
        <VaInput v-model="formData.paymentTypeId" label="Payment Type ID" placeholder="Payment Type ID" type="text" />
        <div class="grid md:grid-cols-4 gap-3">
          <VaCheckbox v-model="formData.dineIn" label="Dine-in" />
          <VaCheckbox v-model="formData.delivery" label="Delivery" />
          <VaCheckbox v-model="formData.takeaway" label="Takeaway" />
          <VaCheckbox v-model="formData.callCenter" label="Call Center" />
        </div>
      </div>

      <div class="flex justify-end mt-3">
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
const servicesStore = useServiceStore()
const formData = ref({
  _id: '',
  name: '',
  paymentGateway: '',
  paymentTypeId: '',
  dineIn: false,
  delivery: false,
  takeaway: false,
  callCenter: false,
})

const isUpdating = computed(() => !!Object.keys(props.selectedPayment).length)

const paymentGateway = ref([])
const paymentOptions = ref([])

const getPaymentconfig = () => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  axios.get(`${url}/payments-config`).then((response) => {
    paymentGateway.value = response.data.data.types.map((e) => {
      return { text: e, value: e }
    })

    paymentOptions.value = response.data.data.config.map((e) => {
      return {
        ...e,
        inputConfig: e.inputConfig.map((config) => {
          return {
            ...config,
            value: config.default || '',
          }
        }),
      }
    })

    if (props.selectedPayment) {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/payments/${props.selectedPayment._id}`)
        .then((response) => {
          formData.value = response.data.data
          paymentOptions.value
            .find((a) => a.paymentMethodName === formData.value.paymentGateway)
            ?.inputConfig.forEach((e) => {
              e.value = response.data.data.paymentGatewayConfig[e.name] || ''
            })
        })
        .catch((error) => {
          init({ message: error.response.data.message, color: 'danger' })
        })
    }
  })
}

const submit = async () => {
  if (validate()) {
    let selectedGateway = null
    if (formData.value.paymentGateway) {
      selectedGateway = paymentOptions.value.find((a) => a.paymentMethodName === formData.value.paymentGateway)
    }

    let data = JSON.parse(JSON.stringify(formData.value))
    data = {
      ...data,
      paymentGatewayConfig: selectedGateway
        ? Object.fromEntries(selectedGateway.inputConfig.map((input) => [input.name, input.value]))
        : {},
    }

    data.outletId = servicesStore.selectedRest

    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    delete data.updating

    const url = import.meta.env.VITE_API_BASE_URL

    try {
      if (props.selectedPayment && data._id) {
        await axios.patch(`${url}/payments/${data._id}`, data)
        init({ message: "You've successfully updated a payment", color: 'success' })
      } else {
        delete data._id
        await axios.post(`${url}/payments`, data)
        init({ message: "You've successfully created a payment", color: 'success' })
      }
      emits('cancel')
    } catch (err) {
      const message = err?.response?.data?.message || 'Something went wrong'
      init({ message, color: 'danger' })
    }
  }
}

getPaymentconfig()
</script>
<style scoped>
.required-asterisk {
  color: red;
  font-weight: bold;
}
</style>

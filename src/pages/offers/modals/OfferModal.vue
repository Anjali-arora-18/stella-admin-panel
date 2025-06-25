<template>
  <VaModal
    v-model="isVisible"
    class="big-form"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <template #header>
      <h1 class="va-h6 mb-2">Add Offers</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VaInput v-model="formData.name" label="Name" placeholder="Name" />
        <VaInput v-model="formData.description" label="Description" placeholder="Description" />
        <VaInput v-model="formData.price" label="Price" placeholder="Price" type="number" />
        <VaInput v-model="formData.imageUrl" label="Image URL" placeholder="Image URL" />

        <VaInput v-model="formData.dateOffer.startDate" label="Start Date" type="date" />
        <VaInput v-model="formData.dateOffer.endDate" label="End Date" type="date" />

        <VaSelect
          v-model="formData.weeklyOffer"
          label="Week Days"
          multiple
          :options="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']"
        />
        <VaSelect v-model="formData.orderType" label="Order Type" :options="['dine-in', 'takeaway', 'delivery']" />
        <VaInput v-model="formData.timeOffer.startTime" label="Time From" type="time" />
        <VaInput v-model="formData.timeOffer.endTime" label="Time To" type="time" />

        <VaTextarea v-model="selectionsJson" label="Selections" autosize />
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
import axios from 'axios'
import { useForm, useToast } from 'vuestic-ui'
import { useServiceStore } from '@/stores/services'

const emits = defineEmits(['cancel'])

const props = defineProps({
  selectedOption: {
    type: Object,
    default: () => null,
  },
})

const isVisible = ref(true)

watch(isVisible, (val) => {
  if (!val) emits('cancel')
})

const servicesStore = useServiceStore()
const { validate } = useForm('form')
const { init } = useToast()

const formData = ref({
  _id: '',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  dateOffer: {
    startDate: '',
    endDate: '',
  },
  timeOffer: {
    startTime: '',
    endTime: '',
  },
  weeklyOffer: [],
  orderType: '',
  selections: [],
  isActive: true,
})

const selectionsJson = ref('')

watch(
  () => props.selectedOption,
  (val) => {
    if (val) {
      formData.value = {
        _id: val._id || '',
        name: val.name || '',
        description: val.description || '',
        price: val.price || 0,
        imageUrl: val.imageUrl || '',
        dateOffer: {
          startDate: val.dateOffer?.startDate?.slice(0, 10) || '',
          endDate: val.dateOffer?.endDate?.slice(0, 10) || '',
        },
        timeOffer: {
          startTime: val.timeOffer?.startTime || '',
          endTime: val.timeOffer?.endTime || '',
        },
        weeklyOffer: (val.weeklyOffer || []).map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)),
        orderType: val.orderType || '',
        selections: val.selections || [],
        isActive: val.isActive ?? true,
      }
      selectionsJson.value = JSON.stringify(val.selections || [], null, 2)
    }
  },
  { immediate: true },
)

const submit = async () => {
  if (validate()) {
    const data = JSON.parse(JSON.stringify(formData.value))
    data.outletId = servicesStore.selectedRest
    data.weeklyOffer = data.weeklyOffer.map((d: string) => d.toLowerCase())

    const url = import.meta.env.VITE_API_BASE_URL

    try {
      if (data._id) {
        await axios.patch(`${url}/offers/${data._id}`, data)
        init({ message: 'Offer updated successfully!', color: 'success' })
      } else {
        delete data._id
        await axios.post(`${url}/offers`, data)
        init({ message: 'Offer created successfully!', color: 'success' })
      }
      emits('cancel')
    } catch (err: any) {
      init({ message: err?.response?.data?.message || 'Error occurred', color: 'danger' })
    }
  }
}
</script>

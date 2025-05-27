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
      <h1 class="va-h6 mb-2">Add Zone</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <VaInput v-model="formData.deliveryZone" label="Delivery Zone" placeholder="Delivery Zone" type="text" />
        <VaInput
          v-model="districts"
          :option="districtsOptions"
          label="District"
          placeholder="Select District"
          type="select"
        ></VaInput>
        <VaInput
          v-model="municipalities"
          :option="municipalitiesOptions"
          label="Municipalities"
          placeholder=" Select Municipalities"
          type="select"
        ></VaInput>
        <VaInput
          v-model="formData.deliveryCharges"
          label="Delivery Charges"
          placeholder="Delivery Charges"
          type="number"
        />
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
  deliveryZone: '',
  deliveryCharges: '',
})

const submit = async () => {
  const { isValid } = await validate()
  if (!isValid) return
  init({ message: 'Submitted successfully', color: 'success' })
  // Close modal
  isVisible.value = false
}
</script>

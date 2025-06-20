<template>
  <VaModal
    v-model="isVisible"
    class="big-form"
    :mobile-fullscreen="false"
    size="medium"
    hide-default-actions
    close-button
  >
    <template #header>
      <h1 class="va-h6 mb-2">Add Delivery Zone</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-4">
        <VaInput v-model="formData.deliveryZone" label="Delivery Zone" placeholder="Delivery Zone" type="text" />
        <VaInput
          v-model="formData.deliveryCharges"
          label="Delivery Charges"
          placeholder="Delivery Charges"
          type="number"
        />
        <VaInput v-model="formData.terminalNo" label="Terminal No." placeholder="Terminal No." type="number" />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <VaInput v-model="formData.ccFromTable" label="CC From Table" placeholder="CC From Table" type="number" />
        <VaInput v-model="formData.ccToTable" label="CC To Table" placeholder="CC To Table" type="number" />
        <VaInput v-model="formData.webFromTable" label="Web From Table" placeholder="Web From Table" type="number" />
        <VaInput v-model="formData.webToTable" label="Web To Table" placeholder="Web To Table" type="number" />
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

watch(isVisible, (val) => {
  if (!val) emits('cancel')
})

const { validate } = useForm('form')
const { init } = useToast()

const formData = ref({
  deliveryZone: '',
  deliveryCharges: '',
  terminalNo: '',
  ccFromTable: '',
  ccToTable: '',
  webFromTable: '',
  webToTable: '',
})

const submit = async () => {
  const { isValid } = await validate()
  if (!isValid) return
  init({ message: 'Submitted successfully', color: 'success' })
  isVisible.value = false
}
</script>

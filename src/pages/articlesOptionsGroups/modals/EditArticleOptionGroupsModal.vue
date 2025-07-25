<template>
  <VaModal
    class="big-form"
    :mobile-fullscreen="false"
    size="medium"
    hide-default-actions
    :model-value="true"
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="va-h6 mb-2">{{ isUpdating ? 'Update' : 'Add' }} Option Group</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <VaInput
          v-model="formData.name"
          :rules="[validators.required]"
          label="Name"
          required-mark
          placeholder="Name"
          type="text"
        />
        <VaInput v-model="formData.internalName" label="Internal Name" placeholder="Internal Name" type="text" />
        <VaTextarea
          v-model="formData.description"
          label="Description"
          placeholder="Description"
          type="textarea"
          :min-rows="3"
          :max-rows="3"
          class="mb-1 w-full"
        />
        <div class="flex flex-col sm:flex-row gap-4">
          <VaInput
            v-model="formData.minimumChoices"
            label="Minimum Choices"
            placeholder="Minimum Choices"
            type="number"
            class="w-full"
          />
          <VaInput
            v-model="formData.maximumChoices"
            label="Maximum Choices"
            placeholder="Maximum Choices"
            type="number"
            class="w-full"
          />
        </div>
        <div class="flex flex-wrap gap-4 items-center">
          <VaCheckbox
            v-model="formData.singleChoice"
            name="choice"
            :disabled="formData.multipleChoice || formData.multipleChoiceNoQty"
            label="Single Choice"
          />
          <VaCheckbox
            v-model="formData.multipleChoice"
            name="choice"
            :disabled="formData.singleChoice || formData.multipleChoiceNoQty"
            label="Multiple Choice"
          />
          <VaCheckbox
            v-model="formData.multipleChoiceNoQty"
            name="choice"
            :disabled="formData.singleChoice || formData.multipleChoice"
            label="Multiple Choice (No Qty)"
          />
          <VaCheckbox v-model="formData.mandatory" label="Mandatory" />
        </div>
      </div>
    </VaForm>

    <template #footer>
      <div class="flex justify-end mt-4">
        <VaButton type="submit" @click="submit">
          {{ isUpdating ? 'Update' : 'Add' }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import { useToast, useForm } from 'vuestic-ui'
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedOptionGroups: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()

const servicesStore = useServiceStore()

const formData = ref({
  _id: '',
  name: '',
  internalName: '',
  description: '',
  singleChoice: false,
  multipleChoice: false,
  multipleChoiceNoQty: false,
  mandatory: false,
  minimumChoices: 0,
  maximumChoices: 0,
})

const isUpdating = computed(() => !!Object.keys(props.selectedOptionGroups).length && props.selectedOptionGroups._id)

if (props.selectedOptionGroups && props.selectedOptionGroups._id) {
  axios
    .get(`${import.meta.env.VITE_API_BASE_URL}/articles-options-groups/${props.selectedOptionGroups._id}`)
    .then((response) => {
      formData.value = response.data.data
    })
    .catch((error) => {
      init({ message: error.response.data.message, color: 'danger' })
    })
} else if (props.selectedOptionGroups && !props.selectedOptionGroups._id) {
  formData.value = {
    _id: '',
    name: props.selectedOptionGroups.name || '',
    internalName: props.selectedOptionGroups.internalName || '',
    description: props.selectedOptionGroups.description || '',
    singleChoice: props.selectedOptionGroups.singleChoice || false,
    multipleChoice: props.selectedOptionGroups.multipleChoice || false,
    multipleChoiceNoQty: props.selectedOptionGroups.multipleChoiceNoQty || false,
    mandatory: props.selectedOptionGroups.mandatory || false,
    minimumChoices: props.selectedOptionGroups.minimumChoices || 0,
    maximumChoices: props.selectedOptionGroups.maximumChoices || 0,
  }
}

const submit = async () => {
  if (validate()) {
    const data = JSON.parse(JSON.stringify(formData.value))

    data.outletId = servicesStore.selectedRest

    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    delete data.updating

    if (data.description === '') {
      delete data.description
    }
    if (data.internalName === '') {
      delete data.internalName
    }

    const url: any = import.meta.env.VITE_API_BASE_URL

    try {
      if (props.selectedOptionGroups && data._id) {
        await axios.patch(`${url}/articles-options-groups/${data._id}`, data)
        init({ message: "You've successfully updated a OptionGroups", color: 'success' })
      } else {
        delete data._id
        await axios.post(`${url}/articles-options-groups`, data)
        init({ message: "You've successfully created a OptionGroups", color: 'success' })
      }

      emits('cancel')
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong'
      init({ message, color: 'danger' })
    }
  }
}
</script>

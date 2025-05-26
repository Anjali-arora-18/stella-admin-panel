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
      <h1 class="va-h6 mb-2">{{ selectedUser ? 'Update Option Group' : 'Add Option Group' }}</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div v-if="formData.updating === '' || formData.updating === 'all'" class="grid grid-cols-1 md:grid-cols-1 gap-4">
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
        <VaCheckbox v-model="formData.value" required-mark error error-messages="Error message" label="Single Choice" />
        <VaCheckbox
          v-model="formData.value"
          required-mark
          error
          error-messages="Error message"
          label="Multiple Choice"
        />
        <VaCheckbox v-model="formData.value" label="Mandatory" />
        <VaInput v-model="formData.minChoice" label="Minimum Choices" placeholder="Minimum Choices" type="number" />
        <VaInput v-model="formData.maxChoice" label="Maximum Choices" placeholder="Maximum Choices" type="number" />
      </div>
    </VaForm>

    <template #footer>
      <div class="flex justify-end mt-4">
        <VaButton type="submit" @click="submit">
          {{ selectedUser ? 'Update' : 'Add' }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import { useToast, useForm } from 'vuestic-ui'
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedUser: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()

const servicesStore = useServiceStore()

const formData = ref({
  firstName: '',
  username: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  updating: '',
  outlets: [],
})

const outlets = ref([])
const types = [
  { text: 'Admin', value: 'admin' },
  { text: 'Editor', value: 'editor' },
]

const getOutlets = () => {
  servicesStore.getAll().then(() => {
    outlets.value = servicesStore.items.map((e) => {
      return { text: e.name, value: e._id }
    })
  })
}

if (props.selectedUser) {
  formData.value = props.selectedUser
}

const submit = () => {
  if (validate()) {
    const data = JSON.parse(JSON.stringify(formData.value))
    delete data.updating
    delete data.createdAt // delete createdAt key for unnecessary used
    delete data.updatedAt // delete updatedAt key for unnecessary used
    delete data.__v // delete __v key for unnecessary used

    const url: any = import.meta.env.VITE_API_BASE_URL
    if (props.selectedUser) {
      axios
        .patch(`${url}/users/${formData.value._id}`, data)
        .then((response) => {
          init({ message: "You've successfully updated a user", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    } else {
      axios
        .post(`${url}/users`, data)
        .then((response) => {
          init({ message: "You've successfully created a user", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    }
  }
}

getOutlets()
</script>

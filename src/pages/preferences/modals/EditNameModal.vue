<template>
  <VaModal
    :mobile-fullscreen="false"
    size="small"
    hide-default-actions
    max-width="380px"
    model-value
    close-button
    @update:modelValue="emits('cancel')"
  >
    <h1 class="va-h5 mb-4">Edit Profile</h1>
    <VaForm ref="form" @submit.prevent="submit">
      <VaInput v-model="firstName" class="mb-4" label="First Name" placeholder="First Name" />
      <VaInput v-model="lastName" class="mb-4" label="Last Name" placeholder="Last Name" />
      <VaInput v-model="email" class="mb-4" label="Email" type="email" placeholder="Email" />
      <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
        <VaButton :style="buttonStyles" preset="secondary" color="secondary" @click="emits('cancel')"> Cancel</VaButton>
        <VaButton :style="buttonStyles" class="mb-4 md:mb-0" type="submit"> Save</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { useUsersStore } from '../../../stores/users'
import { buttonStyles } from '../styles'
import { useToast, useForm } from 'vuestic-ui'

const userStore = useUsersStore()
const { validate } = useForm('form')
const { init } = useToast()
const emits = defineEmits(['cancel'])

const firstName = ref<string>()
const lastName = ref<string>()
const email = ref<string>()

const submit = () => {
  if (validate()) {
    const url: any = import.meta.env.VITE_API_BASE_URL
    axios
      .patch(`${url}/users/${userStore.userDetails.id}`, {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
      })
      .then((response) => {
        init({ message: "You've successfully changed your profile", color: 'success' })
        emits('cancel')
      })
      .catch((err) => {
        init({ message: err.response.data.message, color: 'danger' })
      })
  }
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
</style>

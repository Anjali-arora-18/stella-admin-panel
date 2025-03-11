<template>
  <VaForm ref="passwordForm" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Forgot your password?</h1>
    <p class="text-base mb-4 leading-5">
      If you've forgotten your password, don't worry. Simply enter your email address below, and we'll send you an email
      with a temporary password. Restoring access to your account has never been easier.
    </p>
    <VaInput
      v-model="email"
      :rules="[(v) => !!v || 'Email field is required']"
      class="mb-4"
      label="Enter your email"
      type="email"
    />
    <VaButton class="w-full mb-2" @click="submit">Send password</VaButton>
    <VaButton :to="{ name: 'login' }" class="w-full" preset="secondary" @click="submit">Go back</VaButton>
  </VaForm>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import axios from 'axios'
const email = ref('')
const form = useForm('passwordForm')
const router = useRouter()
const { init } = useToast()
const submit = () => {
  if (form.validate()) {
    axios
      .post('https://2ce8-59-182-32-185.ngrok-free.app/api/v1/auth/forgot-password', {
        email: email.value,
      })
      .then((response) => {
        init({ message: response.data.message, color: 'success' })
        router.push({ name: 'recover-password-email' })
      })
      .catch((err) => {
        init({ message: err.response.data.message, color: 'danger' })
      })
  }
}
</script>

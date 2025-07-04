<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Log in</h1>
    <p class="text-base mb-4 leading-5">
      New to Stella?
      <!-- <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary">Sign up</RouterLink> -->
    </p>
    <VaInput
      v-model="formData.email"
      :rules="[validators.required, validators.email]"
      class="mb-4"
      label="Email"
      type="email"
    />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="formData.password"
        :rules="[validators.required]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <VaCheckbox v-model="formData.keepLoggedIn" class="mb-2 sm:mb-0" label="Keep me signed in on this device" />
      <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
        Forgot password?
      </RouterLink>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> Login</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import axios from 'axios'
const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
import { useUsersStore } from '../../stores/users'
import { useServiceStore } from '@/stores/services'
const serviceStore = useServiceStore()
const userStore = useUsersStore()

serviceStore.resetRest()
const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const submit = () => {
  if (validate()) {
    const url: any = import.meta.env.VITE_API_BASE_URL
    axios
      .post(`${url}/auth/signin`, {
        email: formData.email,
        password: formData.password,
      })
      .then((response) => {
        userStore.setUserDetails(response.data.user)
        init({ message: "You've successfully logged in", color: 'success' })
        if (response.data.user.role !== 'super-admin') {
          if (response.data.user.outlets && response.data.user.outlets.length) {
            window.sessionStorage.setItem('token', response.data.accessToken)
            window.sessionStorage.setItem('user', response.data.user.id)
            serviceStore.setRest(response.data.user.outlets[0])
            window.sessionStorage.setItem('selectedRest', response.data.user.outlets[0])
            if (response.data.user.role.includes('caller')) {
              push({
                name: 'callCenters',
              })
            } else {
              push({
                name: 'articles',
              })
            }
          } else {
            init({ message: err.response.data.message, color: 'danger' })
          }
        } else {
          window.sessionStorage.setItem('token', response.data.accessToken)
          window.sessionStorage.setItem('user', response.data.user.id)
          push({ name: 'list' })
        }
      })
      .catch((err) => {
        console.log(err)
        init({ message: err.response.data.message, color: 'danger' })
      })
  }
}
</script>

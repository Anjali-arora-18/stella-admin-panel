<script setup lang="ts">
import { ref, watchEffect, reactive } from 'vue'
import ResturantTable from './widgets/ResturantTable.vue'
import { User } from './types'
import { useUsers } from './composables/useUsers'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import { useProjects } from '../projects/composables/useProjects'
import { useRouter } from 'vue-router'
const { users, isLoading, filters, sorting, pagination, error, ...usersApi } = useUsers()

const { validate } = useForm('form')
const { init: notify } = useToast()
const router = useRouter()

const formData = reactive({
  name: '',
})

watchEffect(() => {
  if (error.value) {
    notify({
      message: error.value.message,
      color: 'danger',
    })
  }
})
</script>

<template>
  <h1 class="page-title font-bold">General Configurations</h1>
  <VaCard>
    <VaCardContent>
      <VaForm ref="form">
        <h1 class="font-semibold text-2xl mb-4">Details</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <VaInput v-model="name" :rules="[validators.required]" label="Name" required-mark type="text" />
          <VaInput v-model="description" :rules="[validators.required]" label="Description" type="text" />
          <VaSelect
            label="Type"
            text-by="type"
            track-by="id"
            value-by="id"
            :rules="[validators.required]"
            :max-visible-options="2"
          >
            <option value="1">Restaurant</option>
          </VaSelect>
          <VaInput v-model="address" :rules="[validators.required]" label="Address" type="text" />
          <VaInput v-model="postcode" :rules="[validators.required]" label="Postcode" type="text" />
          <VaInput v-model="email" :rules="[validators.required, validators.email]" label="Email" type="email" />
          <VaInput v-model="phone" :rules="[validators.required]" label="Phone " type="text" />
          <VaInput v-model="facebook" :rules="[validators.required]" label="Facebook  " type="text" />
          <VaInput v-model="instagram" :rules="[validators.required]" label="Instagram  " type="text" />
          <VaInput v-model="twitter" :rules="[validators.required]" label="Twitter  " type="text" />
          <VaInput v-model="website" :rules="[validators.required]" label="Website  " type="text" />
          <VaInput v-model="tripadvisor" :rules="[validators.required]" label="TripAdvisor  " type="text" />
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
  <VaCard class="mt-4">
    <VaCardContent>
      <VaForm ref="form">
        <h1 class="font-semibold text-2xl mb-4">Configuration</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col">
            <VaButtonToggle
              v-model="filters.isActive"
              color="background-element"
              border-color="background-element"
              :options="[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]"
            />
          </div>
          <VaSelect
            label="Mode"
            text-by="type"
            track-by="id"
            value-by="id"
            :rules="[validators.required]"
            :max-visible-options="2"
          >
            <option value="1">View/Order</option>
          </VaSelect>
          <VaInput v-model="ordertime" :rules="[validators.required]" label="Order Time " type="number" />
          <VaInput v-model="closingsoon" :rules="[validators.required]" label="Closing Soon" type="number" />
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Delivery', value: true },
              { label: 'Dine-in', value: false },
            ]"
          />
          <VaSwitch size="small" />
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>

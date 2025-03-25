<template>
  <VaModal
    :mobile-fullscreen="false"
    size="small"
    hide-default-actions
    max-width="530px"
    model-value
    close-button
    @update:modelValue="emits('cancel')"
  >
    <h1 class="va-h5 mb-4">Edit Sub Categories</h1>
    <VaForm ref="form" @submit.prevent="submit">
      <VaSwitch v-model="active" class="w-fit mb-4" label="isActive" left-label size="small" />
      <VaInput class="mb-4" label="Code" placeholder="Code" />
      <VaInput class="mb-4" label="Family Code" placeholder="Family Code" />
      <VaInput class="mb-4" label="Sub Family Code" placeholder="Sub Family Code" />
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
// import { buttonStyles } from '../styles'
import { useToast, useForm } from 'vuestic-ui'

const userStore = useUsersStore()
const { validate } = useForm('form')
const { init } = useToast()
const emits = defineEmits(['cancel'])

const active = ref<boolean>(false)
const Code = ref<string>()
const Designation = ref<string>()
const FamilyCode = ref<string>()
const SubFamilyCode = ref<string>()

const submit = () => {
  if (validate()) {
    const url: any = import.meta.env.VITE_API_BASE_URL
    axios
      .patch(`${url}/users/${userStore.userDetails.id}`, {
        isActive: active.value,
        Code: Code.value,
        Designation: Designation.value,
        FamilyCode: FamilyCode.value,
        SubFamilyCode: SubFamilyCode.value,
      })
      .then((response) => {
        init({ message: "You've successfully updated", color: 'success' })
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

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
    <h1 class="va-h5 mb-4">Create Table</h1>
    <VaForm>
      <VaSelect id="type" label="Type" class="w-full mb-2" />
      <VaInput class="mb-4" label="Numbers" placeholder="Numbers" type="number" />
      <VaInput class="mb-4" label="Prefix" placeholder="prefix" type="number" />
      <VaSelect id="area" label="Area" class="w-full mb-2" />
      <VaInput class="mb-4" label="Discount" placeholder="Discount" type="number" />
      <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
        <VaButton :style="buttonStyles" preset="secondary" color="secondary" @click="emits('cancel')"> Cancel</VaButton>
        <VaButton :style="buttonStyles" class="mb-4 md:mb-0" type="submit"> Save</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useUsersStore } from '../../../stores/users'
import { useToast, useForm } from 'vuestic-ui'

const userStore = useUsersStore()
const { validate } = useForm('form')
const { init } = useToast()
const emits = defineEmits(['cancel'])
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
</style>

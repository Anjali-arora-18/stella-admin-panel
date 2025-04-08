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
    <h1 class="va-h5 mb-4">Create Area</h1>
    <VaForm ref="form" @submit="submit()">
      <VaInput
        v-model="areaName"
        :rules="[validators.required]"
        class="mb-4"
        label="Name"
        placeholder="Name"
        type="text"
      />
      <VaSwitch v-model="areaDisabled" class="mb-4" size="small" label="Is Disabled?" />
      <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
        <VaButton preset="secondary" color="secondary" @click="emits('cancel')"> Cancel</VaButton>
        <VaButton class="mb-4 md:mb-0" type="submit"> Save</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { validators } from '../../../services/utils'
const { validate } = useForm('form')
const emits = defineEmits(['cancel', 'submitArea', 'updateArea'])
const props = defineProps({
  outletId: {
    type: String,
    default: '',
  },
  area: {
    type: Object,
    default: null,
  },
})

const areaName = ref('')
const areaDisabled = ref(false)
console.log(props.area)
if (props.area) {
  areaName.value = props.area.name
  areaDisabled.value = props.area.disabled
}

function submit() {
  if (validate()) {
    if (!props.outletId) emits('submitArea', { areaName: areaName.value, areaDisabled: areaDisabled.value })
    else emits('updateArea', { ...props.area, areaName: areaName.value, areaDisabled: areaDisabled.value })
  }
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
</style>

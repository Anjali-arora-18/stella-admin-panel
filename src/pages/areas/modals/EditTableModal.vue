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
    <VaForm ref="form" @submit="save">
      <VaSelect
        id="type"
        v-model="table.type"
        :rules="[validators.required]"
        label="Type"
        :options="['Table', 'Delivery', 'Takeaway', 'Umbrella', 'Sunbed', 'Office']"
        class="w-full mb-2"
      />
      <VaInput
        v-model="table.number"
        :rules="[validators.required]"
        class="mb-4"
        label="Numbers"
        placeholder="Numbers"
        type="number"
      />
      <VaInput
        v-model="table.name"
        :rules="[validators.required]"
        class="mb-4"
        label="Name"
        placeholder="Name"
        type="text"
      />
      <VaInput v-model="table.prefix" class="mb-4" label="Prefix" placeholder="prefix" type="number" />
      <VaInput v-model="table.discount" class="mb-4" label="Discount" placeholder="Discount" type="number" />
      <VaCheckbox v-model="table.active" label="Is active?" />
      <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
        <VaButton preset="secondary" color="secondary" @click="emits('cancel')"> Cancel</VaButton>
        <VaButton class="mb-4 md:mb-0" type="submit"> Save</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref, defineEmits } from 'vue'
import { useToast, useForm } from 'vuestic-ui'
import { validators } from '../../../services/utils'
import { useServiceStore } from '../../../stores/services'
const props = defineProps({
  areaId: { type: String, default: '' },
  tableData: {
    type: Object,
    default: null,
  },
})
const { validate } = useForm('form')
const { init } = useToast()
const emits = defineEmits(['cancel', 'loadAreas'])
const serviceStore = useServiceStore()
const table: any = ref({
  type: '',
  number: 1,
  prefix: '',
  name: '',
  areaId: '',
  discount: 0,
  active: true,
})

if (props.tableData) {
  table.value = props.tableData
}

async function save() {
  if (validate()) {
    let response: any = ''
    if (props.tableData) {
      const data = {
        data: {
          ...table.value,
        },
        id: table.value._id,
      }
      response = await serviceStore.updateTable({ ...data, areaId: props.areaId })
    } else {
      const data = {
        ...table.value,
        areaId: props.areaId,
      }
      response = await serviceStore.createTable(data)
    }
    if (response.status === 200 || response.status === 201) {
      init({ message: 'Data saved successfully', color: 'success' })
    } else {
      init({ message: response.data, color: 'danger' })
    }
    emits('loadAreas')
    emits('cancel')
  }
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
</style>

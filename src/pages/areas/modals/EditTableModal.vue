<template>
  <VaModal
    :mobile-fullscreen="false"
    size="small"
    hide-default-actions
    max-width="420px"
    model-value
    close-button
    @update:modelValue="emits('cancel')"
  >
    <h1 class="va-h6">{{ tableData ? 'Edit Table' : 'Create Table' }}</h1>
    <VaForm ref="form" @submit="save">
      <VaSelect
        id="area"
        v-model="table.areaId"
        :options="areas"
        :track-by="(option) => option.value"
        :value-by="(option) => option.value"
        :rules="[validators.required]"
        required-mark
        label="Area"
        class="w-full mb-1"
      />
      <VaSelect
        id="type"
        v-model="table.type"
        :rules="[validators.required]"
        label="Type"
        :options="['Table', 'Delivery', 'Takeaway', 'Umbrella', 'Sunbed', 'Office']"
        class="w-full mb-1"
      />
      <div v-if="!tableData" class="mb-1 flex flex-wrap gap-4">
        <VaInput
          v-model="table.from"
          :rules="[validators.required]"
          class="flex-1 min-w-[120px]"
          label="Range From"
          placeholder="From"
          type="number"
        />
        <VaInput
          v-model="table.to"
          :rules="[validators.required]"
          class="flex-1 min-w-[120px]"
          label="Range To"
          placeholder="To"
          type="number"
        />
      </div>
      <VaInput
        v-else
        v-model="table.number"
        :rules="[validators.required]"
        class="mb-1"
        label="Number"
        placeholder="Number"
        type="text"
      />
      <VaInput
        v-model="table.name"
        :rules="[validators.required]"
        class="mb-1"
        label="Name"
        placeholder="Name"
        type="text"
      />
      <VaInput v-if="!tableData" v-model="table.prefix" class="mb-1" label="Prefix" placeholder="prefix" type="text" />
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
import { ref, defineEmits, computed } from 'vue'
import { useToast, useForm } from 'vuestic-ui'
import { validators } from '../../../services/utils'
import { useServiceStore } from '../../../stores/services'
const props = defineProps({
  area: { type: Array, default: null },
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
  // area: '',
  type: '',
  number: 1,
  prefix: '',
  from: 0,
  to: 0,
  name: '',
  areaId: '',
  discount: 0,
  active: true,
})

if (props.tableData) {
  table.value = props.tableData
} else {
  table.value.from = 1
  table.value.to = 1
}

const areas = computed(() =>
  props.area.map((e: any) => {
    return { text: e.name, value: e._id }
  }),
)

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
      delete data.data.updatedAt;
      delete data.data.createdAt;
      response = await serviceStore.updateTable({ ...data })
    } else {
      const data = {
        ...table.value,
        // area: table.value.areaId,
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

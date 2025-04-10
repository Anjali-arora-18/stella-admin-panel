<template>
  <VaModal
    class="big-form"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    model-value
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="sticky va-h6 mb-4">{{ selectedArticle ? 'Update' : 'Add' }}</h1>
    </template>
    <VaForm ref="form" @submit.prevent="submit">
      <div class="flex items-center gap-x-10 mb-2">
        <VaInput
          v-model="formData.wCode"
          class="mb-1 max-w-[200px]"
          label="Code"
          :rules="[validators.required]"
          placeholder="Code"
          required-mark
          type="number"
        />
        <VaInput
          v-model="formData.name"
          :rules="[validators.required]"
          class="mb-1 max-w-[200px]"
          label="Name"
          required-mark
          placeholder="Name"
          type="text"
        />
        <VaInput
          v-model="formData.description"
          label="Description"
          placeholder="Description"
          type="text"
          class="mb-1 max-w-[200px]"
        />
        <VaInput v-model="formData.price" label="Price" placeholder="Price" type="number" class="mb-1 max-w-[200px]" />
      </div>
      <div class="flex items-center gap-x-10">
        <VaSelect
          id="categories"
          v-model="formData.areaId"
          label="Category"
          :options="categories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
        <VaSelect
          id="sub_categories"
          v-model="formData.areaId"
          label="Sub-Category"
          :options="sub_categories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
        <VaSelect
          id="options"
          v-model="formData.areaId"
          label="Options"
          :options="options"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
        <VaSelect
          id="allergens"
          v-model="formData.areaId"
          label="Allergens"
          :options="allergens"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
      </div>
    </VaForm>
    <template #footer>
      <div class="flex md:justify-end md:space-x-4">
        <VaButton class="mb-4 md:mb-0" type="submit" @click="submit">{{
          selectedCategory ? 'Update' : 'Add'
        }}</VaButton>
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
  selectedCategory: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()

const servicesStore = useServiceStore()
const areas = ref([])
servicesStore.getAreas().then((response) => {
  areas.value = response.data.map((e) => {
    return {
      text: e.name,
      value: e._id,
    }
  })
})

const formData = ref({
  name: '',
  wCode: '',
  areaId: [],
  isActive: true,
  description: '',
  sortOrder: 0,
  outletId: '',
  subCategories: [],
})
if (props.selectedCategory) {
  formData.value = {
    ...formData.value,
    ...props.selectedCategory,
    areaId: [props.selectedCategory.areaId],
  }
}
const submit = () => {
  if (validate()) {
    const data = formData.value
    data.outletId = servicesStore.selectedRest
    const url: any = import.meta.env.VITE_API_BASE_URL
    if (props.selectedCategory) {
      axios
        .patch(`${url}/menuCategories/${formData.value._id}`, data)
        .then((response) => {
          init({ message: "You've successfully updated", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    } else {
      axios
        .post(`${url}/menuCategories`, data)
        .then((response) => {
          init({ message: "You've successfully created", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    }
  }
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
.schedule {
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.4px;
  min-height: 14px;
  font-family: var(--va-font-family);
  color: var(--va-primary);
  font-weight: 700;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

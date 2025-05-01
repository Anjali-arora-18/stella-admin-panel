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
      <h1 class="sticky va-h6 mb-4">{{ titleName }}</h1>
    </template>
    <VaForm ref="form" @submit.prevent="submit">
      <div class="flex items-center gap-x-10 mb-2">
        <VaInput
          v-model="formData.code"
          class="mb-1 max-w-[200px]"
          label="Code"
          :rules="[validators.required]"
          placeholder="Code"
          required-mark
          type="text"
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
          v-model="formData.categories"
          label="Category"
          :options="categories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
        <VaSelect
          id="sub_categories"
          v-model="formData.subCategories"
          label="Sub-Category"
          :options="subCategories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
        <VaSelect id="options" disabled label="Options" :multiple="true" value-by="value" class="mb-1 max-w-[200px]" />
        <VaSelect
          id="allergens"
          disabled
          label="Allergens"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[200px]"
        />
      </div>
      <div class="flex-1">
        <VaInput v-model="formData.imageUrl" label="Image URL" type="url" />
        <img v-if="formData.imageUrl" :src="formData.imageUrl" alt="Image" class="w-32 h-32 mt-2" />
      </div>
    </VaForm>
    <template #footer>
      <div class="flex md:justify-end md:space-x-4">
        <VaButton class="mb-4 md:mb-0" type="submit" @click="submit">{{ titleName }}</VaButton>
      </div>
    </template>
  </VaModal>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useCategoryStore } from '@/stores/categories'
import { useServiceStore } from '@/stores/services'
import { useToast, useForm } from 'vuestic-ui'
import ProfileDropdown from '@/components/navbar/components/dropdowns/ProfileDropdown.vue'
const categoryStore = useCategoryStore()
const categories = ref([])
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedCategory: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()
const formData = ref({
  name: '',
  code: '',
  isDeleted: false,
  price: 0,
  categories: [],
  isActive: true,
  description: '',
  imageUrl: '',
  inStock: true,
  outletId: '',
  subCategories: [],
})
if (props.selectedCategory) {
  formData.value = {
    ...formData.value,
    ...props.selectedCategory,
    categories: props.selectedCategory.categories.map((e) => e.wCode),
    subCategories: props.selectedCategory.subCategories.map((e) => e.wCode),
  }
}
const servicesStore = useServiceStore()
categoryStore.getAll(servicesStore.selectedRest).then((response) => {
  categories.value = response.map((e) => {
    return {
      ...e,
      text: e.name,
      value: e.wCode,
    }
  })
})

const subCategories = computed(() => {
  if (!formData.value.categories.length) {
    return []
  } else {
    const selectedCategories = categories.value.filter((e) => formData.value.categories.includes(e.wCode))
    const allSubCategories = selectedCategories.flatMap((category) =>
      (category.subCategories || []).map((sub) => ({
        text: sub.name,
        value: sub.wCode,
        code: sub.wCode,
      })),
    )
    return allSubCategories
  }
})

const titleName = computed(() => {
  if (props.selectedCategory && !props.selectedCategory._id) {
    return 'Duplicate'
  } else if (props.selectedCategory && props.selectedCategory._id) {
    return 'Update'
  } else {
    return 'Add'
  }
})

const submit = () => {
  if (validate()) {
    const data = formData.value
    data.code = formData.value.code.toString()
    data.categories = formData.value.categories.map((e) => {
      {
        return { code: e }
      }
    })
    data.subCategories = formData.value.subCategories.map((e) => {
      {
        return { code: e }
      }
    })
    data.outletId = servicesStore.selectedRest
    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    const url: any = import.meta.env.VITE_API_BASE_URL
    if (formData.value._id) {
      axios
        .patch(`${url}/menuItems/${formData.value._id}`, data)
        .then((response) => {
          init({ message: "You've successfully updated", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    } else {
      axios
        .post(`${url}/menuItems`, data)
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

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
        <VaInput v-model="formData.code" class="mb-1 max-w-[150px]" label="Code" placeholder="Code" type="text" />
        <VaInput
          v-model="formData.name"
          :rules="[validators.required]"
          class="mb-1 max-w-[230px]"
          label="Name"
          required-mark
          placeholder="Name"
          type="text"
        />

        <VaSelect
          id="categories"
          v-model="formData.categories"
          label="Category"
          :options="categories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[230px]"
        />
        <VaSelect
          id="sub_categories"
          v-model="formData.subCategories"
          label="Sub-Category"
          :options="subCategories"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[230px]"
        />
      </div>
      <div class="flex items-center gap-x-10">
        <VaInput v-model="formData.price" label="Price" placeholder="Price" type="number" class="mb-1 max-w-[200px]" />
        <VaSelect id="options" disabled label="Options" :multiple="true" value-by="value" class="mb-1 max-w-[200px]" />
        <VaSelect
          id="allergens"
          v-model="formData.allergenIds"
          label="Allergens"
          :options="allergenOptions"
          :multiple="true"
          value-by="id"
          class="mb-1 max-w-[200px]"
          max-height="300px"
        />
      </div>
      <div class="flex-1">
        <VaTextarea
          v-model="formData.description"
          label="Description"
          placeholder="Description"
          type="textarea"
          :min-rows="4"
          :max-rows="4"
          class="mb-1 w-full"
        />
      </div>
      <div class="flex-1">
        <label
          class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer mt-2"
          style="color: var(--va-primary)"
          >Image</label
        >
        <FileUpload
          :selected-rest="selectedRest"
          @uploadSuccess="(data) => ((formData.imageUrl = data.url), (formData.assetId = data._id))"
        ></FileUpload>
        <div class="flex items-center">
          <img v-if="formData.imageUrl" :src="formData.imageUrl" alt="Image" class="w-32 h-32 mt-2" />
          <VaButton
            v-if="formData.assetId"
            preset="primary"
            size="medium"
            color="danger"
            icon="mso-delete"
            class="ml-2 h-12 w-12"
            @click="deleteAsset"
          />
        </div>
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
import { useSubCategoriesStore } from '@/stores/subCategories'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
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
  allergenIds: [],
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
    assetId: props.selectedCategory.assetId ? props.selectedCategory.assetId._id : null,
  }
}
const servicesStore = useServiceStore()

const selectedRest = computed(() => servicesStore.selectedRest)
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
        ...sub,
        text: sub.name,
        value: sub.wCode,
        code: sub.wCode,
      })),
    )
    return allSubCategories
  }
})
const subCategoryStore = useSubCategoriesStore()
const allergenOptions = subCategoryStore.allergenOptions.map((e) => {
  return { text: e.text, id: e.id }
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
    // data.code = formData.value.code.toString()
    const cate = JSON.parse(JSON.stringify(categories.value))
    const subCate = JSON.parse(JSON.stringify(subCategories.value))
    data.categories = formData.value.categories
      .map((e) => {
        {
          return { id: cate.find((cat) => cat.wCode === e) ? cate.find((cat) => cat.wCode === e)._id : '' }
        }
      })
      .filter((a) => a.id)
    data.subCategories = formData.value.subCategories
      .map((e) => {
        console.log(e, subCategories)
        {
          return {
            id: subCate.find((subCat) => subCat.wCode === e) ? subCate.find((subCat) => subCat.wCode === e)._id : '',
          }
        }
      })
      .filter((a) => a.id)
    data.outletId = servicesStore.selectedRest
    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    if (!data.assetId) {
      delete data.assetId
    }
    const url: any = import.meta.env.VITE_API_BASE_URL
    if (formData.value._id) {
      // if (data.code === props.selectedCategory.code) {
      //   delete data.code
      // }
      axios
        .patch(`${url}/menuItems/${formData.value._id}`, data)
        .then((response) => {
          init({ message: "You've successfully updated", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.error, color: 'danger' })
        })
    } else {
      axios
        .post(`${url}/menuItems`, data)
        .then((response) => {
          init({ message: "You've successfully created", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.error, color: 'danger' })
          emits('cancel')
        })
    }
  }
}

const deleteAsset = () => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  axios
    .delete(`${url}/assets/${formData.value.assetId}`)
    .then(() => {
      formData.value.imageUrl = ''
      formData.value.assetId = ''
      init({ message: 'Asset deleted successfully', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
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

<template>
  <VaModal size="medium" hide-default-actions model-value close-button @update:modelValue="emits('cancel')">
    <h1 class="va-h6 mb-4">Import Categories</h1>
    <div v-if="!loading">
      <VaForm ref="form" @submit.prevent="importData">
        <div class="mb-4 bg-blue-50 p-5 rounded-lg">
          <div v-for="category in categories" :key="category.Code" class="mb-2">
            <VaCheckbox v-model="category.isChecked" :label="category.Code + ' - ' + category.Designation" />
            <div v-if="category.SubCategories.length" class="ml-4 flex flex-col">
              <VaCheckbox
                v-for="subCategory in category.SubCategories"
                :key="subCategory.Code"
                v-model="subCategory.isChecked"
                size="small"
                :label="subCategory.Code + ' - ' + subCategory.Designation"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
          <VaButton class="mb-4 md:mb-0" type="submit"> Import</VaButton>
        </div>
      </VaForm>
    </div>
    <div v-else>
      <VaSkeleton variant="text" :lines="5" />
    </div>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { useToast, useForm } from 'vuestic-ui'
import { useServiceStore } from '@/stores/services'
const { init } = useToast()
const emits = defineEmits(['cancel'])
const serviceStore = useServiceStore()
const loading = ref<boolean>(true)
const categories = ref<any[]>([])
const getCategories = async () => {
  loading.value = true
  const url: any = import.meta.env.VITE_API_BASE_URL
  try {
    const response = await axios.get(`${url}/winmax/categories?outletId=${serviceStore.selectedRest}`)
    categories.value = response.data.categories.map((category) => {
      return {
        ...category,
        isChecked: true,
        SubCategories: Object.keys(category).includes('SubCategories')
          ? category.SubCategories.map((subCategory) => ({
              ...subCategory,
              isChecked: true,
            }))
          : [],
      }
    })
    loading.value = false
    return response.data
  } catch (error) {
    loading.value = false
  }
}

getCategories()

const importData = () => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  const filteredPayload = categories.value
    .filter((category) => category.isChecked)
    .map((category) => ({
      ...category,
      SubCategories: category.SubCategories.filter((subCategory) => subCategory.isChecked),
    }))

  const payload = {
    categories: filteredPayload,
    outletId: serviceStore.selectedRest,
    categoryCodes: filteredPayload.map((category) => {
      return {
        categoryCode: category.Code.toString(),
        SubCategoriesCodes: category.SubCategories.map((subCategory) => subCategory.Code.toString()),
      }
    }),
  }
  axios
    .post(`${url}/menuCategories/import`, payload)
    .then((response) => {
      if (response.data.successfullyImportedCategories.length) {
        init({
          message: 'Successfully imported ' + response.data.successfullyImportedCategories.length + ' categories',
          color: 'success',
        })
      }
      if (response.data.failedToImportCategories.length) {
        init({
          message: 'Failed to import ' + response.data.failedToImportCategories.length + ' categories',
          color: 'danger',
        })
      }
      if (!response.data.failedToImportCategories.length && !response.data.successfullyImportedCategories.length) {
        init({
          message: 'Nothing imported',
          color: 'warning',
        })
      }
      emits('cancel')
    })
    .catch((err) => {
      init({ message: err.response.data.message, color: 'danger' })
    })
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
</style>

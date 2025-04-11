<template>
  <VaModal size="large" hide-default-actions model-value close-button @update:modelValue="emits('cancel')">
    <h1 class="va-h6 mb-2 mt-0">Import Articles</h1>
    <div>
      <VaStepper v-model="step" controls-hidden :steps="steps">
        <template #step-content-0>
          <div>
            <div v-if="!loading">
              <VaForm ref="form" class="max-h-[200px] overflow-y-auto mb-2">
                <div class="bg-blue-50 p-5 rounded-lg">
                  <div v-for="family in families" :key="family.Code" class="mb-2">
                    <VaCheckbox v-model="family.isChecked" :label="family.Code + ' - ' + family.Designation" />
                    <div v-if="family.SubFamilies.length" class="ml-4 space-y-2 flex flex-col">
                      <VaCheckbox
                        v-for="SubFamily in family.SubFamilies"
                        :key="SubFamily.Code"
                        v-model="SubFamily.isChecked"
                        size="small"
                        :label="SubFamily.Code + ' - ' + SubFamily.Designation"
                      />
                    </div>
                  </div>
                </div>
              </VaForm>
              <VaForm ref="form">
                <div class="mb-0 bg-blue-50 p-5 rounded-lg">
                  <VaCheckbox v-model="formData.includeCategories" label="IncludeCategories" class="mr-3" />
                  <VaCheckbox v-model="formData.includeExtras" label="IncludeExtras" class="mr-3" />
                  <VaCheckbox v-model="formData.includeHolds" label="IncludeHolds" class="mr-3" />
                  <VaCheckbox v-model="formData.includeDescriptives" label="IncludeDescriptives" />
                </div>
              </VaForm>
              <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
                <VaButton class="my-4 md:mb-0" :loading="isLoading" :disabled="isLoading" @click="importData"
                  >Fetch</VaButton
                >
              </div>
            </div>
            <div v-else>
              <VaSkeleton variant="text" :lines="5" />
            </div>
          </div>
        </template>
        <template #step-content-1>
          <div class="mb-4">
            <VaInput v-model="searchQuery" placeholder="Search articles..." class="w-full" size="small" />
          </div>
          <div class="max-h-[200px] overflow-y-auto">
            <div v-for="family in filteredFamilies" :key="family.code" class="mb-2">
              <VaCheckbox v-model="family.isChecked" :label="`${family.Code} - ${family.Designation}`" />
            </div>
          </div>
          <div class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4">
            <VaButton class="my-4 md:mb-0" :loading="isLoading" :disabled="isLoading" @click="importData"
              >Import</VaButton
            >
          </div>
        </template>
      </VaStepper>
    </div>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast, useForm } from 'vuestic-ui'
import { useServiceStore } from '@/stores/services'
const { init } = useToast()
const emits = defineEmits(['cancel'])
const serviceStore = useServiceStore()
const loading = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const families = ref<any[]>([])
const step = ref(0)

const steps = [{ label: 'Fetch Families' }, { label: 'Import Articles' }]
const fetchedFamilies = ref([])
const formData = ref({
  includeCategories: false,
  includeExtras: false,
  includeHolds: false,
  includeDescriptives: false,
})
const searchQuery = ref('')

const filteredFamilies = computed(() => {
  return fetchedFamilies.value.filter(
    (family) =>
      family.Code.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      family.Designation.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})
const getfamilies = async () => {
  loading.value = true
  const url: any = import.meta.env.VITE_API_BASE_URL
  try {
    const response = await axios.get(`${url}/winmax/families?outletId=${serviceStore.selectedRest}`)

    families.value = response.data.families.map((family) => {
      return {
        ...family,
        isChecked: true,
        SubFamilies: Object.keys(family).includes('SubFamilies')
          ? family.SubFamilies.map((SubFamily) => ({
            ...SubFamily,
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

getfamilies()

const importData = async () => {
  isLoading.value = true
  const url: any = import.meta.env.VITE_API_BASE_URL
  const filteredPayload = families.value
    .filter((family) => family.isChecked)
    .map((family) => ({
      familyCode: family.Code.toString(),
      subFamilyCodes: family.SubFamilies.filter((SubFamily) => SubFamily.isChecked).map((SubFamily) =>
        SubFamily.Code.toString(),
      ),
    }))

  const payload = {
    filterSchema: filteredPayload,
    includeCategories: formData.value.includeCategories,
    includeExtras: formData.value.includeExtras,
    includeHolds: formData.value.includeHolds,
    includeDescriptives: formData.value.includeDescriptives,
  }
  await axios
    .post(`${url}/winmax/articles?outletId=${serviceStore.selectedRest}`, payload)
    .then((response) => {
      init({
        message: response.data.message,
        color: 'success',
      })
      fetchedFamilies.value = response.data.articles.map((e) => {
        return {
          ...e,
          isChecked: true,
        }
      })
      step.value = 1
    })
    .catch((err) => {
      init({ message: err.response.data.message, color: 'danger' })
    })

  isLoading.value = false
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
.va-stepper__step-content {
  margin-bottom: 0px !important;
}
</style>

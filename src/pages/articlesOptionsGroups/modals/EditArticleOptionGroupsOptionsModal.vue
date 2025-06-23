<script setup lang="ts">
import { ref, defineEmits, watch, computed } from 'vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
const props = defineProps({
  selectedOptions: {
    type: Object || String,
    default: () => '',
  },
})
const emits = defineEmits(['cancel'])
const servicesStore = useServiceStore()
const items = ref([])
const { init } = useToast()
const isLoading = ref(false)
const isSubmitting = ref(false)

const searchQuery = ref('')
const filteredItems = computed(() =>
  items.value.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

const defaultOptions = ref([])

console.log(props.selectedOptions)

defaultOptions.value = props.selectedOptions.defaultOptions

const selectAll = ref(false)
const toggleAll = () => {
  items.value.forEach((item) => {
    item.isChecked = selectAll.value
  })
}
watch(
  items,
  () => {
    const allChecked = items.value.length > 0 && items.value.every((p) => p.isChecked)
    if (selectAll.value !== allChecked) {
      selectAll.value = allChecked
    }
  },
  { deep: true },
)
const updateSelectAll = () => {
  const allChecked = items.value.length > 0 && items.value.every((p) => p.isChecked)
  selectAll.value = allChecked
}
const getOptions = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(url + '/articles-options?limit=500&outletId=' + servicesStore.selectedRest)

    items.value = response.data.result.map((e) => {
      return {
        ...e,
        isChecked: props.selectedOptions.options?.includes(e._id) || false,
        isOriginalChecked: props.selectedOptions.options.includes(e._id),
      }
    })
  } catch (error) {
    init({ message: 'Failed to load Options', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}
getOptions()

const setDefaultOptions = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  try {
    await axios.patch(`${url}/articles-options-groups/${props.selectedOptions._id}`, {
      defaultOptions: defaultOptions.value,
    })
  } catch (error) {
    console.error('Error loading default options:', error.response?.data || error)
    init({ message: 'Failed to load default options', color: 'warning' })
  }
}

const initOptions = async () => {
  if (!props.selectedOptions || !props.selectedOptions._id) return
  await getOptions()
}

watch(
  () => props.selectedOptions,
  (val) => {
    if (val && val._id) {
      initOptions()
    }
  },
  { immediate: true },
)

async function submit() {
  isSubmitting.value = true
  setDefaultOptions()
  const url = import.meta.env.VITE_API_BASE_URL
  const selectedOptions = items.value.filter((item) => item.isChecked).map((item) => item._id)
  const removedOptions = items.value.filter((item) => !item.isChecked && item.isOriginalChecked).map((item) => item._id)
  if (selectedOptions.length) {
    try {
      await axios.patch(`${url}/articles-options-groups/${props.selectedOptions._id}/add-options`, {
        optionIds: selectedOptions,
      })
    } catch (error) {
      init({ message: error.response.data.message, color: 'danger' })
      return
    }
  }

  if (removedOptions.length > 0) {
    try {
      await axios.patch(`${url}/articles-options-groups/${props.selectedOptions._id}/remove-options`, {
        optionIds: removedOptions,
      })
    } catch (error) {
      init({ message: error.response.data.message, color: 'danger' })
      return
    }
  }
  init({ message: 'Options updated successfully', color: 'success' })
  isSubmitting.value = false
  emits('cancel')
}

function checkDefaultOptions(id: any) {
  if (defaultOptions.value.includes(id)) {
    defaultOptions.value = defaultOptions.value.filter((optionId) => optionId !== id)
  } else {
    defaultOptions.value.push(id)
  }
}
</script>
<template>
  <VaModal
    class="big-modal"
    size="large"
    hide-default-actions
    :model-value="true"
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="va-h6 mb-2">Options</h1>
    </template>
    <div class="row align-items-center mb-2">
      <div class="mt-2 mb-4 w-full flex justify-start">
        <div class="w-1/2">
          <VaInput v-model="searchQuery" placeholder="Search..." clearable />
        </div>
      </div>

      <div class="max-h-[50vh] overflow-y-auto">
        <table class="w-full border-collapse border border-gray-200">
          <thead>
            <tr class="">
              <th colspan="2" class="p-2 text-left font-light">
                <div class="flex items-center space-x-2">
                  <VaCheckbox v-model="selectAll" label="Select All" @update:modelValue="toggleAll" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filteredItems"
              :key="item._id"
              :class="{ 'bg-gray-50': index % 2 === 0 }"
              class="border-b hover:bg-gray-100 transition-colors"
            >
              <td class="p-2">
                <div class="flex items-center gap-2">
                  <VaCheckbox v-model="item.isChecked" class="m-0" @update:modelValue="updateSelectAll" />
                  <span>
                    <template v-if="item.code">{{ item.code }}</template>
                    <template v-if="item.code && (item.name || item.posName)"> - </template>
                    <template v-if="item.name">{{ item.name }}</template>
                    <template v-if="item.name && item.posName"> - </template>
                    <template v-if="item.posName">{{ item.posName }}</template>
                  </span>
                  <div class="flex items-center flex-wrap gap-2">
                    <span
                      class="ml-2 cursor-pointer text-xs font-semibold px-3 py-0.5 rounded-full transition-all duration-200 shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-200 via-green-300 to-green-400 text-green-900 border border-green-500':
                          defaultOptions.includes(item._id),
                        'bg-gray-200 text-gray-700 hover:bg-gray-300': !defaultOptions.includes(item._id),
                      }"
                      @click="checkDefaultOptions(item._id)"
                    >
                      Default
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end mt-4">
        <VaButton :loading="isSubmitting || isLoading" :disabled="isSubmitting" type="button" @click="submit">
          Update
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

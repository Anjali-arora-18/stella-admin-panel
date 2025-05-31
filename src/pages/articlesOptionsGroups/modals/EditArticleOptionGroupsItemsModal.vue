<template>
  <VaModal
    class="big-form"
    size="large"
    hide-default-actions
    :model-value="true"
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="va-h6 mb-2">Add / Remove Category & Sub Category</h1>
    </template>
    <div v-if="!isLoading">
      <div class="grid md:grid-cols-2 gap-5">
        <!-- Categories Column -->
        <div>
          <div class="mt-2 mb-4 w-full flex justify-start">
            <div class="w-full">
              <VaInput v-model="searchQuery" placeholder="Search..." clearable />
            </div>
          </div>
          <h1 class="text-base mb-5 font-bold">Categories</h1>
          <div class="max-h-[60vh] overflow-y-auto">
            <div class="category-list">
              <div
                v-for="category in filteredCategories"
                :key="category.id"
                class="category-item"
                :class="{ active: selectedCategory === category }"
                @click="selectedCategory = category"
              >
                <div class="flex items-center justify-between mb-2 border-b pb-2">
                  <VaCheckbox v-model="category.selected" :label="category.name" />
                  <span v-if="category.subCategories.length" class="cursor-pointer text-sm mr-5"
                    >({{ category.subCategories.length }} Sub Categories)</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Subcategories Column -->
        <div>
          <h1 class="text-base mb-5 font-bold">Subcategories</h1>

          <div class="max-h-[60vh] overflow-y-auto">
            <div class="subcategory-list">
              <div
                v-for="subcategory in categories.filter((a) => a.selected).flatMap((a) => a.subCategories)"
                :key="subcategory.id"
                class="subcategory-item"
              >
                <div class="flex items-center justify-between mb-2 border-b pb-2">
                  <VaCheckbox v-model="subcategory.selected" :label="subcategory.name" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <VaSkeletonGroup v-if="isLoading" animation="wave">
      <VaCard>
        <VaCardContent>
          <VaSkeleton variant="text" height="64px" class="ml-2" :lines="5" />
        </VaCardContent>
        <VaCardActions class="flex justify-end" style="display: flex; justify-content: end">
          <VaSkeleton variant="rounded" inline width="64px" height="32px" />
        </VaCardActions>
      </VaCard>
    </VaSkeletonGroup>
    <template #footer>
      <div v-if="!isLoading" class="flex justify-end mt-4">
        <VaButton :disabled="isSubmitting" type="submit" @click="submit"> Update </VaButton>
      </div>
    </template>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import { useCategoryStore } from '@/stores/categories'
import { useToast, useForm } from 'vuestic-ui'
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedOptionGroup: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()
const isLoading = ref(false)
const isSubmitting = ref(false)

const searchQuery = ref('')
const filteredCategories = computed(() =>
  categories.value.filter((cat) => cat.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

const servicesStore = useServiceStore()
const categoriesStore = useCategoryStore()

const categories = ref([])

const getCategories = (outletId) => {
  isLoading.value = true

  categoriesStore.getAll(outletId, 'name', 'asc').then(() => {
    categories.value = categoriesStore.items.map((item) => ({
      ...item,
      selected: props.selectedOptionGroup.menuCategories.includes(item._id),
      subCategories: item.subCategories.map((sub) => ({
        ...sub,
        selected: props.selectedOptionGroup.menuSubCategories.includes(sub._id),
      })),
    }))
    isLoading.value = false
  })
}

getCategories(servicesStore.selectedRest)

const submit = async () => {
  isSubmitting.value = true
  try {
    const selectedCategories = categories.value.filter((cat) => cat.selected).map((cat) => cat._id)
    const selectedSubCategories = categories.value
      .filter((cat) => cat.selected)
      .flatMap((cat) => cat.subCategories.filter((sub) => sub.selected))
      .map((sub) => sub._id)

    await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/articles-options-groups/${props.selectedOptionGroup._id}`, {
      menuCategories: selectedCategories,
      menuSubCategories: selectedSubCategories,
    })
    init({ message: "You've successfully updated a Categories and Sub Categories", color: 'success' })
  } catch (error) {
    init({ message: error.response.data.message, color: 'danger' })
    isSubmitting.value = false
  } finally {
    emits('cancel')
    isSubmitting.value = false
  }
}
</script>

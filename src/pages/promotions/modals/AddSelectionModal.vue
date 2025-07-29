<template>
  <VaModal
    :model-value="isVisible"
    @update:modelValue="$emit('cancel')"
    class="big-xl-modal !p-0"
    size="large"
    close-button
    hide-default-actions
  >
    <!-- HEADER -->
    <template #header>
      <h1 class="va-h6 mb-3">Update Promotion Menu Items</h1>
    </template>

    <!-- FORM -->
    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid gap-4">
        <div>
          <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Menu Items
          </div>
          <VaInput
            v-model="searchQuery"
            placeholder="Search..."
            size="small"
            class="w-full mb-2"
          />
          <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-auto">
            <!-- ITEMS TABLE -->
            <table v-if="!isLoading" class="w-full text-sm">
              <tbody>
                <tr
                  v-for="item in filteredItems"
                  :key="item._id"
                  class="border-b hover:bg-orange-50"
                >
                  <td class="p-2">
                  <VaCheckbox
                    :model-value="selectedMenuItems.includes(item._id)"
                    @update:model-value="toggleSelection(item._id)"
                    :label="item.code + ' - ' + item.name"
                  />
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- LOADING SKELETON -->
            <VaSkeletonGroup v-else animation="wave">
              <VaCard>
                <VaCardContent>
                  <VaSkeleton variant="text" height="64px" class="ml-2" :lines="5" />
                </VaCardContent>
              </VaCard>
            </VaSkeletonGroup>
          </div>
        </div>
      </div>
    </VaForm>

    <!-- FOOTER -->
    <template #footer>
      <div class="flex justify-end mt-6 w-full">
        <VaButton type="submit" @click="submit()">Update</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRef } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { getPromotionById, updatePromotion } from '../services/promotionService'

/* Emits */
const emits = defineEmits(['cancel', 'promotionUpdated'])

/* Props */
const props = defineProps({
  isVisible: { type: Boolean, default: false },
  promotionId: { type: String, required: true },
  outletId: { type: String, required: true },
  isEditSelection: { type: Boolean, default: false },
  pendingSelections: {
    type: Object, // Reactive array (ref) from parent
    required: true
  }
})

/* Bind prop to local ref */
const isVisible = toRef(props, 'isVisible')

/* State */
const isLoading = ref(false)
const items = ref([])
const selectedMenuItems = ref<string[]>([])
const searchQuery = ref('')
const { init } = useToast()

/* Computed: Filtered list */
const filteredItems = computed(() =>
  items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)
function toggleSelection(id: string) {
  if (selectedMenuItems.value.includes(id)) {
    selectedMenuItems.value = selectedMenuItems.value.filter(i => i !== id)
  } else {
    selectedMenuItems.value.push(id)
  }
}

/* Fetch all menu items for outlet */
const fetchMenuItems = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menuItems`, {
      params: {
        outletId: props.outletId,
        sortKey: 'id',
        sortValue: 'asc',
        isDeleted: true
      }
    })
    items.value = res.data
  } catch (err) {
    console.error('Failed to fetch menu items:', err)
  } finally {
    isLoading.value = false
  }
}

/* Load selected promotion menu items */
const loadPromotion = async () => {
  try {
    const res = await getPromotionById(props.promotionId)
    const promo = res.data
    if (promo?.menuItem?.length) {
      selectedMenuItems.value = promo.menuItem
    }
  } catch (err) {
    console.error('Failed to load promotion details:', err)
  }
}

/* Submit selection */
const submit = async () => {
  try {
    if (!props.promotionId) {
      // Promotion not created yet
      emits('save-pending-selections', selectedMenuItems.value) // notify parent
      init({
        message: 'Selections saved and will be applied after promotion creation.',
        color: 'warning'
      })
      emits('cancel')
      return
    }

    // Promotion exists → update directly
    await updatePromotion(props.promotionId, {
      menuItem: selectedMenuItems.value,
      selections: props.pendingSelections // or updated selections array
    })
    init({ message: 'Promotion updated successfully!', color: 'success' })
    emits('promotionUpdated')
    emits('cancel')
  } catch (err) {
    init({
      message: err?.response?.data?.message || 'Failed to update promotion',
      color: 'danger'
    })
  }
}


/* Lifecycle: Fetch data when modal mounts */
onMounted(() => {
  fetchMenuItems()
  if (props.promotionId) loadPromotion()
})
</script>

<style scoped>
tr {
  width: 100%;
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.max-h-[36vh] {
  max-height: 36vh;
}
</style>

<template>
  <VaModal :model-value="isVisible" size="large" close-button hide-default-actions @update:modelValue="$emit('cancel')">
    <!-- HEADER -->
    <template #header>
      <h1 class="va-h6 mb-3">
        {{ props.type === 'options' ? 'Update Promotion Options' : 'Update Promotion Menu Items' }}
      </h1>
    </template>

    <!-- FORM -->
    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid gap-4">
        <div>
          <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
            {{ props.type === 'options' ? 'Options' : 'Menu Items' }}
          </div>

          <div class="flex flex-col gap-1 mb-2">
            <div>
              <VaInput v-model="searchQuery" placeholder="Search..." size="small" clearable style="width: 50%" />
            </div>
            <div>
              <VaCheckbox v-model="selectAll" class="m-1" label="Select All" />
            </div>
          </div>

          <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-auto">
            <!-- ITEMS TABLE -->
            <table v-if="!isLoading" class="w-full text-sm">
              <tbody>
                <tr v-for="item in sortedList" :key="item._id" class="border-b hover:bg-orange-50">
                  <td class="p-2">
                    <VaCheckbox
                      :model-value="isChecked(item._id)"
                      :label="item.code + ' - ' + item.name + (props.type === 'options' ? ' - ' + item.posName : '')"
                      @update:modelValue="toggleSelection(String(item._id))"
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
import { ref, computed, onMounted, toRef, watch, nextTick } from 'vue'
import { useToast } from 'vuestic-ui'
import axios from 'axios'
import { getPromotionById, updatePromotion, getArticlesByOutlet } from '../services/promotionService'

/* Emits */
const emits = defineEmits(['cancel', 'promotionUpdated', 'save-pending-selections'])

/* Props */
const props = defineProps({
  isVisible: { type: Boolean, default: false },
  promotionId: { type: String, required: true },
  outletId: { type: String, required: true },
  pendingSelections: { type: Array, default: () => [] },
  isEditSelection: { type: Boolean, default: false },
  type: { type: String, default: 'menuItems' },
})

/* State */
const isVisible = toRef(props, 'isVisible')
const isLoading = ref(false)
const items = ref<any[]>([])
const articles = ref<any[]>([])
const selectedMenuItems = ref<string[]>([])
const selectedArticles = ref<string[]>([])
const searchQuery = ref('')
const promotionData = ref<any>(null)
const { init } = useToast()
const selectAll = ref(false)

/* Computed lists */
const sourceList = computed(() => (props.type === 'options' ? articles.value : items.value))

const sortedList = computed(() => {
  const list = sourceList.value.filter((item) => item.display !== false)

  return list.sort((a, b) => {
    const selected = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value
    const aSelected = selected.includes(String(a._id)) ? -1 : 1
    const bSelected = selected.includes(String(b._id)) ? -1 : 1
    return aSelected - bSelected
  })
})

const selectedIds = computed(() => {
  const ids = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value
  console.log('[computed:selectedIds] Current selectedIds:', ids)
  return ids
})

if (props.type === 'options') {
  selectedArticles.value = [...props.pendingSelections]
} else {
  selectedMenuItems.value = [...props.pendingSelections]
}

// Add watch on searchQuery to update display property
watch(
  searchQuery,
  (query) => {
    if (Array.isArray(sourceList.value)) {
      sourceList.value.forEach((item) => {
        const name = item.name?.toLowerCase() || ''
        const code = item.code?.toLowerCase() || ''
        const posName = item.posName?.toLowerCase() || ''
        item.display =
          name.includes(query.toLowerCase()) ||
          code.includes(query.toLowerCase()) ||
          posName.includes(query.toLowerCase())
        const searchTerm = query.toLowerCase()
        item.display =
          name.includes(searchTerm) || code.includes(searchTerm) || posName.includes(searchTerm) || !searchTerm
      })
    }
  },
  { immediate: true },
)
watch(sourceList, () => {
  const visibleIds = sourceList.value.filter((item) => item.display !== false).map((item) => String(item._id))
  const targetList = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value

  const allSelected = visibleIds.every((id) => targetList.includes(id))
  selectAll.value = allSelected
})

/* Helper to check if item is selected */
function isChecked(id: string) {
  const normalized = String(id)
  const list = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value
  const exists = list.includes(normalized)

  console.log(`[isChecked] ID: ${normalized} | selected:`, list, '| exists:', exists)

  return exists
}

/* Reset search when modal closes (keep selections) */
watch(isVisible, (visible) => {
  console.log('[watch:isVisible] Modal visibility changed:', visible)
  if (!visible) {
    searchQuery.value = ''
  }
})

/* Pre-select items when promotionData AND items/articles are available */
watch([promotionData, items, articles], async ([promo]) => {
  console.log('[watch:promotionData+items+articles] Triggered with promo:', promo)

  if (!promo) return

  await nextTick()

  if (props.type === 'menuItems') {
    const validIds = items.value.map((i) => String(i._id))
    selectedMenuItems.value = (promo.menuItem || []).map(String).filter((id) => validIds.includes(id))

    console.log('[watch] Valid menuItems after filtering:', selectedMenuItems.value)
  }

  if (props.type === 'options') {
    const validIds = articles.value.map((i) => String(i._id))
    selectedArticles.value = (promo.option || []).map(String).filter((id) => validIds.includes(id))

    console.log('[watch] Valid options after filtering:', selectedArticles.value)
  }
})

watch(selectAll, (value) => {
  const visibleIds = sourceList.value.filter((a) => a.display).map((item) => String(item._id))
  console.log('[watch:selectAll] Visible IDs:', visibleIds, '| Select All:', value)
  const targetList = props.type === 'options' ? selectedArticles : selectedMenuItems

  if (value) {
    // Add all visible (filtered) IDs that are not already selected
    visibleIds.forEach((id) => {
      if (!targetList.value.includes(id)) targetList.value.push(id)
    })
  } else {
    // Remove only visible (filtered) IDs
    for (const id of visibleIds) {
      const index = targetList.value.indexOf(id)
      if (index !== -1) targetList.value.splice(index, 1)
    }
  }
})

/* Toggle selection */
function toggleSelection(id: string) {
  const target = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value

  const idx = target.indexOf(id)
  if (idx > -1) {
    target.splice(idx, 1)
  } else {
    target.push(id)
  }
}

/* Fetch menu items */
const fetchMenuItems = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menuItems`, {
      params: { outletId: props.outletId, sortKey: 'id', sortValue: 'asc', isDeleted: false, limit: 1000000 },
    })
    items.value = res.data.map((i: any) => ({ ...i, display: true, _id: String(i._id) }))
    console.log('[fetchMenuItems] Loaded menu items:', items.value)
  } catch (err) {
    console.error('[fetchMenuItems] Failed:', err)
  } finally {
    isLoading.value = false
  }
}

/* Fetch options (articles) */
async function loadArticles(outletId: string) {
  try {
    const result = await getArticlesByOutlet(outletId)
    articles.value = (Array.isArray(result) ? result : []).map((a: any) => ({
      ...a,
      display: true,
      _id: String(a._id),
    }))
    console.log('[loadArticles] Loaded options:', articles.value)
  } catch (err) {
    console.error('[loadArticles] Failed:', err)
    articles.value = []
  }
}

/* Load promotion details */
const loadPromotion = async () => {
  try {
    const res = await getPromotionById(props.promotionId)
    const promo = Array.isArray(res.data) ? res.data[0] : res.data
    promotionData.value = promo || null
    console.log('[loadPromotion] Promotion data loaded:', promotionData.value)
  } catch (err) {
    console.error('[loadPromotion] Failed:', err)
    promotionData.value = null
  }
}

/* Submit */
const submit = async () => {
  try {
    if (!props.promotionId) {
      emits('save-pending-selections', selectedIds.value)
      init({ message: 'Selections saved for later.', color: 'warning' })
      emits('cancel')
      return
    }

    const payload =
      props.type === 'options' ? { option: selectedArticles.value } : { menuItem: selectedMenuItems.value }

    console.log('[submit] Payload being sent:', payload)
    await updatePromotion(props.promotionId, payload)

    init({ message: 'Promotion updated successfully!', color: 'success' })
    emits('promotionUpdated')
    emits('cancel')
  } catch (err) {
    console.error('[submit] Error updating promotion:', err)
    init({
      message: err?.response?.data?.message || 'Failed to update promotion',
      color: 'danger',
    })
  }
}

/* Lifecycle */
onMounted(() => {
  console.log('[onMounted] Modal mounted. Type:', props.type)

  const init = async () => {
    if (props.type === 'options') {
      await loadArticles(props.outletId)
    } else {
      await fetchMenuItems()
    }

    if (props.promotionId) {
      await loadPromotion()
    }
  }

  init()
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
.va-checkbox .va-checkbox__square {
  background: #f3f4f6 !important;
  border: 1px solid #d1d5db !important;
}
</style>

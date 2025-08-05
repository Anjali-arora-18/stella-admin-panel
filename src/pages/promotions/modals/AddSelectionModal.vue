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
                      :model-value="isChecked(item._id)"
                      @update:model-value="toggleSelection(String(item._id))"
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
  isEditSelection: { type: Boolean, default: false },
  pendingSelections: { type: Object, required: true },
  type: { type: String, default: 'menuItems' }, // 'menuItems' or 'options'
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

/* Computed lists */
const sourceList = computed(() =>
  props.type === 'options' ? articles.value : items.value
)

const selectedIds = computed(() => {
  const ids = props.type === 'options' ? selectedArticles.value : selectedMenuItems.value
  console.log('[computed:selectedIds] Current selectedIds:', ids)
  return ids
})

const filteredItems = computed(() =>
  Array.isArray(sourceList.value)
    ? sourceList.value.filter((item) => {
        const name = item.name?.toLowerCase() || ''
        const code = item.code?.toLowerCase() || ''
        return (
          name.includes(searchQuery.value.toLowerCase()) ||
          code.includes(searchQuery.value.toLowerCase())
        )
      })
    : []
)

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
    const validIds = items.value.map(i => String(i._id))
    selectedMenuItems.value = (promo.menuItem || [])
      .map(String)
      .filter(id => validIds.includes(id))

    console.log('[watch] Valid menuItems after filtering:', selectedMenuItems.value)
  }

  if (props.type === 'options') {
    const validIds = articles.value.map(i => String(i._id))
    selectedArticles.value = (promo.option || [])
      .map(String)
      .filter(id => validIds.includes(id))

    console.log('[watch] Valid options after filtering:', selectedArticles.value)
  }
})

/* Toggle selection */
function toggleSelection(id: string) {
  const target =
    props.type === 'options' ? selectedArticles.value : selectedMenuItems.value

  const idx = target.indexOf(id)
  if (idx > -1) {
    target.splice(idx, 1)
    console.log(`[toggleSelection] Removed ${id}. Current:`, target)
  } else {
    target.push(id)
    console.log(`[toggleSelection] Added ${id}. Current:`, target)
  }
}

/* Fetch menu items */
const fetchMenuItems = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menuItems`, {
      params: { outletId: props.outletId, sortKey: 'id', sortValue: 'asc', isDeleted: false },
    })
    items.value = res.data.map((i: any) => ({ ...i, _id: String(i._id) }))
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
      props.type === 'options'
        ? { option: selectedArticles.value }
        : { menuItem: selectedMenuItems.value }

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
</style>

<template>
  <VaModal v-model="isVisible" class="big-xl-modal !p-0" size="large" close-button hide-default-actions>
    <template #header>
      <h1 class="va-h6 mb-3">{{ isUpdating ? 'Update Promotion' : 'Add Promotion' }}</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid gap-4">
        <!-- Combined Input Row -->
        <div class="grid md:grid-cols-3 gap-4">
          <VaInput
            v-model="formData.name"
            label="Name"
            placeholder="Enter name"
            required-mark
            :rules="[validators.required]"
          />

          <VaInput
            v-model="formData.min"
            label="Min"
            type="number"
            min="0"
            required-mark
            :rules="[validators.required]"
          />

          <VaInput
            v-model="formData.max"
            label="Max"
            type="number"
            min="0"
            required-mark
            :rules="[validators.required]"
          />
        </div>

        <div class="grid md:grid-cols-3 gap-4 text-sm leading-tight">
          <!-- Menu Items -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Menu Items</div>

            <!-- Static Search Bar -->
            <VaInput v-model="searchQuery" placeholder="Search..." size="small" class="w-full mb-2" />

            <!-- Scrollable List -->
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-auto">
              <table v-if="!isLoading" class="w-full text-sm">
                <tbody>
                  <tr v-for="article in filteredItems" :key="article._id" class="border-b hover:bg-orange-50">
                    <td class="p-2">
                      <VaCheckbox
                        v-model="article.selected"
                        :true-value="article._id"
                        :label="article.code + ' - ' + article.name"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <VaSkeletonGroup v-else animation="wave">
                <VaCard>
                  <VaCardContent>
                    <VaSkeleton variant="text" height="64px" class="ml-2" :lines="5" />
                  </VaCardContent>
                </VaCard>
              </VaSkeletonGroup>
            </div>
          </div>

          <!-- Option Groups -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Option Groups</div>

            <!-- Static Search Bar -->
            <VaInput v-model="groupSearchQuery" placeholder="Search..." size="small" class="w-full mb-2" />

            <!-- Scrollable List -->
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-auto">
              <table v-if="filteredGroups.length" class="w-full text-sm">
                <tbody>
                  <div v-for="item in filteredGroups" :key="item._id">
                    <tr
                      v-for="group in item.articlesOptionsGroup"
                      :key="group._id"
                      class="hover:bg-green-50"
                      style="display: table"
                    >
                      <td class="p-2 w-full border-b">
                        <VaCheckbox
                          v-model="group.selected"
                          :true-value="group._id"
                          :label="group.name"
                          class="w-full"
                        />
                      </td>
                    </tr>
                  </div>
                </tbody>
              </table>
              <div v-else class="text-gray-500 italic text-center py-2">No groups available</div>
            </div>
          </div>

          <!-- Options -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Options</div>

            <!-- Static Search Bar -->
            <VaInput v-model="optionSearchQuery" placeholder="Search..." size="small" class="w-full mb-2" />

            <!-- Scrollable List -->
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-auto">
              <table v-if="filteredOptions.length" class="w-full text-sm">
                <tbody>
                  <tr v-for="item in filteredOptions" :key="item._id">
                    <template v-for="group in item.articlesOptionsGroup">
                      <tr
                        v-for="option in group.articlesOptions"
                        :key="option._id"
                        class="border-b hover:bg-green-50 w-full"
                        style="display: table"
                      >
                        <td class="p-2">
                          <div class="flex items-center justify-between">
                            <VaCheckbox v-model="option.selected" :true-value="option.id" :label="option.name" />
                            <span
                              class="ml-2 cursor-pointer text-xs font-semibold px-3 py-0.5 rounded-full transition-all duration-200 shadow-sm"
                              :class="{
                                'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-blue-900 border border-blue-500': option.isFree,
                                'bg-gray-200 text-gray-700 hover:bg-gray-300': !option.isFree,
                              }"
                              @click="option.isFree = !option.isFree"
                            >
                              Free
                            </span>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tr>
                </tbody>
              </table>
              <div v-else class="text-gray-500 italic text-center py-2">No options available</div>
            </div>
          </div>
        </div>
      </div>
    </VaForm>

    <template #footer>
      <div class="flex justify-end mt-6 w-full">
        <VaButton type="submit" @click="submit()">
          {{ isUpdating ? 'Update' : 'Add' }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'

const emits = defineEmits(['cancel', 'getPromotions'])

const props = defineProps({
  selectedOption: {
    type: Object,
    default: () => null,
  },
  promotionData: {
    type: Object,
    default: '',
  },
  isEditSelection: {
    type: Boolean,
    default: false,
  },
  promotionSelection: {
    type: Object,
    default: () => null,
  },
})

const isLoading = ref(false)
const items = ref([])
const sortBy = ref('name')
const sortOrder = ref('asc')

const isVisible = ref(true)
const isUpdating = ref(false)
watch(isVisible, (val) => {
  if (!val) emits('cancel')
})

const servicesStore = useServiceStore()
const { validate } = useForm('form')
const { init } = useToast()

const searchQuery = ref('')
const filteredItems = computed(() =>
  items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const groupSearchQuery = ref('')
const optionSearchQuery = ref('')

const filteredGroups = computed(() =>
  items.value
    .filter((a) => a.selected)
    .map((a) => ({
      ...a,
      articlesOptionsGroup: a.articlesOptionsGroup.filter((g) =>
        g.name.toLowerCase().includes(groupSearchQuery.value.toLowerCase()),
      ),
    }))
    .filter((a) => a.articlesOptionsGroup.length),
)

const filteredOptions = computed(() =>
  items.value
    .filter((a) => a.selected)
    .map((a) => ({
      ...a,
      articlesOptionsGroup: a.articlesOptionsGroup
        .filter((g) => g.selected && g.articlesOptions.length)
        .map((g) => ({
          ...g,
          articlesOptions: g.articlesOptions.filter((opt) =>
            opt.name.toLowerCase().includes(optionSearchQuery.value.toLowerCase()),
          ),
        }))
        .filter((g) => g.articlesOptions.length),
    }))
    .filter((a) => a.articlesOptionsGroup.length),
)

const formData = ref({
  name: '',
  min: null,
  max: null,
})

if (props.isEditSelection) {
  isUpdating.value = true
  formData.value = {
    ...formData.value,
    name: props.promotionSelection.name,
    min: props.promotionSelection.min.toString(),
    max: props.promotionSelection.max.toString(),
  }
} else {
  isUpdating.value = false
}

const getArticles = async () => {
  isLoading.value = true
  const url = import.meta.env.VITE_API_BASE_URL

  const res = await axios.get(`${url}/menuItems`, {
    params: {
      outletId: servicesStore.selectedRest,
      limit: 10000,
      sortKey: sortBy.value,
      sortValue: sortOrder.value,
    },
  })
  items.value = res.data.map((e) => {
    const selected = props.promotionSelection?.menuItems?.find((item) => item.menuItemId === e._id)

    return {
      ...e,
      selected: selected ? e._id : '',
      articlesOptionsGroup: e.articlesOptionsGroup.map((g) => {
        let groupSelected = false
        if (selected) {
          groupSelected = selected.optionGroups.find((group) => group.optionGroupId === g.id)
        }
        return {
          ...g,
          selected: groupSelected ? g._id : !props.isEditSelection ? g._id : '',
          articlesOptions: g.articlesOptions.map((opt) => {
            let optionSelected = false
            if (groupSelected) {
              optionSelected = groupSelected?.selectedOptions.find((option) => option.optionId === opt.id)
            }
            return {
              ...opt,
              selected: optionSelected ? opt.id : !props.isEditSelection ? opt.id : '',
              isFree: optionSelected?.isFree || false,
            }
          }),
        }
      }),
    }
  })
  isLoading.value = false
}

onMounted(() => {
  getArticles()
})

const submit = async () => {
  if (validate()) {
    const payload = {
      selections: JSON.parse(JSON.stringify(props.promotionData.selections || [])),
    }
    const data = JSON.parse(JSON.stringify(formData.value))
    data.min = parseInt(data.min)
    data.max = parseInt(data.max)
    data.isActive = true
    data.menuItems = items.value
      .filter((item) => item.selected)
      .map((item) => {
        return {
          menuItemId: item._id,
          optionGroups: item.articlesOptionsGroup
            .filter((group) => group.selected)
            .map((group) => {
              return {
                optionGroupId: group.id,
                selectedOptions: group.articlesOptions
                  .filter((option) => option.selected)
                  .map((option) => {
                    return {
                      optionId: option.id,
                      isFree: option.isFree,
                    }
                  }),
              }
            }),
        }
      })

    const url = import.meta.env.VITE_API_BASE_URL
    if (props.isEditSelection) {
      const index = props.promotionData.selections.findIndex((e) => e._id === props.promotionSelection._id)
      payload.selections[index] = data
    } else {
      payload.selections.push(data)
    }
    try {
      await axios.put(`${url}/promotions/${props.promotionData._id}/selections`, payload)
      init({ message: 'Promotions updated successfully!', color: 'success' })
      emits('cancel')
      emits('getPromotions')
    } catch (err: any) {
      init({ message: err?.response?.data?.message || 'Error occurred', color: 'danger' })
    }
  }
}
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

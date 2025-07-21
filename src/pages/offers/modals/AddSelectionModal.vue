<template>
  <VaModal v-model="isVisible" class="big-xl-modal !p-0" size="large" close-button hide-default-actions>
    <template #header>
      <h1 class="va-h6 mb-3">{{ isUpdating ? 'Update Selection' : 'Add Selection' }}</h1>
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
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-hidden">
              <table v-if="!isLoading" class="w-full text-sm">
                <tbody>
                  <VaVirtualScroller v-slot="{ item, index }" :items="filteredItems" :wrapper-size="200">
                    <tr class="border-b hover:bg-orange-50">
                      <td class="p-2">
                        <VaCheckbox
                          v-model="item.selected"
                          :true-value="item._id"
                          :label="item.code + ' - ' + item.name"
                        />
                      </td>
                    </tr>
                  </VaVirtualScroller>
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
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-hidden">
              <table v-if="filteredGroups.length" class="w-full text-sm">
                <tbody>
                  <VaVirtualScroller
                    v-slot="{ item, index }"
                    :items="filteredGroups.flatMap((item) => item.articlesOptionsGroup)"
                    :wrapper-size="200"
                  >
                    <tr class="hover:bg-green-50" style="display: table">
                      <td class="p-2 w-full border-b">
                        <VaCheckbox
                          v-model="item.selected"
                          :true-value="item._id"
                          :label="item.internalName ? `${item.name} - ${item.internalName}` : item.name"
                          class="w-full"
                        />
                      </td>
                    </tr>
                  </VaVirtualScroller>
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
            <div class="border rounded shadow-sm bg-white max-h-[36vh] overflow-y-hidden">
              <table v-if="filteredOptions.length" class="w-full text-sm">
                <tbody>
                  <VaVirtualScroller
                    v-slot="{ item, index }"
                    :items="
                      filteredOptions.flatMap((item) => item.articlesOptionsGroup).flatMap((a) => a.articlesOptions)
                    "
                    :wrapper-size="200"
                  >
                    <tr class="border-b hover:bg-green-50 w-full" style="display: table">
                      <td class="p-2">
                        <div class="flex items-center justify-between">
                          <VaCheckbox
                            v-model="item.selected"
                            :true-value="item.id"
                            :label="item.posName ? `${item.name} - ${item.posName}` : item.name"
                          />
                          <span
                            class="ml-2 cursor-pointer text-xs font-semibold px-3 py-0.5 rounded-full transition-all duration-200 shadow-sm"
                            :class="{
                              'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-blue-900 border border-blue-500':
                                item.isFree,
                              'bg-gray-200 text-gray-700 hover:bg-gray-300': !item.isFree,
                            }"
                            @click="item.isFree = !item.isFree"
                          >
                            Free
                          </span>
                        </div>
                      </td>
                    </tr>
                  </VaVirtualScroller>
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
import { ref, watch, computed, toRef, onMounted } from 'vue'
import axios from 'axios'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'

const emits = defineEmits(['cancel', 'getOffers'])

const props = defineProps({
  selectedOption: {
    type: Object,
    default: () => null,
  },
  offerData: {
    type: Object,
    default: '',
  },
  isEditSelection: {
    type: Boolean,
    default: false,
  },
  offerSelection: {
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

const groupWorker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
      self.onmessage = function(e) {
        const { items, query } = e.data;
        const lowerQuery = query.toLowerCase();
        const filtered = items
          .filter(a => a.selected)
          .map(a => ({
            ...a,
            articlesOptionsGroup: a.articlesOptionsGroup.filter(g => {
              const nameMatch = g.name?.toLowerCase().includes(lowerQuery);
              const internalNameMatch = g.internalName?.toLowerCase().includes(lowerQuery);
              return nameMatch || internalNameMatch;
            }),
          }))
          .filter(a => a.articlesOptionsGroup.length);
        self.postMessage(filtered);
      }
    `,
      ],
      { type: 'application/javascript' },
    ),
  ),
)

const filteredGroups = ref([])
let lastWorkerCall = 0

watch(
  [items, groupSearchQuery],
  () => {
    const callId = ++lastWorkerCall
    groupWorker.postMessage({
      items: JSON.parse(JSON.stringify(items.value)),
      query: groupSearchQuery.value,
    })
    groupWorker.onmessage = (e) => {
      // Only update if this is the latest call
      if (callId === lastWorkerCall) {
        filteredGroups.value = e.data
      }
    }
  },
  { immediate: true, deep: true },
)

const optionWorker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
        self.onmessage = function(e) {
          const { groups, query } = e.data;
          const lowerQuery = query.toLowerCase();
          const filtered = groups
            .map(groupWrapper => ({
              ...groupWrapper,
              articlesOptionsGroup: groupWrapper.articlesOptionsGroup
                .map(group => ({
                  ...group,
                  articlesOptions: group.articlesOptions.filter(option => {
                    const nameMatch = option.name?.toLowerCase().includes(lowerQuery);
                    const posNameMatch = option.posName?.toLowerCase().includes(lowerQuery);
                    return nameMatch || posNameMatch;
                  }),
                }))
                .filter(g => g.articlesOptions.length),
            }))
            .filter(g => g.articlesOptionsGroup.length);
          self.postMessage(filtered);
        }
        `,
      ],
      { type: 'application/javascript' },
    ),
  ),
)

const filteredOptions = ref([])
let lastOptionWorkerCall = 0

watch(
  [filteredGroups, optionSearchQuery],
  () => {
    const callId = ++lastOptionWorkerCall
    optionWorker.postMessage({
      groups: JSON.parse(JSON.stringify(filteredGroups.value)),
      query: optionSearchQuery.value,
    })
    optionWorker.onmessage = (e) => {
      if (callId === lastOptionWorkerCall) {
        filteredOptions.value = e.data
      }
    }
  },
  { immediate: true, deep: true },
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
    name: props.offerSelection.name,
    min: props.offerSelection.min.toString(),
    max: props.offerSelection.max.toString(),
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
    const selected = props.offerSelection?.menuItems?.find((item) => item.menuItemId === e._id)

    return {
      ...e,
      selected: selected ? e._id : '',
      articlesOptionsGroup: e.articlesOptionsGroup.map((e) => {
        let groupSelected = false
        if (selected) {
          groupSelected = selected.optionGroups.find((group) => group.optionGroupId === e.id)
        }
        return {
          ...e,
          selected: groupSelected ? e._id : !props.isEditSelection ? e._id : '',
          articlesOptions: e.articlesOptions.map((opt) => {
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
      selections: JSON.parse(JSON.stringify(props.offerData.selections || [])),
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
      const index = props.offerData.selections.findIndex((e) => e._id === props.offerSelection._id)
      payload.selections[index] = data
    } else {
      payload.selections.push(data)
    }
    try {
      await axios.put(`${url}/offers/${props.offerData._id}/selections`, payload)
      init({ message: 'Offers updated successfully!', color: 'success' })
      emits('cancel')
      emits('getOffers')
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

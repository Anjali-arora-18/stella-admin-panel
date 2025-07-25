<template>
  <VaModal v-model="isVisible" class="big-xl-modal !p-0" size="large" close-button hide-default-actions>
    <template #header>
      <h1 class="va-h6 mb-3">{{ isUpdating ? 'Update Selection' : 'Add Selection' }}</h1>
    </template>

    <VaForm ref="form" @submit.prevent="submit">
      <div class="grid gap-4">
        <!-- Combined Input Row -->
        <div class="grid md:grid-cols-4 gap-4">
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
          <VaSelect
            v-model="formData.isRequired"
            label="Is Required"
            :options="[true, false]"
            placeholder="Select if required"
            required-mark
          />
        </div>

        <div class="grid md:grid-cols-3 gap-4 text-sm leading-tight">
          <!-- Menu Items -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Menu Items</div>

            <!-- Static Search Bar -->
            <VaInput v-model="searchQuery" placeholder="Search..." size="small" class="w-full mb-2" />

            <!-- Scrollable List -->
            <div class="border rounded shadow-sm bg-white h-[50vh] overflow-y-hidden">
              <table v-if="!isLoading" class="w-full text-sm">
                <tbody>
                  <VaVirtualScroller v-slot="{ item, index }" :items="items" :wrapper-size="400">
                    <tr class="border-b hover:bg-orange-50" :class="{ hidden: !item.display, table: item.display }">
                      <td class="p-2 w-full">
                        <div class="flex items-center justify-between">
                          <VaCheckbox
                            v-model="item.selected"
                            :true-value="item._id"
                            :label="item.code + ' - ' + item.name"
                          />

                          <div class="flex items-center justify-between">
                            <div class="w-12">
                              <VaInput v-model="item.customPrice" type="number" placeholder="Price" class="w-full" />
                            </div>
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
                        </div>
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
            <div class="border rounded shadow-sm bg-white h-[50vh] overflow-y-hidden">
              <table
                v-if="items.filter((a) => a.selected).flatMap((a) => a.articlesOptionsGroup).length"
                class="w-full text-sm"
              >
                <tbody>
                  <VaVirtualScroller
                    v-slot="{ item, index }"
                    :items="
                      items
                        .filter((a) => a.selected)
                        .flatMap((a) => a.articlesOptionsGroup)
                        .filter((a) => a.display)
                    "
                    class="mb-10"
                    :wrapper-size="400"
                  >
                    <tr class="hover:bg-green-50" :class="{ hidden: !item.display, table: item.display }">
                      <td class="p-2 w-full border-b">
                        <div class="flex items-center justify-between">
                          <VaCheckbox
                            v-model="item.selected"
                            :true-value="item._id"
                            :label="item.internalName ? `${item.name} - ${item.internalName}` : item.name"
                            class="w-full"
                          />
                          <div class="w-12">
                            <VaInput
                              v-model="item.customMaxChoices"
                              type="number"
                              placeholder="Max Choice"
                              class="w-full"
                            />
                          </div>
                        </div>
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
            <div class="border rounded shadow-sm bg-white h-[50vh] overflow-y-hidden">
              <table
                v-if="
                  items
                    .filter((a) => a.selected)
                    .flatMap((item) => item.articlesOptionsGroup)
                    .filter((a) => a.selected)
                    .flatMap((a) => a.articlesOptions).length
                "
                class="w-full text-sm"
              >
                <tbody>
                  <VaVirtualScroller
                    v-slot="{ item, index }"
                    :items="
                      items
                        .filter((a) => a.selected)
                        .flatMap((item) => item.articlesOptionsGroup)
                        .filter((a) => a.selected)
                        .flatMap((a) => a.articlesOptions)
                        .filter((a) => a.display)
                    "
                    :wrapper-size="400"
                  >
                    <tr
                      class="border-b hover:bg-green-50 w-full"
                      :class="{ hidden: !item.display, table: item.display }"
                    >
                      <td class="p-2">
                        <div class="flex items-center justify-between">
                          <VaCheckbox
                            v-model="item.selected"
                            :true-value="item.id"
                            :label="item.posName ? `${item.name} - ${item.posName}` : item.name"
                          />
                          <div class="flex items-center justify-between">
                            <div class="w-12">
                              <VaInput v-model="item.customPrice" type="number" placeholder="Price" class="w-full" />
                            </div>
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

const groupSearchQuery = ref('')
const optionSearchQuery = ref('')

const groupWorker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
      self.onmessage = function(e) {
        const { items, groupSearchQuery, optionSearchQuery, searchQuery } = e.data;
        const groupSearch = groupSearchQuery.toLowerCase();
        const optionSearch = optionSearchQuery.toLowerCase();
        const search = searchQuery.toLowerCase();
        const filtered = items
          .map(a => {
            const nameMatch = a.name?.toLowerCase().includes(search);
              const internalNameMatch = a.code?.toLowerCase().includes(search);
              return {
                ...a,
                display: nameMatch || internalNameMatch || !searchQuery,
                articlesOptionsGroup: a.articlesOptionsGroup.map(g => {
                  const nameMatch = g.name?.toLowerCase().includes(groupSearch);
                  const internalNameMatch = g.internalName?.toLowerCase().includes(groupSearch);
                  return {
                    ...g,
                    display: nameMatch || internalNameMatch || !groupSearch,
                    articlesOptions: g.articlesOptions.map(opt => {
                      const optNameMatch = opt.name?.toLowerCase().includes(optionSearch);
                      const optPosNameMatch = opt.posName?.toLowerCase().includes(optionSearch);
                      return {
                        ...opt,
                        display: optNameMatch || optPosNameMatch || !optionSearch,
                      };
                    }),
                  };
                })
              };    
            })
        self.postMessage(filtered);
      }
    `,
      ],
      { type: 'application/javascript' },
    ),
  ),
)

const lastWorkerCall = ref(0)

watch(
  [groupSearchQuery, optionSearchQuery, searchQuery],
  () => {
    const callId = ++lastWorkerCall.value
    groupWorker.postMessage({
      items: JSON.parse(JSON.stringify(items.value)),
      groupSearchQuery: groupSearchQuery.value,
      optionSearchQuery: optionSearchQuery.value,
      searchQuery: searchQuery.value,
    })
    groupWorker.onmessage = (e) => {
      // Only update if this is the latest call
      if (callId === lastWorkerCall.value) {
        items.value = JSON.parse(JSON.stringify(e.data))
      }
    }
  },
  { immediate: true, deep: true },
)

const formData = ref({
  name: '',
  min: null,
  max: null,
  isRequired: false,
})

if (props.isEditSelection) {
  isUpdating.value = true
  formData.value = {
    ...formData.value,
    name: props.offerSelection.name,
    min: props.offerSelection.min.toString(),
    max: props.offerSelection.max.toString(),
    isRequired: props.offerSelection.isRequired || false,
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
      display: true,
      isFree: selected ? selected.isFree : false,
      selected: selected ? e._id : '',
      customPrice: selected ? selected.customPrice : 0,
      articlesOptionsGroup: e.articlesOptionsGroup.map((e) => {
        let groupSelected = false
        if (selected) {
          groupSelected = selected.optionGroups.find((group) => group.optionGroupId === e.id)
        }
        return {
          ...e,
          display: true,
          customMaxChoices: groupSelected ? groupSelected.customMaxChoices : 0,
          selected: groupSelected ? e._id : !props.isEditSelection ? e._id : '',
          articlesOptions: e.articlesOptions.map((opt) => {
            let optionSelected = false
            if (groupSelected) {
              optionSelected = groupSelected?.selectedOptions.find((option) => option.optionId === opt.id)
            }
            return {
              ...opt,
              display: true,
              selected: optionSelected ? opt.id : !props.isEditSelection ? opt.id : '',
              isFree: optionSelected?.isFree || false,
              customPrice: optionSelected ? optionSelected?.customPrice : 0,
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

    // Reconstruct menuItems from the current UI state to reflect latest selection/free changes
    data.menuItems = items.value
      .filter((item: any) => !!item.selected)
      .map((item: any) => ({
        menuItemId: item._id,
        isFree: !!item.isFree,
        customPrice: item.customPrice || 0,
        optionGroups: item.articlesOptionsGroup
          .filter((group: any) => !!group.selected)
          .map((group: any) => ({
            optionGroupId: group.id,
            customMaxChoices: group.customMaxChoices || 0,
            selectedOptions: group.articlesOptions
              .filter((option: any) => !!option.selected)
              .map((option: any) => ({
                optionId: option.id,
                isFree: !!option.isFree,
                customPrice: option.customPrice || 0,
              })),
          })),
      }))

    const url = import.meta.env.VITE_API_BASE_URL
    if (props.isEditSelection) {
      const index = props.offerData.selections.findIndex((e: any) => e._id === props.offerSelection._id)
      payload.selections[index] = data
    } else {
      payload.selections.push(data)
    }
    try {
      await axios.put(`${url}/offers/${props.offerData._id}/selections`, payload)
      init({ message: 'Offers updated successfully!', color: 'success' })
      emits('cancel')
      emits('getOffers')
    } catch (err) {
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
</style>

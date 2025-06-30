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
            <div class="max-h-[40vh] overflow-y-auto border rounded shadow-sm bg-white">
              <table v-if="!isLoading" class="w-full text-sm">
                <tbody>
                  <tr v-for="article in items" :key="article._id" class="border-b hover:bg-orange-50">
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
            <!-- <VaPagination
              v-if="!isLoading"
              v-model="currentPage"
              :pages="pages"
              buttons-preset="default"
              gapped
              :visible-pages="2"
              class="justify-center mt-2"
            /> -->
          </div>

          <!-- Option Groups -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Option Groups</div>
            <div class="max-h-[40vh] overflow-y-auto border rounded shadow-sm bg-white">
              <table v-if="items.filter((a) => a.selected).length" class="w-full text-sm">
                <tbody>
                  <div v-for="item in items.filter((a) => a.selected && a.articlesOptionsGroup.length)" :key="item._id">
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

          <!-- Option Groups -->
          <div>
            <div class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Option</div>
            <div class="max-h-[40vh] overflow-y-auto border rounded shadow-sm bg-white">
              <table v-if="items.filter((a) => a.selected).length" class="w-full text-sm">
                <tbody>
                  <tr
                    v-for="item in items.filter(
                      (a) => a.selected && a.articlesOptionsGroup.some((g) => g.selected && g.articlesOptions.length),
                    )"
                    :key="item._id"
                  >
                    <template
                      v-for="group in item.articlesOptionsGroup.filter((g) => g.selected && g.articlesOptions.length)"
                    >
                      <tr
                        v-for="option in group.articlesOptions"
                        :key="option._id"
                        class="border-b hover:bg-green-50 w-full"
                        style="display: table"
                      >
                        <td class="p-2">
                          <VaCheckbox v-model="option.selected" :true-value="option.id" :label="option.name" />
                        </td>
                      </tr>
                    </template>
                  </tr>
                </tbody>
              </table>
              <div v-else class="text-gray-500 italic text-center py-2">No groups available</div>
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

const emits = defineEmits(['cancel'])

const props = defineProps({
  selectedOption: {
    type: Object,
    default: () => null,
  },
  offerId: {
    type: String,
    default: '',
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

const formData = ref({
  name: '',
  min: null,
  max: null,
})

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
    return {
      ...e,
      selected: '',
      articlesOptionsGroup: e.articlesOptionsGroup.map((e) => {
        return {
          ...e,
          selected: '',
          articlesOptions: e.articlesOptions.map((opt) => ({
            ...opt,
            selected: '',
            isFree: false,
          })),
        }
      }),
    }
  })
  console.log(items.value)
  isLoading.value = false
}

onMounted(() => {
  getArticles()
})

const submit = async () => {
  if (validate()) {
    const data = JSON.parse(JSON.stringify(formData.value))

    delete data.createdAt
    delete data.updatedAt
    delete data.__v
    data.offerId = props.offerId
    data.outletId = servicesStore.selectedRest
    data.menuItems = items.value
      .filter((item) => item.selected)
      .map((item) => {
        return {
          menuItemId: item._id,
          optionGroups: item.articlesOptionsGroup
            .filter((group) => group.selected)
            .map((group) => {
              return {
                optionGroupId: group._id,
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
    data.min = parseInt(data.min)
    data.max = parseInt(data.max)
    data.isActive = true
    const url = import.meta.env.VITE_API_BASE_URL

    try {
      await axios.put(`${url}/offers/${props.offerId}/selections`, data)
      init({ message: 'Offers updated successfully!', color: 'success' })
      emits('cancel')
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
</style>

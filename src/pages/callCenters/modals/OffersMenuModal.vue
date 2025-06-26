<template>
  <VaModal
    model-value
    close-button
    class="big-xl-modal !p-0"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    @update:modelValue="emits('cancel')"
  >
    <div class="flex sm:max-h-[85vh]">
      <!-- LEFT SECTION -->
      <div
        class="w-[25%] bg-slate-100 p-4 flex-shrink-0 flex items-start justify-start sm:items-center sm:justify-center"
      >
        <div class="flex flex-col items-center justify-start sm:justify-center text-center w-full max-w-[250px]">
          <!-- Image -->
          <div class="flex justify-center mb-4">
            <img
              :src="item.imageUrl || '/missing-image.png'"
              alt="icon"
              class="w-48 h-48 rounded-full object-cover object-center shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
            />
          </div>

          <!-- Title -->
          <h2 class="text-green-900 font-semibold text-lg uppercase">{{ isEdit ? item.itemName : item.name }}</h2>

          <!-- Description -->
          <p class="text-gray-400 text-xs mt-1">
            {{ item.description }}
          </p>

          <!-- Tags -->
          <!-- 
          <div
            v-if="item.allergenIds && item.allergenIds.length"
            class="flex flex-wrap justify-center gap-1 mt-3 text-xs"
          >
            <img
              v-for="allergenId in item.allergenIds"
              :key="allergenId"
              :src="allergenIcons[allergenId] || '/missing-image.png'"
              :alt="`Allergen ${allergenId}`"
              class="w-8 h-8 object-contain bg-pink-100 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1"
            />
          </div> -->

          <!-- Price -->
          <div class="text-green-900 font-bold text-2xl mt-4">€{{ parseFloat(totalPrice).toFixed(2) }}</div>

          <!-- Button -->
          <button
            :disabled="formSubmitted && !isFormValid"
            class="mt-4 w-full bg-green-800 hover:bg-green-900 text-white font-semibold p-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            @click="addToBasket(item)"
          >
            {{ isEdit ? 'UPDATE OFFER' : 'ADD TO OFFER' }}
          </button>

          <!-- <p v-if="formSubmitted && !isFormValid" class="text-red-500 text-xs mt-2 text-center">
            Please select all required options.
          </p> -->
        </div>
      </div>

      <!-- RIGHT SECTION -->
      <div class="w-[75%] bg-white p-4 overflow-y-auto max-h-[85vh]">
        <div class="space-y-6">
          <div v-for="group in item.optionGroups" :key="group.optionGroupId" class="space-y-4">
            <!-- Group Title -->
            <div class="flex items-center gap-2">
              <span class="text-green-900 font-bold uppercase text-sm">{{ group.name }}</span>
              <!-- <span v-if="group.mandatory" class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full">
                Required
              </span> -->

              <span
                v-if="group.minimumChoices"
                class="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 rounded-full"
              >
                Min {{ group.minimumChoices }} {{ group.minimumChoices === 1 ? 'Choice' : 'Choices' }}
              </span>

              <!-- Max Choices -->

              <span
                v-if="group.maximumChoices"
                class="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 rounded-full"
              >
                Up to {{ group.maximumChoices }} Choices
              </span>
            </div>

            <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              <label
                v-for="option in group.selectedOptions"
                v-if="group.singleChoice"
                :key="option.optionId"
                class="w-[200px] h-[80px] relative flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                :class="{
                  'border-gray-700 bg-[#f8f9fa] border-2': isChecked(group, option.optionId),
                  'border-gray-200 hover:border-gray-700 hover:border-2': !isChecked(group, option.optionId),
                }"
                @click="updateSingleChoice(group, option)"
              >
                <div v-if="option.imageUrl" class="item-image">
                  <img
                    :src="option.imageUrl"
                    alt="Option"
                    :class="selectedOptions[group.optionGroupId] === option.optionId ? 'bg-white' : 'bg-[#f8f9fa]'"
                    class="rounded w-full h-full"
                  />
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-800">{{ option.name }}</div>
                  <div v-if="option.price" class="text-gray-800 font-semibold text-sm mt-1">
                    €{{ parseFloat(option.price).toFixed(2) }}
                  </div>
                </div>

                <input
                  v-model="selectedOptions[group.optionGroupId]"
                  :checked="isChecked(group, option.optionId)"
                  type="radio"
                  :name="group.optionGroupId"
                  :value="option.optionId"
                  class="absolute bottom-2 right-2 accent-gray-700 pointer-events-none"
                />
              </label>

              <!-- Multiple Choice -->
              <div
                v-for="option in group.selectedOptions"
                v-if="group.multipleChoice"
                :key="option.optionId"
                class="w-[200px] h-[80px] relative flex flex-col justify-between border rounded-xl p-2 transition hover:shadow-sm"
                :class="
                  getQty(group.optionGroupId, option.optionId) > 0
                    ? 'border-gray-700 bg-[#f8f9fa] border-2'
                    : 'border-gray-200 hover:border-gray-700 hover:border-2'
                "
              >
                <!-- Top content -->
                <div class="flex items-center gap-1">
                  <div v-if="option.imageUrl" class="item-image">
                    <img
                      :src="option.imageUrl"
                      alt="Topping"
                      :class="getQty(group.optionGroupId, option.optionId) > 0 ? 'bg-white' : 'bg-[#f8f9fa]'"
                      class="rounded w-full h-full"
                    />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-sm text-gray-800">{{ option.name }}</p>
                  </div>
                </div>

                <!-- Bottom-right quantity control -->
                <div class="absolute bottom-2 right-2 flex items-center bottom-1 gap-1">
                  <p v-if="option.price && !option.isFree" class="text-sm text-gray-600 font-medium mr-2">
                    €{{ parseFloat(option.price).toFixed(2) }}
                  </p>
                  <p v-if="option.isFree" class="text-sm text-gray-600 font-medium mr-2">Free</p>

                  <button
                    class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    :disabled="getQty(group.optionGroupId, option.optionId) === 0"
                    @click="() => updateMultipleChoice(group, option, getQty(group.optionGroupId, option.optionId) - 1)"
                  >
                    -
                  </button>
                  <span class="w-5 text-center text-sm">{{ getQty(group.optionGroupId, option.optionId) }}</span>
                  <button
                    title="Max quantity reached"
                    class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    :disabled="
                      getQty(group.optionGroupId, option.optionId) >=
                      (option.maximumChoices || group.maximumChoices || 99)
                    "
                    @click="() => updateMultipleChoice(group, option, getQty(group.optionGroupId, option.optionId) + 1)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useOrderStore } from '@/stores/order-store'
import { useMenuStore } from '@/stores/getMenu'
const orderStore = useOrderStore()

const emits = defineEmits(['cancel', 'cancel-edit', 'items-added'])

const props = defineProps({
  offerGroup: {
    type: Object,
    required: false,
  },
  item: {
    type: Object,
    required: true,
  },
  isEdit: {
    type: Boolean,
    required: false,
  },
  showMenuModal: {
    type: Boolean,
    required: true,
  },
})

const selectedOptions = ref([])
const menuStore = useMenuStore()
const formSubmitted = ref(false)

// const isFormValid = computed(() => {
//   const requiredGroups = props.item.articlesOptionsGroups.filter((g) => g.mandatory)

//   for (const group of requiredGroups) {
//     const selectedGroup = selectedOptions.value.find((sel) => sel.groupId === group.optionGroupId)

//     if (!selectedGroup || !selectedGroup.selected.length) {
//       return false
//     }

//     if (group.multipleChoice && group.minimumChoices) {
//       const totalQty = selectedGroup.selected.reduce((sum, opt) => sum + (opt.quantity || 0), 0)

//       if (totalQty < group.minimumChoices) return false
//     }
//   }

//   return true
// })

const totalPrice = computed(() => {
  let total = parseFloat(props.item.price) || props.item.basePrice || 0

  selectedOptions.value.forEach((group) => {
    group.selected.forEach((option) => {
      const price = parseFloat(option.price) || 0
      const quantity = option.quantity || 1
      total += price * quantity
    })
  })

  return total.toFixed(2)
})

watch(
  () => [props.isEdit, props.item],
  ([isEdit, item]) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !Array.isArray(item.articlesOptionsGroups) ||
      !item.articlesOptionsGroups.length
    )
      return

    if (isEdit && item?.selectedOptions) {
      selectedOptions.value = JSON.parse(JSON.stringify(item.selectedOptions))
    } else {
      // Fresh selection
      selectedOptions.value = []

      item.articlesOptionsGroups.forEach((group) => {
        const defaults = Array.isArray(group.defaultOptions) ? group.defaultOptions : []
        const selected = []

        defaults.forEach((optionId) => {
          const option = group.options.find((o) => o.optionId === optionId)
          if (option) {
            selected.push({
              optionId: option.optionId,
              name: option.name,
              type: option.type,
              price: option.price,
              quantity: group.multipleChoice ? 1 : 1,
            })
          }
        })

        if (selected.length) {
          selectedOptions.value.push({
            groupId: group.optionGroupId,
            groupName: group.name,
            selected: group.singleChoice ? [selected[0]] : selected,
          })
        }
      })
    }
  },
  { immediate: true, deep: true },
)

function addToBasket(item: any) {
  formSubmitted.value = true

  // if (!isFormValid.value) {
  //   return
  // }

  const productEntry = {
    itemId: props.isEdit ? item.itemId : item.id,
    itemName: props.isEdit ? item.itemName : item.name,
    itemDescription: item.description,
    basePrice: props.isEdit ? item.basePrice : parseFloat(item.price),
    imageUrl: item.imageUrl,
    quantity: props.isEdit ? item.quantity : 1,
    selectedOptions: selectedOptions.value,
    totalPrice: 0,
    selectionTotalPrice: 0,
  }

  // const index = null
  // if (props.isEdit) {
  //   const index = orderStore.cartItems.findIndex((i) => i.itemId === item.itemId)
  //   if (index !== -1) {
  //     orderStore.cartItems.splice(index, 1)
  //     orderStore.cartItems.splice(index, 0, JSON.parse(JSON.stringify(productEntry)))
  //     orderStore.calculateItemTotal(index)
  //   }
  // } else {
  //   orderStore.addItemToCart(productEntry)
  //   const newIndex = orderStore.cartItems.length - 1
  //   orderStore.calculateItemTotal(newIndex)
  // }

  menuStore.addItemToOffer(props.offerGroup, productEntry)
  selectedOptions.value = []
  formSubmitted.value = false

  // if (props.isEdit) {
  //   emits('cancel-edit')
  // }
  emits('items-added')
}

function updateSingleChoice(group: any, option: any) {
  const index = selectedOptions.value.findIndex((sel) => sel.groupId === group.optionGroupId)
  const newEntry = {
    groupId: group.optionGroupId,
    groupName: group.name,
    selected: [
      {
        optionId: option.optionId,
        name: option.name,
        type: option.type,
        price: option.isFree ? 0 : option.price,
        quantity: 1,
      },
    ],
  }

  if (index !== -1) {
    selectedOptions.value[index] = newEntry
  } else {
    selectedOptions.value.push(newEntry)
  }
}

function isChecked(group, optionId) {
  const index = selectedOptions.value.findIndex((sel) => sel.groupId === group.optionGroupId)
  if (index === -1) {
    return false
  } else {
    if (selectedOptions.value[index].selected.find((a) => a.optionId === optionId)) {
      return true
    }
    return false
  }
}

function updateMultipleChoice(group, option, quantity) {
  const min = option.minimumChoices || 0
  const max = option.maximumChoices || group.maximumChoices || 99

  if (quantity < 0 || quantity > max) return

  let groupEntry = selectedOptions.value.find((sel) => sel.groupId === group.optionGroupId)

  if (!groupEntry) {
    groupEntry = {
      groupId: group.optionGroupId,
      groupName: group.name,
      selected: [],
    }
    selectedOptions.value.push(groupEntry)
  }

  const optionIndex = groupEntry.selected.findIndex((o) => o.optionId === option.optionId)
  const opt = groupEntry.selected[optionIndex]

  const totalQtyInGroup = groupEntry.selected.reduce((sum, o) => sum + (o.quantity || 0), 0)
  const maxAllowed = group.maximumChoices || 99

  if (totalQtyInGroup - (opt?.quantity || 0) + quantity > maxAllowed) {
    return
  }

  if (quantity === 0) {
    if (optionIndex !== -1) groupEntry.selected.splice(optionIndex, 1)
  } else {
    const newOption = {
      optionId: option.optionId,
      name: option.name,
      type: option.type,
      price: option.isFree ? 0 : option.price,
      quantity,
    }

    if (optionIndex !== -1) {
      groupEntry.selected[optionIndex] = newOption
    } else {
      groupEntry.selected.push(newOption)
    }
  }
}

function getQty(groupId, optionId) {
  const group = selectedOptions.value.find((g) => g.groupId === groupId)
  const opt = group?.selected.find((o) => o.optionId === optionId)
  return opt?.quantity || 0
}

function getTotalQtyInGroup(groupId: string) {
  const group = selectedOptions.value.find((g) => g.groupId === groupId)

  if (!group) return 0

  return group.selected.reduce((sum, opt) => sum + (opt.quantity || 0), 0)
}

const allergenIcons = {
  1: '/allergens/vegan.png',
  2: '/allergens/plant_based.png',
  3: '/allergens/vegetarian.png',
  4: '/allergens/pescatarian.png',
  5: '/allergens/spicy.png',
  6: '/allergens/halal.png',
  7: '/allergens/kosher.png',
  8: '/allergens/gluten_free.png',
  9: '/allergens/dairy_free.png',
  10: '/allergens/nut_free.png',
  11: '/allergens/gluten.png',
  12: '/allergens/crustaceans.png',
  13: '/allergens/eggs.png',
  14: '/allergens/fish.png',
  15: '/allergens/peanuts.png',
  16: '/allergens/soybeans.png',
  17: '/allergens/milk.png',
  18: '/allergens/nuts.png',
  19: '/allergens/celery.png',
  20: '/allergens/mustard.png',
  21: '/allergens/sesame_seeds.png',
  22: '/allergens/sulphur_dioxide.png',
  23: '/allergens/lupin.png',
  24: '/allergens/molluscs.png',
}

function increment(item) {
  item.quantity++
}

function decrement(item) {
  if (item.quantity > 0) item.quantity--
}
</script>

<style>
.va-modal__close {
  background: #f8f9fa;
  padding: 7px 10px;
  border-radius: 240px;
  font-size: 13px !important;
  height: 32px !important;
  margin-right: 30px;
  margin-top: 10px;

  @media (min-width: 640px) {
    margin-right: 30px;
    margin-top: 10px;
  }
}
.item-image {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  padding: 0px 10px;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}
/* :root {
  --va-modal-padding-top: 0rem;
  --va-modal-padding-right: 0rem;
  --va-modal-padding-bottom: 0rem;
  --va-modal-padding-left: 0rem;
} */
</style>

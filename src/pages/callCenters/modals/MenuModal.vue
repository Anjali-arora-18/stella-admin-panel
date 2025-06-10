<template>
  <VaModal
    v-model="showMenuModal"
    class="big-xl-modal !p-0"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <div class="grid grid-cols-1 sm:grid-cols-7 sm:max-h-[85vh]">
      <!-- LEFT SECTION -->
      <div class="sm:col-span-2 bg-slate-100 p-4 sm:p-1 md:p-4">
        <div class="p-4 sm:p-1 md:p-4 text-center w-full mx-auto">
          <!-- Image -->
          <div class="flex justify-center mb-4">
            <img
              :src="item.imageUrl || '/missing-image.png'"
              alt="icon"
              class="w-36 h-36 rounded-full bg-white p-4 object-cover object-center shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
            />
          </div>

          <!-- Title -->
          <h2 class="text-green-900 font-semibold text-lg uppercase">{{ isEdit ? item.itemName : item.name }}</h2>

          <!-- Description -->
          <p class="text-gray-400 text-xs mt-1">
            {{ item.description }}
          </p>

          <!-- Tags -->

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
          </div>

          <!-- Price -->
          <div class="text-green-900 font-bold text-2xl mt-4">€{{ parseFloat(totalPrice).toFixed(2) }}</div>

          <!-- Button -->
          <button
            :disabled="!isFormValid"
            class="mt-4 w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-2 rounded-lg transition"
            @click="addToBasket(item)"
          >
            {{ isEdit ? 'UPDATE BASKET' : 'ADD TO BASKET' }}
          </button>

          <p v-if="!isFormValid" class="text-red-500 text-xs mt-2 text-center">Please select all required options.</p>
        </div>
      </div>

      <!-- RIGHT SECTION -->
      <div class="sm:col-span-5 bg-white p-4 sm:overflow-y-auto sm:max-h-[85vh]">
        <div class="space-y-6">
          <div v-for="group in item.articlesOptionsGroups" :key="group._id" class="space-y-4">
            <!-- Group Title -->
            <div class="flex items-center gap-2">
              <span class="text-green-900 font-semibold uppercase text-sm">{{ group.name }}</span>
              <span
                v-if="group.mandatory"
                class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full uppercase"
              >
                Required
              </span>
            </div>

            <!-- Group Options -->
            <div class="flex flex-wrap gap-4">
              <!-- Single Choice (Radio) -->
              <label
                v-for="option in group.options"
                v-if="group.singleChoice"
                :key="option._id"
                class="relative w-full sm:w-[160px] flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                :class="
                  selectedOptions[group._id] === option._id
                    ? 'border-gray-700 bg-[#f8f9fa] border-2'
                    : 'border-gray-200 hover:border-gray-700 hover:border-2'
                "
                @click="updateSingleChoice(group, option)"
              >
                <img
                  :src="option.icon || '/missing-image.png'"
                  alt="Option"
                  :class="selectedOptions[group._id] === option._id ? 'bg-white' : 'bg-[#f8f9fa]'"
                  class="w-10 h-10 object-cover rounded mr-4 p-2"
                />
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-800">{{ option.name }}</div>
                  <div class="text-gray-800 font-semibold text-sm mt-1">€{{ parseFloat(option.price).toFixed(2) }}</div>
                </div>
                <input
                  v-model="selectedOptions[group._id]"
                  type="radio"
                  :name="group._id"
                  :value="option._id"
                  class="absolute bottom-2 right-2 accent-gray-700"
                />
              </label>

              <div
                v-for="option in group.options"
                v-if="group.multipleChoice"
                :key="option._id"
                class="relative flex flex-col justify-between border rounded-xl p-3 min-w-[180px] transition hover:shadow-sm"
                :class="
                  getQty(group._id, option._id) > 0
                    ? 'border-gray-700 bg-[#f8f9fa] border-2'
                    : 'border-gray-200 hover:border-gray-700 hover:border-2'
                "
              >
                <!-- Top content -->
                <div class="flex items-center gap-3 pr-20">
                  <img
                    :src="item.imageUrl || '/missing-image.png'"
                    alt="topping"
                    :class="getQty(group._id, option._id) > 0 ? 'bg-white' : 'bg-[#f8f9fa]'"
                    class="w-10 h-10 object-cover rounded mr-4 p-2"
                  />
                  <div class="text-left">
                    <p class="font-semibold text-sm text-gray-800">{{ option.name }}</p>
                    <p class="text-sm text-gray-600 font-medium">€{{ parseFloat(option.price).toFixed(2) }}</p>
                  </div>
                </div>

                <!-- Bottom-right quantity control -->
                <div class="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                    @click="() => updateMultipleChoice(group, option, getQty(group._id, option._id) - 1)"
                  >
                    -
                  </button>
                  <span class="w-5 text-center text-sm">{{ getQty(group._id, option._id) }}</span>
                  <button
                    class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                    @click="() => updateMultipleChoice(group, option, getQty(group._id, option._id) + 1)"
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
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order-store'

const orderStore = useOrderStore()

const showMenuModal = ref(true)
const emits = defineEmits(['cancel', 'cancel-edit'])

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isEdit: {
    type: Boolean,
    required: false,
  },
})

// Store selected values
const selectedOptions = ref([])

const isFormValid = computed(() => {
  const requiredGroups = props.item.articlesOptionsGroups.filter((g) => g.mandatory)

  for (const group of requiredGroups) {
    const selectedGroup = selectedOptions.value.find((sel) => sel.groupId === group._id)

    if (!selectedGroup || !selectedGroup.selected.length) {
      return false // required group is not selected
    }
  }

  return true // all required groups have selection
})

const totalPrice = computed(() => {
  let total = parseFloat(props.item.price) || props.item.basePrice || 0

  selectedOptions.value.forEach((group) => {
    group.selected.forEach((option) => {
      const price = parseFloat(option.price) || 0
      const quantity = option.quantity || 1 // for singleChoice, quantity will be 1
      total += price * quantity
    })
  })

  return total.toFixed(2)
})

watch(
  () => [props.isEdit, props.item],
  ([isEdit, item]) => {
    if (isEdit && props.item?.selectedOptions) {
      selectedOptions.value = JSON.parse(JSON.stringify(props.item.selectedOptions))
    }
  },
  { immediate: true, deep: true },
)

function addToBasket(item: any) {
  const productEntry = {
    itemId: props.isEdit ? item.itemId : item._id,
    itemName: props.isEdit ? item.itemName : item.name,
    basePrice: props.isEdit ? item.basePrice : parseFloat(item.price),
    imageUrl: item.imageUrl,
    quantity: props.isEdit ? item.quantity : 1,
    selectedOptions: selectedOptions.value,
    totalPrice: 0,
    selectionTotalPrice: 0,
  }

  const index = null
  if (props.isEdit) {
    const index = orderStore.cartItems.findIndex((i) => i.itemId === item.itemId)
    if (index !== -1) {
      orderStore.cartItems.splice(index, 1)
      orderStore.cartItems.splice(index, 0, JSON.parse(JSON.stringify(productEntry)))
      orderStore.calculateItemTotal(index)
    }
  } else {
    orderStore.addItemToCart(productEntry)
    const newIndex = orderStore.cartItems.length - 1
    orderStore.calculateItemTotal(newIndex)
  }

  selectedOptions.value = []
  showMenuModal.value = false

  if (props.isEdit) {
    emits('cancel-edit')
  }
  emits('cancel')
}

function updateSingleChoice(group: any, option: any) {
  const index = selectedOptions.value.findIndex((sel) => sel.groupId === group._id)
  const newEntry = {
    groupId: group._id,
    groupName: group.name,
    selected: [
      {
        optionId: option._id,
        name: option.name,
        type: option.type,
        price: option.price,
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

function updateMultipleChoice(group, option, quantity) {
  let groupEntry = selectedOptions.value.find((sel) => sel.groupId === group._id)

  if (!groupEntry) {
    groupEntry = {
      groupId: group._id,
      groupName: group.name,
      selected: [],
    }
    selectedOptions.value.push(groupEntry)
  }

  const optionIndex = groupEntry.selected.findIndex((o) => o.optionId === option._id)

  if (quantity === 0) {
    if (optionIndex !== -1) {
      groupEntry.selected.splice(optionIndex, 1)
    }
  } else {
    if (quantity > 0) {
      const newOption = {
        optionId: option._id,
        name: option.name,
        type: option.type,
        price: option.price,
        quantity,
      }

      if (optionIndex !== -1) {
        groupEntry.selected[optionIndex] = newOption
      } else {
        groupEntry.selected.push(newOption)
      }
    }
  }
}

function getQty(groupId, optionId) {
  const group = selectedOptions.value.find((g) => g.groupId === groupId)
  const opt = group?.selected.find((o) => o.optionId === optionId)
  return opt?.quantity || 0
}

watch(showMenuModal, (val) => {
  if (!val) emits('cancel')
})

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

  margin-right: 10px;
  margin-top: 10px;

  @media (min-width: 640px) {
    margin-right: 20px;
    margin-top: 10px;
  }
}

/* :root {
  --va-modal-padding-top: 0rem;
  --va-modal-padding-right: 0rem;
  --va-modal-padding-bottom: 0rem;
  --va-modal-padding-left: 0rem;
} */
</style>

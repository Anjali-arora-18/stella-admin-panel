<template>
  <VaModal v-model="showMenuModal" class="big-modal no-padding-modal" :mobile-fullscreen="false" size="large"
    hide-default-actions close-button>
    <div class="grid grid-cols-1 sm:grid-cols-7">
      <!-- LEFT SECTION -->
      <div class="sm:col-span-2 bg-slate-100 p-4 sm:p-1 md:p-4">

        <div class="p-4 sm:p-1 md:p-4 text-center w-full mx-auto">
          <!-- Image -->
          <div class="flex justify-center mb-4">
            <img src="/allergens/vegan.png" alt="Pizza"
              class="w-36 h-36 rounded-full bg-white p-4 object-cover object-center shadow-[0_8px_25px_rgba(0,0,0,0.1)]" />
          </div>
          <VaModal v-model="showMenuModal" class="big-modal !p-0" :mobile-fullscreen="false" size="large"
            hide-default-actions close-button >
            <div class="grid grid-cols-1 sm:grid-cols-7">
              <!-- LEFT SECTION -->
              <div class="sm:col-span-2 bg-slate-100 p-4 sm:p-1 md:p-4">
                <div class="p-4 sm:p-1 md:p-4 text-center w-full mx-auto">
                  <!-- Image -->
                  <div class="flex justify-center mb-4">
                    <img :src="item.imageUrl || '/missing-image.png'" alt="icon"
                      class="w-36 h-36 rounded-full bg-white p-4 object-cover object-center shadow-[0_8px_25px_rgba(0,0,0,0.1)]" />
                  </div>

                  <!-- Title -->
                  <h2 class="text-green-900 font-semibold text-lg uppercase">{{ item.name }}</h2>

                  <!-- Description -->
                  <p class="text-gray-400 text-xs mt-1">
                    {{ item.description }}
                  </p>

                  <!-- Tags -->

                  <div v-if="item.allergenIds && item.allergenIds.length"
                    class="flex flex-wrap justify-center gap-1 mt-3 text-xs">
                    <img v-for="allergenId in item.allergenIds" :key="allergenId" :src="allergenIcons[allergenId]"
                      :alt="`Allergen ${allergenId}`"
                      class="w-8 h-8 object-contain bg-pink-100 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1" />
                  </div>
                  <!-- <div class="flex flex-wrap justify-center gap-1 mt-3 text-xs">
            <span
              v-for="alergen in item.allergenIds"
              :key="alergen"
              class="bg-pink-100 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1"
            >
              {{ alergen }}
            </span>
          </div> -->

                  <!-- Price -->
                  <div class="text-green-900 font-bold text-2xl mt-4">€ {{ parseFloat(item.price).toFixed(2) }}</div>

                  <!-- Button -->
                  <button
                    class="mt-4 w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-2 rounded-lg transition">
                    ADD TO BASKET
                  </button>
                </div>
              </div>

              <!-- RIGHT SECTION -->
              <div class="sm:col-span-5 bg-white p-4">
                <div class="space-y-4">
                  <!-- Title -->
                  <div class="flex items-center gap-2">
                    <span class="text-green-900 font-semibold uppercase text-sm">Size</span>
                    <span
                      class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full uppercase">Required</span>
                  </div>

                  <!-- Radio Cards -->
                  <div class="flex flex-wrap gap-4">
                    <label v-for="size in sizes" :key="size.label"
                      class="relative w-full sm:w-[160px] flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                      :class="selectedSize === size.label
                        ? 'border-gray-700 bg-[#f8f9fa] border-2'
                        : 'border-gray-200 hover:border-gray-700 hover:border-2'
                        ">
                      <!-- Image on the left -->
                      <img :src="size.icon" alt="Pizza"
                        :class="selectedSize === size.label ? 'bg-white' : 'bg-[#f8f9fa]'"
                        class="w-10 h-10 object-cover rounded mr-4 p-2" />

                      <!-- Text content -->
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-gray-800">{{ size.label }}</div>
                        <div class="text-gray-800 font-semibold text-sm mt-1">€{{ size.price }}</div>
                      </div>

                      <!-- Radio button positioned absolutely -->
                      <input v-model="selectedSize" type="radio" name="pizzaSize" :value="size.label"
                        class="absolute bottom-2 right-2 accent-gray-700" />
                    </label>
                  </div>
                </div>

                <div class="space-y-4 mt-5">
                  <!-- Title -->
                  <div class="flex items-center gap-2">
                    <span class="text-green-900 font-semibold uppercase text-sm">Size</span>
                    <span
                      class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full uppercase">Required</span>
                  </div>

                  <!-- Radio Cards -->
                  <div class="flex flex-wrap gap-4">
                    <label v-for="size in sizes2" :key="size.label"
                      class="relative w-full sm:w-[160px] flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                      :class="selectedCrust === size.label
                        ? 'border-gray-700 bg-[#f8f9fa] border-2'
                        : 'border-gray-200 hover:border-gray-700 hover:border-2'
                        ">
                      <!-- Image on the left -->
                      <img :src="size.icon" alt="Pizza"
                        :class="selectedCrust === size.label ? 'bg-white' : 'bg-[#f8f9fa]'"
                        class="w-10 h-10 object-cover rounded mr-4 p-2" />

                      <!-- Text content -->
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-gray-800">{{ size.label }}</div>
                        <!-- <div class="text-gray-800 font-semibold text-sm mt-1">€{{ size.price }}</div> -->
                      </div>

                      <!-- Radio button positioned absolutely -->
                      <input v-model="selectedCrust" type="radio" name="pizzaSize" :value="size.label"
                        class="absolute bottom-2 right-2 accent-gray-700" />
                    </label>
                  </div>
                </div>
                <div class="space-y-4 mt-5">
                  <!-- Title -->
                  <div class="flex items-center gap-2">
                    <span class="text-green-900 font-semibold uppercase text-sm">Size</span>
                    <span
                      class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full uppercase">Required</span>
                  </div>

                  <!-- Radio Cards -->
                  <div class="flex flex-wrap gap-4">
                    <label v-for="size in sizes3" :key="size.label"
                      class="relative w-full sm:w-[160px] flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                      :class="selectedCheese === size.label
                        ? 'border-gray-700 bg-[#f8f9fa] border-2'
                        : 'border-gray-200 hover:border-gray-700 hover:border-2'
                        ">
                      <!-- Image on the left -->
                      <img :src="size.icon" alt="Pizza"
                        :class="selectedCheese === size.label ? 'bg-white' : 'bg-[#f8f9fa]'"
                        class="w-10 h-10 object-cover rounded mr-4 p-2" />

                      <!-- Text content -->
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-gray-800">{{ size.label }}</div>
                        <!-- <div class="text-gray-800 font-semibold text-sm mt-1">€{{ size.price }}</div> -->
                      </div>

                      <!-- Radio button positioned absolutely -->
                      <input v-model="selectedCheese" type="radio" name="pizzaSize" :value="size.label"
                        class="absolute bottom-2 right-2 accent-gray-700" />
                    </label>
                  </div>
                </div>
                <div class="space-y-4 mt-5">
                  <!-- Title -->
                  <div class="flex items-center gap-2">
                    <span class="text-green-900 font-semibold uppercase text-sm">Size</span>
                    <span
                      class="text-[10px] bg-red-500 text-white font-semibold px-2 rounded-full uppercase">Required</span>
                  </div>

                  <!-- Radio Cards -->
                  <div class="flex flex-wrap gap-4">
                    <label v-for="size in sizes4" :key="size.label"
                      class="relative w-full sm:w-[160px] flex items-center border p-2 rounded-lg cursor-pointer transition-all"
                      :class="selectedSauce === size.label
                        ? 'border-gray-700 bg-[#f8f9fa] border-2'
                        : 'border-gray-200 hover:border-gray-700 hover:border-2'
                        ">
                      <!-- Image on the left -->
                      <img :src="size.icon" alt="Pizza"
                        :class="selectedSauce === size.label ? 'bg-white' : 'bg-[#f8f9fa]'"
                        class="w-10 h-10 object-cover rounded mr-4 p-2" />

                      <!-- Text content -->
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-gray-800">{{ size.label }}</div>
                        <!-- <div class="text-gray-800 font-semibold text-sm mt-1">€{{ size.price }}</div> -->
                      </div>

                      <!-- Radio button positioned absolutely -->
                      <input v-model="selectedSauce" type="radio" name="pizzaSize" :value="size.label"
                        class="absolute bottom-2 right-2 accent-gray-700" />
                    </label>
                  </div>
                </div>

                <!-- TOPPINGS -->
                <div class="space-y-4 mt-5">
                  <!-- Title -->
                  <div class="flex items-center gap-2">
                    <span class="text-green-900 font-semibold uppercase text-sm">Toppings</span>
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <div v-for="topping in toppings" :key="topping.label"
                      class="relative flex flex-col justify-between border rounded-xl p-3 min-w-[180px] transition hover:shadow-sm"
                      :class="topping.quantity > 0
                        ? 'border-gray-700 bg-[#f8f9fa] border-2'
                        : 'border-gray-200 hover:border-gray-700 hover:border-2'
                        ">
                      <!-- Top content -->
                      <div class="flex items-center gap-3 pr-12">
                        <img :src="item.imageUrl" alt="topping"
                          :class="topping.quantity > 0 ? 'bg-white' : 'bg-[#f8f9fa]'"
                          class="w-10 h-10 object-cover rounded mr-4 p-2" />
                        <div class="text-left">
                          <p class="font-semibold text-sm text-gray-800">{{ item.name }}</p>
                          <p class="text-sm text-gray-600 font-medium">€{{ item.price }}</p>
                        </div>
                      </div>

                      <!-- Bottom-right quantity control -->
                      <div class="absolute bottom-2 right-2 flex items-center gap-1">
                        <button class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                          @click="decrement(topping)">
                          -
                        </button>
                        <span class="w-5 text-center text-sm">{{ topping.quantity }}</span>
                        <button class="w-6 h-6 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                          @click="increment(topping)">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </VaModal>
        </div>
      </div>
    </div>
    </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'

const showMenuModal = ref(true)
const emits = defineEmits(['cancel'])
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

// Watch for closing the modal
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

const selectedSize = ref('Medium')
const selectedCrust = ref('Medium')
const selectedCheese = ref('Medium')
const selectedSauce = ref('Medium')

const sizes = [
  { label: 'Small', price: 8.99, icon: '/allergens/vegan.png' },
  { label: 'Medium', price: 14.99, icon: '/allergens/vegan.png' },
  { label: 'Large', price: 19.99, icon: '/allergens/vegan.png' },
]
const sizes2 = [
  { label: 'Small', price: 8.99, icon: '/allergens/vegan.png' },
  { label: 'Medium', price: 14.99, icon: '/allergens/vegan.png' },
  { label: 'Large', price: 19.99, icon: '/allergens/vegan.png' },
]
const sizes3 = [
  { label: 'Small', price: 8.99, icon: '/allergens/vegan.png' },
  { label: 'Medium', price: 14.99, icon: '/allergens/vegan.png' },
  { label: 'Large', price: 19.99, icon: '/allergens/vegan.png' },
]
const sizes4 = [
  { label: 'Small', price: 8.99, icon: '/allergens/vegan.png' },
  { label: 'Medium', price: 14.99, icon: '/allergens/vegan.png' },
  { label: 'Large', price: 19.99, icon: '/allergens/vegan.png' },
]

// toppings section
const toppings = reactive([
  {
    label: 'Italian Sausage',
    icon: '/allergens/vegan.png',
    price: 1.95,
    quantity: 0,
  },
  {
    label: 'Pepperoni',
    icon: '/allergens/vegan.png',
    price: 1.95,
    quantity: 3,
  },
])

function increment(item) {
  item.quantity++
}

function decrement(item) {
  if (item.quantity > 0) item.quantity--
}
</script>

<style scoped>
::v-deep(.no-padding-modal .va-modal__inner),
::v-deep(.no-padding-modal .va-modal__content),
::v-deep(.no-padding-modal .va-modal__dialog),
::v-deep(.no-padding-modal .va-modal__body) {
  padding: 0 !important;
}
</style>
<style scoped>
/* .big-modal {
  max-width: 90vw !important;
  width: 90vw !important;
} */
</style>

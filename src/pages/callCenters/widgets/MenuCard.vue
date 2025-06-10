<template>
  <div
    class="cursor-pointer bg-white border border-gray-200 hover:border-blue-500 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition min-w-full sm:min-w-[200px] group"
    @click="getMenuOptions"
  >
    <!-- Text Content -->
    <div class="flex-1 text-left">
      <p class="item-text text-gray-800 text-sm truncate">{{ item.name }}</p>
      <p class="text-blue-600 font-semibold mt-1 text-sm">€{{ parseFloat(item.price).toFixed(2) }}</p>
    </div>

    <!-- Image -->
    <img
      :src="item.imageUrl || '/missing-image.png'"
      alt="icon"
      class="w-12 h-12 ml-4 bg-slate-200 p-2 transform transition-transform duration-300 ease-in-out group-hover:scale-105"
    />
    <MenuModal v-model="showMenuModal" :item="itemWithArticlesOptionsGroups" @cancel="closeMenuModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuModal from '../modals/MenuModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'

const props = defineProps({
  item: Object,
})

const showMenuModal = ref(false)
const isLoading = ref(false)
const itemWithArticlesOptionsGroups = ref({})

const { init } = useToast()

const getMenuOptions = async () => {
  const url = import.meta.env.VITE_API_BASE_URL
  isLoading.value = true
  try {
    const response = await axios.get(`${url}/menuItemvoById/${props.item._id}`)
    console.log('response', response)

    const articlesOptionsGroups = response.data.articlesOptionsGroups

    // Assign item with groups only if data is returned
    itemWithArticlesOptionsGroups.value = {
      ...props.item,
      articlesOptionsGroups: articlesOptionsGroups || [],
    }

    // Open modal if there are any groups
    if (articlesOptionsGroups && articlesOptionsGroups.length) {
      openMenuModal()
    }
  } catch (error) {
    init({ message: 'Something went wrong', color: 'danger' })
  } finally {
    isLoading.value = false
  }
}
function openMenuModal() {
  showMenuModal.value = true
}
function closeMenuModal() {
  showMenuModal.value = false
}
</script>

<style scoped>
.menu-card {
  cursor: pointer;
}
.item-text {
  font-weight: 500;
}
</style>

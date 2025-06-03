<template>
  <div
    class="cursor-pointer bg-white border border-gray-200 hover:border-blue-500 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition min-w-full sm:min-w-[200px]"
    @click="openMenuModal"
  >
    <!-- Text Content -->
    <div class="flex-1 text-left">
      <p class="font-semibold text-gray-800 text-sm truncate">{{ item.name }}</p>
      <p class="text-blue-600 font-semibold mt-1 text-sm">{{ item.price }}</p>
    </div>

    <!-- Image -->
    <img :src="item.imageUrl || '/missing-image.png'" alt="icon" class="w-12 h-12 ml-4 bg-slate-200 p-2" />
    <MenuModal v-model="showMenuModal" @cancel="closeMenuModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuModal from '../modals/MenuModal.vue'

defineProps({
  item: Object,
})

const showMenuModal = ref(false)

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
</style>

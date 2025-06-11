<template>
  <div class="menu-item" @click="getMenuOptions">
    <div class="item-content">
      <div class="item-name">{{ item.name }}</div>
      <div class="item-price">€{{ parseFloat(item.price).toFixed(2) }}</div>
    </div>
    <div class="item-image">
      <img :src="item.imageUrl || '/missing.png'" alt="icon" class="w-full h-full" />
    </div>

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

.menu-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 200px;
  display: flex;
  align-items: flex-start;
}

.menu-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2d5d2a;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}

.item-name {
  font-size: 12px;
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 16px;
  font-weight: 700;
  color: #2d5d2a;
}
</style>

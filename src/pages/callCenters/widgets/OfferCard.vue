<template>
  <div class="menu-item" @click="getOffers">
    <div class="item-content">
      <div class="item-name">{{ item.name }}</div>
      <div class="item-price">€{{ parseFloat(item.price).toFixed(2) }}</div>
    </div>
    <div v-if="item.imageUrl" class="item-image">
      <img :src="item.imageUrl" alt="icon" class="w-full h-full" />
    </div>
    <OfferModal
      v-if="showOfferModal"
      :item="{ ...item, selections: item.selections.map((e) => ({ ...e, selected: 0 })) }"
      @cancel="closeOfferModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
import OfferModal from '../modals/OfferModal.vue'
import { useOrderStore } from '@/stores/order-store'

const props = defineProps({
  item: Object,
})

const showOfferModal = ref(false)
const isLoading = ref(false)
const itemWithOffers = ref({})
const orderStore = useOrderStore()

const { init } = useToast()

function getOffers() {
  openMenuModal()
}
function openMenuModal() {
  showOfferModal.value = true
}
function closeOfferModal() {
  showOfferModal.value = false
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
  width: 80px;
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

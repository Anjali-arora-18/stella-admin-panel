<template>
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <div class="header-text">
            <h2>{{ group.name }}</h2>
          </div>
        </div>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="pizzas-grid">
          <div
            v-for="item in menuItems"
            :key="item._id"
            class="pizza-card"
            :class="{ selected: selectedArticle && selectedArticle.id === item.id }"
            @click.prevent="selectArticle(item)"
          >
            <div class="pizza-image"><img :src="item.imageUrl" class="object-fit" /></div>
            <div class="pizza-content">
              <div class="pizza-name">{{ item.name }}</div>
              <div class="pizza-description">{{ item.description }}</div>
            </div>
            <div class="selection-status"></div>
          </div>
        </div>
      </div>
    </div>
    <OffersMenuModal
      v-if="showOptionsGroup"
      :item="selectedArticle"
      :menu-item-id="selectedArticle.id"
      :offer-group="group"
      :show-menu-modal="showOptionsGroup"
      @itemsAdded="closeModal()"
      @cancel="showOptionsGroup = false"
    />
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import OffersMenuModal from './OffersMenuModal.vue'
import { useMenuStore } from '@/stores/getMenu'
const props = defineProps({
  group: Object,
  menuItems: {
    type: Array,
    required: true,
  },
})
const menuStore = useMenuStore()
const isVisible = ref(false)
const selectedArticle = ref(null)
const showOptionsGroup = ref(false)

function openModal() {
  isVisible.value = true
}

function closeModal() {
  isVisible.value = false
  selectedArticle.value = null
  showOptionsGroup.value = false
}

function selectArticle(article) {
  selectedArticle.value = article
  if (article.optionGroups.length) {
    showOptionsGroup.value = true
  } else {
    const productEntry = {
      itemId: article.id,
      itemName: article.name,
      itemDescription: article.description,
      basePrice: parseFloat(article.price),
      imageUrl: article.imageUrl,
      quantity: 1,
      selectedOptions: [],
      totalPrice: 0,
      selectionTotalPrice: 0,
    }
    menuStore.addItemToOffer(props.group, productEntry)
    closeModal()
  }
}

defineExpose({ openModal })
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 95vw;
  /* max-width: 1000px; */
  height: 85vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #2d5016 0%, #3a6b1d 100%);
  color: white;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e9ecef;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
}

.header-text h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 13px;
  opacity: 0.8;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

.pizzas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.pizza-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.pizza-card:hover {
  border-color: #2d5016;
  background: rgba(45, 80, 22, 0.02);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.pizza-card.selected {
  border-color: #2d5016;
  background: rgba(45, 80, 22, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 80, 22, 0.2);
}

.pizza-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.pizza-card.selected .pizza-image {
  background: rgba(45, 80, 22, 0.1);
}

.pizza-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pizza-name {
  font-size: 18px;
  color: #2d5016;
  font-weight: 700;
  line-height: 1.2;
}

.pizza-description {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.selection-status {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.pizza-card.selected .selection-status {
  border-color: #2d5016;
  background: #2d5016;
  color: white;
}

.selection-status::after {
  content: '✓';
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
}

.pizza-card.selected .selection-status::after {
  opacity: 1;
}

@media (max-width: 768px) {
  .pizzas-grid {
    grid-template-columns: 1fr;
  }

  .pizza-card {
    padding: 16px;
    gap: 12px;
  }

  .pizza-name {
    font-size: 16px;
  }

  .pizza-description {
    font-size: 13px;
  }
}
</style>

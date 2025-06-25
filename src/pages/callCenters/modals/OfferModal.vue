<template>
  <VaModal
    v-model="showOfferModal"
    class="big-xl-modal !p-0"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
  >
    <div class="offer-modal">
      <div class="modal">
        <button class="close-btn" @click="$emit('cancel')">×</button>

        <!-- LEFT: Offer Info -->
        <div class="offer-info">
          <div class="offer-icon">🎉</div>
          <div class="offer-details">
            <h3 class="offer-name">Family Feast Bundle</h3>
            <div class="offer-contents">
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 0; text-align: center; opacity: 0.95">
                Perfect for sharing with family and friends! This generous bundle includes everything you need for a
                complete meal - delicious XL pizzas, crispy chicken sides, golden wedges, and drinks.
              </p>
            </div>
            <div class="price-section">
              <div class="offer-price">€10.99</div>
            </div>
            <button class="add-to-basket" :disabled="totalSelected < totalRequired">
              {{
                totalSelected >= totalRequired
                  ? 'Add Bundle to Basket'
                  : `Complete Your Selection (${totalSelected}/${totalRequired})`
              }}
            </button>
          </div>
        </div>

        <!-- RIGHT: Selection Area -->
        <div class="selection-area">
          <SelectionGroup
            v-for="group in selectionGroups"
            :key="group.title"
            v-model:selectedItems="group.selected"
            :group="group"
          />
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useOrderStore } from '@/stores/order-store'
import SelectionGroup from './SelectionGroup.vue'

const orderStore = useOrderStore()

const showOfferModal = ref(true)
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
watch(showOfferModal, (val) => {
  if (!val) emits('cancel')
})
const totalRequired = 9
const selectionGroups = reactive([
  {
    title: 'XLarge Pizzas',
    max: 3,
    items: ['Margherita 🍕', 'Pepperoni 🍕', 'BBQ Chicken 🍕'],
    selected: ['Margherita 🍕'],
  },
  {
    title: 'Chicken Sides',
    max: 2,
    items: ['Chicken Wings 🍗', 'Spicy Strips 🍗'],
    selected: [],
  },
  {
    title: 'Potato Wedges',
    max: 2,
    items: ['Cheesy Wedges 🧀', 'Spicy Wedges 🌶️'],
    selected: [],
  },
  {
    title: 'Drinks 1.5L',
    max: 2,
    items: ['Coke 🥤', 'Sprite 🥤'],
    selected: [],
  },
])

const totalSelected = computed(() => selectionGroups.reduce((sum, group) => sum + group.selected.length, 0))
</script>
<style>
.offer-modal {
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 98vw;
  height: 90vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.offer-info {
  background: linear-gradient(135deg, #2d5016 0%, #3a6b1d 100%);
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #e9ecef;
  justify-content: space-between;
  color: white;
}

.offer-badge {
  background: rgba(255, 193, 7, 0.9);
  color: #2d5016;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.offer-icon {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.offer-details {
  text-align: center;
  flex: 1;
}

.offer-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.3;
}

.offer-contents {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}
.offer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  opacity: 0.9;
}
.offer-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.item-icon {
  margin-right: 8px;
}

.price-section {
  text-align: center;
  margin: 20px 0;
}
.original-price {
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.7;
  margin-bottom: 5px;
}
.offer-price {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.savings {
  font-size: 12px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  display: inline-block;
}

.add-to-basket {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: auto;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.add-to-basket:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.add-to-basket:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selection-area {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
@media (max-width: 1200px) {
  .modal {
    grid-template-columns: 240px 1fr;
  }
}

@media (max-width: 900px) {
  .modal {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .offer-info {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    flex-direction: row;
    gap: 20px;
    padding: 20px;
    justify-content: flex-start;
  }

  .offer-icon {
    width: 80px;
    height: 80px;
    font-size: 40px;
    margin-bottom: 0;
  }

  .offer-details {
    text-align: left;
    flex: 1;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>

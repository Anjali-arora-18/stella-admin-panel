<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="selection-group">
    <div class="group-header">
      <h3 class="group-title">{{ group.name }}</h3>
      <div class="selection-progress">
        <span>{{ selectedItems.length }}/{{ group.max }} selected</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: percent + '%' }" />
        </div>
      </div>
    </div>
    <div class="items-grid">
      <div
        v-for="item in group.addedItems"
        :key="item"
        class="selection-item selected"
        
        @click="toggleSelection(item)"
      >
        <div class="item-image"><img :src="item.imageUrl" /></div>
        <div class="item-content">
          <div class="item-name">{{ item.itemName }}</div>
          <div class="item-description">{{ item.itemDescription }}</div>
        </div>
        <div class="selection-status"></div>
      </div>

      <div
        v-for="n in group.max - group.addedItems.length"
        :key="'ph-' + n"
        class="selection-item placeholder"
        @click="openSelectionItemModal(group.menuItems)"
      >
        <div class="item-image" style="color: #2d5016">➕</div>
        <div class="item-content">
          <div class="item-label">{{ group.name }} {{ n }}</div>
          <div class="item-name">Select Your {{ group.description }}</div>
          <div class="item-description">Choose from options</div>
        </div>
        <div class="selection-status"></div>
      </div>
    </div>
    <OffersMenuItemsSelectionModal ref="pizzaModal" :group="group" :menu-items="group.menuItems" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import OffersMenuItemsSelectionModal from './OffersMenuItemsSelectionModal.vue'

const props = defineProps({
  group: Object,
})
const emit = defineEmits(['update:selectedItems'])
const pizzaModal = ref(null)
const menuItems = ref(null)
function openSelectionItemModal(payload) {
  menuItems.value = payload || null
  pizzaModal.value?.openModal()
}
const selectedItems = computed(() => props.group.addedItems.map((item) => item._id))
const percent = computed(() => (selectedItems.value.length / props.group.max) * 100)

function toggleSelection(item) {
  // eslint-disable-next-line vue/no-mutating-props
  props.group.addedItems = props.group.addedItems.map((i) => (i._id === item._id ? { ...i, selected: !isSelected } : i))
  emit('update:selectedItems', updated)
}
</script>

<style>
.selection-group {
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}
.group-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d5016;
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-icon {
  font-size: 24px;
}

.selection-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2d5016;
  transition: width 0.3s ease;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.selection-item {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.selection-item:hover {
  border-color: #2d5016;
  background: rgba(45, 80, 22, 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selection-item.selected {
  border-color: #2d5016;
  background: rgba(45, 80, 22, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 80, 22, 0.2);
}

.selection-item.placeholder {
  border-style: dashed;
  border-color: #ced4da;
  background: #f8f9fa;
  cursor: default;
  opacity: 0.7;
}

.selection-item.placeholder:hover {
  transform: none;
  box-shadow: none;
  background: #f8f9fa;
  border-color: #ced4da;
}

.item-image {
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}
.selection-item.selected .item-image {
  background: rgba(45, 80, 22, 0.1);
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-name {
  font-size: 16px;
  color: #495057;
  font-weight: 600;
  line-height: 1.2;
}
.item-description {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.3;
}
.selection-item.placeholder .item-name {
  color: #adb5bd;
  font-style: italic;
}

.selection-status {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selection-item.selected .selection-status {
  border-color: #2d5016;
  background: #2d5016;
  color: white;
}

.selection-status::after {
  content: '✓';
  font-size: 12px;
  font-weight: 700;
  opacity: 0;
}

.selection-item.selected .selection-status::after {
  opacity: 1;
}
</style>

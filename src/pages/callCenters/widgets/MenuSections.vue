<template>
  <section :id="id" class="menu-grid">
    <!-- <h3 class="font-bold text-lg border-b-2 border-blue-500 pb-2">{{ title }}</h3> -->
    <div class="category-title">{{ title }}</div>

    <div>
      <div class="flex flex-col sm:flex-row gap-4 sm:min-w-max">
        <MenuCard v-for="item in items" :key="item.id" :item="item" />
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuCard from '@/pages/callCenters/widgets/MenuCard.vue'

defineProps({
  id: String,
  title: String,
  items: Array,
})
</script>
<style lang="scss" scoped>
.menu-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
}
.category-title {
  grid-column: 1 / -1;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid blue;
}
</style>

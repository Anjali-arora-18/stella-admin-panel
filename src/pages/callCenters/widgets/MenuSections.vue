<template>
  <section :id="id" class="menu-grid">
    <div class="category-title">{{ title }}</div>

    <div class="">
      <div
        class="grid gap-4 sm:min-w-max"
        :class="{
          'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6': isSidebarMinimized,
          'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6': !isSidebarMinimized,
        }"
      >
        <OfferCard v-for="item in items" v-if="id === 'offers'" :key="item.id" :item="item" />

        <MenuCard v-for="item in items" v-else :key="item.id" :item="item" :category-id="id" />
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuCard from '@/pages/callCenters/widgets/MenuCard.vue'
import OfferCard from '@/pages/callCenters/widgets/OfferCard.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/global-store'

defineProps({
  id: String,
  title: String,
  items: Array,
})

const { isSidebarMinimized } = storeToRefs(useGlobalStore())
</script>
<style lang="scss" scoped>
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

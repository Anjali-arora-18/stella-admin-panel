<template>
  <section :id="id" class="menu-grid">
    <div
      class="category-title"
      :style="{
        borderBottom: `2px solid ${outlet.primaryColor}`,
      }"
    >
      {{ title }}
    </div>
    <div v-if="id === 'offers'">
      <MenuSubSections :id="id" :title="title" :items="items" :outlet="outlet" />
    </div>
    <div v-else>
      <MenuSubSections
        :id="id"
        :title="title"
        :items="items.filter((item) => !item.subCategories.length)"
        :outlet="outlet"
      />
      <div v-if="category.subCategories && category.subCategories.length">
        <div v-for="subCat in category.subCategories" :key="subCat._id" class="ml-5">
          <div
            v-if="subCat.menuItems && subCat.menuItems.length"
            class="category-title"
            :style="{
              borderBottom: `2px solid ${outlet.primaryColor}`,
            }"
          >
            {{ subCat.name }}
          </div>
          <MenuSubSections :id="subCat._id" :title="title" :items="subCat.menuItems" :outlet="outlet" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuSubSections from '@/pages/callCenters/widgets/MenuSubSections.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/global-store'

defineProps({
  id: String,
  title: String,
  items: Array,
  category: Object,
  outlet: Object,
})

const { isSidebarMinimized } = storeToRefs(useGlobalStore())
</script>
<style lang="scss" scoped>
.category-title {
  grid-column: 1 / -1;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
}
</style>

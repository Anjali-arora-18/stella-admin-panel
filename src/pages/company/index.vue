<template>
  <div>
    <VaTabs v-model="tab" grow>
      <template #tabs>
        <VaTab v-for="title in ['Categories', 'Menu Items', 'Service Zone']" :key="title" :name="title">
          {{ title }}
        </VaTab>
      </template>
    </VaTabs>

    <div class="mt-6">
      <Categories v-if="tab === 'Categories'" />
      <MenuItems v-if="tab === 'Menu Items'" />
      <!-- <ServiceZone v-if="tab === 2" /> -->
    </div>
  </div>
</template>
<script>
import Categories from '../categories/index.vue'
import MenuItems from '../subCategories/index.vue'
import { ref } from 'vue'
// import ServiceZone from '../service-zone/index.vue';
export default {
  components: {
    Categories,
    MenuItems,
  },
  setup() {
    const tab = ref('Categories')
    return { tab }
  },
}
</script>

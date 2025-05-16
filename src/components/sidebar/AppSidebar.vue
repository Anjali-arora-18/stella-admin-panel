<template>
  <VaSidebar v-model="writableVisible" :width="sidebarWidth" :color="color" minimized-width="0">
    <VaAccordion v-model="value" class="mt-5 pl-5">
      <div class="flex flex-col gap-y-2">
        <span class="font-bold">Menu</span>
        <RouterLink
          :class="$route.name === 'organizeMenu' ? 'text-primary font-bold' : 'text-secondary'"
          to="/organizeMenu"
        >
          <VaIcon name="restaurant_menu" class="mr-2"></VaIcon>
          Organize Menu
        </RouterLink>
        <RouterLink
          :class="$route.name === 'categories' ? 'text-primary font-bold' : 'text-secondary'"
          to="/categories"
        >
          <VaIcon name="category" class="mr-2"></VaIcon>
          Categories
        </RouterLink>
        <RouterLink to="/articles" :class="$route.name === 'articles' ? 'text-primary font-bold' : 'text-secondary'">
          <VaIcon name="article" class="mr-2"></VaIcon>
          Articles
        </RouterLink>
        <span class="text-secondary"> <VaIcon name="tune" class="mr-2"></VaIcon>Articles Options</span>
        <span class="text-secondary"> <VaIcon name="delete" class="mr-2"></VaIcon>Deleted Articles</span>
        <RouterLink :class="$route.name === 'allergens' ? 'text-primary font-bold' : 'text-secondary'" to="/allergens">
          <VaIcon name="warning" class="mr-2"></VaIcon>
          Allergens
        </RouterLink>
        <span class="font-bold">Configuration</span>
        <RouterLink :class="$route.name === 'list' ? 'text-primary font-bold' : 'text-secondary'" to="/outlets/list">
          <VaIcon name="store" class="mr-2"></VaIcon>
          Outlet
        </RouterLink>
        <RouterLink to="/areas" :class="$route.name === 'areas' ? 'text-primary font-bold' : 'text-secondary'">
          <VaIcon name="location_on" class="mr-2"></VaIcon>
          Areas
        </RouterLink>
        <span class="text-secondary"> <VaIcon name="qr_code" class="mr-2"></VaIcon>QR Codes</span>
        <span class="text-secondary"> <VaIcon name="payments" class="mr-2"></VaIcon>Payments</span>
        <span class="text-secondary"> <VaIcon name="local_shipping" class="mr-2"></VaIcon>Delivery Zones</span>
        <span class="text-secondary"> <VaIcon name="language" class="mr-2"></VaIcon>Languages</span>
        <span class="font-bold">Admin</span>
        <RouterLink to="/outlets/list" :class="$route.name === 'list' ? 'text-primary font-bold' : 'text-secondary'"
          ><VaIcon name="storefront" class="mr-2"></VaIcon>Outlets</RouterLink
        >
        <span class="text-secondary"> <VaIcon name="people" class="mr-2"></VaIcon>Users</span>
      </div>
    </VaAccordion>
  </VaSidebar>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

export default defineComponent({
  name: 'Sidebar',
  props: {
    visible: { type: Boolean, default: true },
    mobile: { type: Boolean, default: false },
  },
  emits: ['update:visible'],

  setup: (props, { emit }) => {
    const { getColor } = useColors()
    const { t } = useI18n()
    const writableVisible = computed({
      get: () => props.visible,
      set: (v: boolean) => emit('update:visible', v),
    })
    const sidebarWidth = computed(() => (props.mobile ? '100vw' : '180px'))
    const color = computed(() => getColor('background-secondary'))
    return {
      writableVisible,
      sidebarWidth,
      color,
      t,
    }
  },
})
</script>

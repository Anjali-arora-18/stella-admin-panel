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
        <RouterLink
          to="/articlesOptions"
          :class="$route.name === 'articlesOptions' ? 'text-primary font-bold' : 'text-secondary'"
        >
          <VaIcon name="tune" class="mr-2"></VaIcon>
          Articles Options
        </RouterLink>
        <RouterLink
          to="/deletedArticles"
          :class="$route.name === 'deletedArticles' ? 'text-primary font-bold' : 'text-secondary'"
        >
          <VaIcon name="delete" class="mr-2"></VaIcon>
          Deleted Articles
        </RouterLink>
        <RouterLink :class="$route.name === 'allergens' ? 'text-primary font-bold' : 'text-secondary'" to="/allergens">
          <VaIcon name="warning" class="mr-2"></VaIcon>
          Allergens
        </RouterLink>
      </div>
      <div v-if="userRole !== 'editor'" class="flex flex-col gap-y-2 mt-5">
        <span class="font-bold">Configuration</span>
        <Span
          :class="
            $route.name === 'update-outlet' ? 'cursor-pointer text-primary font-bold' : ' cursor-pointer text-secondary'
          "
          @click="goToOutlet"
        >
          <VaIcon name="store" class="mr-2"></VaIcon>
          Outlet
        </Span>
        <RouterLink to="/areas" :class="$route.name === 'areas' ? 'text-primary font-bold' : 'text-secondary'">
          <VaIcon name="location_on" class="mr-2"></VaIcon>
          Areas
        </RouterLink>
        <span class="text-secondary"> <VaIcon name="qr_code" class="mr-2"></VaIcon>QR Codes</span>
        <RouterLink to="/payments" :class="$route.name === 'payments' ? 'text-primary font-bold' : 'text-secondary'">
          <VaIcon name="payments" class="mr-2"></VaIcon>
          Payments
        </RouterLink>
        <RouterLink
          to="/deliveryZone"
          :class="$route.name === 'deliveryZone' ? 'text-primary font-bold' : 'text-secondary'"
        >
          <VaIcon name="local_shipping" class="mr-2"></VaIcon>
          Delivery Zones
        </RouterLink>
        <span class="text-secondary"> <VaIcon name="language" class="mr-2"></VaIcon>Languages</span>
      </div>
      <div v-if="userRole === 'super-admin'" class="flex flex-col gap-y-2 mt-5">
        <span class="font-bold">Admin</span>
        <RouterLink
          to="/outlets/list"
          :class="
            $route.name === 'list' || $route.name === 'admin-update-outlet'
              ? 'text-primary font-bold'
              : 'text-secondary'
          "
          ><VaIcon name="storefront" class="mr-2"></VaIcon>Outlets</RouterLink
        >
        <RouterLink
          to="/stellaUsers"
          :class="$route.name === 'stellaUsers' ? 'text-primary font-bold' : 'text-secondary'"
        >
          <VaIcon name="people" class="mr-2"></VaIcon>
          Users
        </RouterLink>
      </div>
    </VaAccordion>
  </VaSidebar>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
import { useColors, useToast } from 'vuestic-ui'
import { useUsersStore } from '@/stores/users'
import { useServiceStore } from '@/stores/services'
export default defineComponent({
  name: 'Sidebar',
  props: {
    visible: { type: Boolean, default: true },
    mobile: { type: Boolean, default: false },
  },
  emits: ['update:visible'],

  setup: (props, { emit }) => {
    const userRole = ref('')
    const userStore = useUsersStore()
    const servicesStore = useServiceStore()
    const { init } = useToast()
    userStore.getUser().then((response) => {
      userRole.value = response.data.role
    })
    const { getColor } = useColors()
    const { t } = useI18n()
    const writableVisible = computed({
      get: () => props.visible,
      set: (v: boolean) => emit('update:visible', v),
    })
    const sidebarWidth = computed(() => (props.mobile ? '100vw' : '180px'))
    const color = computed(() => getColor('background-secondary'))
    return {
      userRole,
      writableVisible,
      sidebarWidth,
      color,
      servicesStore,
      t,
    }
  },
  methods: {
    goToOutlet() {
      if (this.servicesStore.selectedRest) {
        this.$router.push('/outlets/update/' + this.servicesStore.selectedRest)
      } else {
        this.init({
          message: 'Please select outlet from top navigation bar.',
          color: 'danger',
        })
      }
    },
  },
})
</script>

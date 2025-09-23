<template>
  <VaSidebar v-model="writableVisible" :width="sidebarWidth" :color="color" minimized-width="0">
    <VaAccordion class="mt-5 pl-5">
      <!-- Call Center -->
      <div v-if="userRole !== 'editor'" class="flex flex-col gap-y-1.5 mb-4">
        <span class="font-bold text-gray-800 uppercase tracking-wide text-xs mb-1">Call Center</span>
        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'callCenters'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/callCenters"
        >
          <VaIcon name="headset_mic" class="mr-2" />
          Call Center
        </RouterLink>
      </div>

      <!-- Menu -->
      <div v-if="userRole !== 'caller'" class="flex flex-col gap-y-1.5 mb-4">
        <span class="font-bold text-gray-800 uppercase tracking-wide text-xs mb-1">Menu</span>
        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'organizeMenu'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/organizeMenu"
        >
          <VaIcon name="drag_indicator" class="mr-2" />
          Sort Menu
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'categories'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/categories"
        >
          <VaIcon name="mso-subheader" class="mr-2" />
          Categories
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'articles'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/articles"
        >
          <VaIcon name="fastfood" class="mr-2" />
          Articles
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'articlesOptionsGroups'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/articlesOptions/groups"
        >
          <VaIcon name="mso-toggle_on" class="mr-2" />
          Article Options
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'offers'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/offers"
        >
          <VaIcon name="mso-award_meal" class="mr-2" />
          Offers
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'promotions'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/promotions"
        >
          <VaIcon name="mso-percent_discount" class="mr-2" />
          Promotions
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'allergens'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/allergens"
        >
          <VaIcon name="mso-egg" class="mr-2" />
          Allergens
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'deletedArticles'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/deletedArticles"
        >
          <VaIcon name="mso-delete" class="mr-2" />
          Deleted Articles
        </RouterLink>
      </div>

      <!-- Configuration -->
      <div v-if="userRole.includes('admin')" class="flex flex-col gap-y-1.5 mt-4">
        <span class="font-bold text-gray-800 uppercase tracking-wide text-xs mb-1">Configuration</span>

        <span
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2 cursor-pointer',
            $route.name === 'update-outlet'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          @click="goToOutlet"
        >
          <VaIcon name="storefront" class="mr-2"></VaIcon>
          Outlet
        </span>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'areas'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/areas"
        >
          <VaIcon name="deck" class="mr-2"></VaIcon>
          Areas
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'deliveryZone'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/deliveryZone"
        >
          <VaIcon name="location_on" class="mr-2"></VaIcon>
          Delivery Zones
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'payments'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/payments"
        >
          <VaIcon name="credit_card" class="mr-2"></VaIcon>
          Payments
        </RouterLink>

        <span class="flex items-center py-1 rounded-lg mr-2 pl-2 -ml-2 text-gray-400">
          <VaIcon name="qr_code_scanner" class="mr-2"></VaIcon>
          QR Codes
        </span>

        <span class="flex items-center py-1 rounded-lg mr-2 pl-2 -ml-2 text-gray-400">
          <VaIcon name="mso-globe" class="mr-2"></VaIcon>
          Languages
        </span>
      </div>

      <!-- Admin -->
      <div v-if="userRole === 'super-admin'" class="flex flex-col gap-y-1.5 mt-4">
        <span class="font-bold text-gray-800 uppercase tracking-wide text-xs mb-1">Admin</span>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'list' || $route.name === 'admin-update-outlet'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/outlets/list"
        >
          <VaIcon name="storefront" class="mr-2" />
          Outlets
        </RouterLink>

        <RouterLink
          :class="[
            'flex items-center py-1 rounded-lg transition mr-2 pl-2 -ml-2',
            $route.name === 'stellaUsers'
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
          ]"
          to="/stellaUsers"
        >
          <VaIcon name="people" class="mr-2" />
          Users
        </RouterLink>
      </div>
    </VaAccordion>
  </VaSidebar>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { headset } from 'lucide-vue-next'
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

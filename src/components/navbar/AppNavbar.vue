<template>
  <VaNavbar class="app-layout-navbar py-2 px-0">
    <template #left>
      <div class="left">
        <Transition name="icon-fade" mode="out-in">
          <VaIconMenuCollapsed
            class="cursor-pointer"
            :class="{ 'x-flip': !isSidebarMinimized }"
            :color="collapseIconColor"
            @click="GlobalStore.toggleSidebar()"
          />
        </Transition>
        <RouterLink to="/" aria-label="Visit home page">
          <VuesticLogo />
        </RouterLink>
      </div>
    </template>
    <template #right>
      <div class="flex items-center">
        <VaSelect v-model="selectedRest" :options="restOptions" placeholder="Select an option" />
        <AppNavbarActions class="app-navbar__actions" :is-mobile="isMobile" />
      </div>
    </template>
  </VaNavbar>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useColors } from 'vuestic-ui'
import VaIconMenuCollapsed from '../icons/VaIconMenuCollapsed.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../../stores/global-store'
import AppNavbarActions from './components/AppNavbarActions.vue'
import VuesticLogo from '../VuesticLogo.vue'
import { useServiceStore } from '../../stores/services'
import { useRoute } from 'vue-router'
const route = useRoute()
const servicesStore = useServiceStore()
defineProps({
  isMobile: { type: Boolean, default: false },
})

const GlobalStore = useGlobalStore()

const selectedRest = ref('')
const restOptions = ref([])
const restlist = ref([])
const { isSidebarMinimized } = storeToRefs(GlobalStore)
const { getColor } = useColors()

const collapseIconColor = computed(() => getColor('secondary'))
const getOutlets = () => {
  servicesStore.getAll().then(() => {
    restlist.value = servicesStore.items
    restOptions.value = servicesStore.items.map((e) => e.name)

    const storedRest = sessionStorage.getItem('selectedRest')
    if (storedRest) {
      const found = servicesStore.items.find((a) => a._id === storedRest)
      if (found) {
        selectedRest.value = found.name
        servicesStore.setRest(found._id)
      }
    } else {
      selectedRest.value = servicesStore.items[0].name
      servicesStore.setRest(servicesStore.items[0]._id)
    }
  })
}
getOutlets()

watch(
  () => servicesStore.selectedRest,
  () => {
    selectedRest.value = restlist.value.find((a) => a._id === servicesStore.selectedRest).name
  },
)
watch(
  () => route.name,
  () => {
    getOutlets()
  },
)

watch(selectedRest, (newValue) => {
  const foundRest = restlist.value.find((a) => a.name === newValue)
  if (foundRest) {
    servicesStore.setRest(foundRest._id)
    sessionStorage.setItem('selectedRest', foundRest._id)
  }
})
</script>

<style lang="scss" scoped>
.va-navbar {
  z-index: 2;

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      display: flex;
      justify-content: space-between;
    }
  }
}

.left {
  display: flex;
  align-items: center;
  margin-left: 1rem;

  & > * {
    margin-right: 1rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: transform 0.5s ease;
}

.icon-fade-enter,
.icon-fade-leave-to {
  transform: scale(0.5);
}
.x-flip {
  transform: scaleX(-100%);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicesTable from './widgets/ServicesTable.vue'
import { useServiceStore } from '../../stores/services'
const servicesStore = useServiceStore()
const items = ref([])
const isLoading = ref(true)
const route = useRoute()
const { push } = useRouter()

function loadData() {
  servicesStore.getAll().then(() => {
    items.value = servicesStore.items
    isLoading.value = false
  })
}
loadData()
</script>

<template>
  <div>
    <VaCard class="mt-4">
      <VaCardContent>
        <ServicesTable
          title="Outlets"
          add-button-label="Add Outlet"
          :selected-rest="servicesStore.selectedRest"
          :items="items"
          :loading="isLoading"
          @loadData="loadData"
          @addClicked="push({ name: 'create-outlet' })"
        />
      </VaCardContent>
    </VaCard>
  </div>
</template>

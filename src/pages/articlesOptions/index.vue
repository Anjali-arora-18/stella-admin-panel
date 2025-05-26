<script setup lang="ts">
import { ref, watch } from 'vue'
import OptionGroupsTable from '@/pages/articlesOptions/widgets/OptionGroupsTable.vue'
import OptionsTable from '@/pages/articlesOptions/widgets/OptionsTable.vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
import { useToast } from 'vuestic-ui'

const serviceStore = useServiceStore()
const items = ref([])

const { init } = useToast()
const isLoading = ref(true)

const activeTab = ref(0)
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <h1 class="page-title font-bold">Article Options</h1>
  </div>
  <div class="rounded border bg-white p-3 w-full" style="box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)">
    <VaTabs v-model="activeTab" grow>
      <template #tabs>
        <VaTab label="Option Groups" />
        <VaTab label="Options" />
      </template>
      <VaCard square>
        <VaCardContent v-if="activeTab === 0">
          <OptionGroupsTable :items="items" :loading="isLoading" />
        </VaCardContent>
        <VaCardContent v-else-if="activeTab === 1">
          <OptionsTable :items="items" :loading="isLoading" />
        </VaCardContent>
      </VaCard>
    </VaTabs>
  </div>
</template>
<style lang="scss">
.va-tabs {
  .va-tabs__content {
    width: 100% !important;
  }
}
</style>

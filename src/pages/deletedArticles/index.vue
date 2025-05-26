<script setup lang="ts">
import { ref, watch } from 'vue'
import DeletedArticleTable from '@/pages/deletedArticles/widgets/DeletedArticleTable.vue'
import { useServiceStore } from '@/stores/services'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
const serviceStore = useServiceStore()
const items = ref([])
const { init } = useToast()
const isLoading = ref(false)
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="page-title font-bold">Deleted Article</h1>
  </div>

  <VaCard>
    <VaCardContent>
      <DeletedArticleTable :items="items" :loading="isLoading" />
    </VaCardContent>
  </VaCard>
</template>

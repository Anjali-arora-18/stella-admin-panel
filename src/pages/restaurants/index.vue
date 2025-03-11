<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import ResturantTable from './widgets/ResturantTable.vue'
import { User } from './types'
import { useUsers } from './composables/useUsers'
import { useToast } from 'vuestic-ui'
import { useProjects } from '../projects/composables/useProjects'

const { users, isLoading, filters, sorting, pagination, error, ...usersApi } = useUsers()

const { init: notify } = useToast()

watchEffect(() => {
  if (error.value) {
    notify({
      message: error.value.message,
      color: 'danger',
    })
  }
})
</script>

<template>
  <h1 class="page-title font-bold">Restaurants</h1>
  <VaCard>
    <VaCardContent>
      <ResturantTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :users="users"
        :projects="projects"
        :loading="isLoading"
        :pagination="pagination"
        @editUser="showEditUserModal"
        @deleteUser="onUserDelete"
      />
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import SubCategoriesTable from './widgets/subCategoriesTable.vue'
import { useUsers } from './composables/useUsers'
import { useToast } from 'vuestic-ui'

const { users, isLoading, sorting, pagination, error } = useUsers()

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
  <VaCard>
    <VaCardContent>
      <SubCategoriesTable
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

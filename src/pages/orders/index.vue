<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import SubCategoriesTable from './widgets/subCategoriesTable.vue'
import { User } from './types'
import { useUsers } from './composables/useUsers'
import { useToast } from 'vuestic-ui'
import { useProjects } from '../projects/composables/useProjects'
import EditUserForm from './widgets/EditUserForm.vue'
const doShowEditUserModal = ref(false)

const { users, isLoading, sorting, pagination, error } = useUsers()
const { projects } = useProjects()

const userToEdit = ref<User | null>(null)

const showEditUserModal = (user: User) => {
  userToEdit.value = user
  doShowEditUserModal.value = true
}

const showAddUserModal = () => {
  userToEdit.value = null
  doShowEditUserModal.value = true
}

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
  <h1 class="page-title font-bold">Order List</h1>
  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-start">
        <VaButton @click="showAddUserModal">Orders</VaButton>
      </div>

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

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditUserModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">Order Detail</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Save' : 'Add'"
      @close="cancel"
      @save="
        (user) => {
          onUserSaved(user)
          ok()
        }
      "
    />
  </VaModal>
</template>

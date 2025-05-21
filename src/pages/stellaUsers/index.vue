<script setup lang="ts">
import { ref, watch } from 'vue'
import StellaUsersTable from '@/pages/stellaUsers/widgets/UsersTable.vue'
import { useUsersStore } from '../../stores/users'
import { useServiceStore } from '@/stores/services'
import EditStellaUserModal from './modals/EditStellaUserModal.vue'
import { useToast } from 'vuestic-ui'
const isEditStellaUserModalOpen = ref(false)
const stellaUserStore = useUsersStore()
const serviceStore = useServiceStore()
const items = ref([])
const sortBy = ref('name')
const sortOrder = ref('asc')
const { init } = useToast()
const isLoading = ref(true)
const selectedStellaUser = ref('')

const getStellaUsers = (outletId) => {
  isLoading.value = true
  items.value = []
  const payload = {
    page: 1,
    limit: 50,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    outletId: outletId,
  }
  stellaUserStore.getAll(payload).then((response) => {
    items.value = response.data
    isLoading.value = false
  })
}
watch(
  () => serviceStore.selectedRest,
  (newId) => {
    if (newId) {
      getStellaUsers(serviceStore.selectedRest)
    }
  },
  { immediate: true },
)

// function updateSortBy(payload) {
//   sortBy.value = payload
//   getCategories(serviceStore.selectedRest)
// }
// function updateSortOrder(payload) {
//   sortOrder.value = payload
//   getCategories(serviceStore.selectedRest)
// }

const editUser = (payload) => {
  isEditStellaUserModalOpen.value = true
  selectedStellaUser.value = payload
}

async function deleteUser(payload) {
  const data = {
    id: payload._id,
  }
  stellaUserStore
    .deleteUser(data)
    .then((response) => {
      if (response.status === 200) {
        init({
          message: "You've successfully deleted user",
          color: 'success',
        })
        getStellaUsers(serviceStore.selectedRest)
      }
    })
    .catch((err) => {
      init({
        message: err.response.data,
        color: 'error',
      })
    })
}
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="page-title font-bold">Users</h1>
    <div class="flex gap-2">
      <VaButton size="small" color="primary" @click="isEditStellaUserModalOpen = true"> Add User </VaButton>
    </div>
  </div>

  <VaCard>
    <VaCardContent>
      <StellaUsersTable :items="items" :loading="isLoading" @editUser="editUser" @deleteUser="deleteUser" />
    </VaCardContent>
  </VaCard>

  <EditStellaUserModal
    v-if="isEditStellaUserModalOpen"
    :selected-user="selectedStellaUser"
    @cancel="(isEditStellaUserModalOpen = false), (selectedStellaUser = ''), getStellaUsers(serviceStore.selectedRest)"
  />
</template>

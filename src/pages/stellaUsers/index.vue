<script setup lang="ts">
import { ref, watch } from 'vue'
import StellaUsersTable from '@/pages/stellaUsers/widgets/UsersTable.vue'
import { useUsersStore } from '../../stores/users'
import { useServiceStore } from '@/stores/services'
import EditStellaUserModal from './modals/EditStellaUserModal.vue'
import axios from 'axios'
import { useToast } from 'vuestic-ui'
const isEditStellaUserModalOpen = ref(false)
const stellaUserStore = useUsersStore()
const serviceStore = useServiceStore()
const items = ref([])
const count = ref(0)
const pageNumber = ref(1)
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const { init } = useToast()
const isLoading = ref(true)
const paymentTypes = ref([])
const selectedStellaUser = ref('')

const getStellaUsers = (outletId) => {
  isLoading.value = true
  items.value = []
  const payload = {
    page: pageNumber.value,
    limit: 10,
    search: searchQuery.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }
  stellaUserStore.getAll(payload).then((response) => {
    items.value = response.data
    isLoading.value = false
  })
}

function getUsersForPagination(payload) {
  pageNumber.value = payload.page
  searchQuery.value = payload.searchQuery
  getStellaUsers(serviceStore.selectedRest)
}

const getStellaUsersCount = (outletId) => {
  const url = import.meta.env.VITE_API_BASE_URL
  axios.get(`${url}/users/count?search=${searchQuery.value}`).then((response) => {
    count.value = Number(response.data.totalNoRec)
  })
}

getStellaUsers(serviceStore.selectedRest)
getStellaUsersCount(serviceStore.selectedRest)

watch(searchQuery, (search) => {
  getStellaUsersCount(serviceStore.selectedRest)
})

function updateSortBy(payload) {
  sortBy.value = payload
  getStellaUsers(serviceStore.selectedRest)
}

function updateSortOrder(payload) {
  sortOrder.value = payload
  getStellaUsers(serviceStore.selectedRest)
}

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
      <StellaUsersTable
        :sort-by="sortBy"
        :sort-order="sortOrder"
        :items="items"
        :loading="isLoading"
        :count="count"
        :payment-types="paymentTypes"
        @sortBy="updateSortBy"
        @sortingOrder="updateSortOrder"
        @editUser="editUser"
        @deleteUser="deleteUser"
        @getUsersForPagination="getUsersForPagination"
      />
    </VaCardContent>
  </VaCard>

  <EditStellaUserModal
    v-if="isEditStellaUserModalOpen"
    :payment-types="paymentTypes"
    :selected-user="selectedStellaUser"
    @cancel="(isEditStellaUserModalOpen = false), (selectedStellaUser = ''), getStellaUsers(serviceStore.selectedRest)"
  />
</template>

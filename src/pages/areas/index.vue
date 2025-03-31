<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AreasTable from './widgets/AreasTable.vue'
import EditTableModal from './modals/EditTableModal.vue'
import AreaFormModal from './modals/AreaFormModal.vue'
import { useServiceStore } from '../../stores/services'
import { useToast } from 'vuestic-ui'
const servicesStore = useServiceStore()
const items = ref([])
const openAreaModal = ref(false)
const areaId = ref('')
const outletId = ref('')
const area = ref('')
const tableData = ref('')
const isLoading = ref(true)
const { init } = useToast()
const isEditTableModalOpen = ref(false)
if (servicesStore.selectedRest) {
  getAreas()
}
watch(
  () => servicesStore.selectedRest,
  async () => {
    await getAreas()
  },
)

function openTableModal(payload) {
  areaId.value = payload
  isEditTableModalOpen.value = true
}
function editArea(payload) {
  openAreaModal.value = true
  outletId.value = payload.outletId
  area.value = payload
}
function editTable(payload) {
  isEditTableModalOpen.value = true
  areaId.value = payload.areaId
  tableData.value = payload
}
function cancelArea() {
  getAreas()
  openAreaModal.value = false
  outletId.value = ''
  area.value = ''
}
function cancelTable() {
  isEditTableModalOpen.value = false
  getAreas()
  areaId.value = ''
  tableData.value = ''
}
async function getAreas() {
  isLoading.value = true
  await servicesStore.getAreas().then((response) => {
    items.value = response.data
  })
  isLoading.value = false
}

async function submitArea(payload) {
  const data = {
    name: payload.areaName,
    disabled: payload.areaDisabled,
    outletId: servicesStore.selectedRest,
  }
  servicesStore
    .saveArea(data)
    .then((response) => {
      if (response.status === 201) {
        init({
          message: "You've successfully added area",
          color: 'success',
        })
        openAreaModal.value = false
        getAreas()
      }
    })
    .catch((err) => {
      init({
        message: err.response.data,
        color: 'error',
      })
      openAreaModal.value = false
    })
}
async function updateArea(payload) {
  const data = {
    data: {
      name: payload.areaName,
      disabled: payload.areaDisabled,
    },
    id: payload._id,
  }
  servicesStore
    .updateArea(data)
    .then((response) => {
      if (response.status === 200) {
        init({
          message: "You've successfully updated area",
          color: 'success',
        })
        openAreaModal.value = false
        getAreas()
      }
    })
    .catch((err) => {
      init({
        message: err.response.data,
        color: 'error',
      })
      openAreaModal.value = false
    })
}
async function deleteArea(payload) {
  const data = {
    id: payload._id,
  }
  servicesStore
    .deleteArea(data)
    .then((response) => {
      if (response.status === 200) {
        init({
          message: "You've successfully deleted area",
          color: 'success',
        })
        getAreas()
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
  <div>
    <div class="flex">
      <h1 class="page-title font-bold">Areas</h1>
      <VaButton
        :disabled="!servicesStore.selectedRest"
        class="ml-auto h-fit"
        color="primary"
        @click="openAreaModal = true"
        >Create</VaButton
      >
    </div>
    <VaCard>
      <VaCardContent>
        <AreasTable
          v-if="servicesStore.selectedRest"
          :items="items"
          :loading="isLoading"
          @loadArea="getAreas"
          @editArea="editArea"
          @deleteArea="deleteArea"
          @editTable="editTable"
          @openTableModal="openTableModal"
        />
        <span v-else>Please select Outlet</span>
      </VaCardContent>
    </VaCard>
    <EditTableModal
      v-if="isEditTableModalOpen"
      :table-data="tableData"
      :area-id="areaId"
      @loadAreas="getAreas"
      @cancel="cancelTable"
    />
    <AreaFormModal
      v-if="openAreaModal"
      :area="area"
      :outlet-id="outletId"
      @submitArea="submitArea"
      @updateArea="updateArea"
      @cancel="cancelArea"
    />
  </div>
</template>

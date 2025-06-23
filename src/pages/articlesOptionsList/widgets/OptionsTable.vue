<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import EditArticleOptionModal from '../modals/EditArticleOptionModal.vue'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import axios from 'axios'

const isEditArticleOptionModal = ref(false)
const selectedOptions = ref('')

const emits = defineEmits(['getOptions', 'editOption', 'cloneArticle', 'sortBy', 'sortingOrder', 'updateOptionModal'])
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  loading: { type: Boolean, default: false },
})
const { confirm } = useModal()
const { init } = useToast()
const router = useRouter()
const servicesStore = useServiceStore()
const selectedRest = computed(() => servicesStore.selectedRest)
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'ID', sortable: false },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'POS Name', key: 'posName', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Code', key: 'code', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Type', key: 'type', sortable: false },
  { label: 'Price', key: 'price', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Min Choices', key: 'minimumChoices' },
  { label: 'Max Choices', key: 'maximumChoices' },
  { label: 'Image', key: 'imageUrl' },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])
function editOption(payload) {
  isEditArticleOptionModal.value = true
  selectedOptions.value = payload
}
async function updateData(rowData) {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    _id: rowData._id,
    outletId: servicesStore.selectedRest,
    name: rowData.name,
    posName: rowData.posName,
    code: rowData.code,
    type: rowData.type,
    price: rowData.price,
    minimumChoices: rowData.minimumChoices,
    maximumChoices: rowData.maximumChoices,
    isActive: rowData.isActive,
    isDeleted: rowData.isDeleted,
    articlesOptionsGroups: rowData.articlesOptionsGroups.map((group) => group._id),
    imageUrl: rowData.imageUrl || '',
  }
  await axios
    .patch(`${url}/articles-options/${rowData._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated a Options", color: 'success' })
      emits('getOptions')
    })
    .catch((err) => {
      init({ message: err.response.data.message, color: 'danger' })
    })
}

const onButtonOptionsDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Options?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Options',
  })
  if (result) {
    deleteOptions(payload)
  }
}
async function deleteOptions(payload) {
  await updateData({ ...payload, isDeleted: true })
}

const cloneArticle = (article) => {
  const clonedData = { ...article }
  delete clonedData._id
  delete clonedData.createdAt
  delete clonedData.updatedAt
  delete clonedData.__v
  selectedOptions.value = {
    ...clonedData,
    name: `${clonedData.name}`,
  }
  isEditArticleOptionModal.value = true
}

const items = toRef(props, 'items')
const searchQuery = ref('')
watch(searchQuery, (search) => {
  emits('getOptions', searchQuery.value)
})

function openFileModal(data) {
  console.log(data)
  document.getElementById('file-upload-' + data._id).click()
}
const deleteAsset = async (assetId) => {
  const url: any = import.meta.env.VITE_API_BASE_URL
  await axios
    .delete(`${url}/assets/${assetId}`)
    .then(() => {
      init({ message: 'Asset deleted successfully', color: 'success' })
    })
    .catch((err) => {
      init({ message: err.response.data.error, color: 'danger' })
    })
}
const onButtonOptionImageDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to delete this image?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Image',
  })

  if (!result) return

  try {
    if (payload.assetId && payload.assetId._id) {
      await deleteAsset(payload.assetId._id)
    }

    payload.imageUrl = ''
    payload.assetId = ''
    await updateData(payload)
  } catch (err) {
    init({ message: err?.response?.data?.message || 'Failed to delete image', color: 'danger' })
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
      <VaInput v-model="searchQuery" placeholder="Search..." class="max-w-[400px] w-full" size="small" />
      <VaButton size="small" color="primary" @click="isEditArticleOptionModal = true"> Add Option </VaButton>
    </div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="$props.loading"
      :disable-client-side-sorting="true"
      :style="{
        '--va-data-table-height': '580px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
      @update:sortBy="(sortBy) => $emit('sortBy', sortBy)"
      @update:sortingOrder="(sortDesc) => $emit('sortingOrder', sortDesc)"
    >
      <template #cell(name)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editName" @click="rowData.editName = true">{{ rowData.name }}</div>
          <input
            v-else
            v-model="rowData.name"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(posName)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editPOSName" @click="rowData.editPOSName = true">{{ rowData.posName }}</div>
          <input
            v-else
            v-model="rowData.posName"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(code)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editCode" @click="rowData.editCode = true">{{ rowData.code }}</div>
          <input
            v-else
            v-model="rowData.code"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(price)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editPrice" @click="rowData.editPrice = true">{{ rowData.price }}</div>
          <input
            v-else
            v-model="rowData.price"
            class="w-1/2 p-1 border rounded"
            type="number"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(minimumChoices)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editMinimumChoices" @click="rowData.editMinimumChoices = true">
            {{ rowData.minimumChoices }}
          </div>
          <input
            v-else
            v-model="rowData.minimumChoices"
            class="w-1/2 p-1 border rounded"
            type="number"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(maximumChoices)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editMaximumChoices" @click="rowData.editMaximumChoices = true">
            {{ rowData.maximumChoices }}
          </div>
          <input
            v-else
            v-model="rowData.maximumChoices"
            class="w-1/2 p-1 border rounded"
            type="number"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(imageUrl)="{ rowData }">
        <div class="relative group w-10 h-10 overflow-hidden rounded">
          <!-- Image Display -->
          <img
            :src="rowData.imageUrl || '/missing-image.png'"
            alt="Article Image"
            class="w-full h-full object-cover cursor-pointer"
            @click="openFileModal(rowData)"
            @error="
              (e) => {
                e.target.src = '/missing-image.png'
              }
            "
          />

          <!-- Delete Button (Top-Right Corner) -->
          <VaButton
            v-if="rowData.imageUrl"
            preset="plain"
            size="small"
            icon="mso-delete"
            color="danger"
            class="!absolute !top-0 !right-0 !p-0 !w-5 !h-5 !rounded-full hidden group-hover:flex items-center justify-center z-10"
            @click.prevent="onButtonOptionImageDelete(rowData)"
          />

          <!-- File Upload Trigger -->
          <FileUpload
            :attr-id="'file-upload-' + rowData._id"
            class="hidden"
            :selected-rest="selectedRest"
            @uploadSuccess="
              (data) => {
                rowData.imageUrl = data.url
                rowData.assetId = data._id
                updateData(rowData)
                rowData.editing = ''
              }
            "
          />
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" icon="mso-content_copy" class="mr-2" @click="cloneArticle(rowData)" />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonOptionsDelete(rowData)"
          />
        </div>
      </template>
    </VaDataTable>
  </div>
  <EditArticleOptionModal
    v-if="isEditArticleOptionModal"
    :selected-option="selectedOptions"
    @cancel="(isEditArticleOptionModal = false), (selectedOptions = ''), emits('getOptions')"
  />
</template>

<style lang="scss" scoped>
.notification-dropdown {
  cursor: pointer;

  .notification-dropdown__icon {
    position: relative;
    display: flex;
    align-items: center;
  }
  .va-dropdown__anchor {
    display: inline-block;
  }
}
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
::v-deep(.va-data-table__table thead th:last-child) {
  text-align: right !important;
}
</style>

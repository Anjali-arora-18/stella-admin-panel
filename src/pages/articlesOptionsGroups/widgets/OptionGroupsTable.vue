<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import EditArticleOptionGroupsModal from '../modals/EditArticleOptionGroupsModal.vue'
import EditArticleOptionGroupsOptionsModal from '../modals/EditArticleOptionGroupsOptionsModal.vue'
import EditArticleOptionGroupsItemsModal from '../modals/EditArticleOptionGroupsItemsModal.vue'
import EditOptionGroupArticlesModal from '../modals/EditOptionGroupArticlesModal.vue'
import axios from 'axios'

const isEditArticleOptionGroupsModal = ref(false)
const selectedOptionGroups = ref('')
const isEditArticleOptionsModal = ref(false)
const isEditArticleOptionGroupsItemsModal = ref(false)
const isEditOptionGroupArticlesModal = ref(false)
const selectedOptions = ref('')
const selectedItems = ref('')

const emits = defineEmits(['getOptionGroups', 'editOptionGroup', 'sortBy', 'sortingOrder', 'updateOptionGroupModal'])
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
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'ID', sortable: false },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Internal Name', key: 'internalName', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Description', key: 'description', sortable: false },
  { label: 'Single Choice', key: 'singleChoice', sortable: false },
  { label: 'Multiple Choice', key: 'multipleChoice', sortable: false },
  { label: 'Multiple Choice (No Qty)', key: 'multipleChoiceNoQty', sortable: false },
  { label: 'Mandatory', key: 'mandatory', sortable: false },
  { label: 'Min Choices', key: 'minimumChoices', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Max Choices', key: 'maximumChoices', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Options', key: 'options', sortable: false },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Cat / Sub', key: 'menuCategories', sortable: false },
  { label: 'Articles', key: 'menuItems', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

function editOptionGroup(payload) {
  isEditArticleOptionGroupsModal.value = true
  selectedOptionGroups.value = payload
}
async function updateData(rowData) {
  const url = import.meta.env.VITE_API_BASE_URL
  const data = {
    _id: rowData._id,
    outletId: servicesStore.selectedRest,
    name: rowData.name,
    internalName: rowData.internalName,
    description: rowData.description,
    singleChoice: rowData.singleChoice,
    multipleChoice: rowData.multipleChoice,
    multipleChoiceNoQty: rowData.multipleChoiceNoQty,
    mandatory: rowData.mandatory,
    minimumChoices: rowData.minimumChoices,
    maximumChoices: rowData.maximumChoices,
    isActive: rowData.isActive,
    options: rowData.options,
    optionsIds: rowData.options.map((option) => option._id),
    isDeleted: rowData.isDeleted,
  }
  await axios
    .patch(`${url}/articles-options-groups/${rowData._id}`, data)
    .then(() => {
      init({ message: "You've successfully updated a OptionGroups", color: 'success' })
      emits('getOptionGroups')
    })
    .catch((err) => {
      init({ message: err.response.data.message, color: 'danger' })
    })
}

const onButtonOptionGroupsDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this OptionGroups?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete OptionGroups',
  })
  if (result) {
    deleteOptionGroups(payload)
  }
}
async function deleteOptionGroups(payload) {
  await updateData({ ...payload, isDeleted: true })
}

function onButtonEditOptionGroup(rowData) {
  isEditArticleOptionsModal.value = true
  selectedOptions.value = rowData
}

function onButtonEditOptionGroupItems(rowData) {
  isEditArticleOptionGroupsItemsModal.value = true
  selectedItems.value = rowData
}

function onButtonEditOptionGroupArticles(rowData) {
  isEditOptionGroupArticlesModal.value = true
  selectedItems.value = rowData
}

const cloneArticle = (article) => {
  const clonedData = { ...article }
  delete clonedData._id
  delete clonedData.createdAt
  delete clonedData.updatedAt
  delete clonedData.__v
  selectedOptionGroups.value = {
    ...clonedData,
    name: `${clonedData.name}`,
  }
  isEditArticleOptionGroupsModal.value = true
}

const items = toRef(props, 'items')
const searchQuery = ref('')
watch(searchQuery, (search) => {
  emits('getOptionGroups', searchQuery.value)
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
      <VaInput v-model="searchQuery" placeholder="Search..." class="max-w-[400px] w-full" size="small" />
      <VaButton size="small" color="primary" @click="isEditArticleOptionGroupsModal = true">
        Add Option Group
      </VaButton>
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
      @editOptionGroup="editOptionGroup"
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
      <template #cell(internalName)="{ rowData }">
        <div class="table-cell-content">
          <div v-if="!rowData.editInternalName" @click="rowData.editInternalName = true">
            {{ rowData.internalName }}
          </div>
          <input
            v-else
            v-model="rowData.internalName"
            class="w-1/2 p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
          />
        </div>
      </template>
      <template #cell(description)="{ rowData }">
        <div class="table-cell-content max-w-[200px] truncate" :title="rowData.description">
          <div v-if="!rowData.editDescription" @click="rowData.editDescription = true">
            {{ rowData.description }}
          </div>
          <input
            v-else
            v-model="rowData.description"
            class="w-full p-1 border rounded"
            type="text"
            @change="updateData(rowData)"
            @blur="rowData.editDescription = false"
          />
        </div>
      </template>

      <template #cell(singleChoice)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.singleChoice"
            size="small"
            @click="updateData({ ...rowData, multipleChoice: false, multipleChoiceNoQty: false })"
          />
        </div>
      </template>
      <template #cell(multipleChoice)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.multipleChoice"
            size="small"
            @click="updateData({ ...rowData, singleChoice: false, multipleChoiceNoQty: false })"
          />
        </div>
      </template>
      <template #cell(multipleChoiceNoQty)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.multipleChoiceNoQty"
            size="small"
            @click="updateData({ ...rowData, singleChoice: false, multipleChoice: false })"
          />
        </div>
      </template>
      <template #cell(mandatory)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.mandatory" size="small" @click="updateData(rowData)" />
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
      <template #cell(options)="{ rowData }">
        <div class="flex items-center gap-1 cursor-pointer text-primary" @click="onButtonEditOptionGroup(rowData)">
          <span class="whitespace-nowrap font-medium"> {{ rowData.options?.length || 0 }} </span>
          <VaIcon name="mso-edit" size="small" />
        </div>
      </template>
      <template #cell(menuCategories)="{ rowData }">
        <div class="flex items-center gap-1 cursor-pointer text-primary" @click="onButtonEditOptionGroupItems(rowData)">
          <span class="whitespace-nowrap font-medium"> {{ rowData.menuCategories?.length || 0 }} </span> /
          <span class="whitespace-nowrap font-medium"> {{ rowData.menuSubCategories?.length || 0 }} </span>
        </div>
      </template>

      <template #cell(menuItems)="{ rowData }">
        <div
          class="flex items-center gap-1 cursor-pointer text-primary"
          @click="onButtonEditOptionGroupArticles(rowData)"
        >
          <span class="whitespace-nowrap font-medium"> {{ rowData.menuItems?.length || 0 }} </span>
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" @click="updateData(rowData)" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex gap-2 justify-end">
          <VaButton preset="primary" size="small" icon="mso-content_copy" @click="cloneArticle(rowData)" />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            @click="onButtonOptionGroupsDelete(rowData)"
          />
        </div>
      </template>
    </VaDataTable>

    <EditArticleOptionGroupsModal
      v-if="isEditArticleOptionGroupsModal"
      :selected-option-groups="selectedOptionGroups"
      @cancel="
        (isEditArticleOptionGroupsModal = false), (selectedOptionGroups = ''), emits('getOptionGroups', searchQuery)
      "
    />
    <EditArticleOptionGroupsOptionsModal
      v-if="isEditArticleOptionsModal"
      :selected-options="selectedOptions"
      @cancel="
        (isEditArticleOptionsModal = false),
          (isEditArticleOptionsModal = ''),
          (selectedOptions = ''),
          emits('getOptionGroups', searchQuery)
      "
    />
    <EditArticleOptionGroupsItemsModal
      v-if="isEditArticleOptionGroupsItemsModal"
      :selected-option-group="selectedItems"
      @cancel="
        (isEditArticleOptionGroupsItemsModal = false), (selectedItems = ''), emits('getOptionGroups', searchQuery)
      "
    />
    <EditOptionGroupArticlesModal
      v-if="isEditOptionGroupArticlesModal"
      :selected-items="selectedItems"
      @cancel="(isEditOptionGroupArticlesModal = false), (selectedItems = ''), emits('getOptionGroups', searchQuery)"
    />
  </div>
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
input {
  &:focus {
    outline: none;
    box-shadow: none;
  }
}
</style>

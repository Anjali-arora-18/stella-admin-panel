<script setup lang="ts">
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import { useCategoryStore } from '@/stores/categories'
import { useSubCategoriesStore } from '@/stores/subCategories'
import Categories from '@/pages/admin/orders/categories.vue'
import FileUpload from '@/components/file-uploader/FileUpload.vue'
import axios from 'axios'
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
  categories: {
    type: Array,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
})

const subCategoryStore = useSubCategoriesStore()
const serviceStore = useServiceStore()
const emits = defineEmits([
  'updateArticle',
  'updateArticleModal',
  'cloneArticle',
  'deleteArticle',
  'sortBy',
  'sortingOrder',
  'getArticlesForPagination',
])

const { confirm } = useModal()
const router = useRouter()
const { init } = useToast()
const currentPage = ref(1)
const items = toRef(props, 'items')
const searchQuery = ref('')
const allergenOptions = subCategoryStore.allergenOptions.map((e) => {
  return { text: e.text, id: e.id }
})
const getAllergenNames = (id) => {
  return allergenOptions.find((a) => a.id === id).text
}

watch(currentPage, (newPage) => {
  emits('getArticlesForPagination', { page: currentPage.value, searchQuery: searchQuery.value })
})
watch(searchQuery, (search) => {
  emits('getArticlesForPagination', { page: currentPage.value, searchQuery: searchQuery.value })
})
const pages = computed(() => {
  return Math.ceil(props.count / 50)
})

const selectedRest = computed(() => serviceStore.selectedRest)

const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Description', key: 'description', sortable: false, sortingOptions: ['desc', 'asc'] },
  { label: 'Price', key: 'price', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Category', key: 'category', sortable: false },
  { label: 'Sub-Category', key: 'sub_category', sortable: false },
  { label: 'Options', key: 'articlesOptionsGroup', sortable: false },
  { label: 'Image', key: 'image', sortable: false },
  { label: 'Allergens', key: 'allergenIds', sortable: false },
  { label: 'Active', key: 'isActive', sortable: false },
  { label: 'Stock', key: 'stock', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const onButtonArticleDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Article?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Article',
  })
  if (result) {
    deleteArticle(payload)
  }
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
const onButtonArticleImageDelete = async (payload) => {
  const result = await confirm({
    message: 'Are you sure you want to see delete this Article Image?',
    okText: 'Yes',
    cancelText: 'No',
    size: 'medium',
    title: 'Delete Article Image',
  })
  if (result) {
    await deleteAsset(payload.assetId._id)
    emits('updateArticle', { ...payload, imageUrl: '', assetId: '', editing: '' })
  }
}
function deleteArticle(payload) {
  emits('deleteArticle', payload)
}

function openFileModal(data) {
  console.log(data)
  document.getElementById('file-upload-' + data._id).click()
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
      <VaInput
        v-model="searchQuery"
        placeholder="Search articles by code or name..."
        class="max-w-[400px] w-full"
        size="small"
      />
      <VaPagination
        v-model="currentPage"
        :pages="pages"
        buttons-preset="default"
        gapped
        :visible-pages="3"
        class="justify-center"
      />
    </div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="$props.loading"
      :disable-client-side-sorting="true"
      :style="{
        '--va-data-table-height': '650px',
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-thead-color': '#2C82E0',
      }"
      sticky-header
      @update:sortBy="(sortBy) => $emit('sortBy', sortBy)"
      @update:sortingOrder="(sortDesc) => $emit('sortingOrder', sortDesc)"
    >
      <template #cell(id)="{ rowData }">
        <div class="max-w-[120px] ellipsis">
          {{ rowData.id }}
        </div>
      </template>
      <template #cell(code)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'code'">
          <input
            v-if="rowData.editing === 'code'"
            v-model="rowData.code"
            class="w-full p-1 border rounded"
            autofocus
            @blur="
              emits('updateArticle', { ...rowData, searchQuery: searchQuery, page: currentPage }),
                (rowData.editing = '')
            "
          />
          <span v-else>{{ rowData.code }}</span>
        </div>
      </template>
      <template #cell(name)="{ rowData }">
        <div class="editable-field" @click="rowData.editing = 'name'">
          <input
            v-if="rowData.editing === 'name'"
            v-model="rowData.name"
            class="editable-input"
            autofocus
            @blur="
              emits('updateArticle', { ...rowData, searchQuery: searchQuery, page: currentPage }),
                (rowData.editing = '')
            "
          />
          <span v-else class="editable-text">{{ rowData.name }}</span>
        </div>
      </template>
      <template #cell(description)="{ rowData }">
        <div class="editable-field" @click="rowData.editing = 'description'">
          <input
            v-if="rowData.editing === 'description'"
            v-model="rowData.description"
            class="editable-input"
            autofocus
            @blur="
              emits('updateArticle', { ...rowData, searchQuery: searchQuery, page: currentPage }),
                (rowData.editing = '')
            "
          />
          <span v-else class="editable-text">{{ rowData.description }}</span>
        </div>
      </template>
      <template #cell(price)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'price'">
          <input
            v-if="rowData.editing === 'price'"
            v-model="rowData.price"
            class="w-full p-1 border rounded"
            autofocus
            @blur="
              emits('updateArticle', { ...rowData, searchQuery: searchQuery, page: currentPage }),
                (rowData.editing = '')
            "
          />
          <span v-else-if="parseFloat(rowData.price)">€{{ parseFloat(rowData.price).toFixed(2) }}</span>
          <span v-else></span>
        </div>
      </template>
      <template #cell(category)="{ rowData }">
        <div class="flex flex-col flex-wrap gap-1">
          <template v-if="rowData.categories.length <= 2">
            <VaBadge
              v-for="e in rowData.categories"
              :key="e.wCode"
              class="px-1"
              color="primary"
              :text="`${e.wCode} -  ${e.name} `"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'category',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="e in rowData.categories.slice(0, 2)"
              :key="e.wCode"
              class="px-1"
              color="primary"
              :text="`${e.wCode} -  ${e.name} `"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'category',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
            <VaBadge
              :text="`+${rowData.categories.length - 2} more`"
              color="primary"
              class="px-1"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'category',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
          </template>
        </div>
      </template>
      <template #cell(sub_category)="{ rowData }">
        <div class="flex flex-col flex-wrap gap-1">
          <template v-if="rowData.subCategories.length <= 2">
            <VaBadge
              v-for="sub in rowData.subCategories"
              :key="sub.wCode"
              :text="` ${sub.wCode} - ${sub.name}`"
              color="#B3D943"
              class="px-1"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'subCategory',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="sub in rowData.subCategories.slice(0, 2)"
              :key="sub.wCode"
              :text="` ${sub.wCode} - ${sub.name}`"
              color="#B3D943"
              class="px-1"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'subCategory',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
            <VaBadge
              :text="`+${rowData.subCategories.length - 2} more`"
              color="#B3D943"
              class="px-1"
              @click="
                emits('updateArticleModal', {
                  ...rowData,
                  updating: 'subCategory',
                  searchQuery: searchQuery.value,
                  page: currentPage.value,
                })
              "
            />
          </template>
        </div>
      </template>
      <template #cell(articlesOptionsGroup)="{ rowData }">
        <div class="flex flex-col flex-wrap gap-1">
          <template v-if="rowData.articlesOptionsGroup?.length <= 2">
            <VaBadge
              v-for="group in rowData.articlesOptionsGroup"
              :key="group.id"
              :text="group.name"
              color="success"
              class="px-1"
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="group in rowData.articlesOptionsGroup.slice(0, 2)"
              :key="group.id"
              :text="group.name"
              color="success"
              class="px-1"
            />
            <VaBadge :text="`+${rowData.articlesOptionsGroup.length - 2} more`" color="success" class="px-1" />
          </template>
        </div>
      </template>

      <template #cell(image)="{ rowData }">
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
            @click.prevent="onButtonArticleImageDelete(rowData)"
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
                $emit('updateArticle', { ...rowData, searchQuery: searchQuery.value, page: currentPage.value })
                rowData.editing = ''
              }
            "
          />
        </div>
      </template>

      <template #cell(allergenIds)="{ rowData }">
        <div @click="rowData.editing = 'allergenIds'">
          <VaSelect
            v-if="rowData.editing === 'allergenIds'"
            v-model="rowData.allergenIds"
            class="w-full p-1 border rounded"
            autofocus
            :multiple="true"
            value-by="id"
            :options="allergenOptions"
            @update:modelValue="
              emits('updateArticle', { ...rowData, searchQuery: searchQuery.value, page: currentPage.value }),
                (rowData.editing = '')
            "
          />
          <div v-else class="flex flex-col flex-wrap gap-1">
            <template v-if="rowData.allergenIds.length <= 2">
              <VaBadge
                v-for="e in rowData.allergenIds"
                :key="e"
                class="px-1"
                color="#db2777"
                :text="`${getAllergenNames(e)}`"
              />
            </template>
            <template v-else>
              <VaBadge
                v-for="e in rowData.allergenIds.slice(0, 2)"
                :key="e"
                class="px-1"
                color="#db2777"
                :text="`${getAllergenNames(e)}`"
              />
              <VaBadge :text="`+${rowData.allergenIds.length - 2} more`" color="#db2777" class="px-1" />
            </template>
          </div>
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.isActive"
            size="small"
            @click="emits('updateArticle', { ...rowData, searchQuery: searchQuery.value, page: currentPage.value })"
          />
        </div>
      </template>
      <template #cell(stock)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox
            v-model="rowData.inStock"
            size="small"
            @click="emits('updateArticle', { ...rowData, searchQuery: searchQuery.value, page: currentPage.value })"
          />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex justify-end">
          <VaButton
            preset="primary"
            size="small"
            icon="mso-content_copy"
            class="mr-2"
            @click="emits('cloneArticle', rowData)"
          />
          <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('updateArticleModal', rowData)" />
          <VaButton
            preset="primary"
            size="small"
            color="danger"
            icon="mso-delete"
            class="ml-2"
            @click="onButtonArticleDelete(rowData)"
          />
        </div>
      </template>
    </VaDataTable>
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
.options {
  font-size: 12px;
  line-height: 1.2rem;
}
.editable-field {
  max-width: 120px;
  cursor: pointer;
}

.editable-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.3em;
  max-height: 2.6em; /* 1.3em * 2 lines */
}

.editable-input {
  width: 100%;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

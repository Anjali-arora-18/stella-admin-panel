<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import { useCategoryStore } from '@/stores/categories'
import Categories from '@/pages/admin/orders/categories.vue'
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
const emits = defineEmits([
  'updateArticle',
  'updateArticleModal',
  'deleteArticle',
  'sortBy',
  'sortingOrder',
  'getArticlesForPagination',
])

const { confirm } = useModal()
const router = useRouter()

const currentPage = ref(1)
const items = toRef(props, 'items')
const searchQuery = ref('')

watch(currentPage, (newPage) => {
  emits('getArticlesForPagination', { page: currentPage.value, searchQuery: searchQuery.value })
})
watch(searchQuery, (search) => {
  emits('getArticlesForPagination', { page: currentPage.value, searchQuery: searchQuery.value })
})
const pages = computed(() => {
  return Math.ceil(props.count / 50)
})

const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Description', key: 'description', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Price', key: 'price', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Category', key: 'category', sortable: false },
  { label: 'Sub-Category', key: 'sub_category', sortable: false },
  { label: 'Options', key: 'options', sortable: false },
  { label: 'Image', key: 'image', sortable: false },
  { label: 'Allergens', key: 'allergens', sortable: false },
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
function deleteArticle(payload) {
  emits('deleteArticle', payload)
}
</script>

<template>
  <div>
    <div class="mb-4">
      <VaInput
        v-model="searchQuery"
        placeholder="Search articles by code or name..."
        class="max-w-[400px]"
        size="small"
      />
    </div>
    <VaDataTable
      :columns="columns"
      :items="items"
      :loading="$props.loading"
      :disable-client-side-sorting="true"
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
            @keyup.enter="emits('updateArticle', rowData), (rowData.editing = '')"
          />
          <span v-else>{{ rowData.code }}</span>
        </div>
      </template>
      <template #cell(name)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'name'">
          <input
            v-if="rowData.editing === 'name'"
            v-model="rowData.name"
            class="w-full p-1 border rounded"
            autofocus
            @keyup.enter="$emit('updateArticle', rowData), (rowData.editing = '')"
          />
          <span v-else>{{ rowData.name }}</span>
        </div>
      </template>
      <template #cell(description)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'description'">
          <input
            v-if="rowData.editing === 'description'"
            v-model="rowData.description"
            class="w-full p-1 border rounded"
            autofocus
            @keyup.enter="$emit('updateArticle', rowData), (rowData.editing = '')"
          />
          <span v-else>{{ rowData.description }}</span>
        </div>
      </template>
      <template #cell(price)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'price'">
          <input
            v-if="rowData.editing === 'price'"
            v-model="rowData.price"
            class="w-full p-1 border rounded"
            autofocus
            @keyup.enter="$emit('updateArticle', rowData), (rowData.editing = '')"
          />
          <span v-else>{{ rowData.price }}</span>
        </div>
      </template>
      <template #cell(category)="{ rowData }">
        <div class="flex flex-col flex-wrap gap-1">
          <VaBadge
            v-for="e in rowData.categories"
            :key="e.wCode"
            class="px-2"
            color="primary"
            :text="`${e.wCode} -  ${e.name} `"
            @click="emits('updateArticleModal', { ...rowData, updating: 'category' })"
          ></VaBadge>
        </div>
      </template>
      <template #cell(sub_category)="{ rowData }">
        <div class="space-y-1">
          <div v-for="e in rowData.subCategories" :key="e" class="flex flex-col">
            <VaBadge color="#B3D943" :text="e.wCode + ' - ' + e.name"></VaBadge>
          </div>
        </div>
      </template>
      <template #cell(options)="{ rowData }">
        <div class="max-w-[120px] ellipsis">
          <div v-if="rowData.options">
            <template v-for="(value, key) in rowData.options" :key="key">
              <div class="text-sm">
                <span v-if="typeof value === 'object'">
                  <div v-for="(subValue, subKey) in value" :key="subKey" class="ml-2">{{ subKey }}: {{ subValue }}</div>
                </span>
                <span v-else>{{ value }}</span>
              </div>
            </template>
          </div>
          <span v-else>No options</span>
        </div>
      </template>
      <template #cell(image)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'name'">
          <img
            :src="rowData.imageUrl || '/missing-image.png'"
            alt="Article Image"
            class="w-8 h-8 object-cover rounded"
            @error="
              (e) => {
                e.target.src = '/missing-image.png'
              }
            "
          />
        </div>
      </template>
      <template #cell(isActive)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.isActive" size="small" @click="emits('updateArticle', rowData)" />
        </div>
      </template>
      <template #cell(stock)="{ rowData }">
        <div class="table-cell-content">
          <VaCheckbox v-model="rowData.inStock" size="small" @click="emits('updateArticle', rowData)" />
        </div>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex justify-end">
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
    <div class="mt-5 flex justify-end">
      <VaPagination
        v-model="currentPage"
        :pages="pages"
        buttons-preset="default"
        gapped
        :visible-pages="4"
        class="justify-center sm:justify-start"
      />
    </div>
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
</style>

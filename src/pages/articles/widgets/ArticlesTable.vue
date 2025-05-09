<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef, watch } from 'vue'
import { useServiceStore } from '@/stores/services'
import { useCategoryStore } from '@/stores/categories'
import { useSubCategoriesStore } from '@/stores/subCategories'
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

const subCategoryStore = useSubCategoriesStore()
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

const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Name', key: 'name', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Description', key: 'description', sortable: false, sortingOptions: ['desc', 'asc'] },
  { label: 'Price', key: 'price', sortable: true, sortingOptions: ['desc', 'asc'] },
  { label: 'Category', key: 'category', sortable: false },
  { label: 'Sub-Category', key: 'sub_category', sortable: false },
  { label: 'Options', key: 'options', sortable: false },
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
function deleteArticle(payload) {
  emits('deleteArticle', payload)
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
        '--va-data-table-height': '500px',
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
            @blur="emits('updateArticle', rowData), (rowData.editing = '')"
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
            @blur="$emit('updateArticle', rowData), (rowData.editing = '')"
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
            @blur="$emit('updateArticle', rowData), (rowData.editing = '')"
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
            @blur="$emit('updateArticle', rowData), (rowData.editing = '')"
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
              @click="emits('updateArticleModal', { ...rowData, updating: 'category' })"
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="e in rowData.categories.slice(0, 2)"
              :key="e.wCode"
              class="px-1"
              color="primary"
              :text="`${e.wCode} -  ${e.name} `"
              @click="emits('updateArticleModal', { ...rowData, updating: 'category' })"
            />
            <VaBadge
              :text="`+${rowData.categories.length - 2} more`"
              color="primary"
              class="px-1"
              @click="emits('updateArticleModal', { ...rowData, updating: 'category' })"
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
              @click="emits('updateArticleModal', { ...rowData, updating: 'subCategory' })"
            />
          </template>
          <template v-else>
            <VaBadge
              v-for="sub in rowData.subCategories.slice(0, 2)"
              :key="sub.wCode"
              :text="` ${sub.wCode} - ${sub.name}`"
              color="#B3D943"
              class="px-1"
              @click="emits('updateArticleModal', { ...rowData, updating: 'subCategory' })"
            />
            <VaBadge
              :text="`+${rowData.subCategories.length - 2} more`"
              color="#B3D943"
              class="px-1"
              @click="emits('updateArticleModal', { ...rowData, updating: 'subCategory' })"
            />
          </template>
        </div>
      </template>
      <template #cell(options)="{ rowData }">
        <div>
          <div v-if="rowData.options" className="flex flex-col gap-1">
            <template v-for="(value, key) in rowData.options" :key="value">
              <div v-if="value.length" class="text-sm">
                <span class="options">
                  {{ key }}:
                  <template v-if="value.length <= 2">
                    <VaBadge v-for="sub in value" :key="sub" :text="sub" color="secondary" class="px-1" />
                  </template>
                  <template v-else>
                    <VaBadge
                      v-for="(subValue, subKey) in value.slice(0, 2)"
                      :key="subKey"
                      :text="subValue"
                      color="secondary"
                      class="px-1"
                    />
                    <VaBadge :text="`+${value.length - 2} more`" color="secondary" class="px-1" />
                  </template>
                  <div class="ml-2">{{ subValue }}</div>
                </span>
              </div>
            </template>
          </div>
          <span v-else>No options</span>
        </div>
      </template>
      <template #cell(image)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'imageUrl'">
          <img
            :src="rowData.imageUrl || '/missing-image.png'"
            alt="Article Image"
            class="w-8 h-8 object-cover rounded"
            @error="
              (e) => {
                e.target.src = '/missing-image.png'
              }
            "
            @click="emits('updateArticleModal', { ...rowData, updating: 'imageUrl' })"
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
            @update:modelValue="$emit('updateArticle', rowData), (rowData.editing = '')"
          />
          <div v-else class="flex flex-col flex-wrap gap-1">
            <template v-if="rowData.allergenIds.length <= 2">
              <VaBadge
                v-for="e in rowData.allergenIds"
                :key="e"
                class="px-1"
                color="primary"
                :text="`${getAllergenNames(e)}`"
              />
            </template>
            <template v-else>
              <VaBadge
                v-for="e in rowData.allergenIds.slice(0, 2)"
                :key="e"
                class="px-1"
                color="primary"
                :text="`${getAllergenNames(e)}`"
              />
              <VaBadge :text="`+${rowData.allergenIds.length - 2} more`" color="primary" class="px-1" />
            </template>
          </div>
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
</style>

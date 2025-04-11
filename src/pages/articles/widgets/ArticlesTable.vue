<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { ref, computed, toRef } from 'vue'

const emits = defineEmits(['updateArticleModal'])
const { confirm } = useModal()
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id' },
  { label: 'Code', key: 'code', sortable: false },
  { label: 'Name', key: 'name', sortable: false },
  { label: 'Description', key: 'description', sortable: false },
  { label: 'Price', key: 'price', sortable: false },
  { label: 'Category', key: 'category', sortable: false },
  { label: 'Sub-Category', key: 'sub_category', sortable: false },
  { label: 'Options', key: 'options', sortable: false },
  { label: 'Image', key: 'image', sortable: false },
  { label: 'Allergens', key: 'allergens', sortable: false },
  { label: 'Active', key: 'IsActive', sortable: false },
  { label: 'Stock', key: 'stock', sortable: false },
  { label: 'Actions', key: 'actions', sortable: false },
])

const IsActive = ref(true)

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

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: { type: Boolean, default: false },
})

const items = toRef(props, 'items')
const searchQuery = ref('')

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(
    (item) => item.wCode?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query),
  )
})
</script>

<template>
  <div>
    <div class="mb-4">
      <VaInput v-model="searchQuery" placeholder="Search articles by code or name..." class="w-full" size="small" />
    </div>
    <VaDataTable :columns="columns" :items="filteredItems" :loading="$props.loading">
      <template #cell(id)="{ rowData }">
        <div class="max-w-[120px] ellipsis">
          {{ rowData._id }}
        </div>
      </template>
      <template #cell(code)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'code'">
          <input
            v-if="rowData.editing === 'code'"
            v-model="rowData.wCode"
            class="w-full p-1 border rounded"
            autofocus
          />
          <span v-else>{{ rowData.wCode }}</span>
        </div>
      </template>
      <template #cell(name)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'name'">
          <input v-if="rowData.editing === 'name'" v-model="rowData.name" class="w-full p-1 border rounded" autofocus />
          <span v-else>{{ rowData.name }}</span>
        </div>
      </template>
      <template #cell(options)="{ rowData }">
        <div class="max-w-[120px] ellipsis" @click="rowData.editing = 'name'">
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
          <img :src="rowData.imageUrl" alt="Article Image" class="w-52 object-cover rounded" />
        </div>
      </template>
      <!-- Similar pattern for other editable fields -->
      <template #cell(actions)="{ rowData }">
        <VaButton preset="primary" size="small" icon="mso-edit" @click="emits('updateArticleModal', rowData)" />
        <VaButton
          preset="primary"
          size="small"
          color="danger"
          icon="mso-delete"
          class="ml-2"
          @click="onButtonArticleDelete(rowData)"
        />
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
</style>

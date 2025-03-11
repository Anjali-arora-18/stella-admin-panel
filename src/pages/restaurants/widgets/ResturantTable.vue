<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { User, UserRole } from '../types'
import { PropType, computed, toRef } from 'vue'
import { Pagination, Sorting } from '../../data/pages/users'
import { useVModel } from '@vueuse/core'
import { Project } from '../../projects/types'
import { useRouter } from 'vue-router'
const router = useRouter()
const columns = defineVaDataTableColumns([
  { label: 'id', key: 'id', sortable: true },
  { label: 'Code', key: 'code', sortable: true },
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Owner', key: 'owner_name', sortable: true },
  { label: 'email', key: 'email', sortable: true },
  { label: 'Action', key: 'actions', align: 'justify-center' },
])

const props = defineProps({
  users: {
    type: Array as PropType<User[]>,
    required: true,
  },
  projects: {
    type: Array as PropType<Project[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, default: null },
})

const emit = defineEmits<{
  (event: 'edit-user', user: User): void
  (event: 'delete-user', user: User): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const users = [
  {
    id: 1,
    code: 'AC-001',
    name: 'African Cuisine',
    owner_name: 'John Doe',
    email: 'abc.com',
    actions: 'View',
  },
]
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const roleColors: Record<UserRole, string> = {
  admin: 'danger',
  user: 'background-element',
  owner: 'warning',
}

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="users"
    :loading="$props.loading"
  >
    <template #cell(fullname)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as User" size="small" />
        {{ rowData.fullname }}
      </div>
    </template>

    <template #cell(username)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.username }}
      </div>
    </template>

    <template #cell(email)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.email }}
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <VaDropdown :offset="[13, 0]" class="notification-dropdown" stick-to-edges :close-on-content-click="false">
        <template #anchor>
          <VaButton preset="primary" size="small" icon="material-icons-visibility" />
        </template>
        <VaDropdownContent class="h-full sm:max-w-[420px] sm:h-auto">
          <section class="sm:max-h-[320px] p-4 overflow-auto">
            <VaList class="space-y-1 mb-2">
              <div>
                <VaListItem
                  class="text-base cursor-pointer"
                  @click="router.push('/restaurant/' + rowData.id + '/categories')"
                >
                  <VaListItemSection icon class="mx-0 p-0">
                    <VaIcon name="material-icons-visibility" color="secondary" />
                  </VaListItemSection>
                  <VaListItemSection> Categories </VaListItemSection>
                </VaListItem>
                <VaListSeparator class="mx-3" />

                <VaListItem
                  class="text-base cursor-pointer"
                  @click="router.push('/restaurant/' + rowData.id + '/tables')"
                >
                  <VaListItemSection icon class="mx-0 p-0">
                    <VaIcon name="material-icons-visibility" color="secondary" />
                  </VaListItemSection>
                  <VaListItemSection> Tables </VaListItemSection>
                </VaListItem>
                <VaListSeparator class="mx-3" />
                <VaListItem
                  class="text-base cursor-pointer"
                  @click="router.push('/restaurant/' + rowData.id + '/orders')"
                >
                  <VaListItemSection icon class="mx-0 p-0">
                    <VaIcon name="material-icons-visibility" color="secondary" />
                  </VaListItemSection>
                  <VaListItemSection> Orders </VaListItemSection>
                </VaListItem>
                <VaListSeparator class="mx-3" />
                <VaListItem
                  class="text-base cursor-pointer"
                  @click="router.push('/restaurant/' + rowData.id + '/configurations')"
                >
                  <VaListItemSection icon class="mx-0 p-0">
                    <VaIcon name="material-icons-visibility" color="secondary" />
                  </VaListItemSection>
                  <VaListItemSection> Configurations </VaListItemSection>
                </VaListItem>
              </div>
            </VaList>
          </section>
        </VaDropdownContent>
      </VaDropdown>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} results.</b>
      Results per page
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="$props.pagination.page === totalPages"
        @click="$props.pagination.page++"
      />
      <VaPagination
        v-model="$props.pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
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
</style>

<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { User, UserRole } from '../types'
import UserAvatar from './UserAvatar.vue'
import { useProjects } from '../../projects/composables/useProjects'
import { validators } from '../../../services/utils'

const props = defineProps({
  user: {
    type: Object as PropType<User | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewUser: Omit<User, 'id'> = {
  avatar: '',
  fullname: '',
  role: 'user',
  username: '',
  notes: '',
  email: '',
  active: true,
  projects: [],
}

const newUser = ref<User>({ ...defaultNewUser } as User)

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newUser.value).some((key) => {
    if (key === 'avatar' || key === 'projects') {
      return false
    }

    return (
      newUser.value[key as keyof Omit<User, 'id'>] !== (props.user ?? defaultNewUser)?.[key as keyof Omit<User, 'id'>]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

const { projects } = useProjects({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })

watch(
  [() => props.user, projects],
  () => {
    if (!props.user) {
      return
    }

    newUser.value = {
      ...props.user,
      projects: props.user.projects.filter((projectId) => projects.value.find(({ id }) => id === projectId)),
      avatar: props.user.avatar || '',
    }
  },
  { immediate: true },
)

const avatar = ref<File>()

const makeAvatarBlobUrl = (avatar: File) => {
  return URL.createObjectURL(avatar)
}

watch(avatar, (newAvatar) => {
  newUser.value.avatar = newAvatar ? makeAvatarBlobUrl(newAvatar) : ''
})

const form = useForm('add-user-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newUser.value)
  }
}

const roleSelectOptions: { text: Capitalize<Lowercase<UserRole>>; value: UserRole }[] = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' },
  { text: 'Owner', value: 'owner' },
]
</script>

<template>
  <VaForm v-slot="{ isValid }" ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="w-full bg-white p-4 shadow-md rounded">
        <h2 class="text-xl font-bold mb-4">Order <sup>#</sup>1</h2>
        <div class="flex justify-between py-2 border-b">
          <p class="font-bold">Fries</p>
          <p class="text-gray-700">$8</p>
        </div>
        <div class="flex justify-between py-2 border-b">
          <p class="font-bold">Burger</p>
          <p class="text-gray-700">$9</p>
        </div>
      </div>
      <div class="w-full bg-white p-4 shadow-md rounded">
        <h3 class="text-lg font-bold mb-4">Order Summary</h3>
        <p><strong>Total:</strong> $17</p>
        <p><strong>Payment Status:</strong> <span>Cash</span></p>
        <p><strong>Order Date:</strong>6-March-2025</p>
      </div>

      <div class="flex gap-4 flex-col sm:flex-row w-full"></div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
      </div>
    </div>
  </VaForm>
</template>

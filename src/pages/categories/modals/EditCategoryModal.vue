<template>
  <VaModal
    class="big-form"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    model-value
    close-button
    @update:modelValue="emits('cancel')"
  >
    <template #header>
      <h1 class="sticky va-h6 mb-4">{{ selectedCategory ? 'Update' : 'Add' }} Item</h1>
    </template>
    <VaForm ref="form" @submit.prevent="submit">
      <div class="flex items-center gap-x-10">
        <VaInput v-model="formData.wCode" class="mb-1 max-w-[100px]" label="Code" placeholder="Code" type="number" />
        <VaInput
          v-model="formData.name"
          :rules="[validators.required]"
          class="mb-1 max-w-[240px]"
          label="Name"
          required-mark
          placeholder="Name"
          type="text"
        />
        <VaInput
          v-model="formData.description"
          label="Description"
          placeholder="Description"
          type="text"
          class="mb-1 max-w-[250px]"
        />

        <VaSelect
          id="area"
          v-model="formData.areaId"
          :rules="[validators.required]"
          required-mark
          label="Area"
          :options="areas"
          :multiple="true"
          value-by="value"
          class="mb-1 max-w-[250px]"
        />
      </div>
      <div
        class="cursor-pointer text-primary font-semibold underline flex justify-end items-center"
        @click="formData.subCategories.push({ wCode: '', name: '', description: '' })"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-3 h-3"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Sub Category
      </div>
      <div v-if="formData.subCategories.length" class="p-4 my-2 bg-gray-50 shadow-md">
        <div class="flex justify-end mb-2"></div>
        <div v-for="(subCategory, index) in formData.subCategories" :key="index" class="mb-4">
          <div class="grid grid-cols-12 gap-4 items-center">
            <div class="col-span-3">
              <VaInput v-model="subCategory.wCode" label="Code" placeholder="Code" type="text" class="w-full" />
            </div>
            <div class="col-span-4">
              <VaInput
                v-model="subCategory.name"
                required-mark
                :rules="[validators.required]"
                label="Name"
                placeholder="Name"
                type="text"
                class="w-full"
              />
            </div>

            <VaButton
              preset="primary"
              color="danger"
              icon="mso-delete"
              size="medium"
              class="mt-4"
              @click="formData.subCategories.splice(index, 1)"
            >
            </VaButton>
          </div>
        </div>
      </div>
      <div class="mb-5 flex-1">
        <div class="schedule">Schedule:</div>
        <div class="mt-1">
          <VaRadio
            v-model="formData.schedule.selected"
            :options="[
              { value: 'daily', text: 'Daily' },
              { value: 'byDay', text: 'by Day' },
              { value: 'is24h', text: '24 hours' },
            ]"
            value-by="value"
            size="small"
            class="w-fit"
          />
        </div>
      </div>
      <div class="mb-4">
        <div v-if="formData.schedule.selected === 'byDay'" class="flex flex-col space-y-2">
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="(days, index) in [
                ['Monday', 'Tuesday'],
                ['Wednesday', 'Thursday'],
                ['Friday', 'Saturday'],
                ['Sunday'],
              ]"
              :key="index"
              class="grid grid-cols-6 gap-4"
            >
              <div v-for="day in days" :key="day" class="col-span-3 grid grid-cols-3 gap-2">
                <div>{{ day }}</div>
                <input
                  v-model="formData.schedule.byDay[day.toLowerCase()].opens"
                  type="time"
                  :label="day"
                  class="w-full border border-1 h-8 p-4 rounded"
                />
                <input
                  v-model="formData.schedule.byDay[day.toLowerCase()].closes"
                  type="time"
                  class="flex-1 border border-1 h-8 p-4 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="formData.schedule.selected === 'daily'" class="grid grid-cols-2 gap-2">
          <div>
            From:<input
              v-model="formData.schedule.daily.opens"
              type="time"
              class="border border-1 h-8 w-full p-4 rounded"
            />
          </div>
          <div>
            To:<input
              v-model="formData.schedule.daily.closes"
              type="time"
              class="border border-1 h-8 w-full p-4 rounded"
            />
          </div>
        </div>
      </div>
    </VaForm>
    <template #footer>
      <div class="flex md:justify-end md:space-x-4">
        <VaButton class="mb-4 md:mb-0" type="submit" @click="submit">{{
          selectedCategory ? 'Update' : 'Add'
        }}</VaButton>
      </div>
    </template>
  </VaModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { validators } from '@/services/utils'
import { useServiceStore } from '@/stores/services'
import { useToast, useForm } from 'vuestic-ui'
const emits = defineEmits(['cancel'])
const props = defineProps({
  selectedCategory: {
    type: Object || String,
    default: () => '',
  },
})
const { validate } = useForm('form')
const { init } = useToast()

const servicesStore = useServiceStore()
const areas = ref([])
servicesStore.getAreas().then((response) => {
  areas.value = response.data.map((e) => {
    return {
      text: e.name,
      value: e._id,
    }
  })
})

const formData = ref({
  name: '',
  wCode: '',
  areaId: [],
  isActive: true,
  description: '',
  sortOrder: 0,
  outletId: '',
  subCategories: [],
  schedule: {
    selected: 'daily',
    daily: {
      opens: '',
      closes: '',
    },

    byDay: {
      monday: {
        opens: '',
        closes: '',
      },
      tuesday: {
        opens: '',
        closes: '',
      },
      wednesday: {
        opens: '',
        closes: '',
      },
      thursday: {
        opens: '',
        closes: '',
      },
      friday: {
        opens: '',
        closes: '',
      },
      saturday: {
        opens: '',
        closes: '',
      },
      sunday: {
        opens: '',
        closes: '',
      },
    },
    is24h: false,
  },
})
if (props.selectedCategory) {
  formData.value = {
    ...formData.value,
    ...props.selectedCategory,
    areaId: [props.selectedCategory.areaId],
  }
}
const submit = () => {
  if (validate()) {
    const data = formData.value
    data.outletId = servicesStore.selectedRest
    const url: any = import.meta.env.VITE_API_BASE_URL
    if (props.selectedCategory) {
      axios
        .patch(`${url}/menuCategories/${formData.value._id}`, data)
        .then((response) => {
          init({ message: "You've successfully updated", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    } else {
      axios
        .post(`${url}/menuCategories`, data)
        .then((response) => {
          init({ message: "You've successfully created", color: 'success' })
          emits('cancel')
        })
        .catch((err) => {
          init({ message: err.response.data.message, color: 'danger' })
        })
    }
  }
}
</script>

<style lang="scss">
.va-modal__inner {
  min-width: 326px;
}
.schedule {
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.4px;
  min-height: 14px;
  font-family: var(--va-font-family);
  color: var(--va-primary);
  font-weight: 700;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<template>
  <div>
    <h1 class="page-title font-bold">Restaurant Name (will be shown from API)</h1>
    <h1 class="mb-3 font-bold">Restaurant Details</h1>
    <VaCard>
      <VaCardContent>
        <VaForm ref="detail-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput label="Name" class="w-full sm:w-1/2" name="Name" />
            <VaInput label="Description" class="w-full sm:w-1/2" name="Description" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaSelect v-model="selectedType" label="Type" class="w-full sm:w-1/2" :options="types" />
            <VaInput label="Address" class="w-full sm:w-1/2" name="Address" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput label="Postcode" class="w-full sm:w-1/2" name="Postcode" />
            <VaInput label="Email" class="w-full sm:w-1/2" name="Email" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput label="Phone" class="w-full sm:w-1/2" name="Phone" />
            <VaInput label="Facebook" class="w-full sm:w-1/2" name="Facebook" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput label="Instagram" class="w-full sm:w-1/2" name="Instagram" />
            <VaInput label="Twitter" class="w-full sm:w-1/2" name="Twitter" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput label="Website" class="w-full sm:w-1/2" name="Website" />
            <VaInput label="TripAdvisor" class="w-full sm:w-1/2" name="TripAdvisor" />
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <h1 class="mb-3 mt-8 font-bold">Configuration</h1>
    <VaCard>
      <VaCardContent>
        <VaForm ref="configuration-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex flex-col sm:flex-row w-full config">
            <VaSwitch v-model="active" label="Active " left-label size="small" />
          </div>
          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">POS:</div>
            <div class="flex flex-col w-full mt-2 config">
              <VaSwitch v-model="formData.winmax" class="w-fit" label="1. Winmax" left-label size="small" />
              <div v-if="formData.winmax" class="grid grid-cols-5 gap-8 w-full mt-4">
                <VaInput name="Company" placeholder="Company" />
                <VaInput name="User" placeholder="User" />
                <VaInput name="Password" placeholder="Password" type="password" />
                <VaInput name="Terminal" placeholder="Terminal" type="number" />
                <VaInput name="id" placeholder="Restaurant_id" />
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch v-model="formData.restus" class="w-fit" label="2. Restus" left-label size="small" />
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full mt-4">
            <VaSelect v-model="selectedTypeMode" label="Operating Mode" class="w-full sm:w-1/2" :options="mode" />
            <VaInput label="Order Time Limit" class="w-full sm:w-1/2" name="Ordertime" type="number" />
          </div>
          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">Opening Times:</div>
            <div class="flex flex-col sm:flex-row w-full mt-2 config">
              <VaSwitch v-model="formData.daily" label="a. Daily" left-label size="small" class="w-fit mr-6" />
              <div v-if="formData.daily">
                <VaTimeInput v-model="Openingtime" ampm class="mr-2" />
                <VaTimeInput v-model="Closingtime" ampm />
              </div>
            </div>
            <div class="flex flex-col sm:flex-row w-full mt-4 config">
              <VaSwitch v-model="formData.byday" label="b. By Day" left-label size="small" class="w-fit mr-6" />
              <div v-if="formData.byday">
                <div>
                  <VaTimeInput v-model="Openingtime" label="Monday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-4">
                  <VaTimeInput v-model="Openingtime" label="Tuesday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="Openingtime" label="Wednesday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="Openingtime" label="Thursday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="Openingtime" label="Friday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="Openingtime" label="Saturday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="Openingtime" label="Sunday" ampm class="mr-2" />
                  <VaTimeInput v-model="Closingtime" ampm class="mt-4" />
                </div>
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch v-model="formData.hours" label="c. 24 hours" left-label size="small" />
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full mt-4">
            <VaInput label="Closing soon" class="w-full sm:w-1/2" name="Closingsoon" type="number" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-4">
            <VaSwitch v-model="formData.guestUsers" label="Guest Users" left-label size="small" />
            <VaSwitch v-model="formData.guestCheckout" label="Guest Checkout" left-label size="small" />
            <VaSwitch v-model="formData.repeatlastOrder" label="Repeat Last Order" left-label size="small" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-4">
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="formData.minChange" label="Minimum Charge" left-label size="small" />
              <div v-if="formData.minChange" class="flex flex-col w-full mt-4">
                <VaInput name="MinimumCharge" placeholder="Minimum Charge" type="number" />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="formData.foodArticle" label="Food Article Notes" left-label size="small" />
              <div v-if="formData.foodArticle" class="flex flex-col w-full mt-4">
                <VaInput name="FoodArticleNotes" placeholder="Food Article Notes" />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="formData.drinkArticle" label="Drink Article Notes" left-label size="small" />
              <div v-if="formData.drinkArticle" class="flex flex-col w-full mt-4">
                <VaInput name="DrinkArticleNotes" placeholder="Drink Article Notes" />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="formData.orderNotes" label="Order Notes" left-label size="small" />
              <div v-if="formData.orderNotes" class="flex flex-col w-full mt-4">
                <VaInput name="OrderNotes" placeholder="Order Notes" />
              </div>
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea label="Dine-in Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea label="Delivery Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea label="Takeaway Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-14 flex-col sm:flex-row w-full config">
            <VaSwitch v-model="formData.tabs" label="Tabs " left-label size="small" />
            <VaSwitch v-model="formData.tips" label="Tips" left-label size="small" />
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <h1 class="mb-3 mt-8 font-bold">Design</h1>
    <VaCard>
      <VaCardContent>
        <VaForm ref="design-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaColorInput v-model="colorPicker" label="Primary Color" class="w-28" />
            <VaColorInput v-model="colorPicker" label="Secondary Color" class="w-28" />
            <VaColorInput v-model="colorPicker" label="Background Color" class="w-28" />
            <VaColorInput v-model="colorPicker" label="Header Color" class="w-28" />
            <VaColorInput v-model="colorPicker" label="Footer Color" class="w-28" />
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <VaTabs v-model="tab" grow class="mt-8">
      <template #tabs>
        <VaTab v-for="title in ['Categories', 'Menu Items']" :key="title" :name="title">
          {{ title }}
        </VaTab>
      </template>
    </VaTabs>

    <div class="mt-6">
      <Categories v-if="tab === 'Categories'" />
      <MenuItems v-if="tab === 'Menu Items'" />
    </div>
  </div>
</template>
<script>
import Categories from '../categories/index.vue'
import MenuItems from '../subCategories/index.vue'
import { ref } from 'vue'
export default {
  components: {
    Categories,
    MenuItems,
  },
  setup() {
    const tab = ref('Categories')
    const types = ref(['Create New'])
    const mode = ref(['View Only', 'Online Ordering'])
    const selectedType = ref(null)
    const selectedTypeMode = ref(null)
    return { tab, types, mode, selectedType, selectedTypeMode }
  },
  data() {
    return {
      active: true,
      Openingtime: new Date(),
      Closingtime: new Date(),
      colorPicker: '#FF002',
      formData: {
        winmax: false,
        restus: false,
        daily: false,
        byday: false,
        hours: false,
        guestUsers: false,
        guestCheckout: false,
        repeatlastOrder: false,
        minChange: false,
        foodArticle: false,
        drinkArticle: false,
        orderNotes: false,
        tabs: false,
        tips: false,
      },
    }
  },
}
</script>
<style scoped>
.config {
  --va-switch-label-left-padding: 0.8rem;
}
</style>

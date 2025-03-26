<template>
  <div>
    <div class="flex flex-row justify-between md:items-center">
      <h1 class="mb-3 font-bold">Restaurant Details</h1>
      <div class="flex gap-x-4 ml-auto mb-3">
        <VaButton :disabled="!restaurantData.name" @click="restaurantId ? updateRestaurant() : createRestaurant()">{{
          restaurantId ? 'Save' : 'Create'
        }}</VaButton>
        <VaButton preset="primary">Reset</VaButton>
      </div>
    </div>
    <VaCard>
      <VaCardContent>
        <VaForm ref="detail-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput id="name" v-model="restaurantData.name" label="Name" class="w-full sm:w-1/2" name="Name" />
            <VaInput
              id="description"
              v-model="restaurantData.description"
              label="Description"
              class="w-full sm:w-1/2"
              name="Description"
            />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaSelect id="type" v-model="restaurantData.type" label="Type" class="w-full sm:w-1/2" :options="types" />
            <VaInput
              id="address"
              v-model="restaurantData.address"
              label="Address"
              class="w-full sm:w-1/2"
              name="Address"
            />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput
              id="postcode"
              v-model="restaurantData.postcode"
              label="Postcode"
              class="w-full sm:w-1/2"
              name="Postcode"
              type="number"
            />
            <VaInput
              id="email"
              v-model="restaurantData.email"
              label="Email"
              class="w-full sm:w-1/2"
              name="Email"
              type="email"
            />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput
              id="phone"
              v-model="restaurantData.phone"
              label="Phone"
              class="w-full sm:w-1/2"
              name="Phone"
              type="number"
            />
            <VaInput
              id="facebook"
              v-model="restaurantData.facebook"
              label="Facebook"
              class="w-full sm:w-1/2"
              name="Facebook"
              type="url"
            />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput
              id="instagram"
              v-model="restaurantData.instagram"
              label="Instagram"
              class="w-full sm:w-1/2"
              name="Instagram"
              type="url"
            />
            <VaInput
              id="twitter"
              v-model="restaurantData.twitter"
              label="Twitter"
              class="w-full sm:w-1/2"
              name="Twitter"
              type="url"
            />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaInput
              id="website"
              v-model="restaurantData.website"
              label="Website"
              class="w-full sm:w-1/2"
              name="Website"
              type="url"
            />
            <VaInput
              id="tripAdvisor"
              v-model="restaurantData.tripAdvisor"
              label="TripAdvisor"
              class="w-full sm:w-1/2"
              name="TripAdvisor"
            />
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <h1 class="mb-3 mt-8 font-bold">Configuration</h1>
    <VaCard>
      <VaCardContent>
        <VaForm ref="configuration-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex flex-col sm:flex-row w-full config">
            <VaSwitch v-model="restaurantData.active" label="Active " left-label size="small" />
          </div>
          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">POS:</div>
            <div class="flex flex-col w-full mt-2 config">
              <VaSwitch v-model="restaurantData.winmax" class="w-fit" label="1. Winmax" left-label size="small" />
              <div v-if="restaurantData.winmax" class="grid grid-cols-5 gap-8 w-full mt-4">
                <VaInput v-model="restaurantData.company" name="Company" placeholder="Company" />
                <VaInput v-model="restaurantData.user" name="User" placeholder="User" />
                <VaInput v-model="restaurantData.password" name="Password" placeholder="Password" type="password" />
                <VaInput v-model="restaurantData.terminal" name="Terminal" placeholder="Terminal" type="number" />
                <VaInput v-model="restaurantData.restaurant_id" name="id" placeholder="Restaurant_id" />
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch v-model="restaurantData.restus" class="w-fit" label="2. Restus" left-label size="small" />
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full mt-4">
            <VaSelect
              v-model="restaurantData.operatingMode"
              label="Operating Mode"
              class="w-full sm:w-1/2"
              :options="mode"
            />
            <VaInput
              v-model="restaurantData.orderTimeLimit"
              label="Order Time Limit"
              class="w-full sm:w-1/2"
              name="Ordertime"
              type="number"
            />
          </div>
          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">Opening Times:</div>
            <div class="flex flex-col sm:flex-row w-full mt-2 config">
              <VaSwitch v-model="restaurantData.daily" label="a. Daily" left-label size="small" class="w-fit mr-6" />
              <div v-if="restaurantData.daily">
                <VaTimeInput v-model="restaurantData.openingTime" ampm class="mr-2" />
                <VaTimeInput v-model="restaurantData.closingTime" ampm />
              </div>
            </div>
            <div class="flex flex-col sm:flex-row w-full mt-4 config">
              <VaSwitch v-model="restaurantData.byday" label="b. By Day" left-label size="small" class="w-fit mr-6" />
              <div v-if="restaurantData.byday">
                <div>
                  <VaTimeInput v-model="restaurantData.mondayOpening" label="Monday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.mondayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-4">
                  <VaTimeInput v-model="restaurantData.tuesdayOpening" label="Tuesday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.tuesdayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="restaurantData.wednesdayOpening" label="Wednesday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.wednesdayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="restaurantData.thursdayOpening" label="Thursday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.thursdayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="restaurantData.fridayOpening" label="Friday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.fridayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="restaurantData.saturdayOpening" label="Saturday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.saturdayClosing" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput v-model="restaurantData.sundayOpening" label="Sunday" ampm class="mr-2" />
                  <VaTimeInput v-model="restaurantData.sundayClosing" ampm class="mt-4" />
                </div>
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch v-model="restaurantData.hours" label="c. 24 hours" left-label size="small" />
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full mt-4">
            <VaInput
              v-model="restaurantData.closingSoon"
              label="Closing soon"
              class="w-full sm:w-1/2"
              name="Closingsoon"
              type="number"
            />
          </div>
          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">Delivery Times:</div>
            <div class="flex flex-col sm:flex-row w-full mt-2 config">
              <VaSwitch
                v-model="restaurantData.delivery.enabled"
                label="a. Daily"
                left-label
                size="small"
                class="w-fit mr-6"
              />
              <div v-if="restaurantData.delivery.daily">
                <VaTimeInput v-model="restaurantData.delivery.openingTimes.daily.opens" ampm class="mr-2" />
                <VaTimeInput v-model="restaurantData.delivery.openingTimes.daily.closes" ampm />
              </div>
            </div>
            <div class="flex flex-col sm:flex-row w-full mt-4 config">
              <VaSwitch
                v-model="restaurantData.delivery.enabled"
                label="b. By Day"
                left-label
                size="small"
                class="w-fit mr-6"
              />
              <div v-if="restaurantData.delivery.enabled">
                <div>
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.monday.opens"
                    label="Monday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.monday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-4">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.tuesday.opens"
                    label="Tuesday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.tuesday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.wednesday.opens"
                    label="Wednesday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.wednesday.closes"
                    ampm
                    class="mt-4"
                  />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.thursday.opens"
                    label="Thursday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.thursday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.friday.opens"
                    label="Friday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.friday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.saturday.opens"
                    label="Saturday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.saturday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.delivery.openingTimes.byDay.sunday.opens"
                    label="Sunday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.delivery.openingTimes.byDay.sunday.closes" ampm class="mt-4" />
                </div>
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch
                v-model="restaurantData.delivery.openingTimes.is24h"
                label="c. 24 hours"
                left-label
                size="small"
              />
            </div>
          </div>

          <div class="flex flex-col w-full mt-4">
            <div class="font-bold">Takeaway Times:</div>
            <div class="flex flex-col sm:flex-row w-full mt-2 config">
              <VaSwitch
                v-model="restaurantData.takeaway.enabled"
                label="a. Daily"
                left-label
                size="small"
                class="w-fit mr-6"
              />
              <div v-if="restaurantData.takeaway.enabled">
                <VaTimeInput v-model="restaurantData.takeaway.openingTimes.daily.opens" ampm class="mr-2" />
                <VaTimeInput v-model="restaurantData.takeaway.openingTimes.daily.closes" ampm />
              </div>
            </div>
            <div class="flex flex-col sm:flex-row w-full mt-4 config">
              <VaSwitch
                v-model="restaurantData.takeaway.enabled"
                label="b. By Day"
                left-label
                size="small"
                class="w-fit mr-6"
              />
              <div v-if="restaurantData.takeaway.enabled">
                <div>
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.monday.opens"
                    label="Monday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.monday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-4">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.tuesday.opens"
                    label="Tuesday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.tuesday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.wednesday.opens"
                    label="Wednesday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.wednesday.closes"
                    ampm
                    class="mt-4"
                  />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.thursday.opens"
                    label="Thursday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.thursday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.friday.opens"
                    label="Friday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.friday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.saturday.opens"
                    label="Saturday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.saturday.closes" ampm class="mt-4" />
                </div>
                <div class="mt-2">
                  <VaTimeInput
                    v-model="restaurantData.takeaway.openingTimes.byDay.sunday.opens"
                    label="Sunday"
                    ampm
                    class="mr-2"
                  />
                  <VaTimeInput v-model="restaurantData.takeaway.openingTimes.byDay.sunday.closes" ampm class="mt-4" />
                </div>
              </div>
            </div>
            <div class="flex flex-col w-full mt-4 config">
              <VaSwitch v-model="restaurantData.takeaway.is24h" label="c. 24 hours" left-label size="small" />
            </div>
          </div>

          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-4">
            <VaSwitch v-model="restaurantData.guestUsers" label="Guest Users" left-label size="small" />
            <VaSwitch v-model="restaurantData.guestCheckout" label="Guest Checkout" left-label size="small" />
            <VaSwitch v-model="restaurantData.repeatLastOrder" label="Repeat Last Order" left-label size="small" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-4">
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="restaurantData.minChange" label="Minimum Charge" left-label size="small" />
              <div v-if="restaurantData.minChange" class="flex flex-col w-full mt-4">
                <VaInput
                  v-model="restaurantData.minimumCharge"
                  name="MinimumCharge"
                  placeholder="Minimum Charge"
                  type="number"
                />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="restaurantData.foodArticle" label="Food Article Notes" left-label size="small" />
              <div v-if="restaurantData.foodArticle" class="flex flex-col w-full mt-4">
                <VaInput
                  v-model="restaurantData.foodArticleNotes"
                  name="FoodArticleNotes"
                  placeholder="Food Article Notes"
                />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="restaurantData.drinkArticle" label="Drink Article Notes" left-label size="small" />
              <div v-if="restaurantData.drinkArticle" class="flex flex-col w-full mt-4">
                <VaInput
                  v-model="restaurantData.drinkArticleNotes"
                  name="DrinkArticleNotes"
                  placeholder="Drink Article Notes"
                />
              </div>
            </div>
            <div class="flex flex-col w-full config mt-1">
              <VaSwitch v-model="restaurantData.orderNotes" label="Order Notes" left-label size="small" />
              <div v-if="restaurantData.orderNotes" class="flex flex-col w-full mt-4">
                <VaInput v-model="restaurantData.orderNotesText" name="OrderNotes" placeholder="Order Notes" />
              </div>
            </div>
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea v-model="restaurantData.dineInMessage" label="Dine-in Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea v-model="restaurantData.deliveryMessage" label="Delivery Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-8 flex-col sm:flex-row w-full config mt-2">
            <VaTextarea v-model="restaurantData.takeawayMessage" label="Takeaway Confirmation Message" class="w-full" />
          </div>
          <div class="flex gap-14 flex-col sm:flex-row w-full config">
            <VaSwitch v-model="restaurantData.tabs" label="Tabs " left-label size="small" />
            <VaSwitch v-model="restaurantData.tips" label="Tips" left-label size="small" />
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>

    <h1 class="mb-3 mt-8 font-bold">Design</h1>
    <VaCard>
      <VaCardContent>
        <VaForm ref="design-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="flex gap-8 flex-col sm:flex-row w-full">
            <VaColorInput v-model="restaurantData.primaryColor" label="Primary Color" class="w-28" />
            <VaColorInput v-model="restaurantData.secondaryColor" label="Secondary Color" class="w-28" />
            <VaColorInput v-model="restaurantData.backgroundColor" label="Background Color" class="w-28" />
            <VaColorInput v-model="restaurantData.headerColor" label="Header Color" class="w-28" />
            <VaColorInput v-model="restaurantData.footerColor" label="Footer Color" class="w-28" />
          </div>
          <!-- <div class="flex flex-col sm:flex-row w-full">
            <VaFileUpload
              v-model="logo"
              undo
              :type="galleryType"
              :undo-duration="undoDuration"
              :undo-button-text="undoButtonText"
              :deleted-file-message="deletedFileMessage"
              :upload-button-text="uploadLogoText"
              file-types="jpg,png"
            />
          </div>
          <div class="flex flex-col sm:flex-row w-full">
            <VaFileUpload
              v-model="header"
              undo
              :type="galleryType"
              :undo-duration="undoDuration"
              :undo-button-text="undoButtonText"
              :deleted-file-message="deletedFileMessage"
              :upload-button-text="uploadHeaderText"
              file-types="jpg,png"
            />
          </div> -->
        </VaForm>
      </VaCardContent>
    </VaCard>

    <!-- <VaTabs v-model="tab" grow class="mt-8">
      <template #tabs>
        <VaTab v-for="title in ['Categories', 'Menu Items']" :key="title" :name="title">
          {{ title }}
        </VaTab>
      </template>
    </VaTabs> -->
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useToast, VaFileUpload, VaInput, VaSwitch } from 'vuestic-ui'
export default {
  components: { VaFileUpload, VaInput, VaSwitch },
  setup() {
    // const tab = ref('Categories')
    const types = ref(['Create New'])
    const mode = ref(['View Only', 'Online Ordering'])
    const selectedType = ref(null)
    const selectedTypeMode = ref(null)
    const route = useRoute()
    const restaurantId = route.params.id
    const { init } = useToast()
    const restaurantData = ref({
      name: '',
      description: '',
      type: '',
      address: '',
      postcode: '',
      email: '',
      phone: '',
      facebook: '',
      instagram: '',
      twitter: '',
      website: '',
      tripAdvisor: '',
      active: false,
      winmax: false,
      company: '',
      user: '',
      password: '',
      terminal: null,
      restaurant_id: '',
      restus: false,
      operatingMode: '',
      orderTimeLimit: null,
      openingTime: '',
      closingTime: '',
      mondayOpening: '',
      mondayClosing: '',
      tuesdayOpening: '',
      tuesdayClosing: '',
      wednesdayOpening: '',
      wednesdayClosing: '',
      thursdayOpening: '',
      thursdayClosing: '',
      fridayOpening: '',
      fridayClosing: '',
      saturdayOpening: '',
      saturdayClosing: '',
      sundayOpening: '',
      sundayClosing: '',
      hours: false,
      closingSoon: null,
      delivery: {
        enabled: false,
        openingTimes: {
          daily: {
            opens: '',
            closes: '',
          },
          byDay: {
            monday: { opens: '', closes: '' },
            tuesday: { opens: '', closes: '' },
            wednesday: { opens: '', closes: '' },
            thursday: { opens: '', closes: '' },
            friday: { opens: '', closes: '' },
            saturday: { opens: '', closes: '' },
            sunday: { opens: '', closes: '' },
          },
          is24h: false,
        },
      },
      takeaway: {
        enabled: false,
        openingTimes: {
          daily: {
            opens: '',
            closes: '',
          },
          byDay: {
            enabled: false,
            monday: { opens: '', closes: '' },
            tuesday: { opens: '', closes: '' },
            wednesday: { opens: '', closes: '' },
            thursday: { opens: '', closes: '' },
            friday: { opens: '', closes: '' },
            saturday: { opens: '', closes: '' },
            sunday: { opens: '', closes: '' },
          },
          is24h: false,
        },
      },
      guestUsers: false,
      guestCheckout: false,
      repeatLastOrder: false,
      minChange: false,
      minimumCharge: null,
      foodArticle: false,
      foodArticleNotes: '',
      drinkArticle: false,
      drinkArticleNotes: '',
      orderNotes: false,
      orderNotesText: '',
      dineInMessage: '',
      deliveryMessage: '',
      takeawayMessage: '',
      tabs: false,
      tips: false,
      primaryColor: '',
      secondaryColor: '',
      backgroundColor: '',
      headerColor: '',
      footerColor: '',
    })

    return { types, mode, selectedType, selectedTypeMode, restaurantData, restaurantId, init }
  },
  data() {
    return {
      active: true,
      isGalleryViewEnabled: true,
      undoDuration: 5000,
      deletedFileMessage: 'File exterminated',
      undoButtonText: 'Cancel',
      logo: [],
      header: [],
      uploadLogoText: 'Upload Logo',
      uploadHeaderText: 'Upload Header',
      colorPicker: '#FF002',
    }
  },
  computed: {
    galleryType() {
      return this.isGalleryViewEnabled ? 'gallery' : 'list'
    },
  },
  mounted() {
    this.fetchRestaurantDetails()
  },
  methods: {
    async fetchRestaurantDetails() {
      if (this.restaurantId) {
        const url = import.meta.env.VITE_API_BASE_URL
        try {
          const response = await axios.get(`${url}/outlets?id=${this.restaurantId}`)
          this.restaurantData = response.data.length ? response.data[0] : null
          console.log('Restaurant details:', this.restaurantData)
        } catch (error) {
          console.error('Error fetching restaurant details:', error)
        }
      }
    },
    createPayload() {
      const data = {
        name: this.restaurantData.name || '',
        description: this.restaurantData.description || '',
        type: this.restaurantData.type || '',
        address: this.restaurantData.address || '',
        postcode: this.restaurantData.postcode || '',
        email: this.restaurantData.email || '',
        phone: this.restaurantData.phone || '',
        facebook: this.restaurantData.facebook || '',
        instagram: this.restaurantData.instagram || '',
        twitter: this.restaurantData.twitter || '',
        website: this.restaurantData.website || '',
        tripadvisor: this.restaurantData.tripAdvisor || '',
        active: this.restaurantData.active || false,
        pos: this.restaurantData.winmax ? 'winmax' : this.restaurantData.restus ? 'restus' : '',
        winmaxConfig: {
          company: this.restaurantData.company || '',
          user: this.restaurantData.user || '',
          password: this.restaurantData.password || '',
          terminal: this.restaurantData.terminal || null,
          serviceZoneId: this.restaurantData.restaurant_id || '',
        },
        restusConfig: {
          operatingMode: this.restaurantData.operatingMode || '',
          orderTimeLimit: this.restaurantData.orderTimeLimit || null,
        },
        openingTimes: {
          daily: {
            opens: this.restaurantData.openingTime || '',
            closes: this.restaurantData.closingTime || '',
          },
          byDay: {
            monday: {
              opens: this.restaurantData.mondayOpening || '',
              closes: this.restaurantData.mondayClosing || '',
              closed: null,
            },
            tuesday: {
              opens: this.restaurantData.tuesdayOpening || '',
              closes: this.restaurantData.tuesdayClosing || '',
              closed: null,
            },
            wednesday: {
              opens: this.restaurantData.wednesdayOpening || '',
              closes: this.restaurantData.wednesdayClosing || '',
              closed: null,
            },
            thursday: {
              opens: this.restaurantData.thursdayOpening || '',
              closes: this.restaurantData.thursdayClosing || '',
              closed: null,
            },
            friday: {
              opens: this.restaurantData.fridayOpening || '',
              closes: this.restaurantData.fridayClosing || '',
              closed: null,
            },
            saturday: {
              opens: this.restaurantData.saturdayOpening || '',
              closes: this.restaurantData.saturdayClosing || '',
              closed: null,
            },
            sunday: {
              opens: this.restaurantData.sundayOpening || '',
              closes: this.restaurantData.sundayClosing || '',
              closed: null,
            },
          },
          is24h: this.restaurantData.hours || null,
          closingSoonMinutes: this.restaurantData.closingSoon || null,
        },
        delivery: {
          enabled: this.restaurantData.delivery.enabled || this.restaurantData.delivery.enabled || false,
          sameAsDineIn: false,
          deliveryTime: null,
          openingTimes: {
            daily: {
              opens: this.restaurantData.delivery.openingTimes.daily.opens || '',
              closes: this.restaurantData.delivery.openingTimes.daily.closes || '',
            },
            byDay: {
              monday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.monday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.monday.closes || '',
                closed: null,
              },
              tuesday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.tuesday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.tuesday.closes || '',
                closed: null,
              },
              wednesday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.wednesday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.wednesday.closes || '',
                closed: null,
              },
              thursday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.thursday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.thursday.closes || '',
                closed: null,
              },
              friday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.friday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.friday.closes || '',
                closed: null,
              },
              saturday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.saturday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.saturday.closes || '',
                closed: null,
              },
              sunday: {
                opens: this.restaurantData.delivery.openingTimes.byDay.sunday.opens || '',
                closes: this.restaurantData.delivery.openingTimes.byDay.sunday.closes || '',
                closed: null,
              },
            },
            is24h: this.restaurantData.delivery.openingTimes.is24h || null,
            closingSoonMinutes: null,
          },
        },
        takeaway: {
          enabled: this.restaurantData.takeaway.enabled || this.restaurantData.takeaway.enabled || false,
          sameAsDineIn: false,
          pickupTime: null,
          openingTimes: {
            daily: {
              opens: this.restaurantData.takeaway.openingTimes.daily.opens || '',
              closes: this.restaurantData.takeaway.openingTimes.daily.closes || '',
            },
            byDay: {
              monday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.monday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.monday.closes || '',
                closed: null,
              },
              tuesday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.tuesday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.tuesday.closes || '',
                closed: null,
              },
              wednesday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.wednesday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.wednesday.closes || '',
                closed: null,
              },
              thursday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.thursday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.thursday.closes || '',
                closed: null,
              },
              friday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.friday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.friday.closes || '',
                closed: null,
              },
              saturday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.saturday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.saturday.closes || '',
                closed: null,
              },
              sunday: {
                opens: this.restaurantData.takeaway.openingTimes.byDay.sunday.opens || '',
                closes: this.restaurantData.takeaway.openingTimes.byDay.sunday.closes || '',
                closed: null,
              },
            },
            is24h: this.restaurantData.takeaway.openingTimes.is24h || null,
            closingSoonMinutes: null,
          },
        },
        guestUsers: this.restaurantData.guestUsers || false,
        guestCheckout: this.restaurantData.guestCheckout || false,
        repeatLastOrder: this.restaurantData.repeatLastOrder || false,
        minimumCharge: this.restaurantData.minimumCharge || null,
        foodArticleNotes: this.restaurantData.foodArticleNotes || '',
        drinkArticleNotes: this.restaurantData.drinkArticleNotes || '',
        orderNotes: this.restaurantData.orderNotesText || '',
        dineInConfirmationMessage: this.restaurantData.dineInMessage || '',
        deliveryConfirmationMessage: this.restaurantData.deliveryMessage || '',
        takeawayConfirmationMessage: this.restaurantData.takeawayMessage || '',
        tabs: this.restaurantData.tabs || false,
        tips: this.restaurantData.tips || false,
      }
      return data
    },
    async createRestaurant() {
      const data = this.createPayload()
      const url = import.meta.env.VITE_API_BASE_URL
      console.log(url)
      try {
        const response = await axios.post(`${url}/outlets`, data)
        this.restaurantData = response.data
        console.log('Restaurant details:', this.restaurantData)
      } catch (error) {
        console.error('Error fetching restaurant details:', error)
      }
      this.init({ message: "You've successfully created outlet", color: 'success' })
      this.$router.push({ name: 'list' })
    },
    async updateRestaurant() {
      const data = this.createPayload()
      const url = import.meta.env.VITE_API_BASE_URL

      const response = await axios.patch(`${url}/outlets/${this.restaurantId}`, data)
      this.restaurantData = response.data

      this.init({ message: "You've successfully updated outlet", color: 'success' })
      this.$router.push({ name: 'list' })
    },
  },
}
</script>
<style scoped>
.config {
  --va-switch-label-left-padding: 0.8rem;
}
</style>

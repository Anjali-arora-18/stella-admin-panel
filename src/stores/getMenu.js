import { defineStore } from 'pinia'
import axios from 'axios'
import { useServiceStore } from './services'
export const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      categories: [],
      services: useServiceStore().$state,
      url: import.meta.env.VITE_API_BASE_URL,
      restDetails: null,
      unFilteredMenuItems: [],
      offer: null,
    }
  },
  getters: {
    addOnPrice: (state) => {
      let selectionTotal = 0
      if (!state.offer) {
        return selectionTotal
      }
      state.offer.selections.forEach((item) => {
        item.addedItems.forEach((addedItem) => {
          selectionTotal += addedItem.basePrice * addedItem.quantity
          addedItem.selectedOptions.forEach((group) => {
            group.selected.forEach((selection) => {
              selectionTotal += selection.price * selection.quantity
            })
          })
        })
      })

      return selectionTotal
    },
  },
  actions: {
    setOffer(offer) {
      this.offer = offer
    },
    addItemToOffer(group, product) {
      const index = this.offer.selections.findIndex((a) => a._id === group._id)
      this.offer.selections[index].addedItems.push(product)
      if (!this.offer) {
        this.offer[group] = []
      }
    },
    updateItemToOffer(product, groupItemIndex, addedItemIndex) {
      this.offer.selections[groupItemIndex].addedItems[addedItemIndex] = JSON.parse(JSON.stringify(product))
    },
    removeItemFromOffer(group, index) {
      const itemIndex = this.offer.selections.findIndex((a) => a._id === group._id)
      if (itemIndex !== -1) {
        this.offer.selections[itemIndex].addedItems.splice(index, 1)
      }
    },
    resetUnFilteredMenuItems() {
      this.unFilteredMenuItems
    },
    async getOutletDetails(payload) {
      const response = await axios.get(`${this.url}/outletsvo`, {
        params: {
          outletSlug: payload,
        },
      })
      this.restDetails = response.data[0]
    },
    async getCategories() {
      await axios
        .get(`${this.url}/menuCategoriesvo?limit=50`, {
          params: {
            outletName: this.restDetails.name,
          },
        })
        .then((res) => {
          if (res.data.length) {
            this.categories = res.data.map((e) => ({
              ...e,
              menuItems: [],
              subCategories: e.subCategories.map((subCategory) => ({
                ...subCategory,
                menuItems: [],
              })),
            }))
            res.data.forEach(async (category) => {
              await this.getMenuItems(category)
            })
          }
        })
    },
    async getMenuItems(item) {
      axios
        .get(`${this.url}/menuItemsvo?limit=1000`, {
          params: {
            outletName: this.restDetails.name,
            categoryId: item._id,
          },
        })
        .then((response) => {
          this.unFilteredMenuItems.push(...response.data)
          const categoryIndex = this.categories.findIndex((category) => category._id === item._id)
          if (categoryIndex !== -1) {
            const itemsWithSubCategories = response.data.filter((item) => item.subCategories.length)
            const itemsWithoutSubCategories = response.data.filter((item) => !item.subCategories.length)
            this.categories[categoryIndex] = {
              ...this.categories[categoryIndex],
              menuItems: itemsWithoutSubCategories,
              subCategories: this.categories[categoryIndex].subCategories.map((e) => {
                const subCategoryItems = itemsWithSubCategories.filter(
                  (item) => item.subCategories && item.subCategories.find((a) => a.id === e._id),
                )
                return {
                  ...e,
                  menuItems: subCategoryItems,
                }
              }),
            }
          }
        })
    },
  },
})

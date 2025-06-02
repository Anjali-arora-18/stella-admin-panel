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
    }
  },
  actions: {
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

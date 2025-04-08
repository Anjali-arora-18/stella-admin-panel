import { defineStore } from 'pinia'
import { deleteCategory, getCategories } from '../data/pages/categories'

export const useCategoryStore = defineStore('categories', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll(payload) {
      const { data } = await getCategories(payload)
      this.items = data
    },

    async deleteCategory(payload) {
      return await await deleteCategory(payload)
    },
  },
})

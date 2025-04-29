import { defineStore } from 'pinia'
import { deleteCategory, getCategories } from '../data/pages/categories'

export const useCategoryStore = defineStore('categories', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll(payload, sortBy = 'name', order = 'asc') {
      const { data } = await getCategories(payload, sortBy, order)
      this.items = data
      return data
    },

    async deleteCategory(payload) {
      return await await deleteCategory(payload)
    },
  },
})

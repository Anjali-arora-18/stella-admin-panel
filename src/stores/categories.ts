import { defineStore } from 'pinia'
import { getCategories } from '../data/pages/categories'

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

    // async update(user: User) {
    //   const [updatedUser] = await updateUser(user)
    //   const index = this.items.findIndex(({ id }) => id === user.id)
    //   this.items.splice(index, 1, updatedUser)
    //   return updatedUser
    // },
  },
})

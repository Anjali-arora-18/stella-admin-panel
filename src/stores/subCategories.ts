import { defineStore } from 'pinia'
import { getSubCategories } from '../data/pages/subCategories'

export const useSubCategoriesStore = defineStore('subCategories', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll(payload) {
      const { data } = await getSubCategories(payload)
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

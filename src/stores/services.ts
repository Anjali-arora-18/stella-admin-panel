import { defineStore } from 'pinia'
import { getServices } from '../data/pages/services'

export const useServiceStore = defineStore('services', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll(payload) {
      const { data } = await getServices(payload)
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

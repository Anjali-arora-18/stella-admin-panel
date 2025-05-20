import { defineStore } from 'pinia'
import { deleteStellaUser, getStellaUsers } from '../data/pages/stellaUsers'

export const useStellaUserStore = defineStore('stellaUser', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll(payload, sortBy = 'username', order = 'asc') {
      const { data } = await getStellaUsers(payload, sortBy, order)
      this.items = data
      return data
    },

    async deleteStellaUser(payload) {
      return await await deleteStellaUser(payload)
    },
  },
})

import { defineStore } from 'pinia'
import { getCompanies } from '../data/pages/companies'

export const useCompanyStore = defineStore('companies', {
  state: () => {
    return {
      items: [],
    }
  },

  actions: {
    async getAll() {
      const { data } = await getCompanies()
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

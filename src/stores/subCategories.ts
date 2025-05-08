import { defineStore } from 'pinia'
import { getSubCategories } from '../data/pages/subCategories'

export const useSubCategoriesStore = defineStore('subCategories', {
  state: () => {
    return {
      items: [],
      allergenOptions: [
        { text: 'Vegan', id: 1 },
        { text: 'Plant Based', id: 2 },
        { text: 'Vegetarian', id: 3 },
        { text: 'Pescatarian', id: 4 },
        { text: 'Spicy', id: 5 },
        { text: 'Halal', id: 6 },
        { text: 'Kosher', id: 7 },
        { text: 'Gluten Free', id: 8 },
        { text: 'Dairy Free', id: 9 },
        { text: 'Nut Free', id: 10 },
        { text: 'Gluten', id: 11 },
        { text: 'Crustaceans', id: 12 },
        { text: 'Eggs', id: 13 },
        { text: 'Fish', id: 14 },
        { text: 'Peanuts', id: 15 },
        { text: 'Soybeans', id: 16 },
        { text: 'Milk', id: 17 },
        { text: 'Nuts', id: 18 },
        { text: 'Celery', id: 19 },
        { text: 'Mustard', id: 20 },
        { text: 'Sesame seeds', id: 21 },
        { text: 'Sulphur dioxide', id: 22 },
        { text: 'Lupin', id: 23 },
        { text: 'Molluscs', id: 24 },
      ],
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

import { defineStore } from 'pinia'
import { getSubCategories } from '../data/pages/subCategories'

export const useSubCategoriesStore = defineStore('subCategories', {
  state: () => {
    return {
      items: [],
      allergenOptions: [
        { text: 'Vegan', id: 1, icon: 'vegan' },
        { text: 'Plant Based', id: 2, icon: 'plant_based' },
        { text: 'Vegetarian', id: 3, icon: 'vegetarian' },
        { text: 'Pescatarian', id: 4, icon: 'pescatarian' },
        { text: 'Spicy', id: 5, icon: 'spicy' },
        { text: 'Halal', id: 6, icon: 'halal' },
        { text: 'Kosher', id: 7, icon: 'kosher' },
        { text: 'Gluten Free', id: 8, icon: 'gluten_free' },
        { text: 'Dairy Free', id: 9, icon: 'dairy_free' },
        { text: 'Nut Free', id: 10, icon: 'nut_free' },
        { text: 'Gluten', id: 11, icon: 'gluten' },
        { text: 'Crustaceans', id: 12, icon: 'crustaceans' },
        { text: 'Eggs', id: 13, icon: 'eggs' },
        { text: 'Fish', id: 14, icon: 'fish' },
        { text: 'Peanuts', id: 15, icon: 'peanuts' },
        { text: 'Soybeans', id: 16, icon: 'soybeans' },
        { text: 'Milk', id: 17, icon: 'milk' },
        { text: 'Nuts', id: 18, icon: 'nuts' },
        { text: 'Celery', id: 19, icon: 'celery' },
        { text: 'Mustard', id: 20, icon: 'mustard' },
        { text: 'Sesame seeds', id: 21, icon: 'sesame_seeds' },
        { text: 'Sulphur dioxide', id: 22, icon: 'sulphur_dioxide' },
        { text: 'Lupin', id: 23, icon: 'lupin' },
        { text: 'Molluscs', id: 24, icon: 'molluscs' },
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

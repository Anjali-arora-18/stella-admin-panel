import { defineStore } from 'pinia'
import { getSubCategories } from '../data/pages/subCategories'

export const useSubCategoriesStore = defineStore('subCategories', {
  state: () => {
    return {
      items: [],
      allergenOptions: [
        { text: 'Celery', id: 1, icon: 'celery' },
        { text: 'Crustaceans', id: 2, icon: 'crustaceans' },
        { text: 'Dairy Free', id: 3, icon: 'dairy_free' },
        { text: 'Eggs', id: 4, icon: 'eggs' },
        { text: 'Fish', id: 5, icon: 'fish' },
        { text: 'Gluten', id: 6, icon: 'gluten' },
        { text: 'Gluten Free', id: 7, icon: 'gluten_free' },
        { text: 'Halal', id: 8, icon: 'halal' },
        { text: 'Kosher', id: 9, icon: 'kosher' },
        { text: 'Lupin', id: 10, icon: 'lupin' },
        { text: 'Milk', id: 11, icon: 'milk' },
        { text: 'Molluscs', id: 12, icon: 'molluscs' },
        { text: 'Mustard', id: 13, icon: 'mustard' },
        { text: 'Nut Free', id: 14, icon: 'nut_free' },
        { text: 'Nuts', id: 15, icon: 'nuts' },
        { text: 'Peanuts', id: 16, icon: 'peanuts' },
        { text: 'Pescatarian', id: 17, icon: 'pescatarian' },
        { text: 'Plant Based', id: 18, icon: 'plant_based' },
        { text: 'Sesame seeds', id: 19, icon: 'sesame_seeds' },
        { text: 'Soybeans', id: 20, icon: 'soybeans' },
        { text: 'Spicy', id: 21, icon: 'spicy' },
        { text: 'Sulphur dioxide', id: 22, icon: 'sulphur_dioxide' },
        { text: 'Vegan', id: 23, icon: 'vegan' },
        { text: 'Vegetarian', id: 24, icon: 'vegetarian' },
      ],
    }
  },

  actions: {
    async getAll(payload) {
      const { data } = await getSubCategories(payload)
      this.items = data
    },
  },
})

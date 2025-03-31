import { defineStore } from 'pinia'
import {
  getServices,
  getAreas,
  saveArea,
  deleteArea,
  updateArea,
  createTable,
  updateTable,
  deleteTable,
} from '../data/pages/services'

export const useServiceStore = defineStore('services', {
  state: () => {
    return {
      items: [],
      selectedRest: '',
    }
  },

  actions: {
    async getAll() {
      const { data } = await getServices()
      this.items = data
    },
    async getAreas() {
      return await getAreas(this.selectedRest)
    },
    async saveArea(payload) {
      return await saveArea(payload)
    },
    async updateArea(payload) {
      return await updateArea(payload)
    },
    async deleteArea(payload) {
      return await deleteArea(payload)
    },
    async createTable(payload) {
      return await createTable(payload)
    },
    async updateTable(payload) {
      return await updateTable(payload)
    },
    async deleteTable(payload) {
      return await deleteTable(payload)
    },
    setRest(payload) {
      this.selectedRest = payload
    },
  },
})

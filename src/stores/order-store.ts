import { defineStore } from 'pinia'
import axios from 'axios'
export const useOrderStore = defineStore('order', {
  state: () => ({
    cartItems: [] as {
      itemId: string
      itemName: string
      basePrice: number
      imageUrl: string
      quantity: number
      selectedOptions: {
        groupId: string
        groupName: string
        multipleChoice: boolean
        selected: {
          optionId: string
          name: string
          price: number
          quantity: number
          type: string
        }[]
      }[]
      totalPrice: number
      selectionTotalPrice: number
      paymentId: string
    }[],
  }),
  actions: {
    addItemToCart(item: any) {
      this.cartItems.push(item)
    },
    updateItem(index: number, newItem: any) {
      this.cartItems[index] = newItem
    },
    removeItem(index: number) {
      this.cartItems.splice(index, 1)
    },
    calculateItemTotal(itemIndex: number) {
      const item = this.cartItems[itemIndex]

      let total = item.basePrice
      let selectionTotal = 0

      item.selectedOptions.forEach((group) => {
        group.selected.forEach((selection) => {
          total += selection.price * selection.quantity
          selectionTotal += selection.price * selection.quantity
        })
      })

      total = total * item.quantity
      this.cartItems[itemIndex] = {
        ...item,
        totalPrice: total,
        selectionTotalPrice: selectionTotal,
      }
    },
    async createOrder(payload) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/orders`, payload)
    },
    async checkPaymentStatus(orderId) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.put(`${url}/payments/verify/${orderId}`)
    },
  },
})

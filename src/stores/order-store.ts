import { defineStore } from 'pinia'
import axios from 'axios'
export const useOrderStore = defineStore('order', {
  state: () => ({
    cartItems: [],
    offerItems: [],
    paymentId: '',
    redirectUrl: '',
    deliveryZone: '',
    address: '',
  }),
  actions: {
    setDeliveryZone(payload) {
      this.deliveryZone = payload
    },
    setAddress(payload) {
      this.address = payload
    },
    setPaymentLink(payload) {
      this.redirectUrl = payload
    },
    addItemToCart(item: any) {
      this.cartItems.push(item)
    },
    offersAdded(item: any) {
      const itemIndex = this.offerItems.findIndex((a) => a._id === item._id)
      if (itemIndex !== -1) {
        this.offerItems[itemIndex] = item
      } else {
        this.offerItems.push(item)
      }
    },
    updateItem(index: number, newItem: any) {
      this.cartItems[index] = newItem
    },
    removeItem(index: number) {
      this.cartItems.splice(index, 1)
    },
    removeOffersAdded(index: number) {
      this.offerItems.splice(index, 1)
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
    async checkPaymentStatus(orderId, paymentTypeId) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.put(`${url}/payments/verify/${orderId}?paymentTypeId=${paymentTypeId}`)
    },
    async createPayment({ orderId: orderId, paymentTypeId: paymentTypeId }) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/payments/${orderId}?paymentTypeId=${paymentTypeId}`)
    },
    async sendOrderToWinmax(orderId) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/winmax/winmax-orders/`, {
        id: orderId,
      })
    },
    async retryPayment(orderId) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/payments/retry/${orderId}`)
    },
  },
})

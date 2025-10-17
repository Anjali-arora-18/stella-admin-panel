import { defineStore } from 'pinia'
import axios from 'axios'

export const useOrderStore = defineStore('order', {
  state: () => ({
    cartItems: [],
    editOrder: null,
    offers: [],
    offerItems: [],
    cartTotal: null,
    paymentId: '',
    redirectUrl: '',
    deliveryZone: '',
    address: '',
    orderFor: 'current',
    orderNotes:'',
    deliveryNotes: "",

    // ADDED — holds /orders/validate-promo response for UI breakdown (incl. updatedOffersTotal)
    validation: null as null | {
      originalTotal: number
      updatedTotal: number
      discount: number
      discountType: string | null
      affect: any
      deliveryFee: number
      menuItems: Array<{
        menuItemId: string
        name: string
        quantity: number
        originalPrice: number
        optionsPrice: number
        updatedPrice: number
        discount: number
        isAffected: boolean
      }>
      offerDetails: Array<{
        offerName: string
        code: string
        totalPrice: number
        offerId: string
        basePrice: number
        offerItems: any[]
      }>
      updatedOffersTotal: number
      affectsOffers: boolean
    },
  }),

  // ADDED — derived totals for Order Details & Checkout Modal
  getters: {
    // Items (before promos)
    originalItemsTotal: (s) =>
      s.validation
        ? Number(
            s.validation.menuItems
              .reduce((sum, it) => sum + Number(it.originalPrice) + Number(it.optionsPrice || 0), 0)
              .toFixed(2),
          )
        : 0,

    // Offers (before promos) = sum of basePrice in offerDetails
    originalOffersTotal: (s) =>
      s.validation?.offerDetails?.length
        ? Number(
            s.validation.offerDetails.reduce((sum, o) => sum + Number(o.basePrice || 0), 0).toFixed(2),
          )
        : 0,

    // Items after promos = sum of updatedPrice
    itemsAfterPromos: (s) =>
      s.validation
        ? Number(
            s.validation.menuItems.reduce((sum, it) => sum + Number(it.updatedPrice || 0), 0).toFixed(2),
          )
        : 0,

    // Offers after promos = backend aggregate updatedOffersTotal
    offersAfterPromos: (s) =>
      s.validation ? Number((s.validation.updatedOffersTotal || 0).toFixed(2)) : 0,

    deliveryFeeValidated: (s) =>
      s.validation ? Number((s.validation.deliveryFee || 0).toFixed(2)) : 0,

    // Cross-getter access must use method syntax + `this`
    originalTotal(): number {
      return Number((this.originalItemsTotal + this.originalOffersTotal).toFixed(2))
    },

    updatedTotalValidated(): number {
      return Number((this.itemsAfterPromos + this.offersAfterPromos + this.deliveryFeeValidated).toFixed(2))
    },

    totalDiscountValidated(): number {
      return Number((this.originalTotal - this.updatedTotalValidated).toFixed(2))
    },

    affectsOffers: (s): boolean => !!s.validation?.affectsOffers,
  },

  actions: {
    setOrderTotal(payload) {
      this.cartTotal = payload
    },
    setOrderFor(payload) {
      this.orderFor = payload
    },
    resetEditOrder() {
      this.editOrder = null
    },
    setCartItems(payload) {
      this.cartItems = payload
    },
    setDeliveryZone(payload) {
      this.deliveryZone = payload
    },
    setAddress(payload) {
      this.address = payload
    },
    setOrderNotes(payload) {         
      this.orderNotes = payload
    },
    setDeliveryNotes(v: string) { 
      this.deliveryNotes = v ?? "" 
    },
    setPaymentLink(payload) {
      this.redirectUrl = payload
    },
    addItemToCart(item: any) {
      this.cartItems.push(item)
    },
    offersAdded(item: any) {
      this.offerItems.push(item)
    },
    offersUpdated(item: any) {
      const itemIndex = item.index
      if (itemIndex !== -1) {
        this.offerItems[itemIndex] = item
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
    addEditOrder(item: any) {
      this.editOrder = item
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
    async validatePromoCode(payload) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/orders/validate-promo`, payload)
    },

    // ADDED — convenience: validate + persist response for UI usage
    async validatePromoAndSave(payload: any) {
      const res = await this.validatePromoCode(payload)
      if (res?.data?.success) {
        this.validation = res.data.data
      } else {
        this.validation = null
      }
      return res
    },
    // ADDED — manual control if you already have the response object
    setValidation(data: any) {
      this.validation = data
    },
    // ADDED — clear breakdown
    clearValidation() {
      this.validation = null
    },

    async checkPaymentStatus(orderId, paymentTypeId) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.put(`${url}/payments/verify/${orderId}?paymentTypeId=${paymentTypeId}`)
    },
    async createPayment({ orderId: orderId, paymentTypeId: paymentTypeId }) {
      const url = import.meta.env.VITE_API_BASE_URL
      const next = window.location.href

      return await axios.post(`${url}/payments/${orderId}?paymentTypeId=${paymentTypeId}`, { next })
    },
    async sendOrderToWinmax(orderId, orderFor) {
      const url = import.meta.env.VITE_API_BASE_URL
      return await axios.post(`${url}/winmax/winmax-orders/`, {
        id: orderId,
        orderFor: orderFor,
      })
    },
    async retryPayment(orderId) {
      const url = import.meta.env.VITE_API_BASE_URL
        const next = window.location.href

      return await axios.post(`${url}/payments/retry/${orderId}`, { next })
    },
  },
})

import { defineStore } from 'pinia'

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
    // calculateItemTotal(itemIndex: number) {
    //   const item = this.cartItems[itemIndex]

    //   let total = item.basePrice;
    //   let selectionTotal = 0;

    //   item.selectedOptions.forEach(group => {
    //     group.selected.forEach(selection => {
    //       total += selection.price * selection.quantity
    //       selectionTotal += selection.price * selection.quantity
    //     })
    //   })

    //   total = total * item.quantity

    //   this.cartItems[itemIndex].totalPrice = total
    //   this.cartItems[itemIndex].selectionTotalPrice = selectionTotal
    //   console.log('cartItems3', this.cartItems);
    // },

    calculateItemTotal(itemIndex: number) {
      const item = this.cartItems[itemIndex]

      let total = item.basePrice;
      let selectionTotal = 0;

      item.selectedOptions.forEach(group => {
        group.selected.forEach(selection => {
          total += selection.price * selection.quantity
          selectionTotal += selection.price * selection.quantity
        })
      })

      total = total * item.quantity

      // ✅ Replace the entire object
      this.cartItems[itemIndex] = {
        ...item,
        totalPrice: total,
        selectionTotalPrice: selectionTotal
      }
    }



  },
})

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userName: 'Anjali Arora',
      email: 'anjaliaarora@virtualEmployee.com',
      memberSince: '8/12/2020',
      pfp: 'https://picsum.photos/id/22/200/300',
      is2FAEnabled: false,
    }
  },

  actions: {
    toggle2FA() {
      this.is2FAEnabled = !this.is2FAEnabled
    },

    changeUserName(userName: string) {
      this.userName = userName
    },
  },
})

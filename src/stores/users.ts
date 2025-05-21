import { defineStore } from 'pinia'
import { addUser, getUser, deleteUser, getUsers, removeUser, updateUser, uploadAvatar } from '../data/pages/users'
import { User } from '../pages/users/types'

export const useUsersStore = defineStore('users', {
  state: () => {
    return {
      items: [] as User[],
      userDetails: null,
      pagination: { page: 1, perPage: 10, total: 0 },
    }
  },

  actions: {
    async getAll(payload) {
      return await getUsers(payload)
    },
    async getUser(payload) {
      return await getUser(payload)
    },
    async deleteUser(payload) {
      return await deleteUser(payload)
    },
    async add(user: User) {
      const [newUser] = await addUser(user)
      this.items.unshift(newUser)
      return newUser
    },

    async update(user: User) {
      const [updatedUser] = await updateUser(user)
      const index = this.items.findIndex(({ id }) => id === user.id)
      this.items.splice(index, 1, updatedUser)
      return updatedUser
    },

    async remove(user: User) {
      const isRemoved = await removeUser(user)

      if (isRemoved) {
        const index = this.items.findIndex(({ id }) => id === user.id)
        this.items.splice(index, 1)
      }
    },

    async setUserDetails(payload: any) {
      this.userDetails = payload
    },

    async uploadAvatar(formData: FormData) {
      return uploadAvatar(formData)
    },
  },
})

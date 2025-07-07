import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isSidebarMinimized: localStorage.getItem('isSidebarMinimized') === 'true',
    isSidebarManuallyToggled: localStorage.getItem('isSidebarManuallyToggled') === 'true',
  }),

  actions: {
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
      this.isSidebarManuallyToggled = true
      sessionStorage.setItem('isSidebarMinimized', this.isSidebarMinimized.toString())
    },
    setSidebar(value: boolean) {
      this.isSidebarMinimized = value
      this.isSidebarManuallyToggled = true
      sessionStorage.setItem('isSidebarMinimized', value.toString())
    },
    resetManualToggle() {
      this.isSidebarManuallyToggled = false
      sessionStorage.setItem('isSidebarMinimized', 'false')
    },
  },
})

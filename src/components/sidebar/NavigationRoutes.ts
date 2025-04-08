export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  visible: boolean
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      visible: true,
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'list',
      displayName: 'menu.companies',
      visible: true,
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'areas',
      visible: true,
      displayName: 'menu.areas',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'tables',
      displayName: 'menu.tables',
      visible: false,
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'categories',
      displayName: 'menu.categories',
      visible: true,
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'menuItems',
      displayName: 'menu.subCategories',
      visible: false,
      meta: {
        icon: 'group',
      },
    },
    // {
    //   name: 'services',
    //   displayName: 'menu.services',
    //   visible: false,
    //   meta: {
    //     icon: 'group',
    //   },
    // },
    // {
    //   name: 'orders',
    //   visible: true,
    //   displayName: 'menu.orders',
    //   meta: {
    //     icon: 'group',
    //   },
    // },
    // {
    //   name: 'configurations',
    //   visible: false,
    //   displayName: 'menu.configurations',
    //   meta: {
    //     icon: 'group',
    //   },
    // },
    {
      name: 'preferences',
      displayName: 'menu.preferences',
      meta: {
        icon: 'manage_accounts',
      },
    },
  ] as INavigationRoute[],
}

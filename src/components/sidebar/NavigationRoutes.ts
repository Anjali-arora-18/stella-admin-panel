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
      visible: false,
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
    {
      name: 'services',
      displayName: 'menu.services',
      visible: false,
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'orders',
      visible: true,
      displayName: 'menu.orders',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'configurations',
      visible: false,
      displayName: 'menu.configurations',
      meta: {
        icon: 'group',
      },
    },
    // {
    //   name: 'users',
    //   visible: true,
    //   displayName: 'menu.users',
    //   meta: {
    //     icon: 'group',
    //   },
    // },
    // {
    //   name: 'projects',
    //   displayName: 'menu.projects',
    //   meta: {
    //     icon: 'folder_shared',
    //   },
    // },
    // {
    //   name: 'payments',
    //   displayName: 'menu.payments',
    //   meta: {
    //     icon: 'credit_card',
    //   },
    //   children: [
    //     {
    //       name: 'payment-methods',
    //       displayName: 'menu.payment-methods',
    //     },
    //     {
    //       name: 'pricing-plans',
    //       displayName: 'menu.pricing-plans',
    //     },
    //     {
    //       name: 'billing',
    //       displayName: 'menu.billing',
    //     },
    //   ],
    // },
    // {
    //   name: 'auth',
    //   displayName: 'menu.auth',
    //   meta: {
    //     icon: 'login',
    //   },
    //   children: [
    //     {
    //       name: 'login',
    //       displayName: 'menu.login',
    //     },
    //     {
    //       name: 'signup',
    //       displayName: 'menu.signup',
    //     },
    //     {
    //       name: 'recover-password',
    //       displayName: 'menu.recover-password',
    //     },
    //   ],
    // },

    // {
    //   name: 'faq',
    //   displayName: 'menu.faq',
    //   meta: {
    //     icon: 'quiz',
    //   },
    // },
    // {
    //   name: '404',
    //   displayName: 'menu.404',
    //   meta: {
    //     icon: 'vuestic-iconset-files',
    //   },
    // },
    {
      name: 'preferences',
      displayName: 'menu.preferences',
      meta: {
        icon: 'manage_accounts',
      },
    },
    // {
    //   name: 'settings',
    //   displayName: 'menu.settings',
    //   meta: {
    //     icon: 'settings',
    //   },
    // },
  ] as INavigationRoute[],
}

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import axios from 'axios'
import RouteViewComponent from '../layouts/RouterBypass.vue'
const routes: Array<RouteRecordRaw> = [
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    redirect: { name: 'login' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'stellaUsers',
        path: 'stellaUsers',
        component: () => import('../pages/stellaUsers/index.vue'),
      },
      {
        name: 'areas',
        path: 'areas',
        component: () => import('../pages/areas/index.vue'),
      },
      {
        name: 'deletedArticles',
        path: 'deletedArticles',
        component: () => import('../pages/deletedArticles/index.vue'),
      },
      {
        name: 'payments',
        path: 'payments',
        component: () => import('../pages/payments/index.vue'),
      },
      {
        name: 'deliveryZone',
        path: 'deliveryZone',
        component: () => import('../pages/deliveryZone/index.vue'),
      },
      {
        name: 'organizeMenu',
        path: 'organizeMenu',
        component: () => import('../pages/organizeMenu.vue'),
      },
      {
        name: 'categories',
        path: 'categories',
        component: () => import('../pages/categories/index.vue'),
      },
      {
        name: 'articles',
        path: 'articles',
        component: () => import('../pages/articles/index.vue'),
      },
      {
        name: 'articlesOptions',
        path: 'articlesOptions',
        component: () => import('../pages/articlesOptions/index.vue'),
        children: [
          {
            name: 'articlesOptionsList',
            path: 'list',
            component: () => import('../pages/articlesOptionsList/index.vue'),
          },
          {
            name: 'articlesOptionsGroups',
            path: 'groups',
            component: () => import('../pages/articlesOptionsGroups/index.vue'),
          },
        ],
      },
      {
        name: 'preferences',
        path: 'preferences',
        component: () => import('../pages/preferences/Preferences.vue'),
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
      {
        name: 'allergens',
        path: 'allergens',
        component: () => import('../pages/allergens.vue'),
      },
      {
        name: 'callCenters',
        path: 'callCenters',
        component: () => import('../pages/callCenters/index.vue'),
      },
      // {
      //   name: 'companies',
      //   path: 'companies',
      //   component: () => import('../pages/companies/index.vue'),
      // },
      {
        name: 'outlets',
        path: 'outlets',
        children: [
          {
            name: 'list',
            path: 'list',
            component: () => import('../pages/service-zone/index.vue'),
          },
          {
            name: 'create-outlet',
            path: 'create',
            component: () => import('../pages/service-zone/form.vue'),
          },
          {
            name: 'update-outlet',
            path: 'update/:id?',
            component: () => import('../pages/service-zone/form.vue'),
          },
          {
            name: 'admin-update-outlet',
            path: 'admin/update/:id?',
            component: () => import('../pages/service-zone/form.vue'),
          },
        ],
      },

      {
        name: 'orders',
        path: 'orders',
        component: () => import('../pages/orders/index.vue'),
      },
      {
        name: 'users',
        path: 'users',
        component: () => import('../pages/users/UsersPage.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'logout',
        path: 'logout',
        beforeEnter: (to, from, next) => {
          window.sessionStorage.removeItem('selectedRest'), window.sessionStorage.removeItem('token')
          next('/auth/login')
        },
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/RecoverPassword.vue'),
      },
      {
        name: 'recover-password-email',
        path: 'recover-password-email',
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

const token = (config) => {
  config.headers.Authorization = 'Bearer ' + window.sessionStorage.getItem('token')
  return config
}

const activeInterceptor = ''

async function setToken() {
  if (!activeInterceptor) {
    const interceptorObj = axios.interceptors.request.use(token)
    window.sessionStorage.setItem('activeInterceptor', JSON.stringify(interceptorObj))
  }
}

async function removeToken() {
  axios.interceptors.request.eject(
    axios.interceptors.request.use(JSON.parse(window.sessionStorage.getItem('activeInterceptor'))),
  )
  window.sessionStorage.removeItem('activeInterceptor')
}

router.beforeEach((to, from, next) => {
  const homePage = 'dashboard'
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.sessionStorage.removeItem('token')
        router.push('/auth/login')
      }
      return Promise.reject(error)
    },
  )
  const userAlreadyLoggedIn: any = window.sessionStorage.getItem('token')
  if (to.name === '403' || to.name === '404') {
    next()
  }

  if (!userAlreadyLoggedIn) {
    removeToken()
    if (
      to.name !== 'login' &&
      to.name !== 'signup' &&
      to.name !== 'recover-password' &&
      to.name !== 'recover-password-email'
    ) {
      next('/auth/login')
    } else {
      next()
    }
  } else {
    setToken()
    if (to.name === 'login') {
      next(homePage)
    } else {
      next()
    }
  }
})
export default router

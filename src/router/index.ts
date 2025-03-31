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
        name: 'areas',
        path: 'areas',
        component: () => import('../pages/areas/index.vue'),
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
            name: 'create-table',
            path: 'create',
            component: () => import('../pages/tables/form.vue'),
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
          window.sessionStorage.removeItem('token')
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

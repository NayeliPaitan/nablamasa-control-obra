import type { RouteRecordRaw } from 'vue-router'
import AuthLayout from 'src/layouts/AuthLayout.vue'
import AppLayout from 'src/layouts/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('src/pages/LoginPage.vue') }
    ]
  },

  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/DashboardPage.vue') },
      { path: 'projects', component: () => import('src/pages/ProjectsPage.vue') },
      { path: 'projects/:id', component: () => import('src/pages/ProjectPage.vue') }
    ]
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
]

export default routes
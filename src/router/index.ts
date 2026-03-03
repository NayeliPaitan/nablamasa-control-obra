import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHashHistory
} from 'vue-router'
import routes from './routes'
import { supabase } from 'src/boot/supabase'

export default route(function () {
  const history = process.env.SERVER ? createMemoryHistory() : createWebHashHistory()

  const RouterInstance = createRouter({
    history,
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 })
  })

  RouterInstance.beforeEach(async (to) => {
    if (!to.meta.requiresAuth) return true
    const { data } = await supabase.auth.getSession()
    if (!data.session) return '/login'
    return true
  })

  return RouterInstance
})
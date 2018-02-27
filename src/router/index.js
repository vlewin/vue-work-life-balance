import Vue from "vue"
import Router from "vue-router"

import Index from "@/components/Index"
import Authentication from "@/components/Authentication"
import Callback from "@/components/Callback"
import Flex from "@/components/Flex"
import AuthService from "../main"

Vue.use(Router)

const router = new Router({
  mode: "history",
  routes: [
    { path: "/", name: "Index", component: Index, meta: { requiresAuth: true } },
    { path: "/login", name: "Authentication", component: Authentication, props: { initSection: "top" } },
    { path: "/logout", name: "Authentication", component: Authentication, props: { initSection: "bottom" } },
    { path: "/callback", name: "Callback", component: Callback },
    { path: "/playground", name: "Flex", component: Flex }
  ]
})

router.beforeEach((to, from, next) => {
  console.log("beforeEach", to, from)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (AuthService.isAuthenticated()) {
      console.log("Authenticated")
      next()
    } else {
      console.log("Not authenticated")
      next({ path: "/login" })
    }
  } else {
    // NOTE: Move to /callback handler
    // AuthService.handleAuthentication()
    next()
  }
})

export default router

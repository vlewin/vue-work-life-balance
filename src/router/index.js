import Vue from "vue"
import Router from "vue-router"

import Index from "@/components/Index"
import Authentication from "@/components/Authentication"
import Callback from "@/components/Callback"
import Flex from "@/components/Flex"
import CheatSheet from "@/components/CheatSheet"
import AuthService from "../main"
import Preview from "@/components/charts/Preview"
import Temp from "@/components/cards/Index"
import Circle from "@/components/cards/Circle"
import Arc from "@/components/cards/Arc"

// import CircleMenu from "@/components/cards/CircleMenu"

Vue.use(Router)

const router = new Router({
  mode: "history",
  routes: [
    { path: "/", name: "Index", component: Index, meta: { requiresAuth: true } },
    { path: "/login", name: "Authentication", component: Authentication, props: { initSection: "top" } },
    { path: "/logout", name: "Authentication", component: Authentication, props: { initSection: "bottom" } },
    { path: "/callback", name: "Callback", component: Callback },
    { path: "/help", name: "Help", component: CheatSheet },
    { path: "/playground", name: "Flex", component: Flex },
    { path: "/preview", name: "Preview", component: Preview },
    { path: "/temp", name: "Preview", component: Temp },
    { path: "/circle", name: "Arc", component: Circle },
    { path: "/arc", name: "Arc", component: Arc },

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
    console.log("??? Unknown route", to)
    // FIXME:  Workaround for vue-router hash mode
    // if (window.location.href.includes("access_token")) {
    //   AuthService.handleAuthentication()
    // }
    next()
  }
})

export default router

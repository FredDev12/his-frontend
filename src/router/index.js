import { createRouter, createWebHistory } from "vue-router"

import Login from "../pages/auth/Login.vue"
import Dashboard from "../pages/dashboard/Dashboard.vue"
import ReceptionPatient from "../pages/reception/ReceptionPatient.vue"
import ReceptionFichesList from "../pages/reception/ReceptionFichesList.vue"
import ReceptionFicheDetail from "../pages/reception/ReceptionFicheDetail.vue"


import AuthLayout from "../layouts/AuthLayout.vue"
import DashboardLayout from "../layouts/DashboardLayout.vue"

import { isAuthenticated } from "../utilis/auth"

const routes = [

{
path: "/login",
component: AuthLayout,
meta:{ public:true },
children:[
    {
    path: "",
    component: Login
    }
]
},

{
    path: "/",
    component: DashboardLayout,
    meta:{ requiresAuth:true },
    children:[
        {
            path: "",
            component: Dashboard
        },
        {
            path: "/reception",
            component: ReceptionPatient
        },
        {
            path: "/reception/fiches",
            name: "reception.fiches.list",
            component: ReceptionFichesList
        },
        {
            path: "/reception/fiches/:id",
            name: "reception.fiches.detail",
            component: ReceptionFicheDetail,
            props: true
        }
    ]
},

]

const router = createRouter({
history: createWebHistory(),
routes
})

/*
AUTH GUARD GLOBAL
*/

router.beforeEach((to, from, next) => {

const authenticated = isAuthenticated()

// route publique
if(to.meta.public){
return next()
}

// route protégée
if(to.path === "/login" && authenticated){
return next("/")
}

if(to.meta.requiresAuth && !authenticated){
return next("/login")
}

next()

})

export default router

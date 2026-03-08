import { createRouter, createWebHistory } from "vue-router"

import Login from "../pages/auth/Login.vue"
import Dashboard from "../pages/dashboard/Dashboard.vue"
import ReceptionPatient from "../pages/reception/ReceptionPatient.vue"
import FichesList from "../pages/fiches/FichesList.vue"
import FicheDetail from "../pages/fiches/FicheDetail.vue"
import Profile from "../pages/profile/Profile.vue"

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
    meta:{ requiresAuth:true, breadcrumb:"Tableau de bord" },
    children:[
        {
            path: "",
            component: Dashboard,
            meta:{ breadcrumb:"Accueil" }
            
        },
        {
            path: "/reception",
            component: ReceptionPatient,
            meta:{ breadcrumb:"Réception" }
        },
        {
            path: "/fiches",
            name: "fiches.list",
            component: FichesList,
            meta:{ breadcrumb:"Fiches de patient" }
        },
        {
            path: "/fiches/:id",
            name: "fiches.detail",
            component: FicheDetail,
            props: true,
            meta:{ breadcrumb:"Détail de la fiche" }
        },
        {
        path: "/profile",
        name: "profile",
        component: Profile,
        meta:{ breadcrumb:"Profil" }
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

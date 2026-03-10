import { createRouter, createWebHistory } from "vue-router"

const Login = () => import("../pages/auth/Login.vue")
const Dashboard = () => import("../pages/dashboard/Dashboard.vue")
const ReceptionPatient = () => import("../pages/reception/ReceptionPatient.vue")
const FichesList = () => import("../pages/fiches/FichesList.vue")
const FicheDetail = () => import("../pages/fiches/FicheDetail.vue")
const Profile = () => import("../pages/profile/Profile.vue")
const FichePrint = () => import("../pages/fiches/FichePrint.vue")

const AuthLayout = () => import("../layouts/AuthLayout.vue")
const DashboardLayout = () => import("../layouts/DashboardLayout.vue")

import { isAuthenticated } from "../utils/auth"


const routes = [
  {
    path: "/login",
    component: AuthLayout,
    meta: { public: true },
    children: [
      {
        path: "",
        component: Login,
        meta: { breadcrumb: "Connexion" }
      }
    ]
  },
  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true, breadcrumb: "Tableau de bord" },
    children: [
      {
        path: "",
        component: Dashboard,
        meta: { breadcrumb: "Accueil" }
      },
      {
        path: "reception",
        component: ReceptionPatient,
        meta: { breadcrumb: "Réception" }
      },
      {
        path: "fiches",
        name: "fiches.list",
        component: FichesList,
        meta: { breadcrumb: "Fiches de patient" }
      },
      {
        path: "fiches/:id",
        name: "fiches.detail",
        component: FicheDetail,
        props: true,
        meta: { breadcrumb: "Détail de la fiche" }
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
        meta: { breadcrumb: "Profil" }
      },
      {
        path: "fiches/print/:id",
        name: "fiches.print",
        component: FichePrint,
        props: true,
        meta: { breadcrumb: "Impression fiche" }
      }
    ]
  },
  // Redirection pour toutes les routes non trouvées
  {
    path: "/:pathMatch(.*)*",
    redirect: to => {
      // Si l'utilisateur n'est pas authentifié, rediriger vers login
      if (!isAuthenticated()) {
        return "/login"
      }
      // Sinon, rediriger vers dashboard
      return "/"
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/*
AUTH GUARD GLOBAL AMÉLIORÉ
*/

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  
  // Log pour debug (à retirer en production)
  //console.log(`Navigation vers ${to.path} - Authentifié: ${authenticated}`)

  // CAS 1: Route publique (login, etc.)
  if (to.meta.public) {
    // Si l'utilisateur est déjà authentifié et essaie d'aller sur login
    if (to.path === "/login" && authenticated) {
      console.log("Déjà authentifié, redirection vers dashboard")
      return next("/")
    }
    // Sinon, on autorise l'accès à la page publique
    return next()
  }

  // CAS 2: Route protégée nécessitant authentification
  if (to.meta.requiresAuth) {
    if (!authenticated) {
      console.log("Non authentifié, redirection vers login")
      
      return next({
        path: "/login",
        query: { redirect: to.fullPath }
      })
    }
    // Utilisateur authentifié, on continue
    return next()
  }

  // CAS 3: Routes sans meta (par défaut, on vérifie l'auth)
  if (!authenticated) {
    console.log("Route non marquée mais non authentifié, redirection vers login")
    return next("/login")
  }

  // Tout est OK
  next()
})

// Gestion des erreurs de navigation
router.onError((error) => {
  console.error("Erreur de navigation:", error)
})


export default router
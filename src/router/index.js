import { createRouter, createWebHistory } from "vue-router"
import { isAuthenticated } from "../utils/auth"
import { useAuthStore } from "../stores/auth.store"

/* Layouts */
const AuthLayout = () => import("../layouts/AuthLayout.vue")
const DashboardLayout = () => import("../layouts/DashboardLayout.vue")

/* Pages */
const Login = () => import("../pages/auth/Login.vue")
const Dashboard = () => import("../pages/dashboard/Dashboard.vue")
const FichesList = () => import("../pages/fiches/FichesList.vue")
const FicheDetail = () => import("../pages/fiches/FicheDetail.vue")
const FichePrint = () => import("../pages/fiches/FichePrint.vue")
const Profile = () => import("../pages/profile/Profile.vue")

/* Modules */
const TriageList = () => import("../modules/triage/pages/triageListPage.vue")
const TriageDetailPage = () => import("../modules/triage/pages/triageDetailPage.vue")
const ConsultationList = () => import("../modules/consultation/pages/ConsultationListPage.vue")


// RECEPTION

const receptionPage = () => import("../modules/reception/pages/ReceptionPage.vue")

const AdminPage = () => import("../modules/admin/pages/AdminListPage.vue")
const UsersDetailPage = () => import("../modules/admin/pages/UserDetail.vue")
const UsersCreatePage = () => import("../modules/admin/pages/UserCreatePage.vue")


/* =========================
   Routes
========================= */
const routes = [
  // Auth
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

  // Dashboard + routes protégées
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

      // Réception
      {
        path: "reception",
        name: "Reception",
        component: receptionPage,
        meta: { breadcrumb: "Réception", roles: ["admin", "secretaire"] }
      },

      // Admin
      {
        path: "users",
        name: "UsersList",
        component: AdminPage,
        meta: { breadcrumb: "Admin", roles: ["admin"] }
      },

      {
        path: "/users/:id",
        name: "UsersDetail",
        component: UsersDetailPage,
        meta: {breadcrumb: "Details User", roles: ["admin"]}
      },

      {
        path: "/users/create",
        name: "UsersCreate",
        component: UsersCreatePage,
        meta: {breadcrumb:"Create User", roles: ["admin"]}
      },

      // Agents
      {
        path: "agents/:id",
        name: "AgentDetail",
        component: () => import("../modules/reception/components/agents/pages/AgentDetailPage.vue"),
        props: true
      },

      // Persons (ordre : create avant detail)
      {
        path: "persons/create",
        name: "PersonCreate",
        component: () => import("../modules/persons/pages/PersonCreatePage.vue")
      },
      {
        path: "persons/:id",
        name: "PersonDetail",
        component: () => import("../modules/persons/pages/PersonDetailPage.vue"),
        props: true
      },

      // Fiches
      {
        path: "fiches",
        name: "FichesList",
        component: FichesList,
        meta: { breadcrumb: "Fiches de patient", roles: ["admin", "medecin", "secretaire"] }
      },
      {
        path: "fiches/:id",
        name: "FicheDetail",
        component: FicheDetail,
        props: true,
        meta: { breadcrumb: "Détail de la fiche" }
      },
      {
        path: "fiches/print/:id",
        name: "FichePrint",
        component: FichePrint,
        props: true,
        meta: { breadcrumb: "Impression fiche" }
      },

      // Triage
      {
        path: "triage",
        name: "TriageList",
        component: TriageList,
        meta: { breadcrumb: "Triage", roles: ["admin", "secretaire"] }
      },
      {
        path: "triage/:id",
        name: "TriageDetail",
        component: TriageDetailPage,
        meta: { breadcrumb: "Triage", roles: ["admin", "secretaire"] }
      },

      // Consultation
      {
        path: "consultation",
        name: "ConsultationList",
        component: ConsultationList,
        meta: { breadcrumb: "Consultation", roles: ["admin", "medecin"] }
      },
      {
        path: "consultation/create",
        name: "ConsultationCreate",
        component: () => import("../modules/consultation/pages/ConsultationFormPage.vue"),
        meta: { breadcrumb: "Nouvelle Consultation", roles: ["admin", "medecin"] }
      },
      {
        path: "consultation/:id",
        name: "ConsultationDetail",
        component: () => import("../modules/consultation/pages/ConsultationDetailPage.vue"),
        meta: { breadcrumb: "Détail Consultation", roles: ["admin", "medecin"] }
      },
      {
        path: "consultation/:id/edit",
        name: "ConsultationEdit",
        component: () => import("../modules/consultation/pages/ConsultationFormPage.vue"),
        meta: { breadcrumb: "Modifier Consultation", roles: ["admin", "medecin"] }
      },
      {
        path: "/unauthorized",
        component: () => import("../pages/Unauthorized.vue"),
        meta: { public: true }
      },

      // Profile
      {
        path: "profile",
        name: "Profile",
        component: Profile,
        meta: { breadcrumb: "Profil", roles: ["admin", "medecin", "secretaire", "patient"] }
      }
    ]
  },

  // 404 - fallback
  {
    path: "/:pathMatch(.*)*",
    redirect: () => {
      return isAuthenticated() ? "/" : "/login"
    }
  }
]

/* =========================
   Router
========================= */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/* =========================
   Auth Guard
========================= */
router.beforeEach((to) => {
  const authenticated = isAuthenticated()
  const authStore = useAuthStore()
  const userRole = authStore.user?.role

  // Routes publiques
  if (to.meta.public) {
    return (to.path === "/login" && authenticated) ? "/" : true
  }

  // Routes protégées
  if (to.meta.requiresAuth && !authenticated) {
    return { path: "/login", query: { redirect: to.fullPath } }
  }

  // Fallback sécurité
  if (to.meta.roles){
    if (userRole === "admin") return true

    if (!to.meta.roles.includes(userRole)){
      return "/unauthorized"
    }
  }

  return true
})

/* =========================
   Error handler
========================= */
router.onError((error) => {
  console.error("Erreur de navigation:", error)
})

export default router
/**
 * Caisse module routes
 */

export const caisseRoutes = [
  {
    path: 'caisse',
    name: 'caisse',
    children: [
      {
        path: '',
        name: 'caissePage',
        component: () => import('@/modules/caisse/pages/CaissePage.vue'),
      },
      {
        path: 'history',
        name: 'paymentHistory',
        component: () => import('@/modules/caisse/pages/PaymentHistoryPage.vue'),
      },
    ],
  },
]

/**
 * Reception module routes
 */

export const receptionRoutes = [
  {
    path: 'reception',
    name: 'reception',
    children: [
      {
        path: '',
        name: 'receptionPage',
        component: () => import('@/modules/reception/pages/ReceptionPage.vue'),
      },
      {
        path: 'create',
        name: 'receptionCreate',
        component: () => import('@/modules/reception/pages/ReceptionCreatePage.vue'),
      },
      {
        path: 'list',
        name: 'receptionList',
        component: () => import('@/modules/reception/pages/ReceptionListPage.vue'),
      },
    ],
  },
]

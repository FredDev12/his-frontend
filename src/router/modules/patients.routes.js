/**
 * Patients module routes
 */

export const patientsRoutes = [
  {
    path: 'patients',
    name: 'patients',
    children: [
      {
        path: 'list',
        name: 'patientsList',
        component: () => import('@/modules/patients/pages/PatientListPage.vue'),
      },
      {
        path: 'create',
        name: 'patientCreate',
        component: () => import('@/modules/patients/pages/PatientCreatePage.vue'),
      },
      {
        path: ':id',
        name: 'patientDetails',
        component: () => import('@/modules/patients/pages/PatientDetailsPage.vue'),
      },
    ],
  },
]

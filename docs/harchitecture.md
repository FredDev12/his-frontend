src/
│
├── api/
│
│   ├── agents.api.js
│   ├── patients.api.js
│   ├── reception.api.js
│   └── caisse.api.js
│
├── modules/
│
│   ├── agents/
│   │   ├── pages/
│   │   │   └── AgentSearchPage.vue
│   │   │
│   │   ├── components/
│   │   │   ├── AgentSearchBar.vue
│   │   │   ├── AgentCard.vue
│   │   │   └── AgentList.vue
│   │   │
│   │   ├── stores/
│   │   │
│   │   │   └── agents.store.js
│   │   │
│   │   ├── composables/
│   │   │   └── useAgents.js
│   │   │
│   │   ├── services/
│   │   │   └── agentSearch.service.js
│   │   │
│   │   └── types/
│   │       └── agent.js
│
│
│   ├── patients/
│   │   ├── pages/
│   │   │   ├── PatientListPage.vue
│   │   │   ├── PatientCreatePage.vue
│   │   │   └── PatientDetailsPage.vue
│   │   │
│   │   ├── components/
│   │   │   ├── PatientForm.vue
│   │   │   ├── PatientCard.vue
│   │   │   ├── PatientList.vue
│   │   │   └── PatientSearchBar.vue
│   │   │
│   │   ├── composables/
│   │   │   └── usePatients.js
│   │   │
│   │   ├── stores/
│   │   │   └── patientsStore.js
│   │   │
│   │   └── types/
│   │       └── patient.js
│
│
│   ├── reception/
│   │   ├── pages/
│   │   │   ├── ReceptionPage.vue
│   │   │   ├── ReceptionCreatePage.vue
│   │   │   └── ReceptionListPage.vue
│   │   │
│   │   ├── components/
│   │   │   ├── ReceptionForm.vue
│   │   │   ├── ReceptionCard.vue
│   │   │   ├── ReceptionTable.vue
│   │   │   └── PatientSelector.vue
│   │   │
│   │   ├── composables/
│   │   │   └── useReceptions.js
│   │   │
│   │   ├── stores/
│   │   │   └── receptionsStore.js
│   │   │
│   │   └── types/
│   │       └── reception.js
│
│
│   ├── caisse/
│   │   ├── pages/
│   │   │   ├── CaissePage.vue
│   │   │   └── PaymentHistoryPage.vue
│   │   │
│   │   ├── components/
│   │   │   ├── PaymentForm.vue
│   │   │   ├── PaymentCard.vue
│   │   │   ├── PaymentTable.vue
│   │   │   └── ReceiptPreview.vue
│   │   │
│   │   ├── composables/
│   │   │   └── useCaisse.js
│   │   │
│   │   ├── stores/
│   │   │   └── caisseStore.js
│   │   │
│   │   └── types/
│   │       └── paiement.js
│
│
├── shared/
│   ├── components/
│   │   ├── SearchInput.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   └── StatusBadge.vue
│   │
│   └── utils/
│       └── formatters.js
│
└── router/
    └── modules/
        ├── agents.routes.js
        ├── patients.routes.js
        ├── reception.routes.js
        └── caisse.routes.js
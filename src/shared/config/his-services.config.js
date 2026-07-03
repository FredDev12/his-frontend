export const hisServices = [
  {
    key: "reception",
    label: "Réception",
    route: "/receptions",
    permission: "reception:read",
    workflowOrder: 1,
    description: "Accueil, création fiche patient et ouverture épisode."
  },
  {
    key: "triage",
    label: "Triage",
    route: "/triage",
    permission: "triage:read",
    workflowOrder: 2,
    description: "Constantes, priorité clinique et orientation."
  },
  {
    key: "consultation",
    label: "Consultation",
    route: "/consultations",
    permission: "consultation:read",
    workflowOrder: 3,
    description: "Diagnostic, décision médicale et plan de prise en charge."
  },
  {
    key: "examens",
    label: "Examens",
    route: "/examens",
    permission: "examen:read",
    workflowOrder: 4,
    description: "Demandes et résultats laboratoire/imagerie."
  },
  {
    key: "prescriptions",
    label: "Prescriptions",
    route: "/prescriptions",
    permission: "prescription:read",
    workflowOrder: 5,
    description: "Ordonnances et lignes de traitement."
  },
  {
    key: "pharmacie",
    label: "Pharmacie",
    route: "/pharmacie",
    permission: "pharmacie:read",
    workflowOrder: 6,
    description: "Dispensation et validation médicaments."
  },
  {
    key: "facturation",
    label: "Facturation",
    route: "/facturation",
    permission: "facture:read",
    workflowOrder: 7,
    description: "Factures, montants et statuts."
  },
  {
    key: "caisse",
    label: "Caisse",
    route: "/caisse",
    permission: "paiement:read",
    workflowOrder: 8,
    description: "Paiements, reçus et validation financière."
  },
  {
    key: "hospitalisation",
    label: "Hospitalisation",
    route: "/hospitalisations",
    permission: "hospitalisation:read",
    workflowOrder: 9,
    description: "Admission, lit, suivi et clôture hospitalisation."
  },
  {
    key: "sortie",
    label: "Sortie",
    route: "/sorties",
    permission: "sortie:read",
    workflowOrder: 10,
    description: "Validation sortie patient et clôture épisode."
  },
  {
    key: "patients",
    label: "Dossier patient",
    route: "/patients",
    permission: "patient:read",
    workflowOrder: 11,
    description: "Vue complète patient, épisodes et timeline."
  },
  {
    key: "audit",
    label: "Audit",
    route: "/audit",
    permission: "audit:read",
    workflowOrder: 12,
    description: "Traçabilité métier et technique."
  }
];

export function getHisServiceByKey(key) {
  return hisServices.find((service) => service.key === key) ?? null;
}

export function getHisServiceByRoute(path) {
  return hisServices.find((service) => path.startsWith(service.route)) ?? null;
}

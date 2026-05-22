# HIS CAC — Formats payload send/receive

## Règle globale

`numero_patient` identifie la personne.

`numero_fiche` identifie le passage, la fiche, l’épisode ou le dossier courant.

Dans le workflow inter-services, le champ principal est toujours :

```json
{
  "numero_fiche": "FIC-000120"
}
```

Le champ `numero_patient` reste présent pour affichage, recherche et contexte, mais il ne doit pas remplacer `numero_fiche`.

---

## Format standard réponse succès

```json
{
  "message": "Opération réussie",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "requestId": "REQ-2026-000001"
}
```

Pour une réponse détail :

```json
{
  "message": "Ressource récupérée avec succès",
  "data": {},
  "requestId": "REQ-2026-000001"
}
```

---

## Format standard erreur

```json
{
  "message": "Validation échouée",
  "error": "numero_fiche est obligatoire",
  "statusCode": 400,
  "requestId": "REQ-2026-000001"
}
```

---

# 1. Patients

## POST /api/patients — send

### Patient public

```json
{
  "numero_fiche": "FIC-000120",
  "identification_patient": {
    "numero_patient": "",
    "nom": "KABAMBA",
    "postnom": "",
    "prenom": "Jean",
    "sexe": "M",
    "date_naissance": "1990-05-12",
    "age": 36,
    "telephone": "0990000000",
    "adresse": "Lubumbashi",
    "personne_contacter": "KABAMBA Marie",
    "telephone_urgence": "0991111111",
    "etat_civil": "Marié",
    "contact_urgence": {
      "nom": "KABAMBA Marie",
      "lien": "Conjoint(e)",
      "telephone": "0991111111"
    }
  },
  "paiement_fiche": {
    "montant_fiche": 5000,
    "paiement_effectue": true,
    "mode_paiement": "CASH",
    "facture_numero": "N/A",
    "recu_numero": "N/A",
    "date_paiement": "2026-05-22",
    "exonere": false,
    "motif_exoneration": ""
  },
  "agent_cac": {},
  "type_relation": "PUBLIC",
  "status": "active"
}
```

### Agent CAC / conjoint / enfant

```json
{
  "numero_fiche": "FIC-000121",
  "identification_patient": {
    "numero_patient": "",
    "nom": "MAZENGANA",
    "postnom": "MBIYAVANGA",
    "prenom": "ELISE",
    "sexe": "F",
    "date_naissance": "1988-03-29",
    "age": 38,
    "telephone": "(+243) 99 68 51 343",
    "adresse": "21, Av Des Cypres",
    "personne_contacter": "BULABA MPIANA ELIE",
    "telephone_urgence": "(+243) 99 68 51 343",
    "etat_civil": "Marié",
    "contact_urgence": {
      "nom": "BULABA MPIANA ELIE",
      "lien": "Conjoint(e)",
      "telephone": "(+243) 99 68 51 343"
    }
  },
  "paiement_fiche": {
    "montant_fiche": 0,
    "paiement_effectue": true,
    "mode_paiement": "AGENT_CAC",
    "facture_numero": "AGENT-CAC",
    "recu_numero": "AGENT-CAC",
    "date_paiement": "2026-05-22",
    "exonere": true,
    "motif_exoneration": "BENEFICIAIRE_AGENT_CAC"
  },
  "agent_cac": {
    "agent_cac_id": "CA0014S",
    "relation_to_agent": "SELF",
    "beneficiary_name": "MAZENGANA MBIYAVANGA ELISE",
    "is_agent_beneficiary": true,
    "frais_exoneres": true
  },
  "type_relation": "SELF",
  "status": "active"
}
```

## POST /api/patients — receive

```json
{
  "message": "Patient créé avec succès",
  "data": {
    "id": 1,
    "numero_patient": "PAT-000012",
    "numero_fiche": "FIC-000120",
    "nom": "KABAMBA",
    "postnom": "",
    "prenom": "Jean",
    "sexe": "M",
    "telephone": "0990000000",
    "statut": "active",
    "agent_cac": {}
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 2. Fiche patient

## GET /api/patients/fiche/{numeroFiche} — receive

```json
{
  "message": "Fiche récupérée avec succès",
  "data": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "patient_id": 1,
    "patient": {
      "nom": "KABAMBA",
      "postnom": "",
      "prenom": "Jean",
      "sexe": "M",
      "age": 36,
      "telephone": "0990000000"
    },
    "statut": "active",
    "date_ouverture": "2026-05-22T09:00:00.000Z",
    "service": "Réception"
  },
  "requestId": "REQ-2026-000001"
}
```

## GET /api/fiches/{numeroFiche}/timeline — receive

```json
{
  "message": "Timeline fiche récupérée",
  "data": {
    "fiche": {
      "numero_fiche": "FIC-000120",
      "numero_patient": "PAT-000012",
      "patient_id": 1,
      "statut": "active"
    },
    "events": [
      {
        "module": "receptions",
        "action": "RECEPTION_CREATED",
        "entityId": 12,
        "createdAt": "2026-05-22T09:00:00.000Z"
      },
      {
        "module": "triage",
        "action": "TRIAGE_CREATED",
        "entityId": 8,
        "createdAt": "2026-05-22T09:20:00.000Z"
      }
    ]
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 3. Réception

## POST /api/receptions — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "type_passage": "NEW",
  "service_entree": "Médecine interne",
  "motif": "Fièvre et céphalées",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "patient_id": 1,
    "nom": "KABAMBA",
    "postnom": "",
    "prenom": "Jean",
    "sexe": "M",
    "age": 36,
    "telephone": "0990000000",
    "statut": "active",
    "service": "Réception"
  },
  "paiement_fiche": {
    "montant_fiche": 5000,
    "paiement_effectue": true,
    "mode_paiement": "CASH"
  }
}
```

## receive

```json
{
  "message": "Réception créée avec succès",
  "data": {
    "id": 10,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "type_passage": "NEW",
    "service_entree": "Médecine interne",
    "paiement_effectue": true,
    "statut": "created",
    "created_at": "2026-05-22T09:00:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

## POST /api/receptions/{id}/payment — send

```json
{
  "numero_fiche": "FIC-000120",
  "montant": 5000,
  "devise": "CDF",
  "mode_paiement": "CASH",
  "reference": "RECU-0001"
}
```

---

# 4. Rendez-vous

Module actuellement localStorage, futur backend.

## send

```json
{
  "id": 1,
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "patient": "KABAMBA Jean",
  "service": "Médecine interne",
  "medecin": "Dr Exemple",
  "date_rdv": "2026-05-22",
  "heure_rdv": "10:30",
  "motif": "Contrôle",
  "statut": "pending",
  "created_at": "2026-05-22T09:00:00.000Z",
  "updated_at": "2026-05-22T09:00:00.000Z"
}
```

## receive localStorage

```json
{
  "message": "Rendez-vous enregistré localement",
  "data": {
    "id": 1,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "statut": "pending"
  }
}
```

---

# 5. Triage

## POST /api/triage — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "type_passage": "NEW",
  "service_entree": "Médecine interne",
  "priorite": "URGENT",
  "signes_vitaux": {
    "temperature": 37.8,
    "tension_arterielle": "120/80",
    "frequence_cardiaque": 88,
    "frequence_respiratoire": 18,
    "spO2": 98,
    "poids": 70,
    "taille": 175,
    "imc": 22.8
  },
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "patient_id": 1,
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## receive

```json
{
  "message": "Triage créé avec succès",
  "data": {
    "id": 8,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "priorite": "URGENT",
    "type_passage": "NEW",
    "statut": "created",
    "created_at": "2026-05-22T09:20:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 6. Consultation

## POST /api/consultations — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "plaintes": "Fièvre, céphalées, fatigue",
  "anamnese": {
    "histoire_maladie": "Symptômes depuis 3 jours",
    "antecedents": "Aucun antécédent majeur connu"
  },
  "examen_clinique": {
    "etat_general": "Stable",
    "constantes": "Voir triage",
    "observations": "Patient conscient, orienté"
  },
  "diagnostic": {
    "hypotheses_diagnostiques": "Paludisme, infection virale, typhoïde",
    "diagnostic_retenu": "Paludisme simple à Plasmodium falciparum",
    "gravite": {
      "legere": true,
      "moderee": false,
      "grave": false
    }
  },
  "plan_prise_en_charge": {
    "traitement": "ACT selon protocole",
    "examens_demandes": ["Goutte épaisse"],
    "orientation": "Ambulatoire"
  },
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## receive

```json
{
  "message": "Consultation créée avec succès",
  "data": {
    "id": 22,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "diagnostic": {
      "diagnostic_retenu": "Paludisme simple à Plasmodium falciparum"
    },
    "created_at": "2026-05-22T09:40:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 7. Laboratoire

## POST /api/laboratoire — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "prescripteur": "Dr Exemple",
  "examens": [
    {
      "examen": "Goutte épaisse",
      "date": "2026-05-22",
      "resultat": "",
      "valide": false,
      "prix_service_code": "LAB-GE"
    }
  ],
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## receive

```json
{
  "message": "Demande laboratoire créée avec succès",
  "data": {
    "id": 31,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "examens": [
      {
        "examen": "Goutte épaisse",
        "valide": false
      }
    ],
    "created_at": "2026-05-22T10:00:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 8. Imagerie

## POST /api/imagerie — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "prescripteur": "Dr Exemple",
  "examens": [
    {
      "examen": "Échographie abdominale",
      "date": "2026-05-22",
      "conclusion": "",
      "prix_service_code": "IMG-ECHO"
    }
  ],
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## receive

```json
{
  "message": "Demande imagerie créée avec succès",
  "data": {
    "id": 18,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "examens": [
      {
        "examen": "Échographie abdominale",
        "conclusion": ""
      }
    ],
    "created_at": "2026-05-22T10:05:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 9. Pharmacie / prescriptions

## POST /api/pharmacie — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "prescripteur": "Dr Exemple",
  "pharmacien": "",
  "medicaments": [
    {
      "medicament": "Paracétamol 500mg",
      "forme": "Comprimé",
      "quantite": 10,
      "posologie": "1 comprimé 3 fois par jour",
      "lot": "",
      "delivre": false,
      "prix_service_code": "PHAR-PROD"
    }
  ],
  "statut": "draft",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## PATCH /api/pharmacie/{id} — délivrance send

```json
{
  "numero_fiche": "FIC-000120",
  "statut": "delivered",
  "pharmacien": "Pharmacien de garde",
  "medicaments": [
    {
      "medicament": "Paracétamol 500mg",
      "forme": "Comprimé",
      "quantite": 10,
      "lot": "LOT-001",
      "delivre": true
    }
  ]
}
```

## receive

```json
{
  "message": "Prescription pharmacie enregistrée",
  "data": {
    "id": 44,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "statut": "draft",
    "medicaments": []
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 10. Stock pharmacie

Module actuellement localStorage, futur backend.

## Produit stock — send

```json
{
  "code": "PARA-500",
  "nom": "Paracétamol 500mg",
  "categorie": "Antalgique",
  "forme": "Comprimé",
  "quantite": 100,
  "seuil_alerte": 20,
  "prix_unitaire": 500,
  "devise": "CDF",
  "statut": "active",
  "created_at": "2026-05-22T09:00:00.000Z",
  "updated_at": "2026-05-22T09:00:00.000Z"
}
```

## Mouvement stock — send

```json
{
  "product_id": 1,
  "type": "OUT",
  "quantity": 10,
  "reason": "Délivrance prescription",
  "numero_fiche": "FIC-000120",
  "reference": "PHARMACIE-44",
  "created_at": "2026-05-22T10:20:00.000Z"
}
```

## receive localStorage

```json
{
  "message": "Mouvement stock enregistré",
  "data": {
    "product_id": 1,
    "type": "OUT",
    "quantity": 10,
    "stock_after": 90
  }
}
```

---

# 11. Caisse / paiements

## POST /api/paiements — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "montant": 15000,
  "devise": "CDF",
  "mode_paiement": "CASH",
  "reference": "PAY-0001",
  "motif": "Consultation générale",
  "statut": "draft",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## PATCH /api/paiements/{id} — valider send

```json
{
  "numero_fiche": "FIC-000120",
  "statut": "validated",
  "validated_at": "2026-05-22T10:30:00.000Z"
}
```

## PATCH /api/paiements/{id} — annuler send

```json
{
  "numero_fiche": "FIC-000120",
  "statut": "cancelled",
  "cancelled_at": "2026-05-22T10:40:00.000Z",
  "motif_annulation": "Erreur de saisie"
}
```

## receive

```json
{
  "message": "Paiement enregistré",
  "data": {
    "id": 51,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "montant": 15000,
    "devise": "CDF",
    "mode_paiement": "CASH",
    "statut": "draft"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 12. Facturation

Module actuellement localStorage, futur backend.

## Facture — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "numero_facture": "FAC-0001",
  "client": {
    "type": "PP",
    "name": "KABAMBA Jean",
    "contact": "0990000000",
    "address": "Lubumbashi"
  },
  "lignes": [
    {
      "service_id": 3,
      "code": "CONS-GEN",
      "libelle": "Consultation générale",
      "quantite": 1,
      "prix_unitaire": 15000,
      "remise": 0,
      "total": 15000
    }
  ],
  "sous_total": 15000,
  "remise": 0,
  "taxe": 0,
  "total": 15000,
  "devise": "CDF",
  "statut": "draft",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## Émettre facture — local send

```json
{
  "id": 1,
  "numero_fiche": "FIC-000120",
  "statut": "issued",
  "issued_at": "2026-05-22T10:45:00.000Z"
}
```

## Marquer payée — local send

```json
{
  "id": 1,
  "numero_fiche": "FIC-000120",
  "statut": "paid",
  "paid_at": "2026-05-22T10:50:00.000Z"
}
```

## Annuler facture — local send

```json
{
  "id": 1,
  "numero_fiche": "FIC-000120",
  "statut": "cancelled",
  "cancelled_at": "2026-05-22T10:55:00.000Z",
  "motif_annulation": "Erreur de facturation"
}
```

---

# 13. Sortie patient

## POST /api/sorties — send

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "diagnostic_final": "Paludisme simple",
  "traitement_sortie": "ACT selon protocole",
  "instructions": "Repos, hydratation, contrôle dans 7 jours",
  "date_sortie": "2026-05-22",
  "signature_responsable": "Dr Exemple",
  "statut": "draft",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

## PATCH /api/sorties/{id} — valider send

```json
{
  "numero_fiche": "FIC-000120",
  "statut": "validated",
  "validated_at": "2026-05-22T11:00:00.000Z"
}
```

## PATCH /api/sorties/{id} — annuler send

```json
{
  "numero_fiche": "FIC-000120",
  "statut": "cancelled",
  "cancelled_at": "2026-05-22T11:10:00.000Z",
  "motif_annulation": "Sortie reportée"
}
```

## receive

```json
{
  "message": "Sortie patient enregistrée",
  "data": {
    "id": 61,
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "diagnostic_final": "Paludisme simple",
    "statut": "draft"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 14. Agents CAC vers fiche médicale

## POST /api/agents/{cacId}/beneficiaries/{relation}/patient-file — send

```json
{
  "beneficiary_name": "MAZENGANA MBIYAVANGA ELISE",
  "relation_to_agent": "SELF",
  "numero_fiche": "FIC-000121",
  "create_if_missing": true,
  "identification_patient": {
    "nom": "MAZENGANA",
    "postnom": "MBIYAVANGA",
    "prenom": "ELISE",
    "sexe": "F",
    "date_naissance": "1988-03-29",
    "telephone": "(+243) 99 68 51 343",
    "adresse": "21, Av Des Cypres"
  }
}
```

## receive

```json
{
  "message": "Fiche bénéficiaire agent CAC prête",
  "data": {
    "id": 70,
    "numero_patient": "PAT-000070",
    "numero_fiche": "FIC-000121",
    "agent_cac": {
      "agent_cac_id": "CA0014S",
      "relation_to_agent": "SELF",
      "beneficiary_name": "MAZENGANA MBIYAVANGA ELISE",
      "frais_exoneres": true
    }
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 15. Services / modules facturables

Module actuellement localStorage, futur backend.

## Service catalog — send

```json
{
  "code": "CONS-GEN",
  "nom": "Consultation générale",
  "categorie": "Consultation",
  "module_source": "consultations",
  "prix_base": 15000,
  "devise": "CDF",
  "remise_autorisee": true,
  "remise_max": 30,
  "necessite_paiement": true,
  "visible_dans_facturation": true,
  "visible_dans_reception": false,
  "statut": "active",
  "ordre": 3,
  "description": "Consultation médicale générale"
}
```

## receive

```json
{
  "message": "Service créé avec succès",
  "data": {
    "id": 3,
    "code": "CONS-GEN",
    "nom": "Consultation générale",
    "module_source": "consultations",
    "prix_base": 15000,
    "devise": "CDF",
    "remise_autorisee": true,
    "remise_max": 30,
    "statut": "active"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 16. Users

## POST /api/auth/admin/users — send

```json
{
  "nom": "Admin",
  "prenom": "CAC",
  "email": "admin@example.com",
  "role": "admin",
  "password": "TempPassword123!",
  "statut": "active"
}
```

## PUT /api/auth/admin/users/{id}/reset-password — send

```json
{
  "newPassword": "TempPassword123!",
  "forceChange": true
}
```

## receive

```json
{
  "message": "Utilisateur créé avec succès",
  "data": {
    "id": 1,
    "nom": "Admin",
    "prenom": "CAC",
    "email": "admin@example.com",
    "role": "admin",
    "statut": "active"
  },
  "requestId": "REQ-2026-000001"
}
```

Important : les mots de passe ne doivent jamais apparaître dans les réponses ni dans les audits.

---

# 17. Settings

Module actuellement localStorage.

## send

```json
{
  "hospital": {
    "name": "Hôpital CAC",
    "currency": "CDF",
    "timezone": "Africa/Kinshasa"
  },
  "payments": {
    "modes": ["CASH", "MOBILE_MONEY", "BANK"]
  },
  "catalog": {
    "laboratoire_types": ["Goutte épaisse", "NFS"],
    "imagerie_types": ["Échographie", "Radiographie"],
    "sortie_types": ["Sortie normale", "Référence", "Décès"]
  },
  "rules": {
    "require_numero_fiche": true,
    "audit_enabled": true,
    "status_events_enabled": true
  },
  "updated_at": "2026-05-22T11:00:00.000Z"
}
```

## receive localStorage

```json
{
  "message": "Paramètres enregistrés localement",
  "data": {
    "updated_at": "2026-05-22T11:00:00.000Z"
  }
}
```

---

# 18. Notifications

Module actuellement localStorage, futur backend.

## send

```json
{
  "id": 1,
  "type": "EMERGENCY",
  "priority": "urgent",
  "title": "Patient urgent au triage",
  "message": "Un patient a été marqué urgent au service triage",
  "module": "triage",
  "entity": "triage",
  "entity_id": "12",
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "patient": "KABAMBA Jean",
  "read": false,
  "created_at": "2026-05-22T09:00:00.000Z",
  "payload": {
    "priority": "urgent",
    "action": "TRIAGE_MARK_URGENT"
  }
}
```

## receive

```json
{
  "message": "Notification enregistrée",
  "data": {
    "id": 1,
    "read": false
  }
}
```

---

# 19. Status Socket.IO

## POST /api/{module}/{id}/status — send

```json
{
  "status": "TRIAGE_URGENT",
  "details": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "patient": "KABAMBA Jean",
    "module": "triage",
    "action": "TRIAGE_MARK_URGENT",
    "message": "Patient marqué urgent au triage",
    "source": "his-web",
    "timestamp": "2026-05-22T09:25:00.000Z"
  }
}
```

## receive

```json
{
  "message": "Statut diffusé",
  "data": {
    "id": "12",
    "status": "TRIAGE_URGENT"
  },
  "requestId": "REQ-2026-000001"
}
```

## localStorage status event

Pour modules sans backend :

```json
{
  "id": "1770000000000-ab12cd",
  "module": "facturation",
  "entity_id": 1,
  "status": "FACTURE_ISSUED",
  "details": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "action": "FACTURE_ISSUED",
    "message": "Facture émise"
  },
  "synced": false,
  "sync_status": "pending",
  "created_at": "2026-05-22T09:00:00.000Z"
}
```

---

# 20. Audit

## POST /api/audit — send

```json
{
  "userId": 1,
  "role": "admin",
  "userEmail": "admin@example.com",
  "userName": "Admin CAC",
  "action": "SERVICE_UPDATED",
  "entity": "services",
  "entityId": "7",
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "patient": "KABAMBA Jean",
  "oldValue": {
    "prix_base": 10000
  },
  "newValue": {
    "prix_base": 15000
  },
  "details": {
    "service_code": "CONS-GEN",
    "service_name": "Consultation générale"
  },
  "ip": "frontend-unknown",
  "userAgent": "Mozilla/5.0",
  "requestId": "REQ-2026-000001",
  "source": "his-web",
  "auditLevel": "INFO",
  "createdAt": "2026-05-22T09:00:00.000Z"
}
```

## receive

```json
{
  "message": "Audit enregistré",
  "data": {
    "id": 99,
    "action": "SERVICE_UPDATED",
    "entity": "services",
    "entityId": "7",
    "createdAt": "2026-05-22T09:00:00.000Z"
  },
  "requestId": "REQ-2026-000001"
}
```

## localStorage audit event

```json
{
  "id": "1770000000000-xyz123",
  "userId": 1,
  "role": "admin",
  "action": "FACTURE_ISSUED",
  "entity": "facturation",
  "entityId": "1",
  "numero_fiche": "FIC-000120",
  "oldValue": null,
  "newValue": {
    "status": "FACTURE_ISSUED"
  },
  "details": {
    "numero_facture": "FAC-0001",
    "total": 15000
  },
  "synced": false,
  "sync_status": "pending",
  "createdAt": "2026-05-22T09:00:00.000Z"
}
```

---

# 21. Admin route test

## POST /api/admin/route-test — send

```json
{
  "method": "GET",
  "path": "/api/patients",
  "body": {
    "page": 1,
    "limit": 5
  }
}
```

## receive

```json
{
  "ok": true,
  "method": "GET",
  "path": "/api/patients",
  "status": 200,
  "statusText": "OK",
  "durationMs": 120,
  "data": {
    "message": "Patients récupérés",
    "data": []
  },
  "testedAt": "2026-05-22T09:00:00.000Z"
}
```

---

# 22. Contrat frontend minimum par module

Chaque module doit au minimum normaliser :

```js
{
  ;(id, numero_fiche, numero_patient, patient, statut, created_at, updated_at, raw)
}
```

Chaque création métier doit envoyer :

```js
{
  numero_fiche,
  numero_patient,
  patient_context,
  ...modulePayload
}
```

Chaque status event doit contenir :

```js
{
  status,
  details: {
    numero_fiche,
    numero_patient,
    patient,
    module,
    action,
    message,
    source,
    timestamp
  }
}
```

Chaque audit event doit contenir :

```js
{
  ;(action,
    entity,
    entityId,
    numero_fiche,
    numero_patient,
    oldValue,
    newValue,
    details,
    requestId,
    auditLevel,
    createdAt)
}
```

---

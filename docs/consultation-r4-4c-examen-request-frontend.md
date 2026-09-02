# R4.4C — Demande d’examen depuis la consultation

## Objectif

Permettre au médecin affecté de demander un examen complémentaire sans
contourner le contexte de la consultation.

## Endpoint

```http
POST /api/v1/consultations/:id/examens
```

Le frontend n’envoie que :

```json
{
  "type": "LABORATOIRE",
  "name": "Numération formule sanguine",
  "clinicalIndication": "Recherche d’un syndrome infectieux.",
  "confirmationAcknowledged": true
}
```

Patient, épisode, consultation, service et médecin sont déterminés par le
backend.

## Protection anti-erreur

- CTA visible uniquement pour `MEDECIN` + `examen:create` + médecin affecté.
- Consultation `EN_COURS`.
- Épisode `EN_CONSULTATION` ou `EN_ATTENTE_RESULTATS`.
- Une modification clinique locale non enregistrée bloque la demande d’examen.
- `ConfirmDialog` obligatoire avec saisie exacte `CONFIRMER`.
- Après succès, la consultation est rechargée.
- Lorsque l’épisode passe en `EN_ATTENTE_RESULTATS`, le formulaire clinique
  devient lecture seule, conformément au backend R4.3B.

## Types officiels

- LABORATOIRE
- RADIOLOGIE
- ECHOGRAPHIE
- SCANNER
- IRM
- AUTRE

## Hors périmètre

Prescription, diagnostic final, hospitalisation, sortie et clôture restent
désactivés.

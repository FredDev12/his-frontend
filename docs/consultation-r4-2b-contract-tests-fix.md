# Correctif R4.2B — contrat Consultation et tests

## Causes

### Test R4.1C trop dépendant du formatage

Le test cherchait exactement :

```js
api.get('/consultations/queue'
```

L’appel valide était formaté sur plusieurs lignes. Le test utilise désormais
une expression régulière tolérant les espaces et retours à la ligne.

### Store Consultation resté sur l’ancien contrat

Le store conservait les champs et actions historiques :

```text
numero_patient
plaintes
diagnostique
createConsultation
updateConsultation
removeConsultation
statusBroadcastService
```

Il ne normalisait pas correctement les réponses officielles R4.2 :

```text
patient.patientCode
patient.firstName
patient.lastName
episode.episodeCode
chiefComplaint
illnessHistory
clinicalExam
provisionalDiagnosis
finalDiagnosis
treatmentPlan
consultationCode
doctorUser
status
decision
startedAt
closedAt
```

## Correction

Le store :

- accepte le contrat officiel et les anciens champs de lecture ;
- normalise les listes et les détails ;
- reconnaît `payload.item` et `payload.data.item` ;
- conserve `decision = null` et `closedAt = null` ;
- ne propose plus de création, modification ou suppression libre ;
- utilise les erreurs normalisées de l’Axios centralisé.

## Portée

Aucune migration et aucune écriture clinique.

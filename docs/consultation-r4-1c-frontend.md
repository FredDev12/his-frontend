# R4.1C — File médicale frontend

## Route principale

```text
/consultations/dashboard
```

La sidebar Consultation ouvre maintenant cette route.

## Fonctionnalités

- lecture de `GET /api/v1/consultations/queue` ;
- recherche par patient, épisode ou triage ;
- filtre par priorité clinique ;
- ordre fourni par le backend ;
- affichage desktop en table ;
- affichage mobile en cartes ;
- pagination ;
- accès secondaire au détail du triage ;
- historique des consultations en lecture seule.

## Actions volontairement absentes

```text
Nouvelle consultation
Modifier consultation
Supprimer consultation
Commencer consultation
```

Les trois premières contournaient ou invoquaient des routes non conformes.
La prise en charge transactionnelle sera introduite en R4.2.

## Routes historiques neutralisées

```text
/consultations/create   → /consultations/dashboard
/consultations/:id/edit → /consultations/:id
```

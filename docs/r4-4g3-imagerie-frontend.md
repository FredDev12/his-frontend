# R4.4G3 — Frontend Imagerie

## Objectif

Remplacer l’ancien CRUD `/imagerie` par la file opérationnelle basée sur
`/api/v1/examens`.

## Contrat

- Liste : `GET /examens`
- Détail : `GET /examens/:id`
- Validation compte rendu : `PATCH /examens/:id/result`

Le frontend ne transmet jamais `nextEpisodeStatus`.

## Modalités

Le module Imagerie reconnaît uniquement :

- RADIOLOGIE
- ECHOGRAPHIE
- SCANNER
- IRM

Le backend R4.4G1 reste l’autorité de filtrage type + site pour le rôle IMAGERIE.

## Sécurité UI

- route Imagerie : rôle `imagerie` + permission `examen:read`
- validation : permission `examen:update_result`
- `ConfirmDialog`
- saisie `CONFIRMER`
- résultat validé en lecture seule
- aucune création, modification générique ou suppression depuis Imagerie

## Base de données

Aucune migration.

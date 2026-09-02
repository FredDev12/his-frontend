# R4.4G2 — Frontend Laboratoire

## Contrat

Le frontend Laboratoire ne possède plus de CRUD autonome.

- liste : `GET /api/v1/examens?type=LABORATOIRE`
- détail : `GET /api/v1/examens/:id`
- résultat : `PATCH /api/v1/examens/:id/result`

La création des demandes reste exclusivement dans la consultation médicale.

## Résultat

Le payload contient uniquement :

```json
{
  "resultText": "...",
  "resultConclusion": "..."
}
```

Le frontend n’envoie jamais `nextEpisodeStatus`.

La validation utilise `ConfirmDialog`, le contexte patient et la saisie
`CONFIRMER`.

Un examen `RESULTAT_DISPONIBLE` est affiché en lecture seule.

## RBAC

- lecture : `examen:read`
- validation : `examen:update_result`

Le frontend n’est qu’une couche UX ; R4.4G1/G1.1 reste l’autorité backend
pour le type, le rôle, le site et la transition d’épisode.

## Base de données

Aucune migration.

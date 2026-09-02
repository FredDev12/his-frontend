# R4.2B — Prise en charge depuis la file médicale

## Action principale

```text
Commencer la consultation
```

Le bouton est visible uniquement pour :

```text
rôle       = MEDECIN
permission = consultation:create
```

L’administrateur conserve une file en lecture seule.

## Confirmation

Le `ConfirmDialog` affiche :

```text
nom du patient
code patient
épisode
service
médecin connecté
conséquence de la prise en charge
```

La saisie exacte suivante est obligatoire :

```text
CONFIRMER
```

## Appel API

```http
POST /api/v1/consultations/start
```

```json
{
  "episodeId": "11",
  "confirmationAcknowledged": true
}
```

Le client Axios centralisé fournit le jeton CSRF et renouvelle la session si
nécessaire.

## Après succès

```text
patient retiré de la file
compteur décrémenté
toast de succès
navigation vers /consultations/:id
statut affiché EN_COURS
aucune décision affichée
aucune action laboratoire, prescription ou sortie activée
```

## Concurrence

Si un autre médecin prend le patient entre l’affichage et la confirmation,
l’erreur métier est affichée et la file est automatiquement actualisée.

## Limite du lot

R4.2B ouvre et affiche la consultation. La saisie clinique structurée reste
désactivée jusqu’à R4.3.

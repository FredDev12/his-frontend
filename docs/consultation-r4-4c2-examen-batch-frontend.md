# R4.4C2 — UI lots d’examens

Le Drawer de demande d’examens accepte maintenant 1 à 20 examens.

Chaque ligne contient :
- type ;
- nom ;
- indication clinique.

Le médecin peut ajouter ou retirer des lignes avant la confirmation.

Le frontend envoie un lot unique à :

`POST /api/v1/consultations/:id/examens/batch`

Le ConfirmDialog présente un résumé numéroté de tout le lot et exige
`CONFIRMER`.

Des lots complémentaires restent possibles pendant `EN_ATTENTE_RESULTATS`.

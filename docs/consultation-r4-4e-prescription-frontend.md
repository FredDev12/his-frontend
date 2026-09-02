# R4.4E — Prescription depuis consultation

## Objectif

Permettre au médecin affecté de créer une prescription structurée depuis une
consultation active sans faire confiance à des identifiants fournis par le
client.

## Endpoint

```http
POST /api/v1/consultations/:id/prescriptions
```

Payload frontend :

```json
{
  "clinicalNotes": "Traitement symptomatique.",
  "lines": [
    {
      "medicationName": "Paracétamol",
      "dosage": "500 mg",
      "frequency": "3 fois/jour",
      "duration": "3 jours",
      "quantity": 9,
      "instructions": "Après repas"
    }
  ],
  "confirmationAcknowledged": true
}
```

Le frontend n’envoie ni patientId, ni episodeId, ni consultationId dans le
payload, ni doctorUserId, ni serviceId.

## Politique UI

Prescription visible uniquement si :
- rôle `MEDECIN` ;
- permission `prescription:create` ;
- consultation `EN_COURS` ;
- épisode `EN_CONSULTATION` ;
- médecin connecté = médecin affecté.

La prescription est bloquée :
- lorsque des données cliniques locales ne sont pas encore enregistrées ;
- pendant `EN_ATTENTE_RESULTATS` ;
- après passage à `EN_PHARMACIE`.

## Protection anti-erreur

La prescription est d’abord construite dans un Drawer. Une seconde étape
affiche un `ConfirmDialog` contenant le patient et le résumé des médicaments.
La validation exige la saisie exacte `CONFIRMER`.

Le bouton final utilise le variant `success`, car la prescription est créée
directement avec le statut backend `VALIDEE`.

## Hiérarchie CTA

Lorsqu’une prescription est possible :
- `Prescrire` = CTA principal ;
- `Demander un examen` = CTA secondaire.

Il n’y a donc pas deux actions principales concurrentes.

## Après succès

Le frontend recharge la consultation. Le backend ayant déplacé l’épisode vers
`EN_PHARMACIE`, le formulaire clinique devient automatiquement lecture seule.

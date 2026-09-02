# R4.3C — Formulaire clinique médecin

## Périmètre

Le médecin affecté à une consultation `EN_COURS` peut enregistrer
progressivement :

- histoire de la maladie ;
- antécédents médicaux ;
- examen clinique ;
- diagnostic provisoire ;
- plan de prise en charge.

Le motif principal reste en lecture seule car il provient du triage.

## Endpoint

```http
PATCH /api/v1/consultations/:id/clinical
```

Le frontend envoie uniquement les champs modifiés avec :

```json
{
  "expectedUpdatedAt": "2026-08-10T11:00:00.000Z"
}
```

## Contrôle d’accès UX

Le formulaire est éditable uniquement si :

- rôle `MEDECIN` ;
- permission `consultation:update` ;
- consultation `EN_COURS` ;
- utilisateur connecté = médecin affecté.

Le backend reste l’autorité finale sur le service et le contexte.

## Conflit de version

En cas de `CONSULTATION_CLINICAL_VERSION_CONFLICT`, les données locales
ne sont pas écrasées. Le formulaire est bloqué jusqu’à actualisation explicite
du dossier.

## Actions non activées

R4.3C ne permet pas :

- diagnostic final ;
- demande définitive d’examen ;
- prescription ;
- hospitalisation ;
- sortie ;
- clôture.

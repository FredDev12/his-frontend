# R4.2B — correction finale du test de normalisation

## Cause

Le test recherchait littéralement :

```js
['patientCode', 'numero_patient', 'numeroPatient']
```

Le store contient bien ces trois clés, mais elles sont formatées sur plusieurs
lignes par le style du projet.

Le test produisait donc un faux négatif alors que le contrat fonctionnel était
déjà correct.

## Correction

L'assertion utilise une expression régulière qui vérifie l'ordre et la présence
des trois clés tout en tolérant les espaces et retours à la ligne.

Aucun code métier, composant, service, store ou contrat API n'est modifié.

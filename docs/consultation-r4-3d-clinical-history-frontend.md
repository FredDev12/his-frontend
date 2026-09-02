# R4.3D-C — Historique clinique frontend

## Objectif

Afficher l’historique immuable des sauvegardes cliniques d’une consultation,
sans exposer directement les journaux techniques d’audit.

## API consommée

```http
GET /api/v1/consultations/:id/clinical-history?page=1&limit=20
```

Le backend reste l’autorité pour le rôle, la permission `consultation:read`,
le médecin affecté et le service clinique.

## Interface

Le bouton secondaire **Historique clinique** ouvre un `Drawer` en lecture seule.
Chaque entrée affiche la date/heure, le médecin, le rôle, le champ modifié,
l’ancienne valeur et la nouvelle valeur.

IP, user-agent et requestId ne sont pas affichés.

## Design system

Ce lot introduit les composants génériques manquants `Drawer` et
`DataPagination` sous `src/shared/ui`. Ils ne contiennent aucune logique métier.

## Migration

Aucune migration frontend. Le backend R4.3D-B et la migration 27 doivent déjà
être déployés.

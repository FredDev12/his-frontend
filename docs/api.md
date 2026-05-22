# Correction documentation OpenAPI est validée côté frontend/documentation

---

# Version à transmettre à l’équipe backend

## Objet

Mise à jour de la documentation OpenAPI du HIS CAC afin d’aligner l’API backend avec le frontend validé.

## Points importants à intégrer

# 1. Convention des routes

Le frontend utilise une base API :

```txt
/api
```

Donc dans OpenAPI :

```yaml
servers:
  - url: /api
```

Et les routes sont documentées sans répéter `/api`.

Exemple :

```yaml
paths:
  /patients:
    get:
```

Correspond à :

```txt
GET /api/patients
```

---

# 2. Règle métier officielle

Le HIS distingue maintenant clairement :

```txt
numero_patient = identifiant permanent de la personne
numero_fiche   = identifiant du passage / épisode / dossier courant
```

Le workflow inter-services doit utiliser :

```txt
numero_fiche
```

Modules concernés :

```txt
Réception
Triage
Consultation
Laboratoire
Imagerie
Pharmacie
Caisse
Facturation
Sortie
Audit
Status Socket.IO
```

---

# 3. Routes principales à supporter côté backend

## Patients / fiches

```txt
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id

GET    /api/patients/fiche/:numeroFiche
GET    /api/fiches/:numeroFiche/timeline
```

## Réception

```txt
GET    /api/receptions
POST   /api/receptions
GET    /api/receptions/:id
PUT    /api/receptions/:id
DELETE /api/receptions/:id
POST   /api/receptions/:id/payment
POST   /api/receptions/:id/status
```

## Triage

```txt
GET    /api/triage
POST   /api/triage
GET    /api/triage/:id
PUT    /api/triage/:id
DELETE /api/triage/:id
POST   /api/triage/:id/status
```

## Consultations

```txt
GET    /api/consultations
POST   /api/consultations
GET    /api/consultations/:id
PUT    /api/consultations/:id
DELETE /api/consultations/:id
POST   /api/consultations/:id/status
```

## Laboratoire

```txt
GET    /api/laboratoire
POST   /api/laboratoire
GET    /api/laboratoire/:id
PUT    /api/laboratoire/:id
DELETE /api/laboratoire/:id
POST   /api/laboratoire/:id/status
```

## Imagerie

```txt
GET    /api/imagerie
POST   /api/imagerie
GET    /api/imagerie/:id
PUT    /api/imagerie/:id
DELETE /api/imagerie/:id
POST   /api/imagerie/:id/status
```

## Pharmacie

```txt
GET    /api/pharmacie
POST   /api/pharmacie
GET    /api/pharmacie/:id
PATCH  /api/pharmacie/:id
DELETE /api/pharmacie/:id
POST   /api/pharmacie/:id/status
```

## Stock pharmacie

```txt
GET    /api/pharmacie/stock
POST   /api/pharmacie/stock
GET    /api/pharmacie/stock/:id
PUT    /api/pharmacie/stock/:id
DELETE /api/pharmacie/stock/:id
POST   /api/pharmacie/stock/:id/movements
GET    /api/pharmacie/stock/:id/movements
```

## Caisse / paiements

```txt
GET    /api/paiements
POST   /api/paiements
GET    /api/paiements/:id
PATCH  /api/paiements/:id
DELETE /api/paiements/:id
POST   /api/caisse/:id/status
```

## Facturation

```txt
GET    /api/factures
POST   /api/factures
GET    /api/factures/:id
PUT    /api/factures/:id
DELETE /api/factures/:id
POST   /api/factures/:id/issue
POST   /api/factures/:id/cancel
```

## Sorties

Route officielle :

```txt
GET    /api/sorties
POST   /api/sorties
GET    /api/sorties/:id
PATCH  /api/sorties/:id
DELETE /api/sorties/:id
POST   /api/sorties/:id/status
```

Ancienne route tolérée temporairement :

```txt
POST /api/sortie/:id/status
```

À marquer comme deprecated.

---

# 4. Agents CAC vers fiche patient

À prévoir côté backend :

```txt
POST /api/agents/:cacId/beneficiaries/:relation/patient-file
```

Relations possibles :

```txt
SELF
SPOUSE
CHILD
PARENT
```

Règle métier :

```txt
Agent CAC confirmé = frais fiche exonérés
Conjoint confirmé = frais fiche exonérés
Enfant confirmé = frais fiche exonérés
Patient public = frais normaux
```

Payload attendu :

```json
{
  "beneficiary_name": "MAZENGANA MBIYAVANGA ELISE",
  "relation_to_agent": "SELF",
  "numero_fiche": "FIC-000120",
  "create_if_missing": true
}
```

---

# 5. Services / modules facturables

À prévoir côté backend :

```txt
GET    /api/services-catalog
POST   /api/services-catalog
GET    /api/services-catalog/:id
PUT    /api/services-catalog/:id
DELETE /api/services-catalog/:id
PATCH  /api/services-catalog/:id/status
```

Modèle attendu :

```json
{
  "code": "CONS-GEN",
  "nom": "Consultation générale",
  "categorie": "Consultation",
  "module_source": "consultations",
  "prix_base": 15000,
  "devise": "CDF",
  "remise_autorisee": true,
  "remise_max": 30,
  "necessite_paiement": true,
  "visible_dans_facturation": true,
  "visible_dans_reception": false,
  "statut": "active",
  "ordre": 1,
  "description": "Consultation médicale générale"
}
```

---

# 6. Audit backend obligatoire

Frontend prépare déjà :

```txt
his_audit_events
POST /api/audit si disponible
```

Backend doit implémenter :

```txt
GET  /api/audit
POST /api/audit
```

L’audit backend doit compléter :

```txt
userId réel depuis session/JWT
rôle réel RBAC
IP réelle
user-agent
requestId serveur
ancienne valeur DB
nouvelle valeur DB
timestamp serveur
transactionId si disponible
```

Payload audit attendu :

```json
{
  "userId": 1,
  "role": "admin",
  "action": "SERVICE_UPDATED",
  "entity": "services",
  "entityId": "7",
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "oldValue": {},
  "newValue": {},
  "details": {},
  "ip": "auto-backend",
  "userAgent": "Mozilla/5.0",
  "requestId": "REQ-2026-000001",
  "auditLevel": "INFO",
  "createdAt": "2026-05-22T00:00:00.000Z"
}
```

---

# 7. Status Socket.IO

Routes attendues :

```txt
POST /api/patients/:id/status
POST /api/receptions/:id/status
POST /api/triage/:id/status
POST /api/consultations/:id/status
POST /api/laboratoire/:id/status
POST /api/imagerie/:id/status
POST /api/pharmacie/:id/status
POST /api/caisse/:id/status
POST /api/sorties/:id/status
```

Payload standard :

```json
{
  "status": "TRIAGE_URGENT",
  "details": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "action": "TRIAGE_MARK_URGENT",
    "message": "Patient marqué urgent au triage"
  }
}
```

Réponse attendue :

```json
{
  "message": "Statut diffusé",
  "data": {
    "id": "12",
    "status": "TRIAGE_URGENT"
  },
  "requestId": "REQ-2026-000001"
}
```

---

# 8. Console admin route test

Route backend future documentée :

```txt
POST /api/admin/route-test
```

Le frontend fonctionne déjà en test direct via Axios, mais le backend peut centraliser plus tard.

Payload :

```json
{
  "method": "GET",
  "path": "/api/patients",
  "body": {
    "page": 1,
    "limit": 5
  }
}
```

Réponse :

```json
{
  "ok": true,
  "method": "GET",
  "path": "/api/patients",
  "status": 200,
  "durationMs": 120,
  "data": {}
}
```

---

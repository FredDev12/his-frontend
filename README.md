# HIS CAC — Frontend

Frontend du Système d’Information Hospitalier CAC.

Ce frontend est conçu pour gérer le workflow hospitalier complet :

```txt
Réception
→ Rendez-vous
→ Triage / Urgences
→ Consultation
→ Laboratoire / Imagerie
→ Pharmacie
→ Caisse / Facturation
→ Sortie patient
```

---

## 1. Objectif

Le frontend HIS CAC est une interface clinique et administrative.

Il permet de gérer :

- Patients
- Réceptions
- Rendez-vous
- Triage / Urgences
- Consultations
- Laboratoire
- Imagerie
- Pharmacie
- Stock pharmacie
- Caisse / Paiements
- Facturation
- Sorties patient
- Agents CAC
- Utilisateurs système
- Services hospitaliers
- Rapports
- Notifications
- Audit
- Paramètres
- Console administration

L’interface doit rester :

```txt
Stable
Lisible
Prévisible
Cohérente
Auditable
Maintenable
```

---

## 2. Stack technique

```txt
Vue 3
Vite 8
Pinia
Vue Router 5
Axios
Tailwind CSS 4
Socket.IO client
Swagger UI Express
Design System interne
localStorage temporaire
sessionStorage pour contexte fiche
```

---

## 3. Installation

```bash
npm install
```

> Requis : Node 20.19.0 ou >= 22.12.0

---

## 4. Lancement en développement

```bash
npm run dev
```

URL locale habituelle :

```txt
http://localhost:5173
```

---

## 5. Build production

```bash
npm run build
```

Résultat attendu :

```txt
dist/
```

---

## 6. Preview production locale

```bash
npm run preview
```

Si le script preview n’existe pas :

```bash
npx vite preview
```

---

## 7. Scripts utiles

```bash
npm run dev
npm run build
npm run preview
npm run test:unit
npm run test:e2e
npm run lint
npm run lint:eslint
npm run lint:oxlint
npm run format
```

---

## 7. Variables d’environnement

Copier le fichier exemple :

```bash
cp .env.example .env
```

Variable principale :

```env
VITE_API_URL=/api
```

En production :

```env
VITE_API_URL=https://hopital.congoastral-app.com/api
```

Variables recommandées :

```env
VITE_APP_NAME="HIS CAC"
VITE_APP_ENV=production
VITE_SOCKET_URL=https://hopital.congoastral-app.com
VITE_API_TIMEOUT=30000
```

---

## 8. Règle métier principale

Le HIS distingue deux identifiants :

```txt
numero_patient = identifiant permanent de la personne
numero_fiche   = identifiant du passage courant
```

Exemple :

```txt
Patient : KABAMBA Jean
numero_patient : PAT-000012

Passage du jour : FIC-000120
```

Le workflow inter-services utilise principalement :

```txt
numero_fiche
```

Le champ `numero_patient` reste affiché pour le contexte, mais il ne remplace pas `numero_fiche`.

---

## 9. Workflow principal

```txt
Patient
→ Fiche médicale
→ Réception
→ Triage
→ Consultation
→ Laboratoire / Imagerie
→ Pharmacie
→ Caisse / Facturation
→ Sortie
```

Le contexte fiche est temporairement stocké dans :

```txt
sessionStorage.his_active_fiche_context
```

---

## 10. Modules API

Modules déjà préparés pour API ou connectés au backend :

```txt
Patients
Réceptions
Triage
Consultations
Laboratoire
Imagerie
Pharmacie
Caisse / Paiements
Sorties
Agents CAC
Users
Audit
Administration
Reports
```

---

## 11. Modules localStorage

Modules encore gérés localement ou en attente de backend définitif :

```txt
Rendez-vous
Stock pharmacie
Facturation
Services hospitaliers
Settings
Notifications
```

Clés principales :

```txt
his_notifications
his_rendez_vous
his_pharmacy_stock_products
his_pharmacy_stock_movements
his_factures
his_hospital_services
his_system_settings
his_status_events
his_audit_events
```

---

## 12. Audit et status events

Status local :

```txt
his_status_events
```

Audit local :

```txt
his_audit_events
```

Le frontend tente aussi d’envoyer les audits vers :

```txt
POST /api/audit
```

Si le backend audit est indisponible, l’action métier ne casse pas.

---

## 13. Console administration

Route :

```txt
/administration
```

Fonctions :

- état des modules API
- état des modules localStorage
- audit local
- status local
- test route API
- blocage routes sensibles
- audit des tests API

---

## 14. Documentation

Documents disponibles :

```txt
docs/frontend.md
docs/frontend-modules.md
docs/workflow-numero-fiche.md
docs/localstorage-vs-api.md
docs/audit-status-events.md
docs/frontend-tests.md
docs/frontend-handover.md
docs/backend-integration-checklist.md
docs/frontend-deployment.md
docs/release-frontend.md
docs/openapi.yaml
docs/api-payloads.md
```

Documents transmis à l’équipe backend :

```txt
api.md
api-payload.md
openapi.yaml
```

---

## 15. Tests validés

Phase validée :

```txt
Phase 3.9 — Tests frontend
```

Validations :

```txt
Auth / navigation initiale
Routes principales
Modules API
Modules localStorage
Workflow numero_fiche
Agent CAC vers fiche médicale
Status events
Audit events
ConfirmDialog critiques
Console admin
Responsive
Erreurs / robustesse
Build final
```

---

## 16. Déploiement

Le frontend est une SPA Vue.

En production, toutes les routes doivent rediriger vers :

```txt
index.html
```

Exemple Nginx :

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 17. Validation avant livraison

Toujours exécuter :

```bash
npm run build
```

Puis vérifier :

```txt
/login
/dashboard
/patients
/administration
```

---

## 18. Risques restants

Modules frontend-ready mais à connecter au backend définitif :

```txt
services-catalog API
facturation API
stock pharmacie API
rendez-vous API
settings API
notifications API
audit backend complet
fiches/timeline backend
agents bénéficiaires backend
admin route-test backend centralisé
```

---

## 19. Commandes utiles

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test:unit
npm run test:e2e
npm run lint
npm run format
```

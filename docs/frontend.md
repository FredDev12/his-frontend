Parfait. On applique :

# Phase 3.10 — Documentation frontend

Objectif : créer une documentation frontend claire pour que n’importe quel développeur puisse comprendre, maintenir et reprendre le frontend HIS.

À créer dans :

```txt
docs/
```

avec ces fichiers :

```txt
docs/frontend.md
docs/frontend-modules.md
docs/workflow-numero-fiche.md
docs/localstorage-vs-api.md
docs/audit-status-events.md
docs/frontend-tests.md
docs/frontend-handover.md
```

---

# 1. `docs/frontend.md`

````md
# HIS CAC — Documentation frontend

## Objectif

Le frontend HIS CAC est l’interface opérationnelle du système d’information hospitalier.

Il permet de gérer :

- patients
- réceptions
- rendez-vous
- triage / urgences
- consultations
- laboratoire
- imagerie
- pharmacie
- stock pharmacie
- caisse / paiements
- facturation
- sorties patient
- agents CAC
- utilisateurs système
- services hospitaliers
- audit
- notifications
- paramètres
- console administration

Le frontend est conçu comme un outil clinique, pas comme un site marketing.

Objectifs principaux :

- réduire les erreurs humaines
- garder une interface lisible sous stress
- assurer une navigation cohérente
- protéger les actions critiques
- préparer l’intégration backend complète
- tracer les actions importantes

---

## Stack technique

- Vue 3
- Vite
- JavaScript / TypeScript compatible
- Pinia
- Vue Router
- Axios centralisé
- Tailwind CSS
- Composants UI internes
- LocalStorage pour certains référentiels temporaires
- SessionStorage pour le contexte de fiche courant

---

## Architecture générale

```txt
src/
├── app/
│   ├── layouts/
│   ├── router/
│   └── main.js
│
├── modules/
│   ├── patients/
│   ├── receptions/
│   ├── triage/
│   ├── consultations/
│   ├── laboratoire/
│   ├── imagerie/
│   ├── pharmacie/
│   ├── stock-pharmacie/
│   ├── caisse/
│   ├── facturation/
│   ├── sorties/
│   ├── agents/
│   ├── users/
│   ├── services/
│   ├── reports/
│   ├── notifications/
│   ├── audit/
│   ├── settings/
│   └── administration/
│
├── shared/
│   ├── components/
│   ├── services/
│   ├── stores/
│   ├── ui/
│   └── utils/
```
````

---

## Principe d’organisation

Chaque module suit généralement cette structure :

```txt
module/
├── components/
├── pages/
├── services/
└── stores/
```

Règles :

- les pages orchestrent l’affichage
- les composants affichent l’UI
- les stores Pinia gèrent l’état
- les services appellent l’API ou localStorage
- les composants UI communs restent dans `shared/ui`
- aucune logique métier critique ne doit être uniquement côté frontend

---

## Services partagés importants

```txt
src/shared/services/api.js
```

Service Axios central.

```txt
src/shared/services/status-broadcast.service.js
```

Gestion des statuts temps réel et status locaux.

```txt
src/shared/services/audit-client.service.js
```

Gestion des traces audit frontend/locales.

```txt
src/shared/services/fiche-workflow.service.js
```

Gestion du contexte `numero_fiche`.

```txt
src/shared/services/service-catalog-pricing.service.js
```

Gestion locale du catalogue services/prix/remise.

---

## Design system

Le frontend utilise des composants communs :

- BaseButton
- BaseInput
- BaseSelect
- BaseTextarea
- BaseCheckbox
- BaseBadge
- BaseCard
- BaseModal
- ConfirmDialog
- ToastHost

Règles :

- un seul CTA principal par section
- les actions critiques passent par ConfirmDialog
- les couleurs ont un sens métier
- danger = suppression / annulation forte
- warning = suspension / annulation
- success = validation définitive
- emergency = urgence clinique
- primary = action standard

---

## Routes principales

```txt
/login
/dashboard
/patients
/receptions
/rendez-vous
/triage
/consultations
/laboratoire
/imagerie
/pharmacie
/stock-pharmacie
/caisse
/facturation
/sorties
/agents
/users
/services
/reports
/notifications
/audit
/settings
/administration
```

---

## État actuel

Le frontend est validé jusqu’à la phase :

```txt
Phase 3.9 — Tests frontend
```

Statut :

```txt
Build production : OK
Navigation : OK
Modules API : OK
Modules localStorage : OK
Workflow numero_fiche : OK
Audit/status events : OK
Responsive : OK
Console admin : OK
```

````

---

# 2. `docs/frontend-modules.md`

```md
# HIS CAC — Modules frontend

## 1. Dashboard

Route :

```txt
/dashboard
````

Rôle :

- vue synthétique de l’activité HIS
- indicateurs patients, réceptions, consultations
- urgences triage
- paiements du jour
- recettes du jour
- sorties du jour
- notifications non lues
- accès rapides
- activité récente

Statut :

```txt
Validé
```

---

## 2. Patients

Route :

```txt
/patients
```

Fonctions :

- liste patients
- recherche
- détail patient
- création patient public
- création bénéficiaire agent CAC
- modification
- désactivation
- affichage numero_patient
- affichage numero_fiche
- point de départ du workflow inter-services

Règle :

```txt
numero_patient = identité permanente
numero_fiche = passage courant
```

---

## 3. Réceptions

Route :

```txt
/receptions
```

Fonctions :

- liste
- recherche
- détail
- création
- modification
- suppression
- paiement réception
- status event
- audit event

Identifiant workflow :

```txt
numero_fiche
```

---

## 4. Rendez-vous

Route :

```txt
/rendez-vous
```

Statut technique :

```txt
localStorage
```

Fonctions :

- création rendez-vous
- modification
- confirmation
- terminaison
- annulation
- suppression
- filtres par service, statut et date
- status local
- audit local

---

## 5. Triage / urgences

Route :

```txt
/triage
```

Fonctions :

- liste triage
- création triage
- signes vitaux
- priorisation
- marquer urgent
- modification
- suppression
- status API
- audit

Payload important :

```json
{
  "numero_fiche": "FIC-000120",
  "type_passage": "NEW",
  "signes_vitaux": {}
}
```

---

## 6. Consultations

Route :

```txt
/consultations
```

Fonctions :

- création consultation
- plaintes
- anamnèse
- examen clinique
- diagnostic
- plan de prise en charge
- recherche dans plaintes/anamnèse
- diagnostic JSON parsé

---

## 7. Laboratoire

Route :

```txt
/laboratoire
```

Fonctions :

- demandes laboratoire
- résultats
- validation
- modification
- suppression

---

## 8. Imagerie

Route :

```txt
/imagerie
```

Fonctions :

- demandes imagerie
- résultats / conclusion
- modification
- suppression

Note :

```txt
Le champ examens[0].type a été retiré car non accepté par l’API.
```

---

## 9. Pharmacie

Route :

```txt
/pharmacie
```

Fonctions :

- prescriptions
- modification
- délivrance directe
- suppression
- status event
- audit event

---

## 10. Stock pharmacie

Route :

```txt
/stock-pharmacie
```

Statut technique :

```txt
localStorage
```

Fonctions :

- produits
- entrée stock
- sortie stock
- ajustement stock
- historique mouvements
- stock faible
- rupture
- audit local
- status local

---

## 11. Caisse / paiements

Route :

```txt
/caisse
```

API :

```txt
/api/paiements
```

Fonctions :

- création paiement
- validation
- annulation
- modification
- suppression
- audit
- status

---

## 12. Facturation

Route :

```txt
/facturation
```

Statut technique :

```txt
localStorage, futur backend
```

Fonctions :

- création facture
- lignes facture
- sous-total
- remise
- taxe
- total
- émission
- marquer payée
- annulation
- suppression
- audit local
- status local

---

## 13. Sorties

Route :

```txt
/sorties
```

Fonctions :

- création sortie
- modification
- validation sortie
- annulation sortie
- suppression
- status API

Route status officielle :

```txt
/api/sorties/:id/status
```

Ancienne route tolérée :

```txt
/api/sortie/:id/status
```

---

## 14. Agents CAC

Route :

```txt
/agents
```

Fonctions :

- recherche avancée
- recherche CAC ID
- recherche nom/postnom/prénom
- recherche téléphone
- recherche fonction
- détail agent
- affichage enfants
- lien fiche médicale agent/conjoint/enfant

Règle :

```txt
Agent CAC confirmé = frais fiche à 0
Conjoint/enfant confirmé = frais fiche à 0
Patient public = frais normaux
```

---

## 15. Utilisateurs

Route :

```txt
/users
```

API :

```txt
/api/auth/admin/users
```

Fonctions :

- création utilisateur
- modification
- détail
- reset mot de passe
- suppression
- audit

Important :

```txt
Les mots de passe ne doivent jamais apparaître dans audit ou réponse API.
```

---

## 16. Services hospitaliers

Route :

```txt
/services
```

Statut technique :

```txt
localStorage, futur backend services-catalog
```

Fonctions :

- création service/module
- prix de base
- devise
- remise autorisée
- remise maximale
- paiement requis
- visibilité réception
- visibilité facturation
- activation/désactivation
- suppression
- audit local
- status local

---

## 17. Audit

Route :

```txt
/audit
```

Fonctions :

- liste audit
- détail audit
- ancienne valeur
- nouvelle valeur
- user
- rôle
- IP
- user-agent
- requestId

---

## 18. Notifications

Route :

```txt
/notifications
```

Fonctions :

- liste notifications
- détail
- marquer comme lue
- tout marquer comme lu
- supprimer
- nettoyer lues
- cloche Topbar
- affichage patient clair

---

## 19. Paramètres

Route :

```txt
/settings
```

Statut technique :

```txt
localStorage
```

Fonctions :

- informations hôpital
- règles système
- modes paiement
- types laboratoire
- types imagerie
- types sortie
- sauvegarde
- réinitialisation
- audit local
- status local

---

## 20. Administration

Route :

```txt
/administration
```

Fonctions :

- console admin
- état modules API
- état modules localStorage
- audit local
- status local
- test route API
- blocage routes sensibles
- audit des tests API

````

---

# 3. `docs/workflow-numero-fiche.md`

```md
# HIS CAC — Workflow numero_fiche

## Principe métier

Le HIS distingue deux identifiants :

```txt
numero_patient = identifiant permanent de la personne
numero_fiche   = identifiant du passage courant
````

Un patient peut avoir plusieurs fiches.

Une fiche appartient à un seul patient.

---

## Exemple

```txt
Patient : KABAMBA Jean
numero_patient : PAT-000012

Passage 1 : FIC-000120
Passage 2 : FIC-000145
Passage 3 : FIC-000201
```

---

## Règle frontend

Le workflow entre services utilise toujours :

```txt
numero_fiche
```

Le champ `numero_patient` reste affiché mais ne doit pas être utilisé seul pour continuer le workflow clinique.

---

## Modules concernés

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
Notifications
```

---

## Service frontend

Fichier :

```txt
src/shared/services/fiche-workflow.service.js
```

Rôle :

- enregistrer la fiche active
- lire la fiche active
- préremplir les pages create
- construire un payload workflow avec numero_fiche
- empêcher la création métier sans numero_fiche

---

## Stockage temporaire

Le contexte fiche courant est stocké dans :

```txt
sessionStorage.his_active_fiche_context
```

Exemple :

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "patient_id": 1,
  "nom": "KABAMBA",
  "prenom": "Jean",
  "service": "Réception"
}
```

---

## Déclenchement depuis détail patient

Depuis `/patients/:id`, les boutons workflow appellent :

```js
ficheWorkflowService.setActiveFiche(patient)
```

Puis redirigent vers :

```txt
/receptions/create
/triage/create
/consultations/create
/laboratoire/create
/imagerie/create
/pharmacie/create
/caisse/create
/facturation/create
/sorties/create
```

---

## Pages create

Chaque page create doit :

1. lire `ficheWorkflowService.getActiveFiche()`
2. afficher `FicheContextCard`
3. préremplir `numero_fiche`
4. envoyer `numero_fiche` dans le payload

---

## Composant contexte

Fichier :

```txt
src/shared/components/FicheContextCard.vue
```

Affiche :

- nom patient
- numero_patient
- numero_fiche
- service/source

---

## Payload minimum attendu

```json
{
  "numero_fiche": "FIC-000120",
  "numero_patient": "PAT-000012",
  "patient_context": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "nom": "KABAMBA",
    "prenom": "Jean"
  }
}
```

---

## Règle de conformité

Aucune opération clinique ou financière liée au passage ne doit dépendre uniquement de `numero_patient`.

Si `numero_fiche` est absent, l’interface doit bloquer l’action ou afficher une erreur claire.

````

---

# 4. `docs/localstorage-vs-api.md`

```md
# HIS CAC — LocalStorage vs API

## Objectif

Certains modules sont connectés à l’API backend.

D’autres sont temporairement gérés en localStorage en attendant leur backend définitif.

Le frontend doit rester stable dans les deux cas.

---

## Modules API

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
````

Ces modules utilisent Axios via :

```txt
src/shared/services/api.js
```

---

## Modules localStorage

```txt
Rendez-vous
Stock pharmacie
Facturation
Services hospitaliers / services-catalog
Settings
Notifications
Status events locaux
Audit events locaux
```

---

## Clés localStorage principales

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

## Règle de stabilité

Chaque service localStorage doit :

- lire les données
- gérer le JSON corrompu
- réinitialiser proprement si besoin
- ne jamais casser l’application
- créer un status local si l’action est importante
- créer un audit local si l’action est critique

---

## Status locaux

Clé :

```txt
his_status_events
```

Format :

```json
{
  "id": "1770000000000-ab12cd",
  "module": "facturation",
  "entity_id": 1,
  "status": "FACTURE_ISSUED",
  "details": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "action": "FACTURE_ISSUED",
    "message": "Facture émise"
  },
  "synced": false,
  "sync_status": "pending",
  "created_at": "2026-05-22T09:00:00.000Z"
}
```

---

## Audit local

Clé :

```txt
his_audit_events
```

Format :

```json
{
  "id": "1770000000000-xyz123",
  "action": "FACTURE_ISSUED",
  "entity": "facturation",
  "entityId": "1",
  "numero_fiche": "FIC-000120",
  "oldValue": null,
  "newValue": {
    "status": "FACTURE_ISSUED"
  },
  "synced": false,
  "sync_status": "pending",
  "createdAt": "2026-05-22T09:00:00.000Z"
}
```

---

## Migration future vers backend

Les modules localStorage doivent être migrés progressivement vers API.

Ordre conseillé :

1. Services catalog
2. Facturation
3. Stock pharmacie
4. Rendez-vous
5. Settings
6. Notifications

Lors de la migration, conserver les mêmes payloads documentés dans :

```txt
docs/api-payloads.md
```

````

---

# 5. `docs/audit-status-events.md`

```md
# HIS CAC — Audit et Status Events

## Objectif

Le frontend HIS produit deux types d’événements :

```txt
Status event = signal opérationnel / temps réel
Audit event  = trace de conformité
````

---

## Status events

Service :

```txt
src/shared/services/status-broadcast.service.js
```

Rôle :

- appeler `/api/{module}/{id}/status` quand disponible
- créer un status local quand le module n’a pas encore de backend
- ne jamais casser l’action métier si la diffusion échoue
- déclencher un audit lié au status

---

## Modules avec status API

```txt
patients
receptions
triage
consultations
laboratoire
imagerie
pharmacie
caisse
sortie/sorties
```

---

## Modules avec status local

```txt
rendez-vous
stock-pharmacie
facturation
services
settings
users
notifications
administration
```

---

## Payload status

```json
{
  "status": "TRIAGE_URGENT",
  "details": {
    "numero_fiche": "FIC-000120",
    "numero_patient": "PAT-000012",
    "patient": "KABAMBA Jean",
    "module": "triage",
    "action": "TRIAGE_MARK_URGENT",
    "message": "Patient marqué urgent au triage",
    "source": "his-web",
    "timestamp": "2026-05-22T09:25:00.000Z"
  }
}
```

---

## Audit events

Service :

```txt
src/shared/services/audit-client.service.js
```

Helper :

```txt
src/shared/utils/audit.js
```

Rôle :

- créer une trace locale
- tenter POST /api/audit
- masquer les données sensibles
- ne jamais casser l’action métier
- marquer l’événement comme pending/synced

---

## Champs audit minimum

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
  "requestId": "REQ-2026-000001",
  "auditLevel": "INFO",
  "createdAt": "2026-05-22T09:00:00.000Z"
}
```

---

## Masquage données sensibles

Les clés suivantes doivent être masquées :

```txt
password
mot_de_passe
token
access_token
refresh_token
authorization
cookie
secret
csrf
```

Valeur attendue :

```txt
[REDACTED]
```

---

## Niveaux audit

```txt
INFO     = action standard
WARNING  = annulation, suppression, reset, sortie critique
CRITICAL = urgence médicale, action institutionnelle majeure
```

---

## Règle importante

L’audit frontend est une préparation.

L’audit institutionnel final doit être fait côté backend avec :

- userId réel
- rôle réel
- IP réelle
- requestId serveur
- ancienne valeur DB
- nouvelle valeur DB
- timestamp serveur
- transactionId si disponible

````

---

# 6. `docs/frontend-tests.md`

```md
# HIS CAC — Tests frontend validés

## Phase validée

```txt
Phase 3.9 — Tests frontend
````

---

## Auth / navigation initiale

```txt
[validé] /login s’affiche correctement
[validé] Connexion réussie
[validé] Redirection vers /dashboard
[validé] Sidebar visible
[validé] Topbar visible
[validé] Cloche notifications visible
[validé] Déconnexion fonctionne
[validé] Route inconnue gérée proprement
```

---

## Routes principales

```txt
[validé] /dashboard
[validé] /patients
[validé] /receptions
[validé] /triage
[validé] /consultations
[validé] /laboratoire
[validé] /imagerie
[validé] /pharmacie
[validé] /stock-pharmacie
[validé] /caisse
[validé] /facturation
[validé] /sorties
[validé] /agents
[validé] /users
[validé] /services
[validé] /reports
[validé] /notifications
[validé] /audit
[validé] /settings
[validé] /administration
```

---

## Modules API

```txt
[validé] Liste
[validé] Recherche
[validé] Pagination si données suffisantes
[validé] Détail
[validé] Création
[validé] Modification
[validé] Suppression / désactivation si disponible
[validé] Erreur API affichée proprement
[validé] Aucun crash si API retourne vide
```

---

## Modules localStorage

```txt
[validé] Création localStorage
[validé] Modification localStorage
[validé] Suppression localStorage
[validé] Recharge page sans perte immédiate
[validé] Données visibles après reload
[validé] Événement status local créé
[validé] Événement audit local créé
```

---

## Workflow numero_fiche

```txt
[validé] Patient garde numero_patient permanent
[validé] Patient possède numero_fiche courant
[validé] Boutons workflow initialisent le contexte fiche
[validé] FicheContextCard affichée dans les pages create
[validé] numero_fiche prérempli
[validé] numero_patient affiché comme contexte
[validé] Payloads contiennent numero_fiche
[validé] Tableaux affichent numero_patient + numero_fiche
```

---

## Agent CAC vers fiche médicale

```txt
[validé] Agent lui-même visible
[validé] Conjoint visible si existe
[validé] Enfants visibles si existent
[validé] Ouvrir fiche existante fonctionne
[validé] Créer fiche absente fonctionne
[validé] Formulaire patient prérempli
[validé] Frais agent CAC = 0
[validé] Paiement effectué = true
[validé] Mode paiement = AGENT_CAC
[validé] Payload agent_cac complet
[validé] Patient public garde frais normaux
```

---

## Status events

```txt
[validé] Status locaux créés
[validé] Routes /status API non bloquantes
[validé] details.numero_fiche si applicable
[validé] details.action
[validé] details.message
```

---

## Audit events

```txt
[validé] Actions critiques tracées
[validé] action/entity/entityId renseignés
[validé] numero_fiche renseigné quand applicable
[validé] oldValue/newValue présents si disponibles
[validé] requestId présent
[validé] auditLevel présent
[validé] secrets masqués
[validé] échec /api/audit non bloquant
```

---

## ConfirmDialog critiques

```txt
[validé] Désactiver patient
[validé] Supprimer réception
[validé] Payer réception
[validé] Marquer triage urgent
[validé] Supprimer consultation
[validé] Supprimer laboratoire
[validé] Supprimer imagerie
[validé] Délivrer pharmacie
[validé] Valider paiement
[validé] Annuler paiement
[validé] Valider sortie
[validé] Annuler sortie
[validé] Reset mot de passe utilisateur
[validé] Supprimer utilisateur
[validé] Activer service
[validé] Désactiver service
[validé] Supprimer service
[validé] Émettre facture
[validé] Marquer facture payée
[validé] Annuler facture
[validé] Entrée stock
[validé] Sortie stock
[validé] Ajustement stock
[validé] Réinitialiser paramètres
```

---

## Console admin

```txt
[validé] Cartes résumé
[validé] Modules API
[validé] Modules localStorage
[validé] Audit local
[validé] Status local
[validé] Test route API
[validé] Confirmation méthodes écriture
[validé] Routes sensibles bloquées
[validé] Résultat HTTP/durée/JSON
[validé] Test API audité
```

---

## Responsive

```txt
[validé] Desktop
[validé] Tablette
[validé] Mobile
[validé] Sidebar utilisable
[validé] Topbar visible
[validé] Tables scrollables si nécessaire
[validé] Formulaires lisibles
[validé] Boutons critiques accessibles
[validé] ConfirmDialog lisible
[validé] Aucun débordement horizontal majeur
```

---

## Erreurs / robustesse

```txt
[validé] API indisponible
[validé] Route API 404
[validé] Validation backend 400
[validé] Non autorisé 401
[validé] Erreur serveur 500
[validé] localStorage corrompu
[validé] Messages lisibles
[validé] Page ne casse pas
[validé] Console admin sans crash
```

---

## Build final

```txt
[validé] npm run build passe sans erreur
[validé] Aucun import manquant
[validé] Aucun composant introuvable
[validé] Aucun type/variable bloquant
[validé] dist généré
```

````

---

# 7. `docs/frontend-handover.md`

```md
# HIS CAC — Transmission technique frontend

## Statut global

Le frontend HIS CAC est validé jusqu’à :

```txt
Phase 3.10 — Documentation frontend
````

La phase précédente validée est :

```txt
Phase 3.9 — Tests frontend
```

---

## Ce qui est prêt

```txt
Navigation globale
Modules API
Modules localStorage
Workflow numero_fiche
Agent CAC vers fiche médicale
Services/modules facturables
Audit frontend
Status events
Console admin
Documentation OpenAPI
Documentation payloads
Tests frontend
Build production
```

---

## Documents disponibles

```txt
docs/frontend.md
docs/frontend-modules.md
docs/workflow-numero-fiche.md
docs/localstorage-vs-api.md
docs/audit-status-events.md
docs/frontend-tests.md
docs/frontend-handover.md
docs/openapi.yaml
docs/api-payloads.md
```

---

## Documents transmis backend

```txt
api.md
api-payload.md
openapi.yaml
```

---

## Points importants pour l’équipe backend

### 1. numero_fiche

Le frontend utilise `numero_fiche` comme identifiant principal du workflow inter-services.

### 2. numero_patient

Le frontend conserve `numero_patient` comme identifiant permanent de la personne.

### 3. Routes status

Le frontend appelle ou prépare :

```txt
/api/{module}/{id}/status
```

Les modules localStorage écrivent dans :

```txt
his_status_events
```

### 4. Audit

Le frontend écrit dans :

```txt
his_audit_events
```

et tente :

```txt
POST /api/audit
```

si disponible.

### 5. Modules localStorage à migrer plus tard

```txt
Rendez-vous
Stock pharmacie
Facturation
Services catalog
Settings
Notifications
```

---

## Commandes principales

Installation :

```bash
npm install
```

Développement :

```bash
npm run dev
```

Build :

```bash
npm run build
```

---

## Variables importantes

Le frontend utilise :

```txt
VITE_API_URL
```

Si absent, l’API par défaut est :

```txt
/api
```

---

## Validation avant livraison

Toujours lancer :

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

## Risques restants

Les éléments suivants sont frontend-ready mais attendent backend définitif :

```txt
services-catalog API
facturation API
stock pharmacie API
rendez-vous API
audit backend complet
fiches/timeline backend
agents bénéficiaires backend
admin route-test backend centralisé
```

---

## Conclusion

Le frontend est stable et prêt pour :

```txt
Phase 3.11 — Préparation livraison / intégration backend
```

````

---

# Validation Phase 3.10

Après création des fichiers :

```txt
[ ] docs/frontend.md existe
[ ] docs/frontend-modules.md existe
[ ] docs/workflow-numero-fiche.md existe
[ ] docs/localstorage-vs-api.md existe
[ ] docs/audit-status-events.md existe
[ ] docs/frontend-tests.md existe
[ ] docs/frontend-handover.md existe
[ ] Les modules sont documentés
[ ] Le workflow numero_fiche est documenté
[ ] localStorage vs API est documenté
[ ] audit/status events sont documentés
[ ] les tests validés sont documentés
[ ] la transmission technique est prête
[ ] npm run build passe toujours
````

Quand c’est validé, on pourra clôturer :

```txt
Phase 3.10 — Documentation frontend
```

# 🏦 Module Financier — HIS

## 📊 Tableau récapitulatif des endpoints financiers

| #  | Fonction                        | Méthode | Endpoint                             | Description                                                                 | Paramètres / Body |
|----|---------------------------------|--------|-------------------------------------|----------------------------------------------------------------------------|-----------------|
| 1  | Ouverture de caisse              | POST   | `/api/v1/cash/open`                 | Ouvre une caisse pour la session du caissier.                               | `{ cashId, cashierId, initialAmount, details: {cash, cheque, mobile} }` |
| 2  | Clôture de caisse                | POST   | `/api/v1/cash/close`                | Clôture une caisse après toutes les transactions.                           | `{ cashId, cashierId, finalAmount, details: {cash, cheque, mobile}, observations }` |
| 3  | Création d’une facture           | POST   | `/api/v1/invoices`                  | Crée une facture pour un patient / service.                                 | `{ patientId, items: [{serviceId, description, qty, price}], totalAmount }` |
| 4  | Consultation de factures         | GET    | `/api/v1/invoices`                  | Liste des factures filtrables par période, patient, statut.                 | Query: `?startDate=&endDate=&patientId=&status=` |
| 5  | Détail d’une facture             | GET    | `/api/v1/invoices/:invoiceId`       | Détail complet d’une facture.                                              | Path: `invoiceId` |
| 6  | Ajout d’éléments à une facture   | POST   | `/api/v1/invoices/:invoiceId/items` | Ajouter des services ou produits à une facture existante.                  | `{ items: [{serviceId, description, qty, price}] }` |
| 7  | Encaissement d’un paiement       | POST   | `/api/v1/payments`                  | Enregistrer un paiement pour une facture.                                   | `{ invoiceId, cashId, cashierId, amount, method }` |
| 8  | Liste des paiements              | GET    | `/api/v1/payments`                  | Liste tous les paiements filtrables par période, facture, caissier.        | Query: `?startDate=&endDate=&invoiceId=&cashId=` |
| 9  | Détail d’un paiement             | GET    | `/api/v1/payments/:paymentId`       | Détail complet d’un paiement.                                              | Path: `paymentId` |
| 10 | Annulation d’un paiement         | POST   | `/api/v1/payments/:paymentId/cancel`| Annule un paiement enregistré.                                             | `{ reason, cancelledBy }` |
| 11 | Génération du reçu               | GET    | `/api/v1/payments/:paymentId/receipt` | Génère le reçu PDF ou JSON pour un paiement.                              | Query: `?format=pdf|json` |
| 12 | Rapport financier                | GET    | `/api/v1/reports/financial`         | Génère un rapport financier pour une période donnée.                        | Query: `?startDate=&endDate=&format=pdf|json` |
| 13 | Liste des logs / audit financier | GET    | `/api/v1/cash/logs`                  | Liste toutes les actions financières pour audit et traçabilité.            | Query: `?startDate=&endDate=&eventType=` |
| 14 | Détail d’un log / audit          | GET    | `/api/v1/cash/logs/:logId`          | Détail complet d’un événement financier pour audit.                        | Path: `logId` |
| 15 | Consultation du solde caisse     | GET    | `/api/v1/cash/:cashId/balance`      | Retourne le solde actuel d’une caisse ouverte.                              | Path: `cashId` |
| 16 | Remboursement / crédit facture   | POST   | `/api/v1/invoices/:invoiceId/refund` | Effectue un remboursement ou un ajustement sur une facture.                | `{ amount, method, reason, processedBy }` |

---

# 📄 Fiches explicatives de chaque action

## 1️⃣ Ouverture de caisse

- **Objectif** : Démarrer une session de caisse pour un caissier et enregistrer le montant initial.  
- **Champs importants** :
  - `cashId` : identifiant de la caisse  
  - `cashierId` : utilisateur qui ouvre la caisse  
  - `initialAmount` : montant initial  
  - `details` : répartition cash / chèque / mobile  

- **Audit** : action loggée avec `timestamp`, `userId`, `requestId`.

---

## 2️⃣ Clôture de caisse

- **Objectif** : Clôturer la caisse, vérifier encaissements et générer le rapport final.  
- **Champs importants** :
  - `finalAmount` : montant réel de clôture  
  - `details` : cash / cheque / mobile  
  - `observations` : notes sur écarts  

- **Audit** : action loggée avec contrôle RBAC strict.

---

## 3️⃣ Création d’une facture

- **Objectif** : Générer une facture pour un patient/service.  
- **Champs importants** :
  - `patientId`, `items`, `totalAmount`  
- **Audit** : facture traçable avec `invoiceId` et `userId`.

---

## 4️⃣ Consultation de factures

- **Objectif** : Lister toutes les factures selon filtres.  
- **Filtres possibles** :
  - `startDate`, `endDate`, `patientId`, `status`  

---

## 5️⃣ Détail d’une facture

- **Objectif** : Voir le détail complet d’une facture existante.  
- **Exemple** :
  - `invoiceId`, `items`, `totalAmount`, `payments`, `status`.

---

## 6️⃣ Ajout d’éléments à une facture

- **Objectif** : Ajouter des services ou produits après création.  
- **Champs** : `items: [{serviceId, description, qty, price}]`  

---

## 7️⃣ Encaissement d’un paiement

- **Objectif** : Enregistrer un paiement pour une facture.  
- **Champs** : `invoiceId`, `cashId`, `cashierId`, `amount`, `method`  

---

## 8️⃣ Liste des paiements

- **Objectif** : Voir tous les paiements selon filtres.  
- **Filtres possibles** : `startDate`, `endDate`, `invoiceId`, `cashId`.

---

## 9️⃣ Détail d’un paiement

- **Objectif** : Voir tous les détails d’un paiement.  
- **Champs** : `paymentId`, `invoiceId`, `amount`, `method`, `status`.

---

## 🔟 Annulation d’un paiement

- **Objectif** : Annuler un paiement et générer un audit.  
- **Champs** : `reason`, `cancelledBy`  

---

## 1️⃣1️⃣ Génération du reçu

- **Objectif** : Générer le reçu PDF/JSON pour un paiement.  
- **Champs** : `format=pdf|json`  

---

## 1️⃣2️⃣ Rapport financier

- **Objectif** : Résumer toutes les opérations financières sur une période.  
- **Champs** : `startDate`, `endDate`, `format=pdf|json`  
- **Détails inclus** : nombre de factures, total encaissé, total annulé, détail par service, mode de paiement, observations, audit.

---

## 1️⃣3️⃣ Liste des logs / audit financier

- **Objectif** : Consulter toutes les actions financières pour audit.  
- **Filtres possibles** : `startDate`, `endDate`, `eventType`  

---

## 1️⃣4️⃣ Détail d’un log / audit

- **Objectif** : Détail complet d’un événement pour traçabilité.  
- **Champs** : `logId`, `action`, `userId`, `invoiceId`, `paymentId`, `amount`, `timestamp`, `IP`, `userAgent`, `requestId`.

---

## 1️⃣5️⃣ Consultation du solde caisse

- **Objectif** : Voir le solde actuel d’une caisse ouverte.  
- **Champs** : `cashId`, `currentBalance`, `breakdown by method`.

---

## 1️⃣6️⃣ Remboursement / crédit facture

- **Objectif** : Rembourser ou ajuster une facture existante.  
- **Champs** : `amount`, `method`, `reason`, `processedBy`  
- **Audit** : action traçable avec `requestId` et `timestamp`.

---

## ✅ Bonnes pratiques HIS pour la partie financière

1. Tous les endpoints sont **protégés par RBAC strict**.  
2. Toutes les actions financières sont **auditées automatiquement**.  
3. Les transactions critiques sont réalisées avec **TypeORM + transactions MySQL**.  
4. Les reçus et rapports peuvent être générés en **PDF pour impression** ou JSON pour intégration.  
5. L’audit doit inclure **utilisateur, action, objet, timestamp, IP, user-agent, requestId** pour une **traçabilité complète**.  

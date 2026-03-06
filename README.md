# HIS Frontend

## Description

HIS Frontend est une application web frontend développée avec Vue.js 3 pour un système d'information hospitalier (HIS - Health Information System). Cette application est conçue pour gérer la réception des patients dans un hôpital, en permettant la création de fiches de réception, la recherche de patients et d'agents, ainsi que la gestion des paiements pour les patients publics.

L'application utilise une architecture modulaire avec des composants réutilisables, une gestion d'état centralisée avec Pinia, et une interface utilisateur moderne basée sur Tailwind CSS.

## Fonctionnalités

### Authentification
- Connexion sécurisée des utilisateurs
- Protection des routes avec des gardes d'authentification

### Tableau de Bord
- Vue d'ensemble avec des statistiques clés :
  - Nombre de patients aujourd'hui
  - Urgences
  - Consultations

### Module Réception
- **Sélection du type de patient** : Public ou Agent
- **Recherche de patients** : Recherche rapide et intelligente des patients existants
- **Recherche d'agents** : Pour les patients de type "Agent"
- **Gestion des relations familiales** : Pour les agents (conjoint, enfant, parent)
- **Formulaire de patient** : Création et modification des informations patient
- **Paiement** : Validation des paiements pour les patients publics
- **Gestion des fiches** : Liste des fiches de réception et détails

### Composants UI Réutilisables
- Boutons, badges, cartes, tableaux, inputs, etc.
- Loader global et système de notifications (toast)

### API Integration
- Intégration avec un backend via Axios pour :
  - Gestion des patients (CRUD, recherche)
  - Gestion des agents
  - Authentification

## Technologies Utilisées

- **Vue.js 3** : Framework JavaScript progressif pour la construction d'interfaces utilisateur
- **Vite** : Outil de build rapide pour le développement moderne
- **Vue Router 4** : Routage officiel pour Vue.js
- **Pinia** : Gestion d'état légère et intuitive pour Vue.js
- **Axios** : Client HTTP basé sur les promesses pour le navigateur et Node.js
- **Tailwind CSS** : Framework CSS utilitaire pour un développement rapide d'UI
- **JavaScript (ES6+)** : Langage de programmation

## Structure du Projet

```
src/
├── api/                    # Modules API pour les appels backend
│   ├── agents.api.js       # API pour les agents
│   ├── auth.api.js         # API pour l'authentification
│   ├── axios.js            # Configuration Axios
│   └── patients.api.js     # API pour les patients
├── assets/                 # Ressources statiques (images, etc.)
├── components/             # Composants réutilisables
│   ├── HelloWorld.vue      # Composant d'exemple
│   ├── layout/             # Composants de mise en page
│   │   ├── Sidebar.vue     # Barre latérale
│   │   └── Topbar.vue      # Barre supérieure
│   └── ui/                 # Composants UI de base
│       ├── BaseBadge.vue
│       ├── BaseButton.vue
│       ├── BaseCard.vue
│       ├── BaseInput.vue
│       ├── BaseTable.vue
│       ├── GlobalLoader.vue
│       └── ToastHost.vue
├── layouts/                # Layouts de page
│   ├── AuthLayout.vue      # Layout pour l'authentification
│   └── DashboardLayout.vue # Layout pour le tableau de bord
├── modules/                # Modules métier
│   └── reception/          # Module réception
│       ├── components/     # Composants spécifiques à la réception
│       │   ├── AgentRelationSelector.vue
│       │   ├── AgentResultCard.vue
│       │   ├── AgentSearch.vue
│       │   ├── FastPatientSearch.vue
│       │   ├── FichePayment.vue
│       │   ├── PatientForm.vue
│       │   ├── PatientSearch.vue
│       │   ├── PatientsTable.vue
│       │   └── PatientTypeSelector.vue
│       └── services/       # Services métier
│           └── reception.service.js
├── pages/                  # Pages de l'application
│   ├── auth/
│   │   └── Login.vue       # Page de connexion
│   ├── dashboard/
│   │   └── Dashboard.vue   # Page tableau de bord
│   └── reception/          # Pages réception
│       ├── ReceptionFicheDetail.vue
│       ├── ReceptionFichesList.vue
│       └── ReceptionPatient.vue
├── router/                 # Configuration du routage
│   └── index.js
├── stores/                 # Stores Pinia pour la gestion d'état
│   ├── auth.store.js       # Store authentification
│   ├── loader.store.js     # Store loader
│   ├── reception.store.js  # Store réception
│   └── toast.store.js      # Store notifications
├── utilis/                 # Utilitaires
│   └── auth.js             # Utilitaires d'authentification
├── App.vue                 # Composant racine
├── main.js                 # Point d'entrée de l'application
└── style.css               # Styles globaux
```

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone <url-du-depot>
   cd HIS
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer l'environnement** :
   - Assurez-vous que le backend API est en cours d'exécution et accessible.
   - Mettez à jour la configuration Axios dans `src/api/axios.js` si nécessaire pour pointer vers l'URL du backend.

## Utilisation

### Développement
Pour lancer le serveur de développement :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173` (port par défaut de Vite).

### Build pour la Production
Pour construire l'application pour la production :
```bash
npm run build
```

### Prévisualisation du Build
Pour prévisualiser le build de production :
```bash
npm run preview
```

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run preview` : Prévisualise le build de production

## Architecture

### Gestion d'État
L'application utilise Pinia pour la gestion d'état centralisée :
- **auth.store.js** : Gestion de l'état d'authentification
- **loader.store.js** : Gestion du loader global
- **reception.store.js** : Gestion de l'état du module réception
- **toast.store.js** : Gestion des notifications toast

### Routage
Le routage est géré par Vue Router avec des layouts :
- Routes publiques : `/login`
- Routes protégées : `/`, `/reception`, `/reception/fiches`, etc.

### API
Les appels API sont centralisés dans le dossier `api/` avec Axios comme client HTTP.

### Composants
- **Layouts** : Structures de page réutilisables
- **UI Components** : Composants de base pour l'interface
- **Module Components** : Composants spécifiques aux fonctionnalités métier

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajoute nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence [MIT](LICENSE). Voir le fichier LICENSE pour plus de détails.

## Auteurs

- [@FredDev12](https://github.com/FredDev12) - Développement initial

## Remerciements

- Vue.js Team pour le framework
- Tailwind CSS pour le framework CSS
- Toute autre contribution ou inspiration

# HIS Frontend

## Description

HIS Frontend est une application web frontend développée avec Vue.js 3 pour un système d'information hospitalier (HIS - Health Information System). Cette application est conçue pour gérer l'ensemble des opérations hospitalières, incluant la réception des patients, la gestion administrative, le triage, les consultations, et les modules financiers.

L'application utilise une architecture modulaire avec des composants réutilisables, une gestion d'état centralisée avec Pinia, et une interface utilisateur moderne basée sur Tailwind CSS. Elle intègre une API complète pour communiquer avec le backend et supporte l'authentification basée sur les rôles.

## Fonctionnalités

### Authentification

- Connexion sécurisée des utilisateurs avec gestion des rôles (admin, médecin, secrétaire, patient)
- Protection des routes avec des gardes d'authentification
- Gestion des profils utilisateurs et changement de mot de passe

### Tableau de Bord

- Vue d'ensemble avec des statistiques clés :
  - Nombre de patients aujourd'hui
  - Urgences
  - Consultations
  - Statistiques des agents

### Module Réception

- **Sélection du type de patient** : Public ou Agent
- **Recherche de patients** : Recherche rapide et intelligente des patients existants
- **Recherche d'agents** : Pour les patients de type "Agent"
- **Gestion des relations familiales** : Pour les agents (conjoint, enfant, parent)
- **Formulaire de patient** : Création et modification des informations patient
- **Paiement** : Validation des paiements pour les patients publics
- **Gestion des fiches** : Liste des fiches de réception et détails

### Module Admin

- Gestion complète des utilisateurs : création, modification, suppression
- Recherche et filtrage des utilisateurs
- Gestion des rôles et permissions
- Consultation des logs d'authentification

### Module Triage

- Liste des patients en triage avec recherche et filtres
- Détails complets des enregistrements de triage
- Gestion des statuts et priorités

### Module Consultation

- Gestion complète des consultations médicales : création, modification, consultation
- Recherche et filtrage avancés
- Saisie des constantes (poids, taille, température, tension)
- Calcul automatique de l'IMC
- Diagnostic et traitement
- Prescriptions et examens complémentaires

### Module Persons

- Gestion des personnes avec support multi-relations
- Enregistrement des patients comme agents, conjoints, parents ou publics
- Génération de numéros de facture et suivi des paiements

### Composants UI Réutilisables

- Boutons, badges, cartes, tableaux, inputs, modals, etc.
- Loader global et système de notifications (toast)
- Composants de recherche et sélecteurs

### API Integration

- Intégration complète avec un backend via Axios pour :
  - Gestion des patients (CRUD, recherche)
  - Gestion des agents et relations
  - Authentification et autorisation
  - Triage, consultations, imagerie, pharmacie, laboratoire
  - Audit et logs
  - Gestion financière (caisse)

## État du Projet

### Ce qui est Implémenté (Production-Ready)

- **Infrastructure Complète** : Authentification, gestion d'état (Pinia), composants UI, API intégration
- **Modules Fonctionnels** :
  - Authentification et gestion des utilisateurs
  - Réception des patients avec recherche intelligente
  - Administration complète (gestion utilisateurs, rôles)
  - Triage avec liste et détails
  - Gestion des personnes avec relations complexes
  - Tableau de bord avec statistiques
- **API Complète** : Tous les endpoints pour patients, agents, triage, consultations, etc.

### Ce qui est Partiellement Implémenté

- **Gestion des Fiches** : Liste et détails fonctionnels, paiement à finaliser
- **Profil Utilisateur** : Affichage basique, édition partielle

### Ce qui est Planifié (À Développer)

- **Module Caisse (Financier)** : Sessions caisse, facturation, rapports financiers
- **Modules Métiers** : Pharmacie, Laboratoire, Imagerie, Sortie (API prête, UI à créer)
- **Fonctionnalités Avancées** : Génération de reçus PDF, rapports détaillés, validation de formulaires complète
- **Améliorations** : Nettoyage du code (console.logs), activation des gestionnaires d'erreurs, intégration temps réel via Socket.io

### Prochaines Étapes Prioritaires

1. Développer le module Caisse
2. Créer les modules Pharmacie, Laboratoire, Imagerie, Sortie
3. Implémenter les rapports et reçus
4. Nettoyer et optimiser le code pour la production

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
│   ├── admin.api.js        # API administration
│   ├── agents.api.js       # API pour les agents
│   ├── audit.api.js        # API audit et logs
│   ├── auth.api.js         # API pour l'authentification
│   ├── axios.js            # Configuration Axios
│   ├── caisse.api.js       # API caisse financière
│   ├── consultation.api.js # API consultations
│   ├── imagerie.api.js     # API imagerie
│   ├── laboratoire.api.js  # API laboratoire
│   ├── patients.api.js     # API pour les patients
│   ├── pharmacie.api.js    # API pharmacie
│   ├── reception.api.js    # API réception
│   ├── socket.js           # Configuration Socket.io
│   ├── sortie.api.js       # API sortie
│   └── triage.api.js       # API triage
├── assets/                 # Ressources statiques
├── components/             # Composants réutilisables
│   ├── layout/             # Composants de mise en page
│   │   ├── Sidebar.vue     # Barre latérale
│   │   ├── SidebarMobile.vue # Barre latérale mobile
│   │   └── Topbar.vue      # Barre supérieure
│   ├── print/              # Composants d'impression
│   └── ui/                 # Composants UI de base
├── layouts/                # Layouts de page
│   ├── AuthLayout.vue      # Layout pour l'authentification
│   └── DashboardLayout.vue # Layout pour le tableau de bord
├── modules/                # Modules métier
│   ├── admin/              # Module administration
│   │   ├── components/     # Composants admin
│   │   ├── pages/          # Pages admin
│   │   ├── stores/         # Stores admin
│   │   └── types/          # Types admin
│   ├── caisse/             # Module caisse (à développer)
│   ├── consultation/       # Module consultation
│   ├── persons/            # Module personnes
│   ├── reception/          # Module réception
│   │   ├── agents/         # Sous-module agents
│   │   ├── components/     # Composants réception
│   │   ├── composables/    # Composables réception
│   │   ├── pages/          # Pages réception
│   │   ├── services/       # Services réception
│   │   ├── stores/         # Stores réception
│   │   └── types/          # Types réception
│   └── triage/             # Module triage
├── pages/                  # Pages de l'application
│   ├── admin/              # Pages admin
│   ├── auth/               # Pages auth
│   ├── dashboard/          # Pages dashboard
│   ├── fiches/             # Pages fiches
│   ├── profile/            # Pages profil
│   └── reception/          # Pages réception
├── router/                 # Configuration du routage
│   ├── index.js            # Routes principales
│   └── modules/            # Routes modulaires
├── shared/                 # Composants partagés
│   ├── components/         # Composants partagés
│   └── utils/              # Utilitaires partagés
├── stores/                 # Stores Pinia
│   ├── admin.store.js      # Store admin
│   ├── auth.store.js       # Store auth
│   ├── loader.store.js     # Store loader
│   ├── reception.store.js  # Store réception
│   └── toast.store.js      # Store notifications
├── utils/                  # Utilitaires
│   ├── auth.js             # Utilitaires auth
│   ├── errorFilter.js      # Filtrage erreurs
│   ├── errorHandler.js     # Gestion erreurs
│   └── pagination.js       # Pagination
├── App.vue                 # Composant racine
├── main.js                 # Point d'entrée
└── style.css               # Styles globaux
```

## Installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/FredDev12/his-frontend.git
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

- **auth.store.js** : Gestion de l'état d'authentification, profils, rôles
- **admin.store.js** : Gestion des utilisateurs et administration
- **loader.store.js** : Gestion du loader global
- **reception.store.js** : Gestion de l'état du module réception
- **toast.store.js** : Gestion des notifications toast

### Routage

Le routage est géré par Vue Router avec des layouts et une protection basée sur les rôles :

- Routes publiques : `/login`
- Routes protégées : `/`, `/admin`, `/reception`, `/triage`, `/fiches`, etc.
- Routes modulaires dans `router/modules/`
- Support des breadcrumbs et navigation conditionnelle

### API

Les appels API sont centralisés dans le dossier `api/` avec Axios comme client HTTP. Chaque module a son propre fichier API avec des endpoints complets pour CRUD et opérations spécialisées.

### Composants

- **Layouts** : Structures de page réutilisables (Auth, Dashboard)
- **UI Components** : Composants de base pour l'interface (BaseButton, BaseTable, etc.)
- **Module Components** : Composants spécifiques aux fonctionnalités métier
- **Shared Components** : Composants réutilisables entre modules

### Modules Métier

L'application est organisée en modules indépendants :

- **Admin** : Gestion utilisateurs et système
- **Reception** : Accueil et enregistrement patients
- **Triage** : Classification des urgences
- **Consultation** : Gestion des consultations médicales
- **Persons** : Gestion des personnes et relations
- **Caisse** : Module financier (planifié)

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

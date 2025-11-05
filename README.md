# 🎓 Suivi Académique - Application de Gestion de Projets Étudiants

Application React moderne pour le suivi et la gestion des projets académiques avec trois rôles distincts : **Admin**, **Professeur** et **Étudiant**.

## ✨ Fonctionnalités

### 👨‍💼 Administrateur
- Gestion complète des utilisateurs (création, modification, suppression)
- Gestion des projets académiques
- Tableau de bord avec statistiques
- Supervision du système

### 👨‍🏫 Professeur
- Suivi de l'avancement des projets
- Évaluation des tâches et rapports
- Gestion des étudiants assignés
- Tableau de bord personnalisé

### 👨‍🎓 Étudiant
- Consultation de ses projets
- Soumission de tâches
- Upload de rapports
- Suivi du statut de ses projets

## 🛠️ Technologies Utilisées

- **React 19** - Bibliothèque UI
- **Vite** - Build tool et dev server
- **React Router DOM** - Routing
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Composants UI
- **Axios** - Appels API
- **Context API** - Gestion d'état
- **lucide-react** - Icônes

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env (copier .env.example)
cp .env.example .env

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:8000/api
```

## 🏗️ Structure du Projet

Voir le fichier [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) pour la documentation complète de l'architecture.

### Organisation Principale

```
src/
├── components/     # Composants réutilisables
├── contexts/      # Contexts React (Auth)
├── hooks/         # Hooks personnalisés
├── layouts/       # Layouts par rôle
├── pages/         # Pages de l'application
├── services/      # Services API
└── utils/         # Utilitaires
```

## 🔐 Authentification

L'application utilise un système d'authentification basé sur JWT :

- **Login** : `/login`
- **Token stocké** : `localStorage`
- **Protection des routes** : `ProtectedRoute` avec vérification des rôles
- **Auto-redirection** : Redirection automatique selon le rôle après connexion

## 🛣️ Routes

### Routes Publiques
- `/login` - Page de connexion

### Routes Admin (`/admin/*`)
- `/admin` - Dashboard
- `/admin/users` - Gestion utilisateurs
- `/admin/projects` - Gestion projets
- `/admin/settings` - Paramètres

### Routes Professeur (`/professor/*`)
- `/professor` - Dashboard
- `/professor/projects` - Mes projets
- `/professor/evaluations` - Évaluations
- `/professor/students` - Mes étudiants

### Routes Étudiant (`/student/*`)
- `/student` - Dashboard
- `/student/projects` - Mes projets
- `/student/tasks` - Mes tâches
- `/student/reports` - Rapports

## 🔌 Connexion Backend

### Endpoints Requis

#### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify` - Vérification token

#### Utilisateurs (Admin)
- `GET /api/users` - Liste utilisateurs
- `GET /api/users/:id` - Détails utilisateur
- `POST /api/users` - Créer utilisateur
- `PUT /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

#### Projets
- `GET /api/projects` - Liste projets
- `GET /api/projects/:id` - Détails projet
- `POST /api/projects` - Créer projet
- `GET /api/projects/student/:id` - Projets d'un étudiant
- `GET /api/projects/professor/:id` - Projets d'un professeur

#### Tâches
- `GET /api/projects/:projectId/tasks` - Tâches d'un projet
- `POST /api/projects/:projectId/tasks` - Créer tâche
- `POST /api/projects/:projectId/tasks/:taskId/submit` - Soumettre tâche
- `POST /api/projects/:projectId/tasks/:taskId/evaluate` - Évaluer tâche

#### Rapports
- `GET /api/projects/:projectId/reports` - Rapports d'un projet
- `POST /api/projects/:projectId/reports` - Soumettre rapport (multipart/form-data)
- `GET /api/projects/:projectId/reports/:reportId/download` - Télécharger rapport
- `POST /api/projects/:projectId/reports/:reportId/evaluate` - Évaluer rapport

### Format de Réponse Attendue

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

## 🎨 Composants Principaux

### AuthContext
Contexte global pour l'authentification :
```jsx
const { user, login, logout, isAuthenticated, hasRole } = useAuth();
```

### ProtectedRoute
Protection des routes par rôle :
```jsx
<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
  <AdminLayout />
</ProtectedRoute>
```

### useRole Hook
Hook personnalisé pour les rôles :
```jsx
const { isAdmin, isProfessor, isStudent } = useRole();
```

## 📝 Exemples de Code

### Service API
```javascript
import api from '../lib/api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};
```

### Page avec Données
```jsx
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const MyPage = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    projectService.getAllProjects().then(setProjects);
  }, []);
  
  return <div>...</div>;
};
```

## 🚀 Déploiement

### Build Production
```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

### Variables d'Environnement Production
Assurez-vous de configurer `VITE_API_URL` avec l'URL de votre API de production.

## 📚 Documentation Complète

Consultez [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) pour :
- Arborescence détaillée
- Explication de chaque dossier
- Exemples de code
- Guide de connexion backend
- Bonnes pratiques

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est destiné à un usage académique.

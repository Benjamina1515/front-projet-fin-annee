# 📚 Structure du Projet - Suivi Académique

## 📁 Arborescence du Projet

```
projet-fin-annee/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Composants shadcn/ui
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── table.jsx
│   │   ├── Navbar.jsx            # Barre de navigation principale
│   │   ├── Sidebar.jsx           # Menu latéral selon le rôle
│   │   └── ProtectedRoute.jsx    # Composant de protection des routes
│   ├── contexts/
│   │   └── AuthContext.jsx       # Contexte d'authentification global
│   ├── hooks/
│   │   └── useRole.js            # Hook personnalisé pour les rôles
│   ├── layouts/
│   │   ├── AdminLayout.jsx       # Layout pour les administrateurs
│   │   ├── ProfessorLayout.jsx   # Layout pour les professeurs
│   │   └── StudentLayout.jsx     # Layout pour les étudiants
│   ├── lib/
│   │   ├── api.js                # Configuration Axios
│   │   └── utils.js              # Utilitaires (cn, etc.)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── UsersManagement.jsx
│   │   ├── professor/
│   │   │   └── ProfessorDashboard.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ProjectSubmission.jsx
│   │   └── Login.jsx
│   ├── services/
│   │   ├── authService.js         # Services d'authentification
│   │   ├── userService.js        # Services utilisateurs
│   │   ├── projectService.js     # Services projets
│   │   ├── taskService.js        # Services tâches
│   │   └── reportService.js      # Services rapports
│   ├── utils/
│   │   └── constants.js          # Constantes (rôles, statuts, etc.)
│   ├── App.jsx                   # Composant principal avec routes
│   ├── App.css
│   ├── index.css                 # Styles globaux + Tailwind
│   └── main.jsx                  # Point d'entrée
├── .env                          # Variables d'environnement (à créer)
├── components.json               # Configuration shadcn/ui
├── jsconfig.json                 # Configuration alias @
├── package.json
├── postcss.config.js             # Configuration PostCSS
├── tailwind.config.js            # Configuration Tailwind
├── vite.config.js                # Configuration Vite
└── README.md
```

## 🎯 Explication des Dossiers

### `/components`
- **Composants réutilisables** de l'application
- **`ui/`** : Composants shadcn/ui (Button, Card, Input, etc.)
- **`Navbar.jsx`** : Barre de navigation avec menu utilisateur
- **`Sidebar.jsx`** : Menu latéral adaptatif selon le rôle
- **`ProtectedRoute.jsx`** : Wrapper pour protéger les routes par rôle

### `/contexts`
- **`AuthContext.jsx`** : Gestion globale de l'authentification
  - État utilisateur et token
  - Fonctions login/logout
  - Vérification des rôles

### `/hooks`
- **`useRole.js`** : Hook personnalisé pour vérifier les rôles
  - `isAdmin`, `isProfessor`, `isStudent`
  - `hasRole(role)`, `hasAnyRole([roles])`

### `/layouts`
- **Layouts spécifiques** à chaque rôle avec Navbar + Sidebar
- Structure commune mais navigation adaptée

### `/lib`
- **`api.js`** : Instance Axios configurée
  - Base URL
  - Intercepteurs pour token
  - Gestion des erreurs 401
- **`utils.js`** : Utilitaires (fonction `cn` pour classes CSS)

### `/pages`
- **Pages organisées par rôle** dans des sous-dossiers
- **Pages publiques** à la racine (Login)

### `/services`
- **Services API séparés** par domaine fonctionnel
- Toutes les fonctions d'appels API
- Retournent des Promises avec les données

### `/utils`
- **`constants.js`** : Constantes partagées
  - Rôles (ADMIN, PROFESSOR, STUDENT)
  - Statuts (PROJECT_STATUS, TASK_STATUS)
  - Routes par rôle (ROLE_ROUTES)

## 🔐 Système d'Authentification

### AuthContext
```jsx
const { user, token, login, logout, isAuthenticated, hasRole } = useAuth();
```

### ProtectedRoute
```jsx
<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
  <AdminLayout />
</ProtectedRoute>
```

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

### Configuration API
Créer un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:8000/api
```

### Exemples d'Endpoints Backend

#### Laravel (PHP)
```php
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::get('/users', [UserController::class, 'index'])->middleware(['auth:sanctum', 'role:admin']);
```

#### Node.js/Express
```javascript
// routes/auth.js
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getProfile);
router.get('/users', authenticateToken, checkRole('admin'), userController.getAll);
```

## 📦 Dépendances Principales

- **react-router-dom** : Routing
- **axios** : Appels API
- **lucide-react** : Icônes
- **tailwindcss** : Styles
- **shadcn/ui** : Composants UI

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

## 💡 Prochaines Étapes

1. **Implémenter les pages manquantes** (Projects, Tasks, Evaluations)
2. **Ajouter la gestion de fichiers** (upload/download)
3. **Créer des modales** pour créer/éditer utilisateurs et projets
4. **Ajouter des notifications** (toast)
5. **Implémenter la pagination** pour les listes
6. **Ajouter des filtres et recherche**
7. **Créer des graphiques** pour les statistiques


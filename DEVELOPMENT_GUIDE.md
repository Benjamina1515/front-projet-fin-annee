# 🚀 Guide de Développement

## 🔧 Configuration Initiale

### 1. Variables d'Environnement
Créez un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Installation
```bash
npm install
```

### 3. Démarrage
```bash
npm run dev
```

## 📝 Ajouter une Nouvelle Page

### 1. Créer le fichier de page
```jsx
// src/pages/admin/NewPage.jsx
const NewPage = () => {
  return (
    <div>
      <h1>Ma Nouvelle Page</h1>
    </div>
  );
};

export default NewPage;
```

### 2. Ajouter la route dans App.jsx
```jsx
<Route path="new-page" element={<NewPage />} />
```

## 🔌 Ajouter un Nouveau Service API

### 1. Créer le service
```javascript
// src/services/newService.js
import api from '../lib/api';

export const newService = {
  getAll: async () => {
    const response = await api.get('/new-endpoint');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/new-endpoint', data);
    return response.data;
  },
};
```

### 2. Utiliser dans un composant
```jsx
import { useState, useEffect } from 'react';
import { newService } from '../services/newService';

const MyComponent = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    newService.getAll().then(setData);
  }, []);
  
  return <div>...</div>;
};
```

## 🎨 Utiliser les Composants shadcn/ui

### Ajouter un composant
```bash
npx shadcn@latest add dialog
```

### Utiliser dans votre code
```jsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const MyComponent = () => {
  return (
    <Card>
      <Button>Cliquez-moi</Button>
    </Card>
  );
};
```

## 🔐 Utiliser l'Authentification

### Dans un composant
```jsx
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin, isProfessor, isStudent } = useRole();
  
  if (!isAuthenticated) return <div>Non connecté</div>;
  
  return (
    <div>
      <p>Bonjour {user.name}</p>
      {isAdmin && <p>Vous êtes admin</p>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};
```

## 🛡️ Protéger une Route

### Route simple protégée
```jsx
<Route
  path="/my-route"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

### Route avec rôle spécifique
```jsx
<Route
  path="/admin-only"
  element={
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <AdminOnlyPage />
    </ProtectedRoute>
  }
/>
```

## 📊 Gestion d'État

### Avec Context API (déjà configuré)
```jsx
// AuthContext pour l'authentification
const { user, login, logout } = useAuth();
```

### Pour d'autres états globaux
Créer un nouveau contexte dans `src/contexts/` :
```jsx
// src/contexts/MyContext.jsx
import { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState(null);
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
```

## 🎯 Bonnes Pratiques

### 1. Organisation des fichiers
- Un composant = un fichier
- Groupes par fonctionnalité dans `/pages`
- Services API séparés par domaine

### 2. Naming
- Composants : PascalCase (`MyComponent.jsx`)
- Hooks : camelCase avec préfixe `use` (`useAuth.js`)
- Services : camelCase (`userService.js`)

### 3. Gestion des erreurs
```jsx
try {
  const data = await service.getData();
  setData(data);
} catch (error) {
  console.error('Erreur:', error);
  setError(error.response?.data?.message || 'Une erreur est survenue');
}
```

### 4. Loading States
```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await service.getData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

if (loading) return <div>Chargement...</div>;
```

## 🐛 Debugging

### Console Logs
```jsx
console.log('Données:', data);
console.error('Erreur:', error);
```

### React DevTools
- Installer l'extension Chrome/Firefox
- Inspecter les composants et l'état

### Network Tab
- Vérifier les requêtes API
- Voir les réponses et erreurs

## 📦 Build et Déploiement

### Build Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Variables d'Environnement Production
Assurez-vous que `VITE_API_URL` pointe vers votre API de production.

## 🔄 Workflow Typique

1. **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
2. **Développer** : Créer les composants, services, pages
3. **Tester** : Vérifier que tout fonctionne
4. **Commit** : `git commit -m "Ajout fonctionnalité X"`
5. **Push** : `git push origin feature/ma-fonctionnalite`
6. **Pull Request** : Créer une PR sur GitHub/GitLab

## 🎨 Styling avec Tailwind

### Classes utilitaires
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Contenu
</div>
```

### Responsive
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Grille responsive */}
</div>
```

### Dark Mode (si configuré)
```jsx
<div className="bg-white dark:bg-gray-800">
  Contenu adaptatif
</div>
```

## 📚 Ressources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Axios](https://axios-http.com)


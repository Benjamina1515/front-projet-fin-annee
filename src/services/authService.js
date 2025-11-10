import api from '../lib/api';

export const authService = {
  // Connexion
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Inscription
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Vérifier le token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Mettre à jour le profil courant (self-update)
  updateMe: async (data) => {
    const formData = new FormData();
    // Supporte FormData avec fichiers
    if (data.nom) formData.append('nom', data.nom);
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.matricule) formData.append('matricule', data.matricule);
    if (data.filiere) formData.append('filiere', data.filiere);
    if (data.niveau) formData.append('niveau', data.niveau);
    if (data.specialite) formData.append('specialite', data.specialite);
    if (data.grade) formData.append('grade', data.grade);
    if (data.avatar && data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }
    // Utilise POST pour éviter les soucis avec certains proxys, backend accepte POST/PUT
    const response = await api.post('/auth/me', formData);
    return response.data;
  },
};


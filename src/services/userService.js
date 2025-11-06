import api from '../lib/api';

export const userService = {
  // Récupérer tous les utilisateurs (Admin)
  getAllUsers: async () => {
    const response = await api.get('/users');
    // Laravel renvoie { success: true, users: [...] }
    return response.data?.users || response.data?.data || [];
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    // Laravel renvoie { success: true, user: {...} }
    return response.data?.user || response.data?.data;
  },

  // Créer un utilisateur (Admin)
  createUser: async (userData) => {
    const formData = new FormData();
    formData.append('nom', userData.nom);
    formData.append('email', userData.email);
    formData.append('role', userData.role);
    formData.append('password', userData.password);
    // Ajouter l'avatar seulement si c'est un fichier File
    if (userData.avatar && userData.avatar instanceof File) {
      formData.append('avatar', userData.avatar);
    }

    const response = await api.post('/users', formData, {
      // Ne pas définir Content-Type manuellement, axios le fera automatiquement avec le bon boundary
    });
    // Laravel renvoie { success: true, user: {...} }
    return response.data?.user || response.data?.data;
  },

  // Mettre à jour un utilisateur (avec avatar optionnel)
  updateUser: async (id, userData) => {
    const formData = new FormData();
    // Ajouter _method=PUT pour Laravel method spoofing (nécessaire pour FormData)
    formData.append('_method', 'PUT');
    if (userData.nom) formData.append('nom', userData.nom);
    if (userData.email) formData.append('email', userData.email);
    if (userData.role) formData.append('role', userData.role);
    if (userData.password) formData.append('password', userData.password);
    // Ajouter l'avatar seulement si c'est un fichier File (nouveau fichier sélectionné)
    if (userData.avatar && userData.avatar instanceof File) {
      formData.append('avatar', userData.avatar);
    }

    // Utiliser POST avec _method=PUT pour être compatible avec FormData
    const response = await api.post(`/users/${id}`, formData, {
      // Ne pas définir Content-Type manuellement, axios le fera automatiquement avec le bon boundary
    });
    // Laravel renvoie { success: true, user: {...} }
    return response.data?.user || response.data?.data;
  },

  // Supprimer un utilisateur (Admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};


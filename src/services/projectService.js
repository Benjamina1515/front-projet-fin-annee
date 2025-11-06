import api from '../lib/api';

export const projectService = {
  // Récupérer tous les projets du professeur connecté
  getAllProjects: async () => {
    const response = await api.get('/projets');
    return response.data?.projets || [];
  },

  // Récupérer un projet par ID avec détails
  getProjectById: async (id) => {
    const response = await api.get(`/projets/${id}`);
    return response.data?.projet;
  },

  // Créer un projet
  createProject: async (projectData) => {
    const response = await api.post('/projets', projectData);
    return response.data?.projet;
  },

  // Ajouter un sujet à un projet
  addSujet: async (sujetData) => {
    const response = await api.post('/sujets', sujetData);
    return response.data?.sujet;
  },

  // Répartir automatiquement les étudiants
  repartirEtudiants: async (projetId) => {
    const response = await api.post(`/projets/${projetId}/repartition`);
    return response.data?.projet;
  },
};


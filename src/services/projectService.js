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

  // Mettre à jour un projet
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projets/${id}`, projectData);
    return response.data?.projet;
  },

  // Supprimer un projet
  deleteProject: async (id) => {
    const response = await api.delete(`/projets/${id}`);
    return response.data;
  },

  // Ajouter un sujet à un projet
  addSujet: async (sujetData) => {
    const response = await api.post('/sujets', sujetData);
    return response.data?.sujet;
  },

  // Mettre à jour un sujet
  updateSujet: async (id, sujetData) => {
    const response = await api.put(`/sujets/${id}`, sujetData);
    return response.data?.sujet;
  },

  // Supprimer un sujet
  deleteSujet: async (id) => {
    const response = await api.delete(`/sujets/${id}`);
    return response.data;
  },

  // Répartir automatiquement les étudiants
  repartirEtudiants: async (projetId) => {
    const response = await api.post(`/projets/${projetId}/repartition`);
    return response.data?.projet;
  },
};


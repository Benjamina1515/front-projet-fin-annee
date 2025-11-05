import api from '../lib/api';

export const projectService = {
  // Récupérer tous les projets
  getAllProjects: async () => {
    const response = await api.get('/projects');
    // Laravel renvoie { success: true, projects: [...] }
    return response.data?.projects || response.data?.data || [];
  },

  // Récupérer un projet par ID
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    // Laravel renvoie { success: true, project: {...} }
    return response.data?.project || response.data?.data;
  },

  // Créer un projet (Admin)
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    // Laravel renvoie { success: true, project: {...} }
    return response.data?.project || response.data?.data;
  },

  // Mettre à jour un projet
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    // Laravel renvoie { success: true, project: {...} }
    return response.data?.project || response.data?.data;
  },

  // Supprimer un projet (Admin)
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Récupérer les projets d'un étudiant (filtrés automatiquement par Laravel)
  getStudentProjects: async (studentId) => {
    const response = await api.get('/projects');
    // Laravel filtre automatiquement selon le rôle, on reçoit tous les projets filtrés
    return response.data?.projects || response.data?.data || [];
  },

  // Récupérer les projets d'un professeur (filtrés automatiquement par Laravel)
  getProfessorProjects: async (professorId) => {
    const response = await api.get('/projects');
    // Laravel filtre automatiquement selon le rôle
    return response.data?.projects || response.data?.data || [];
  },
};


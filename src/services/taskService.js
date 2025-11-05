import api from '../lib/api';

export const taskService = {
  // Récupérer les tâches d'un projet
  getProjectTasks: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // Créer une tâche
  createTask: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  // Mettre à jour une tâche
  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Soumettre une tâche (Étudiant)
  submitTask: async (projectId, taskId, submissionData) => {
    const response = await api.post(`/projects/${projectId}/tasks/${taskId}/submit`, submissionData);
    return response.data;
  },

  // Évaluer une tâche (Professeur)
  evaluateTask: async (projectId, taskId, evaluationData) => {
    const response = await api.post(`/projects/${projectId}/tasks/${taskId}/evaluate`, evaluationData);
    return response.data;
  },
};


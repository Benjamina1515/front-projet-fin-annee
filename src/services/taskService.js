import api from '../lib/api';

export const taskService = {
  // Récupérer toutes les tâches de l'étudiant connecté
  getStudentTasks: async () => {
    const response = await api.get('/student/taches');
    return response.data?.taches || [];
  },

  // Récupérer les statistiques des tâches
  getStats: async () => {
    const response = await api.get('/student/taches/stats');
    return response.data?.stats || {};
  },

  // Récupérer une tâche spécifique
  getTask: async (taskId) => {
    const response = await api.get(`/student/taches/${taskId}`);
    return response.data?.tache;
  },

  // Créer une nouvelle tâche
  createTask: async (taskData) => {
    const response = await api.post('/student/taches', taskData);
    return response.data?.tache;
  },

  // Mettre à jour une tâche
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/student/taches/${taskId}`, taskData);
    return response.data?.tache;
  },

  // Supprimer une tâche
  deleteTask: async (taskId) => {
    const response = await api.delete(`/student/taches/${taskId}`);
    return response.data;
  },

  // Changer le statut d'une tâche
  updateStatus: async (taskId, statut) => {
    const response = await api.patch(`/student/taches/${taskId}/statut`, { statut });
    return response.data?.tache;
  },
};


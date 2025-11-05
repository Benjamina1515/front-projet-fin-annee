import api from '../lib/api';

export const reportService = {
  // Récupérer les rapports d'un projet
  getProjectReports: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/reports`);
    // Laravel renvoie { success: true, reports: [...] }
    return response.data?.reports || response.data?.data || [];
  },

  // Soumettre un rapport (Étudiant)
  submitReport: async (projectId, reportData) => {
    const formData = new FormData();
    if (reportData.file) {
      formData.append('file', reportData.file);
    }
    formData.append('titre', reportData.title || reportData.titre);
    formData.append('contenu', reportData.description || reportData.contenu || '');

    const response = await api.post(`/projects/${projectId}/reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Télécharger un rapport
  downloadReport: async (projectId, reportId) => {
    const response = await api.get(`/projects/${projectId}/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Évaluer un rapport (Professeur)
  evaluateReport: async (projectId, reportId, evaluationData) => {
    const response = await api.post(`/projects/${projectId}/reports/${reportId}/evaluate`, evaluationData);
    return response.data;
  },
};


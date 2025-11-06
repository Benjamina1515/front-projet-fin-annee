import api from '../lib/api';

export const profService = {
  // Créer un professeur
  createProf: async (profData) => {
    // profData est déjà un FormData
    const response = await api.post('/profs', profData);
    return response.data;
  },
};


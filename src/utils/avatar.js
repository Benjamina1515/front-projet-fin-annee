/**
 * Construit l'URL de l'avatar au format baseURL/storage/{nom-de-image}
 * @param {string} avatar - Le chemin de l'avatar stocké (ex: "images/nom-image.jpg")
 * @returns {string|null} - L'URL complète de l'avatar ou null si pas d'avatar
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  // Extraire le baseURL sans /api
  const baseURL = API_URL.replace('/api', '');
  
  // Extraire seulement le nom du fichier depuis le chemin (ex: "images/nom-image.jpg" -> "nom-image.jpg")
  const fileName = avatar.includes('/') ? avatar.split('/').pop() : avatar;
  
  // Construire l'URL au format baseURL/storage/{nom-de-image}
  return `${baseURL}/storage/${fileName}`;
};


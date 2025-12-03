/**
 * Construit l'URL complète d'une image uploadée
 * @param {string} filename - Le nom du fichier (ex: "profileImage-123456.jpg")
 * @returns {string} - L'URL complète de l'image
 */
export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // Utiliser la variable d'environnement pour l'URL de l'API
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Retirer /api de la fin si présent pour obtenir l'URL de base
  const baseUrl = apiUrl.replace(/\/api$/, '');
  
  // Construire l'URL complète
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Construit l'URL de base du backend (sans /api)
 * @returns {string} - L'URL de base
 */
export const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api$/, '');
};

/**
 * Construit l'URL de l'avatar par défaut selon le rôle
 * @param {string} role - Le rôle de l'utilisateur (PRODUCER ou MERCHANT)
 * @returns {string} - L'URL de l'avatar par défaut
 */
export const getDefaultAvatarUrl = (role) => {
  switch (role) {
    case 'PRODUCER':
      return '/images/default-avatars/producer-default.svg';
    case 'MERCHANT':
      return '/images/default-avatars/merchant-default.svg';
    default:
      return '/images/default-avatars/producer-default.svg';
  }
};


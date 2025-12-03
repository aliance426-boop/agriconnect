import axios from 'axios';

// Utiliser la variable d'environnement en production, localhost en développement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuration axios par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => {
    // Si une image de profil est incluse, utiliser FormData
    if (userData.profileImage) {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      return api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Sinon, envoyer comme JSON normal
    return api.post('/auth/register', userData);
  },
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Services des produits
export const productService = {
  getAll: (params = {}) => api.get('/products', { params }),
  getMyProducts: (page = 1, limit = 12) => api.get('/products/my-products', { params: { page, limit } }),
  create: (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/products/${id}`),
};

// Services des commandes
export const orderService = {
  getMyOrders: (page = 1, limit = 10) => api.get('/orders/my-orders', { params: { page, limit } }),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Services des utilisateurs
export const userService = {
  getProducers: (page = 1, limit = 12) => api.get('/users/producers', { params: { page, limit } }),
  getMerchants: () => api.get('/users/merchants'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  uploadProfileImage: (formData) => api.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Services du chatbot
export const chatbotService = {
  getConversations: () => api.get('/chatbot/conversations'),
  createConversation: (title) => api.post('/chatbot/conversations', { title }),
  sendMessage: (conversationId, content) => api.post(`/chatbot/conversations/${conversationId}/messages`, { content }),
  deleteConversation: (conversationId) => api.delete(`/chatbot/conversations/${conversationId}`),
};

// Services des favoris
export const favoriteService = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (producerId) => api.post(`/favorites/${producerId}`),
  removeFavorite: (producerId) => api.delete(`/favorites/${producerId}`),
  checkFavorite: (producerId) => api.get(`/favorites/check/${producerId}`),
};

export default api;



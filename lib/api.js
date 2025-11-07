import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// Books API functions
export const booksAPI = {
  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },
  
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  
  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },
  
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
  
  searchBooks: async (query, params = {}) => {
    const response = await api.get('/books/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
  
  updateBookStock: async (id, stockData) => {
    const response = await api.patch(`/books/${id}/stock`, stockData);
    return response.data;
  },
  
  getRelatedBooks: async (id) => {
    const response = await api.get(`/books/${id}/related`);
    return response.data;
  },
};

// Borrows API functions
export const borrowsAPI = {
  borrowBook: async (bookId) => {
    const response = await api.post('/borrows', { bookId });
    return response.data;
  },
  
  returnBook: async (borrowId) => {
    const response = await api.patch(`/borrows/${borrowId}/return`);
    return response.data;
  },
  
  getActiveBorrows: async () => {
    const response = await api.get('/borrows/active');
    return response.data;
  },
  
  getAllBorrows: async (params = {}) => {
    const response = await api.get('/borrows', { params });
    return response.data;
  },
  
  getBorrowHistory: async (userId, params = {}) => {
    const response = await api.get(`/borrows/history/${userId}`, { params });
    return response.data;
  },
  
  getOverdueBorrows: async () => {
    const response = await api.get('/borrows/overdue');
    return response.data;
  },
  
  createBorrowAdmin: async (bookId, userId) => {
    const response = await api.post('/borrows/admin', { bookId, userId });
    return response.data;
  },
  
  deleteBorrow: async (borrowId) => {
    const response = await api.delete(`/borrows/${borrowId}`);
    return response.data;
  },
};

// Users API functions
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },
  
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Dashboard API functions
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getPopularBooks: async (limit = 10) => {
    const response = await api.get('/dashboard/popular-books', { params: { limit } });
    return response.data;
  },
  
  getActiveUsers: async (limit = 10) => {
    const response = await api.get('/dashboard/active-users', { params: { limit } });
    return response.data;
  },
  
  getBorrowingTrends: async (days = 30) => {
    const response = await api.get('/dashboard/trends', { params: { days } });
    return response.data;
  },
};

// Favorites API functions
export const favoritesAPI = {
  addFavorite: async (bookId) => {
    const response = await api.post('/favorites', { bookId });
    return response.data;
  },
  
  getFavorites: async (params = {}) => {
    const response = await api.get('/favorites', { params });
    return response.data;
  },
  
  removeFavorite: async (favoriteId) => {
    const response = await api.delete(`/favorites/${favoriteId}`);
    return response.data;
  },
  
  toggleReadStatus: async (favoriteId, isRead) => {
    const response = await api.patch(`/favorites/${favoriteId}/read`, { isRead });
    return response.data;
  },
  
  checkFavorite: async (bookId) => {
    const response = await api.get(`/favorites/check/${bookId}`);
    return response.data;
  },
};

export default api;


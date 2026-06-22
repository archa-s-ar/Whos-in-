import axios from 'axios';

// Create an instance of Axios.
// Since we have configured Vite proxy, we can use relative paths ('/api').
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('whos_in_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clean up local storage if token is invalid/expired
      localStorage.removeItem('whos_in_token');
      localStorage.removeItem('whos_in_user');
      // Redirecting is handled inside AuthContext or components, but we'll flag it
    }
    return Promise.reject(error);
  }
);

// API client endpoints definitions
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data)
};

export const teamsAPI = {
  getTeams: (search = '', category = '') => 
    api.get(`/api/teams?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`),
  getTeamById: (id) => api.get(`/api/teams/${id}`),
  createTeam: (data) => api.post('/api/teams', data),
  updateTeam: (id, data) => api.put(`/api/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/api/teams/${id}`)
};

export const requestsAPI = {
  submitRequest: (data) => api.post('/api/requests', data),
  getIncomingRequests: () => api.get('/api/requests/incoming'),
  processRequest: (id, status) => api.put(`/api/requests/${id}`, { status })
};

export const usersAPI = {
  getUserProfile: (id) => api.get(`/api/users/${id}`)
};

export const adminAPI = {
  getMetrics: () => api.get('/api/admin/metrics'),
  getUsers: () => api.get('/api/admin/users'),
  getTeams: () => api.get('/api/admin/teams'),
  toggleSuspend: (id) => api.put(`/api/admin/users/${id}/suspend`),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`)
};

export default api;

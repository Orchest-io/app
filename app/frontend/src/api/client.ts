import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Request interceptor: attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('orchest_user_id');
  if (userId) {
    config.headers['Authorization'] = `Bearer ${userId}`;
  }
  return config;
});

// Response interceptor: redirect to / on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

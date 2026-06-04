import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

axios.defaults.withCredentials = true;

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 5000,
  withCredentials: true,
});

// Request interceptor: attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('orchest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let queue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  queue = [];
};

// Response interceptor: handle 401 with refresh token logic
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't retry if not 401, already retried, or refresh endpoint itself failed
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if this is a login/register request (user is trying to authenticate)
    if (original.url?.includes('/auth/login') || original.url?.includes('/auth/register') || original.url?.includes('/auth/google')) {
      return Promise.reject(error);
    }

    // Don't try to refresh if we don't have a refresh token
    const refreshToken = localStorage.getItem('orchest_refresh_token');
    if (!refreshToken) {
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Don't retry the refresh endpoint itself
    if (original.url?.includes('/auth/refresh')) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
      });

      localStorage.setItem('orchest_token', data.accessToken);
      localStorage.setItem('orchest_refresh_token', data.refreshToken);

      apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (err) {
      processQueue(err, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;

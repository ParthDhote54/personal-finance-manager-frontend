import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    config.wakeupTimer = setTimeout(() => {
      console.warn("Server waking up...");
    }, 3000);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    clearTimeout(response.config.wakeupTimer);
    return response;
  },
  (error) => {
    if (error.config && error.config.wakeupTimer) {
      clearTimeout(error.config.wakeupTimer);
    }
    // Let the error propagate naturally, AuthContext and ProtectedRoute will handle it
    return Promise.reject(error);
  }
);

export default api;

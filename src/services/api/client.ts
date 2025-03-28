
import axios from 'axios';

/**
 * API Client
 * Base configuration for making API requests
 */

// Update API base URL logic to handle remote environments
export const API_BASE_URL = (() => {
  // Check if we're in a production or preview environment
  const isRemoteEnv = typeof window !== 'undefined' && 
    (window.location.hostname.includes('lovable.app') || 
     window.location.hostname.includes('vercel.app'));
  
  // For remote environments, use relative URL to make requests to the same domain
  if (isRemoteEnv) {
    return '/api';
  }
  
  // For local development, use the full URL with localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
})();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log requests in development
apiClient.interceptors.request.use(config => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      console.error('API Network Error: Unable to connect to API server. Please check your connection or server status.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

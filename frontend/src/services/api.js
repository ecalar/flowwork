import axios from 'axios';

// Creamos una instancia configurada de Axios
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});


api.interceptors.request.use((config) => {
  const token = eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJFbnJpcXVlIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNjA3MjcwLCJleHAiOjE3ODA2OTM2NzB9.bjt0PqhIUUwQ0QYr0SUM86Lcyb2S9mi_-gwTydPxJQY;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
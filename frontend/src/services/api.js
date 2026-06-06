import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8084/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowwork_token');

  if (token) {
    const cleanToken = token.replace('Bearer ', '').trim();
    config.headers.Authorization = `Bearer ${cleanToken}`;

    console.log("Enviando Header Auth:", config.headers.Authorization);
  }
  return config;
});
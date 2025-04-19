// axiosInstance.js
import axios from 'axios';

const setupAxiosInterceptors = (token) => {
  const axiosInstance = axios.create();

  axiosInstance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return axiosInstance;
};

export default setupAxiosInterceptors;

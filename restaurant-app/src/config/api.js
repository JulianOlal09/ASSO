import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuración base de la API
// IMPORTANTE: Cambia esta IP por la IP local de tu computadora
// Para obtenerla:
// - Windows: ejecuta "ipconfig" en cmd
// - Mac: ejecuta "ifconfig | grep inet" en terminal
// - Linux: ejecuta "hostname -I" en terminal
const LOCAL_IP = '192.168.100.196'; // ⚠️ Tu IP Local

// Usar localhost en web, IP local en dispositivos móviles
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:4000/api'
  : `http://${LOCAL_IP}:4000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };

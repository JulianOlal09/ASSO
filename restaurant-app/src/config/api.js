import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Helper para usar sessionStorage en web y AsyncStorage en móvil
const storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      sessionStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key) {
    if (Platform.OS === 'web') {
      return sessionStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key) {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

// Configuración base de la API
// IMPORTANTE: Cambia esta IP por la IP local de tu computadora
// Para obtenerla:
// - Windows: ejecuta "ipconfig" en cmd
// - Mac: ejecuta "ifconfig | grep inet" en terminal
// - Linux: ejecuta "hostname -I" en terminal
const LOCAL_IP = '192.168.100.192'; // ⚠️ Tu IP Local

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
    const token = await storage.getItem('token');
    console.log('🔑 Token para la petición:', token ? 'Existe' : 'No existe');
    console.log('📡 Petición:', config.method.toUpperCase(), config.url);
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
      await storage.removeItem('token');
      await storage.removeItem('usuario');
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };

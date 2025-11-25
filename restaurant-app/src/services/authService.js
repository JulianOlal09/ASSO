import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Helper para usar sessionStorage en web y AsyncStorage en móvil
const storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      // En web usamos sessionStorage para que cada nueva pestaña/ventana inicie sin sesión
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

class AuthService {
  async login(email, password) {
    try {
      console.log('📡 Intentando login con:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;

      // Guardar token y datos del usuario
      console.log('💾 Guardando token y usuario...');
      await storage.setItem('token', token);
      await storage.setItem('usuario', JSON.stringify(usuario));
      console.log('✅ Token y usuario guardados correctamente');

      return { token, usuario };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error.response?.data || error;
    }
  }

  async registro(nombre, email, password, rol) {
    try {
      const response = await api.post('/auth/registro', {
        nombre,
        email,
        password,
        rol,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async logout() {
    console.log('🗑️ Eliminando token y usuario...');
    await storage.removeItem('token');
    await storage.removeItem('usuario');
    console.log('✅ Sesión cerrada correctamente');
  }

  async getUsuarioActual() {
    try {
      console.log('🔑 Intentando recuperar usuario...');
      const usuarioStr = await storage.getItem('usuario');
      const token = await storage.getItem('token');
      console.log('📦 Usuario string:', usuarioStr ? 'Existe' : 'No existe');
      console.log('🔐 Token:', token ? 'Existe' : 'No existe');

      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        console.log('✅ Usuario recuperado:', usuario.nombre, '-', usuario.rol);
        return usuario;
      }

      console.log('⚠️ No hay usuario guardado');
      return null;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return null;
    }
  }

  async isAuthenticated() {
    const token = await storage.getItem('token');
    return !!token;
  }

  async getToken() {
    return await storage.getItem('token');
  }
}

export default new AuthService();

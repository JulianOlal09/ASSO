import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;

      // Guardar token y datos del usuario
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));

      return { token, usuario };
    } catch (error) {
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
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  }

  async getUsuarioActual() {
    try {
      const usuario = await AsyncStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }
}

export default new AuthService();

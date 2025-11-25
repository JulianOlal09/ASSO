import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(email, password) {
    try {
      console.log('📡 Intentando login con:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;

      // Guardar token y datos del usuario
      console.log('💾 Guardando token y usuario en AsyncStorage...');
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
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
    console.log('🗑️ Eliminando token y usuario de AsyncStorage...');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    console.log('✅ Sesión cerrada correctamente');
  }

  async getUsuarioActual() {
    try {
      console.log('🔑 Intentando recuperar usuario de AsyncStorage...');
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const token = await AsyncStorage.getItem('token');
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
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  async getToken() {
    return await AsyncStorage.getItem('token');
  }
}

export default new AuthService();

import api from '../config/api';

class UsuariosService {
  async obtenerUsuarios() {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerUsuarioPorId(id) {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async actualizarUsuario(id, usuario) {
    try {
      const response = await api.put(`/usuarios/${id}`, usuario);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async cambiarPassword(id, passwordActual, passwordNueva) {
    try {
      const response = await api.put(`/usuarios/${id}/password`, {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async eliminarUsuario(id) {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new UsuariosService();

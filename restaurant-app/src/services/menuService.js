import api from '../config/api';

class MenuService {
  async obtenerMenuCompleto() {
    try {
      const response = await api.get('/menu/menu-completo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerCategorias() {
    try {
      const response = await api.get('/menu/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPlatillos(categoriaId = null) {
    try {
      const url = categoriaId
        ? `/menu/platillos?categoria_id=${categoriaId}`
        : '/menu/platillos';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPlatilloPorId(id) {
    try {
      const response = await api.get(`/menu/platillos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async crearPlatillo(platillo) {
    try {
      const response = await api.post('/menu/platillos', platillo);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async actualizarPlatillo(id, platillo) {
    try {
      const response = await api.put(`/menu/platillos/${id}`, platillo);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async eliminarPlatillo(id) {
    try {
      const response = await api.delete(`/menu/platillos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new MenuService();

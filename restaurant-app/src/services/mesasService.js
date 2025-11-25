import api from '../config/api';

class MesasService {
  async obtenerMesas() {
    try {
      const response = await api.get('/mesas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerMesaPorId(id) {
    try {
      const response = await api.get(`/mesas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async crearMesa(mesa) {
    try {
      const response = await api.post('/mesas', mesa);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async actualizarMesa(id, mesa) {
    try {
      const response = await api.put(`/mesas/${id}`, mesa);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async eliminarMesa(id) {
    try {
      const response = await api.delete(`/mesas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async generarQR(id) {
    try {
      const response = await api.get(`/mesas/${id}/qr`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async cambiarEstado(id, estado) {
    try {
      const response = await api.put(`/mesas/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPedidosMesa(id) {
    try {
      const response = await api.get(`/mesas/${id}/pedidos`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async liberarMesa(id) {
    try {
      const response = await api.put(`/mesas/${id}/liberar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new MesasService();

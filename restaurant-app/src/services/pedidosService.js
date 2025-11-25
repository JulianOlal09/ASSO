import api from '../config/api';

class PedidosService {
  async crearPedido(mesaId, platillos, notas = '') {
    try {
      const response = await api.post('/pedidos', {
        mesa_id: mesaId,
        platillos,
        notas,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPedidos(estado = null, mesaId = null) {
    try {
      let url = '/pedidos?';
      if (estado) url += `estado=${estado}&`;
      if (mesaId) url += `mesa_id=${mesaId}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPedidoPorId(id) {
    try {
      const response = await api.get(`/pedidos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async actualizarEstadoPedido(id, estado) {
    try {
      console.log(`📡 Llamando API para actualizar pedido ${id} a estado: ${estado}`);
      const response = await api.put(`/pedidos/${id}/estado`, { estado });
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en actualizarEstadoPedido:', error);
      console.error('❌ Error response:', error.response);
      throw error.response?.data || error;
    }
  }

  async actualizarEstadoItem(id, estado) {
    try {
      const response = await api.put(`/pedidos/item/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async cancelarPedido(id) {
    try {
      const response = await api.delete(`/pedidos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPedidosCocina() {
    try {
      const response = await api.get('/pedidos/cocina');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new PedidosService();

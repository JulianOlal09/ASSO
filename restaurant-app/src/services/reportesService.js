import api from '../config/api';

class ReportesService {
  async obtenerEstadisticasGenerales() {
    try {
      const response = await api.get('/reportes/estadisticas-generales');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerReporteVentas(fechaInicio = null, fechaFin = null) {
    try {
      let url = '/reportes/ventas';
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerPlatillosMasVendidos(limite = 10) {
    try {
      const response = await api.get(`/reportes/platillos-mas-vendidos?limite=${limite}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerInventarioBajo() {
    try {
      const response = await api.get('/reportes/inventario-bajo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async obtenerRendimientoMeseros(fechaInicio = null, fechaFin = null) {
    try {
      let url = '/reportes/rendimiento-meseros';
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new ReportesService();

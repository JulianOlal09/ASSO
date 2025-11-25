import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import mesasService from '../services/mesasService';
import pedidosService from '../services/pedidosService';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

// Helper para confirmación compatible con web y móvil
const confirmar = (titulo, mensaje, onConfirm, onCancel) => {
  if (Platform.OS === 'web') {
    const resultado = window.confirm(`${titulo}\n\n${mensaje}`);
    if (resultado) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel', onPress: onCancel },
        { text: 'Confirmar', style: 'default', onPress: onConfirm }
      ]
    );
  }
};

// Helper para alertas compatible con web y móvil
const mostrarAlerta = (titulo, mensaje, callback) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    if (callback) callback();
  } else {
    Alert.alert(titulo, mensaje, [{ text: 'OK', onPress: callback }]);
  }
};

export default function DetalleMesaScreen({ route, navigation }) {
  const { mesaId } = route.params;
  const [mesa, setMesa] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarDatos();

    // Conectar WebSocket para actualizaciones en tiempo real
    const socket = io(API_URL.replace('/api', ''));
    socket.emit('join-mesa', mesaId);

    socket.on('pedido-confirmado', () => {
      cargarDatos();
    });

    socket.on('pedido-actualizado', () => {
      cargarDatos();
    });

    socket.on('item-actualizado', () => {
      cargarDatos();
    });

    return () => {
      socket.disconnect();
    };
  }, [mesaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(false);
      const [mesaData, pedidosData] = await Promise.all([
        mesasService.obtenerMesaPorId(mesaId),
        mesasService.obtenerPedidosMesa(mesaId),
      ]);

      setMesa(mesaData);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar mesa:', error);
      setError(true);
      Alert.alert('Error', 'No se pudieron cargar los datos de la mesa', [
        { text: 'Reintentar', onPress: () => cargarDatos() },
        { text: 'Volver', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const marcarPedidoEntregado = async (pedidoId) => {
    console.log('🔄 Intentando marcar pedido como entregado:', pedidoId);

    confirmar(
      'Marcar como Entregado',
      '¿Confirmas que este pedido ha sido entregado al cliente?',
      async () => {
        try {
          console.log('✅ Confirmado. Actualizando pedido:', pedidoId);
          setLoading(true);

          const resultado = await pedidosService.actualizarEstadoPedido(pedidoId, 'entregado');
          console.log('✅ Pedido actualizado exitosamente:', resultado);

          // Recargar datos para actualizar la vista
          await cargarDatos();

          mostrarAlerta(
            'Pedido Entregado',
            'El pedido ha sido marcado como entregado correctamente.\n\n' +
            '✓ Si todos los pedidos están entregados, ahora puedes liberar la mesa.'
          );
        } catch (error) {
          console.error('❌ Error completo al marcar pedido:', error);
          console.error('❌ Error response:', error.response);
          console.error('❌ Error data:', error.response?.data);

          const mensajeError = error.error || error.message || 'No se pudo marcar el pedido como entregado';

          mostrarAlerta(
            'Error',
            `No se pudo marcar el pedido como entregado.\n\nDetalle: ${mensajeError}`
          );
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const liberarMesa = async () => {
    try {
      await mesasService.liberarMesa(mesaId);
      Alert.alert(
        'Éxito',
        `Mesa ${mesa.numero} liberada correctamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const mensaje = error.error || 'No se pudo liberar la mesa';
      Alert.alert('Error', mensaje);
    }
  };

  const confirmarLiberarMesa = () => {
    const pedidosActivos = pedidos.filter(
      p => p.estado !== 'entregado' && p.estado !== 'cancelado'
    );

    if (pedidosActivos.length > 0) {
      mostrarAlerta(
        'No se puede liberar',
        `La mesa tiene ${pedidosActivos.length} pedido(s) activo(s). Debes marcar todos los pedidos como entregados antes de liberar la mesa.`
      );
      return;
    }

    confirmar(
      'Liberar Mesa',
      `¿Estás seguro de que deseas liberar la Mesa ${mesa.numero}?\n\nEsto cambiará su estado a disponible.`,
      () => liberarMesa()
    );
  };


  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return '#4CAF50';
      case 'ocupada':
        return '#FF5722';
      case 'reservada':
        return '#FF9800';
      case 'mantenimiento':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getEstadoPedidoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#FF9800';
      case 'en_preparacion':
        return '#2196F3';
      case 'listo':
        return '#4CAF50';
      case 'entregado':
        return '#9E9E9E';
      case 'cancelado':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getEstadoPedidoLabel = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '⏳ Pendiente';
      case 'en_preparacion':
        return '🔥 En Preparación';
      case 'listo':
        return '✅ Listo para Servir';
      case 'entregado':
        return '✓ Entregado';
      case 'cancelado':
        return '✗ Cancelado';
      default:
        return estado;
    }
  };

  const calcularTotalPedido = (pedido) => {
    if (!pedido.items) return 0;
    const items = Array.isArray(pedido.items) ? pedido.items : JSON.parse(pedido.items);
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  };

  if (loading && !mesa) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error && !mesa) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>⚠️ Error al cargar la mesa</Text>
        <TouchableOpacity style={styles.btnRetry} onPress={cargarDatos}>
          <Text style={styles.btnRetryText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnBack2} onPress={() => navigation.goBack()}>
          <Text style={styles.btnBackText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mesa) {
    return null;
  }

  const pedidosActivos = pedidos.filter(
    (p) => p.estado !== 'entregado' && p.estado !== 'cancelado'
  );

  const totalGeneral = pedidos
    .filter(p => p.estado !== 'cancelado')
    .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.btnBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesa {mesa.numero}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Info de la Mesa */}
        <View style={styles.mesaInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número:</Text>
            <Text style={styles.infoValue}>Mesa {mesa.numero}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Capacidad:</Text>
            <Text style={styles.infoValue}>👥 {mesa.capacidad} personas</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mesero:</Text>
            <Text style={styles.infoValue}>{mesa.mesero_nombre || 'Sin asignar'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: getEstadoColor(mesa.estado) },
              ]}
            >
              <Text style={styles.estadoText}>
                {mesa.estado.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Consumo:</Text>
            <Text style={[styles.infoValue, { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' }]}>
              ${totalGeneral.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Botón de Acción: Liberar Mesa */}
        <TouchableOpacity
          style={[
            styles.btnLiberarFull,
            pedidosActivos.length > 0 && styles.btnLiberarDisabled
          ]}
          onPress={confirmarLiberarMesa}
          disabled={pedidosActivos.length > 0}
        >
          <Text style={styles.btnLiberarIcon}>🔓</Text>
          <Text style={styles.btnLiberarText}>
            {pedidosActivos.length > 0 ? 'Tiene Pedidos Activos - No se puede liberar' : 'Liberar Mesa'}
          </Text>
        </TouchableOpacity>

        {/* Resumen de Pedidos */}
        <View style={styles.resumenContainer}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Total Pedidos:</Text>
            <Text style={styles.resumenValue}>{pedidos.length}</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Activos:</Text>
            <Text style={[styles.resumenValue, { color: '#FF9800' }]}>
              {pedidosActivos.length}
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Entregados:</Text>
            <Text style={[styles.resumenValue, { color: '#4CAF50' }]}>
              {pedidos.filter(p => p.estado === 'entregado').length}
            </Text>
          </View>
        </View>

        {/* Pedidos Activos */}
        <Text style={styles.sectionTitle}>
          📋 Pedidos Activos ({pedidosActivos.length})
        </Text>

        {pedidosActivos.length > 0 ? (
          pedidosActivos.map((pedido) => {
            const items = Array.isArray(pedido.items)
              ? pedido.items
              : (pedido.items ? JSON.parse(pedido.items) : []);
            const total = parseFloat(pedido.total || 0);

            return (
              <View key={pedido.id} style={styles.pedidoCard}>
                <View style={styles.pedidoHeader}>
                  <View>
                    <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                    <Text style={styles.pedidoFecha}>
                      {new Date(pedido.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.estadoPedidoBadge,
                      { backgroundColor: getEstadoPedidoColor(pedido.estado) },
                    ]}
                  >
                    <Text style={styles.estadoPedidoText}>
                      {getEstadoPedidoLabel(pedido.estado)}
                    </Text>
                  </View>
                </View>

                {/* Items del Pedido */}
                {items.length > 0 && (
                  <View style={styles.itemsContainer}>
                    <Text style={styles.itemsTitle}>Platillos:</Text>
                    {items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                        <View style={styles.itemDetalle}>
                          <Text style={styles.itemNombre}>
                            {item.platillo_nombre || item.nombre}
                          </Text>
                          {item.notas_especiales && (
                            <Text style={styles.itemNotas}>
                              📝 {item.notas_especiales}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.itemPrecio}>
                          ${parseFloat(item.subtotal || 0).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Notas del Pedido */}
                {pedido.notas && (
                  <View style={styles.notasContainer}>
                    <Text style={styles.notasText}>📝 {pedido.notas}</Text>
                  </View>
                )}

                {/* Footer con Total y Acciones */}
                <View style={styles.pedidoFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      ${total.toFixed(2)}
                    </Text>
                  </View>

                  {pedido.estado === 'listo' && (
                    <TouchableOpacity
                      style={styles.btnEntregar}
                      onPress={() => marcarPedidoEntregado(pedido.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.btnEntregarIcon}>✓</Text>
                      <Text style={styles.btnEntregarText}>Marcar Entregado</Text>
                    </TouchableOpacity>
                  )}

                  {pedido.estado === 'pendiente' && (
                    <View style={styles.estadoInfo}>
                      <Text style={styles.estadoInfoText}>⏳ En espera de cocina</Text>
                    </View>
                  )}

                  {pedido.estado === 'en_preparacion' && (
                    <View style={styles.estadoInfo}>
                      <Text style={styles.estadoInfoText}>🔥 Preparándose en cocina</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay pedidos activos en esta mesa
            </Text>
          </View>
        )}

        {/* Historial de Pedidos Completados */}
        {pedidos.filter(p => p.estado === 'entregado').length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              ✓ Pedidos Entregados ({pedidos.filter(p => p.estado === 'entregado').length})
            </Text>
            {pedidos
              .filter(p => p.estado === 'entregado')
              .map((pedido) => {
                const items = Array.isArray(pedido.items)
                  ? pedido.items
                  : (pedido.items ? JSON.parse(pedido.items) : []);

                return (
                  <View key={pedido.id} style={[styles.pedidoCard, styles.pedidoEntregado]}>
                    <View style={styles.pedidoHeader}>
                      <View>
                        <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                        <Text style={styles.pedidoFecha}>
                          {new Date(pedido.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.estadoPedidoBadge,
                          { backgroundColor: getEstadoPedidoColor(pedido.estado) },
                        ]}
                      >
                        <Text style={styles.estadoPedidoText}>
                          {getEstadoPedidoLabel(pedido.estado)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.itemsResumen}>
                      <Text style={styles.itemsResumenText}>
                        {items.length} {items.length === 1 ? 'platillo' : 'platillos'}
                      </Text>
                      <Text style={styles.totalEntregado}>
                        ${parseFloat(pedido.total || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  btnRetry: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnRetryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnBack2: {
    backgroundColor: '#666',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnBackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  btnBack: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 15,
    paddingBottom: 100,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },
  mesaInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnLiberarFull: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  btnLiberarDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  btnLiberarIcon: {
    fontSize: 24,
    marginRight: 8,
    color: 'white',
  },
  btnLiberarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumenContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  resumenValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  pedidoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pedidoEntregado: {
    opacity: 0.7,
    borderLeftColor: '#9E9E9E',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  estadoPedidoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  estadoPedidoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pedidoFecha: {
    fontSize: 13,
    color: '#999',
  },
  itemsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
  },
  itemDetalle: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemNotas: {
    fontSize: 13,
    color: '#FF6F00',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrecio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  notasContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FBC02D',
  },
  notasText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  btnEntregar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnEntregarIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  btnEntregarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  estadoInfo: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  estadoInfoText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  itemsResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  itemsResumenText: {
    fontSize: 14,
    color: '#666',
  },
  totalEntregado: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9E9E9E',
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 40,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

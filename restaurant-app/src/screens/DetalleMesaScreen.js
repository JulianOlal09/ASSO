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

export default function DetalleMesaScreen({ route, navigation }) {
  const { mesaId } = route.params;
  const [mesa, setMesa] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarDatos();
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

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await mesasService.cambiarEstado(mesaId, nuevoEstado);
      Alert.alert('Éxito', 'Estado actualizado correctamente');
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const mostrarOpcionesEstado = () => {
    Alert.alert(
      'Cambiar Estado',
      `Mesa ${mesa?.numero}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Disponible',
          onPress: () => cambiarEstado('disponible'),
        },
        {
          text: 'Ocupada',
          onPress: () => cambiarEstado('ocupada'),
        },
        {
          text: 'Reservada',
          onPress: () => cambiarEstado('reservada'),
        },
        {
          text: 'Mantenimiento',
          onPress: () => cambiarEstado('mantenimiento'),
          style: 'destructive',
        },
      ]
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
        return '#666';
      default:
        return '#999';
    }
  };

  const calcularTotalPedido = (pedido) => {
    if (!pedido.items) return 0;
    // Los items ya vienen parseados desde el backend
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

          <TouchableOpacity
            style={styles.btnCambiarEstado}
            onPress={mostrarOpcionesEstado}
          >
            <Text style={styles.btnCambiarEstadoText}>
              Cambiar Estado de Mesa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>⚡ Acciones</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            navigation.navigate('CrearPedidoManual', { mesaId: mesa.id })
          }
        >
          <Text style={styles.actionIcon}>➕</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Crear Nuevo Pedido</Text>
            <Text style={styles.actionSubtitle}>
              Registrar pedido manualmente
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Pedidos Activos */}
        <Text style={styles.sectionTitle}>
          📋 Pedidos Activos ({pedidosActivos.length})
        </Text>

        {pedidosActivos.length > 0 ? (
          pedidosActivos.map((pedido) => {
            // Los items ya vienen parseados desde el backend
            const items = Array.isArray(pedido.items) ? pedido.items : (pedido.items ? JSON.parse(pedido.items) : []);
            const total = calcularTotalPedido(pedido);

            return (
              <View key={pedido.id} style={styles.pedidoCard}>
                <View style={styles.pedidoHeader}>
                  <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                  <View
                    style={[
                      styles.estadoPedidoBadge,
                      {
                        backgroundColor: getEstadoPedidoColor(pedido.estado),
                      },
                    ]}
                  >
                    <Text style={styles.estadoPedidoText}>
                      {pedido.estado.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.pedidoFecha}>
                  {new Date(pedido.created_at).toLocaleString()}
                </Text>

                {items.length > 0 && (
                  <View style={styles.itemsContainer}>
                    {items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                        <Text style={styles.itemNombre}>
                          {item.nombre || item.platillo_nombre}
                        </Text>
                        <Text style={styles.itemPrecio}>
                          ${parseFloat(item.subtotal || 0).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {pedido.notas && (
                  <Text style={styles.pedidoNotas}>📝 {pedido.notas}</Text>
                )}

                <View style={styles.pedidoFooter}>
                  <Text style={styles.pedidoTotal}>
                    Total: ${total.toFixed(2)}
                  </Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
    }),
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      flexGrow: 1,
      flexShrink: 1,
      overflow: 'auto',
    }),
  },
  btnBack: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  mesaInfoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  btnCambiarEstado: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  btnCambiarEstadoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  actionArrow: {
    fontSize: 20,
    color: '#999',
    marginLeft: 10,
  },
  pedidoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoPedidoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoPedidoText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pedidoFecha: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  itemsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemCantidad: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 35,
  },
  itemNombre: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemPrecio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pedidoNotas: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pedidoFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  pedidoTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

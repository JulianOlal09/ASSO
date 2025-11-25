import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import pedidosService from '../services/pedidosService';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

export default function KitchenScreen({ navigation }) {
  const [pedidosAgrupados, setPedidosAgrupados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('activos'); // activos, todos, listos
  const { logout } = useAuth();

  useEffect(() => {
    cargarPedidos();

    // Conectar WebSocket
    const socket = io(API_URL.replace('/api', ''));
    socket.emit('join-cocina');
    console.log('🔌 Conectado a sala de cocina');

    // Escuchar nuevo pedido
    socket.on('nuevo-pedido', (pedido) => {
      console.log('✅ Nuevo pedido recibido:', pedido);
      Alert.alert('🔔 NUEVO PEDIDO', `Mesa ${pedido.mesa_numero || pedido.id}`, [
        { text: 'OK', style: 'default' }
      ]);
      cargarPedidos();
    });

    // Escuchar actualización de pedido
    socket.on('pedido-actualizado', (data) => {
      console.log('🔄 Pedido actualizado:', data);
      cargarPedidos();
    });

    // Escuchar actualización de item
    socket.on('item-actualizado', (data) => {
      console.log('🔄 Item actualizado:', data);
      cargarPedidos();
    });

    // Recargar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      cargarPedidos();
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidosService.obtenerPedidosCocina();

      // Agrupar items por pedido
      const pedidosMap = {};
      data.forEach(item => {
        if (!pedidosMap[item.id]) {
          pedidosMap[item.id] = {
            id: item.id,
            mesa_numero: item.mesa_numero,
            created_at: item.created_at,
            items: []
          };
        }
        pedidosMap[item.id].items.push({
          detalle_id: item.detalle_id,
          platillo_nombre: item.platillo_nombre,
          cantidad: item.cantidad,
          notas_especiales: item.notas_especiales,
          tiempo_preparacion: item.tiempo_preparacion,
          item_estado: item.item_estado
        });
      });

      setPedidosAgrupados(Object.values(pedidosMap));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
      console.error('Error al cargar pedidos de cocina:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoItem = async (itemId, nuevoEstado) => {
    try {
      await pedidosService.actualizarEstadoItem(itemId, nuevoEstado);
      cargarPedidos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const getTiempoTranscurrido = (fechaCreacion) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = Math.floor((ahora - creacion) / 1000 / 60); // minutos

    if (diferencia < 1) return '< 1 min';
    if (diferencia < 60) return `${diferencia} min`;
    const horas = Math.floor(diferencia / 60);
    const mins = diferencia % 60;
    return `${horas}h ${mins}m`;
  };

  const getColorPrioridad = (fechaCreacion) => {
    const minutos = Math.floor((new Date() - new Date(fechaCreacion)) / 1000 / 60);
    if (minutos > 30) return '#F44336'; // Rojo - urgente
    if (minutos > 15) return '#FF9800'; // Naranja - atención
    return '#4CAF50'; // Verde - reciente
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#FF9800';
      case 'en_preparacion':
        return '#2196F3';
      case 'listo':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getEstadoPedido = (items) => {
    const todosListos = items.every(i => i.item_estado === 'listo');
    const algunoEnPreparacion = items.some(i => i.item_estado === 'en_preparacion');

    if (todosListos) return 'listo';
    if (algunoEnPreparacion) return 'en_preparacion';
    return 'pendiente';
  };

  const pedidosFiltrados = pedidosAgrupados.filter(pedido => {
    const estadoPedido = getEstadoPedido(pedido.items);
    if (filtroEstado === 'activos') {
      return estadoPedido !== 'listo';
    } else if (filtroEstado === 'listos') {
      return estadoPedido === 'listo';
    }
    return true; // todos
  });

  const renderItem = (item) => (
    <View key={item.detalle_id} style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
        <View style={styles.itemDetalle}>
          <Text style={styles.itemNombre}>{item.platillo_nombre}</Text>
          {item.notas_especiales && (
            <Text style={styles.itemNotas}>▸ {item.notas_especiales}</Text>
          )}
          {item.tiempo_preparacion && (
            <Text style={styles.itemTiempo}>Prep: {item.tiempo_preparacion} min</Text>
          )}
        </View>
      </View>

      <View style={styles.itemAcciones}>
        <View style={[styles.estadoChip, { backgroundColor: getColorEstado(item.item_estado) }]}>
          <Text style={styles.estadoChipText}>
            {item.item_estado === 'pendiente' ? 'PEND' :
             item.item_estado === 'en_preparacion' ? 'PREP' : 'LISTO'}
          </Text>
        </View>

        {item.item_estado === 'pendiente' && (
          <TouchableOpacity
            style={styles.btnAccion}
            onPress={() => cambiarEstadoItem(item.detalle_id, 'en_preparacion')}
          >
            <Text style={styles.btnAccionText}>INICIAR</Text>
          </TouchableOpacity>
        )}

        {item.item_estado === 'en_preparacion' && (
          <TouchableOpacity
            style={[styles.btnAccion, styles.btnListo]}
            onPress={() => cambiarEstadoItem(item.detalle_id, 'listo')}
          >
            <Text style={styles.btnAccionText}>✓ LISTO</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPedido = ({ item }) => {
    const estadoPedido = getEstadoPedido(item.items);

    return (
      <View style={[
        styles.pedidoCard,
        estadoPedido === 'listo' && styles.pedidoCardListo
      ]}>
        <View style={styles.pedidoHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.mesaNumero}>MESA {item.mesa_numero}</Text>
            <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.tiempoContainer, { backgroundColor: getColorPrioridad(item.created_at) }]}>
              <Text style={styles.tiempoText}>{getTiempoTranscurrido(item.created_at)}</Text>
            </View>
            <Text style={styles.horaText}>
              {new Date(item.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {item.items.map(renderItem)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>COCINA</Text>
            <Text style={styles.headerSubtitle}>
              {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnLogout}
            onPress={async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }}
          >
            <Text style={styles.btnLogoutText}>SALIR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroEstado === 'activos' && styles.filtroBtnActivo]}
          onPress={() => setFiltroEstado('activos')}
        >
          <Text style={[styles.filtroText, filtroEstado === 'activos' && styles.filtroTextActivo]}>
            ACTIVOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBtn, filtroEstado === 'listos' && styles.filtroBtnActivo]}
          onPress={() => setFiltroEstado('listos')}
        >
          <Text style={[styles.filtroText, filtroEstado === 'listos' && styles.filtroTextActivo]}>
            LISTOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBtn, filtroEstado === 'todos' && styles.filtroBtnActivo]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[styles.filtroText, filtroEstado === 'todos' && styles.filtroTextActivo]}>
            TODOS
          </Text>
        </TouchableOpacity>
      </View>

      {pedidosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filtroEstado === 'activos' ? '✓ SIN PEDIDOS ACTIVOS' :
             filtroEstado === 'listos' ? '○ SIN PEDIDOS LISTOS' :
             '○ SIN PEDIDOS'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={cargarPedidos} />
          }
        />
      )}
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  headerSafeArea: {
    backgroundColor: '#263238',
  },
  header: {
    backgroundColor: '#263238',
    paddingBottom: 20,
    paddingHorizontal: isSmallScreen ? 12 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#B0BEC5',
    marginTop: 2,
  },
  btnLogout: {
    backgroundColor: '#FF5252',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 8 : 12,
    borderRadius: 8,
  },
  btnLogoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 13 : 16,
  },
  filtrosContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
    elevation: 2,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
  },
  filtroBtnActivo: {
    backgroundColor: '#263238',
  },
  filtroText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#546E7A',
  },
  filtroTextActivo: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  pedidoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  pedidoCardListo: {
    borderLeftColor: '#4CAF50',
    opacity: 0.7,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ECEFF1',
  },
  headerLeft: {
    flex: 1,
  },
  mesaNumero: {
    fontSize: isSmallScreen ? 22 : 28,
    fontWeight: 'bold',
    color: '#263238',
    letterSpacing: 0.5,
  },
  pedidoId: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#78909C',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  tiempoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  tiempoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  horaText: {
    fontSize: 14,
    color: '#78909C',
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isSmallScreen ? 'stretch' : 'center',
    backgroundColor: '#F5F5F5',
    padding: isSmallScreen ? 12 : 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: isSmallScreen ? 10 : 0,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallScreen ? 8 : 10,
  },
  itemCantidad: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#263238',
    minWidth: isSmallScreen ? 35 : 45,
  },
  itemDetalle: {
    flex: 1,
  },
  itemNombre: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  itemNotas: {
    fontSize: isSmallScreen ? 13 : 15,
    color: '#FF6F00',
    fontWeight: '500',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  itemTiempo: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#78909C',
  },
  itemAcciones: {
    alignItems: isSmallScreen ? 'stretch' : 'flex-end',
    gap: 8,
  },
  estadoChip: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 5 : 6,
    borderRadius: 16,
    minWidth: isSmallScreen ? 60 : 70,
    alignItems: 'center',
  },
  estadoChipText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  btnAccion: {
    backgroundColor: '#2196F3',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 8,
    minWidth: isSmallScreen ? 80 : 100,
    alignItems: 'center',
    elevation: 2,
  },
  btnListo: {
    backgroundColor: '#4CAF50',
  },
  btnAccionText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#78909C',
    textAlign: 'center',
  },
});

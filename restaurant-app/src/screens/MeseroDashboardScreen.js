import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import mesasService from '../services/mesasService';
import pedidosService from '../services/pedidosService';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

export default function MeseroDashboardScreen({ navigation }) {
  const [mesas, setMesas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    ocupadas: 0,
    disponibles: 0,
    pedidosActivos: 0,
  });
  const [loading, setLoading] = useState(false);
  const { usuario, logout } = useAuth();

  useEffect(() => {
    cargarDatos();

    // Conectar WebSocket para mesero
    if (usuario?.id) {
      const socket = io(API_URL.replace('/api', ''));
      socket.emit('join-mesero', usuario.id);
      console.log(`🔌 Mesero ${usuario.nombre} conectado a sala`);

      // Escuchar nuevo pedido
      socket.on('nuevo-pedido', (pedido) => {
        console.log('✅ Nuevo pedido para mesero:', pedido);
        Alert.alert(
          '🔔 Nuevo Pedido',
          `Mesa ${pedido.mesa_numero} - Total: $${pedido.total}`,
          [{ text: 'Ver', onPress: () => cargarDatos() }, { text: 'OK' }]
        );
        cargarDatos();
      });

      // Escuchar actualizaciones
      socket.on('pedido-actualizado', (data) => {
        console.log('🔄 Pedido actualizado para mesero:', data);
        if (data.estado === 'listo') {
          Alert.alert(
            '✅ Pedido Listo',
            `Mesa ${data.pedido?.mesa_numero || ''} - El pedido está listo para servir`
          );
        }
        cargarDatos();
      });

      socket.on('item-actualizado', (data) => {
        console.log('🔄 Item actualizado para mesero:', data);
        cargarDatos();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar mesas y pedidos por separado para manejar errores individualmente
      let mesasData = [];
      let pedidosData = [];

      try {
        mesasData = await mesasService.obtenerMesas();
        console.log('✅ Mesas cargadas:', mesasData.length);
      } catch (error) {
        console.error('❌ Error al cargar mesas:', error);
        Alert.alert('Error', 'No se pudieron cargar las mesas');
      }

      try {
        pedidosData = await pedidosService.obtenerPedidos();
        console.log('✅ Pedidos cargados:', pedidosData.length);
      } catch (error) {
        console.error('❌ Error al cargar pedidos:', error);
        // Continuar sin pedidos
        pedidosData = [];
      }

      console.log('🔥 DATOS RECIBIDOS DEL BACKEND:');
      console.log('📋 mesasData:', JSON.stringify(mesasData, null, 2));
      console.log('📊 Cantidad de mesas:', mesasData.length);

      // Filtrar pedidos activos (no entregados ni cancelados)
      const pedidosActivos = pedidosData.filter(
        (p) => p.estado !== 'entregado' && p.estado !== 'cancelado'
      );

      // Asociar pedidos con mesas
      const mesasConPedidos = mesasData.map((mesa) => {
        const pedidosMesa = pedidosActivos.filter((p) => p.mesa_id === mesa.id);
        const mesaCompleta = {
          ...mesa,
          pedidos: pedidosMesa,
          pedidoActivo: pedidosMesa[0] || null, // Tomar el primer pedido activo
        };
        console.log(`Mesa ${mesa.numero} procesada:`, {
          id: mesaCompleta.id,
          numero: mesaCompleta.numero,
          mesero_id: mesaCompleta.mesero_id,
          mesero_nombre: mesaCompleta.mesero_nombre
        });
        return mesaCompleta;
      });

      console.log('🎯 MESAS PROCESADAS:', mesasConPedidos.length);
      setMesas(mesasConPedidos);

      // Calcular estadísticas
      const stats = {
        total: mesasData.length,
        ocupadas: mesasData.filter((m) => m.estado === 'ocupada').length,
        disponibles: mesasData.filter((m) => m.estado === 'disponible').length,
        pedidosActivos: pedidosActivos.length,
      };
      setEstadisticas(stats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoMesa = async (mesaId, nuevoEstado) => {
    try {
      await mesasService.cambiarEstado(mesaId, nuevoEstado);
      Alert.alert('Éxito', 'Estado de mesa actualizado');
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado de la mesa');
    }
  };

  const liberarMesa = async (mesa) => {
    try {
      await mesasService.liberarMesa(mesa.id);
      Alert.alert('Éxito', `Mesa ${mesa.numero} liberada correctamente`);
      cargarDatos();
    } catch (error) {
      const mensaje = error.error || 'No se pudo liberar la mesa';
      Alert.alert('Error', mensaje);
    }
  };

  const confirmarLiberarMesa = (mesa) => {
    Alert.alert(
      'Liberar Mesa',
      `¿Estás seguro de que deseas liberar la Mesa ${mesa.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          style: 'destructive',
          onPress: () => liberarMesa(mesa),
        },
      ]
    );
  };

  const confirmarCambioEstado = (mesa) => {
    const opciones = [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Disponible',
        onPress: () => cambiarEstadoMesa(mesa.id, 'disponible'),
      },
      {
        text: 'Ocupada',
        onPress: () => cambiarEstadoMesa(mesa.id, 'ocupada'),
      },
      {
        text: 'Reservada',
        onPress: () => cambiarEstadoMesa(mesa.id, 'reservada'),
      },
    ];

    Alert.alert('Cambiar Estado', `Mesa ${mesa.numero}`, opciones);
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

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'disponible':
        return '✓ Disponible';
      case 'ocupada':
        return '● Ocupada';
      case 'reservada':
        return '◐ Reservada';
      case 'mantenimiento':
        return '⚙ Mantenimiento';
      default:
        return estado;
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
        return '✅ Listo';
      case 'entregado':
        return '✓ Entregado';
      default:
        return estado;
    }
  };

  const StatCard = ({ title, value, icon, color = '#4CAF50' }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MesaCard = ({ mesa, mostrarBotonLiberar = false }) => {
    const pedido = mesa.pedidoActivo;

    return (
      <View
        style={[
          styles.mesaCard,
          { borderLeftColor: getEstadoColor(mesa.estado) },
        ]}
      >
        <TouchableOpacity
          onLongPress={() => confirmarCambioEstado(mesa)}
          activeOpacity={0.7}
        >
          <View style={styles.mesaHeader}>
            <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: getEstadoColor(mesa.estado) },
              ]}
            >
              <Text style={styles.estadoText}>
                {getEstadoLabel(mesa.estado)}
              </Text>
            </View>
          </View>
          <Text style={styles.mesaCapacidad}>
            👥 Capacidad: {mesa.capacidad} personas
          </Text>

          {/* Mostrar pedido activo si existe */}
          {pedido && (
            <View style={styles.pedidoContainer}>
              <View style={styles.pedidoHeader}>
                <Text style={styles.pedidoTitle}>📋 Pedido #{pedido.id}</Text>
                <View
                  style={[
                    styles.pedidoEstadoBadge,
                    { backgroundColor: getEstadoPedidoColor(pedido.estado) },
                  ]}
                >
                  <Text style={styles.pedidoEstadoText}>
                    {getEstadoPedidoLabel(pedido.estado)}
                  </Text>
                </View>
              </View>

              {/* Items del pedido */}
              {pedido.items && pedido.items.length > 0 && (
                <View style={styles.itemsList}>
                  {pedido.items.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                      <Text style={styles.itemNombre}>{item.nombre}</Text>
                      <Text style={styles.itemPrecio}>
                        ${parseFloat(item.precio_unitario).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {pedido.items.length > 3 && (
                    <Text style={styles.masItems}>
                      +{pedido.items.length - 3} items más...
                    </Text>
                  )}
                </View>
              )}

              {/* Total del pedido */}
              <View style={styles.pedidoFooter}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  ${parseFloat(pedido.total).toFixed(2)}
                </Text>
              </View>

              {/* Notas si existen */}
              {pedido.notas && (
                <Text style={styles.pedidoNotas}>📝 {pedido.notas}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.mesaActions}>
          {mostrarBotonLiberar && mesa.estado !== 'disponible' && (
            <TouchableOpacity
              style={styles.btnLiberar}
              onPress={() => confirmarLiberarMesa(mesa)}
            >
              <Text style={styles.btnLiberarText}>🔓 Liberar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.btnVerDetalle}
            onPress={() =>
              navigation.navigate('DetalleMesa', { mesaId: mesa.id })
            }
          >
            <Text style={styles.btnVerDetalleText}>Ver Detalle →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const mesasPorEstado = {
    ocupadas: mesas.filter((m) => m.estado === 'ocupada'),
    disponibles: mesas.filter((m) => m.estado === 'disponible'),
    reservadas: mesas.filter((m) => m.estado === 'reservada'),
  };

  // Filtrar mesas asignadas al mesero actual
  console.log('='.repeat(60));
  console.log('👤 USUARIO COMPLETO:', JSON.stringify(usuario, null, 2));
  console.log('📋 TOTAL MESAS:', mesas.length);
  console.log('🔍 MESAS DETALLE:');
  mesas.forEach((m, index) => {
    console.log(`  Mesa ${index + 1}:`, {
      id: m.id,
      numero: m.numero,
      mesero_id: m.mesero_id,
      mesero_nombre: m.mesero_nombre,
      tipo_mesero_id: typeof m.mesero_id
    });
  });

  const mesasAsignadas = mesas.filter((m) => {
    // Comparar convirtiendo ambos a número para evitar problemas de tipos
    const meseroIdNum = Number(m.mesero_id);
    const usuarioIdNum = Number(usuario?.id);
    const coincide = meseroIdNum === usuarioIdNum;
    console.log(`✓ Mesa ${m.numero}: mesero_id=${m.mesero_id}, usuario.id=${usuario?.id}, coincide=${coincide}`);
    return coincide;
  });

  console.log('✅ MESAS ASIGNADAS:', mesasAsignadas.length);
  console.log('📝 DETALLEMESAS FILTRADAS:', mesasAsignadas.map(m => m.numero));
  console.log('='.repeat(60));

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Panel de Mesero</Text>
            <Text style={styles.headerSubtitle}>Hola, {usuario?.nombre}</Text>
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
            <Text style={styles.btnLogoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Estadísticas */}
        <Text style={styles.sectionTitle}>Estado General</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Mesas"
            value={estadisticas.total}
            icon="🪑"
            color="#2196F3"
          />
          <StatCard
            title="Ocupadas"
            value={estadisticas.ocupadas}
            icon="●"
            color="#FF5722"
          />
          <StatCard
            title="Pedidos Activos"
            value={estadisticas.pedidosActivos}
            icon="📋"
            color="#FF9800"
          />
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CrearPedidoManual')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>Crear Pedido Manual</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Mis Mesas Asignadas */}
        <Text style={styles.sectionTitle}>
          Mis Mesas Asignadas ({mesasAsignadas.length})
        </Text>
        {mesasAsignadas.length > 0 ? (
          mesasAsignadas.map((mesa) => (
            <MesaCard key={mesa.id} mesa={mesa} mostrarBotonLiberar={true} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes mesas asignadas actualmente
            </Text>
          </View>
        )}

        {/* Mesas Ocupadas */}
        {mesasPorEstado.ocupadas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Mesas Ocupadas ({mesasPorEstado.ocupadas.length})
            </Text>
            {mesasPorEstado.ocupadas.map((mesa) => (
              <MesaCard key={mesa.id} mesa={mesa} />
            ))}
          </>
        )}

        {/* Mesas Reservadas */}
        {mesasPorEstado.reservadas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Mesas Reservadas ({mesasPorEstado.reservadas.length})
            </Text>
            {mesasPorEstado.reservadas.map((mesa) => (
              <MesaCard key={mesa.id} mesa={mesa} />
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSafeArea: {
    backgroundColor: '#4CAF50',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingBottom: 20,
    paddingHorizontal: isSmallScreen ? 12 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: isSmallScreen ? 90 : 100,
  },
  scrollView: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  btnLogout: {
    backgroundColor: 'white',
    paddingHorizontal: isSmallScreen ? 12 : 15,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 5,
  },
  btnLogoutText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 13 : 14,
  },
  content: {
    padding: isSmallScreen ? 10 : 15,
    paddingBottom: 100,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: isSmallScreen ? 15 : 25,
    marginBottom: isSmallScreen ? 12 : 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: isSmallScreen ? 10 : 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: isSmallScreen ? 15 : 20,
    minWidth: isSmallScreen ? '100%' : 200,
    flex: isSmallScreen ? 0 : 1,
    marginBottom: isSmallScreen ? 10 : 15,
    borderTopWidth: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
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
    minHeight: 70,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionArrow: {
    fontSize: 24,
    color: '#999',
  },
  mesaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: isSmallScreen ? 15 : 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: isSmallScreen ? 130 : 150,
  },
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mesaNumero: {
    fontSize: isSmallScreen ? 18 : 20,
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
  mesaCapacidad: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mesaActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnLiberar: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  btnLiberarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnVerDetalle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnVerDetalleText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  pedidoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pedidoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pedidoEstadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pedidoEstadoText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemCantidad: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    width: 35,
  },
  itemNombre: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  itemPrecio: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  masItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pedidoNotas: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

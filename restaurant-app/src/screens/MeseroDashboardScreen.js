import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import mesasService from '../services/mesasService';
import pedidosService from '../services/pedidosService';

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
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mesasData, pedidosData] = await Promise.all([
        mesasService.obtenerMesas(),
        pedidosService.obtenerPedidos('pendiente'),
      ]);

      setMesas(mesasData);

      // Calcular estadísticas
      const stats = {
        total: mesasData.length,
        ocupadas: mesasData.filter((m) => m.estado === 'ocupada').length,
        disponibles: mesasData.filter((m) => m.estado === 'disponible').length,
        pedidosActivos: pedidosData.length,
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

  const StatCard = ({ title, value, icon, color = '#4CAF50' }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MesaCard = ({ mesa }) => (
    <TouchableOpacity
      style={[
        styles.mesaCard,
        { borderLeftColor: getEstadoColor(mesa.estado) },
      ]}
      onPress={() => navigation.navigate('DetalleMesa', { mesaId: mesa.id })}
      onLongPress={() => confirmarCambioEstado(mesa)}
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
      <View style={styles.mesaActions}>
        <TouchableOpacity
          style={styles.btnVerDetalle}
          onPress={() =>
            navigation.navigate('DetalleMesa', { mesaId: mesa.id })
          }
        >
          <Text style={styles.btnVerDetalleText}>Ver Detalle →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const mesasPorEstado = {
    ocupadas: mesas.filter((m) => m.estado === 'ocupada'),
    disponibles: mesas.filter((m) => m.estado === 'disponible'),
    reservadas: mesas.filter((m) => m.estado === 'reservada'),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
        }
      >
        {/* Estadísticas */}
        <Text style={styles.sectionTitle}>📊 Estado General</Text>
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
            title="Disponibles"
            value={estadisticas.disponibles}
            icon="✓"
            color="#4CAF50"
          />
          <StatCard
            title="Pedidos Activos"
            value={estadisticas.pedidosActivos}
            icon="📋"
            color="#FF9800"
          />
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CrearPedidoManual')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>Crear Pedido Manual</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Mesas Ocupadas */}
        {mesasPorEstado.ocupadas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              🔴 Mesas Ocupadas ({mesasPorEstado.ocupadas.length})
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
              🟠 Mesas Reservadas ({mesasPorEstado.reservadas.length})
            </Text>
            {mesasPorEstado.reservadas.map((mesa) => (
              <MesaCard key={mesa.id} mesa={mesa} />
            ))}
          </>
        )}

        {/* Mesas Disponibles */}
        <Text style={styles.sectionTitle}>
          🟢 Mesas Disponibles ({mesasPorEstado.disponibles.length})
        </Text>
        {mesasPorEstado.disponibles.length > 0 ? (
          mesasPorEstado.disponibles.map((mesa) => (
            <MesaCard key={mesa.id} mesa={mesa} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mesas disponibles</Text>
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
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  btnLogout: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnLogoutText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    borderTopWidth: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
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
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: '#999',
  },
  mesaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mesaNumero: {
    fontSize: 18,
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
});

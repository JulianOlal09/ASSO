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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import reportesService from '../services/reportesService';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

export default function AdminDashboardScreen({ navigation }) {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const { usuario, logout } = useAuth();

  useEffect(() => {
    cargarEstadisticas();

    // Conectar WebSocket para admin
    const socket = io(API_URL.replace('/api', ''));
    socket.emit('join-admin');
    console.log('🔌 Admin conectado a sala de administración');

    // Escuchar nuevo pedido
    socket.on('nuevo-pedido', (pedido) => {
      console.log('✅ Nuevo pedido recibido en admin:', pedido);
      Alert.alert(
        '🔔 Nuevo Pedido',
        `Mesa ${pedido.mesa_numero} - Total: $${pedido.total}`,
        [{ text: 'Ver', onPress: () => cargarEstadisticas() }, { text: 'Cerrar' }]
      );
      cargarEstadisticas();
    });

    // Escuchar actualizaciones
    socket.on('pedido-actualizado', (data) => {
      console.log('🔄 Pedido actualizado en admin:', data);
      cargarEstadisticas();
    });

    socket.on('item-actualizado', (data) => {
      console.log('🔄 Item actualizado en admin:', data);
      cargarEstadisticas();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await reportesService.obtenerEstadisticasGenerales();
      setEstadisticas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const MenuItem = ({ title, icon, onPress, color = '#4CAF50', testID }) => (
    <TouchableOpacity
      testID={testID}
      style={[styles.menuItem, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle, color = '#4CAF50', testID }) => (
    <View testID={testID} style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin</Text>
            <Text style={styles.headerSubtitle}>
              {usuario?.nombre}
            </Text>
          </View>
          <TouchableOpacity
            testID="admin-logout-button"
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
        testID="admin-dashboard-scrollview"
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarEstadisticas} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Estadísticas Rápidas */}
        <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>
        <View style={styles.statsGrid}>
          <StatCard
            testID="stat-card-ventas-totales"
            title="Ventas Totales"
            value={`$${estadisticas?.ventas?.total?.toFixed(2) || '0.00'}`}
            subtitle={`${estadisticas?.ventas?.cantidad_pedidos || 0} pedidos`}
            color="#4CAF50"
          />
          <StatCard
            testID="stat-card-promedio-pedido"
            title="Promedio por Pedido"
            value={`$${estadisticas?.ventas?.promedio_por_pedido?.toFixed(2) || '0.00'}`}
            color="#2196F3"
          />
          <StatCard
            testID="stat-card-mesas-ocupadas"
            title="Mesas Ocupadas"
            value={`${estadisticas?.mesas?.ocupadas || 0}/${estadisticas?.mesas?.total || 0}`}
            subtitle={`Disponibles: ${estadisticas?.mesas?.disponibles || 0}`}
            color="#FF9800"
          />
          <StatCard
            testID="stat-card-tiempo-preparacion"
            title="Tiempo Prep. Promedio"
            value={`${estadisticas?.tiempo_preparacion?.promedio_minutos?.toFixed(0) || '0'} min`}
            color="#9C27B0"
          />
        </View>

        {/* Menú de Opciones */}
        <Text style={styles.sectionTitle}>Gestión</Text>

        <MenuItem
          testID="menu-item-gestion-usuarios"
          title="Gestión de Usuarios"
          icon="👥"
          color="#2196F3"
          onPress={() => navigation.navigate('GestionUsuarios')}
        />

        <MenuItem
          testID="menu-item-gestion-menu"
          title="Gestión de Menú"
          icon="🍽️"
          color="#4CAF50"
          onPress={() => navigation.navigate('GestionMenu')}
        />

        <MenuItem
          testID="menu-item-gestion-mesas"
          title="Gestión de Mesas"
          icon="🪑"
          color="#FF9800"
          onPress={() => navigation.navigate('GestionMesas')}
        />

        <Text style={styles.sectionTitle}>Reportes</Text>

        <MenuItem
          testID="menu-item-reporte-ventas"
          title="Reporte de Ventas"
          icon="💰"
          color="#4CAF50"
          onPress={() => navigation.navigate('ReporteVentas')}
        />

        <MenuItem
          testID="menu-item-reporte-platillos"
          title="Platillos Más Vendidos"
          icon="⭐"
          color="#FF5722"
          onPress={() => navigation.navigate('ReportePlatillos')}
        />
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
    ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}),
  },
  headerSafeArea: {
    backgroundColor: '#2196F3',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
    marginRight: isSmallScreen ? 8 : 12,
  },
  scrollView: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 12 : 14,
    color: 'rgba(255,255,255,0.9)',
  },
  btnLogout: {
    backgroundColor: 'white',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: 8,
    minWidth: isSmallScreen ? 60 : 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  btnLogoutText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 13 : 15,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statTitle: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#999',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: isSmallScreen ? 14 : 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: isSmallScreen ? 60 : 70,
  },
  menuIcon: {
    fontSize: isSmallScreen ? 28 : 32,
    marginRight: isSmallScreen ? 12 : 20,
  },
  menuTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  menuArrow: {
    fontSize: isSmallScreen ? 20 : 24,
    color: '#999',
  },
});

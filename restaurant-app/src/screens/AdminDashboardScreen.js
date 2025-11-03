import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import reportesService from '../services/reportesService';

export default function AdminDashboardScreen({ navigation }) {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const { usuario, logout } = useAuth();

  useEffect(() => {
    cargarEstadisticas();
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

  const MenuItem = ({ title, icon, onPress, color = '#4CAF50' }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle, color = '#4CAF50' }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>
            Bienvenido, {usuario?.nombre}
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
          <Text style={styles.btnLogoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarEstadisticas} />
        }
      >
        {/* Estadísticas Rápidas */}
        <Text style={styles.sectionTitle}>📊 Estadísticas de Hoy</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Ventas Totales"
            value={`$${estadisticas?.ventas?.total?.toFixed(2) || '0.00'}`}
            subtitle={`${estadisticas?.ventas?.cantidad_pedidos || 0} pedidos`}
            color="#4CAF50"
          />
          <StatCard
            title="Promedio por Pedido"
            value={`$${estadisticas?.ventas?.promedio_por_pedido?.toFixed(2) || '0.00'}`}
            color="#2196F3"
          />
          <StatCard
            title="Mesas Ocupadas"
            value={`${estadisticas?.mesas?.ocupadas || 0}/${estadisticas?.mesas?.total || 0}`}
            subtitle={`Disponibles: ${estadisticas?.mesas?.disponibles || 0}`}
            color="#FF9800"
          />
          <StatCard
            title="Tiempo Prep. Promedio"
            value={`${estadisticas?.tiempo_preparacion?.promedio_minutos?.toFixed(0) || '0'} min`}
            color="#9C27B0"
          />
        </View>

        {/* Menú de Opciones */}
        <Text style={styles.sectionTitle}>🛠️ Gestión</Text>

        <MenuItem
          title="Gestión de Usuarios"
          icon="👥"
          color="#2196F3"
          onPress={() => navigation.navigate('GestionUsuarios')}
        />

        <MenuItem
          title="Gestión de Menú"
          icon="🍽️"
          color="#4CAF50"
          onPress={() => navigation.navigate('GestionMenu')}
        />

        <MenuItem
          title="Gestión de Mesas"
          icon="🪑"
          color="#FF9800"
          onPress={() => navigation.navigate('GestionMesas')}
        />

        <MenuItem
          title="Pedidos"
          icon="📋"
          color="#9C27B0"
          onPress={() => navigation.navigate('PedidosAdmin')}
        />

        <Text style={styles.sectionTitle}>📈 Reportes</Text>

        <MenuItem
          title="Reporte de Ventas"
          icon="💰"
          color="#4CAF50"
          onPress={() => navigation.navigate('ReporteVentas')}
        />

        <MenuItem
          title="Platillos Más Vendidos"
          icon="⭐"
          color="#FF5722"
          onPress={() => navigation.navigate('ReportePlatillos')}
        />
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
    backgroundColor: '#2196F3',
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
    color: '#2196F3',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
  },
});

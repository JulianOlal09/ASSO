import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import reportesService from '../services/reportesService';

// Helper para alertas compatible con web y móvil
const mostrarAlerta = (titulo, mensaje, callback) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    if (callback) callback();
  } else {
    Alert.alert(titulo, mensaje, [{ text: 'OK', onPress: callback }]);
  }
};

// Componente DateInput para web
const DateInputWeb = ({ value, onChangeText, label }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.filtroItem}>
        <Text style={styles.filtroLabel}>{label}</Text>
        <input
          type="date"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          style={{
            backgroundColor: '#f9f9f9',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: '#333',
            width: '100%',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        />
      </View>
    );
  }

  // Para móvil, usar input de texto (puede mejorar con DateTimePicker)
  return (
    <View style={styles.filtroItem}>
      <Text style={styles.filtroLabel}>{label}</Text>
      <TextInput
        style={styles.filtroInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
      />
    </View>
  );
};

export default function ReporteVentasScreen({ navigation }) {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    // Establecer fechas por defecto: últimos 7 días
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    setFechaFin(formatearFecha(hoy));
    setFechaInicio(formatearFecha(hace7Dias));
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarReporte();
    }
  }, [fechaInicio, fechaFin]);

  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const data = await reportesService.obtenerReporteVentas(fechaInicio, fechaFin);
      setReporte(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      mostrarAlerta('Error', 'No se pudo cargar el reporte de ventas');
    } finally {
      setLoading(false);
    }
  };

  const formatearFechaLegible = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.btnBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte de Ventas</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarReporte} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Filtros de Fecha */}
        <View style={styles.filtrosCard}>
          <Text style={styles.filtrosTitle}>📅 Filtrar por período</Text>

          <View style={styles.filtrosRow}>
            <DateInputWeb
              label="Fecha Inicio:"
              value={fechaInicio}
              onChangeText={setFechaInicio}
            />

            <DateInputWeb
              label="Fecha Fin:"
              value={fechaFin}
              onChangeText={setFechaFin}
            />
          </View>

          <View style={styles.botonesRapidos}>
            <TouchableOpacity
              style={styles.btnRapido}
              onPress={() => {
                const hoy = new Date();
                setFechaFin(formatearFecha(hoy));
                setFechaInicio(formatearFecha(hoy));
              }}
            >
              <Text style={styles.btnRapidoText}>Hoy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRapido}
              onPress={() => {
                const hoy = new Date();
                const hace7Dias = new Date();
                hace7Dias.setDate(hoy.getDate() - 7);
                setFechaFin(formatearFecha(hoy));
                setFechaInicio(formatearFecha(hace7Dias));
              }}
            >
              <Text style={styles.btnRapidoText}>Últimos 7 días</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRapido}
              onPress={() => {
                const hoy = new Date();
                const hace30Dias = new Date();
                hace30Dias.setDate(hoy.getDate() - 30);
                setFechaFin(formatearFecha(hoy));
                setFechaInicio(formatearFecha(hace30Dias));
              }}
            >
              <Text style={styles.btnRapidoText}>Últimos 30 días</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRapido}
              onPress={() => {
                const hoy = new Date();
                const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                setFechaFin(formatearFecha(hoy));
                setFechaInicio(formatearFecha(primerDiaMes));
              }}
            >
              <Text style={styles.btnRapidoText}>Este mes</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.btnFiltrar}
            onPress={cargarReporte}
            disabled={!fechaInicio || !fechaFin}
          >
            <Text style={styles.btnFiltrarText}>🔍 Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen General */}
        {reporte?.resumen && (
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitle}>📊 Resumen General</Text>

            <View style={styles.resumenGrid}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Total Ventas</Text>
                <Text style={styles.resumenValor}>
                  ${parseFloat(reporte.resumen.total_ventas || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Total Pedidos</Text>
                <Text style={styles.resumenValor}>
                  {reporte.resumen.total_pedidos || 0}
                </Text>
              </View>

              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Promedio Diario</Text>
                <Text style={styles.resumenValor}>
                  ${parseFloat(reporte.resumen.promedio_diario || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Ventas Diarias */}
        {reporte?.ventas_diarias && reporte.ventas_diarias.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              📅 Ventas por Día ({reporte.ventas_diarias.length} días)
            </Text>

            {reporte.ventas_diarias.map((venta, index) => (
              <View key={index} style={styles.ventaCard}>
                <View style={styles.ventaHeader}>
                  <Text style={styles.ventaFecha}>
                    {formatearFechaLegible(venta.fecha)}
                  </Text>
                  <View style={styles.ventaBadge}>
                    <Text style={styles.ventaBadgeText}>
                      {venta.total_pedidos} pedidos
                    </Text>
                  </View>
                </View>

                <View style={styles.ventaDetalles}>
                  <View style={styles.ventaDetalle}>
                    <Text style={styles.ventaDetalleLabel}>Total del Día:</Text>
                    <Text style={styles.ventaDetalleValor}>
                      ${parseFloat(venta.total_ventas || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.ventaDetalle}>
                    <Text style={styles.ventaDetalleLabel}>Promedio por Pedido:</Text>
                    <Text style={styles.ventaDetalleValor}>
                      ${parseFloat(venta.promedio_venta || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay ventas registradas en el período seleccionado
              </Text>
            </View>
          )
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
    paddingBottom: 100,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  filtrosCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  filtrosRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  filtroItem: {
    flex: 1,
  },
  filtroLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  filtroInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  botonesRapidos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  btnRapido: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  btnRapidoText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  btnFiltrar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFiltrarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumenCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  resumenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  resumenGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 15,
  },
  resumenItem: {
    alignItems: 'center',
    minWidth: 120,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resumenValor: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  ventaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ventaFecha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textTransform: 'capitalize',
  },
  ventaBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ventaBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ventaDetalles: {
    gap: 10,
  },
  ventaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ventaDetalleLabel: {
    fontSize: 15,
    color: '#666',
  },
  ventaDetalleValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 40,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

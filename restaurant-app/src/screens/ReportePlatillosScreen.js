import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
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

export default function ReportePlatillosScreen({ navigation }) {
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limite, setLimite] = useState(10);

  useEffect(() => {
    cargarPlatillos();
  }, [limite]);

  const cargarPlatillos = async () => {
    try {
      setLoading(true);
      const data = await reportesService.obtenerPlatillosMasVendidos(limite);
      setPlatillos(data);
    } catch (error) {
      console.error('Error al cargar platillos:', error);
      mostrarAlerta('Error', 'No se pudieron cargar los platillos más vendidos');
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentaje = (cantidadTotal) => {
    if (platillos.length === 0) return 0;
    const maxCantidad = Math.max(...platillos.map(p => parseInt(p.cantidad_total || 0)));
    return maxCantidad > 0 ? (cantidadTotal / maxCantidad) * 100 : 0;
  };

  const getMedalIcon = (posicion) => {
    switch(posicion) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${posicion + 1}.`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.btnBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platillos Más Vendidos</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarPlatillos} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Selector de límite */}
        <View style={styles.limiteCard}>
          <Text style={styles.limiteTitle}>Mostrar top:</Text>
          <View style={styles.limiteBotones}>
            {[5, 10, 20, 50].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.btnLimite,
                  limite === num && styles.btnLimiteActivo
                ]}
                onPress={() => setLimite(num)}
              >
                <Text style={[
                  styles.btnLimiteText,
                  limite === num && styles.btnLimiteTextoActivo
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resumen */}
        {platillos.length > 0 && (
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitle}>📊 Resumen General</Text>

            <View style={styles.resumenGrid}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Total Unidades</Text>
                <Text style={styles.resumenValor}>
                  {platillos.reduce((sum, p) => sum + parseInt(p.cantidad_total || 0), 0)}
                </Text>
              </View>

              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Ingresos Totales</Text>
                <Text style={styles.resumenValor}>
                  ${platillos.reduce((sum, p) => sum + parseFloat(p.ingresos_totales || 0), 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.resumenItem}>
                <Text style={styles.resumenLabel}>Platillos Únicos</Text>
                <Text style={styles.resumenValor}>
                  {platillos.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Lista de Platillos */}
        {platillos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              ⭐ Top {platillos.length} Platillos
            </Text>

            {platillos.map((platillo, index) => {
              const porcentaje = calcularPorcentaje(parseInt(platillo.cantidad_total || 0));

              return (
                <View key={platillo.id} style={styles.platilloCard}>
                  <View style={styles.platilloHeader}>
                    <View style={styles.platilloRanking}>
                      <Text style={styles.platilloMedal}>
                        {getMedalIcon(index)}
                      </Text>
                    </View>

                    <View style={styles.platilloInfo}>
                      <Text style={styles.platilloNombre}>{platillo.nombre}</Text>
                      <Text style={styles.platilloPrecio}>
                        Precio: ${parseFloat(platillo.precio || 0).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.platilloCantidad}>
                      <Text style={styles.platilloCantidadValor}>
                        {platillo.cantidad_total}
                      </Text>
                      <Text style={styles.platilloCantidadLabel}>unidades</Text>
                    </View>
                  </View>

                  {/* Barra de progreso visual */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${porcentaje}%` }
                      ]}
                    />
                  </View>

                  {/* Estadísticas detalladas */}
                  <View style={styles.platilloStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Veces Pedido</Text>
                      <Text style={styles.statItemValor}>
                        {platillo.veces_pedido}
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Ingresos</Text>
                      <Text style={styles.statItemValor}>
                        ${parseFloat(platillo.ingresos_totales || 0).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Promedio por Pedido</Text>
                      <Text style={styles.statItemValor}>
                        {(platillo.cantidad_total / platillo.veces_pedido).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay datos de ventas disponibles
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
    backgroundColor: '#FF5722',
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
  limiteCard: {
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
  limiteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  limiteBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  btnLimite: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnLimiteActivo: {
    backgroundColor: '#FF5722',
    borderColor: '#E64A19',
  },
  btnLimiteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  btnLimiteTextoActivo: {
    color: 'white',
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
    borderLeftColor: '#FF5722',
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
    color: '#FF5722',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  platilloCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  platilloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  platilloRanking: {
    width: 50,
    alignItems: 'center',
  },
  platilloMedal: {
    fontSize: 28,
  },
  platilloInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  platilloNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  platilloPrecio: {
    fontSize: 14,
    color: '#666',
  },
  platilloCantidad: {
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  platilloCantidadValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  platilloCantidadLabel: {
    fontSize: 12,
    color: 'white',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF5722',
    borderRadius: 4,
  },
  platilloStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statItemValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
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

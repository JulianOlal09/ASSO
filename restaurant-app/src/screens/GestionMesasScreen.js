import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import mesasService from '../services/mesasService';
import usuariosService from '../services/usuariosService';

export default function GestionMesasScreen({ navigation }) {
  const [mesas, setMesas] = useState([]);
  const [meseros, setMeseros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalQRVisible, setModalQRVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [mesaActual, setMesaActual] = useState({
    id: null,
    numero: '',
    capacidad: '',
    mesero_id: null,
    estado: 'disponible',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mesasData, meserosData] = await Promise.all([
        mesasService.obtenerMesas(),
        usuariosService.obtenerMeseros(),
      ]);
      setMesas(mesasData);
      setMeseros(meserosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setMesaActual({
      id: null,
      numero: '',
      capacidad: '',
      mesero_id: null,
      estado: 'disponible',
    });
    setEditando(false);
    setModalVisible(true);
  };

  const abrirModalEditar = (mesa) => {
    setMesaActual({
      id: mesa.id,
      numero: mesa.numero,
      capacidad: mesa.capacidad.toString(),
      mesero_id: mesa.mesero_id,
      estado: mesa.estado,
    });
    setEditando(true);
    setModalVisible(true);
  };

  const guardarMesa = async () => {
    if (!mesaActual.numero || !mesaActual.capacidad) {
      Alert.alert('Error', 'Por favor completa el número y capacidad de la mesa');
      return;
    }

    const capacidadNum = parseInt(mesaActual.capacidad);
    if (isNaN(capacidadNum) || capacidadNum <= 0) {
      Alert.alert('Error', 'La capacidad debe ser un número positivo');
      return;
    }

    try {
      const mesaData = {
        numero: mesaActual.numero,
        capacidad: capacidadNum,
        mesero_id: mesaActual.mesero_id || null,
        estado: mesaActual.estado,
      };

      if (editando) {
        await mesasService.actualizarMesa(mesaActual.id, mesaData);
        Alert.alert('Éxito', 'Mesa actualizada correctamente');
      } else {
        await mesasService.crearMesa(mesaData);
        Alert.alert('Éxito', 'Mesa creada correctamente');
      }

      setModalVisible(false);
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo guardar la mesa');
    }
  };

  const confirmarEliminar = (mesa) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar la Mesa ${mesa.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarMesa(mesa.id),
        },
      ]
    );
  };

  const eliminarMesa = async (id) => {
    try {
      await mesasService.eliminarMesa(id);
      Alert.alert('Éxito', 'Mesa eliminada correctamente');
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la mesa');
    }
  };

  const verQR = async (mesa) => {
    try {
      const qr = await mesasService.generarQR(mesa.id);
      setQRData(qr);
      setModalQRVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el código QR');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return '#4CAF50';
      case 'ocupada':
        return '#FF5722';
      case 'reservada':
        return '#FFC107';
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
        return '◆ Reservada';
      case 'mantenimiento':
        return '⚠ Mantenimiento';
      default:
        return estado;
    }
  };

  const renderMesa = ({ item }) => (
    <View style={styles.mesaCard}>
      <View style={styles.mesaInfo}>
        <View style={styles.mesaHeader}>
          <Text style={styles.mesaNumero}>Mesa {item.numero}</Text>
          <Text style={styles.mesaCapacidad}>
            👥 {item.capacidad} {item.capacidad === 1 ? 'persona' : 'personas'}
          </Text>
        </View>

        {item.mesero_nombre && (
          <Text style={styles.meseroAsignado}>
            🧑‍💼 Mesero: {item.mesero_nombre}
          </Text>
        )}

        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) },
          ]}
        >
          <Text style={styles.estadoText}>{getEstadoLabel(item.estado)}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.btnQR} onPress={() => verQR(item)}>
          <Text style={styles.btnQRText}>📱</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => abrirModalEditar(item)}
        >
          <Text style={styles.btnEditarText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => confirmarEliminar(item)}
        >
          <Text style={styles.btnEliminarText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.btnBack}
          >
            <Text style={styles.btnBackText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Mesas</Text>
          <TouchableOpacity style={styles.btnNuevo} onPress={abrirModalNuevo}>
            <Text style={styles.btnNuevoText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Lista de Mesas */}
      <FlatList
        data={mesas}
        renderItem={renderMesa}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarDatos} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mesas registradas</Text>
            <TouchableOpacity
              style={styles.btnEmptyAction}
              onPress={abrirModalNuevo}
            >
              <Text style={styles.btnEmptyActionText}>Crear primera mesa</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal de Crear/Editar Mesa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editando ? 'Editar Mesa' : 'Nueva Mesa'}
              </Text>

              <Text style={styles.label}>Número de Mesa *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1, A-1, VIP-01"
                value={mesaActual.numero}
                onChangeText={(text) =>
                  setMesaActual({ ...mesaActual, numero: text })
                }
              />

              <Text style={styles.label}>Capacidad (personas) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 4"
                value={mesaActual.capacidad}
                onChangeText={(text) =>
                  setMesaActual({ ...mesaActual, capacidad: text })
                }
                keyboardType="numeric"
              />

              <Text style={styles.label}>Asignar Mesero</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={mesaActual.mesero_id}
                  onValueChange={(value) =>
                    setMesaActual({ ...mesaActual, mesero_id: value })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Sin asignar" value={null} />
                  {meseros.map((mesero) => (
                    <Picker.Item
                      key={mesero.id}
                      label={mesero.nombre}
                      value={mesero.id}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Estado</Text>
              <View style={styles.estadoSelector}>
                {['disponible', 'ocupada', 'reservada', 'mantenimiento'].map(
                  (estado) => (
                    <TouchableOpacity
                      key={estado}
                      style={[
                        styles.estadoOption,
                        mesaActual.estado === estado &&
                          styles.estadoOptionActive,
                        {
                          borderColor: getEstadoColor(estado),
                          backgroundColor:
                            mesaActual.estado === estado
                              ? getEstadoColor(estado)
                              : 'white',
                        },
                      ]}
                      onPress={() =>
                        setMesaActual({ ...mesaActual, estado })
                      }
                    >
                      <Text
                        style={[
                          styles.estadoOptionText,
                          mesaActual.estado === estado &&
                            styles.estadoOptionTextActive,
                        ]}
                      >
                        {getEstadoLabel(estado)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnGuardar}
                  onPress={guardarMesa}
                >
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Código QR */}
      <Modal
        visible={modalQRVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalQRVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrTitle}>
              Código QR - Mesa {qrData?.numero}
            </Text>

            {qrData?.qr_image && (
              <Image
                source={{ uri: qrData.qr_image }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            )}

            <Text style={styles.qrUrl}>{qrData?.url}</Text>

            <TouchableOpacity
              style={styles.btnCerrarQR}
              onPress={() => setModalQRVisible(false)}
            >
              <Text style={styles.btnCerrarQRText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const qrSize = isSmallScreen ? Math.min(screenWidth - 80, 250) : 300;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSafeArea: {
    backgroundColor: '#FF9800',
  },
  header: {
    backgroundColor: '#FF9800',
    paddingBottom: 15,
    paddingHorizontal: isSmallScreen ? 10 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  btnBack: {
    paddingVertical: 5,
  },
  btnBackText: {
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
  },
  btnNuevo: {
    backgroundColor: 'white',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 5 : 6,
    borderRadius: 5,
  },
  btnNuevoText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 12 : 14,
  },
  listContent: {
    padding: isSmallScreen ? 10 : 15,
    paddingBottom: 100,
  },
  mesaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: isSmallScreen ? 12 : 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mesaInfo: {
    flex: 1,
  },
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mesaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mesaCapacidad: {
    fontSize: 14,
    color: '#666',
  },
  meseroAsignado: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  acciones: {
    flexDirection: 'row',
    gap: 8,
  },
  btnQR: {
    padding: 8,
  },
  btnQRText: {
    fontSize: 20,
  },
  btnEditar: {
    padding: 8,
  },
  btnEditarText: {
    fontSize: 20,
  },
  btnEliminar: {
    padding: 8,
  },
  btnEliminarText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  btnEmptyAction: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnEmptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  estadoSelector: {
    flexDirection: 'column',
    gap: 10,
  },
  estadoOption: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  estadoOptionActive: {
    borderWidth: 2,
  },
  estadoOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoOptionTextActive: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 10,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnGuardar: {
    flex: 1,
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnGuardarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  qrImage: {
    width: qrSize,
    height: qrSize,
    marginBottom: 20,
  },
  qrUrl: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  btnCerrarQR: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnCerrarQRText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

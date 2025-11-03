import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import menuService from '../services/menuService';
import mesasService from '../services/mesasService';
import pedidosService from '../services/pedidosService';
import { useAuth } from '../contexts/AuthContext';

export default function CrearPedidoManualScreen({ route, navigation }) {
  const { mesaId: mesaIdParam } = route.params || {};
  const { usuario } = useAuth();

  const [mesas, setMesas] = useState([]);
  const [menu, setMenu] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(mesaIdParam || null);
  const [carrito, setCarrito] = useState([]);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMesaVisible, setModalMesaVisible] = useState(!mesaIdParam);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mesasData, menuData] = await Promise.all([
        mesasService.obtenerMesas(),
        menuService.obtenerMenuCompleto(),
      ]);

      setMesas(mesasData.filter((m) => m.estado === 'disponible' || m.estado === 'ocupada'));
      setMenu(menuData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarMesa = (mesaId) => {
    setMesaSeleccionada(mesaId);
    setModalMesaVisible(false);
  };

  const agregarAlCarrito = (platillo) => {
    const itemExistente = carrito.find((item) => item.platillo_id === platillo.id);

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.platillo_id === platillo.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          platillo_id: platillo.id,
          nombre: platillo.nombre,
          precio: platillo.precio,
          cantidad: 1,
          notas_especiales: '',
        },
      ]);
    }

    Alert.alert('Agregado', `${platillo.nombre} agregado al pedido`);
  };

  const actualizarCantidad = (platilloId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter((item) => item.platillo_id !== platilloId));
    } else {
      setCarrito(
        carrito.map((item) =>
          item.platillo_id === platilloId
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  };

  const confirmarPedido = async () => {
    if (!mesaSeleccionada) {
      Alert.alert('Error', 'Debes seleccionar una mesa');
      return;
    }

    if (carrito.length === 0) {
      Alert.alert('Error', 'El pedido está vacío');
      return;
    }

    try {
      setLoading(true);

      const platillos = carrito.map((item) => ({
        platillo_id: item.platillo_id,
        cantidad: item.cantidad,
        notas_especiales: item.notas_especiales,
      }));

      await pedidosService.crearPedido(mesaSeleccionada, platillos, notas);

      Alert.alert(
        'Pedido Creado',
        `Pedido registrado exitosamente. Total: $${calcularTotal().toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el pedido');
      console.error('Error al crear pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const mesaInfo = mesas.find((m) => m.id === mesaSeleccionada);

  const renderPlatillo = ({ item }) => (
    <TouchableOpacity
      style={styles.platilloCard}
      onPress={() => agregarAlCarrito(item)}
    >
      <View style={styles.platilloInfo}>
        <Text style={styles.platilloNombre}>{item.nombre}</Text>
        <Text style={styles.platilloDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <Text style={styles.platilloPrecio}>${item.precio.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnAgregar}
        onPress={() => agregarAlCarrito(item)}
      >
        <Text style={styles.btnAgregarText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoria = ({ item }) => {
    if (categoriaSeleccionada && categoriaSeleccionada !== item.id) {
      return null;
    }

    return (
      <View style={styles.categoriaContainer}>
        <TouchableOpacity
          style={styles.categoriaHeader}
          onPress={() =>
            setCategoriaSeleccionada(
              categoriaSeleccionada === item.id ? null : item.id
            )
          }
        >
          <Text style={styles.categoriaNombre}>{item.nombre}</Text>
          <Text style={styles.categoriaToggle}>
            {categoriaSeleccionada === item.id ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {(!categoriaSeleccionada || categoriaSeleccionada === item.id) && (
          <FlatList
            data={item.platillos}
            renderItem={renderPlatillo}
            keyExtractor={(platillo) => platillo.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.btnBack}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Pedido</Text>
        <TouchableOpacity onPress={() => setModalMesaVisible(true)}>
          <Text style={styles.btnCambiar}>Cambiar Mesa</Text>
        </TouchableOpacity>
      </View>

      {/* Info Mesa Seleccionada */}
      {mesaInfo && (
        <View style={styles.mesaInfo}>
          <Text style={styles.mesaInfoText}>
            📍 Mesa {mesaInfo.numero} - {mesaInfo.capacidad} personas
          </Text>
        </View>
      )}

      {/* Carrito Resumen */}
      {carrito.length > 0 && (
        <View style={styles.carritoResumen}>
          <Text style={styles.carritoText}>
            🛒 {carrito.reduce((sum, item) => sum + item.cantidad, 0)} items
          </Text>
          <Text style={styles.carritoTotal}>
            Total: ${calcularTotal().toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={confirmarPedido}
            disabled={loading}
          >
            <Text style={styles.btnConfirmarText}>
              {loading ? 'Procesando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menú */}
      <FlatList
        data={menu}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal Selección de Mesa */}
      <Modal
        visible={modalMesaVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !mesaIdParam && setModalMesaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Mesa</Text>

            <ScrollView>
              {mesas.map((mesa) => (
                <TouchableOpacity
                  key={mesa.id}
                  style={[
                    styles.mesaOption,
                    mesaSeleccionada === mesa.id && styles.mesaOptionSelected,
                  ]}
                  onPress={() => seleccionarMesa(mesa.id)}
                >
                  <Text style={styles.mesaOptionNumero}>Mesa {mesa.numero}</Text>
                  <Text style={styles.mesaOptionInfo}>
                    👥 {mesa.capacidad} personas · {mesa.estado}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!mesaIdParam && (
              <TouchableOpacity
                style={styles.btnCerrarModal}
                onPress={() => setModalMesaVisible(false)}
              >
                <Text style={styles.btnCerrarModalText}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  btnCambiar: {
    color: 'white',
    fontSize: 14,
  },
  mesaInfo: {
    backgroundColor: '#2196F3',
    padding: 12,
    alignItems: 'center',
  },
  mesaInfoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  carritoResumen: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  carritoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  carritoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 15,
  },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnConfirmarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  categoriaContainer: {
    marginBottom: 15,
  },
  categoriaHeader: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  categoriaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriaToggle: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  platilloCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  platilloInfo: {
    flex: 1,
  },
  platilloNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  platilloDescripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  platilloPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  btnAgregar: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAgregarText: {
    color: 'white',
    fontSize: 24,
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
  mesaOption: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  mesaOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9f0',
  },
  mesaOptionNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mesaOptionInfo: {
    fontSize: 14,
    color: '#666',
  },
  btnCerrarModal: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  btnCerrarModalText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

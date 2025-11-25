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
  Platform,
} from 'react-native';
import menuService from '../services/menuService';

export default function GestionMenuScreen({ navigation }) {
  const [categorias, setCategorias] = useState([]);
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [editando, setEditando] = useState(false);
  const [platilloActual, setPlatilloActual] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: null,
    imagen_url: '',
    tiempo_preparacion: '',
    ingredientes: '',
    alergenos: '',
    disponible: true,
  });
  const [categoriaActual, setCategoriaActual] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    orden: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [categoriasData, platillosData] = await Promise.all([
        menuService.obtenerCategorias(),
        menuService.obtenerPlatillos(),
      ]);
      setCategorias(categoriasData);
      setPlatillos(platillosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del menú');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevoPlatillo = () => {
    setPlatilloActual({
      id: null,
      nombre: '',
      descripcion: '',
      precio: '',
      categoria_id: categorias[0]?.id || null,
      imagen_url: '',
      tiempo_preparacion: '',
      ingredientes: '',
      alergenos: '',
      disponible: true,
    });
    setEditando(false);
    setModalVisible(true);
  };

  const abrirModalEditarPlatillo = (platillo) => {
    setPlatilloActual({
      ...platillo,
      precio: platillo.precio.toString(),
      tiempo_preparacion: platillo.tiempo_preparacion?.toString() || '',
    });
    setEditando(true);
    setModalVisible(true);
  };

  const guardarPlatillo = async () => {
    if (!platilloActual.nombre || !platilloActual.precio || !platilloActual.categoria_id) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const platilloData = {
        ...platilloActual,
        precio: parseFloat(platilloActual.precio),
        tiempo_preparacion: platilloActual.tiempo_preparacion
          ? parseInt(platilloActual.tiempo_preparacion)
          : null,
      };

      if (editando) {
        await menuService.actualizarPlatillo(platilloActual.id, platilloData);
        Alert.alert('Éxito', 'Platillo actualizado correctamente');
      } else {
        await menuService.crearPlatillo(platilloData);
        Alert.alert('Éxito', 'Platillo creado correctamente');
      }

      setModalVisible(false);
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el platillo');
      console.error('Error al guardar platillo:', error);
    }
  };

  const confirmarEliminarPlatillo = (platillo) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar "${platillo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarPlatillo(platillo.id),
        },
      ]
    );
  };

  const eliminarPlatillo = async (id) => {
    try {
      await menuService.eliminarPlatillo(id);
      Alert.alert('Éxito', 'Platillo eliminado correctamente');
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el platillo');
    }
  };

  const abrirModalNuevaCategoria = () => {
    setCategoriaActual({
      id: null,
      nombre: '',
      descripcion: '',
      orden: categorias.length + 1,
    });
    setModalCategoria(true);
  };

  const guardarCategoria = async () => {
    if (!categoriaActual.nombre) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    try {
      await menuService.crearCategoria(categoriaActual);
      Alert.alert('Éxito', 'Categoría creada correctamente');
      setModalCategoria(false);
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la categoría');
    }
  };

  const getNombreCategoria = (categoriaId) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.nombre || 'Sin categoría';
  };

  const renderPlatillo = ({ item }) => (
    <View style={[styles.platilloCard, !item.disponible && styles.platilloNoDisponible]}>
      <View style={styles.platilloInfo}>
        <Text style={styles.platilloNombre}>{item.nombre}</Text>
        <Text style={styles.platilloCategoria}>{getNombreCategoria(item.categoria_id)}</Text>
        <Text style={styles.platilloDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={styles.platilloFooter}>
          <Text style={styles.platilloPrecio}>${parseFloat(item.precio).toFixed(2)}</Text>
          {item.tiempo_preparacion && (
            <Text style={styles.platilloTiempo}>{item.tiempo_preparacion} min</Text>
          )}
          {!item.disponible && (
            <View style={styles.noDisponibleBadge}>
              <Text style={styles.noDisponibleText}>No disponible</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => abrirModalEditarPlatillo(item)}
        >
          <Text style={styles.btnEditarText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => confirmarEliminarPlatillo(item)}
        >
          <Text style={styles.btnEliminarText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnBack}>
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Menú</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.btnNuevo, styles.btnCategoria]}
            onPress={abrirModalNuevaCategoria}
          >
            <Text style={styles.btnNuevoText}>+ Categoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNuevo} onPress={abrirModalNuevoPlatillo}>
            <Text style={styles.btnNuevoText}>+ Platillo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Platillos */}
      <FlatList
        data={platillos}
        renderItem={renderPlatillo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarDatos} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay platillos registrados</Text>
            <TouchableOpacity style={styles.btnEmptyAction} onPress={abrirModalNuevoPlatillo}>
              <Text style={styles.btnEmptyActionText}>Agregar primer platillo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal de Platillo */}
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
                {editando ? 'Editar Platillo' : 'Nuevo Platillo'}
              </Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del platillo"
                value={platilloActual.nombre}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, nombre: text })
                }
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Descripción del platillo"
                value={platilloActual.descripcion}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, descripcion: text })
                }
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={platilloActual.precio}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, precio: text })
                }
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Categoría *</Text>
              <View style={styles.categoriaSelector}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoriaOption,
                      platilloActual.categoria_id === cat.id && styles.categoriaOptionActive,
                    ]}
                    onPress={() =>
                      setPlatilloActual({ ...platilloActual, categoria_id: cat.id })
                    }
                  >
                    <Text
                      style={[
                        styles.categoriaOptionText,
                        platilloActual.categoria_id === cat.id &&
                          styles.categoriaOptionTextActive,
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Tiempo de Preparación (minutos)</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                value={platilloActual.tiempo_preparacion}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, tiempo_preparacion: text })
                }
                keyboardType="number-pad"
              />

              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                value={platilloActual.imagen_url}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, imagen_url: text })
                }
                autoCapitalize="none"
              />

              <Text style={styles.label}>Ingredientes</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tomate, cebolla, ajo..."
                value={platilloActual.ingredientes}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, ingredientes: text })
                }
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Alérgenos</Text>
              <TextInput
                style={styles.input}
                placeholder="Gluten, lácteos..."
                value={platilloActual.alergenos}
                onChangeText={(text) =>
                  setPlatilloActual({ ...platilloActual, alergenos: text })
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnGuardar} onPress={guardarPlatillo}>
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Categoría */}
      <Modal
        visible={modalCategoria}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCategoria(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Categoría</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              value={categoriaActual.nombre}
              onChangeText={(text) =>
                setCategoriaActual({ ...categoriaActual, nombre: text })
              }
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Descripción de la categoría"
              value={categoriaActual.descripcion}
              onChangeText={(text) =>
                setCategoriaActual({ ...categoriaActual, descripcion: text })
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => setModalCategoria(false)}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnGuardar} onPress={guardarCategoria}>
                <Text style={styles.btnGuardarText}>Guardar</Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: {
    fontSize: 20,
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
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  btnNuevo: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  btnCategoria: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  btnNuevoText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  platilloCard: {
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
  platilloNoDisponible: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  platilloInfo: {
    marginBottom: 10,
  },
  platilloNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  platilloCategoria: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 5,
  },
  platilloDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  platilloFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platilloPrecio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  platilloTiempo: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  noDisponibleBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noDisponibleText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  btnEditar: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnEditarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnEliminar: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnEliminarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnEmptyActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    maxHeight: '90%',
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriaSelector: {
    flexDirection: 'column',
    gap: 10,
  },
  categoriaOption: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  categoriaOptionActive: {
    backgroundColor: '#4CAF50',
  },
  categoriaOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categoriaOptionTextActive: {
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
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnGuardarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

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
  Switch,
  ScrollView,
  RefreshControl,
} from 'react-native';
import usuariosService from '../services/usuariosService';
import authService from '../services/authService';

export default function GestionUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: '',
    email: '',
    password: '',
    rol: 'mesero',
    activo: true,
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setUsuarioActual({
      id: null,
      nombre: '',
      email: '',
      password: '',
      rol: 'mesero',
      activo: true,
    });
    setEditando(false);
    setModalVisible(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioActual({
      ...usuario,
      password: '',
    });
    setEditando(true);
    setModalVisible(true);
  };

  const guardarUsuario = async () => {
    if (!usuarioActual.nombre || !usuarioActual.email) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!editando && !usuarioActual.password) {
      Alert.alert('Error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      if (editando) {
        await usuariosService.actualizarUsuario(usuarioActual.id, {
          nombre: usuarioActual.nombre,
          email: usuarioActual.email,
          rol: usuarioActual.rol,
          activo: usuarioActual.activo,
        });
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        await authService.registro(
          usuarioActual.nombre,
          usuarioActual.email,
          usuarioActual.password,
          usuarioActual.rol
        );
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }

      setModalVisible(false);
      cargarUsuarios();
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo guardar el usuario');
    }
  };

  const confirmarEliminar = (usuario) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de desactivar a ${usuario.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => eliminarUsuario(usuario.id),
        },
      ]
    );
  };

  const eliminarUsuario = async (id) => {
    try {
      await usuariosService.eliminarUsuario(id);
      Alert.alert('Éxito', 'Usuario desactivado correctamente');
      cargarUsuarios();
    } catch (error) {
      Alert.alert('Error', 'No se pudo desactivar el usuario');
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'administrador':
        return '#2196F3';
      case 'cocina':
        return '#FF5722';
      case 'mesero':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getRolLabel = (rol) => {
    switch (rol) {
      case 'administrador':
        return '👑 Admin';
      case 'cocina':
        return '👨‍🍳 Cocina';
      case 'mesero':
        return '🧑‍💼 Mesero';
      default:
        return rol;
    }
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioNombre}>{item.nombre}</Text>
        <Text style={styles.usuarioEmail}>{item.email}</Text>
        <View style={styles.usuarioFooter}>
          <View
            style={[styles.rolBadge, { backgroundColor: getRolColor(item.rol) }]}
          >
            <Text style={styles.rolText}>{getRolLabel(item.rol)}</Text>
          </View>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: item.activo ? '#4CAF50' : '#999' },
            ]}
          >
            <Text style={styles.estadoText}>
              {item.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => abrirModalEditar(item)}
        >
          <Text style={styles.btnEditarText}>✏️</Text>
        </TouchableOpacity>
        {item.activo && (
          <TouchableOpacity
            style={styles.btnEliminar}
            onPress={() => confirmarEliminar(item)}
          >
            <Text style={styles.btnEliminarText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btnBack}
        >
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.btnNuevo} onPress={abrirModalNuevo}>
          <Text style={styles.btnNuevoText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Usuarios */}
      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarUsuarios} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
          </View>
        }
      />

      {/* Modal de Crear/Editar Usuario */}
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
                {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={usuarioActual.nombre}
                onChangeText={(text) =>
                  setUsuarioActual({ ...usuarioActual, nombre: text })
                }
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="email@ejemplo.com"
                value={usuarioActual.email}
                onChangeText={(text) =>
                  setUsuarioActual({ ...usuarioActual, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {!editando && (
                <>
                  <Text style={styles.label}>Contraseña *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={usuarioActual.password}
                    onChangeText={(text) =>
                      setUsuarioActual({ ...usuarioActual, password: text })
                    }
                    secureTextEntry
                  />
                </>
              )}

              <Text style={styles.label}>Rol *</Text>
              <View style={styles.rolSelector}>
                {['administrador', 'cocina', 'mesero'].map((rol) => (
                  <TouchableOpacity
                    key={rol}
                    style={[
                      styles.rolOption,
                      usuarioActual.rol === rol && styles.rolOptionActive,
                      {
                        borderColor: getRolColor(rol),
                        backgroundColor:
                          usuarioActual.rol === rol
                            ? getRolColor(rol)
                            : 'white',
                      },
                    ]}
                    onPress={() =>
                      setUsuarioActual({ ...usuarioActual, rol })
                    }
                  >
                    <Text
                      style={[
                        styles.rolOptionText,
                        usuarioActual.rol === rol &&
                          styles.rolOptionTextActive,
                      ]}
                    >
                      {getRolLabel(rol)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editando && (
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Activo</Text>
                  <Switch
                    value={usuarioActual.activo}
                    onValueChange={(value) =>
                      setUsuarioActual({ ...usuarioActual, activo: value })
                    }
                    trackColor={{ false: '#ccc', true: '#4CAF50' }}
                  />
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnGuardar}
                  onPress={guardarUsuario}
                >
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: '#2196F3',
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
  btnNuevo: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  btnNuevoText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  usuarioCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  usuarioFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  rolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
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
  rolSelector: {
    flexDirection: 'column',
    gap: 10,
  },
  rolOption: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rolOptionActive: {
    borderWidth: 2,
  },
  rolOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rolOptionTextActive: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
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
    backgroundColor: '#2196F3',
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

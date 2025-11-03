import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import pedidosService from '../services/pedidosService';

export default function CartScreen({ navigation }) {
  const {
    items,
    mesaId,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    obtenerTotal,
  } = useCart();

  const [notas, setNotas] = useState('');
  const [procesando, setProcesando] = useState(false);

  const confirmarPedido = async () => {
    if (!mesaId) {
      Alert.alert('Error', 'No se ha detectado la mesa. Por favor, escanee el código QR nuevamente.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }

    try {
      setProcesando(true);

      // Preparar platillos para el backend
      const platillos = items.map((item) => ({
        platillo_id: item.platillo_id,
        cantidad: item.cantidad,
        notas_especiales: item.notas_especiales || '',
      }));

      // Crear pedido
      const resultado = await pedidosService.crearPedido(
        mesaId,
        platillos,
        notas
      );

      Alert.alert(
        'Pedido Confirmado',
        `Tu pedido ha sido enviado a la cocina. Total: $${obtenerTotal().toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              limpiarCarrito();
              navigation.navigate('EstadoPedido', {
                pedidoId: resultado.pedido_id,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo procesar el pedido. Intenta nuevamente.'
      );
      console.error('Error al crear pedido:', error);
    } finally {
      setProcesando(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre}>{item.nombre}</Text>
        {item.notas_especiales && (
          <Text style={styles.itemNotas}>Nota: {item.notas_especiales}</Text>
        )}
        <Text style={styles.itemPrecio}>
          ${item.precio.toFixed(2)} x {item.cantidad}
        </Text>
      </View>

      <View style={styles.itemControles}>
        <View style={styles.cantidadControles}>
          <TouchableOpacity
            style={styles.btnCantidad}
            onPress={() => actualizarCantidad(item.platillo_id, item.cantidad - 1)}
          >
            <Text style={styles.btnCantidadText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.cantidadText}>{item.cantidad}</Text>

          <TouchableOpacity
            style={styles.btnCantidad}
            onPress={() => actualizarCantidad(item.platillo_id, item.cantidad + 1)}
          >
            <Text style={styles.btnCantidadText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => eliminarItem(item.platillo_id)}
        >
          <Text style={styles.btnEliminarText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemSubtotal}>
        ${(item.precio * item.cantidad).toFixed(2)}
      </Text>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <TouchableOpacity
          style={styles.btnVolverMenu}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.btnVolverMenuText}>Ver Menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Pedido</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.platillo_id.toString()}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.notasContainer}>
        <Text style={styles.notasLabel}>Notas adicionales:</Text>
        <TextInput
          style={styles.notasInput}
          placeholder="Ej: Sin cebolla, extra picante..."
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalMonto}>${obtenerTotal().toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btnConfirmar, procesando && styles.btnConfirmarDisabled]}
          onPress={confirmarPedido}
          disabled={procesando}
        >
          <Text style={styles.btnConfirmarText}>
            {procesando ? 'Procesando...' : 'Confirmar Pedido'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    padding: 15,
  },
  itemCard: {
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
  itemInfo: {
    marginBottom: 10,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemNotas: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  itemPrecio: {
    fontSize: 14,
    color: '#666',
  },
  itemControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cantidadControles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnCantidad: {
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCantidadText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  btnEliminar: {
    padding: 5,
  },
  btnEliminarText: {
    fontSize: 20,
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'right',
  },
  notasContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  notasLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  notasInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalMonto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConfirmarDisabled: {
    backgroundColor: '#ccc',
  },
  btnConfirmarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  btnVolverMenu: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnVolverMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

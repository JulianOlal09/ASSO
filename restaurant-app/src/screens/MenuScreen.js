import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import menuService from '../services/menuService';
import { useCart } from '../contexts/CartContext';

export default function MenuScreen({ navigation, route }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const { agregarItem, obtenerCantidadTotal, configurarMesa } = useCart();

  useEffect(() => {
    cargarMenu();
    // Configurar mesa si viene como parámetro
    if (route.params?.mesa) {
      configurarMesa(route.params.mesa);
    }
  }, []);

  const cargarMenu = async () => {
    try {
      setLoading(true);
      const data = await menuService.obtenerMenuCompleto();
      setMenu(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el menú');
      console.error('Error al cargar menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (platillo) => {
    agregarItem(platillo, 1);
    Alert.alert('Éxito', `${platillo.nombre} agregado al carrito`);
  };

  const renderPlatillo = ({ item }) => (
    <TouchableOpacity
      style={styles.platilloCard}
      onPress={() => navigation.navigate('DetallePlatillo', { platillo: item })}
    >
      {item.imagen_url && (
        <Image
          source={{ uri: item.imagen_url }}
          style={styles.platilloImagen}
          resizeMode="cover"
        />
      )}
      <View style={styles.platilloInfo}>
        <Text style={styles.platilloNombre}>{item.nombre}</Text>
        <Text style={styles.platilloDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={styles.platilloFooter}>
          <Text style={styles.platilloPrecio}>${item.precio.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.btnAgregar}
            onPress={() => agregarAlCarrito(item)}
          >
            <Text style={styles.btnAgregarText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          {item.descripcion && (
            <Text style={styles.categoriaDescripcion}>{item.descripcion}</Text>
          )}
        </TouchableOpacity>

        <FlatList
          data={item.platillos}
          renderItem={renderPlatillo}
          keyExtractor={(platillo) => platillo.id.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menú</Text>
        <TouchableOpacity
          style={styles.carritoBtn}
          onPress={() => navigation.navigate('Carrito')}
        >
          <Text style={styles.carritoBtnText}>
            🛒 ({obtenerCantidadTotal()})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menu}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  carritoBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  carritoBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  listContent: {
    padding: 15,
  },
  categoriaContainer: {
    marginBottom: 20,
  },
  categoriaHeader: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoriaNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriaDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  platilloCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  platilloImagen: {
    width: 100,
    height: 100,
  },
  platilloInfo: {
    flex: 1,
    padding: 12,
  },
  platilloNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  platilloDescripcion: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  platilloFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platilloPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  btnAgregar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 5,
  },
  btnAgregarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

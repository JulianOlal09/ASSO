import React, { useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Gesture handler root (important for web touch events)
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import GestionUsuariosScreen from './src/screens/GestionUsuariosScreen';
import GestionMesasScreen from './src/screens/GestionMesasScreen';
import GestionMenuScreen from './src/screens/GestionMenuScreen';
import MeseroDashboardScreen from './src/screens/MeseroDashboardScreen';
import DetalleMesaScreen from './src/screens/DetalleMesaScreen';
import CrearPedidoManualScreen from './src/screens/CrearPedidoManualScreen';
import ReporteVentasScreen from './src/screens/ReporteVentasScreen';
import ReportePlatillosScreen from './src/screens/ReportePlatillosScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['http://localhost:8081', 'http://localhost:19006'],
  config: {
    screens: {
      Login: 'login',
      Menu: 'menu',
      Carrito: 'carrito',
      Cocina: 'cocina',
      AdminDashboard: 'admin',
      GestionUsuarios: 'admin/usuarios',
      GestionMesas: 'admin/mesas',
      ReporteVentas: 'admin/reportes/ventas',
      ReportePlatillos: 'admin/reportes/platillos',
      Mesero: 'mesero',
      DetalleMesa: 'mesero/mesa/:mesaId',
      CrearPedidoManual: 'mesero/crear-pedido',
    },
  },
};

function AppNavigator() {
  const { usuario, loading } = useAuth();
  const navigationRef = useRef();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  let initialRouteName = 'Login';
  if (usuario) {
    if (usuario.rol === 'administrador') initialRouteName = 'AdminDashboard';
    else if (usuario.rol === 'cocina') initialRouteName = 'Cocina';
    else if (usuario.rol === 'mesero') initialRouteName = 'Mesero';
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Carrito" component={CartScreen} />
        <Stack.Screen name="Cocina" component={KitchenScreen} options={{ title: 'Cocina', headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Panel de Administración', headerShown: false }} />
        <Stack.Screen name="GestionUsuarios" component={GestionUsuariosScreen} options={{ title: 'Gestión de Usuarios' }} />
        <Stack.Screen name="GestionMesas" component={GestionMesasScreen} options={{ title: 'Gestión de Mesas' }} />
        <Stack.Screen name="GestionMenu" component={GestionMenuScreen} options={{ title: 'Gestión de Menú', headerShown: false }} />
        <Stack.Screen name="ReporteVentas" component={ReporteVentasScreen} options={{ title: 'Reporte de Ventas', headerShown: false }} />
        <Stack.Screen name="ReportePlatillos" component={ReportePlatillosScreen} options={{ title: 'Platillos Más Vendidos', headerShown: false }} />
        <Stack.Screen name="Mesero" component={MeseroDashboardScreen} options={{ title: 'Panel de Mesero', headerShown: false }} />
        <Stack.Screen name="DetalleMesa" component={DetalleMesaScreen} options={{ title: 'Detalle de Mesa', headerShown: false }} />
        <Stack.Screen name="CrearPedidoManual" component={CrearPedidoManualScreen} options={{ title: 'Crear Pedido' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* GestureHandlerRootView arregla muchos problemas de touch en web */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* Este View asegura que NavigationContainer y pantallas tengan flex:1 */}
          <View style={{ flex: 1 }}>
            <AppNavigator />
          </View>
        </GestureHandlerRootView>
      </CartProvider>
    </AuthProvider>
  );
}

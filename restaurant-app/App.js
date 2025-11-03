import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import GestionUsuariosScreen from './src/screens/GestionUsuariosScreen';
import MeseroDashboardScreen from './src/screens/MeseroDashboardScreen';
import DetalleMesaScreen from './src/screens/DetalleMesaScreen';
import CrearPedidoManualScreen from './src/screens/CrearPedidoManualScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Carrito" component={CartScreen} />
            <Stack.Screen name="Cocina" component={KitchenScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="GestionUsuarios" component={GestionUsuariosScreen} />
            <Stack.Screen name="Mesero" component={MeseroDashboardScreen} />
            <Stack.Screen name="DetalleMesa" component={DetalleMesaScreen} />
            <Stack.Screen name="CrearPedidoManual" component={CrearPedidoManualScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

# ANÁLISIS ARQUITECTURA: Sistema de Gestión de Restaurantes

## 1. NAVEGACIÓN - React Navigation Stack

### Configuración Principal (App.js)
- **Framework**: React Native con Expo
- **Navegación**: @react-navigation/native + @react-navigation/stack
- **Tipo**: Stack Navigator simple (sin Tab o Drawer)

### Pantallas Registradas
1. **Login** - Pantalla inicial
2. **Menu** - Menú de productos
3. **Carrito** - Carrito de compras
4. **Cocina** - Panel de cocina
5. **AdminDashboard** - Panel de administrador
6. **GestionUsuarios** - Gestión de usuarios (Admin)
7. **GestionMesas** - Gestión de mesas (Admin)
8. **Mesero** - Dashboard de mesero
9. **DetalleMesa** - Detalles de mesa (Mesero)
10. **CrearPedidoManual** - Crear pedido manual (Mesero)

---

## 2. AUTENTICACIÓN Y SESIÓN

### Flujo de Login
- Usuario ingresa email/password
- POST /api/auth/login
- Backend retorna: token JWT + usuario { id, nombre, email, rol }
- Roles: "administrador", "cocina", "mesero"
- Token expira en 24 horas
- JWT_SECRET: "mi_super_secreto_jwt_restaurant_2024"

### Redirección según Rol
- administrador → AdminDashboard
- cocina → KitchenScreen
- mesero → MeseroDashboardScreen

---

## 3. PERSISTENCIA DE DATOS

### AsyncStorage (React Native)
Se almacena:
- **token**: JWT para autenticación
- **usuario**: JSON con id, nombre, email, rol

### Recuperación de Sesión
Al iniciar la app, AuthProvider verifica AsyncStorage y restaura sesión automáticamente.

### CartContext
**IMPORTANTE**: El carrito NO persiste en AsyncStorage, solo está en memoria.
Si la app se cierra, el carrito se pierde.

---

## 4. PANTALLAS POR ROL

### Administrador (admin@restaurant.com)
**Pantalla**: AdminDashboardScreen

Funcionalidades:
- Estadísticas (ventas, mesas, tiempo de preparación)
- Gestión de Usuarios
- Gestión de Menú
- Gestión de Mesas
- Ver Pedidos
- Reportes

WebSocket: Sala "admin"
Recibe: nuevo-pedido, pedido-actualizado, item-actualizado

### Cocina (rol: "cocina")
**Pantalla**: KitchenScreen

Funcionalidades:
- Ver pedidos pendientes
- Filtrar por estado (activos, todos, listos)
- Marcar items como completados
- Notificaciones en tiempo real

WebSocket: Sala "cocina"

### Mesero (rol: "mesero")
**Pantalla**: MeseroDashboardScreen

Funcionalidades:
- Ver mesas del restaurante
- Ver estado de mesas (disponibles/ocupadas)
- Ver pedidos activos
- Crear pedidos manuales

Pantallas secundarias:
- DetalleMesaScreen: Detalles de mesa
- CrearPedidoManualScreen: Crear pedido

WebSocket: Salas "mesero-{userId}" y "mesa-{mesaId}"

---

## 5. FLUJO COMPLETO DE AUTENTICACIÓN

1. App inicia → AuthProvider verifica AsyncStorage
2. Si hay usuario guardado → restaura sesión
3. Si no → muestra LoginScreen
4. Usuario ingresa credenciales
5. authService.login() → POST /api/auth/login
6. Backend verifica y retorna token + usuario
7. authService guarda en AsyncStorage:
   - AsyncStorage.setItem('token', token)
   - AsyncStorage.setItem('usuario', JSON.stringify(usuario))
8. AuthContext actualiza estado global
9. LoginScreen redirige según rol
10. Interceptor de axios agrega token a todas las peticiones:
    - Header: Authorization: Bearer {token}

---

## 6. ALMACENAMIENTO DE TOKEN Y USUARIO

### Después del Login:
```javascript
// authService.js
await AsyncStorage.setItem('token', token);
await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
```

### En cada petición HTTP:
```javascript
// config/api.js (interceptor)
const token = await AsyncStorage.getItem('token');
config.headers.Authorization = `Bearer ${token}`;
```

### Backend verifica:
```javascript
// middleware/auth.middleware.js
const token = req.headers['authorization']?.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);
req.usuario = decoded;
```

### Recuperación de Sesión:
```javascript
// AuthProvider.js
const usuarioGuardado = await authService.getUsuarioActual();
if (usuarioGuardado) {
  setUsuario(usuarioGuardado);
}
```

---

## 7. SERVICIOS Y RUTAS

### authService.js
- login(email, password)
- registro(nombre, email, password, rol)
- logout()
- getUsuarioActual()
- isAuthenticated()

### usuariosService.js
- obtenerUsuarios()
- obtenerMeseros()
- obtenerUsuarioPorId(id)
- actualizarUsuario(id, usuario)
- cambiarPassword(id, passActual, passNueva)
- eliminarUsuario(id)

### mesasService.js
- obtenerMesas()
- obtenerMesaPorId(id)
- crearMesa(mesa)
- actualizarMesa(id, mesa)
- eliminarMesa(id)
- generarQR(id)
- cambiarEstado(id, estado)
- obtenerPedidosMesa(id)

### pedidosService.js
- crearPedido(mesaId, platillos, notas)
- obtenerPedidos(estado, mesaId)
- obtenerPedidoPorId(id)
- actualizarEstadoPedido(id, estado)
- actualizarEstadoItem(id, estado)
- cancelarPedido(id)
- obtenerPedidosCocina()

---

## 8. WEBSOCKET (SOCKET.IO)

### Conexión
```javascript
const socket = io(API_URL.replace('/api', ''));
```

### Salas
- cocina: Personal de cocina
- admin: Administrador
- mesero-{userId}: Mesero específico
- mesa-{mesaId}: Mesa específica

### Eventos
Cliente emite:
- join-cocina
- join-admin
- join-mesero {userId}
- join-mesa {mesaId}

Cliente recibe:
- nuevo-pedido
- pedido-actualizado
- item-actualizado
- disconnect

---

## 9. CONTEXTOS GLOBALES

### AuthContext
- usuario: { id, nombre, email, rol }
- loading: boolean
- login(email, password)
- logout()
- isAuthenticated()
- hasRole(roles[])

### CartContext
- items: { platillo_id, nombre, precio, cantidad, notas }
- mesaId: number
- agregarItem()
- actualizarCantidad()
- eliminarItem()
- limpiarCarrito()
- obtenerTotal()

**NOTA**: CartContext NO persiste en AsyncStorage

---

## 10. CONFIGURACIÓN BACKEND

**Stack**: Express.js + Node.js + MySQL

**Variables de Entorno**:
```
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=restaurant_db
JWT_SECRET=mi_super_secreto_jwt_restaurant_2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

**Middleware de Autenticación**:
- verificarToken: Verifica JWT en header Authorization
- verificarRol: Verifica si usuario tiene rol permitido

---

## 11. INTERCEPTORES DE AXIOS

**Petición**:
- Extrae token de AsyncStorage
- Agrega header: Authorization: Bearer {token}

**Respuesta**:
- Si status 401 (token expirado):
  - Elimina token de AsyncStorage
  - Elimina usuario de AsyncStorage
  - (Podría redirigir a login)

---

## CONCLUSIONES

1. **Navegación**: Stack Navigator simple. Redirección según rol.
2. **Autenticación**: JWT con 24h de expiración.
3. **Persistencia**: Token y usuario en AsyncStorage. Sesión automática.
4. **CartContext**: Solo en memoria, NO persiste.
5. **Tiempo Real**: WebSocket en salas específicas (cocina, admin, mesero).
6. **Roles**: 3 roles con pantallas y permisos diferenciados.
7. **Seguridad**: JWT verificado. Password encriptado. Mejoras necesarias en CORS y JWT_SECRET.

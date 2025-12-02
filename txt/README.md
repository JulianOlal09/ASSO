# Sistema de Gestión de Restaurantes

Aplicación modular completa para restaurantes que permite a los comensales ordenar y gestionar pedidos desde su mesa mediante códigos QR, con paneles dedicados para cocina, meseros y administración.

## Características Principales

### Para Clientes
- Escaneo de código QR de mesa
- Menú digital interactivo con categorías
- Carrito de compras con personalización de platillos
- Seguimiento de pedidos en tiempo real
- Notas especiales para cada platillo

### Para Cocina
- Panel de gestión de pedidos en tiempo real
- Notificaciones instantáneas de nuevos pedidos
- Control de estado de preparación por ítem
- Vista organizada por mesas y tiempos

### Para Meseros
- Gestión de mesas y estados
- Registro manual de pedidos
- Vista de pedidos activos
- Notificaciones de estado

### Para Administradores
- CRUD completo de menú y platillos
- Gestión de categorías y precios
- Generación de códigos QR para mesas
- Reportes y estadísticas de ventas
- Control de inventario
- Gestión de usuarios y permisos
- Promociones y descuentos

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MySQL** - Base de datos
- **Socket.IO** - WebSockets para tiempo real
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **QRCode** - Generación de códigos QR

### Frontend
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Cliente WebSocket
- **AsyncStorage** - Almacenamiento local

## Estructura del Proyecto

```
ASSO/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── config/            # Configuraciones
│   │   ├── controllers/       # Controladores
│   │   ├── middleware/        # Middlewares
│   │   ├── routes/            # Rutas
│   │   └── server.js          # Servidor principal
│   ├── database/
│   │   └── schema.sql         # Esquema de BD
│   └── package.json
│
├── restaurant-app/            # Frontend React Native
│   ├── src/
│   │   ├── config/           # Configuraciones
│   │   ├── contexts/         # Contexts (Auth, Cart)
│   │   ├── screens/          # Pantallas
│   │   ├── services/         # Servicios API
│   │   └── components/       # Componentes reutilizables
│   ├── App.js                # App principal
│   └── package.json
│
└── README.md                  # Este archivo
```

## Instalación y Configuración

### Requisitos Previos
- Node.js >= 14.x
- MySQL >= 5.7
- npm o yarn
- Expo CLI (para desarrollo móvil)

### 1. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=restaurant_db
JWT_SECRET=tu_secret_key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:19006
```

Crear base de datos:
```bash
mysql -u root -p < database/schema.sql
```

Iniciar servidor:
```bash
npm run dev
```

### 2. Configurar Frontend

```bash
cd restaurant-app
npm install
```

Actualizar URL de API en `src/config/api.js`:
```javascript
const API_URL = 'http://TU_IP:3000/api';
```

Iniciar aplicación:
```bash
npm start
```

## Uso

### Credenciales de Prueba

Después de ejecutar el schema.sql, puedes crear usuarios con estos roles:

**Administrador:**
- Email: admin@restaurant.com
- Password: (Usar endpoint de registro)

**Cocina:**
- Crear usuario con rol "cocina"

**Mesero:**
- Crear usuario con rol "mesero"

### Flujo de Uso

1. **Configuración Inicial (Admin)**
   - Iniciar sesión como administrador
   - Crear categorías de menú
   - Agregar platillos con precios e imágenes
   - Crear mesas y generar códigos QR
   - Crear usuarios para cocina y meseros

2. **Proceso de Pedido (Cliente)**
   - Escanear código QR de la mesa
   - Navegar por el menú
   - Agregar platillos al carrito
   - Confirmar pedido

3. **Preparación (Cocina)**
   - Recibir notificación de nuevo pedido
   - Cambiar estado a "en preparación"
   - Marcar como "listo" cuando esté terminado

4. **Entrega (Mesero)**
   - Ver pedidos listos
   - Entregar a la mesa
   - Marcar como "entregado"

## Endpoints API Principales

### Autenticación
```
POST /api/auth/login
POST /api/auth/registro
GET /api/auth/verificar
```

### Menú
```
GET /api/menu/menu-completo
GET /api/menu/categorias
GET /api/menu/platillos
POST /api/menu/platillos (Admin)
PUT /api/menu/platillos/:id (Admin)
DELETE /api/menu/platillos/:id (Admin)
```

### Pedidos
```
POST /api/pedidos
GET /api/pedidos
GET /api/pedidos/cocina
PUT /api/pedidos/:id/estado
PUT /api/pedidos/item/:id/estado
```

### Mesas
```
GET /api/mesas
POST /api/mesas (Admin)
GET /api/mesas/:id/qr (Admin)
PUT /api/mesas/:id/estado
```

### Reportes
```
GET /api/reportes/ventas
GET /api/reportes/platillos-mas-vendidos
GET /api/reportes/estadisticas-generales
GET /api/reportes/inventario-bajo
GET /api/reportes/rendimiento-meseros
```

## Características Técnicas

### Seguridad
- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Autorización basada en roles
- Validación de datos
- Registro de auditoría

### Tiempo Real
- WebSockets con Socket.IO
- Notificaciones instantáneas de pedidos
- Actualización de estados en tiempo real
- Sincronización entre dispositivos

### Base de Datos
- Esquema normalizado
- Relaciones con integridad referencial
- Índices para optimización
- Transacciones para operaciones críticas

## Próximas Características

- [ ] Panel completo de meseros
- [ ] Panel completo de administración con reportes visuales
- [ ] Integración con pasarelas de pago
- [ ] Notificaciones push
- [ ] Sistema de reservas
- [ ] Programa de fidelización
- [ ] Calificaciones y reseñas
- [ ] Multi-idioma
- [ ] Modo offline

## Contribución

Este es un proyecto educativo desarrollado como parte de un sistema de gestión para restaurantes.

## Licencia

MIT License

## Soporte

Para preguntas o problemas, crear un issue en el repositorio del proyecto.

---

Desarrollado con ❤️ para mejorar la experiencia en restaurantes

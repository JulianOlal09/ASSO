# Backend - Sistema de Gestión de Restaurantes

API REST desarrollada con Node.js, Express y MySQL para gestionar pedidos de restaurantes.

## Características

- Autenticación con JWT
- Sistema de roles (Admin, Mesero, Cocina)
- CRUD completo de menú, platillos y categorías
- Gestión de pedidos en tiempo real con WebSockets
- Generación de códigos QR para mesas
- Reportes y estadísticas
- Control de inventario

## Requisitos

- Node.js >= 14.x
- MySQL >= 5.7
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de MySQL.

3. Crear base de datos:
```bash
mysql -u root -p < database/schema.sql
```

4. Iniciar servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints Principales

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verificar` - Verificar token

### Menú
- `GET /api/menu/categorias` - Obtener categorías
- `GET /api/menu/menu-completo` - Obtener menú completo
- `POST /api/menu/platillos` - Crear platillo (Admin)
- `PUT /api/menu/platillos/:id` - Actualizar platillo (Admin)

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/cocina` - Pedidos para cocina
- `PUT /api/pedidos/:id/estado` - Actualizar estado

### Mesas
- `GET /api/mesas` - Listar mesas
- `POST /api/mesas` - Crear mesa (Admin)
- `GET /api/mesas/:id/qr` - Generar QR de mesa

### Reportes
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/platillos-mas-vendidos` - Platillos más vendidos
- `GET /api/reportes/estadisticas-generales` - Estadísticas generales

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── menu.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── mesas.controller.js
│   │   ├── usuarios.controller.js
│   │   └── reportes.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── menu.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── mesas.routes.js
│   │   ├── usuarios.routes.js
│   │   └── reportes.routes.js
│   └── server.js
├── database/
│   └── schema.sql
├── .env.example
└── package.json
```

## WebSockets

El servidor utiliza Socket.IO para actualizaciones en tiempo real:

- `join-cocina` - Unirse a sala de cocina
- `join-mesa` - Unirse a sala de mesa específica
- `nuevo-pedido` - Evento de nuevo pedido
- `pedido-actualizado` - Evento de actualización de pedido

## Roles y Permisos

### Administrador
- Acceso completo a todas las funciones
- Gestión de usuarios, menú, mesas
- Visualización de reportes

### Mesero
- Gestión de pedidos
- Cambio de estado de mesas
- Consulta de pedidos activos

### Cocina
- Visualización de pedidos pendientes
- Actualización de estado de preparación

## Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT
- Validación de roles y permisos
- Registro de auditoría

# Guía de Instalación - Sistema de Gestión de Restaurantes

Esta guía te llevará paso a paso para instalar y configurar la aplicación.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 14 o superior)
   - Descargar desde: https://nodejs.org/

2. **MySQL** (versión 5.7 o superior)
   - Descargar desde: https://dev.mysql.com/downloads/

3. **Git** (opcional, para clonar el proyecto)
   - Descargar desde: https://git-scm.com/

4. **Expo CLI** (para desarrollo móvil)
   ```bash
   npm install -g expo-cli
   ```

## Paso 1: Configurar la Base de Datos MySQL

### 1.1 Iniciar MySQL

En Windows:
```bash
# Abrir MySQL desde el menú de inicio o
net start MySQL80
```

En Mac/Linux:
```bash
sudo mysql.server start
# o
sudo service mysql start
```

### 1.2 Crear la Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Salir de MySQL después de ingresar (ejecutaremos el script directamente)
exit
```

### 1.3 Ejecutar el Script de Base de Datos

```bash
# Navegar a la carpeta del proyecto
cd C:\Users\julia\OneDrive\Documentos\ASSO

# Ejecutar el script SQL
mysql -u root -p < backend/database/schema.sql
```

Esto creará:
- Base de datos `restaurant_db`
- Todas las tablas necesarias
- Datos de ejemplo (categorías, mesas, usuario administrador)

## Paso 2: Configurar el Backend

### 2.1 Instalar Dependencias

```bash
cd backend
npm install
```

### 2.2 Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=restaurant_db
DB_PORT=3306

# Configuración JWT
JWT_SECRET=mi_super_secreto_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:19006
```

**IMPORTANTE:** Cambia `tu_password_mysql` por tu contraseña real de MySQL.

### 2.3 Iniciar el Servidor Backend

```bash
npm run dev
```

Deberías ver:
```
✅ Conectado a MySQL exitosamente
🚀 Servidor corriendo en puerto 3000
📡 WebSocket habilitado para actualizaciones en tiempo real
```

Si hay errores, verifica:
- Que MySQL esté corriendo
- Que las credenciales en `.env` sean correctas
- Que la base de datos `restaurant_db` exista

## Paso 3: Configurar el Frontend

### 3.1 Abrir Nueva Terminal

Mantén el backend corriendo y abre una nueva terminal.

### 3.2 Instalar Dependencias

```bash
cd restaurant-app
npm install
```

Este proceso puede tardar varios minutos.

### 3.3 Configurar la URL de la API

Editar el archivo `restaurant-app/src/config/api.js`:

```javascript
// Si estás en el mismo equipo:
const API_URL = 'http://localhost:3000/api';

// Si estás usando un dispositivo físico, usa tu IP local:
// const API_URL = 'http://192.168.1.X:3000/api';
```

Para encontrar tu IP local:
- Windows: `ipconfig` (busca "Dirección IPv4")
- Mac/Linux: `ifconfig` o `ip addr`

### 3.4 Iniciar la Aplicación

```bash
npm start
```

Esto abrirá Expo DevTools en tu navegador.

## Paso 4: Ejecutar la Aplicación

Tienes varias opciones:

### Opción 1: En el Navegador Web
1. Presiona `w` en la terminal
2. La app se abrirá en http://localhost:19006

### Opción 2: En Android (Emulador o Físico)
1. Instala Expo Go desde Play Store
2. Escanea el código QR que aparece en la terminal
3. O presiona `a` para abrir en emulador Android

### Opción 3: En iOS (Solo Mac)
1. Instala Expo Go desde App Store
2. Escanea el código QR
3. O presiona `i` para abrir en simulador iOS

## Paso 5: Crear Usuario Administrador

### 5.1 Usar Postman o cURL

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "email": "admin@restaurant.com",
    "password": "admin123",
    "rol": "administrador"
  }'
```

### 5.2 Crear Usuario de Cocina

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Chef Principal",
    "email": "cocina@restaurant.com",
    "password": "cocina123",
    "rol": "cocina"
  }'
```

### 5.3 Crear Usuario Mesero

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mesero 1",
    "email": "mesero@restaurant.com",
    "password": "mesero123",
    "rol": "mesero"
  }'
```

## Paso 6: Agregar Contenido de Ejemplo

### 6.1 Iniciar Sesión como Administrador

En la app, usa:
- Email: `admin@restaurant.com`
- Password: `admin123`

### 6.2 Agregar Platillos (Usando API)

```bash
# Obtener token de autenticación primero
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'

# Copiar el token de la respuesta y usarlo para agregar platillos
curl -X POST http://localhost:3000/api/menu/platillos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombre": "Hamburguesa Clásica",
    "descripcion": "Hamburguesa con queso, lechuga, tomate y papas fritas",
    "precio": 12.99,
    "categoria_id": 2,
    "tiempo_preparacion": 15
  }'
```

## Paso 7: Probar la Aplicación

### Como Cliente:
1. En la pantalla de login, presiona "Soy Cliente (Escanear QR)"
2. Navega al menú directamente (o escanea QR si tienes uno)
3. Agrega platillos al carrito
4. Confirma el pedido

### Como Cocina:
1. Login con credenciales de cocina
2. Verás los pedidos pendientes
3. Cambia estados de "pendiente" → "en preparación" → "listo"

## Solución de Problemas

### El backend no se conecta a MySQL
```bash
# Verificar que MySQL esté corriendo
mysql --version

# Verificar credenciales
mysql -u root -p restaurant_db
```

### La app no se conecta al backend
- Verifica que el backend esté corriendo en puerto 3000
- Si usas dispositivo físico, usa tu IP local en vez de localhost
- Verifica que no haya firewall bloqueando el puerto

### Error de dependencias en el frontend
```bash
# Limpiar cache y reinstalar
cd restaurant-app
rm -rf node_modules
rm package-lock.json
npm install
```

### WebSockets no funcionan
- Verifica que la URL de la API no tenga `/api` al final para Socket.IO
- Asegúrate de que el puerto 3000 esté abierto

## Comandos Útiles

### Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Ver logs de MySQL
mysql -u root -p restaurant_db
SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 10;
```

### Frontend
```bash
# Iniciar Expo
npm start

# Limpiar cache
expo start -c

# Ver logs
expo start --web
```

## Siguiente Pasos

Una vez que todo esté funcionando:

1. Personalizar el menú con tus propios platillos
2. Generar códigos QR para tus mesas
3. Imprimir los códigos QR y colocarlos en las mesas
4. Crear usuarios para tu equipo
5. Probar el flujo completo de pedidos

## Recursos Adicionales

- Documentación de Express: https://expressjs.com/
- Documentación de React Native: https://reactnative.dev/
- Documentación de Expo: https://docs.expo.dev/
- Documentación de MySQL: https://dev.mysql.com/doc/

## Soporte

Si encuentras problemas:
1. Revisa los logs del backend en la terminal
2. Revisa los logs del frontend en Expo DevTools
3. Verifica que todas las dependencias estén instaladas
4. Consulta la documentación de cada tecnología

---

¡Listo! Ahora deberías tener la aplicación funcionando completamente.

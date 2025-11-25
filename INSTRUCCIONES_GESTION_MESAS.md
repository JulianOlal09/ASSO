# Instrucciones para Implementar Gestión de Mesas

## Resumen de Cambios

Se ha implementado la funcionalidad completa de **Gestión de Mesas** en el panel de administración, que permite:
- Crear nuevas mesas
- Editar mesas existentes
- Asignar meseros a mesas específicas
- Cambiar el estado de las mesas
- Ver código QR de cada mesa
- Eliminar mesas

## Pasos para Completar la Implementación

### 1. Actualizar la Base de Datos

Necesitas ejecutar la migración SQL para agregar el campo `mesero_id` a la tabla `mesas`.

**Opción A: Si tienes MySQL instalado localmente**
```bash
cd backend/database
mysql -u root -p restaurant_db < migration_add_mesero_to_mesas.sql
```

**Opción B: Usar un cliente MySQL (phpMyAdmin, MySQL Workbench, etc.)**
1. Abre el archivo `backend/database/migration_add_mesero_to_mesas.sql`
2. Copia el contenido
3. Ejecuta el script en tu base de datos `restaurant_db`

**Contenido del script de migración:**
```sql
USE restaurant_db;

ALTER TABLE mesas
ADD COLUMN mesero_id INT AFTER capacidad,
ADD FOREIGN KEY (mesero_id) REFERENCES usuarios(id) ON DELETE SET NULL;
```

### 2. Instalar Dependencia Faltante en el Frontend

La pantalla de Gestión de Mesas usa el componente Picker para seleccionar meseros. Necesitas instalar esta dependencia:

```bash
cd restaurant-app
npm install @react-native-picker/picker
```

### 3. Reiniciar el Backend

Si el backend ya está corriendo, reinícialo para asegurarte de que los cambios en los controladores se apliquen:

```bash
cd backend
npm run dev
```

### 4. Reiniciar la Aplicación Frontend

```bash
cd restaurant-app
npm start
```

## Archivos Modificados y Creados

### Backend
- ✅ `backend/database/schema.sql` - Actualizado con campo mesero_id
- ✅ `backend/database/migration_add_mesero_to_mesas.sql` - **NUEVO** Script de migración
- ✅ `backend/src/controllers/mesas.controller.js` - Actualizado para incluir mesero en CRUD
- ✅ `backend/src/controllers/usuarios.controller.js` - Agregada función obtenerMeseros()
- ✅ `backend/src/routes/usuarios.routes.js` - Agregada ruta GET /meseros/lista

### Frontend
- ✅ `restaurant-app/src/services/usuariosService.js` - Agregada función obtenerMeseros()
- ✅ `restaurant-app/src/screens/GestionMesasScreen.js` - **NUEVO** Pantalla completa de gestión
- ✅ `restaurant-app/App.js` - Registrada la nueva pantalla

### Navegación
- ✅ El botón "Gestión de Mesas" en AdminDashboardScreen ya estaba configurado y funcional

## Funcionalidades de la Pantalla de Gestión de Mesas

### Vista Principal
- Lista todas las mesas con:
  - Número de mesa
  - Capacidad (número de personas)
  - Mesero asignado (si hay)
  - Estado (Disponible, Ocupada, Reservada, Mantenimiento)
- Botón "Nueva Mesa" para crear mesas
- Pull-to-refresh para actualizar datos

### Crear/Editar Mesa
- **Número de Mesa**: Campo de texto libre (permite números o códigos como "A-1", "VIP-01")
- **Capacidad**: Número de personas que puede atender la mesa
- **Asignar Mesero**: Dropdown con lista de meseros activos
  - Opción "Sin asignar" si no quieres asignar mesero
- **Estado**: Selector visual con 4 opciones:
  - ✓ Disponible (verde)
  - ● Ocupada (rojo)
  - ◆ Reservada (amarillo)
  - ⚠ Mantenimiento (gris)

### Acciones por Mesa
- **📱 Ver QR**: Genera y muestra el código QR de la mesa
- **✏️ Editar**: Abre el modal de edición
- **🗑️ Eliminar**: Elimina la mesa (con confirmación)

## Estructura de Datos

### Tabla mesas (actualizada)
```sql
CREATE TABLE mesas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    mesero_id INT,                    -- NUEVO CAMPO
    qr_code VARCHAR(255) UNIQUE,
    estado ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (mesero_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

### API Endpoints Actualizados

#### Mesas
- `GET /api/mesas` - Obtener todas las mesas (con info de mesero)
- `GET /api/mesas/:id` - Obtener una mesa específica
- `POST /api/mesas` - Crear mesa (incluye mesero_id)
- `PUT /api/mesas/:id` - Actualizar mesa (incluye mesero_id)
- `DELETE /api/mesas/:id` - Eliminar mesa
- `GET /api/mesas/:id/qr` - Generar código QR

#### Usuarios (nuevo endpoint)
- `GET /api/usuarios/meseros/lista` - Obtener solo usuarios con rol "mesero" activos

## Pruebas Recomendadas

### 1. Crear Mesa sin Mesero
1. Ir a Panel Admin > Gestión de Mesas
2. Click en "+ Nueva"
3. Llenar Número y Capacidad
4. Dejar "Sin asignar" en Mesero
5. Guardar

### 2. Crear Mesa con Mesero Asignado
1. Asegúrate de tener al menos un usuario con rol "mesero" activo
2. Crear nueva mesa
3. Seleccionar un mesero del dropdown
4. Guardar y verificar que aparece el nombre del mesero en la lista

### 3. Ver Código QR
1. Click en 📱 de cualquier mesa
2. Debe mostrar un código QR
3. El QR debe apuntar a: `http://localhost:19006/menu?mesa={id}`

### 4. Editar Mesa
1. Click en ✏️ de una mesa
2. Cambiar datos (número, capacidad, mesero, estado)
3. Guardar y verificar cambios

### 5. Eliminar Mesa
1. Click en 🗑️
2. Confirmar eliminación
3. Verificar que desaparece de la lista

## Solución de Problemas

### Error: "Cannot find module '@react-native-picker/picker'"
**Solución:** Ejecutar `npm install @react-native-picker/picker` en la carpeta restaurant-app

### Error: "Unknown column 'mesero_id' in 'field list'"
**Solución:** Ejecutar el script de migración SQL (Paso 1)

### Error: "Cannot read property 'mesero_nombre' of undefined"
**Solución:** Reiniciar el backend para que los cambios en el controlador se apliquen

### Los meseros no aparecen en el dropdown
**Posibles causas:**
1. No hay usuarios con rol "mesero" en la base de datos
2. Los meseros están inactivos (activo = FALSE)

**Solución:** Crear usuarios con rol "mesero" desde Gestión de Usuarios

### El QR no se genera
**Verificar:**
1. Que el backend esté corriendo
2. Que el paquete `qrcode` esté instalado en el backend: `npm install qrcode`

## Próximos Pasos Sugeridos

1. **Gestión de Menú**: Implementar CRUD completo de platillos y categorías
2. **Reportes Visuales**: Gráficos de ventas por período
3. **Generación masiva de QR**: Descargar todos los QR de las mesas en un ZIP
4. **Impresión de QR**: Botón para imprimir códigos QR directamente

## Contacto y Soporte

Si tienes algún problema durante la implementación:
1. Verifica que todos los archivos se hayan modificado correctamente
2. Revisa la consola del backend y frontend para errores específicos
3. Asegúrate de que la migración SQL se ejecutó correctamente

---

**Fecha de implementación:** 2025-11-03
**Versión:** 1.0

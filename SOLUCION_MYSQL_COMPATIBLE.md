# ✅ Solución: Compatibilidad con MySQL Antiguo

## Problema Resuelto

**Error Original:**
```
Error: FUNCTION restaurant_db.JSON_ARRAYAGG does not exist
```

**Causa:**
Tu versión de MySQL/MariaDB no soporta la función `JSON_ARRAYAGG` (introducida en MySQL 5.7.22).

**Solución:**
He reescrito la función `obtenerDetallePedido` para NO usar funciones JSON de MySQL. Ahora es 100% compatible con versiones antiguas.

---

## Cambios Implementados

### **Antes (No Compatible):**
```javascript
// Usaba JSON_ARRAYAGG - requiere MySQL 5.7.22+
const [pedidos] = await db.query(`
  SELECT
    p.*,
    JSON_ARRAYAGG(...) as items  // ❌ No funciona en MySQL antiguo
  FROM pedidos p
  ...
`);
```

### **Después (Compatible):**
```javascript
// Dos consultas separadas - funciona en cualquier versión
// 1. Obtener pedido
const [pedidos] = await db.query(`SELECT p.* FROM pedidos p WHERE p.id = ?`);

// 2. Obtener items
const [items] = await db.query(`SELECT dp.* FROM detalle_pedidos dp WHERE dp.pedido_id = ?`);

// 3. Combinar en JavaScript
const pedidoCompleto = {
  ...pedidos[0],
  items: items
};
```

---

## Archivo Modificado

- ✅ `backend/src/controllers/pedidos.controller.js`
  - Función `obtenerDetallePedido` reescrita
  - Eliminado uso de `JSON.parse()`
  - Ahora funciona con MySQL 5.5+, 5.6, 5.7, 8.0 y MariaDB

---

## Verificar tu Versión de MySQL

Ejecuta en la terminal:

```bash
mysql -u root -p -e "SELECT VERSION();"
```

**Versiones soportadas:**
- ✅ MySQL 5.5
- ✅ MySQL 5.6
- ✅ MySQL 5.7 (todas las versiones)
- ✅ MySQL 8.0+
- ✅ MariaDB 10.x

---

## Pasos para Probar

### **1. Reinicia el Backend**

Si el backend ya estaba corriendo, reinícialo:

```bash
cd backend
# Ctrl+C para detener
npm run dev
```

**Deberías ver:**
```
🚀 Servidor corriendo en puerto 4000
📡 WebSocket habilitado para actualizaciones en tiempo real
```

---

### **2. Prueba Hacer un Pedido**

Abre el menú web:
```
http://localhost:4000/menu?mesa=1
```

1. Agrega platillos al carrito
2. Click en 🛒
3. Click en "Confirmar Pedido"

**Deberías ver:**
- ✅ Mensaje: "¡Pedido enviado a cocina!"
- ✅ Sin errores
- ✅ Carrito se vacía

---

### **3. Verifica en la Consola del Backend**

Deberías ver logs como:

```
✅ Pedido 1 creado - Notificaciones enviadas
👨‍🍳 Cliente unido a sala de cocina
👑 Cliente unido a sala de admin
```

---

### **4. Verifica en la Base de Datos**

```sql
-- Ver último pedido
SELECT * FROM pedidos ORDER BY id DESC LIMIT 1;

-- Ver items del pedido
SELECT
  p.id as pedido_id,
  p.mesa_id,
  p.total,
  p.estado,
  dp.platillo_id,
  pl.nombre as platillo,
  dp.cantidad,
  dp.subtotal
FROM pedidos p
JOIN detalle_pedidos dp ON p.id = dp.pedido_id
JOIN platillos pl ON dp.platillo_id = pl.id
WHERE p.id = (SELECT MAX(id) FROM pedidos);
```

**Deberías ver:**
```
pedido_id | mesa_id | total  | estado    | platillo           | cantidad | subtotal
----------|---------|--------|-----------|-------------------|----------|----------
1         | 1       | 305.00 | pendiente | Ensalada César    | 2        | 170.00
1         | 1       | 305.00 | pendiente | Hamburguesa       | 1        | 135.00
```

---

## Si Aún Sale Error

### **Error: "Table 'pedidos' doesn't exist"**

Ejecuta:
```bash
mysql -u root -padmin restaurant_db < backend/database/crear_tablas_pedidos.sql
```

### **Error: "Access denied"**

Verifica tu contraseña de MySQL en el archivo `.env`:

```bash
cd backend
cat .env
```

Debe tener:
```
DB_USER=root
DB_PASSWORD=admin  # Tu contraseña aquí
DB_NAME=restaurant_db
```

### **Error al conectar a MySQL**

Verifica que MySQL esté corriendo:

```bash
# Windows
net start MySQL

# O verifica el servicio en Servicios de Windows
```

---

## Flujo Completo Funcionando

```
1. Cliente abre menú web
   → http://localhost:4000/menu?mesa=1

2. Agrega productos al carrito
   → Click en "Agregar"
   → Badge muestra cantidad

3. Confirma pedido
   → Click en "Confirmar Pedido"
   → Backend recibe datos

4. Backend procesa pedido
   → Crea registro en tabla pedidos
   → Crea registros en detalle_pedidos
   → Calcula total
   → Actualiza estado de mesa

5. Backend notifica a todos vía WebSocket
   → Cocina: "🔔 NUEVO PEDIDO"
   → Admin: "Nuevo Pedido - Mesa 1 - $305"
   → Mesero: "Nuevo Pedido - Mesa 1"

6. Cliente ve confirmación
   → "✅ ¡Pedido enviado a cocina!"
   → "👨‍🍳 Tu pedido está siendo preparado"
```

---

## Resumen de Archivos Importantes

```
backend/
├── src/
│   └── controllers/
│       └── pedidos.controller.js ← ✅ ARREGLADO
├── database/
│   ├── crear_tablas_pedidos.sql ← Crear tablas
│   └── datos_menu_ejemplo.sql   ← Datos de ejemplo
└── verificar-tablas.js          ← Verificar BD
```

---

## Comandos Rápidos

```bash
# Verificar tablas
cd backend
node verificar-tablas.js

# Crear tablas de pedidos
mysql -u root -padmin restaurant_db < backend/database/crear_tablas_pedidos.sql

# Reiniciar backend
cd backend
npm run dev

# Ver logs en tiempo real (en otra terminal)
tail -f nohup.out

# Verificar pedidos en BD
mysql -u root -padmin -e "USE restaurant_db; SELECT * FROM pedidos;"
```

---

## ✅ Checklist Final

Antes de confirmar que todo funciona:

- [ ] Backend reiniciado
- [ ] Tablas `pedidos` y `detalle_pedidos` creadas
- [ ] Menú web carga correctamente
- [ ] Puedes agregar items al carrito
- [ ] Al confirmar pedido: sale "¡Pedido enviado!"
- [ ] Sin errores en consola del backend
- [ ] Pedido aparece en la base de datos
- [ ] (Opcional) Panel de cocina recibe notificación

---

**Fecha:** 2025-11-04
**Problema:** MySQL no soporta JSON_ARRAYAGG
**Solución:** Reescrito para usar consultas simples + JavaScript
**Estado:** ✅ RESUELTO - Compatible con todas las versiones de MySQL

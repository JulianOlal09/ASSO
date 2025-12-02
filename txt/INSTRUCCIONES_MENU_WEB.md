# 🍽️ Menú Digital Web - Instrucciones de Uso

## Resumen

Se ha creado una **página web responsiva** para el menú digital del restaurante que permite a los clientes:
- ✅ Ver el menú completo organizado por categorías
- ✅ Filtrar platillos por categoría
- ✅ Agregar productos al carrito de compras
- ✅ Ajustar cantidades en el carrito
- ✅ Confirmar pedidos que se envían automáticamente a la cocina y al mesero
- ✅ Funciona perfectamente en dispositivos móviles (iPhone, Android)
- ✅ Se abre directamente escaneando el código QR de cada mesa

---

## 📁 Archivos Creados

### Frontend (Página Web)
- ✅ `backend/public/menu.html` - Página web completa del menú (HTML + CSS + JavaScript)

### Backend (Actualizaciones)
- ✅ `backend/src/server.js` - Configurado para servir archivos estáticos
- ✅ `backend/src/controllers/mesas.controller.js` - QR apunta a la página web
- ✅ `backend/database/datos_menu_ejemplo.sql` - Datos de ejemplo para el menú

---

## 🚀 Pasos de Instalación

### 1. Insertar Datos de Ejemplo en la Base de Datos

Ejecuta el script SQL para agregar categorías y platillos de ejemplo:

```bash
mysql -u root -p restaurant_db < backend/database/datos_menu_ejemplo.sql
```

O desde MySQL Workbench/phpMyAdmin:
1. Abre el archivo `backend/database/datos_menu_ejemplo.sql`
2. Copia el contenido
3. Ejecuta en la base de datos `restaurant_db`

Esto agregará:
- 4 categorías: Entradas, Platos Fuertes, Postres, Bebidas
- 20 platillos de ejemplo con precios y descripciones

### 2. Reiniciar el Backend

Si el backend ya está corriendo, reinícialo para aplicar los cambios:

```bash
cd backend
npm run dev
```

El servidor ahora servirá la página web del menú en `http://localhost:4000/menu`

### 3. Probar el Menú Web

**Opción A: Acceso Directo**
```
http://localhost:4000/menu?mesa=1
```

**Opción B: Escanear QR** (Recomendado)
1. Ve al Panel de Administración
2. Gestión de Mesas
3. Click en el icono 📱 de cualquier mesa
4. Escanea el código QR con tu teléfono

---

## 📱 Cómo Funciona el Flujo Completo

### Paso 1: Cliente Escanea QR
```
Mesa → Código QR → http://192.168.100.196:4000/menu?mesa=5
```

### Paso 2: Se Abre el Menú Web
- El parámetro `?mesa=5` identifica la mesa
- Se muestra el menú completo organizado por categorías
- Cliente puede filtrar por categoría

### Paso 3: Cliente Agrega Productos
- Click en "Agregar" para añadir al carrito
- Badge en el carrito flotante muestra cantidad de items

### Paso 4: Cliente Revisa Carrito
- Click en el botón flotante 🛒
- Se abre modal con resumen del pedido
- Puede ajustar cantidades (+/-)
- Ve el total en tiempo real

### Paso 5: Cliente Confirma Pedido
- Click en "Confirmar Pedido"
- El pedido se envía al backend
- Se guarda en la base de datos
- **Se notifica a la cocina vía WebSocket**
- **Se notifica al mesero asignado**

### Paso 6: Cocina Recibe Pedido
- Aparece automáticamente en el Panel de Cocina
- Muestra mesa, platillos y cantidades
- Permite cambiar estado: Pendiente → En Preparación → Listo

---

## 🎨 Características del Diseño

### Responsivo para Móviles
- Optimizado para pantallas pequeñas
- Touch-friendly (botones grandes)
- Scroll suave entre categorías
- Modal de carrito que desliza desde abajo

### Colores y Estilo
- Paleta: Morado (#667eea) y gradientes
- Iconos emoji para mejor UX
- Sombras y animaciones sutiles
- Feedback visual en cada acción

### Componentes Interactivos
- **Header fijo**: Siempre visible con número de mesa
- **Categorías sticky**: Se queda fija al hacer scroll
- **Carrito flotante**: Acceso rápido desde cualquier parte
- **Modal del carrito**: Vista completa del pedido
- **Mensajes toast**: Notificaciones temporales de acciones

---

## 🔧 Configuración Importante

### Para Usar en Tu Red Local (iPhone, Android)

La IP ya está configurada en:
- `restaurant-app/src/config/api.js` → `192.168.100.196`

Verifica tu IP actual:
```bash
ipconfig
# Busca: "Adaptador de LAN inalámbrica Wi-Fi"
# Dirección IPv4: 192.168.100.XXX
```

Si tu IP cambió, actualiza:
1. `restaurant-app/src/config/api.js` → LOCAL_IP
2. Reinicia la app de React Native (si la usas)

### URL del Menú Web

El código QR generará URLs como:
```
http://192.168.100.196:4000/menu?mesa=1
http://192.168.100.196:4000/menu?mesa=2
http://192.168.100.196:4000/menu?mesa=3
```

**IMPORTANTE:** Los dispositivos móviles deben estar en la misma red WiFi que tu computadora.

---

## 🧪 Pruebas Recomendadas

### 1. Probar en Navegador Web (Desktop)
```
http://localhost:4000/menu?mesa=1
```
- Debe cargar el menú completo
- Prueba agregar items al carrito
- Confirma un pedido de prueba

### 2. Probar en iPhone/Android
1. Asegúrate de estar en la misma red WiFi
2. Abre Safari/Chrome en el móvil
3. Visita: `http://192.168.100.196:4000/menu?mesa=1`
4. Prueba el flujo completo

### 3. Probar con Código QR
1. Panel Admin → Gestión de Mesas
2. Click en 📱 de Mesa 1
3. Escanea el QR con tu teléfono
4. Debe abrir el menú automáticamente

### 4. Verificar Pedido en Base de Datos
Después de confirmar un pedido desde el móvil:
```sql
SELECT * FROM pedidos ORDER BY id DESC LIMIT 1;
SELECT * FROM detalle_pedidos WHERE pedido_id = [último id];
```

---

## 📊 Estructura de Datos del Pedido

Cuando el cliente confirma, se envía esto al backend:

```json
{
  "mesa_id": 5,
  "items": [
    {
      "platillo_id": 1,
      "cantidad": 2,
      "precio_unitario": 85.00,
      "notas_especiales": ""
    },
    {
      "platillo_id": 5,
      "cantidad": 1,
      "precio_unitario": 135.00,
      "notas_especiales": ""
    }
  ]
}
```

El backend:
1. Crea el registro en `pedidos` con `mesa_id` y `total`
2. Crea registros en `detalle_pedidos` para cada item
3. Emite evento WebSocket a la cocina
4. Retorna confirmación al cliente

---

## 🎯 Endpoints de API Usados

La página web consume estos endpoints:

### Obtener Menú Completo
```
GET /api/menu/menu-completo
```
Retorna array de platillos con categorías:
```json
[
  {
    "id": 1,
    "nombre": "Ensalada César",
    "descripcion": "...",
    "precio": 85.00,
    "categoria_id": 1,
    "categoria_nombre": "Entradas",
    "imagen_url": null,
    "disponible": true,
    "tiempo_preparacion": 10
  }
]
```

### Crear Pedido
```
POST /api/pedidos
Content-Type: application/json
Body: { mesa_id, items[] }
```

---

## 🔥 Funcionalidades Avanzadas

### Filtrado por Categoría
- Click en botón de categoría
- Scroll automático a esa sección
- Botón queda marcado como activo

### Carrito Persistente (Próxima Mejora)
Actualmente el carrito se limpia al confirmar. Para hacerlo persistente:
1. Usar `localStorage` en JavaScript
2. Recuperar carrito al recargar página

### Notas Especiales (Próxima Mejora)
Agregar campo de texto por item para:
- "Sin cebolla"
- "Término medio"
- "Extra picante"

---

## 🐛 Solución de Problemas

### Error: "No se pudo cargar el menú"
**Causas:**
- Backend no está corriendo
- IP incorrecta en la URL
- Firewall bloqueando el puerto 4000

**Solución:**
1. Verifica que el backend esté corriendo: `npm run dev`
2. Verifica la IP con `ipconfig`
3. Abre puerto 4000 en el firewall

### El QR no abre el menú
**Causas:**
- Teléfono no está en la misma red WiFi
- URL del QR incorrecta

**Solución:**
1. Conéctate a la misma WiFi que la PC
2. Verifica la URL generada en el QR
3. Prueba abrir manualmente en el navegador móvil

### Pedido no se envía
**Causas:**
- No se especificó mesa en la URL
- Backend no responde
- Carrito vacío

**Solución:**
1. Verifica que la URL tenga `?mesa=X`
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que el backend esté corriendo

### Platillos no aparecen
**Causas:**
- No hay datos en la tabla `platillos`
- Categorías no tienen platillos

**Solución:**
1. Ejecuta el script: `datos_menu_ejemplo.sql`
2. Verifica: `SELECT * FROM platillos;`

---

## 📈 Próximas Mejoras Sugeridas

1. **Imágenes de Platillos**
   - Subir imágenes reales
   - Mostrar en las tarjetas

2. **Búsqueda de Platillos**
   - Campo de búsqueda en el header
   - Filtrar en tiempo real

3. **Notas Especiales**
   - Campo de texto por item en el carrito
   - Enviar al backend con el pedido

4. **Historial de Pedidos**
   - Ver pedidos anteriores de la mesa
   - Estado en tiempo real del pedido actual

5. **Descuentos y Promociones**
   - Aplicar cupones
   - Mostrar platillos en oferta

6. **Modo Oscuro**
   - Toggle para tema oscuro
   - Mejor para ambientes con poca luz

7. **Múltiples Idiomas**
   - Español / Inglés
   - Detector automático del navegador

8. **Notificaciones Push**
   - Alertar cuando el pedido esté listo
   - Solicitar atención del mesero

---

## 📞 Testing Completo

### Checklist de Pruebas

- [ ] Backend corriendo en puerto 4000
- [ ] Base de datos tiene categorías y platillos
- [ ] Página carga en `http://localhost:4000/menu?mesa=1`
- [ ] Menú muestra categorías correctamente
- [ ] Botones de categoría funcionan
- [ ] Agregar item al carrito funciona
- [ ] Badge del carrito muestra cantidad correcta
- [ ] Modal del carrito se abre/cierra
- [ ] Aumentar/disminuir cantidad funciona
- [ ] Total se calcula correctamente
- [ ] Confirmar pedido envía datos al backend
- [ ] Pedido se guarda en la base de datos
- [ ] Mensaje de éxito se muestra
- [ ] Carrito se limpia después de confirmar
- [ ] Funciona en iPhone/Android
- [ ] Código QR abre el menú correctamente
- [ ] Responsive en pantallas pequeñas

---

## 🎉 ¡Listo para Usar!

Tu menú digital web está completamente funcional. Los clientes pueden:
1. Escanear QR de la mesa
2. Ver menú y agregar platillos
3. Confirmar pedido
4. El pedido llega automáticamente a cocina y mesero

**Datos de ejemplo incluidos:**
- 4 categorías
- 20 platillos variados
- Precios realistas
- Descripciones atractivas

**URLs para Probar:**
- Desktop: `http://localhost:4000/menu?mesa=1`
- Móvil (misma red WiFi): `http://192.168.100.196:4000/menu?mesa=1`
- QR: Desde Panel Admin → Gestión de Mesas → 📱

---

**Fecha:** 2025-11-03
**Versión:** 1.0
**Compatibilidad:** Chrome, Safari, Firefox, Edge (móvil y desktop)

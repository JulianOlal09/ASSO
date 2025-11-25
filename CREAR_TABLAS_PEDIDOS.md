# ❌ Error: Tablas de Pedidos No Existen

## Problema Detectado

Las tablas **`pedidos`** y **`detalle_pedidos`** no existen en la base de datos, por eso sale el error al intentar crear un pedido.

**Tablas que faltan:**
- ❌ `pedidos`
- ❌ `detalle_pedidos`

**Tablas que SÍ existen:**
- ✅ `usuarios`
- ✅ `categorias`
- ✅ `platillos`
- ✅ `mesas`

---

## ✅ Solución Rápida

### **Opción 1: Ejecutar desde Terminal/CMD**

Abre CMD o PowerShell y ejecuta:

```bash
cd C:\Users\julia\OneDrive\Documentos\ASSO

mysql -u root -padmin restaurant_db < backend/database/crear_tablas_pedidos.sql
```

**Nota:** Reemplaza `admin` con tu contraseña de MySQL si es diferente.

---

### **Opción 2: Desde MySQL Workbench o phpMyAdmin**

1. **Abre MySQL Workbench** o **phpMyAdmin**

2. **Selecciona la base de datos:** `restaurant_db`

3. **Copia y pega este código en una nueva consulta:**

```sql
USE restaurant_db;

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mesa_id INT NOT NULL,
    mesero_id INT,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10, 2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT,
    FOREIGN KEY (mesero_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalle de Pedidos
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    platillo_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notas_especiales TEXT,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índices
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX idx_detalle_pedido ON detalle_pedidos(pedido_id);

-- Verificar
SHOW TABLES;
```

4. **Ejecuta la consulta** (botón ⚡ o F5)

5. **Verifica que aparezcan las tablas:**
   - ✅ pedidos
   - ✅ detalle_pedidos

---

## 🧪 Verificar que se Crearon Correctamente

### **Opción 1: Ejecutar script de verificación**

```bash
cd C:\Users\julia\OneDrive\Documentos\ASSO\backend

node verificar-tablas.js
```

**Deberías ver:**
```
✅ pedidos - EXISTE
✅ detalle_pedidos - EXISTE
✅ TODAS LAS TABLAS EXISTEN!
```

---

### **Opción 2: Verificar en MySQL**

```sql
USE restaurant_db;

-- Ver todas las tablas
SHOW TABLES;

-- Ver estructura de pedidos
DESCRIBE pedidos;

-- Ver estructura de detalle_pedidos
DESCRIBE detalle_pedidos;
```

---

## 🔄 Después de Crear las Tablas

1. **Reinicia el backend** (si ya estaba corriendo):
   ```bash
   cd backend
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

2. **Prueba hacer un pedido desde el menú web:**
   ```
   http://localhost:4000/menu?mesa=1
   ```

3. **Deberías ver:**
   - ✅ "¡Pedido enviado a cocina!"
   - ✅ Sin errores
   - ✅ Pedido guardado en la base de datos

---

## 📊 Verificar Pedido en Base de Datos

Después de hacer un pedido exitoso:

```sql
-- Ver pedidos
SELECT * FROM pedidos;

-- Ver detalle de pedidos
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
ORDER BY p.id DESC;
```

---

## 🐛 Si Aún Hay Errores

### **Error: "Access denied"**
Verifica tu contraseña de MySQL. La contraseña por defecto es `admin` pero puede ser diferente en tu sistema.

```bash
mysql -u root -p restaurant_db
# Te pedirá la contraseña
```

### **Error: "Table already exists"**
Esto significa que las tablas ya se crearon correctamente. Verifica con:
```sql
SHOW TABLES;
```

### **Error: "Cannot add foreign key constraint"**
Esto significa que faltan las tablas relacionadas (mesas, usuarios, platillos). Ejecuta el script completo:
```bash
mysql -u root -padmin restaurant_db < backend/database/crear_tablas_completas.sql
```

---

## 📝 Comandos Rápidos de Referencia

```bash
# Verificar tablas
cd backend
node verificar-tablas.js

# Crear tablas de pedidos
mysql -u root -padmin restaurant_db < backend/database/crear_tablas_pedidos.sql

# Crear TODAS las tablas
mysql -u root -padmin restaurant_db < backend/database/crear_tablas_completas.sql

# Insertar datos de ejemplo
mysql -u root -padmin restaurant_db < backend/database/datos_menu_ejemplo.sql

# Verificar datos
mysql -u root -padmin -e "USE restaurant_db; SHOW TABLES;"
```

---

## ✅ Checklist

Antes de probar el sistema:

- [ ] Tablas `pedidos` y `detalle_pedidos` creadas
- [ ] Script de verificación muestra: "TODAS LAS TABLAS EXISTEN!"
- [ ] Backend reiniciado
- [ ] Categorías y platillos en la base de datos
- [ ] Al menos una mesa creada

Después de esto, el sistema debería funcionar completamente.

---

**Fecha:** 2025-11-04
**Problema:** Tablas de pedidos faltantes
**Solución:** Ejecutar `crear_tablas_pedidos.sql`

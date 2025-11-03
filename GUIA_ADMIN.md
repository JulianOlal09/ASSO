# Guía de Uso - Panel de Administración

## Acceso al Panel de Administración

### 1. Iniciar la Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd restaurant-app
npm start
```

### 2. Crear Usuario Administrador

Si aún no tienes un usuario administrador, créalo con este comando:

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

### 3. Iniciar Sesión

1. Abre la aplicación en tu navegador o dispositivo
2. En la pantalla de Login, ingresa:
   - **Email:** admin@restaurant.com
   - **Password:** admin123
3. Presiona "Iniciar Sesión"

## Navegación del Panel

Al iniciar sesión como administrador, verás el **Panel de Administración** con:

### 📊 Estadísticas en Tiempo Real

En la parte superior encontrarás 4 tarjetas con información clave:

1. **Ventas Totales** - Total de ventas del día y número de pedidos
2. **Promedio por Pedido** - Ticket promedio
3. **Mesas Ocupadas** - Estado de ocupación del restaurante
4. **Tiempo Prep. Promedio** - Tiempo promedio de preparación de pedidos

### 🛠️ Menú de Gestión

#### 👥 Gestión de Usuarios

**¿Cómo acceder?**
- Desde el Dashboard, toca "Gestión de Usuarios"

**Funcionalidades:**

##### Crear Nuevo Usuario
1. Presiona el botón **"+ Nuevo"** en la esquina superior derecha
2. Completa los datos:
   - **Nombre:** Nombre completo del empleado
   - **Email:** Email único para login
   - **Contraseña:** Contraseña inicial
   - **Rol:** Selecciona entre:
     - 👑 **Administrador:** Acceso completo al sistema
     - 👨‍🍳 **Cocina:** Solo panel de cocina
     - 🧑‍💼 **Mesero:** Gestión de mesas y pedidos
3. Presiona **"Guardar"**

##### Editar Usuario Existente
1. En la lista de usuarios, presiona el ícono **✏️** (lápiz)
2. Modifica los datos necesarios:
   - Nombre
   - Email
   - Rol
   - Estado (Activo/Inactivo)
3. **Nota:** No puedes cambiar la contraseña desde aquí
4. Presiona **"Guardar"**

##### Desactivar Usuario
1. Presiona el ícono **🗑️** (papelera)
2. Confirma la acción
3. El usuario quedará inactivo (no se elimina, se puede reactivar)

#### 🍽️ Gestión de Menú
*Próximamente disponible*
- Crear/Editar categorías
- Agregar/Modificar platillos
- Establecer precios
- Activar/Desactivar platillos

#### 🪑 Gestión de Mesas
*Próximamente disponible*
- Crear nuevas mesas
- Generar códigos QR
- Cambiar estados de mesas
- Ver pedidos por mesa

#### 📋 Pedidos
*Próximamente disponible*
- Ver historial de pedidos
- Filtrar por estado
- Exportar reportes

### 📈 Reportes

#### 💰 Reporte de Ventas
*Próximamente disponible*
- Ventas por día/semana/mes
- Gráficos de tendencias
- Comparativas

#### ⭐ Platillos Más Vendidos
*Próximamente disponible*
- Top 10 platillos
- Ingresos por platillo
- Análisis de popularidad

## Consejos de Uso

### Para una Configuración Inicial

1. **Primero:** Crea usuarios para tu equipo
   - Al menos 1 usuario de cocina
   - Al menos 1 mesero
   - Los administradores adicionales que necesites

2. **Segundo:** Configura el menú (cuando esté disponible)
   - Crea categorías
   - Agrega platillos con precios
   - Sube imágenes de los platillos

3. **Tercero:** Configura las mesas
   - Crea las mesas de tu restaurante
   - Genera códigos QR
   - Imprime y coloca los QR en cada mesa

### Gestión Diaria

**Por la mañana:**
1. Revisa las estadísticas del día anterior
2. Verifica que todos los usuarios estén activos
3. Actualiza disponibilidad de platillos si es necesario

**Durante el servicio:**
1. Monitorea las estadísticas en tiempo real
2. Verifica el tiempo promedio de preparación
3. Revisa la ocupación de mesas

**Al final del día:**
1. Revisa el reporte de ventas
2. Verifica los platillos más vendidos
3. Actualiza inventario si es necesario

## Shortcuts y Atajos

### Navegación Rápida
- **Volver:** Usa el botón "← Volver" en cualquier pantalla
- **Actualizar:** Desliza hacia abajo (pull to refresh) en cualquier lista
- **Cerrar Sesión:** Botón "Salir" en la esquina superior derecha

### Búsqueda y Filtros
- En listas largas, busca por nombre o email
- Usa los filtros para encontrar usuarios por rol o estado

## Solución de Problemas Comunes

### No puedo crear usuarios
**Problema:** Error al crear usuario
**Solución:**
- Verifica que el email no esté ya registrado
- Asegúrate de llenar todos los campos requeridos
- La contraseña debe tener al menos 6 caracteres

### Las estadísticas no se actualizan
**Problema:** Los números no cambian
**Solución:**
- Desliza hacia abajo para refrescar
- Verifica que el backend esté corriendo
- Revisa la consola del backend por errores

### No veo la opción de "Gestión de Usuarios"
**Problema:** El menú no aparece
**Solución:**
- Verifica que hayas iniciado sesión como administrador
- Cierra sesión y vuelve a entrar
- Revisa que tu usuario tenga rol "administrador"

## Seguridad y Mejores Prácticas

### Contraseñas
- Usa contraseñas seguras para administradores
- Cambia las contraseñas por defecto inmediatamente
- No compartas credenciales de administrador

### Gestión de Usuarios
- Desactiva usuarios que ya no trabajen en el restaurante
- Revisa periódicamente la lista de usuarios activos
- Asigna roles apropiados según las responsabilidades

### Respaldos
- Haz respaldos regulares de la base de datos
- Guarda una copia de los códigos QR de las mesas
- Documenta cambios importantes en la configuración

## Atajos de Teclado (Web)

Cuando uses la app en navegador web:

- **Ctrl/Cmd + R:** Recargar página
- **F5:** Actualizar
- **Esc:** Cerrar modales

## Próximas Funcionalidades

Pronto estarán disponibles:

- ✅ Gestión completa de menú con imágenes
- ✅ Generación masiva de QR para mesas
- ✅ Reportes exportables (PDF/Excel)
- ✅ Gráficos interactivos
- ✅ Panel de meseros completo
- ✅ Notificaciones push
- ✅ Sistema de reservas
- ✅ Integración con pagos

## Soporte

Si encuentras problemas:

1. Revisa los logs del backend en la terminal
2. Verifica la consola del navegador (F12)
3. Consulta la documentación en README.md
4. Revisa INSTALACION.md si hay problemas de configuración

---

**¡Listo para usar!** El panel de administración te permite gestionar tu restaurante de forma eficiente. Comienza creando usuarios para tu equipo.

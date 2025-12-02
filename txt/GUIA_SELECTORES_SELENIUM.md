# 🎯 Guía de Selectores Estables para Selenium IDE

## ✅ Resumen de Cambios

He agregado atributos `testID` a todos los elementos interactivos en:
- **AdminDashboardScreen.js**: Botones, tarjetas de estadísticas, y opciones de menú
- **MeseroDashboardScreen.js**: Botones, tarjetas, mesas, pedidos, y acciones

Los `testID` en React Native Web se convierten automáticamente a `data-testid` en HTML, lo que los hace perfectos para Selenium.

---

## 📋 Selectores Agregados

### LoginScreen

| Elemento | testID (data-testid) | Uso |
|----------|----------------------|-----|
| ScrollView | `login-scrollview` | Contenedor principal |
| Input Email | `login-email-input` | Campo de email |
| Input Password | `login-password-input` | Campo de contraseña |
| Botón Iniciar Sesión | `login-submit-button` | Botón de login |
| Indicador de Carga | `login-loading-indicator` | Spinner mientras carga |
| Container de Error | `login-error-container` | Mensaje de error (visible solo si hay error) |
| Texto de Error | `login-error-text` | Texto del mensaje de error |

### AdminDashboardScreen

| Elemento | testID (data-testid) | Uso |
|----------|----------------------|-----|
| Botón Logout | `admin-logout-button` | Cerrar sesión del admin |
| ScrollView | `admin-dashboard-scrollview` | Contenedor principal |
| Ventas Totales | `stat-card-ventas-totales` | Tarjeta de estadística |
| Promedio por Pedido | `stat-card-promedio-pedido` | Tarjeta de estadística |
| Mesas Ocupadas | `stat-card-mesas-ocupadas` | Tarjeta de estadística |
| Tiempo Preparación | `stat-card-tiempo-preparacion` | Tarjeta de estadística |
| Gestión de Usuarios | `menu-item-gestion-usuarios` | Opción de menú |
| Gestión de Menú | `menu-item-gestion-menu` | Opción de menú |
| Gestión de Mesas | `menu-item-gestion-mesas` | Opción de menú |
| Reporte de Ventas | `menu-item-reporte-ventas` | Opción de menú |
| Platillos Más Vendidos | `menu-item-reporte-platillos` | Opción de menú |

### MeseroDashboardScreen

| Elemento | testID (data-testid) | Uso |
|----------|----------------------|-----|
| Botón Logout | `mesero-logout-button` | Cerrar sesión del mesero |
| ScrollView | `mesero-dashboard-scrollview` | Contenedor principal |
| Total Mesas | `stat-card-total-mesas` | Tarjeta de estadística |
| Mesas Ocupadas | `stat-card-mesas-ocupadas` | Tarjeta de estadística |
| Pedidos Activos | `stat-card-pedidos-activos` | Tarjeta de estadística |
| Crear Pedido Manual | `action-button-crear-pedido` | Botón de acción rápida |
| Tarjeta de Mesa | `mesa-card-{numero}` | Ej: `mesa-card-1`, `mesa-card-2` |
| Touch en Mesa | `mesa-card-touchable-{numero}` | Para cambiar estado (long press) |
| Botón Liberar Mesa | `btn-liberar-mesa-{numero}` | Ej: `btn-liberar-mesa-1` |
| Botón Ver Detalle | `btn-ver-detalle-mesa-{numero}` | Ej: `btn-ver-detalle-mesa-1` |
| Container de Pedido | `pedido-container-mesa-{numero}` | Información del pedido |
| Título de Pedido | `pedido-title-{id}` | Ej: `pedido-title-123` |

---

## 🔧 Cómo Usar en Selenium IDE

### 1. CSS Selector con data-testid (RECOMENDADO)

```css
/* Campos de login */
[data-testid="login-email-input"]
[data-testid="login-password-input"]
[data-testid="login-submit-button"]

/* Botón de logout del admin */
[data-testid="admin-logout-button"]

/* Tarjeta de ventas totales */
[data-testid="stat-card-ventas-totales"]

/* Botón de crear pedido */
[data-testid="action-button-crear-pedido"]

/* Mesa específica (número 5) */
[data-testid="mesa-card-5"]

/* Botón liberar mesa 3 */
[data-testid="btn-liberar-mesa-3"]
```

### 2. XPath con data-testid

```xpath
/* Campos de login */
//*[@data-testid="login-email-input"]
//*[@data-testid="login-password-input"]
//*[@data-testid="login-submit-button"]

/* Botón de logout del mesero */
//*[@data-testid="mesero-logout-button"]

/* Opción de gestión de usuarios */
//*[@data-testid="menu-item-gestion-usuarios"]

/* Ver detalle de mesa 2 */
//*[@data-testid="btn-ver-detalle-mesa-2"]

/* Pedido activo en mesa 4 */
//*[@data-testid="pedido-container-mesa-4"]
```

### 3. XPath Robusto con Texto (alternativo)

```xpath
/* Botón por texto visible */
//button[contains(text(), "Salir")]

/* Opción de menú con texto e icono */
//*[contains(@data-testid, "menu-item") and contains(., "Gestión de Usuarios")]

/* Mesa con número específico */
//*[@data-testid="mesa-card-5"]//text()[contains(., "Mesa 5")]
```

---

## ❌ Selectores INESTABLES a EVITAR

### NO uses estos selectores:

```css
/* ❌ Clases generadas automáticamente por React Native Web */
.r-borderColor-1awozwy
.r-fontSize-1i10wst
.css-175oi2r

/* ❌ XPath con posición numérica */
//div[3]/button[2]
//div[@class="css-175oi2r"]/div[1]

/* ❌ XPath con valores vacíos */
//input[@value='']
//button[@text='']

/* ❌ Selectores basados en estructura DOM */
div > div > div > button
#root > div:nth-child(2) > div:nth-child(3)
```

### ✅ En su lugar, usa:

```css
/* ✅ data-testid es estable */
[data-testid="admin-logout-button"]

/* ✅ XPath con data-testid */
//*[@data-testid="mesa-card-1"]

/* ✅ Combinación de data-testid + texto para validación */
//*[@data-testid="stat-card-ventas-totales" and contains(., "Ventas Totales")]
```

---

## 📝 Ejemplos Completos de Pruebas

### Caso 1: Login como Admin

```
Command: open
Target: http://localhost:8081

Command: type
Target: css=[data-testid="login-email-input"]
Value: admin@restaurante.com

Command: type
Target: css=[data-testid="login-password-input"]
Value: password123

Command: click
Target: css=[data-testid="login-submit-button"]

Command: waitForElementPresent
Target: css=[data-testid="admin-logout-button"]
Value: 5000

Command: assertElementPresent
Target: css=[data-testid="admin-dashboard-scrollview"]
```

### Caso 1b: Validar Error de Login

```
Command: open
Target: http://localhost:8081

Command: type
Target: css=[data-testid="login-email-input"]
Value: usuario@invalido.com

Command: type
Target: css=[data-testid="login-password-input"]
Value: wrongpassword

Command: click
Target: css=[data-testid="login-submit-button"]

Command: waitForElementPresent
Target: css=[data-testid="login-error-container"]
Value: 3000

Command: assertText
Target: css=[data-testid="login-error-text"]
Value: *Credenciales inválidas*
```

### Caso 1c: Logout como Admin

```
Command: click
Target: css=[data-testid="admin-logout-button"]

Command: waitForElementPresent
Target: css=[data-testid="login-submit-button"]
Value: 3000
```

### Caso 2: Navegar a Gestión de Usuarios

```
Command: click
Target: css=[data-testid="menu-item-gestion-usuarios"]

Command: waitForElementVisible
Target: css=[data-testid="admin-dashboard-scrollview"]
```

### Caso 3: Verificar Estadísticas

```
Command: assertElementPresent
Target: css=[data-testid="stat-card-ventas-totales"]

Command: storeText
Target: css=[data-testid="stat-card-ventas-totales"]
Value: ventasTotales
```

### Caso 4: Crear Pedido Manual (Mesero)

```
Command: click
Target: css=[data-testid="action-button-crear-pedido"]

Command: waitForElementVisible
Target: xpath=//*[contains(text(), "Crear Pedido")]
```

### Caso 5: Liberar Mesa Específica

```
Command: click
Target: css=[data-testid="btn-liberar-mesa-3"]

Command: waitForElementNotPresent
Target: css=[data-testid="pedido-container-mesa-3"]
```

### Caso 6: Verificar Detalles de Pedido en Mesa

```
Command: assertElementPresent
Target: css=[data-testid="pedido-container-mesa-5"]

Command: assertText
Target: css=[data-testid="pedido-title-123"]
Value: *Pedido #123*
```

---

## 🎨 Ventajas de usar data-testid

✅ **Estable**: No cambia con actualizaciones de estilos
✅ **Único**: Cada elemento tiene un identificador único
✅ **Semántico**: Los nombres describen la función del elemento
✅ **Mantenible**: Fácil de actualizar si cambia la estructura
✅ **Rápido**: Selectores más eficientes que XPath complejos
✅ **Compatible**: Funciona en todos los navegadores

---

## 🔍 Tips Adicionales

### 1. Inspeccionar elementos en el navegador

```javascript
// En la consola del navegador, busca elementos por data-testid
document.querySelector('[data-testid="admin-logout-button"]')
```

### 2. Verificar que los testID se renderizaron correctamente

```javascript
// Lista todos los elementos con data-testid
document.querySelectorAll('[data-testid]')
```

### 3. Para elementos dinámicos (listas de mesas)

```css
/* Selecciona TODAS las tarjetas de mesa */
[data-testid^="mesa-card-"]

/* Selecciona TODOS los botones de liberar */
[data-testid^="btn-liberar-mesa-"]
```

### 4. Combinar con wait commands

```
Command: waitForElementPresent
Target: css=[data-testid="mesa-card-5"]
Value: 5000

Command: click
Target: css=[data-testid="btn-ver-detalle-mesa-5"]
```

---

## 📌 Patrón de Nombres

Los `testID` siguen este patrón:

- **Login**: `login-{elemento}-{tipo}`
  - Ejemplo: `login-email-input`, `login-password-input`, `login-submit-button`, `login-error-container`

- **Botones generales**: `{rol}-{accion}-button`
  - Ejemplo: `admin-logout-button`, `mesero-logout-button`

- **Tarjetas de estadísticas**: `stat-card-{descripcion}`
  - Ejemplo: `stat-card-ventas-totales`, `stat-card-pedidos-activos`

- **Opciones de menú**: `menu-item-{nombre}`
  - Ejemplo: `menu-item-gestion-usuarios`, `menu-item-reporte-ventas`

- **Acciones rápidas**: `action-button-{accion}`
  - Ejemplo: `action-button-crear-pedido`

- **Elementos de mesa**: `{tipo}-mesa-{numero}`
  - Ejemplo: `mesa-card-3`, `btn-liberar-mesa-5`, `btn-ver-detalle-mesa-2`

- **Elementos de pedido**: `{tipo}-{id/referencia}`
  - Ejemplo: `pedido-container-mesa-1`, `pedido-title-123`

---

## ⚠️ IMPORTANTE: Buenas Prácticas

1. **Siempre prefiere `data-testid` sobre clases CSS**
2. **No uses selectores que dependen de la posición (nth-child, índices)**
3. **Evita selectores basados en estilos dinámicos**
4. **Usa `waitForElementPresent` antes de interactuar con elementos**
5. **Combina selectores con aserciones de texto para validación adicional**
6. **Mantén los nombres de testID descriptivos y consistentes**

---

## 🚀 Siguiente Paso

Abre tu aplicación en el navegador, inspecciona los elementos y verifica que los atributos `data-testid` estén presentes. Luego, actualiza tus pruebas de Selenium IDE usando los selectores de esta guía.

¡Tus pruebas ahora serán mucho más estables y mantenibles!

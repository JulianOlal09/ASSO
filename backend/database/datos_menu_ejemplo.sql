-- Datos de ejemplo para el menú del restaurante
-- Ejecutar después de crear las tablas

USE restaurant_db;

-- Insertar categorías si no existen
INSERT IGNORE INTO categorias (id, nombre, descripcion, orden, activo) VALUES
(1, 'Entradas', 'Deliciosas entradas para comenzar', 1, TRUE),
(2, 'Platos Fuertes', 'Nuestros platillos principales', 2, TRUE),
(3, 'Postres', 'Dulces delicias para terminar', 3, TRUE),
(4, 'Bebidas', 'Bebidas refrescantes y calientes', 4, TRUE);

-- Insertar platillos de ejemplo
INSERT INTO platillos (nombre, descripcion, precio, categoria_id, disponible, tiempo_preparacion) VALUES
-- ENTRADAS
('Ensalada César', 'Lechuga romana, crutones, queso parmesano y aderezo césar', 85.00, 1, TRUE, 10),
('Nachos Supreme', 'Totopos con queso, frijoles, guacamole, crema y jalapeños', 95.00, 1, TRUE, 12),
('Dedos de Queso', '6 piezas de queso mozzarella empanizado con salsa marinara', 75.00, 1, TRUE, 15),
('Alitas BBQ', '8 piezas de alitas de pollo con salsa BBQ', 110.00, 1, TRUE, 20),

-- PLATOS FUERTES
('Hamburguesa Clásica', 'Carne de res, lechuga, tomate, cebolla y papas fritas', 135.00, 2, TRUE, 20),
('Pizza Margarita', 'Salsa de tomate, mozzarella y albahaca fresca', 145.00, 2, TRUE, 25),
('Tacos al Pastor', '3 tacos con carne al pastor, piña, cilantro y cebolla', 95.00, 2, TRUE, 15),
('Pasta Alfredo', 'Fettuccine en salsa alfredo con pollo y champiñones', 155.00, 2, TRUE, 18),
('Filete de Pescado', 'Filete empanizado con arroz y ensalada', 175.00, 2, TRUE, 22),
('Costillas BBQ', 'Costillas de cerdo bañadas en salsa BBQ con papas', 195.00, 2, TRUE, 30),

-- POSTRES
('Pastel de Chocolate', 'Delicioso pastel de chocolate con helado de vainilla', 65.00, 3, TRUE, 5),
('Flan Napolitano', 'Tradicional flan casero', 55.00, 3, TRUE, 5),
('Brownie con Helado', 'Brownie caliente con helado y salsa de chocolate', 75.00, 3, TRUE, 8),
('Cheesecake', 'Pastel de queso estilo New York', 70.00, 3, TRUE, 5),

-- BEBIDAS
('Coca Cola', 'Refresco 355ml', 25.00, 4, TRUE, 2),
('Agua Natural', 'Botella de agua 500ml', 20.00, 4, TRUE, 1),
('Limonada Natural', 'Limonada fresca preparada', 35.00, 4, TRUE, 5),
('Café Americano', 'Café recién preparado', 30.00, 4, TRUE, 5),
('Jugo de Naranja', 'Jugo natural de naranja', 40.00, 4, TRUE, 5),
('Cerveza', 'Cerveza nacional 355ml', 45.00, 4, TRUE, 2);

-- Verificar datos insertados
SELECT 'Categorías insertadas:' as Info;
SELECT * FROM categorias;

SELECT 'Platillos insertados:' as Info;
SELECT p.nombre, p.precio, c.nombre as categoria, p.disponible
FROM platillos p
JOIN categorias c ON p.categoria_id = c.id
ORDER BY c.orden, p.nombre;

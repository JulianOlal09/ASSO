-- Migración: Agregar mesero_id a tabla mesas
-- Fecha: 2025-11-03
-- Descripción: Permite asignar meseros a mesas específicas

USE restaurant_db;

-- Agregar columna mesero_id a la tabla mesas
ALTER TABLE mesas
ADD COLUMN mesero_id INT AFTER capacidad,
ADD FOREIGN KEY (mesero_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Verificar el cambio
DESCRIBE mesas;

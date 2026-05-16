-- Optimización de la tabla de pagos para soporte de filtrado mensual y cobros masivos
-- Fecha: 2026-05-16

USE osos_db;

-- 1. Asegurar que la columna category_id existe en payments para reportes por categoría
ALTER TABLE payments ADD COLUMN IF NOT EXISTS category_id INT AFTER user_id;

-- 2. Agregar índice en due_date para acelerar el filtrado por Mes/Año
ALTER TABLE payments ADD INDEX IF NOT EXISTS idx_payments_due_date (due_date);

-- 3. Agregar índice en status para acelerar la detección de Morosos
ALTER TABLE payments ADD INDEX IF NOT EXISTS idx_payments_status (status);

-- 4. Asegurar que category_id es una llave foránea válida
-- Nota: Si falla es porque ya existe o los datos no coinciden, pero es buena práctica
-- ALTER TABLE payments ADD CONSTRAINT fk_payments_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

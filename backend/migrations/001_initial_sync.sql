-- Migración 001: Sincronización de Estatus y Columnas Críticas

-- 1. Estatus de Pagos (Incluir 'validating')
ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'late', 'partially_paid', 'validating') DEFAULT 'pending';

-- 2. Columnas para Bajas en Jugadores (si faltan)
ALTER TABLE players ADD COLUMN IF NOT EXISTS deactivation_reason VARCHAR(255) DEFAULT NULL AFTER status;
ALTER TABLE players MODIFY COLUMN status ENUM('active', 'inactive', 'baja') DEFAULT 'active';

-- 3. Columnas para Estadísticas Desglosadas
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS td_offense INT DEFAULT 0 AFTER touchdowns;
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS td_defense INT DEFAULT 0 AFTER td_offense;
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS is_mvp TINYINT(1) DEFAULT 0 AFTER points_extra;

-- 4. Seguridad de Usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER role;

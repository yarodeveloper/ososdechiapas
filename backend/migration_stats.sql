USE osos_db;

-- 1. Gestión de Ligas
CREATE TABLE IF NOT EXISTS leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    season_year YEAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Actualizar Categorías para ligarlas a una Liga
ALTER TABLE categories ADD COLUMN IF NOT EXISTS league_id INT AFTER id;

-- Asegurar que la categoría tenga una clave foránea si no existe
-- (Solo se ejecuta si la columna fue agregada recientemente o no tiene la constraint)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'categories' AND index_name = 'league_id' AND table_schema = 'osos_db');
SET @sqlstmt := IF(@exist <= 0, 'ALTER TABLE categories ADD FOREIGN KEY (league_id) REFERENCES leagues(id)', 'SELECT "Constraint ya existe"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- 3. Registro de Desempeño por Partido (Estadísticas Reales)
CREATE TABLE IF NOT EXISTS player_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    match_id INT NOT NULL,
    touchdowns INT DEFAULT 0,
    yards_rushing INT DEFAULT 0,
    yards_passing INT DEFAULT 0,
    yards_receiving INT DEFAULT 0,
    tackles INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    sacks INT DEFAULT 0,
    is_mvp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (match_id) REFERENCES matches(id),
    UNIQUE KEY unique_player_match (player_id, match_id)
);

-- 4. Semilla de datos inicial (Ligas)
INSERT IGNORE INTO leagues (name, season_year, is_active) VALUES 
('Liga ACHFA', 2026, 1),
('Liga OFACH', 2026, 1),
('Circuito de Amistad', 2026, 1);

-- Asignar las categorías existentes a la primera liga por defecto
UPDATE categories SET league_id = 1 WHERE league_id IS NULL;

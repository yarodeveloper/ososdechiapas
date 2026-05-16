-- Script para habilitar múltiples posiciones
-- Paso 1: Crear tabla de relación
CREATE TABLE IF NOT EXISTS player_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    position_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES catalogs_positions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_pos (player_id, position_id)
);

-- Paso 2: (Opcional) Migrar la posición actual si existe
-- INSERT IGNORE INTO player_positions (player_id, position_id, is_primary)
-- SELECT id, position_id, TRUE FROM players WHERE position_id IS NOT NULL;
